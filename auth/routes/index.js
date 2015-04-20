"use strict";

var express  = require('express'),
    router   = express.Router(),
    kafka    = require('kafka-node'),
    bcrypt   = require('bcrypt'),
    Producer = kafka.Producer,
    Client   = kafka.Client,
    jwt      = require('jsonwebtoken'),
    moment   = require('moment'),
    req      = require('request-promise'),
    consts   = require('../consts'),
    debug    = require('debug')('route'),
    config   = require('../config'),
    pool     = require('generic-pool')
;

const AUTHSECRET = consts.AUTHSECRET;

var producers = pool.Pool({
    name     : 'kafka',
    create   : function(callback) {
      config.zk()
      .then((address) => {
        let client = new Client(address);
        let producer = new Producer(client);
        producer.on('ready', () => {
          callback(null, producer);
        });
      }).catch( err => callback(err) );
    },
    destroy  : function(client) {
      client.close();
    },
    max : 10,
    min : 2,
    idleTimeoutMillis : 30000,
    log : false
});

function generateToken (req, user) {
    let headers = req.headers;
    let origin = headers['x-real-ip'];
    return jwt.sign({
        'accept-origin': origin,
        'accept-user': user,
        'expires': moment().add(1, 'hour')
    }, AUTHSECRET);
}

function authenticate (user, pass) {
  return new Promise((accept, reject) => {
    config.accounts()
    .then((addr) => {
      let postgresHost = addr[0].Address + ":" + addr[0].ServicePort;
      return req('http://' + postgresHost +'/users?username=eq.' + user);
    })
    .then((res) => {
      let check = JSON.parse(res);
      let realhash = check[0].password_hash;
      bcrypt.compare(pass, realhash, (err, res) => {
        if (err) {
          debug("bcrypt error: " + err.message);
          reject(err);
        }
        if (res) {
          accept({
            username : check[0].username
          });
        } else {
          let error = new Error('User Error');
          error.status = 401;
          error.message = "Invalid Password";
          reject(error);
        }
      });
    }).catch(reject);
  });
}

function hashPass (pass, done) {
  bcrypt.hash(pass, 10, done);
}

function createAccount (user, pass) {
  return new Promise((accept, reject) => {
    config.accounts()
    .then((addr) => {
      let postgresHost = addr[0].Address + ":" + addr[0].ServicePort;
      return req('http://' + postgresHost +'/users?username=eq.' + user);
    })
    .then((res) => {
      if(JSON.parse(res).length > 0) {
        reject("User Exists");
        return;
      }
      hashPass(pass, function (err, hash) {
        if (err) { reject(err); return; }
        let payload = JSON.stringify({
          user: user,
          passhash: hash
        });
        sendPayload(payload)
          .then(accept)
          .catch(reject);
      });
    }).catch(reject);
  });
}

function sendPayload(payload) {
  return new Promise((accept, reject) => {
    let body = [
          {
            topic: process.env.TOPIC,
            messages: [payload]
          },
      ];
      producers.acquire((err, producer) => {
      producer.send(body, (err, data) => {
        if (err) {
          debug("Failed to publish " + err);
          reject(err);
        } else {
          accept(data);
        }
        producers.release(producer);
      });
    })
  });
}

router.post('/', function (req, res, next) {
  if (req.body.user && req.body.pass) {
    authenticate(req.body.user, req.body.pass)
    .then((user) => {
      let token = generateToken(req, user.username)
      res.send({
        username : user.username,
        token : token
      });
    })
    .catch((e) => {
      let error = new Error('Auth Error');
      error.status = 500;
      error.message = "Failed to authenticate";
      next(error);
    });
  } else {
    let error = new Error('Auth Error');
    error.status = 400;
    error.message = "Not enough parameters provided";
    next(error);
  }
});

router.post('/create', function (req, res, next) {
  if (req.body.user && req.body.pass) {
    createAccount(req.body.user, req.body.pass)
    .then(() => {
      res.send({
        status: 200
      });
    })
    .catch((err) => {
      debug('Creation error ' + err);
      let error = new Error('Auth Error');
      error.status = 500;
      error.message = "Failed to create account";
      next(error);
    });
  }
});


module.exports = router;
