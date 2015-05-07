var React           = require('react/addons'),
	  TransactionItem = require('./TransactionItemSB.react'),
    Fluxxor = require('fluxxor'),
    FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin
;

var TransactionHistorySidebar = React.createClass({
	
  mixins: [FluxMixin, StoreWatchMixin("TransactionStore")],

  getInitialState: function() {
    return { };
  },

  getStateFromFlux: function () {
    var flux = this.getFlux();
    return {
      trans: flux.store("TransactionStore").getState()
    };
  },

  render: function() {
    var transactions = this.state.trans.map(function (t) {
      return (<TransactionItem account={t.account} amount={t.amount} credit={true} />)
    });
		return (
			<div className="sidebar">
        {transactions}
      </div>
		);
	}
});

module.exports = TransactionHistorySidebar;
