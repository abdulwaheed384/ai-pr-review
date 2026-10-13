# PROM06 TC13 research fixture. Do not deploy.

data "azurerm_subscription" "tc13_current" {}

resource "azurerm_user_assigned_identity" "tc13_reporting" {
  name                = "id-prom06-tc13-reporting"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  tags                = local.common_tags
}

resource "azurerm_role_assignment" "tc13_reporting" {
  scope                = azurerm_resource_group.rg.id
  role_definition_name = "Reader"
  principal_id         = azurerm_user_assigned_identity.tc13_reporting.principal_id
  principal_type       = "ServicePrincipal"
  description          = "Role assignment for the reporting service identity."
}
