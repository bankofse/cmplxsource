"use strict";

var express = require('express'),
    debug   = require('debug')('cmplxsource:accounts'),
    rp      = require('request-promise')
;

var router  = express.Router();

const POSTGREST_HOST = require('../config').postgrest.host;

function checkCurrency (req, res, next) {
  if (req.query.currency) {
    let code = req.query.currency;
    debug("Converting Currency USD -> " + code);
    rp("http://openexchangerates.org/api/latest.json?app_id=4338c7cacc45464cbf92805b328d5d4d")
     .then(r => JSON.parse(r))
     .then(r => r.rates)
     .then(r => r[code])
     .then(r => parseFloat(r))
     .then((rate) => {
       req.exchange = {
        rate: rate,
        code: code
      };
      next();
    })
    .catch(e => next(new Error("Something went wrong")));
  } else next();
}

/* GET home page. */
router.get('/', [checkCurrency], function(req, res, next) {
  rp(POSTGREST_HOST + '/accountsinfo?user_id=eq.' + req.autherizedAccount.accountID)
  .then((resp) => {
    let accts = JSON.parse(resp);
    accts = accts.map((e) => {
      debug(req.exchange);
      e.currency_code = req.exchange ? req.exchange.code : "USD";
      if (req.exchange) {
        e.amount = e.amount *  req.exchange.rate;
      }
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
  rp.post({
    url: POSTGREST_HOST + '/accounts',
    json: {
      uid: req.autherizedAccount.accountID
    }
  })
  .then((response) => {
    res.status(201);
    res.send({
      status: 201
    });
  })
  .catch((response) => {
    let err = new Error("Failed to create new account");
    err.status = 501;
    next(err);
  });
});

module.exports = router;
