## Checkov Security Scan
**Experiment condition:** INDEPENDENT
**Version:** 3.3.1
**Scan status:** COMPLETED_WITH_FINDINGS
**Passed:** 11 · **Failed:** 11 · **Skipped:** 0

### Failed checks
- **CKV_AZURE_33** — Ensure Storage logging is enabled for Queue service for read, write and delete requests; resource: `azurerm_storage_account.tc07_storage`; file: `/storage.tf`
- **CKV_AZURE_59** — Ensure that Storage accounts disallow public access; resource: `azurerm_storage_account.tc07_storage`; file: `/storage.tf`
- **CKV_AZURE_44** — Ensure Storage Account is using the latest version of TLS encryption; resource: `azurerm_storage_account.tc07_storage`; file: `/storage.tf`
- **CKV_AZURE_206** — Ensure that Storage Accounts use replication; resource: `azurerm_storage_account.tc07_storage`; file: `/storage.tf`
- **CKV_AZURE_190** — Ensure that Storage blobs restrict public access; resource: `azurerm_storage_account.tc07_storage`; file: `/storage.tf`
- **CKV2_AZURE_41** — Ensure storage account is configured with SAS expiration policy; resource: `azurerm_storage_account.tc07_storage`; file: `/storage.tf`
- **CKV2_AZURE_47** — Ensure storage account is configured without blob anonymous access; resource: `azurerm_storage_account.tc07_storage`; file: `/storage.tf`
- **CKV2_AZURE_40** — Ensure storage account is not configured with Shared Key authorization; resource: `azurerm_storage_account.tc07_storage`; file: `/storage.tf`
- **CKV2_AZURE_33** — Ensure storage account is configured with private endpoint; resource: `azurerm_storage_account.tc07_storage`; file: `/storage.tf`
- **CKV2_AZURE_38** — Ensure soft-delete is enabled on Azure storage account; resource: `azurerm_storage_account.tc07_storage`; file: `/storage.tf`
- **CKV2_AZURE_1** — Ensure storage for critical data are encrypted with Customer Managed Key; resource: `azurerm_storage_account.tc07_storage`; file: `/storage.tf`
