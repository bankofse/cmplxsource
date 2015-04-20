var React = require('react/addons'),
    Fluxxor = require('fluxxor'),
    FluxMixin = Fluxxor.FluxMixin(React)
;

var NavigationBar = React.createClass({

    mixins: [FluxMixin],

    getInitialState: function() {
      return {};
    },

    getStateFromFlux: function () {
      return { user : this.getFlux().store("UserStore").getState() };
    },

    render: function() {

      var flex = {
        "display": "flex",
        "flex-direction": "row",
        "flex-grow": 4
      }

      var login = {
        "display": "flex",
        "flex-direction": "row",
        "justify-content": "flex-end",
      }

      var logo = {
        "display": "flex",
        "flex-direction": "row",
        "justify-content": "flex-start",
      }

      return (
        <div className="menu">
          <div className="header">
            <div className="home-menu pure-menu pure-menu-open pure-menu-horizontal pure-menu-fixed" style={flex}>
              <a href="" className="pure-menu-heading" style={logo}>
                <img src="/images/Cmplx.svg" className="pure-menu-heading" width="250px" />
              </a>
              <div style={login}>
                <a className="pure-button pure-button-primary" href="#">Login</a>
              </div>
            </div>
          </div>
        </div>
      );
    }
});

module.exports = NavigationBar;
