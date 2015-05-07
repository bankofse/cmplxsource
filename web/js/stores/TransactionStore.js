"use strict";

var Fluxxor = require('fluxxor'),
    consts  = require('../constants/const'),
    rest    = require('rest'),
    mime    = require('rest/interceptor/mime'),
    csrf    = require('rest/interceptor/csrf'),
    defaultRequest = require('rest/interceptor/defaultRequest')
;

const AUTHKEY = "auth-token";

var TransactionStore = Fluxxor.createStore({

  initialize: function() {
    this.bindActions(
      consts.LOGIN_USER_COMPLETE, this.initOnLogin // Init store data on login 
    );

    this.client = rest.wrap(defaultRequest, {
      method: "GET",
      headers: {
        token: localStorage.getItem(AUTHKEY)
      }
    });

    this.transactions = [];
  },

  initOnLogin: function(payload, type) {
    this.waitFor(["UserStore"], function(UserStore) {
      if(UserStore.getState().loggedin) {
        console.log("TransactionStore waited for UserStore success");
        this.getTransactions();
      } else {
        console.log("TransactionStore waited for UserStore failure");
      }
    });
  },

  getTransactions: function() {
    this.client({
      path: "/transactions"
    })
    .then(function (response) {
      switch(response.status.code) {
        case 200:
          this.transactions = JSON.parse(response.entity);
          this.emit("change");
          break;

        default:
          console.log("Error viewing transactions");
      }
    }.bind(this))
    .catch(function (err) {
      console.log("ERROR", err);
    });    
  },

  getState: function(mon_acct) {
    console.log("TransactionStore.getState()", mon_acct);

    var filtered = this.transactions.filter(function (el) {
      return el.from_account == mon_acct || 
             el.account == mon_acct; 
    }); 

    return filtered;
  }
});

module.exports = TransactionStore;
