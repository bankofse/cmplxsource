"use strict";

var kafka_config = require('../config/kafka'),
    kafka        = require('kafka-node'),
    models       = require('./models'),
    memory       = require('sails-memory'),
    spawn        = require('../utils/spawn'),
    bcrypt       = require('bcrypt'),
    Producer     = kafka.Producer,
    Client       = kafka.Client,
    Consumer     = kafka.Consumer
;

class UserAccountStore {

    constructor () {

        console.log("==== Setting Up UserAccountStore ====");

        spawn(function* () {
            let host  = yield kafka_config.zk();
            let port  = yield kafka_config.port();
            console.log("Zookeeper discovered at " + host + ":" + port);
            this.topic = yield kafka_config.topic();
            let client = new Client(host + ":" + port);
            this.producer = yield this.connectToKafka(client);
            console.log('Kafka set to publish to ' + this.topic);

            console.log('Sending verification payload');
            yield this.sendPayload(JSON.stringify({
                        "version": "v0.1a",
                        "type": "heartbeat"
                    }));

            this.consumer = yield this.connectConsumer(client, this.topic);

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

            return;
        }.bind(this)())
        .then(function (a) {
            console.log("==== Finished Setup ====");
            this.consumer.on('message', this.recievedDataChangeEvent.bind(this));
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

    recievedDataChangeEvent (msg) {
        let message = JSON.parse(msg.value);
        console.log(message);
        switch (message.version) {
            case "v0.1a":
                switch (message.type) {
                    case "creation":
                        this.createAccount(message.payload);
            }
        }
    }

    createAccount (payload) {
        this.models.user.create({
            username: payload.user,
            password: payload.pass    
        })
        .exec((err) => {
            if (err) {
                console.log("account already made");
            } else {
                console.log("account created");
            }
        });
    }

    buildAccountCreationMessage (user, pass) {
        return new Promise ((accept, reject) => {
            bcrypt.hash(pass, 10, function(err, hash) {
                console
                if(err) return reject(err);
                else 
                {
                   accept(JSON.stringify({
                        "version": "v0.1a",
                        "creationDate": (new Date()).toISOString(),
                        "type": "creation",
                        "payload": {
                            "user": user,
                            "pass": hash
                        }
                    }));
                }
            });
        });
    }

    sendPayload (msg) {
        var producer = this.producer;
        var topic = this.topic;
        return new Promise((accept, reject) => {
            producer.send([{
                topic: topic,
                messages: msg
            }], () => {
                accept()
            });
        });
    }

    createAccountRequest (user, pass) {
        // Check validation
        this.buildAccountCreationMessage(user, pass)
        .then(this.sendPayload.bind(this))
        .catch((err) =>{
            console.log("err", err);
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

    connectToKafka (client) {
        return new Promise((accept, reject) => {
            var producer = new Producer(client)
            producer.on('ready', () => {
                accept(producer);    
            });
            producer.on('error', reject);
        });
    }

    connectConsumer (client, topic) {
        return new Promise((accept, reject) => {
            var consumer = new Consumer(client,
                [
                    { topic: topic, partition: 0 }
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
            .then(function (err, user) {
                if (err) {
                    reject(err);
                } if (user) {
                    accept("var-token");
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
