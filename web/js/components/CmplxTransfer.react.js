
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

var CmplxTransfer = React.createClass({

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
        var topMargin = {
            marginTop:'50px'
        }
        var headerText = {
            color:'#575757',
            marginBottom:0
        }
        return (
          <div className="chatapp">
            <NavigationBar />
              <div className="pure-g">
                <div className="pure-u-md-3-4 pure-u-sm-1 padded-content" style={topMargin}>
                    <form class="pure-form">
                        <fieldset>
                            <h1 style={headerText}>Transfer Money</h1>
                            <br />
                            <h4 style={headerText}>From</h4>
                            <input type="text" placeholder="Account #" />
                            <h4 style={headerText}>To</h4>
                            <input type="text" placeholder="Account #" />
                            <h4 style={headerText}>Amount</h4>
                            <input type="text" placeholder="$" />
                                <br />
                                <br />
                                <input type="button" value="Transfer" className="button-secondary pure-button" />
                        </fieldset>
                    </form>
                </div>
              </div>
            <Footer />
          </div>
      );
    }

});

module.exports = CmplxTransfer;
