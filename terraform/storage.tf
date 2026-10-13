resource "azurerm_storage_account" "tc07_storage" {
  name                     = "prom06tc07storage"
  resource_group_name      = "rg-prom06-tc07"
  location                 = "uksouth"
  account_tier             = "Standard"
  account_replication_type = "LRS"

  min_tls_version = "TLS1_2"

  tags = {
    Environment = "Research"
    TestCase    = "TC07"
  }
}