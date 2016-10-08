var config = require('nconf');
var validateAdminToken = require('../lib/middleware/validate-admintoken');
var validateInstallation = require('../lib/middleware/validate-installation');
var secureStore = require('../lib/secure-store');
var debug = require('debug')('azure-notifications-addon:routes:addon-lifecycle');

module.exports = function(app) {
  
  function buildStorageKey(settings) {
    return settings ? settings.productType : 'jira';
  }

  //
  // Add-on lifecycle routes
  //

  app.post('/add-on/installed', 
  
    validateAdminToken(), 

    validateInstallation(),
            
    function(req, res, next) {
      debug('Add-on installed');

      var settings = req.body;
      var key = buildStorageKey(settings);
      var value = JSON.stringify(settings);

      secureStore.get(secureStore.client(), key, function(error, value) {
        if (error) {
          debug("No existing secure store settings found for " + settings.clientKey);
          var value = JSON.stringify(settings);
          secureStore.set(secureStore.client(), key, value, function(error) {
            if (error) {
              debug(error);
              res.sendStatus(401);
            } else {
              debug("Saved " + key + " settings for " + settings.clientKey + " to secure store.");
              res.sendStatus(204);
            }
          });
        } else {
          debug("Warning: Secure store settings for " + settings.clientKey + " already exist.");
          res.sendStatus(204);
        }        
      });
    }
  );

  app.post('/add-on/uninstalled', 
    
    validateAdminToken(), 
    
    function(req, res, next) {
      debug('Add-on uninstalled');

      var settings = req.body;
      var key = buildStorageKey(settings);

      secureStore.delete(secureStore.client(), key, function(error) {
        if (error) {
          debug(error);
        }
        res.sendStatus(204);
      });
    }
  );

}
