var React = require('react')
;

var Footer = React.createClass({
  render: function() {
      var style = {
          marginTop:100
      };
    return (
      <div style={style} className="footer l-box is-center">
        Too Many Cooks will spoil the B.R.O.T.H.
      </div>
    );
  }
});

module.exports = Footer;
