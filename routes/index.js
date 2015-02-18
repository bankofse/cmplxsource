"use strict";

var express = require('express'),
    router = express.Router(),
    Store  = require('../store')
;

/* GET home page. */
router.get('/', function(req, res) {
  let accounts = new Store();

  accounts
  .init()
  .then(()=> {
    console.log("Store ready for use");
  });

  res.send({});

});

router.post('/create', function (req, res) {



  res.send({});
});


module.exports = router;
