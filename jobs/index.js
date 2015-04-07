'use strict';

var kafka     = require('kafka-node'),    
    Producer  = kafka.Producer,
    Client    = kafka.Client,
    Consumer  = kafka.Consumer,
    Offset    = kafka.Offset,
    pg        = require('pg'),
    Promise   = require('promise')
;

// client.query("insert into users (username, password_hash) values ($1, $2)", 
//     [act.user, act.passhash],
//     function (err, response) {
//         if (err) { log(err); done(); return; }
//         done();
//     });

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
        { topic: topic },
        { topic: 'dev.auth-user.v1a' }
    ],
    {
        groupId: 'replication-1',
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
var pg_connection = "postgres://accounts:accounts@localhost:5432/accounts";

function completeTransaction(payload) {
    
    var toAct = payload.to_account;
    var fromAct = payload.from_account;
    var ammount = payload.amount;

    var toWait = getDefaultAccount(toAct);
    var fromWait = getDefaultAccount(fromAct);
    
    toWait
    .then(function (toAccount) {
        fromWait.then(function (fromAccount) {
            continueTransaction(toAccount, fromAccount);
        });
    }).catch(function (err) {
        log(err);
    });

    // Skipping fund checking for R1, aka unlimited money
    var continueTransaction = function (toAccount, fromAccount) {
        log("Finishing Transaction")
        writeTransaction(toAccount, ammount);
        writeTransaction(fromAccount, (0 - ammount));
    }
}

function writeTransaction(account, amount) {
    pg.connect(pg_connection, function(err, client, done) {
        if (err) { log(err.message); done(); return; }
        client.query("insert into transactions (account, amount) values ($1, $2);", 
        [account, amount],
        function (err, response) {
            if (err) { log(err); done(); return; }
            done();
        });
    });
}

function getDefaultAccount(account) {
    return new Promise(function (accept, reject) {
        pg.connect(pg_connection, function(err, client, done) {
            if (err) { log(err.message); done(); reject(err); return; }
            client.query("select a.id from accounts a join users u on u.id=a.uid where u.username=$1 limit 1;", 
            [account],
            function (err, response) {
                if (err) { log(err); done(); return; }
                accept(response.rows[0].id)
                done();
            });
        });
    });
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

function createUserAccount(msg) {
    try {
        var act = JSON.parse(msg);
    } catch (e) {
        log(e);
        return;
    }
    // TODO find a postgres library that suports multiple statements
    pg.connect(pg_connection, function(err, client, done) {
        if (err) { log(err.message); done(); return; }
        client.query("select * from users where username=$1", 
        [act.user],
        function (err, response) {
            if (err) { log(err); done(); return; }
            if (response.rowCount == 0) {
                client.query("insert into users (username, password_hash) values ($1, $2)", 
                [act.user, act.passhash],
                function (err, response) {
                    if (err) { log(err); done(); return; }
                    client.query("select id from users where username=$1", 
                    [act.user],
                    function (err, response) {
                        if (err) { log(err); done(); return; }
                        var id = response.rows[0].id;
                        client.query("insert into accounts (uid) values ($1)", 
                        [id],
                        function (err, response) {
                            if (err) { log(err); done(); return; }
                            log("Created Account for", act.user);
                            done();
                        });
                    });
                });
            } else {
                done();
            }
        });
    });
}

function incomingMessage(msg) {
    switch (msg.topic) {
        case topic:
        {
            try {
                var payload = JSON.parse(msg.value);
            } catch(e) {
                log("Malformed Payload:", msg.value);
                return;
            }
            if (validatePayload(payload)) {
                log("Finishing transactions for", payload);
                completeTransaction(payload);
            } else {
                log("Missing Properties");
            }
        }
        break;
        case 'dev.auth-user.v1a':
        {
            createUserAccount(msg.value);
        }
        break;
    }
}
