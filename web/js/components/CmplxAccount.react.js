
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

var CmplxAccount = React.createClass({

  mixins: [FluxMixin, StoreWatchMixin("AccountStore")],

  getInitialState: function() {
    return {};
  },

  getStateFromFlux: function () {
    var flux = this.getFlux();
    return { 
      account : {"user_id":1,"account_number":1,"card_number":56773445,"amount":100}
    };
  },

  render: function() {
      var greyText = {
        color:'#575757',
        marginTop:0
      };
      var valueText = {
        color:'#575757',
        paddingLeft:75,
        paddingTop:0
      };
      var secondaryButton = {
          color: 'white',
          borderRadius: 6,
          padding: '0.5em 2em',
          marginRight: 15,
          background: 'rgb(66, 184, 221)' /* this is a light blue */
      };
    return (
 
      <div className="chatapp">
        <NavigationBar />
            <div className="padded-content">  
              <div className="pure-u-md-2-4 pure-u-sm-1-2 padded-content">
                <table>
                  <tr>
                    <td><h4 style={greyText}>User Id</h4></td>
                    <td style={valueText}>{this.state.account.user_id}</td>
                  </tr>
                  <tr>
                    <td><h4 style={greyText}>Account Number</h4></td>
                    <td style={valueText}>{this.state.account.account_number}</td>
                  </tr>
                  <tr>
                    <td><h4 style={greyText}>Card Number</h4></td> 
                    <td style={valueText}>{this.state.account.card_number}</td>
                  </tr>
                  <tr>
                    <td><h4 style={greyText}>Balance</h4></td>
                    <td style={valueText}>{this.state.account.amount}</td>
                  </tr>
                </table>
              </div>
              <div className="pure-u-dm-2-4 pure-u-sm-1-2 padded-content">????</div>
            </div>
        <Footer />
      </div>
    );
  }

});

module.exports = CmplxAccount;
