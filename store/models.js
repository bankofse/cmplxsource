'use strict';

var Sequelize = require('sequelize');

var database   = 'user_auth'
var connection = process.env.POSTGRES_PORT_5432_TCP.replace('tcp', 'postgre');
var connectionString = connection + '/' + database;

console.log(env);

var seq = new Sequelize(connectionString, options);

console.log(seq)

var User = seq.define('User', {
  username: Sequelize.STRING,
  birthday: Sequelize.DATE
});

module.exports = seq;
