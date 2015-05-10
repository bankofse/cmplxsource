"use strict";

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

    mixins: [FluxMixin, StoreWatchMixin("UserStore", "AccountsStore")],

    getInitialState: function() {
        this.toAccountIdx = 0;
        this.fromAccountIdx = 0;
        return {};
    },

    getStateFromFlux: function () {
        var flux = this.getFlux();
        return { 
            user : flux.store("UserStore").getState(),
            acct : flux.store("AccountsStore").getState()
        };
    },

    transfer: function () {
        if (!this.amount) return;
        this.getFlux().actions.makeInternalTransfer(this.state.acct[this.toAccountIdx], this.state.acct[this.fromAccountIdx], this.amount);
    },

    onChange (e) {
        switch(e.target.id) {
            case "from":
                this.fromAccountIdx = e.target.value;
                break;
            case "to":
                this.toAccountIdx = e.target.value;
                break;
            case "amount":
                this.amount = parseFloat(e.target.value);
                break;
        }
    },

    render: function() {
        var topMargin = {
            marginTop:'50px'
        }
        var headerText = {
            color:'#575757',
            marginBottom:0
        }

        var accounts = this.state.acct.map(function (a, i) {
            console.dir(a)
            return (<option value={i} key={i} >Account {a.account_number} | {a.amount}{a.currency_code}</option>)
        });


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
                                <select id='from' onChange={this.onChange}>
                                    {accounts}
                                </select>
                                <h4 style={headerText}>To</h4>
                                <select id='to' onChange={this.onChange}>
                                    {accounts}
                                </select>
                                <h4 style={headerText}>Amount</h4>
                                <input type="text" placeholder="$" id='amount' onChange={this.onChange}/>
                                <br />
                                <br />
                                <input type="button" value="Transfer" className="button-secondary pure-button" onClick={this.transfer} />
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
