"use strict";

var Fluxxor = require('fluxxor'),
    consts  = require('../constants/const'),
    rest    = require('rest'),
    mime    = require('rest/interceptor/mime'),
    defaultRequest = require('rest/interceptor/defaultRequest')
;

const AUTHKEY = "auth-token";

var UserStore  = Fluxxor.createStore({

  initialize: function() {
    this.bindActions(
      consts.LOGIN_USER, this.loginUser,
      consts.LOGOUT_USER, this.logoutUser
    ); 
    this.loggedin = false;

    rest.wrap(defaultRequest, { 
      method: "GET"
    })
    ({
      path: "https://cmplx.in/user",
      headers: { 'X-Requested-With': 'rest.js' }
    })
    .then(function (response) {
      console.log(response);
    }.bind(this))
    .catch(function (err) {
      console.log(err);
    });

  },

  loginUser: function(payload) {
    console.log("Loggin in user", payload);
    rest.wrap(mime, { mime: 'application/json' })({
      path: "https://cmplx.in/auth",
      method: "POST",
      entity: payload
    })
    .then(function (response) {
      switch(response.status.code) {

        case 200:
          this.loggedin = true;
          localStorage.setItem(AUTHKEY, response.entity.token);
          this.emit("change");
          break;

        default:
          console.log("Not logged in")

      }
    }.bind(this));

  },

  logoutUser: function() {
    this.loggedin = false;
    this.emit("change");
  },

  getState: function() {
    return { loggedin : this.loggedin };
  }

});

module.exports = UserStore;
