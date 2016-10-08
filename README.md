JIRA is a familiar solution to many IT, software and business teams. It's an ideal candidate for connecting to the Azure Monitor service via the webhook mechanism in order create JIRA Issues from Metric and Web Test Alerts. This JIRA add-on does just that. 

In order to make the process of deploying the add-on as easy as possible, we've built this add-on to be deployed and hosted on an Azure Web App which is connected to your JIRA instance via the **Manage add-ons** functionality in the **JIRA Administration** screen. The add-on establishes a secret, key exchange and other private details with JIRA that is used to secure, sign and verify all future communication between the two. All of this security information is stored in Azure Key Vault.

The add-on exposes token secured endpoints that can be configured in Azure Monitor against the webhooks exposed for various alerting mechanisms. Alerts will flow from Azure Monitor into the token secured endpoints. The add-on will then transform the payloads from the Azure Monitor alerts and securely create the appropriate Issue in JIRA.

If you have resources deployed in Azure and are using JIRA, then this add-on has just made it really simple for you to start creating issues from your Azure Monitor alerts today!

# Install

In order to deploy and configure this JIRA add-on, you should follow these steps:

## Manual 

### Azure AD Service principal

Create an Azure AD Service Principal that you will use to access the Azure Key Vault. Here are commands leveraging the [Azure CLI](https://azure.microsoft.com/en-us/documentation/articles/xplat-cli-install/).

```
# Create a service principal in your Tenant - choose a long complex password
# Keep the 'Object Id' from the output
> azure ad sp create --name "JIRA AddOn" --home-page http://atlassian.com --identifier-uris https://atlassian.add-on.keyvault --password $PASSWORD$

# Keep the 'Application Id' from the output
> azure ad app show -c "JIRA AddOn"
```

### Azure Key Vault

Create an Azure Key Vault using the steps in [Manage Key Vault using CLI](https://azure.microsoft.com/en-us/documentation/articles/key-vault-manage-with-cli/). The relevant steps are as follows:

```
azure keyvault create --vault-name 'JIRAKeyVault' --resource-group '$RESOURCE_GROUP$' --location '$LOCATION$'

azure keyvault set-policy --vault-name 'JIRAKeyVault' --spn $OBJECT_ID_FROM_EARLIER$ --perms-to-keys '["decrypt","sign"]'
```

### Azure Web App 

Create a Web App in Azure that will host the JIRA add-on. 

Clone this repo and follow instructions at [Continuous Deployment from BitBucket to Azure Web App](https://azure.microsoft.com/en-us/documentation/articles/app-service-continuous-deployment/) to link the repo to the Azure Web App. This will automatically deploy the code in the repo to your Web App.

## Scripted

The following repo contains ARM Templates and scripts to make installing the required infrastructure easy. You should use this instead of the manual steps above to save you time.

* [BitBucket - Azure Notifications for JIRA add-on Infrastructure](https://bitbucket.org/atlassian_microsoft/azure-notifications-for-jira-infrastructure)

# Configure JIRA add-on 

Copy the `sample-config.json` file to a `development-config.json` and/or `production-config.json`. Replace the JIRA server url and Azure Vault uri with your values. 

The other values that are marked with `SENSITIVE, DO NOT COMMIT`, should be not be committed into source control. These can be provided as environment variables to the web app. This can be done via the App Settings for the Web App in the Azure Portal. 

The following environment variables should be set:

```
NODE_ENV: production
addOn_adminToken: $TOKEN_FOR_JIRA_TO_MANAGE_ADDON_LIFECYCLE$
addOn_sendToken: $TOKEN_FOR_AZURE_WEBHOOKS$
azure_keyVault_clientId: $AZURE_AD_SP_APPLICATION_ID$
azure_keyVault_clientSecret: $AZURE_AD_SP_PASSWORD$
```

This will result in the JIRA add-on running in Azure on a Web App.

# Install add-on in JIRA

Use the **Manage add-ons** functionality in the **JIRA Administration** screen to connect the add-on with your JIRA instance. 

Use the following endpoint for the add-on descriptor:

```
http://$JIRA_SERVER_URL/atlassian-addon-descriptor?token=$ADMIN_TOKEN$
```

# Configure Azure notification webhooks

Set up webhooks in Azure as per [Get Started with Azure Monitor](https://azure.microsoft.com/en-us/documentation/articles/monitoring-get-started/). Any associated alerts will start flowing into JIRA as Issues.

Use the following endpoint in your webhook:

```
http://$JIRA_SERVER_URL$/notification/jira/$JIRA_PROJECT_KEY$/$JIRA_ISSUE_TYPE$?token=$SEND_TOKEN$
```

# For more information

* [Azure](http://azure.microsoft.com)
* [Get Started with Azure Monitor](https://azure.microsoft.com/en-us/documentation/articles/monitoring-get-started/)
* [Manage Key Vault using Azure CLI](https://azure.microsoft.com/en-us/documentation/articles/key-vault-manage-with-cli/)
* [Use Azure CLI to create a service principal to access resources](https://azure.microsoft.com/en-us/documentation/articles/resource-group-authenticate-service-principal-cli/)
* [Continuous Deployment from BitBucket to Azure Web App](https://azure.microsoft.com/en-us/documentation/articles/app-service-continuous-deployment/)

## License

[MIT](LICENSE.txt)
