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
    config   = require('../config/kafka'),
    consts   = require('../consts')
;

const AUTHSECRET = consts.AUTHSECRET;

var postgresHost = '';
config.postgrestAPI()
  .then(function (host) { postgresHost = host; })
  .catch(function (e) { console.log("Failed", e) });

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
    req('http://' + postgresHost +'/users?username=eq.' + user)
    .then((res) => {
      let check = JSON.parse(res);
      let realhash = check[0].password_hash;
      bcrypt.compare(pass, realhash, (err, res) => {
        if (err) {
          console.log(err);  
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
    req('http://' + postgresHost + '/users?username=eq.' + user)
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
    let client = new Client('10.132.89.71:2181');
    let producer = new Producer(client);
    let body = [
          { 
            topic: 'dev.auth-user.v1a', 
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
      next(e);
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
      // Gen Token
      res.send({
        token: "token"
      });
    })
    .catch((err) => {
      let error = new Error('Auth Error');
      error.status = 500;
      error.message = "Failed to create account";
      next(error);
    });
  }
});


module.exports = router;
