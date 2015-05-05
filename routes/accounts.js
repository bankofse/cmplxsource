"use strict";

var express = require('express'),
    debug   = require('debug')('accounts'),
    rp      = require('request-promise')
;

var router  = express.Router();

const POSTGREST_HOST = 'http://192.168.99.100:3000';

/* GET home page. */
router.get('/', function(req, res, next) {
  rp(POSTGREST_HOST + '/users?username=eq.' + req.autherizedAccount.accountID)
  .then((resp) => {
    let body = JSON.parse(resp);
    body = body[0];
    delete body.password_hash;
    res.send(body);  
  })
  .catch((res) => {
    let err = new Error("Failed to fetch user information");
    err.status = 500;
    next(err);
  }); 
});

module.exports = router;
