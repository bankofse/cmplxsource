var Fluxxor = require('fluxxor');
    //consts  = require('../constants/const');

var AccountsStore = Fluxxor.createStore({
    initialize: function() {
        
    },
    
    getAccounts: function(){
        //get all accounts for a certain user
        var sample = {"account_type":savings, "account_number":1, "balance":100};
        return sample;
    }
});

module.exports = AccountsStore;