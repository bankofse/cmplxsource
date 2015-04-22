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
 * LogButton: when not logged in, links to the login route.
 * when logged in, the button immediately logs you out.  
 *
 * LogButton needs props for loggedIn:bool and flux:Fluxxor.Flux
 */
var LogButton = React.createClass({
  render: function() {
    var css = "pure-button button-success pure-menu-link";
    if(!this.props.loggedIn) {
      return (
        <li className="pure-menu-item">
          <Link to="login" >
          <button className={css}>
            Sign In
          </button>     
          </Link>
        </li>
      );
    } else {
      return (
        <li className="pure-menu-item">
          <button className={css} onClick={this.logout}>
            Sign Out
          </button>
        </li>
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
    var bsty = React.addons.classSet({
      "pure-button": true,
      "cant-nav": !this.props.loggedIn
    });
    if(this.props.loggedIn) {
      return (
        <li className="pure-menu-item">
          <Link className="" to={this.props.to}>
          <button className={bsty}>
            {this.props.name}
          </button>
          </Link>
        </li>
      )
    } else {
      return (
        <li className="pure-menu-item">
          <button className={bsty} disabled>
            {this.props.name}
          </button> 
        </li>
      )
    } 
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
            {/* List of potential buttons. Right now, only LogButton */}
            <ul className="pure-menu-list">
              <NavButton loggedIn={loggedIn} to="accounts" name="Accounts" />
              <NavButton loggedIn={loggedIn} to="userhome" name="Transactions" />
              <LogButton loggedIn={loggedIn} flux={this.getFlux()} />
            </ul>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = NavigationBar;
