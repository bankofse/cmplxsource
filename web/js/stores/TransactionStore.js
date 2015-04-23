var Fluxxor = require('fluxxor');
    //consts  = require('../constants/const');

var TransactionStore = Fluxxor.createStore({
  initialize: function() {
    

  },

  getState: function(id) {
    // Get account by Id
    var sample = [{"from":"1", "to":"6", "amount":45}, 
      {"from":"3", "to":"1", "amount":256},
      {"from":"5", "to":"1", "amount":120},
      {"from":"1", "to":"4", "amount":578}
      ];
    return sample;
  }
});

module.exports = TransactionStore;
