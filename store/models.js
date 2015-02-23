'use strict';

var Waterline = require('waterline')
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


});

orm.loadCollection(User);

module.exports = orm;
