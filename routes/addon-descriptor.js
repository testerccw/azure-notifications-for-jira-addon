var fs = require('fs');
var config = require('nconf');
var validateAdminToken = require('../lib/middleware/validate-admintoken');
var util = require('util');
var debug = require('debug')('azure-notifications-addon:routes:addon-descriptor');

module.exports = function(app) {

  function buildAddOnDescriptor() {
    var content = fs.readFileSync('atlassian-connect.json', 'utf8');
    
    debug('Building add-on descriptor.');
    debug('jira:serverUrl -> ' + config.get('jira:serverUrl'));
    content = content.replace(/{{baseUrl}}/g, config.get('jira:serverUrl'));
    debug('addOn:adminToken -> ' + config.get('addOn:adminToken'));
    content = content.replace(/{{adminToken}}/g, config.get('addOn:adminToken'));

    var addOnDescriptor = JSON.parse(content);

    return addOnDescriptor;
  }

  //
  // Add-on descriptor routes
  //

  app.get('/atlassian-addon-descriptor',

    validateAdminToken(), 
    
    function(req, res, next) {
      res.charset = 'UTF-8';
      res.json(buildAddOnDescriptor());
    }
  );

}