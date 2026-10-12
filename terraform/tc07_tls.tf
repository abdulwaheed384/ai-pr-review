# PROM06 TC07: Intentionally weak TLS configuration.
# Research test only. Do not deploy this configuration.

resource "azurerm_service_plan" "tc07" {
  name                = "asp-prom06-tc07-tls"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location

  os_type  = "Linux"
  sku_name = "B1"

  tags = merge(local.common_tags, {
    research_case = "PROM06-TC07"
  })
}

resource "azurerm_linux_web_app" "tc07" {
  name                = "app-prom06-tc07-tls-research"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_service_plan.tc07.location
  service_plan_id     = azurerm_service_plan.tc07.id

  https_only = true

  site_config {
    minimum_tls_version = "1.0"

    application_stack {
      python_version = "3.12"
    }
  }

  tags = merge(local.common_tags, {
    research_case = "PROM06-TC07"
  })
}
