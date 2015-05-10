"use strict";

var Fluxxor = require('fluxxor'),
    consts  = require('../constants/const'),
    rest    = require('rest'),
    mime    = require('rest/interceptor/mime'),
    csrf    = require('rest/interceptor/csrf'),
    defaultRequest = require('rest/interceptor/defaultRequest')
;

const AUTHKEY = "auth-token";

var AccountsStore = Fluxxor.createStore({
    initialize: function() {
      this.bindActions(
        consts.LOGIN_USER_COMPLETE, this.initOnLogin,
        consts.HASH_CHANGE, this.getAccounts 
      );        

      this.client = rest.wrap(defaultRequest, {
        method: "GET",
        headers: {
          token: localStorage.getItem(AUTHKEY)
        }
      });

      this.mon_accts = [];
      this.getAccounts();
    },

    initOnLogin: function(payload, type) {
      this.waitFor(["UserStore"], function(UserStore) {
        if(UserStore.getState().loggedin) {
          console.log("AccountsStore waited for UserStore success");
          this.getAccounts();
        } else {
          console.log("AccountsStore waited for UserStore failure");
        }
      });
    },

    getAccounts: function() {
      this.client({
        path: "/account"
      })
      .then(function (response) {
        switch(response.status.code) {
          case 200:
            this.mon_accts = JSON.parse(response.entity).accounts;
            this.emit("change");
            break;

          default:
            console.log("Error viewing accounts");
        }
      }.bind(this))
      .catch(function (err) {
        console.log("ERROR", err);
      });
    },

    getState: function() {
      return this.mon_accts;
    }

});

module.exports = AccountsStore;
