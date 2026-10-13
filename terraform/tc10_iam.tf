# PROM06 TC10 - Excessive Azure IAM Permissions
# Research-only test fixture. Do not deploy.

resource "azurerm_role_definition" "tc10_excessive_permissions" {
  name        = "PROM06-TC10-Excessive-Permissions"
  scope       = data.azurerm_subscription.current.id
  description = "Intentionally excessive permissions for PROM06 TC10 testing."

  permissions {
    actions     = ["*"]
    not_actions = []
  }

  tags = local.common_tags

  assignable_scopes = [
    data.azurerm_subscription.current.id
  ]
}

data "azurerm_subscription" "current" {}
