param webapiName string = 'aiChatHandlerSrvToshik'
param appServicePlanName string = 'appserviceplan'
targetScope = 'subscription'

@minLength(1)
@maxLength(64)
@description('Name of the environment that can be used as part of naming resource convention')
param environmentName string

@minLength(1)
@description('Primary location for all resources')
param location string

param rg string = ''
param webappName string = 'webapp'

@description('Location for the Static Web App')
@allowed([
  'westus2'
  'centralus'
  'eastus2'
  'westeurope'
  'eastasia'
  'eastasiastage'
])
@metadata({
  azd: {
    type: 'location'
  }
})
param webappLocation string

// 🚫 Removed unused principalId to clear the warning
// param principalId string

// Common variables
var abbrs = loadJsonContent('./abbreviations.json')
var tags = {
  'azd-env-name': environmentName
}

// Resources
resource resourceGroup 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: !empty(rg) ? rg : '${abbrs.resourcesResourceGroups}${environmentName}'
  location: location
  tags: tags
}

module webapp 'br/public:avm/res/web/static-site:0.7.0' = {
  name: 'webapp'
  scope: resourceGroup
  params: {
    name: webappName
    location: webappLocation
    tags: union(tags, { 'azd-service-name': webappName })
    sku: 'Standard'
  }
}

module serverfarm 'br/public:avm/res/web/serverfarm:0.4.1' = {
  name: 'appserviceplan'
  scope: resourceGroup
  params: {
    name: appServicePlanName
    skuName: 'B1'
  }
}

module webapiModule 'br/public:avm/res/web/site:0.15.1' = { // ✅ renamed module to avoid conflict
  name: 'webapi'
  scope: resourceGroup
  params: {
    kind: 'app'
    name: webapiName
    tags: union(tags, { 'azd-service-name': 'webapi' }) // Must match azure.yaml
    serverFarmResourceId: serverfarm.outputs.resourceId
  }
}

// ✅ Renamed output variable to avoid conflict
output webapiUrl string = webapiModule.outputs.defaultHostname
