
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
    Route = Router.Route,
    RouteHandler = Router.RouteHandler
;

var CmplxHome = React.createClass({

  mixins: [FluxMixin],

  getInitialState: function() {
    return {};
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
                  <input type="text" placeholder="Username" />
                  <input type="password" placeholder="Password" />
                  <button className="pure-button button-success">Sign In</button>
                </form>
                <img src="/images/Cmplx_logo_no_text_shadow.svg" className=""/>
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
  }

});

module.exports = CmplxHome;
