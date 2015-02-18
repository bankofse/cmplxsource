'use strict';

var Sequelize = require('sequelize');

let host = process.env.MYSQL_PORT_3306_TCP_ADDR;
let port = process.env.MYSQL_PORT_3306_TCP_PORT;
var seq = new Sequelize('mysql://' + host + ':' + port + '/app_users', 'root', 'alpine');



module.exports = seq;

