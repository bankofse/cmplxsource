var React = require('react'),
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

      return (
        <div className="menu">
          <div className="header">
            <div className="home-menu pure-menu pure-menu-open pure-menu-horizontal pure-menu-fixed">
              <a href="" className="pure-menu-heading">
                <img src="/images/Cmplx.svg" className="pure-menu-heading" width="250px" />
              </a>
            </div>
          </div>
        </div>
      );
    }
});

module.exports = NavigationBar;
