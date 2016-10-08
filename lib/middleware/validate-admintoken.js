var config = require('nconf');
var debug = require('debug')('azure-notifications-addon:middleware:validate-admintoken');

module.exports = function() {

  return function (req, res, next) {

    debug('From config (addOn:adminToken): ' + config.get('addOn:adminToken'));
    debug('From request: ' + req.query.token);

    if ((req.query.token) != config.get('addOn:adminToken')) {
      debug('Admin token incorrect - sending a 401 Unauthorized.');
      res.sendStatus(401);
      return;
    }

    debug('Admin token valid - continuing ...');
    next();
  }

}