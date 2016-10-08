var express = require('express');
var config = require('./lib/config');
var nconf = require('nconf');
var compression = require('compression');
var bodyParser = require('body-parser');
var hbs = require('express-hbs');
var logger = require('morgan');
var path = require('path');
var errorHandler = require('errorhandler');
var debug = require('debug')('azure-notifications-addon:application:setup');

process.env.PWD = process.env.PWD || process.cwd(); // Fix expiry on Windows
var expiry = require('static-expiry');

// Bootstrap Express
var app = express();
app.set('x-powered-by', false);

// Host environment
var node_env = app.get('env').trim();
var isDevEnv = node_env === 'development';
debug('Environment: ' + node_env);
debug('Development environment? ' + (isDevEnv ? 'yes' : 'no'));

// Enable compression
app.use(compression());

// Configure request parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Configure routes
var routes = require('./routes/index');

// Configure view engine
var viewsDir = path.join(__dirname, 'views');
app.engine('hbs', hbs.express4({ partialsDir: viewsDir }));
app.set('view engine', 'hbs');
app.set('views', viewsDir);

// Configure static content and enable fingerprinting for far future expires caching in production
// The order of the middleware and helper matters here so don't re-arrange
var staticDir = path.join(__dirname, 'public');
hbs.registerHelper('furl', function(url) { return app.locals.furl(url); });
app.use(expiry(app, {dir: staticDir, debug: isDevEnv}));
app.use(express.static(staticDir));

// Configure logger
app.use(logger(isDevEnv ? 'dev' : 'combined'));

// Bootstrap routes in routes folder
require('./routes')(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Show nicer errors when in dev mode
if (isDevEnv){
  app.use(errorHandler());
} else {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500).send('');
  });
}

module.exports = app;
