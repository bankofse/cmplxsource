
var React  = require('react'),
    CmplxHome = require('./components/CmplxHome.react'),
    CmplxTransactions = require('./components/CmplxTransactions.react'),
    CmplxAccount = require('./components/CmplxAccount.react'),
    CmplxAccounts = require('./components/CmplxAccounts.react'),
    NavigationBar = require('./components/NavigationBar.react'),
    Login = require('./components/Login.react'),
    Fluxxor = require('fluxxor'),
    Router = require('react-router'),
    DefaultRoute = Router.DefaultRoute,
    Link = Router.Link,
    Route = Router.Route,
    RouteHandler = Router.RouteHandler
;

var flux = new Fluxxor.Flux(require("./stores"), require('./actions'));

window.flux = flux;
window.React = React;

var routes = (
  <Route>
    <Route name="home" path="/" handler={CmplxHome} />
    <Route name="userhome" path="/home" handler={CmplxTransactions} />
    <Route name="login" path="/login" handler={Login} />
    <Route name="account" path="/account/:id" handler={CmplxAccount} />
    <Route name="accounts" path="/accounts" handler={CmplxAccounts} />
  </Route>
);

Router.run(routes, function (Handler) {
  React.render(<Handler flux={flux}/>, document.getElementById('react'));
});
