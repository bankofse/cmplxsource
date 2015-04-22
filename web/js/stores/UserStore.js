var Fluxxor = require('fluxxor'),
    consts  = require('../constants/const');

var UserStore = Fluxxor.createStore({
  initialize: function() {
    this.loggedin = false;
    this.jwt = null;
    this.bindActions(
        consts.LOGIN_USER, this.loginUser,
        consts.LOGOUT_User, this.logoutUser
    );

  },

  loginUser: function(payload) {
    this.loggedin = true;
    this.jwt = payload.jwt;
    this.emit("change");
  },

  logoutUser: function() {
    this.loggedin = false;
    this.jwt = null;
    this.emit("change");
  }

  getState: function() {
    return { loggedin : this.loggedin, jwt: this.jwt, jwt_decode: this.jwt_decode };
  }
});

module.exports = UserStore;
