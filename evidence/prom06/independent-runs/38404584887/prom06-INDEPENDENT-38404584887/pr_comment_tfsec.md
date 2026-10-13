## tfsec Security Scan
**Experiment condition:** INDEPENDENT
**Version:** v1.28.14
**Scan status:** COMPLETED_WITH_FINDINGS
**Findings:** 2

### Findings
- **CRITICAL · AVD-AZU-0047** — Security group rule allows ingress from public internet.; resource: `azurerm_network_security_group.nsg`; file: `/home/runner/work/ai-pr-review/ai-pr-review/terraform/nsg.tf`
- **CRITICAL · AVD-AZU-0050** — Security group rule allows ingress to SSH port from multiple public internet addresses.; resource: `azurerm_network_security_group.nsg`; file: `/home/runner/work/ai-pr-review/ai-pr-review/terraform/nsg.tf`
