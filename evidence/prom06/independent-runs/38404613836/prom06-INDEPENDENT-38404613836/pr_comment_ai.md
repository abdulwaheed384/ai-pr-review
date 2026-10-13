## AI Security Review
**Experiment condition:** INDEPENDENT
**Automated operational score:** 70/100 — MEDIUM — APPROVE_WITH_COMMENTS
*This tool is for demonstration purposes only.*

### Summary
The AI reviewer reported 1 confirmed actionable finding(s).

### Findings
- **HIGH · SECURITY_VULNERABILITY · Custom RBAC role grants wildcard (*) permissions at subscription scope, violating least privilege**
  - Category rationale: The Terraform code supplies direct, unambiguous evidence of an over-privileged role definition. The role grants 'actions = ["*"]' at subscription scope, while tc11_requirements.tf explicitly states the task requires only two specific read actions ('Microsoft.Resources/subscriptions/resourceGroups/read' and 'Microsoft.Resources/subscriptions/resources/read'). This is not a hypothetical risk or context-dependent concern; the disparity is documented in the same PR.
  - Evidence: azurerm_role_definition.tc11_reporting_role in tc11_iam.tf: permissions { actions = ["*"], not_actions = [] }, assignable_scopes = [data.azurerm_subscription.tc11_current.id]. Contrast with tc11_requirements.tf: tc11_required_actions = ["Microsoft.Resources/subscriptions/resourceGroups/read", "Microsoft.Resources/subscriptions/resources/read"].
  - Analysis: The resource 'azurerm_role_definition.tc11_reporting_role' in tc11_iam.tf defines a custom Azure role with 'actions = ["*"]' and 'not_actions = []', granting every control-plane action across all Azure resource providers at subscription scope. The tc11_requirements.tf file in the same PR explicitly documents that the task this role supports requires only two read-only resource group and resource listing permissions. Assigning this role to any principal would grant full subscription-level control plane access, including the ability to create, delete, or modify any resource, assign other roles (if combined with authorization actions), access secrets, and more. The in-code description also acknowledges: 'permissions exceed the documented reporting task.'
  - Impact: Any principal assigned this role gains unrestricted Azure control-plane access at subscription scope. This includes the ability to read, write, and delete all resources, potentially access secrets from Key Vault or storage, modify network controls, and escalate privilege further. Even if currently unassigned, deploying an assignable wildcard role at subscription scope creates a standing escalation path.
  - Recommendation: Replace 'actions = ["*"]' with the minimal documented permission set: ['Microsoft.Resources/subscriptions/resourceGroups/read', 'Microsoft.Resources/subscriptions/resources/read']. Restrict 'assignable_scopes' to the narrowest applicable scope (e.g., a specific resource group) rather than the full subscription if possible. Confirm the role is not assigned to any principal before or after deployment.

### Policy mappings
- **SEC-001** — No resource should be publicly exposed unless explicitly required and justified. (finding F-001)

### Recommendation
Review and remediate the confirmed findings above.
