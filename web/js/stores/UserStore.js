"use strict";

var Fluxxor = require('fluxxor'),
    consts  = require('../constants/const');

var UserStore  = Fluxxor.createStore({
  initialize: function() {
<<<<<<< Updated upstream
    this.loggedin = false;
    this.jwt = null;
=======
    let authKey;
    let hasKey = localStorage.getItem("auth-token");

    if (hasKey) {
      authKey = hasKey;

      $.get('https://cmplx.in/auth', function () {
        console.log(arguments);
      });

    } else {
      this.loggedin = false;
    }

    this.loggedin = false;
>>>>>>> Stashed changes
    this.bindActions(
        consts.LOGIN_USER, this.loginUser,
        consts.LOGOUT_User, this.logoutUser
    );

  },

  loginUser: function(payload) {
    this.loggedin = true;
<<<<<<< Updated upstream
    this.jwt = payload.jwt;
    this.emit("change");
  },

  logoutUser: function() {
    this.loggedin = false;
    this.jwt = null;
=======

    
    
>>>>>>> Stashed changes
    this.emit("change");
  },

  getState: function() {
    return { loggedin : this.loggedin, jwt: this.jwt, jwt_decode: this.jwt_decode };
  }
});

module.exports = UserStore;
