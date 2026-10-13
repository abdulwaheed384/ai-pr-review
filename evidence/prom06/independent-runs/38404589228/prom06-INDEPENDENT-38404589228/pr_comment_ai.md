## AI Security Review
**Experiment condition:** INDEPENDENT
**Automated operational score:** 70/100 — MEDIUM — APPROVE_WITH_COMMENTS
*This tool is for demonstration purposes only.*

### Summary
The AI reviewer reported 1 confirmed actionable finding(s).

### Findings
- **HIGH · SECURITY_VULNERABILITY · RDP (TCP/3389) publicly accessible from any source address**
  - Category rationale: The AllowRDP rule explicitly permits TCP/3389 from any source (0.0.0.0/0) on the public internet to any destination in the subnet. This is a concrete, demonstrated inbound exposure that is independent of whether the workload is research or production. The inline code comment acknowledges the rule is 'deliberately unrestricted' and 'insecure', confirming it is not a misconfiguration but an intentional rule whose security effect is a public attack surface on RDP.
  - Evidence: azurerm_network_security_group.nsg, security_rule 'AllowRDP': priority=301, direction=Inbound, access=Allow, protocol=Tcp, destination_port_range=3389, source_address_prefix=0.0.0.0/0. Associated to subnet via azurerm_subnet_network_security_group_association.subnet in network.tf.
  - Analysis: The security_rule 'AllowRDP' in azurerm_network_security_group.nsg permits inbound TCP traffic on port 3389 from source_address_prefix '0.0.0.0/0' at priority 301. This rule evaluates before the DenyAllInbound rule at priority 4096, so any host on the internet can attempt RDP connections to resources in the associated subnet. RDP is a high-value brute-force and exploit target (e.g., BlueKeep, credential stuffing). The code comment states the rule is 'deliberately unrestricted' and 'insecure', which confirms the exposure but does not eliminate the risk to the subnet or any resources attached to it.
  - Impact: Any internet host can initiate TCP connections to port 3389 on resources in subnet-demo (10.0.1.0/24). This enables brute-force credential attacks, exploitation of RDP vulnerabilities, and lateral movement if any VM is deployed into the subnet. The risk materialises as soon as a VM with a private IP in this subnet is provisioned; the NSG rule pre-positions the exposure.
  - Recommendation: Restrict source_address_prefix to a known, controlled IP range (e.g., a corporate egress NAT IP or Azure Bastion subnet CIDR) rather than 0.0.0.0/0. If public RDP is required for a specific test scenario, document the exact test window, scope the rule to a single source IP, and remove or revert the rule immediately after the test. Consider using Azure Bastion as a managed RDP proxy to avoid exposing RDP directly.

### Policy mappings
- **SEC-001** — No resource should be publicly exposed unless explicitly required and justified. (finding F-001)

### Recommendation
Review and remediate the confirmed findings above.
