var request = require('reqwest'),
    when = require('when'),
    consts  = require('../constants/const'),
    LoginActions = require('../actions/userActions');

module.exports = {

  login: function(username, password) {
    return this.handleAuth(when(request({
      url: LOGIN_URL,
      method: 'POST',
      crossOrigin: true,
      type: 'json',
      data: {
        user, pass
      }
    })));
  },

  logout: function() {
    LoginActions.logoutUser();
  },

  signup: function(username, password) {
    return this.handleAuth(when(request({
      url: SIGNUP_URL,
      method: 'POST',
      crossOrigin: true,
      type: 'json',
      data: {
        user, pass
      }
    })));
  },

  handleAuth: function(loginPromise) {
    return loginPromise
      .then(function(response) {
        var jwt = response.id_token;
        LoginActions.loginUser(jwt);
        return true;
      });
  }
}