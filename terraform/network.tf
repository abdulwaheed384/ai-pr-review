resource "azurerm_resource_group" "rg" {
  name     = "rg-network-demo-ai"
  location = "UK South"

  tags = local.common_tags
}

resource "azurerm_virtual_network" "vnet" {
  name          = "vnet-demo-ai"
  address_space = ["10.0.0.0/16"]
  dns_servers   = [] # Custom resolver; it must be reachable from this VNet.
  # NET-003 requires DDoS Protection Standard for production; TC01 is research.
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  tags                = local.common_tags
}

resource "azurerm_subnet" "subnet" {
  name                            = "subnet-demo"
  resource_group_name             = azurerm_resource_group.rg.name
  virtual_network_name            = azurerm_virtual_network.vnet.name
  address_prefixes                = ["10.0.1.0/24"]
  default_outbound_access_enabled = false
  # Subnets do not support Azure resource tags; the parent VNet and NSG are tagged.
}

resource "azurerm_subnet_network_security_group_association" "subnet" {
  subnet_id                 = azurerm_subnet.subnet.id
  network_security_group_id = azurerm_network_security_group.nsg.id
}
