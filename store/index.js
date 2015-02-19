'use strict';

var gpool        = require('generic-pool'),
    kafka_config = require('../config/kafka')
;

class UserAccountStore {

    constructor() {
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

        // I can just store these in memory because the only reason I'd use
        // redis is for a performant K/V store thats accessible by multiple
        // clients. This will only ever be accessed localy by this process
        // and updated by the kafka replication stream. So this is more 
        // performant**
        //
        // **don't quote me just yet, I'll probably end up using memcached
        this.sessionTokens = { };

    }

    checkCachedSession(token, referer) {
        // Yeah you be good
        return (token in this.sessionTokens);
    }

    ask(req) {
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

            // Asset Token Session is Valid, check redis
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



}

module.exports = UserAccountStore;
