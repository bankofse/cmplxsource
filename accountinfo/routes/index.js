'use strict';

var express = require('express');
var router = express.Router();
var debug = require('debug')('accountinfo');
var rp = require('request-promise');

/* GET home page. */
router.get('/', function(req, res) {
  res.send({ status: 200, message: 'Authenticated', body: req.userinfo });
});

router.get('/accounts', function (req, res, next) {
	let id = req.userinfo.id;
	debug('fetching account info for user id' + id);
    rp({
        url: 'http://' + process.env.ACCOUNTIP +'/accountsinfo?user_id=eq.' + id
    })
    .then((response) => {
        res.send(response);
    }).catch((e) => {
        console.error('Failed to fetch user info');
        console.error(e);
        next(new Error('Ops something went wrong'));
    });

});

module.exports = router;
