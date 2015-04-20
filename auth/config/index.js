// Consul Registration, consul will be asumed to be running locally
var consul = require('consul')();

module.exports = {

  accounts: function () {
    return new Promise(function (accept, reject) {
      consul.catalog.service.nodes({dc:'dc1', service: 'monitary-accounts-3000'},
        (err, result) => {
          if (err) { reject(err); return; }
          accept(result);
        })
    });
  },

  zk: function () {
    return new Promise(function (accept, reject) {
      accept('10.132.89.71:2181');
    });
  }

}
