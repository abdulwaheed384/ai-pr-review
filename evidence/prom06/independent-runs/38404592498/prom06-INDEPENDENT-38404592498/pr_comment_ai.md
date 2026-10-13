## AI Security Review
**Experiment condition:** INDEPENDENT
**Automated operational score:** 70/100 — MEDIUM — APPROVE_WITH_COMMENTS
*This tool is for demonstration purposes only.*

### Summary
The AI reviewer reported 1 confirmed actionable finding(s).

### Findings
- **HIGH · SECURITY_VULNERABILITY · Unrestricted inbound HTTP (TCP/80) permitted from any source via NSG rule**
  - Category rationale: The NSG rule 'AllowHTTP' at priority 302 explicitly permits inbound TCP/80 from any IPv4 address (source_address_prefix = '0.0.0.0/0') to any destination within the subnet. This is a concrete, demonstrated public exposure in the current configuration. The inline comment acknowledges the rule is deliberately public ('TC04: Deliberately public HTTP access for security testing only'), but the code contains no scope-limiting control (e.g., source IP restriction, time-bound rule, or application gateway front-end). The annotation documents intent but does not mitigate the exposure. SEC-001 requires explicit justification and — implicitly — that the exposure is scoped appropriately; the current rule is unbounded.
  - Evidence: azurerm_network_security_group.nsg, security_rule 'AllowHTTP': priority=302, direction=Inbound, access=Allow, protocol=Tcp, destination_port_range=80, source_address_prefix=0.0.0.0/0, destination_address_prefix=*.
  - Analysis: The NSG resource 'azurerm_network_security_group.nsg' contains a security rule named 'AllowHTTP' at priority 302 that allows inbound TCP traffic on port 80 from source 0.0.0.0/0 to any destination. This rule takes effect before the DenyAllInbound rule at priority 4096. Any host on the public internet can reach TCP/80 on resources associated with the subnet 'subnet-demo' (10.0.1.0/24). The comment identifies this as a test-case requirement (TC04), but the configuration itself does not restrict the source to a known test range or document an approved exception beyond the inline comment.
  - Impact: Any internet-connected host can initiate TCP connections to port 80 on resources attached to the associated subnet. If any workload is deployed to this subnet (now or later in the test case), it is immediately reachable from the public internet on HTTP without authentication at the network layer. The subnet also has default_outbound_access_enabled=false, which limits exfiltration risk, but does not reduce inbound attack surface.
  - Recommendation: If public HTTP access is genuinely required for TC04 testing, restrict source_address_prefix to the specific IP range(s) used by the test harness rather than 0.0.0.0/0. Document the approved source range and the approval reference in the Terraform comment. If the rule is only needed transiently, consider removing it from the baseline configuration and applying it only during the test window. At minimum, ensure an approved exception record exists that references TC04 and the owning team.

### Policy mappings
- **SEC-001** — No resource should be publicly exposed unless explicitly required and justified. (finding F-001)

### Recommendation
Review and remediate the confirmed findings above.
