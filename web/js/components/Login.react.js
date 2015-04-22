
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
    Auth = require('../services/AuthService')
;

var CmplxHome = React.createClass({

  mixins: [FluxMixin],

  getInitialState: function() {
    return {
      user: {loggedin: false},
      username: '',
      password: ''
    };
  },

  getStateFromFlux: function () {
    var flux = this.getFlux();
    return { 
      user : flux.store("UserStore").getState()
    };
  },

  render: function() {
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
                <img src="/images/Cmplx_logo_no_text_shadow.svg" className=""/>
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
    this.state.username = event.target.value;
  },

  onChgPass(event) {
    this.state.password = event.target.value;
  },

  login(e) {
    e.preventDefault();
    console.log(
      "username: " + this.state.username + " " +
      "password: " + this.state.password);

    Auth.login(this.state.username, this.state.password)
      .catch(function(err) {
        alert("Problem logging in!");
        console.log("Problem logging in!");
      });
  }

});

module.exports = CmplxHome;
