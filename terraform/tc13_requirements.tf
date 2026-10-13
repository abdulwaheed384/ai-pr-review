# PROM06 TC13 reporting service access requirements.

locals {
  tc13_reporting_task        = "Read resource information in the research resource group for weekly reporting"
  tc13_required_role         = "Reader"
  tc13_required_scope        = "Research resource group (azurerm_resource_group.rg)"
  tc13_write_access_required = false
}
