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
    mysql: {
      adapter: 'mysql',
      database: 'transaction',
      host: '192.168.99.100',
      port: 32000,
      user: 'transaction',
      password: 'transaction'
    }
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
