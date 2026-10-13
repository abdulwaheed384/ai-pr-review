## AI Security Review
**Experiment condition:** INDEPENDENT
**Automated operational score:** 85/100 — LOW — APPROVE
*This tool is for demonstration purposes only.*

### Summary
The AI reviewer reported 1 confirmed actionable finding(s).

### Findings
- **MEDIUM · POLICY_OR_COMPLIANCE · VNet configured with public DNS resolver in violation of NET-002**
  - Category rationale: Policy NET-002 explicitly prohibits the use of public DNS servers on Virtual Networks, requiring Azure DNS or internal DNS instead. The Terraform configuration for azurerm_virtual_network.vnet sets dns_servers to ["8.8.8.8"], which is a public Google DNS resolver. The inline comment ('TC06: Deliberately use a public DNS resolver for testing.') acknowledges the deviation but does not constitute a policy exemption; no supplied policy or documentation grants an exception for this control based on research workload status. NET-002 contains no non-production carve-out, unlike NET-003.
  - Evidence: azurerm_virtual_network.vnet in terraform/network.tf: dns_servers = ["8.8.8.8"]. Policy NET-002: 'Virtual Networks must NOT use public DNS servers. Use Azure DNS or internal DNS only.'
  - Analysis: The azurerm_virtual_network.vnet resource sets dns_servers = ["8.8.8.8"], routing all VNet DNS queries to a public Google resolver. Policy NET-002 requires Virtual Networks to use Azure DNS or internal DNS only, with no exception for research or non-production workloads. Using a public DNS resolver exposes DNS query content to a third-party service, prevents private DNS zone resolution (including the five privatelink zones linked to this VNet for the AMPLS private endpoint), and may cause DNS leakage of internal resource names. The inline comment labels this as intentional for test case TC06, but no policy waiver or exception mechanism is documented in the supplied context.
  - Impact: DNS queries from resources in this VNet are forwarded to 8.8.8.8 instead of Azure's recursive resolver. This bypasses the private DNS zones configured for the AMPLS private endpoint (privatelink.monitor.azure.com, privatelink.oms.opinsights.azure.com, etc.), which means the private endpoint DNS resolution may fail or fall back to public endpoints, potentially defeating the private-only ingestion and query access modes configured on the Log Analytics workspace. It also exposes DNS query metadata to Google's public resolver infrastructure.
  - Recommendation: Remove the dns_servers attribute from azurerm_virtual_network.vnet to inherit Azure's default recursive resolver (168.63.129.16), which honours the private DNS zone links configured in the VNet. If a custom resolver is required, use an Azure-hosted private resolver or an internal forwarder. If TC06 specifically requires a public DNS resolver for a documented test objective, seek a formal policy exemption and document it in the repository alongside the test case rationale.

### Policy mappings
- **NET-002** — No Public DNS Servers on Virtual Networks (finding F-001)

### Recommendation
Review and remediate the confirmed findings above.
