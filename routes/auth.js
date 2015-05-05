"use strict";

var express = require('express'),
    jwt     = require('jsonwebtoken'),
    moment  = require('moment'),
    bcrypt  = require('bcrypt'),
    req     = require('request-promise'),
    debug   = require('debug')('auth')
;

const AUTHSECRET = 'somestring';
const POSTGREST_HOST = 'http://192.168.99.100:3000';

var router  = express.Router();

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
      let error = new Error('Auth Error');
      error.status = 500;
      error.message = "Failed to authenticate";
      next(error);
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
      res.send({
        status: 200
      });
    })
    .catch((err) => {
      next(err);
    });
  }
});

function createAccount(user, pass) {
	return new Promise((accept, reject) => {
		debug("Creating user " + user);
		hashPass(pass)
		.then((hash) => {
			req.post({
				url: POSTGREST_HOST + "/users",
				json: {
					username: user,
					password_hash: hash
				}
			}).then((res) => {
				debug("Good", res)
				accept();
			}).catch((res) => {
				let err = new Error("Cannot create account");
				err.code = res.statusCode;
				reject(err);
			});
		}).catch((res) => {
			let err = new Error("Cannot create account");
			err.code = res.statusCode;
			reject(err);
		})
	});
}

function generateToken (req, user) {
    let headers = req.headers;
    return jwt.sign({
        'accept-user': user,
        'expires': moment().add(1, 'hour')
    }, AUTHSECRET);
}

function hashPass (pass) {
  return new Promise((accept, reject) => {
  	bcrypt.hash(pass, 10, (err, hash) => {
  		if (err) {
  			reject(err);
  		} else {
  			accept(hash);
  		}
  	});
  });
}

function authenticate (user, pass) {
  return new Promise((accept, reject) => {
    req(POSTGREST_HOST +'/users?username=eq.' + user)
    .then((res) => {
      let check = JSON.parse(res);
      if (check.length == 0) {
      	reject("No User Found");
      	return;
      }
      let realhash = check[0].password_hash;
      bcrypt.compare(pass, realhash, (err, res) => {
        if (err) {
          debug("bcrypt error: " + err.message);
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
    }).catch((err) => {
    	debug("Auth Service Failure:", err);
    	reject(err);
    });
  });
}

function auth (req, res, next) {
    if (req.headers.token) {
        try {
            var decoded = jwt.verify(req.headers.token, AUTHSECRET);
            req.autherizedAccount = {
                accountID: decoded['accept-user']
            };
        } catch(err) {
            next(new Error('Token Verification Failed'));
            return;
        }        
        if (moment(decoded['expires']).isAfter()){
           next();
        } else {
            let error = new Error('Token Error');
            error.status = 403;
            error.message = "Token is expired or origin was incorrect";
            next(error);
            return;
        }
    } else {
        let e = new Error("Not Authorized");
        e.status = 403;
        next(e);
    }
}

module.exports = {
	routes: router,
	authorized: auth
};
