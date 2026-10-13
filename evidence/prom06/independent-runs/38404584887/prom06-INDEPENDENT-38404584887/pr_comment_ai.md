## AI Security Review
**Experiment condition:** INDEPENDENT
**Automated operational score:** 70/100 — MEDIUM — APPROVE_WITH_COMMENTS
*This tool is for demonstration purposes only.*

### Summary
The AI reviewer reported 1 confirmed actionable finding(s).

### Findings
- **HIGH · SECURITY_VULNERABILITY · Unrestricted inbound SSH access permitted from any source address**
  - Category rationale: The Terraform code directly configures an inbound NSG rule that allows TCP port 22 (SSH) from source 0.0.0.0/0 to any destination, exposing SSH to the entire internet. This is a concrete, demonstrable security weakness present in the changed file, independent of whether there is currently a VM listening on that port.
  - Evidence: azurerm_network_security_group.nsg, security_rule 'AllowSSH': priority=300, direction='Inbound', access='Allow', protocol='Tcp', source_port_range='*', destination_port_range='22', source_address_prefix='0.0.0.0/0', destination_address_prefix='*'.
  - Analysis: The NSG rule 'AllowSSH' at priority 300 permits inbound TCP traffic on port 22 from source address prefix '0.0.0.0/0' (any internet address) to any destination within the associated subnet. The rule is evaluated before the 'DenyAllInbound' rule at priority 4096, meaning any host on the internet can reach port 22 on resources in this subnet. The in-code comment 'TC02: Deliberately unrestricted SSH access' acknowledges the intent, but intentionality does not eliminate the security risk. SEC-001 prohibits public exposure unless explicitly required and justified; no justification is documented in the supplied policy or repository context.
  - Impact: Any internet-connected host can attempt SSH connections to resources deployed in the associated subnet (azurerm_subnet.subnet, 10.0.1.0/24). This exposes the environment to brute-force credential attacks, exploitation of SSH implementation vulnerabilities, and lateral movement if any host accepts connections. The outbound DenyAllOutbound rule limits exfiltration paths but does not mitigate the inbound exposure.
  - Recommendation: Restrict source_address_prefix to a known, trusted CIDR range (e.g., a corporate VPN or jump-host IP) or remove the rule if SSH access is not currently required. If SSH access is operationally necessary for research purposes, document the justified source range and update the rule accordingly. Do not use 0.0.0.0/0 as the source for administrative protocols.

### Policy mappings
- **SEC-001** — No resource should be publicly exposed unless explicitly required and justified. (finding F-001)

### Recommendation
Review and remediate the confirmed findings above.
