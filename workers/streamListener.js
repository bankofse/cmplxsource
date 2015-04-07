'use strict';

var kafka    = require('kafka-node'),    
    Producer = kafka.Producer,
    Client   = kafka.Client,
    Consumer = kafka.Consumer,
    Offset   = kafka.Offset,
    spawn    = require('../helpers').spawn,
    redis    = require('redis')
;

const COMPLETION_TOPIC = 'dev.completed-transactions.v1';

class TransactionStream {

    constructor (zk, topic) {
        console.log(`Creating listener on topic ${topic}...`)
        let client = new Client(zk);
        this.redis = redis.createClient(31006, "10.132.89.72");
        this.consumer = new Consumer(client,
            [
                { topic: topic }
            ],
            {
                groupId: 'transactions',
                autoCommitIntervalMs: 0,
                autoCommit: true
            });
        this.consumer.on('message', this.eventRecieved.bind(this));
        console.info("Done")
    }

    sendPayload (payload, topic) {
        return new Promise((accept, reject) => {
            let client = new Client('10.132.89.71:2181');
            let producer = new Producer(client);
            let body = [
                  { 
                    topic: topic, 
                    messages: [payload]
                  },
              ];
            producer.on('ready', () => {
                producer.send(body, (err, data) => {
                  if (err) {
                      reject(err);
                  } else {
                      accept(data);
                  }
                  producer.close();
                });
            });
        });
    }

    complete (id) {
        // Check for both
        this.redis.mget([id + 'r', id + 'p'], function (err, data) {
            let finished = data.reduce( (l, p) => !!(l && p) );
            if (finished) {
                let create = JSON.parse(data[0]);
                this.sendPayload(JSON.stringify(create.message), COMPLETION_TOPIC);
            }
        }.bind(this));
    }

    requesterHandle (id, body) {
        console.log("handling transaction", id)
        this.redis.setnx(id + "r", JSON.stringify(body), function (err, data) {
            if(data) {
                this.complete(id);
            }
        }.bind(this));
    }

    payeeHandle (body) {
        console.log("finish transaction", body.tid)
        this.redis.setnx(body.tid + "p", JSON.stringify(body), function (err, data) {
            if(data) {
                this.complete(body.tid);
            }
        }.bind(this));
    }

    eventRecieved (message) {
        let body = JSON.parse(message.value);
        // Requester
        if (body.type == 'requester') {
            this.requesterHandle(message.offset, body);
        }
        // Payee
        else if (body.type == 'payee') {
            this.payeeHandle(body);
        }

    }

}

module.exports = TransactionStream;
