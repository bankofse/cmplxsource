var React = require('react/addons'),
    Fluxxor = require('fluxxor'),
    FluxMixin = Fluxxor.FluxMixin(React),
    Router = require('react-router'),
    DefaultRoute = Router.DefaultRoute,
    Link = Router.Link,
    Route = Router.Route,
    RouteHandler = Router.RouteHandler
;

var LoginButton = React.createClass({
    render: function() {
        /*var note;
        if(!this.props.loggedIn) {
          note = "Sign In";
        } else {
          note = "Sign Out";
        }*/
        var note = (!this.props.loggedIn) ? "Sign In" : "Sign Out";
        return (
          <Link to="login">
	    <button className="pure-button button-success">
                {note}
            </button>
          </Link>
        );
    }
});

var NavigationBar = React.createClass({

    mixins: [FluxMixin],

    getInitialState: function() {
      return { user : this.getFlux().store("UserStore").getState() };
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
              <ul className="pure-menu-list">
                <li className="pure-menu-item">
                  <LoginButton className="pure-menu-link" loggedIn={this.state.user.loggedin} />
                </li>
              </ul>
            </div>
          </div>
        </div>
      );
    }
});

module.exports = NavigationBar;
