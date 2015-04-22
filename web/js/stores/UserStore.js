"use strict";

var Fluxxor = require('fluxxor'),
    consts  = require('../constants/const');

var UserStore  = Fluxxor.createStore({
  initialize: function() {

    this.loggedin = false;

  },

  loginUser: function(payload) {
    this.loggedin = true;
    this.emit("change");
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
