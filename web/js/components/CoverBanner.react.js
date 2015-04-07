var React = require('react');

var CoverBanner = React.createClass({
	render: function() {
		return (
			<div className="CoverBanner">
				<div className="splash-container">
					<div className="splash">
						<img src="/images/Cmplx_logo_no_text_shadow.svg" />
					</div>
					<p className="splash-subhead">Welcome to The Kitchen</p>
				</div>
			</div>
		);
	}
});

module.exports = CoverBanner;
