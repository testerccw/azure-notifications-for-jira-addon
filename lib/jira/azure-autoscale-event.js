var debug = require('debug')('azure-notifications-addon:jira:azure-autoscale-event');

module.exports = {

  build: function(projectKey, issueType, azurePayload) {
    var summary = "Azure Autoscale Alert - [" + azurePayload.operation + "]";   
    var description =   "The following notification was received from Azure:\n"
                      + "|*Name*|" + azurePayload.context.name  + "|\n"
                      + "|*Description*|" + azurePayload.context.description + "|\n"
                      + "|*Subscription Id*|" + azurePayload.context.subscriptionId  + "|\n"
                      + "|*Resource Group*|" + azurePayload.context.resourceGroupName  + "|\n"
                      + "|*Resource Name*|" + azurePayload.context.resourceName  + "|\n"
                      + "|*Resource Type*|" + azurePayload.context.resourceType  + "|\n"
                      + "|*Resource Id*|[" + azurePayload.context.resourceId  + "|" + azurePayload.context.portalLink + "]|\n"

                      + "+*Autoscale Event*+\n"
                      + "|*Timestamp*|" + azurePayload.context.timestamp  + "|\n"
                      + "|*Operation*|" + azurePayload.operation  + "|\n"
                      + "|*Old Capacity*|" + azurePayload.context.oldCapacity  + "|\n"
                      + "|*New Capacity*|" + azurePayload.context.newCapacity  + "|\n"                      

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
          "Azure", "Autoscale"
        ]
      }
    };
    debug(payload);

    return payload;
  }
}
