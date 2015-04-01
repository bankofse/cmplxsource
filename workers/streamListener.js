'use strict';

var kafka    = require('kafka-node'),    
    Producer = kafka.Producer,
    Client   = kafka.Client,
    Consumer = kafka.Consumer,
    Offset   = kafka.Offset,
    spawn    = require('../helpers').spawn,
    redis    = require('redis')
;

class TransactionStream {

    constructor (zk, topic, collections) {
        this.collections = collections;
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

    eventRecieved (message) {
        this.consumer.pause();
        let multi = this.redis.multi();
        let payload = JSON.parse(message.value);
        // write to redis
        multi.setnx(`${payload.id}--${payload.type}`, JSON.stringify(payload));
        multi.mget([`${payload.id}--requester`, `${payload.id}--payee`]);
        multi.exec(function (err, resultset) {            
            let numResults = resultset[1].filter( x => x).length;
            if (numResults === 2 && resultset[0]) {
                // TODO - Verify
                console.log('responsible for completing transaction');
                let transactions = resultset[1];
                let amount = JSON.parse(transactions[0]).message.amount;
                this.collections.transaction.create({
                    amount: parseFloat(amount),
                    to_account: "test A",
                    from_account: "test B"
                }).then(function () {
                    console.log("Completed");
                    this.consumer.resume();    
                }.bind(this));
            } else {
                this.consumer.resume();    
            }
        }.bind(this));

    }

}

module.exports = TransactionStream;
