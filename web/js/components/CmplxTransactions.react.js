
var React = require('react/addons'),
    NavigationBar = require('./NavigationBar.react'),
    Footer = require('./Footer.react'),
    TransactionHistorySidebar = require('./TransactionHistorySidebar.react'),
    Fluxxor = require('fluxxor'),
    FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin,
    Router = require('react-router'),
    Link = Router.Link,
    Route = Router.Route,
    RouteHandler = Router.RouteHandler
;

var CmplxTransactions = React.createClass({

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
          <div className="pure-g">
            <div className="pure-u-md-1-4 pure-u-sm-1">
              <TransactionHistorySidebar />
            </div>
            <div className="pure-u-md-3-4 pure-u-sm-1 padded-content">
              <h1>User Home Page</h1>
            </div>
          </div>
        <Footer />
      </div>
    );
  }

});

module.exports = CmplxTransactions;
