var Fluxxor = require('Fluxxor'),
    consts  = require('../constants/const');

var UserStore = Fluxxor.createStore({
  initialize: function() {
    this.loggedin = false;

    this.bindActions(
        consts.LOGIN_USER, this.loginUser
    );

  },

  loginUser: function(payload) {
    this.loggedin = true;
    this.emit("change");
  },

  getState: function() {
    return { loggedin : this.loggedin };
  }
});

module.exports = UserStore;
