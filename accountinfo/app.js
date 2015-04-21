'use strict';

var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var auth = require('./auth_utils/');
var routes = require('./routes/index');
var debug = require('debug')('accountinfo');
var rp = require('request-promise');
var app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

function setUserInfo (req, res, next) {
    let username = req.autherizedAccount.accountID;

    debug('fetching user info for account ' + username);
    rp({
        url: 'http://' + process.env.ACCOUNTIP +'/users?username=eq.' + username,
        headers: {
            'Range-Unit': 'Item',
            'Range': '0-0'
        }
    })
    .then((response) => {
        let user = JSON.parse(response)[0];
        delete user.password_hash;
        debug(user);
        req.userinfo = user;
        next();
    }).catch((e) => {
        console.error('Failed to fetch user info');
        console.error(e);
        next(new Error('Ops something went wrong'));
    });
}

app.use('/', [auth.checkAuth, setUserInfo], routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.send({
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send({
        message: err.message,
        error: {}
    });
});


module.exports = app;
