var Router = require('react-router'),
    AppDispatcher = require('../dispatcher/Dispatcher.js'),
    consts  = require('../constants/const');

export default {
  loginUser: (jwt) => {
    Router.get().transitionTo('/');
    localStorage.setItem('jwt', jwt);
    AppDispatcher.dispatch({
      actionType: LOGIN_USER,
      jwt: jwt
    });
  },
  logoutUser: () => {
    Router.get().transitionTo('/login');
    localStorage.removeItem('jwt');
    AppDispatcher.dispatch({
      actionType: LOGOUT_USER
    });
  }
}