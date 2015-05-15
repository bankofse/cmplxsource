
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

  mixins: [FluxMixin, StoreWatchMixin("UserStore")],

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
        <CoverBanner />
        <div className="content-wrapper">
          <div className="content">
            <div className="pure-g">
              <MediaBox header="Get Started Quickly" body="Or at least be ready when we open our doors. Talk to a teller and give us your money for exchange in a back you can't use in the real world." />
              <MediaBox header="Responsive Layouts" body="This page may or may not work on your phone. We haven't tested that yet. We just assume there's probably a javascript library for that." />
              <MediaBox header="Modular" body="The backend is really modular and nice, I personally am a big fan. You can too!" />
              <MediaBox header="Plays Nice" body="By using our own currency, octothorpes, and running on a offshore server bank, we avoid regulations that would otherwise slow us down." />
            </div>
          </div>
          <div className="ribbon l-box-lrg pure-g">
              <div className="l-box-lrg is-center pure-u-1 pure-u-md-1-2 pure-u-lg-2-5">
                <img alt="File Icons" src="/images/Cmplx_logo_no_text.svg" className="pure-img-responsive imgrot" width="150" />
              </div>
              <div className="pure-u-1 pure-u-md-1-2 pure-u-lg-3-5">
                <h2 className="content-head content-head-ribbon">What is this?</h2>
                <p>That's a very important question and I'm glad you asked. This bank is a project being developed by a group of
                  Software Engineering students at RIT for their Enterprise class, so disclaimer, if you give us money
                don't ever expect to see it ever again. It's gone. But we won't stop you from doing so.</p>
              </div>
            </div>
          <Footer />
        </div>
      </div>
    );
  }

});

module.exports = CmplxHome;
