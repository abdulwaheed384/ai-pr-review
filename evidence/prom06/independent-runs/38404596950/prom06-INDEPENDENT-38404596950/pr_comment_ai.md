## AI Security Review
**Experiment condition:** INDEPENDENT
**Automated operational score:** 85/100 — LOW — APPROVE
*This tool is for demonstration purposes only.*

### Summary
The AI reviewer reported 1 confirmed actionable finding(s).

### Findings
- **MEDIUM · POLICY_OR_COMPLIANCE · Virtual Network uses a public DNS server in violation of NET-002**
  - Category rationale: Policy NET-002 explicitly prohibits public DNS servers on Virtual Networks regardless of environment. The Terraform configuration sets dns_servers to ["8.8.8.8"], a public Google DNS resolver, in direct contradiction of this requirement. The inline comment confirms this is intentional for test case TC06, but no policy exemption for this control is documented in ai/policy.md.
  - Evidence: azurerm_virtual_network.vnet in terraform/network.tf: dns_servers = ["8.8.8.8"] with inline comment '# TC06: Deliberately use a public DNS resolver for testing.'
  - Analysis: The azurerm_virtual_network.vnet resource sets dns_servers = ["8.8.8.8"], directing all DNS resolution for this VNet to a public Google resolver. Policy NET-002 requires that Virtual Networks use Azure DNS or internal DNS only and does not include an exemption for research workloads. Using a public DNS server exposes DNS queries to an external party and removes the ability to resolve private DNS zones (such as the privatelink.* zones provisioned in nsg.tf) via the VNet's own DNS configuration — though the private DNS zones are linked to the VNet, a custom dns_servers override pointing to a public resolver means those zones may not be consulted for name resolution by resources in this VNet.
  - Impact: DNS queries from resources in this VNet are sent to a public resolver (8.8.8.8), violating NET-002. Additionally, private DNS zone resolution for the AMPLS private endpoint (privatelink.monitor.azure.com, privatelink.oms.opinsights.azure.com, etc.) may be impaired for any workload in this VNet, since a custom dns_servers value overrides Azure's built-in DNS and the linked private DNS zones are not automatically queried by 8.8.8.8.
  - Recommendation: Remove the dns_servers attribute or set it to the Azure-provided DNS address (168.63.129.16) to comply with NET-002 and to ensure private DNS zone resolution functions correctly for the AMPLS private endpoint. If TC06 requires testing with a public resolver, document a formal policy exemption and isolate the test to a separate VNet that does not host the private monitoring stack.

### Policy mappings
- **NET-002** — Virtual Networks must NOT use public DNS servers (finding F-001)

### Recommendation
Review and remediate the confirmed findings above.
