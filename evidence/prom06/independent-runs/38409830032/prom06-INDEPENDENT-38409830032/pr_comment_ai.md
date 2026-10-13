## AI Security Review
**Experiment condition:** INDEPENDENT
**Automated operational score:** 70/100 — MEDIUM — APPROVE_WITH_COMMENTS
*This tool is for demonstration purposes only.*

### Summary
The AI reviewer reported 1 confirmed actionable finding(s).

### Findings
- **HIGH · SECURITY_VULNERABILITY · Managed identity granted Contributor at subscription scope; requirements specify Reader at resource-group scope**
  - Category rationale: The Terraform code directly demonstrates that the managed identity is granted Contributor (write/delete) access at subscription scope, while tc13_requirements.tf explicitly states that the task requires only Reader access scoped to the research resource group. The misconfiguration violates least-privilege and is evidenced entirely within the changed files without requiring external context.
  - Evidence: azurerm_role_assignment.tc13_reporting: role_definition_name = "Contributor", scope = data.azurerm_subscription.tc13_current.id. tc13_requirements.tf locals: tc13_required_role = "Reader", tc13_required_scope = "Research resource group (azurerm_resource_group.rg)", tc13_write_access_required = false.
  - Analysis: azurerm_role_assignment.tc13_reporting assigns the Contributor built-in role to the tc13_reporting managed identity with scope set to data.azurerm_subscription.tc13_current.id (the entire subscription). The tc13_requirements.tf file in the same PR explicitly documents that the required role is Reader, the required scope is the research resource group, and that write access is not required (tc13_write_access_required = false). Contributor grants create, update, and delete permissions across every resource type in the subscription, far exceeding what the documented task (read resource information for weekly reporting) requires.
  - Impact: The identity can create, modify, or delete any resource across the entire subscription, including network controls, IAM assignments, storage accounts, and compute. If the identity or its credential is compromised, an attacker gains full write control over all subscription resources, not just the research resource group. This also bypasses the resource-group-level blast-radius boundary implied by the documented scope requirement.
  - Recommendation: Change role_definition_name to "Reader" and change scope to azurerm_resource_group.rg.id to match the documented requirements. Example: scope = azurerm_resource_group.rg.id, role_definition_name = "Reader". This constrains the identity to read-only access on the single resource group, consistent with tc13_required_role, tc13_required_scope, and tc13_write_access_required = false.

### Policy mappings
- **SEC-001** — No resource should be publicly exposed unless explicitly required and justified. (finding F-001)

### Recommendation
Review and remediate the confirmed findings above.
