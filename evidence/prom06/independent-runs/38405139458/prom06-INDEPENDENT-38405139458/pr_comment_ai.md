## AI Security Review
**Experiment condition:** INDEPENDENT
**Automated operational score:** 70/100 — MEDIUM — APPROVE_WITH_COMMENTS
*This tool is for demonstration purposes only.*

### Summary
The AI reviewer reported 1 confirmed actionable finding(s).

### Findings
- **HIGH · SECURITY_VULNERABILITY · NSG rule permits unrestricted inbound HTTP (TCP/80) from any IPv4 source**
  - Category rationale: The NSG rule 'AllowHTTP' explicitly permits unrestricted inbound TCP/80 from any IPv4 source (source_address_prefix = '0.0.0.0/0') at priority 302, which is evaluated before the DenyAllInbound rule at priority 4096. This is a concrete, demonstrable configuration that exposes any resource in the associated subnet to public HTTP traffic. The TC04 comment acknowledges it is 'deliberately public' for security testing, but the configuration as committed represents a real current exposure. Policy SEC-001 requires justification for public exposure; the inline comment provides an intent note but does not constitute a formal access-control boundary or time-limited control.
  - Evidence: azurerm_network_security_group.nsg, security_rule 'AllowHTTP': priority = 302, direction = 'Inbound', access = 'Allow', protocol = 'Tcp', destination_port_range = '80', source_address_prefix = '0.0.0.0/0'. Associated to subnet-demo via azurerm_subnet_network_security_group_association.subnet.
  - Analysis: The security rule 'AllowHTTP' in azurerm_network_security_group.nsg is configured with source_address_prefix = '0.0.0.0/0', destination_port_range = '80', access = 'Allow', and priority = 302 (Inbound). Because NSG rules are evaluated in ascending priority order, this rule is processed before the explicit DenyAllInbound rule at priority 4096 and before Azure's default deny at priority 65500. Any resource attached to subnet-demo (10.0.1.0/24) via the azurerm_subnet_network_security_group_association is reachable on TCP/80 from the public internet. The TC04 annotation documents intent but does not scope or restrict the exposure to a controlled source range.
  - Impact: All resources deployed into subnet-demo (10.0.1.0/24) are reachable on TCP/80 from any internet source. Depending on what is deployed into the subnet, this could expose web services, management interfaces, or other HTTP-speaking workloads to unauthenticated public access and attack surface including scanning, exploitation, and data exfiltration over HTTP.
  - Recommendation: If public HTTP access is genuinely required for a time-bounded security test (TC04), restrict source_address_prefix to the specific IP range of the test client(s) rather than 0.0.0.0/0. Document an expiry date or a separate teardown PR for the rule. If the test has concluded or the rule is no longer needed, remove the 'AllowHTTP' security rule so the DenyAllInbound baseline applies. Do not merge a broad public-allow rule into a shared or persistent environment without a scoped source prefix and a documented, time-limited justification referencing a change ticket.

### Policy mappings
- **SEC-001** — No resource should be publicly exposed unless explicitly required and justified. (finding F-001)

### Recommendation
Review and remediate the confirmed findings above.
