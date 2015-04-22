
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
                  <button type="submit" className="pure-button button-success" onClick={this.login.bind(this)}>Sign In</button>
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

    var Disp = this.getFlux().dispatcher;
    Disp.dispatch({type: Const.LOGIN_USER, payload: {user: u, pass: p}});
  }

});

module.exports = CmplxHome;
