var React = require('react');

var MediaBox = React.createClass({
	render: function() {

		var cx = React.addons.classSet;
		var classes = cx({
			"fa" : true,
			"fa-rocket" : true
		});

		return (
		  	<div className="l-box pure-u-1 pure-u-md-1-2 pure-u-lg-1-4">
                <h3 className="content-subhead">
                    <i className={classes}></i>
                    {this.props.header}
                </h3>
                <p>{this.props.body}</p>
            </div>
		);
	}
});

module.exports = MediaBox;
