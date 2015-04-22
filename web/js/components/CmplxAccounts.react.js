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

var CmplxAccounts = React.createClass({

  mixins: [FluxMixin],

 

  getInitialState: function () {
    var flux = this.getFlux();
    return { 
      accounts : [
          {"account_type":"savings", "account_number":1, "balance":100},
          {"account_type":"checking", "account_number":2, "balance":2000},
          {"account_type":"checking", "account_number":3, "balance":59}]  

    }
  },

                   

render:function() {
      var greyText = {
        color:'#575757',
        marginTop:0
      };
      var valueText = {
        color:'#575757',
        paddingLeft:75
      };
      
      var accountsArray = this.state.accounts.map(function (e) {
           return (
              <tr>
                <td style={valueText}>{e.account_type}</td>
                <td style={valueText}>{e.account_number}</td>
                <td style={valueText}>{e.balance}</td>
                <td style={valueText}>
                  <Link to="/account/:id" params={{id:e.account_number}}>
                    <input type="button" className="button-secondary pure-button" value="History" />
                  </Link>
                </td>
              </tr>
            );
       });
      
    return (
 
      <div className="chatapp">
        <NavigationBar />
            <div className="padded-content">
              <div className="pure-u-md-3-4 padded-content"></div>
              <div className="pure-u-md-1-4 pure-u-sm-1 padded-content">   
              </div>
              <div className="pure-u-md-1-4 padded-content"></div>
              <div className="pure-u-md-3-4 pure-u-sm-1 padded-content">
                <table class="pure-table">
                  <thead>
                    <tr>
                      <td><h4 style={greyText}>Account Type</h4></td>
                      <td><h4 style={greyText}>Account Number</h4></td>
                      <td><h4 style={greyText}>Balance</h4></td>  
                    </tr>
                  </thead>
                  <tbody>
                    {accountsArray}
                  </tbody>
                </table>
              </div>
            </div>
        <Footer />
      </div>
    );
  },

  accountHistory(e, id) {
    e.preventDefault();
    console.log(id);
    //this.getFlux().dispatcher({type: Const.ACCOUNT_HISTORY, payload: {accountNumber: this.accountNumber}});
  }

});

module.exports = CmplxAccounts;
