var Router = require('react-router'),
    AppDispatcher = require('../dispatcher/Dispatcher.js'),
    consts  = require('../constants/const');

module.exports =  {
  loginUser: function(jwt) {
    Router.get().transitionTo('/');
    localStorage.setItem('jwt', jwt);
    AppDispatcher.dispatch({
      actionType: LOGIN_USER,
      jwt: jwt
    });
  },

  logoutUser: function() {
    Router.get().transitionTo('/login');
    AppDispatcher.dispatch({
      actionType: LOGOUT_USER
    });
  }
}
