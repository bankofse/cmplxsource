'use strict';

var gpool        = require('generic-pool'),
    kafka_config = require('../config/kafka'),
    models       = require('./models'),
    memory       = require('sails-memory')
;

class UserAccountStore {

    constructor () {
        this.kafkaPool = gpool.Pool({
            name     : 'kafka',
            create   : function(callback) {
                
                callback(null, null);
            },
            destroy  : function(client) { 

            },
            max      : 10,
            min      : 1, 
            idleTimeoutMillis : 30000,
            log : false 
        });

        this.kafkaPool.drain(function() {
            this.kafkaPool.destroyAllNow();
        }.bind(this));

        // Build A Config Object
        var config = {

          // Setup Adapters
          // Creates named adapters that have have been required
          adapters: {
            'default': memory,
             memory: memory
          },

          // Build Connections Config
          // Setup connections using the named adapter configs
          connections: {
            memory: {
              adapter: 'memory'
            }

            // myLocalMySql: {
            //   adapter: 'mysql',
            //   host: 'localhost',
            //   database: 'foobar'
            // }
          },

          defaults: {
            migrate: 'alter'
          }

        };

        models.initialize(config, function (err, models) {
            console.log('Datastore Ready');
            this.models = models.collections;
        }.bind(this));

        // I can just store these in memory because the only reason I'd use
        // redis is for a performant K/V store thats accessible by multiple
        // clients. This will only ever be accessed localy by this process
        // and updated by the kafka replication stream. So this is more 
        // performant**
        //
        // **don't quote me just yet, I'll probably end up using memcached
        this.sessionTokens = { };

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
