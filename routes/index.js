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

router.post('/', function (req, res) {



  res.send({});
});



module.exports = router;
