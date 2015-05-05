"use strict";

var Fluxxor = require('fluxxor'),
    consts  = require('../constants/const'),
    rest    = require('rest'),
    mime    = require('rest/interceptor/mime'),
    csrf    = require('rest/interceptor/csrf'),
    defaultRequest = require('rest/interceptor/defaultRequest')
;

const AUTHKEY = "auth-token";

var isDefined = function(topObj, propertyPath) {
    var props = propertyPath.split('.');
    for (var i=0; i<props.length; i++) {
        var prp = props[i],
            val = topObj[prp];
        if (typeof val === 'undefined') {
            return false;
        } else if (val === null) {
            return i === props.length-1;
        } else {
            topObj = val;
        }
    }
    return true;
}


var UserStore  = Fluxxor.createStore({

  initialize: function() {
    this.bindActions(
      consts.LOGIN_USER, this.loginUser,
      consts.LOGOUT_USER, this.logoutUser
    ); 
    this.loggedin = false;

    this.client = rest.wrap(defaultRequest, {
      method: "GET",
      headers: {
        token: localStorage.getItem(AUTHKEY)
      }
    });


    this.client({
      path: "/user/"
    })
    .then(function (response) {
      switch(response.status.code) {

        case 200:
          this.loggedin = true;
          console.log("Logged In");
          this.userinfo = JSON.parse(response.entity);
          this.emit("change");
          break;

        default:
          console.log("Not logged in");

      }
    }.bind(this))
    .catch(function (err) {
      console.log("ERROR", err);
    });

  },

  loginUser: function(payload) {
    console.log("Loggin in user", payload);
    rest.wrap(mime, { mime: 'application/json' })({
      path: "/auth",
      method: "POST",
      entity: payload
    })
    .then(function (response) {
      switch(response.status.code) {

        case 200:
          this.loggedin = true;
          localStorage.setItem(AUTHKEY, response.entity.token);
          this.emit("change");
          break;

        default:
          console.log("Not logged in")
          this.emit("change");

      }
    }.bind(this));

  },

  logoutUser: function() {
    this.loggedin = false;
    localStorage.removeItem(AUTHKEY);
    this.emit("change");
  },

  getState: function() {
    var username = "";
    if (isDefined(this, "userinfo.body.username")) {
      username = this.userinfo.body.username;
    }
    return { loggedin : this.loggedin, username : username };
  }

});

module.exports = UserStore;
