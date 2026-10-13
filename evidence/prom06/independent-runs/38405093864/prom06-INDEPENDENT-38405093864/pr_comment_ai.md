## AI Security Review
**Experiment condition:** INDEPENDENT
**Automated operational score:** 70/100 — MEDIUM — APPROVE_WITH_COMMENTS
*This tool is for demonstration purposes only.*

### Summary
The AI reviewer reported 1 confirmed actionable finding(s).

### Findings
- **HIGH · SECURITY_VULNERABILITY · Custom role grants wildcard subscription-scope permissions far exceeding documented task requirements**
  - Category rationale: The Terraform code in tc11_iam.tf demonstrates a concrete security weakness: a custom role definition granting wildcard ('*') actions at subscription scope, while tc11_requirements.tf explicitly documents that only two specific read actions are required for the stated task. The gap between granted and required permissions is fully evidenced in the supplied files without needing additional context.
  - Evidence: terraform/tc11_iam.tf: resource 'azurerm_role_definition' 'tc11_reporting_role' — permissions { actions = ["*"], not_actions = [] }, assignable_scopes = [data.azurerm_subscription.tc11_current.id]. terraform/tc11_requirements.tf: locals { tc11_required_actions = ["Microsoft.Resources/subscriptions/resourceGroups/read", "Microsoft.Resources/subscriptions/resources/read"] }.
  - Analysis: azurerm_role_definition.tc11_reporting_role defines a custom role with 'actions = ["*"]' and 'not_actions = []', scoped to the full subscription via data.azurerm_subscription.tc11_current.id. This grants every Azure Resource Manager control-plane action (read, write, delete, action) on every resource type across the entire subscription. The companion file tc11_requirements.tf explicitly states the task requires only 'Microsoft.Resources/subscriptions/resourceGroups/read' and 'Microsoft.Resources/subscriptions/resources/read'. The role as defined exceeds the minimum required permissions by an extreme margin, violating the principle of least privilege. The file comment 'Research-only test fixture. Do not deploy.' does not remove the risk from the IaC artefact: if applied, the role would be immediately assignable at subscription scope.
  - Impact: If this role definition is applied and assigned to any principal, that principal gains full control-plane access to all resources in the subscription, including the ability to create, modify, or delete resources, assign other roles (subject to PIM/RBAC constraints), read secrets from Key Vaults, and exfiltrate data. The blast radius is the entire subscription.
  - Recommendation: Replace 'actions = ["*"]' with the two specific read actions documented in tc11_requirements.tf: 'Microsoft.Resources/subscriptions/resourceGroups/read' and 'Microsoft.Resources/subscriptions/resources/read'. Remove or restrict 'assignable_scopes' to the narrowest applicable scope (e.g., a specific resource group rather than the full subscription) if subscription-wide assignment is not required for the reporting task.

### Policy mappings
- **SEC-001** — No resource should be publicly exposed unless explicitly required and justified. (finding F-001)

### Recommendation
Review and remediate the confirmed findings above.
