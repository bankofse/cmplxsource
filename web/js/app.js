
var React  = require('react'),
    CmplxHome = require('./components/CmplxHome.react'),
    CmplxTransactions = require('./components/CmplxTransactions.react'),
    NavigationBar = require('./components/NavigationBar.react'),
    Fluxxor = require('fluxxor'),
    Router = require('react-router'),
    DefaultRoute = Router.DefaultRoute,
    Link = Router.Link,
    Route = Router.Route,
    RouteHandler = Router.RouteHandler
;

var flux = new Fluxxor.Flux(require("./stores"), {});

window.flux = flux;
window.React = React;

var routes = (
  <Route>
    <Route name="home" path="/" handler={CmplxHome} />
    <Route name="userhome" path="/home" handler={CmplxTransactions} />
  </Route>
);

Router.run(routes, function (Handler) {
  React.render(<Handler flux={flux}/>, document.getElementById('react'));
});
