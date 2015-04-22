var React = require('react/addons'),
    Fluxxor = require('fluxxor'),
    FluxMixin = Fluxxor.FluxMixin(React),
    Router = require('react-router'),
    DefaultRoute = Router.DefaultRoute,
    Link = Router.Link,
    Route = Router.Route,
    RouteHandler = Router.RouteHandler,
    StoreWatchMixin = Fluxxor.StoreWatchMixin,
    Const = require('../constants/const.js')
;

/**
 * LoginButton: when not logged in, links to the login route.
 * when logged in, the button immediately logs you out.  
 *
 * LoginButton needs props for loggedIn:bool and flux:Fluxxor.Flux
 */
var LoginButton = React.createClass({
  render: function() {
    var css = "pure-button button-success";
    if(!this.props.loggedIn) {
      return (
        <Link to="login">
        <button className={css}>
          Sign In
        </button>     
        </Link>
      );
    } else {
      return (
        <button className={css} onClick={this.logout}>
          Sign Out
        </button>
      );
    }
  }, 
    
  logout: function() {
    console.log("logging out... I think");

    var Disp = this.props.flux.dispatcher;
    Disp.dispatch({type: Const.USER_LOGOUT, params: {}});
  }
});

var NavButton = React.createClass({
  render: function() {
    var css = "pure-button button-success";
    return (
      <Link to={this.props.to}>
        <button className={css}>
          {this.props.name}
        </button>
      </Link>
    );
  },
});

var NavigationBar = React.createClass({

  mixins: [FluxMixin, StoreWatchMixin("UserStore")],

  getInitialState: function() {
    return { };
  },
  
  getStateFromFlux: function () {
    return { user : this.getFlux().store("UserStore").getState() };
  },

  render: function() {
    var loggedIn = this.state.user.loggedin;
    return (
      <div className="menu">
        <div className="header">
          <div className="home-menu pure-menu pure-menu-open pure-menu-horizontal pure-menu-fixed">
            {/* Cmplx Logo */}
            <a href="" className="pure-menu-heading">
              <img src="/images/Cmplx.svg" className="pure-menu-heading" width="250px" />
            </a>
            {/* List of potential buttons. Right now, only LoginButton */}
            <ul className="pure-menu-list">
              <li className="pure-menu-item">
                <NavButton className="pure-menu-link" to="accounts" name="Accounts" />
              </li>
              <li className="pure-menu-item">
                <NavButton className="pure-menu-link" to="userhome" name="Transactions" />
              </li>
              <li className="pure-menu-item">
                <LoginButton className="pure-menu-link" loggedIn={loggedIn} flux={this.getFlux()} />
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = NavigationBar;
