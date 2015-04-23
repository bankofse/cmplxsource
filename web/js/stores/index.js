var UserStore = require("./UserStore");
var AccountStore = require("./AccountStore");
var AccountsStore = require("./AccountsStore");

module.exports = {
	UserStore: new UserStore(),
  AccountStore: new AccountStore(),
  AccountsStore: new AccountsStore()
}
