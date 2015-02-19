'use strict';

var Waterline = require('waterline'),
    bcrypt    = require('bcrypt')
;

var orm = new Waterline();

var User = Waterline.Collection.extend({

  identity: 'user',
  connection: 'memory',

  attributes: {

    username: {
      type: 'string',
      required: true,
      unique: true
    },

    password: {
      type: 'string',
      minLength: 6,
      required: true,
      columnName: 'encrypted_password'
    }

  },

  // Lifecycle Callbacks
  beforeCreate: function(values, next) {
    bcrypt.hash(values.password, 10, function(err, hash) {
      if(err) return next(err);
      values.password = hash;
      next();
    });
  }
});

orm.loadCollection(User);

module.exports = orm;
