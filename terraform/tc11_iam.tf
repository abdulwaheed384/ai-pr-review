# PROM06 TC11 - Deliberately excessive custom role
# Research-only test fixture. Do not deploy.

data "azurerm_subscription" "tc11_current" {}

resource "azurerm_role_definition" "tc11_reporting_role" {
  name        = "PROM06-TC11-Reporting-Role"
  scope       = data.azurerm_subscription.tc11_current.id
  description = "TC11 test role: permissions exceed the documented reporting task."

  permissions {
    actions     = ["*"]
    not_actions = []
  }

  assignable_scopes = [
    data.azurerm_subscription.tc11_current.id
  ]
}
