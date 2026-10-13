## AI Security Review
**Experiment condition:** INDEPENDENT
**Automated operational score:** 70/100 — MEDIUM — APPROVE_WITH_COMMENTS
*This tool is for demonstration purposes only.*

### Summary
The AI reviewer reported 1 confirmed actionable finding(s).

### Findings
- **HIGH · POLICY_OR_COMPLIANCE · Subnet has no NSG association (NET-001 violation)**
  - Category rationale: Policy NET-001 requires all subnets to have an NSG associated. The subnet resource in network.tf has no azurerm_subnet_network_security_group_association, and no such association resource exists anywhere in the supplied Terraform files. The NSG defined in nsg.tf is provisioned but not linked to the subnet.
  - Evidence: azurerm_subnet.subnet in terraform/network.tf contains no nsg reference and no azurerm_subnet_network_security_group_association resource is present in any supplied file. azurerm_network_security_group.nsg is defined in terraform/nsg.tf but is not linked to the subnet.
  - Analysis: The subnet 'subnet-demo' (azurerm_subnet.subnet) is defined in network.tf but is not associated with the NSG 'nsg-demo-ai' (azurerm_network_security_group.nsg defined in nsg.tf). No azurerm_subnet_network_security_group_association resource exists in any of the supplied Terraform files. Without an association, the NSG's deny-all inbound and outbound rules do not apply to traffic entering or leaving the subnet, and only Azure's built-in defaults govern subnet-level traffic. This violates NET-001.
  - Impact: Traffic to and from subnet-demo is governed only by Azure's default NSG rules (default deny inbound from internet, default allow VNet-to-VNet, default allow outbound). The explicit deny-all rules in nsg-demo-ai do not take effect at the subnet level, leaving the subnet without the intended restrictive posture.
  - Recommendation: Add an azurerm_subnet_network_security_group_association resource associating azurerm_subnet.subnet.id with azurerm_network_security_group.nsg.id. For example:

resource "azurerm_subnet_network_security_group_association" "subnet_nsg" {
  subnet_id                 = azurerm_subnet.subnet.id
  network_security_group_id = azurerm_network_security_group.nsg.id
}

### Policy mappings
- **NET-001** — All subnets must have a Network Security Group (NSG) associated. (finding F-001)

### Recommendation
Review and remediate the confirmed findings above.
