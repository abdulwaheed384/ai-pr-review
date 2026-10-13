terraform {
  required_version = ">= 1.6.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
}

locals {
  common_tags = {
    environment   = "research"
    owner         = "PROM06 Research Team"
    cost-center   = "PROM06-RESEARCH"
    research_case = "PROM06-TC01"
  }
}
