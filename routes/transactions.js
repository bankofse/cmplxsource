"use strict";

var express = require('express'),
    debug   = require('debug')('transaction'),
    rp      = require('request-promise'),
    disque  = require('disque.js'),
    redis   = require('redis')
;

var client  = disque.connect(['127.0.0.1:7711']);
var cache   = redis.createClient(6379, '127.0.0.1');
var router  = express.Router();

const POSTGREST_HOST = 'http://192.168.99.100:3000';

/*
 * Handle Transactions
 */
function handleJobs() {
  var worker = disque.connect(['127.0.0.1:7711']);
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

cache.on('connect', () => handleJobs() );

function completeTransaction(payload) {
  debug("Writing out to database");
  debug(payload);

} 


/*
 * Handle Requests
 */
router.get('/', function(req, res, next) {
  debug('Fetching transactions for ' + req.autherizedAccount.accountUser);
  // rp(POSTGREST_HOST +'/transactions?username=eq.' + req.autherizedAccount.accountID)
  res.send([]);
});

router.post('/create', function(req, res, next) {
  let payload  = {
    requester_account: 250, 
    amount: 500
  };
  client.addjob('transaction-create', JSON.stringify(payload), 0, function(err, TID) {
    if (err) return debug(err);
    debug('Added job with ID ' + TID);
    res.send({
      tid: TID
    });
  });
});

router.post('/complete/:tid', function(req, res, next) {
  let body = {
    fulfilment_account: 643
  };
  client.addjob('transaction-complete', JSON.stringify({ tid: req.params.tid, body: body }), 0, function(err, TID) {
    if (err) return debug(err);
    debug('Added finish job with ID ' + TID);
    res.send({
      status: 200
    });
  });
});

module.exports = router;