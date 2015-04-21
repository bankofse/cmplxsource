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

      var links = [<li className="pure-menu-item"><a href="#/login" className="pure-menu-link">Sign In</a></li>]

      return (
        <div className="menu">
          <div className="header">
            <div className="home-menu pure-menu pure-menu-open pure-menu-horizontal pure-menu-fixed">
              <a href="" className="pure-menu-heading">
                <img src="/images/Cmplx.svg" className="pure-menu-heading" width="250px" />
              </a>
              <ul className="pure-menu-list">
                {links}
              </ul>
            </div>
          </div>
        </div>
      );
    }
});

module.exports = NavigationBar;
