
var React = require('react/addons'),
    NavigationBar = require('./NavigationBar.react'),
    CoverBanner = require('./CoverBanner.react'),
    MediaBox = require('./MediaBox.react'),
    Footer = require('./Footer.react'),
    Fluxxor = require('fluxxor'),
    FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin,
    Router = require('react-router'),
    Link = Router.Link,
    Const = require('../constants/const')
;

var CmplxHome = React.createClass({

  mixins: [FluxMixin, StoreWatchMixin("UserStore")],

  getInitialState: function() {
    return {};
  },

  getStateFromFlux: function () {
    var flux = this.getFlux();
    console.log('change!');
    return { 
      user : flux.store("UserStore").getState()
    };
  },

  render: function() {
    var user = this.state.user;

    // If a login attempt (causing this re-render) passed, then redirect
    if(user.loggedin) {
      window.location.hash = "home";
    }

    // If a login attempt (causing this re-render) failed, notify the user
    var failed = user.loginfailed;
    var substy = React.addons.classSet({
      "login-start": !failed,
      "login-fail": failed,
      "pure-button": true
    });
    var subtxt = (failed) ? "Try Again" : "Sign In";

    console.log("Re render")
    return (
      <div className="chatapp">
        <NavigationBar />
        <div className="CoverBanner">
          <div className="splash-container">
            <div className="splash">
              <div className="login">
                <form className="pure-form pure-form-stacked">
                  <input type="text" id="username" placeholder="Username" onChange={this.onChgUser} />
                  <input type="password" id="password" placeholder="Password" onChange={this.onChgPass} />
                  <button type="submit" className={substy} onClick={this.login.bind(this)}>{subtxt}</button>
                </form>
                <img src="/images/Cmplx_logo_no_text_shadow.svg" className="imgrot"/>
		<div>{this.state.user.loggedin}</div>
              </div>
            </div>
            <p className="splash-subhead">Welcome to The Kitchen</p>
            </div>
        </div>
        <div className="content-wrapper">
          <Footer />
        </div>
      </div>
    );
  },

  onChgUser(event) {
    this.username = event.target.value;
  },

  onChgPass(event) {
    this.password = event.target.value;
  },

  login(e) {
    e.preventDefault();
    var u = this.username;
    var p = this.password;
    console.log("username: " + u + " password: " + p);

    this.getFlux().actions.login(u, p);
    
  }

});

module.exports = CmplxHome;
