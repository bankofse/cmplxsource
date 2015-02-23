"use strict";

var kafka_config = require('../config/kafka'),
    kafka        = require('kafka-node'),
    models       = require('./models'),
    memory       = require('sails-memory'),
    spawn        = require('../utils/spawn'),
    bcrypt       = require('bcrypt'),
    Producer     = kafka.Producer,
    Client       = kafka.Client,
    Consumer     = kafka.Consumer,
    EventConsumer = require('./storeWriter')
;

class UserAccountStore {

    constructor () {

        console.log("==== Setting Up UserAccountStore ====");

        spawn(function* () {
            let host  = yield kafka_config.zk();
            let port  = yield kafka_config.port();
            console.log("Zookeeper discovered at " + host + ":" + port);
            let topic = yield kafka_config.topic();
            let client = new Client(host + ":" + port);
            let producer = yield this.connectToKafka(client, topic);
            console.log('Kafka set to publish to ' + topic);

            let consumer = yield this.connectConsumer(client, topic);

            let config = {
              adapters: {
                'default': memory,
                 memory: memory
              },
              connections: {
                memory: {
                  adapter: 'memory'
                }
              },
              defaults: {
                migrate: 'alter'
              }
            };

            this.models = yield this.initModels(config);
            console.log("Finished models config");

            let eventConsumer = new EventConsumer(producer, consumer, topic, this.models);

            return;
        }.bind(this)())
        .then(function (a) {
            console.log("==== Finished Setup ====");            
        }.bind(this))
        .catch((e) => {
            console.log("ERROR", e)
        });

        // I can just store these in memory because the only reason I'd use
        // redis is for a performant K/V store thats accessible by multiple
        // clients. This will only ever be accessed localy by this process
        // and updated by the kafka replication stream. So this is more 
        // performant**
        //
        // **don't quote me just yet, I'll probably end up using memcached
        this.sessionTokens = { };

    }

    hashPass (pass, done) {
        bcrypt.hash(pass, 10, done);
    }

    createAccountRequest (user, pass) {
        // Check validation
        return this.eventConsumer.buildAccountCreationMessage(user, pass)
                .then(this.eventConsumer.sendPayload.bind(this))
                .then(() => {
                    return new Promise((accept, reject) => {
                        accept("token")
                    });
                });
    }

    initModels (config) {
        return new Promise((accept, reject) => {
            models.initialize(config, function (err, models) {
                if (err) {
                    reject(err);
                    return;
                }
                accept(models.collections);
            });
        });
    }

    connectToKafka (client, topic) {
        return new Promise((accept, reject) => {
            var producer = new Producer(client)
            producer.on('ready', () => {
                console.log("Creating topic if not exists =>", topic);
                producer.createTopics([topic], false, (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        console.log("->",data);
                        accept(producer);
                    }
                });
            });
            producer.on('error', reject);
        });
    }

    connectConsumer (client, topic) {
        return new Promise((accept, reject) => {
            var consumer = new Consumer(client,
                [
                    { 
                        topic: topic,
                        partition: 0
                    }
                ],
                {
                    autoCommit: false
                });
            accept(consumer);
        });
    }

    checkCachedSession (token, referer) {
        // Yeah you be good
        return (token in this.sessionTokens);
    }

    ask (req) {
        return new Promise(function (accept, reject) {
            let headers = req.headers;
            // Assert Token Exists
            if (headers['token'] === undefined) {
                let error = new Error('Token Error');
                error.status = 400;
                error.message = "Token was not found in headers";
                reject(error);
                return;
            }

            // Assert Token Session is Valid
            let token = headers['token'];
            if (this.checkCachedSession(token, null)) {
                accept();
            } else {
                let error = new Error('Token Error');
                error.status = 401;
                error.message = "Token was invalid or origin was incorrect";
                reject(error);
                return;
            }
        }.bind(this));
    }

    auth (user, pass) {
        return new Promise(function (accept, reject) {
            this.models.user.findOne()
            .where({
                username: user
            })
            .then(function (user) {
                if (user) {
                    bcrypt.compare(pass, user.password, (err, res) => {
                        if (err) reject(err);
                        if (res) {
                            accept("New Token");
                        } else {
                            let error = new Error('User Error');
                            error.status = 401;
                            error.message = "Invalid Password";
                            reject(error);
                        }
                    });
                } else {
                    let error = new Error('User Error');
                    error.status = 404;
                    error.message = "User not found in the system";
                    reject(error);
                }
            });
        }.bind(this));
    }

}

module.exports = UserAccountStore;
