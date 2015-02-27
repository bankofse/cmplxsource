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

        this.eventConsumer = new EventConsumer();

        this.eventConsumer.setup()
        .then(() => {
            console.log("==== Finished Setup ====");            
        })
        .catch((e) => {
            console.log("ERROR", e)
        });
    }

    createAccountRequest (user, pass) {
        // Check validation
        return spawn(function* () {

            let creationMessage = yield this.eventConsumer.buildAccountCreationMessage(user, pass);

            yield this.eventConsumer.sendPayload(creationMessage);

            return "Token";

        }.bind(this)());
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
            if (this.eventConsumer.checkCachedSession(token, null)) {
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

    generateToken (username) {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                       .toString(16)
                       .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
               s4() + '-' + s4() + s4() + s4();
    }

    auth (user, pass) {
        var generate = this.generateToken;
        var sessionUpdate = this.eventConsumer.updateSessionToken.bind(this.eventConsumer);
        return new Promise(function (accept, reject) {
            this.eventConsumer.models.user.findOne()
            .where({
                username: user
            })
            .then(function (user) {
                if (user) {
                    bcrypt.compare(pass, user.password, (err, res) => {
                        if (err) {
                            console.log(err);  
                            reject(err);
                        }
                        if (res) {
                            let token = generate();
                            sessionUpdate(user.username, token)
                            .then(() => {
                                accept(token);
                            });
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
