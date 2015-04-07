var React = require('react/addons');

var TransactionItemSB = React.createClass({
	render: function() {
		var cx = React.addons.classSet;
		var classes = cx({
			"ti-amount" : true,
			credit: this.props.credit,
			debit: !this.props.credit,
		});

		return (
			<div className="transaction-item">
				<div className={classes}>
					# {this.props.amount}
				</div>
				
			</div>
		);
	}
});

module.exports = TransactionItemSB;
