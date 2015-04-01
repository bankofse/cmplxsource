'use strict';

var express = require('express'),
    router  = express.Router(),
    config  = require('../config/config'),
    kafka    = require('kafka-node'),    
    Producer = kafka.Producer,
    Client   = kafka.Client,
    Consumer = kafka.Consumer,
    Offset   = kafka.Offset,
    jwt      = require('jsonwebtoken')
;

const SIGNTOKEN = 'the_secret_aklsfalksjhdflkasjhdflkasjhdf';

function createPayload(part, date, tid, body) {
  // TODO - determine roles from tid contents to remove --resuester --payee
  return JSON.stringify({
    type: part,
    message: body,
    date: date.toISOString(),
    id: tid
  });
}

function requiresAuth(req, res, next) {
  // TODO - this
  req.autherizedAccount = {
    accountID: 'testaccountid_a'
  };
  next();
}

function requireTypeID(req, res, next) {
  console.log(req.transactionInfo);
  if (req.query.type) {
    req.typeID = req.query.type.toLowerCase();
    next();
  } else {
    next(new Error("Type required in query"));
  }
}

function verifyTID(req, res, next) {
  try {
    let decoded = jwt.verify(req.params.tid, SIGNTOKEN);
    req.transactionInfo = decoded;  
    next();
  } catch(err) {
    next(new Error('TID Verification Failed'));
  }
}

function sendPayload(payload) {
  return new Promise((accept, reject) => {
    let client = new Client('10.132.89.71:2181');
    let producer = new Producer(client);
    let body = [
          { 
            topic: config.topic(), 
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

router.get('/create', [requiresAuth], function(req, res, next) {
  let payload = {
    to_account: req.autherizedAccount.accountID,
    from_account: "gotten_from_request",
    amount: 25.74
  }
  let tid = jwt.sign(payload, SIGNTOKEN);
  res.send({
    tid: tid
  });
  sendPayload(createPayload('requester', new Date(), tid, payload))
  .then((data) => {
    res.send(data);
  })
  .catch((err) => console.log(error));;
});

router.post('/complete', function (req, res) {
  res.status(400).send({
    message: "No transaction id found (:tid)"
  });
});

/* post home page. */
router.post('/complete/:tid', [requiresAuth, verifyTID], function(req, res, next) {
  sendPayload(createPayload('payee', new Date(), req.params.tid, req.transactionInfo))
  .then((data) => {
    res.send(data);
  })
  .catch((err) => next(err));
});

module.exports = router;
