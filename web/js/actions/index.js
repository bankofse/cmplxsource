"use strict";

var consts = require('../constants/const'),
  rest = require('rest'),
  mime = require('rest/interceptor/mime'),
  csrf = require('rest/interceptor/csrf'),
  defaultRequest = require('rest/interceptor/defaultRequest'),
  Router = require('react-router')
;

window.onhashchange = function(e) {
  console.log("Poke")
  window.flux.dispatcher.dispatch({
    type: consts.HASH_CHANGE,
    payload: e
  });
}

module.exports = {

  login(user, pass) {
      this.dispatch(consts.LOGIN_USER, {
        user, pass
      });
    },

    login_complete() {
      this.dispatch(consts.LOGIN_USER_COMPLETE, {});
    },

    logout() {
      this.dispatch(consts.LOGOUT_USER, {});
    },

    makeInternalTransfer(to, from, amount) {
      console.log(to, from, amount)
      rest.wrap(mime, {
          mime: 'application/json'
        })({
          path: "/transactions/create",
          method: "POST",
          entity: {
            "account": from.account_number,
            "deposit_to": to.account_number,
            "amount": amount,
            "description": "Internal Transfer"
          },
          headers: {
            token: localStorage.getItem("auth-token")
          }
        })
        .then(function(response) {
          return rest.wrap(mime, {
            mime: 'application/json'
          })({
            path: "/transactions/complete/" + response.entity.tid,
            method: "POST",
            headers: {
              token: localStorage.getItem("auth-token")
            }
          })
        })
        .then(function(response) {
          location.replace("/#/accounts");
        })
        .catch(function(err) {
          console.log("ERROR");
          console.log(err);
        });
    }

}
