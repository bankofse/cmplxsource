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
const AUTHSECRET = 'shhhhh';

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
  // TODO check origin and expiration
  if (req.headers.token) {
    try {
      let decoded = jwt.verify(req.headers.token, AUTHSECRET);
      console.log(decoded);
      req.autherizedAccount = {
        accountID: decoded['accept-user']
      }; 
      next();
    } catch(err) {
      console.log(err);
      next(new Error('Token Verification Failed'));
    }
  } else {
    let e = new Error("Not Authorized");
    e.status = 403;
    next(e);
  }

  // next();
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

router.post('/create', [requiresAuth], function(req, res, next) {
  console.log(req.body);
  if (req.body.request_from && req.body.amount) {
    // TODO verify accounts and use account numbers (system not in place)
    let payload = {
      to_account: req.autherizedAccount.accountID,
      from_account: req.body.request_from,
      amount: req.body.amount
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
  } else {
    let e = new Error("Invalid");
    e.status = 401;
    next(e);
  }
});

router.post('/complete', function (req, res) {
  res.status(400).send({
    message: "No transaction id found (:tid)"
  });
});

/* post home page. */
router.post('/complete/:tid', [requiresAuth, verifyTID], function(req, res, next) {
  if (req.transactionInfo.from_account == req.autherizedAccount.accountID) {
    sendPayload(createPayload('payee', new Date(), req.params.tid, req.transactionInfo))
    .then((data) => {
      res.send(data);
    })
    .catch((err) => next(err));
  } else {
    let e = new Error("Not Authorized to perform task");
    e.status = 403;
    next(e);
  }
  
});

module.exports = router;
