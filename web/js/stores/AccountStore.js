var Fluxxor = require('fluxxor');
    //consts  = require('../constants/const');

var AccountStore = Fluxxor.createStore({
  initialize: function() {
    

  },

  getAccount: function(id) {
    // Get account by Id
    var sample = {"user_id":1,"account_number":1,"card_number":null,"amount":100};
    return sample;
  }
});

module.exports = AccountStore;
