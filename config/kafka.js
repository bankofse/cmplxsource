"use strict";
var req = require('request-promise'),
    dns = require('dns')
;

const server_url = '104.131.19.7';

module.exports = {
    zookeeper: () => {
        return new Promise(function (accept, reject) {
            accept('10.132.89.71:2181')
        //     dns.setServers([server_url]);
        //     dns.resolveSrv('zookeeper-2181.service.nyc.consul', function (err, lookup) {
        //         if (err) reject(err);
        //         else {
        //             var port = lookup[0].port;
        //             dns.resolve(lookup[0].name, function (err, host) {
        //                 if (err) reject(err);
        //                 else {
        //                     let hostsrv = `${host[0]}:${port}`
        //                     accept(hostsrv);
        //                 }
        //             });
        //         }
        //     });
        });
    },
    sessionSecret: () => {
        return new Promise(function (accept, resolve) {
            accept('sadfasdfas')
            // req(`http://${server_url}:8500/v1/kv/systemwide/session/secret1`)
            // .then((result) => {
            //     let chunk = JSON.parse(result);
            //     let valueBase64 = chunk[0].Value;
            //     let topic = new Buffer(valueBase64, 'base64');
            //     accept(topic.toString());
            // });
        });
    },
    topic: () => {
        let env = 'development';
        return new Promise(function (accept, resolve) {
            accept('dev.auth-user.v1a')
            // req(`http://${server_url}:8500/v1/kv/userauth/${env}/topic`)
            // .then((result) => {
            //     let chunk = JSON.parse(result);
            //     let valueBase64 = chunk[0].Value;
            //     let topic = new Buffer(valueBase64, 'base64');
            //     accept(topic.toString());
            // });
        });
    }
}
