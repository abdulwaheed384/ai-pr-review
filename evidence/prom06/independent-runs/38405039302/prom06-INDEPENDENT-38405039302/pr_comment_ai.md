## AI Security Review
**Experiment condition:** INDEPENDENT
**Automated operational score:** 70/100 — MEDIUM — APPROVE_WITH_COMMENTS
*This tool is for demonstration purposes only.*

### Summary
The AI reviewer reported 1 confirmed actionable finding(s).

### Findings
- **HIGH · POLICY_OR_COMPLIANCE · Subnet 'subnet-demo' has no NSG association (NET-001 violation)**
  - Category rationale: Policy NET-001 requires all subnets to have an NSG associated. The subnet 'subnet-demo' is defined in network.tf without an NSG association, and no azurerm_subnet_network_security_group_association resource is present in any of the supplied Terraform files. The NSG 'nsg-demo-ai' exists in nsg.tf but is not linked to this subnet.
  - Evidence: terraform/network.tf: resource 'azurerm_subnet' 'subnet' — no network_security_group_id attribute and no azurerm_subnet_network_security_group_association resource referencing this subnet found in any supplied file. terraform/nsg.tf: resource 'azurerm_network_security_group' 'nsg' defines DenyAllInbound and DenyAllOutbound rules but is not attached to the subnet.
  - Analysis: The subnet resource 'azurerm_subnet.subnet' (named 'subnet-demo', prefix 10.0.1.0/24) is defined in the changed file terraform/network.tf without any reference to the NSG 'azurerm_network_security_group.nsg' defined in terraform/nsg.tf. No 'azurerm_subnet_network_security_group_association' resource is present in any supplied file. Azure does not automatically associate an NSG with a subnet; an explicit association resource is required. Without it, the subnet operates under Azure's default permissive outbound and default deny inbound rules only, not the explicit deny-all posture defined in the NSG.
  - Impact: The subnet is not protected by the intended NSG deny-all posture. Traffic to and from resources placed in this subnet would be governed only by Azure's built-in defaults (default deny inbound, default allow VNet-to-VNet and outbound-to-internet) rather than the explicit deny-all rules in 'nsg-demo-ai'. This violates NET-001 and negates the security intent of the NSG configuration.
  - Recommendation: Add an 'azurerm_subnet_network_security_group_association' resource linking 'azurerm_subnet.subnet.id' to 'azurerm_network_security_group.nsg.id'. For example:

resource "azurerm_subnet_network_security_group_association" "subnet_nsg" {
  subnet_id                 = azurerm_subnet.subnet.id
  network_security_group_id = azurerm_network_security_group.nsg.id
}

### Policy mappings
- **NET-001** — All subnets must have a Network Security Group (NSG) associated. (finding F-001)

### Recommendation
Review and remediate the confirmed findings above.
