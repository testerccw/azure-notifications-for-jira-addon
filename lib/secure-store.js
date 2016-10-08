var config = require('nconf');
var KeyVault = require('azure-keyvault');
var AuthenticationContext = require('adal-node').AuthenticationContext;
var debug = require('debug')('azure-notifications-addon:secure-store');

var clientId = config.get('azure:keyVault:clientId');
var clientSecret = config.get('azure:keyVault:clientSecret');
var vaultUri = config.get('azure:keyVault:vaultUri');

module.exports = {

  client: function() {
    var authenticator = function (challenge, callback) {
      var context = new AuthenticationContext(challenge.authorization);

      return context.acquireTokenWithClientCredentials(challenge.resource, clientId, clientSecret, function (err, tokenResponse) {
        if (err) throw err;
        var authorizationValue = tokenResponse.tokenType + ' ' + tokenResponse.accessToken;
        return callback(null, authorizationValue);
      });
    };
    var credentials = new KeyVault.KeyVaultCredentials(authenticator);
    var client = new KeyVault.KeyVaultClient(credentials);

    return client;
  },

  get: function(client, id, callback) {
    client.getSecret(vaultUri + "/secrets/" + id, function (error, secret) {
      if (error) {
        debug(error);
        callback(error, null);
        return;
      }

      debug("Secret '" + id + "' retrieved.");
      callback(null, secret.value);
    });
  },

  set: function(client, id, value, callback) {
    client.setSecret(vaultUri, id, value, function (error) {
      if (error) {
        debug(error);
        callback(error);
        return;
      }
      
      debug("Secret '" + id + "' created.");
      callback(null);
    });
  },

  update: function() {
    // Not implemented
  },

  delete: function(client, id, callback) {
    client.deleteSecret(vaultUri, id, function(error) {
      if (error) {
        debug(error);
        callback(error);
        return;
      }
       
      debug("Secret '" + id + "' deleted.");
      callback(null);
    });
  }

};
