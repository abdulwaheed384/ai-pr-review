## AI Security Review
**Experiment condition:** INDEPENDENT
**Automated operational score:** 85/100 — LOW — APPROVE
*This tool is for demonstration purposes only.*

### Summary
The AI reviewer reported 1 confirmed actionable finding(s).

### Findings
- **MEDIUM · POLICY_OR_COMPLIANCE · Subnet has no NSG association (NET-001 violation)**
  - Category rationale: Policy NET-001 requires all subnets to have an NSG associated. The subnet resource in network.tf does not include an azurerm_subnet_network_security_group_association block or an inline nsg reference, and no such association resource appears in any supplied context file. The NSG exists in nsg.tf but is never linked to the subnet.
  - Evidence: azurerm_subnet.subnet in terraform/network.tf has no nsg_id argument and no corresponding azurerm_subnet_network_security_group_association resource exists in any supplied file. azurerm_network_security_group.nsg is defined in terraform/nsg.tf but is not linked to the subnet.
  - Analysis: The subnet 'subnet-demo' defined in azurerm_subnet.subnet does not have the azurerm_network_security_group 'nsg-demo-ai' associated with it. No azurerm_subnet_network_security_group_association resource is present in any of the supplied Terraform files. Without this association, the deny-all NSG rules in nsg.tf do not apply to traffic entering or leaving the subnet, leaving subnet-level network controls unenforced despite the NSG being provisioned.
  - Impact: Without the NSG association, the deny-all inbound and outbound rules in nsg.tf have no effect on subnet traffic. Any resource placed in this subnet would be governed only by Azure platform defaults rather than the explicit deny-all posture intended by the configuration.
  - Recommendation: Add an azurerm_subnet_network_security_group_association resource linking azurerm_subnet.subnet.id to azurerm_network_security_group.nsg.id. For example:

resource "azurerm_subnet_network_security_group_association" "subnet_nsg" {
  subnet_id                 = azurerm_subnet.subnet.id
  network_security_group_id = azurerm_network_security_group.nsg.id
}

### Policy mappings
- **NET-001** — All subnets must have a Network Security Group (NSG) associated. (finding F-001)

### Recommendation
Review and remediate the confirmed findings above.
