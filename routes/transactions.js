"use strict";

var express = require('express'),
  debug = require('debug')('cmplxsource:transaction'),
  rp = require('request-promise'),
  disque = require('disque.js'),
  redis = require('redis'),
  config = require('../config');

var client = disque.connect([config.disque.host + ":" + config.disque.port]);
var cache = redis.createClient(config.redis.port, config.redis.host);
var router = express.Router();

const POSTGREST_HOST = config.postgrest.host;

/*
 * Handle Transactions
 */
function handleJobs() {
  var worker = disque.connect([config.disque.host + ":" + config.disque.port]);
  worker.getjob(['transaction-create', 'transaction-complete'], (err, jobs) => {
    if (err) return debug(err);
    jobs.forEach((job) => {
      let tid = job[0] == 'transaction-create' ? job[1] : JSON.parse(job[2]).tid;
      cache.setnx(tid, job[2], (err, writen) => {
        if (err) return debug(err);
        if (writen) {
          debug("TID cached: " + tid);
          if (job[0] == 'transaction-complete') {
            cache.del(tid);
            debug('Invalid transaction, removed');
          }
        } else {
          debug("Completed: " + tid);
          cache.get(tid, (err, p) => {
            if (err) return debug(err);
            completeTransaction({
              cached: p,
              trigged: job[2]
            });
            cache.del(tid);
          });
        }
        worker.ackjob(job[1], (err) => {
          debug("Done");
          handleJobs();
        });
      });

    });
  });
}

cache.on('connect', () => handleJobs());

function completeTransaction(payload) {
  let transaction = JSON.parse(payload.cached);
  debug(transaction)
  rp.post({
      url: POSTGREST_HOST + '/transactions',
      json: {
        from_account: transaction.deposit_to,
        account: transaction.request_from,
        amount: (0 - transaction.amount),
        description: transaction.description
      }
    })
    .then(() => rp.post({
      url: POSTGREST_HOST + '/transactions',
      json: {
        from_account: transaction.request_from,
        account: transaction.deposit_to,
        amount: transaction.amount,
        description: transaction.description
      }
    }))
    .then(() => debug('Completed'))
    .catch(() => debug('Failed'));
}

/*
 * Handle Requests
 */
router.get('/', function(req, res, next) {
  debug('Fetching transactions for ' + req.autherizedAccount.accountUser);
  rp(POSTGREST_HOST + '/accountsinfo?user_id=eq.' + req.autherizedAccount.accountID)
    .then((response) => {
      response = JSON.parse(response);
      let acctNums = response.map((e) => e.account_number).join(",");
      return rp(POSTGREST_HOST + '/transactions?account=in.' + acctNums);
    })
    .then((transactions) => res.send(transactions))
    .catch((err) => next(err));
});

router.post('/create', function(req, res, next) {
  if (!req.body.account || !req.body.amount) return next(new Error("Not enough params"));
  let payload = {
    request_from: req.body.account,
    amount: req.body.amount,
    deposit_to: parseInt(req.body.deposit_to || req.autherizedAccount.accountID), // TODO default account
    description: req.body.deposit_to || "No description"
  };
  rp(POSTGREST_HOST + '/accounts?id=eq.' + payload.deposit_to)
    .then(r => JSON.parse(r)[0].uid)
    .then((id) => {
      if (id != req.autherizedAccount.accountID) throw "Not authorised to perform this operation";
    })
    .then(() => rp(POSTGREST_HOST + '/accountsinfo?account_number=eq.' + payload.request_from))
    .then((response) => {
      let account = JSON.parse(response)[0];
      if (account.amount < payload.amount) throw "Request Denied";
      debug(payload);
      return payload;
    }).then((p) => {
      client.addjob('transaction-create', JSON.stringify(p), 0, function(err, TID) {
        if (err) return debug(err);
        debug('Added job with ID ' + TID);
        res.send({
          tid: TID
        });
      });
    })
    .catch((err) => {
      next(err);
    });
});

router.post('/complete/:tid', function(req, res, next) {
  if (!req.params.tid) return next(new Error("Invalid Request"));
  cache.get(req.params.tid, (err, response) => {
    if (err || !response) return next(new Error("No transaction found"));
    let transaction = JSON.parse(response);
    rp(POSTGREST_HOST + '/accounts?id=eq.' + transaction.request_from)
      .then(r => JSON.parse(r)[0].uid)
      .then((id) => {
        if (id != req.autherizedAccount.accountID) throw "Not authorised to perform this operation";
      })
      .then(() => {
        let body = {};
        client.addjob('transaction-complete', JSON.stringify({
          tid: req.params.tid,
          body: body
        }), 0, function(err, TID) {
          if (err) return debug(err);
          debug('Added finish job with ID ' + TID);
          res.send({
            status: 200
          });
        });
      })
      .catch(err => next(new Error("Ops something went wrong")));
  });
});

module.exports = router;
