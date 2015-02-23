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

class EventConsumer {


	constructor (producer, consumer, topic, models) {
		this.producer = producer;
		this.consumer = consumer;
		this.topic = topic;
		this.models = models;

		this.consumer.on('message', this.recievedDataChangeEvent.bind(this));
	}

    recievedDataChangeEvent (msg) {
        console.dir(msg);
        let message = JSON.parse(msg.value);
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
        .exec((err, user) => {
            if (err) {
                console.log("account already made");
            } else {
                console.log("Created Account", user.username);
            }
        });
    }

    buildAccountCreationMessage (user, pass) {
        var hasher = this.hashPass;
        return new Promise ((accept, reject) => {
            hasher(pass, function(err, hash) {
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
            }], accept);
        });
    }

}

module.exports = EventConsumer;
