'use strict';

var Waterline = require('waterline'),
	mysql     = require('sails-mysql')
;

let config = {
  adapters: {
    'default': mysql,
     mysql: mysql
  },
  connections: {
    mysql: require('../config/config').mysql
  },
  defaults: {
    migrate: 'alter'
  }
};

let orm = new Waterline();

let Transaction = Waterline.Collection.extend({
  identity: 'transaction',
  connection: 'mysql',
  attributes: {
    amount: {
      type: 'float',
      required: true
    },
    to_account: {
      type: 'string',
      required: true,
    },
    from_account: {
      type: 'string',
      required: true,
    }
  },
});

orm.loadCollection(Transaction);

module.exports = {
	orm : orm,
	config : config
};
