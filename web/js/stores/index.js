var UserStore = require("./UserStore");
var TransactionStore = require("./TransactionStore");
var AccountsStore = require("./AccountsStore");

module.exports = {
	UserStore: new UserStore(),
  TransactionStore: new TransactionStore(),
  AccountsStore: new AccountsStore()
}
