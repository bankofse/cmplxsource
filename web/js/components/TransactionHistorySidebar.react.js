var React           = require('react/addons'),
	TransactionItem = require('./TransactionItemSB.react')
;

var TransactionHistorySidebar = React.createClass({
	render: function() {
		return (
			<div className="sidebar">
              	<TransactionItem amount='100.00' credit={true} />
              	<TransactionItem amount='1.30' credit={false} />
              	<TransactionItem amount='34.05' credit={true} />
              	<TransactionItem amount='34.05' credit={true} />
              	<TransactionItem amount='34.05' credit={true} />
              	<TransactionItem amount='34.05' credit={true} />
              	<TransactionItem amount='34.05' credit={true} />
              	<TransactionItem amount='34.05' credit={true} />
              	<TransactionItem amount='34.05' credit={true} />
              	<TransactionItem amount='34.05' credit={true} />
              	<TransactionItem amount='34.05' credit={true} />
              	<TransactionItem amount='34.05' credit={true} />
            </div>
		);
	}
});

module.exports = TransactionHistorySidebar;
