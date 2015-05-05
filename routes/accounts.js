"use strict";

var express = require('express'),
    debug   = require('debug')('accounts'),
    rp      = require('request-promise')
;

var router  = express.Router();

const POSTGREST_HOST = 'http://192.168.99.100:3000';

/* GET home page. */
router.get('/', function(req, res, next) {
  rp(POSTGREST_HOST + '/accountsinfo?user_id=eq.' + req.autherizedAccount.accountID)
  .then((resp) => {
    let accts = JSON.parse(resp);
    accts = accts.map((e) => {
      delete e.user_id;
      return e;
    });
    res.send({
      user: req.autherizedAccount.accountUser,
      accounts: accts
    });  
  })
  .catch((res) => {
    debug(res)
    let err = new Error("Failed to fetch user information");
    err.status = 500;
    next(err);
  }); 
});

router.post('/create', function (req, res, next) {
  
  res.send("Creating a new account for your user");

});

module.exports = router;
