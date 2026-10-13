# PROM06 TC11 - Deliberately excessive custom role
# Research-only test fixture. Do not deploy.

data "azurerm_subscription" "tc11_current" {}

resource "azurerm_role_definition" "tc11_reporting_role" {
  name        = "PROM06-TC11-Reporting-Role"
  scope       = data.azurerm_subscription.tc11_current.id
  description = "TC11 test role: permissions exceed the documented reporting task."

  permissions {
    actions     = ["Microsoft.Resources/subscriptions/resourceGroups/read", "Microsoft.Resources/subscriptions/resources/read"]
    not_actions = []
  }

  assignable_scopes = [
    azurerm_resource_group.rg.id
  ]
}
