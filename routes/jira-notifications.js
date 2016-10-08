var util = require('util');
var config = require('nconf');
var validateSendToken = require('../lib/middleware/validate-sendtoken');
var secureStore = require('../lib/secure-store');
var HostRequest = require('../lib/host-request');
var payloadBuilder = require('../lib/jira/issue-payload-builder');
var debug = require('debug')('azure-notifications-addon:routes:jira-notifications');

module.exports = function(app) {

  //
  // JIRA notification routes
  //

  app.post('/notification/jira/:projectKey/:issueType',

    validateSendToken(), 

    function(req, res, next) {
      debug(util.inspect(req.body));

      secureStore.get(secureStore.client(), 'jira', function(error, clientSettings) {
        if (error) {
          debug('No existing secure store settings found.');
          res.sendStatus(401);
          return;
        }

        var payload = payloadBuilder.build(req);

        var httpClient = new HostRequest(JSON.parse(clientSettings));        
        httpClient.post({
            url: '/rest/api/2/issue/',
            json: true,
            body: payload,
          },
          function (error, httpResponse, body) {
            if (error) {
              debug(error);
              res.sendStatus(500);
            } else {
              if (body.errorMessages) {
                debug("Error: " + body.errorMessages[0]);
                res.sendStatus(500);
              } else {
                debug(util.inspect(httpResponse.headers));
                debug(body);
                res.sendStatus(200);
              }
            }
          }
        );
      });
    }
  );

}
