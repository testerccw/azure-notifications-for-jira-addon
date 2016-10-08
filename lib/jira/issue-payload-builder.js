var config = require('nconf');
var debug = require('debug')('azure-notifications-addon:jira:issue-payload-builder');

module.exports = {

  build: function(req) {
    var azurePayload = req.body;
    var projectKey = req.params["projectKey"];
    var issueType = req.params["issueType"];

    var projectKeys = Object.keys(config.get('jira:projectKeys'));
    var issueTypes = config.get('jira:issueTypes');

    var payloadBuilder = module.exports.fetchBuilder(azurePayload);
    var payload = payloadBuilder.build(projectKey,issueType, azurePayload);

    return payload;
  },


  fetchBuilder: function(azurePayload) {

    var payloadBuilder = require('./azure-default');

    // Metric alert
    if (azurePayload.context.condition && azurePayload.context.conditionType) {
      payloadBuilder = require('./azure-metric-alert');
    }

    // Autoscale event
    else if (azurePayload.operation === "Scale In" || azurePayload.operation === "Scale Out") {
      payloadBuilder = require('./azure-autoscale-event');
    }

    return payloadBuilder;
  }

}; 

