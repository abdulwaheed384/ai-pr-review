resource "azurerm_network_security_group" "nsg" {
  name                = "nsg-demo-ai"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
}
