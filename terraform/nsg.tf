resource "azurerm_network_security_group" "nsg" {
  name                = "nsg-demo-ai"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  tags                = local.common_tags

  security_rule {
    name                       = "DenyAllInbound"
    priority                   = 4096
    direction                  = "Inbound"
    access                     = "Deny"
    protocol                   = "*"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "DenyAllOutbound"
    priority                   = 4096
    direction                  = "Outbound"
    access                     = "Deny"
    protocol                   = "*"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
}

# NSG resource logs are the applicable diagnostic categories for this network-only
# case. No VM, subnet-level diagnostic target, or public service exists in TC01.
resource "azurerm_log_analytics_workspace" "network" {
  name                         = "law-prom06-tc01-uks"
  location                     = azurerm_resource_group.rg.location
  resource_group_name          = azurerm_resource_group.rg.name
  sku                          = "PerGB2018"
  retention_in_days            = 30
  daily_quota_gb               = 1
  local_authentication_enabled = false
  internet_ingestion_enabled   = false
  internet_query_enabled       = false
  tags                         = local.common_tags
}

resource "azurerm_monitor_diagnostic_setting" "nsg" {
  name                       = "diag-nsg-prom06-tc01"
  target_resource_id         = azurerm_network_security_group.nsg.id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.network.id

  enabled_log {
    category = "NetworkSecurityGroupEvent"
  }

  enabled_log {
    category = "NetworkSecurityGroupRuleCounter"
  }
}
