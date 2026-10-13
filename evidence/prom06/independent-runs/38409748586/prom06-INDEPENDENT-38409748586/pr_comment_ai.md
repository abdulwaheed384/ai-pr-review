## AI Security Review
**Experiment condition:** INDEPENDENT
**Automated operational score:** 95/100 — LOW — APPROVE
*This tool is for demonstration purposes only.*

### Summary
The AI reviewer reported 1 confirmed actionable finding(s).

### Findings
- **LOW · SECURITY_VULNERABILITY · SSH allow rule uses wildcard destination, permitting access to any subnet host**
  - Category rationale: The AllowSSHFromBastion inbound rule uses destination_address_prefix = '*', which allows SSH (TCP/22) from the approved bastion source to any destination in the subnet rather than constraining it to a specific target host IP. This is a concrete, demonstrable overly-permissive scope in the configured rule, not a hypothetical concern.
  - Evidence: azurerm_network_security_group.nsg, security_rule 'AllowSSHFromBastion': source_address_prefix = '203.0.113.10/32', destination_address_prefix = '*', destination_port_range = '22', direction = 'Inbound', access = 'Allow', priority = 300.
  - Analysis: The inbound security rule 'AllowSSHFromBastion' at priority 300 restricts the source to the approved bastion address (203.0.113.10/32) but sets destination_address_prefix to '*'. In a subnet with multiple resources, this means a compromise of the bastion host — or a misconfiguration of the source prefix — could allow SSH to any resource in the subnet rather than only the intended target. Restricting the destination to the specific host IP or a named resource address reduces the blast radius of a lateral movement scenario.
  - Impact: If additional hosts are placed in subnet-demo (10.0.1.0/24) in the future, SSH is permitted from the bastion to all of them without any further rule change. In the current single-resource research context the risk is low, but the rule scope exceeds the documented intent of 'Administrative SSH from the approved bastion address'.
  - Recommendation: Set destination_address_prefix to the specific private IP address of the intended management target (e.g., '10.0.1.x/32') rather than '*'. This constrains the rule to its stated purpose and prevents implicit expansion as the subnet grows.

### Recommendation
Review and remediate the confirmed findings above.
