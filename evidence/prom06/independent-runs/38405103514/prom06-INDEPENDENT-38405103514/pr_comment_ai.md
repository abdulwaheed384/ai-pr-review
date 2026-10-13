## AI Security Review
**Experiment condition:** INDEPENDENT
**Automated operational score:** 95/100 — LOW — APPROVE
*This tool is for demonstration purposes only.*

### Summary
The AI reviewer reported 1 confirmed actionable finding(s).

### Findings
- **LOW · POLICY_OR_COMPLIANCE · NSG security rule tc12_public_https is missing mandatory tags (TAG-001)**
  - Category rationale: TAG-001 requires all taggable Azure resources to include the mandatory tags: environment, owner, cost-center. The azurerm_network_security_rule resource supports tags and none are configured. This is a direct policy violation with clear Terraform evidence.
  - Evidence: resource "azurerm_network_security_rule" "tc12_public_https" in terraform/tc12_https.tf — no tags argument is present. local.common_tags is defined in terraform/main.tf and applied to all other taggable resources across network.tf and nsg.tf.
  - Analysis: The resource azurerm_network_security_rule.tc12_public_https does not include any tags block. Policy TAG-001 requires every taggable Azure resource to carry the mandatory tags: environment, owner, and cost-center. All other taggable resources in the repository (azurerm_network_security_group, azurerm_virtual_network, azurerm_resource_group, etc.) correctly reference local.common_tags. This resource is an outlier.
  - Impact: The resource cannot be attributed to its cost-center or owner through standard Azure tag-based governance tooling, creating an accountability and cost-tracking gap consistent with the TAG-001 policy requirement.
  - Recommendation: Add tags = local.common_tags (or a TC12-specific tags map that includes environment, owner, and cost-center) to the azurerm_network_security_rule.tc12_public_https resource block.

### Policy mappings
- **TAG-001** — Mandatory resource tagging (finding F-001)

### Recommendation
Review and remediate the confirmed findings above.
