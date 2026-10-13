## AI Security Review
**Experiment condition:** INDEPENDENT
**Automated operational score:** 70/100 — MEDIUM — APPROVE_WITH_COMMENTS
*This tool is for demonstration purposes only.*

### Summary
The AI reviewer reported 1 confirmed actionable finding(s).

### Findings
- **HIGH · SECURITY_VULNERABILITY · Managed identity granted Contributor at subscription scope instead of Reader at resource group scope**
  - Category rationale: The role assignment grants the Contributor role at subscription scope, while the requirements file in the same PR explicitly documents that the task requires only Reader access scoped to the research resource group. Contributor at subscription scope allows write, delete, and management operations across all resources in the subscription, far exceeding what is necessary. This is a demonstrated over-privilege weakness supported directly by the supplied code.
  - Evidence: terraform/tc13_reporting_identity.tf — resource "azurerm_role_assignment" "tc13_reporting": scope = data.azurerm_subscription.tc13_current.id, role_definition_name = "Contributor". terraform/tc13_requirements.tf — locals: tc13_required_role = "Reader", tc13_required_scope = "Research resource group (azurerm_resource_group.rg)", tc13_write_access_required = false.
  - Analysis: azurerm_role_assignment.tc13_reporting assigns the built-in 'Contributor' role to the tc13_reporting User Assigned Managed Identity with scope set to the full subscription (data.azurerm_subscription.tc13_current.id). The tc13_requirements.tf file in the same PR documents that the reporting task is 'Read resource information in the research resource group for weekly reporting', that tc13_required_role = "Reader", tc13_required_scope = "Research resource group (azurerm_resource_group.rg)", and tc13_write_access_required = false. The actual assignment violates all three of these constraints: it uses Contributor (not Reader), it targets the subscription (not the resource group), and it provides write access that is explicitly documented as not required. The Contributor role permits creating, modifying, and deleting resources and role assignments across every resource in the subscription, which constitutes a significant privilege escalation vector if the identity is ever compromised or misused.
  - Impact: An identity with Contributor at subscription scope can create, modify, or delete any Azure resource in the subscription, exfiltrate data, escalate privileges to other resources, and undermine isolation between research workloads. If the identity's credentials are compromised or the reporting service is exploited, an attacker gains broad write control over the entire subscription rather than read-only visibility into a single resource group.
  - Recommendation: Restrict the role assignment to match the documented requirements: set role_definition_name = "Reader" and scope = azurerm_resource_group.rg.id. This confines the identity to read-only access on the research resource group, satisfying the least-privilege principle and aligning with tc13_requirements.tf. Example: scope = azurerm_resource_group.rg.id, role_definition_name = "Reader".

### Policy mappings
- **SEC-001** — No resource should be publicly exposed unless explicitly required and justified. (finding F-001)

### Recommendation
Review and remediate the confirmed findings above.
