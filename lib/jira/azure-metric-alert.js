var titleCase = require('title-case');
var debug = require('debug')('azure-notifications-addon:jira:azure-metric-alert');

module.exports = {

  build: function(projectKey, issueType, azurePayload) {
    var summary = "Azure " + titleCase(azurePayload.context.conditionType) + " Alert - [rule activated]";   
    var description =   "The following alert was received from Azure:\n"
                      + "|*Name*|" + azurePayload.context.name  + "|\n"
                      + "|*Description*|" + azurePayload.context.description + "|\n"
                      + "|*Subscription Id*|" + azurePayload.context.subscriptionId  + "|\n"
                      + "|*Resource Group*|" + azurePayload.context.resourceGroupName  + "|\n"
                      + "|*Resource Name*|" + azurePayload.context.resourceName  + "|\n"
                      + "|*Resource Type*|" + azurePayload.context.resourceType  + "|\n"
                      + "|*Resource Region*|" + azurePayload.context.resourceRegion  + "|\n"
                      + "|*Resource Id*|[" + azurePayload.context.resourceId  + "|" + azurePayload.context.portalLink + "]|\n"

                      + "+*Condition*+\n";

    var keys = Object.keys(azurePayload.context.condition);                      
    for (i = 0; i < keys.length; i++) {
      description += "|*" + titleCase(keys[i]) + "*|"+ azurePayload.context.condition[keys[i]] + "|\n";
    }

    description +=    + "+*Alert Payload*+\n"
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
          "Azure", "Metric"
        ]
      }
    };
    debug(payload);

    return payload;
  }
}


