"use strict";

var express = require('express'),
    router = express.Router()
;

/* GET home page. */
router.get('/', function(req, res, next) {
  req.accountstore.ask(req)
  .then(() => {
    res.send({
      status: 200
    });
  })
  .catch((e) => {
    next(e);
  });
});

router.post('/', function (req, res, next) {
  if (req.body.user && req.body.pass) {
    req.accountstore.auth(req.body.user, req.body.pass)
    .then((token) => {
      res.send({
        token: token
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
    req.accountstore.createAccountRequest(req.body.user, req.body.pass)
    .then((token) => {
      res.send({
        token: token
      });
    })
    .catch(() => {
      let error = new Error('Auth Error');
      error.status = 500;
      error.message = "Failed to create account";
      next(error);
    });
  }
});


module.exports = router;
