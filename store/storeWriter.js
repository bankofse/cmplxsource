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
    Offset       = kafka.Offset
;

class EventConsumer {

    constructor () {
        // Heath Monitoring
        this.messagesRecieved = 0;
        setInterval(this.checkoffset.bind(this), 5000);
    }

    setup () {
        return spawn(function* () {
            // Data State setup
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

            // Kafka connection
            let host = yield kafka_config.zookeeper();
            console.log("Zookeeper discovered at " + host);
            let topic = yield kafka_config.topic();
            let client = new Client(host);
            let producer = yield this.connectToKafka(client, topic);
            console.log('Kafka set to publish to ' + topic);

            let consumer = yield this.connectConsumer(client, topic);
            
            consumer.on('message', this.recievedDataChangeEvent.bind(this));

            this.consumer = consumer;
            this.producer = producer;
            this.topic    = topic;

            this.producer.on('error', (err) => {
                console.log("[Producer Error]:", err);
            });

            return;
        }.bind(this)());
    }

    checkoffset () {
        // new Offset(this.client)
    }

    hashPass (pass, done) {
        bcrypt.hash(pass, 10, done);
    }

    recievedDataChangeEvent (msg) {
        // console.dir(msg);
        this.messagesRecieved += 1;
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
                console.log("[DATA CHANGE]: Created Account", user.username);
            }
        });
    }

    buildAccountCreationMessage (user, pass) {
        var hasher = this.hashPass;
        return new Promise ((accept, reject) => {
            hasher(pass, function(err, hash) {
                if(err) {
                    console.log(err);
                    reject(err);
                }
                else 
                {
                    let encoded = JSON.stringify({
                        "version": "v0.1a",
                        "creationDate": (new Date()).toISOString(),
                        "type": "creation",
                        "payload": {
                            "user": user,
                            "pass": hash
                        }
                    });
                    accept(encoded);
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

    connectToKafka (client, topic) {
        return new Promise((accept, reject) => {
            var producer = new Producer(client)
            producer.on('ready', () => {
                console.log("Creating topic if not exists =>", topic);
                producer.createTopics([topic], false, (err, data) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                    } else {
                        console.log("->",data);
                        accept(producer);
                    }
                });
            });
            producer.on('error', reject);
        });
    }

    connectConsumer (client, topic) {
        return new Promise((accept, reject) => {
            var consumer = new Consumer(client,
                [
                    { 
                        topic: topic,
                        partition: 0
                    }
                ],
                {
                    autoCommit: false
                });
            accept(consumer);
        });
    }

}

module.exports = EventConsumer;
