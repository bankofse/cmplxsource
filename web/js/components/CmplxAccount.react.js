
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
    RouteHandler = Router.RouteHandler,
    sprintf = require("sprintf").sprintf
;

var CmplxAccount = React.createClass({

  mixins: [FluxMixin, StoreWatchMixin("TransactionStore")],

  getInitialState: function() {
    var flux = this.getFlux();
    return {};
  },

  getStateFromFlux: function () {
    var flux = this.getFlux();
    return { 
      account : {"user_id":1,"account_number":1,"card_number":56773445,"amount":100},
      trans: flux.store("TransactionStore").getState(0)
    };
  },

  createTransTable: function() {
    console.log("Test");
    var jsxTable = this.state.trans.map(function(e, i){
              return(
                  <tr className={(i % 2 === 0) ? "pure-table-odd": ""}>
                    <td>{("00000000" + parseInt(e.from)).slice(-8)}</td>
                    <td>{("00000000" + parseInt(e.to)).slice(-8)}</td>
                    <td>{sprintf("$%.2f", parseFloat(e.amount))}</td>
                  </tr>
                );
            });
    return(
      <table className="pure-table pure-table-bordered">
        <thead>
            <tr>
                <th>From</th>
                <th>To</th>
                <th>Amount</th> 
            </tr>
        </thead>

        <tbody>
            {jsxTable}
        </tbody>
      </table>
    );
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
      var marginTop = {
          marginTop:75
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
                  <h1 style={greyText}>Account</h1>
                      <br />
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
              <div className="pure-u-dm-2-4 pure-u-sm-1-2 padded-content" style={marginTop}>
                {console.log("Test 0")}
                {this.createTransTable()}
              </div>
            </div>
        <Footer />
      </div>
    );
  }

});

module.exports = CmplxAccount;
