var debug = require('debug')('azure-notifications-addon:jira:azure-default');

module.exports = {

  build: function(projectKey,issueType, azurePayload) {
    var summary = "Azure alert - [" + azurePayload.context.subscriptionId + "]";   
    var description =   "The following notification was received from Azure:\n"
                      + "|*Name*|" + azurePayload.context.name  + "|\n"
                      + "|*Description*|" + azurePayload.context.description + "|\n"
                      + "|*Subscription Id*|" + azurePayload.context.subscriptionId  + "|\n"
                      + "|*Resource Group*|" + azurePayload.context.resourceGroupName  + "|\n"
                      + "|*Resource Id*|" + azurePayload.context.resourceId  + "|\n"
                      
                      + "+*Alert Payload*+\n"
                      + "{code:javascript}" + JSON.stringify(azurePayload, null, 2) + "{code}";


    var payload = {
      "fields": {
        "project": {
          "key": projectKey
        },
        "summary": summary,
        "description": description,
        "issuetype": {
          "name": issueType
        },
        "labels": [
          "Azure"
        ]
      }
    };
    debug(payload);

    return payload;
  }
}
