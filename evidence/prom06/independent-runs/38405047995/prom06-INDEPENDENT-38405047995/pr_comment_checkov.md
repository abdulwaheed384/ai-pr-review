## Checkov Security Scan
**Experiment condition:** INDEPENDENT
**Version:** 3.3.1
**Scan status:** COMPLETED_WITH_FINDINGS
**Passed:** 5 · **Failed:** 2 · **Skipped:** 0

### Failed checks
- **CKV_AZURE_183** — Ensure that VNET uses local DNS addresses; resource: `azurerm_virtual_network.vnet`; file: `/network.tf`
- **CKV_AZURE_182** — Ensure that VNET has at least 2 connected DNS Endpoints; resource: `azurerm_virtual_network.vnet`; file: `/network.tf`
