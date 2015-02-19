"use strict";

var kafka_config = require('../config/kafka'),
    kafka        = require('kafka-node'),
    models       = require('./models'),
    memory       = require('sails-memory'),
    spawn        = require('../utils/spawn'),
    Producer     = kafka.Producer,
    Client       = kafka.Client,
    Consumer     = kafka.Consumer
;

class UserAccountStore {

    constructor () {

        var that = this; // Sorry can't bind this to a generator
        spawn(function* () {
            let host  = yield kafka_config.zk();
            let port  = yield kafka_config.port();
            that.topic = yield kafka_config.topic();
            that.producer = yield that.connectToKafka(host, port);

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

            that.models = yield that.initModels(config);

            return;
        }())
        .then((a) => {
            console.log("Finished Store Setup");
        })
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

    connectToKafka(host, port) {
        return new Promise((accept, reject) => {
            var producer = new Producer(new Client(host + ":" + port))
            producer.on('ready', () => {
                accept(producer);    
            });
            producer.on('error', reject);
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
