'use strict';

var gpool        = require('generic-pool'),
    mysql        = require('mysql'),
    kafka_config = require('../config/kafka'),
    User         = require('./models')
;

var kafkaPool = gpool.Pool({
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

kafkaPool.drain(function() {
    kafkaPool.destroyAllNow();
});

// var mysqlPool = gpool.Pool({
//     name     : 'kafka',
//     create   : function(callback) {
//         let host = process.env.MYSQL_PORT_3306_TCP_ADDR;
//         let port = process.env.MYSQL_PORT_3306_TCP_PORT;
        
//         let connection = mysql.createConnection({
//             host: host,
//             port: port,
//             user: 'root',
//             password: 'alpine'
//         });

//         connection.connect((err)=> {
//             if (err) {
//                 console.error('error connecting: ' + err.stack);
//                 callback(err);
//                 return;
//             }
//             callback(null, connection);
//         });
//     },
//     destroy  : function(client) { 
//         client.end();
//     },
//     max      : 10,
//     min      : 1, 
//     idleTimeoutMillis : 30000,
//     log : false 
// });

// mysqlPool.drain(function() {
//     mysqlPool.destroyAllNow();
// });

class UserAccountStore {

    constructor() {
        
    }

    init() {
        return new Promise(function (accept, reject) {
            var client
            mysqlPool.acquire((err, c) => {
                if (err) {
                    reject(err);
                }
                else {
                    this.client = c;
                    accept();
                }
            });
        }.bind(this));
    }

    destroy() {
        mysqlPool.release(this.client);
    }



}

module.exports = UserAccountStore;
