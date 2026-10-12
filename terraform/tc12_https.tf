# PROM06 TC12 - Legitimate public HTTPS service
# Ground truth: public TCP/443 ingress is intentional for the documented public web endpoint.
# Research-only test fixture. Do not deploy.

resource "azurerm_network_security_rule" "tc12_public_https" {
  name                        = "AllowPublicHTTPS-TC12"
  priority                    = 300
  direction                   = "Inbound"
  access                      = "Allow"
  protocol                    = "Tcp"
  source_port_range           = "*"
  destination_port_range      = "443"
  source_address_prefix       = "*"
  destination_address_prefix  = "*"
  resource_group_name         = azurerm_resource_group.rg.name
  network_security_group_name = azurerm_network_security_group.nsg.name
  description                 = "TC12 test: public HTTPS is required for the intended public web endpoint."
}
