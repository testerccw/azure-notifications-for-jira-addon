var config = require('nconf');
var debug = require('debug')('azure-notifications-addon:middleware:validate-sendtoken');

module.exports = function() {

  return function (req, res, next) {

    debug('From config (addOn:sendToken): ' + config.get('addOn:sendToken'));
    debug('From request: ' + req.query.token);

    if ((req.query.token) != config.get('addOn:sendToken')) {
      debug('Send token incorrect - sending a 401 Unauthorized.');
      res.sendStatus(401);
      return;
    }

    debug('Send token valid - continuing ...');
    next();
  }

}