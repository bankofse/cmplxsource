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
    EventConsumer = require('./storeWriter'),
    jwt          = require('jsonwebtoken'),
    moment       = require('moment')
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
            if (headers['token'] === undefined) {
                let error = new Error('Token Error');
                error.status = 400;
                error.message = "Token was not found in headers";
                reject(error);
                return;
            }

            let token = headers['token'];
            let origin = headers['x-real-ip'];
            
            // Assert Token Session is Valid
            try {
                var decoded = jwt.verify(token, 'shhhhh');    
            } catch (e) {
                console.log(e);
                let error = new Error('Token Error');
                error.status = 403;
                error.message = "Token was invalid or modified";
                reject(error);
                return;
            }
            
            // Check Origin and Expiration
            if ((decoded['accept-origin'] == origin) && moment(decoded['expires']).isAfter()){
                accept();
            } else {
                let error = new Error('Token Error');
                error.status = 403;
                error.message = "Token is expired or origin was incorrect";
                reject(error);
                return;
            }
        }.bind(this));
    }

    generateToken (req, user) {
        let headers = req.headers;
        let origin = headers['x-real-ip'];
        return jwt.sign({ 
            'accept-origin': origin,
            'accept-user': user,
            'expires': moment().add(1, 'hour')
        }, 'shhhhh');
    }

    auth (req) {
        var generate = this.generateToken;
        var user = req.body.user, pass = req.body.pass;
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
                            let token = generate(req, user.username);
                            accept(token);
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
