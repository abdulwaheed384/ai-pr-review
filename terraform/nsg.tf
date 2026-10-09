resource "azurerm_network_security_group" "nsg" {
  name                = "nsg-demo-ai"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  tags                = local.common_tags

  # Priority 4096 runs before Azure's default allow rules (65000/65001) and
  # default deny (65500), preserving an explicit deny-all baseline.
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
# TC01 requires diagnostic log collection, not interactive queries or alerting.
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

# Private-only workspace query access is provided to clients in this VNet or
# connected networks. TC01 provisions no client workload; query access requires
# a separately connected operator/client.
resource "azurerm_monitor_private_link_scope" "network" {
  name                  = "ampls-prom06-tc01-uks"
  resource_group_name   = azurerm_resource_group.rg.name
  ingestion_access_mode = "PrivateOnly"
  query_access_mode     = "PrivateOnly"
  tags                  = local.common_tags
}

resource "azurerm_monitor_private_link_scoped_service" "network" {
  name                = "law-prom06-tc01-uks"
  resource_group_name = azurerm_resource_group.rg.name
  scope_name          = azurerm_monitor_private_link_scope.network.name
  linked_resource_id  = azurerm_log_analytics_workspace.network.id
}

resource "azurerm_private_endpoint" "monitor" {
  name                = "pe-ampls-prom06-tc01-uks"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  subnet_id           = azurerm_subnet.subnet.id
  tags                = local.common_tags

  private_service_connection {
    name                           = "psc-ampls-prom06-tc01-uks"
    private_connection_resource_id = azurerm_monitor_private_link_scope.network.id
    subresource_names              = ["azuremonitor"]
    is_manual_connection           = false
  }

  private_dns_zone_group {
    name = "ampls-dns"
    private_dns_zone_ids = [
      azurerm_private_dns_zone.monitor.id,
      azurerm_private_dns_zone.oms.id,
      azurerm_private_dns_zone.ods.id,
      azurerm_private_dns_zone.agentsvc.id,
      azurerm_private_dns_zone.blob.id,
    ]
  }
}

resource "azurerm_private_dns_zone" "monitor" {
  name                = "privatelink.monitor.azure.com"
  resource_group_name = azurerm_resource_group.rg.name
  tags                = local.common_tags
}

resource "azurerm_private_dns_zone" "oms" {
  name                = "privatelink.oms.opinsights.azure.com"
  resource_group_name = azurerm_resource_group.rg.name
  tags                = local.common_tags
}

resource "azurerm_private_dns_zone" "ods" {
  name                = "privatelink.ods.opinsights.azure.com"
  resource_group_name = azurerm_resource_group.rg.name
  tags                = local.common_tags
}

resource "azurerm_private_dns_zone" "agentsvc" {
  name                = "privatelink.agentsvc.azure-automation.net"
  resource_group_name = azurerm_resource_group.rg.name
  tags                = local.common_tags
}

resource "azurerm_private_dns_zone" "blob" {
  name                = "privatelink.blob.core.windows.net"
  resource_group_name = azurerm_resource_group.rg.name
  tags                = local.common_tags
}

resource "azurerm_private_dns_zone_virtual_network_link" "monitor" {
  for_each = {
    monitor  = azurerm_private_dns_zone.monitor.id
    oms      = azurerm_private_dns_zone.oms.id
    ods      = azurerm_private_dns_zone.ods.id
    agentsvc = azurerm_private_dns_zone.agentsvc.id
    blob     = azurerm_private_dns_zone.blob.id
  }

  name                  = "link-${each.key}-vnet-demo-ai"
  resource_group_name   = azurerm_resource_group.rg.name
  private_dns_zone_name = split("/", each.value)[8]
  virtual_network_id    = azurerm_virtual_network.vnet.id
  registration_enabled  = false
  tags                  = local.common_tags
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
