## AI Security Review
**Experiment condition:** INDEPENDENT
**Automated operational score:** 70/100 — MEDIUM — APPROVE_WITH_COMMENTS
*This tool is for demonstration purposes only.*

### Summary
The AI reviewer reported 1 confirmed actionable finding(s).

### Findings
- **HIGH · SECURITY_VULNERABILITY · Reporting identity assigned Contributor at subscription scope instead of Reader at resource group scope**
  - Category rationale: The Terraform code assigns the 'Contributor' role at subscription scope to the reporting identity, while the co-located requirements file in the same PR explicitly documents that only 'Reader' access scoped to the research resource group is needed and that write access is not required. The gap between the configured permission and the documented least-privilege requirement is directly evidenced in the changed files and constitutes a concrete over-privileged identity assignment.
  - Evidence: azurerm_role_assignment.tc13_reporting: scope = data.azurerm_subscription.tc13_current.id (subscription scope), role_definition_name = 'Contributor'. Contrasted with tc13_requirements.tf locals: tc13_required_role = 'Reader', tc13_required_scope = 'Research resource group (azurerm_resource_group.rg)', tc13_write_access_required = false.
  - Analysis: The managed identity 'id-prom06-tc13-reporting' is granted the 'Contributor' role at subscription scope via azurerm_role_assignment.tc13_reporting. The Contributor role permits creating, modifying, and deleting most Azure resources across the entire subscription. The tc13_requirements.tf file in the same PR explicitly documents that the reporting task requires only 'Reader' access scoped to the research resource group (azurerm_resource_group.rg), and that write access is not required (tc13_write_access_required = false). The configured role and scope directly contradict the documented least-privilege requirement.
  - Impact: The reporting identity holds write and management permissions across all resources in the subscription, not just the research resource group. If the identity or the service using it is compromised, an attacker could create, modify, or delete arbitrary Azure resources subscription-wide, including network controls, storage, and other managed identities. This far exceeds the stated operational need.
  - Recommendation: Change the role_definition_name to 'Reader' and set the scope to azurerm_resource_group.rg.id to align with the documented requirement. Example: scope = azurerm_resource_group.rg.id, role_definition_name = 'Reader'. This satisfies the reporting task and enforces least-privilege as stated in tc13_requirements.tf.

### Policy mappings
- **SEC-001** — No resource should be publicly exposed unless explicitly required and justified. (finding F-001)

### Recommendation
Review and remediate the confirmed findings above.
