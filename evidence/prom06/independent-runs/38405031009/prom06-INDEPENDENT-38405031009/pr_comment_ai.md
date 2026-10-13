## AI Security Review
**Experiment condition:** INDEPENDENT
**Automated operational score:** 70/100 — MEDIUM — APPROVE_WITH_COMMENTS
*This tool is for demonstration purposes only.*

### Summary
The AI reviewer reported 1 confirmed actionable finding(s).

### Findings
- **HIGH · SECURITY_VULNERABILITY · NSG allows unrestricted inbound HTTP (TCP/80) from any IPv4 address**
  - Category rationale: The NSG rule 'AllowHTTP' at priority 302 permits inbound TCP/80 from source 0.0.0.0/0 to any destination, exposing any resource attached to this NSG to the public internet on port 80. This is a concrete, currently deployed permissive inbound rule. The inline comment acknowledges it ('Deliberately public HTTP access for security testing only') but the code supplies no time-bound, scope-limited, or compensating control that would contain the exposure. SEC-001 requires explicit justification for public exposure; the comment provides an assertion but not a scoped or bounded control.
  - Evidence: azurerm_network_security_group.nsg, security_rule 'AllowHTTP': priority=302, direction='Inbound', access='Allow', protocol='Tcp', destination_port_range='80', source_address_prefix='0.0.0.0/0', destination_address_prefix='*'.
  - Analysis: The security rule 'AllowHTTP' (priority 302, direction Inbound, access Allow, protocol Tcp, destination_port_range 80, source_address_prefix 0.0.0.0/0) in azurerm_network_security_group.nsg exposes port 80 on every resource associated with this NSG to the entire internet. The inline comment attributes this to test case TC04, but no IP restriction, time-bound mechanism, or additional compensating rule is present in the supplied configuration to limit the blast radius. Even in a research context, unrestricted public inbound access on a live rule represents a concrete, current weakness.
  - Impact: Any host or service attached to this NSG is reachable on TCP/80 from the public internet. This exposes the workload to web-based scanning, exploitation of any HTTP service listening on port 80, and lateral movement if an attacker can reach the subnet. The research classification does not eliminate this risk for the duration the rule is active.
  - Recommendation: If public HTTP access is genuinely required for the test, restrict source_address_prefix to the specific tester IP range(s) rather than 0.0.0.0/0. If the rule is temporary, implement it outside of version-controlled Terraform (e.g., a time-boxed manual override) or use a dedicated test NSG that is not associated with the main subnet. Remove or scope the rule immediately after the test concludes. Reference SEC-001: public exposure requires explicit justification and should be as narrowly scoped as possible.

### Policy mappings
- **SEC-001** — No resource should be publicly exposed unless explicitly required and justified. (finding F-001)

### Recommendation
Review and remediate the confirmed findings above.
