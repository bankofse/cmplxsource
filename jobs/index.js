'use strict';

var kafka     = require('kafka-node'),    
    Producer  = kafka.Producer,
    Client    = kafka.Client,
    Consumer  = kafka.Consumer,
    Offset    = kafka.Offset,
    pg        = require('pg')
;

function log() {
    console.log.apply(null, ["[Kafka Listener][INFO]"].concat(Array.prototype.slice.call(arguments)));
}

/**
 *   Setup for Kafka Consumer
 *   TODOS:
 *      > Per process consumer groups 
 */
var topic = "dev.completed-transactions.v1";
var client = new Client("10.132.89.71:2181");
var consumer = new Consumer(client,
    [
        { topic: topic }
    ],
    {
        groupId: 'accounts-consumer-1',
        autoCommitIntervalMs: 0,
        autoCommit: true // Maybe not commit until verified transaction 
    });

consumer.on('message', incomingMessage.bind(this));
consumer.on('error', function (err) {
    log(err.message, "quitting...");
    consumer.close();
    process.exit(1);
});

/**
 *    Setup Postgres connections
 *    TODOS:
 *      > Separate Account for writing
 *      > Connection Pool
 */
var pg_connection = "postgres://accounts:accounts@192.168.99.100:5432/accounts";


function completeTransaction(payload) {

    // select * from amounts where account=? or account=? --> [to_account, from_account]
    // check ammounts, WARNING maybe do server side to prevent race of multiple transactions
    // insert into transactions (account, ammount) values (?, ?) --> [to_account, amount]
    // insert into transactions (account, ammount) values (?, ?) --> [from_account, -amount]

    pg.connect(pg_connection, function(err, client, done) {
        if (err) { log(err.message); done(); return; }
        log("Connected")
        client.query("select a1.amount, a2.uid " + 
                     "from amounts as a1 join accounts as a2 on a2.id=a1.account " +
                     "where a2.uid=$1 limit 1;", 
            [payload.from_account],
            function (err, response) {
                if (err) { log(err); done(); return; }
                var from = response.rows[0];
                if (from.amount >= payload.amount) {
                    log("Funds are good");
                } else {
                    log("Insufient funds to complete");
                    done();
                    return;
                }
                client.query("insert into transactions (account, amount) values ($1, $2)", 
                    [payload.to_account, payload.amount],
                    function (err, response) {
                        if (err) { log(err); done(); return; }
                        log("Good A")
                    client.query("insert into transactions (account, amount) values ($1, $2)", 
                        [payload.from_account, (0 - payload.amount)],
                        function (err, response) {
                            if (err) { log(err); done(); return; }
                            log("Good B")
                            done();
                        }); 
                    });   
            });
    });

    return true;
}

function validatePayload(msg) {
    var check = ['to_account', 'from_account', 'amount']
    .map(function(e) {
        return msg.hasOwnProperty(e);
    });
    return check.reduce(function (p, c) {
        return p && c;
    });
}

function incomingMessage(msg) {
    try {
        var payload = JSON.parse(msg.value);
    } catch(e) {
        log("Malformed Payload");
        return;
    }
    if (validatePayload(payload)) {
        log("Finishing transactions for", payload);
        completeTransaction(payload);
    } else {
        log("Missing Properties");
    }
}
