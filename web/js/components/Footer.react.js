var React = require('react')
;

var Footer = React.createClass({
  render: function() {
      var style = {
          position:'fixed',
          bottom:0,
          width:'100%'
      };
    return (
      <div style={style} className="footer l-box is-center">
        Too Many Cooks will spoil the B.R.O.T.H.
      </div>
    );
  }
});

module.exports = Footer;
