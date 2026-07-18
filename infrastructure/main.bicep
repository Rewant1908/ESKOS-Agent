@description('Location for all resources.')
param location string = resourceGroup().location

@description('Environment name prefix.')
param environmentName string = 'eskos'

// Log Analytics Workspace for Container Apps
resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: '${environmentName}-la'
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
  }
}

// Container Apps Environment
resource containerAppEnvironment 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: '${environmentName}-env'
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalyticsWorkspace.properties.customerId
        sharedKey: logAnalyticsWorkspace.listKeys().primarySharedKey
      }
    }
  }
}

// Managed PostgreSQL Flexible Server
resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2022-12-01-preview' = {
  name: '${environmentName}-pg'
  location: location
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    version: '16'
    administratorLogin: 'eskosadmin'
    administratorLoginPassword: 'eskosdbpass123!'
  }
}

// Container App: Knowledge Fabric
resource knowledgeFabricApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: 'knowledge-fabric'
  location: location
  properties: {
    managedEnvironmentId: containerAppEnvironment.id
    configuration: {
      ingress: {
        external: true
        targetPort: 8090
      }
    }
    template: {
      containers: [
        {
          name: 'knowledge-fabric'
          image: 'eskosacr.azurecr.io/knowledge-fabric:latest'
          env: [
            { name: 'POSTGRES_HOST', value: postgresServer.name }
            { name: 'POSTGRES_USER', value: 'eskosadmin' }
            { name: 'POSTGRES_PASSWORD', value: 'eskosdbpass123!' }
            // Additional env vars for Qdrant, Neo4j, etc.
          ]
        }
      ]
    }
  }
}

// Container App: Agent Runtime
resource agentRuntimeApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: 'agent-runtime'
  location: location
  properties: {
    managedEnvironmentId: containerAppEnvironment.id
    configuration: {
      ingress: {
        external: true
        targetPort: 3000
      }
    }
    template: {
      containers: [
        {
          name: 'agent-runtime'
          image: 'eskosacr.azurecr.io/agent-runtime:latest'
          env: [
            { name: 'FABRIC_URL', value: 'http://knowledge-fabric' }
          ]
        }
      ]
    }
  }
}
