var config = require('nconf');
var _ = require('lodash');
var debug = require('debug')('azure-notifications-addon:middleware:validate-installation');

module.exports = function() {

  return function (req, res, next) {

    var settings = req.body;
    if (!settings || !_.isObject(settings)) {
      debug('Invalid settings - sending a 401 Unauthorized.');
      res.sendStatus(401);
      return;
    }

    var baseUrl = settings.baseUrl;
    var clientKey = settings.clientKey;
    if (!clientKey) {
      debug('No client key provided for host at ' + baseUrl + '.');
      res.sendStatus(401);
      return;
    }

    debug('Add-on installation details valid - continuing ...');
    next();
  }

}