## AI Security Review
**Experiment condition:** INDEPENDENT
**Automated operational score:** 85/100 — LOW — APPROVE
*This tool is for demonstration purposes only.*

### Summary
The AI reviewer reported 1 confirmed actionable finding(s).

### Findings
- **MEDIUM · POLICY_OR_COMPLIANCE · VNet configured with public DNS server in violation of NET-002**
  - Category rationale: Policy NET-002 explicitly prohibits the use of public DNS servers in Virtual Networks, requiring Azure DNS or internal DNS only. The Terraform configuration sets dns_servers to ["8.8.8.8"], a public Google DNS resolver, with an inline comment confirming this is intentional for test case TC06. The policy does not provide an exemption for research or testing workloads; it applies categorically to all Virtual Networks in scope.
  - Evidence: azurerm_virtual_network.vnet in terraform/network.tf: dns_servers = ["8.8.8.8"] with inline comment '# TC06: Deliberately use a public DNS resolver for testing.'
  - Analysis: The azurerm_virtual_network.vnet resource sets dns_servers = ["8.8.8.8"], directing all DNS resolution within the VNet to a public Google resolver. Policy NET-002 requires Virtual Networks to use Azure DNS or internal DNS only and does not permit public DNS servers regardless of workload type. The inline comment explicitly acknowledges this is deliberate ('TC06: Deliberately use a public DNS resolver for testing'), confirming it is not an oversight. Using a public DNS server exposes DNS queries to an external party and can undermine private endpoint DNS resolution — in this configuration, DNS responses for privatelink zones may be returned by 8.8.8.8 rather than the configured private DNS zones, potentially redirecting private endpoint traffic to public Azure endpoints.
  - Impact: All DNS queries from resources in this VNet are forwarded to the public internet resolver 8.8.8.8. Private DNS zone records configured for privatelink.monitor.azure.com and companion zones (azurerm_private_dns_zone_virtual_network_link resources in nsg.tf) resolve correctly only when Azure DNS (168.63.129.16) is used as the resolver; overriding with 8.8.8.8 means the private endpoint DNS entries may not be returned, and monitor/log agent traffic may traverse the public endpoint instead of the private link. This also violates NET-002.
  - Recommendation: Remove the dns_servers attribute or set it to the Azure-provided resolver. To use Azure DNS: remove the dns_servers line entirely (Azure DNS is used by default) or set dns_servers = []. If a custom internal resolver is required, point to an internal IP that forwards to 168.63.129.16. This restores correct private DNS zone resolution for the AMPLS private endpoint and satisfies NET-002.

### Policy mappings
- **NET-002** — Virtual Networks must NOT use public DNS servers. Use Azure DNS or internal DNS only. (finding F-001)

### Recommendation
Review and remediate the confirmed findings above.
