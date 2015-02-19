"use strict";
var req = require('request-promise');

module.exports = {
    zk: () => {
        return new Promise((accept, reject) => {
            accept('cluster1.student.rit.edu');
        });
    },
    port: () => {
        return new Promise(function (accept, resolve) {
            req("http://cluster1.student.rit.edu:8500/v1/catalog/service/zk")
            .then((result) => {
                let chunk = JSON.parse(result);
                let value = chunk[0].ServicePort;
                accept(value);
            });
        });
    },
    sessionSecret: () => {
        return new Promise(function (accept, resolve) {
            req("http://cluster1.student.rit.edu:8500/v1/kv/systemwide/session/secret")
            .then((result) => {
                let chunk = JSON.parse(result);
                let valueBase64 = chunk[0].Value;
                let topic = new Buffer(valueBase64, 'base64');
                accept(topic.toString());
            });
        });
    },
    topic: () => {
        let env = 'development';
        return new Promise(function (accept, resolve) {
            req(`http://cluster1.student.rit.edu:8500/v1/kv/userauth/${env}/topic`)
            .then((result) => {
                let chunk = JSON.parse(result);
                let valueBase64 = chunk[0].Value;
                let topic = new Buffer(valueBase64, 'base64');
                accept(topic.toString());
            });
        });
    }
}
