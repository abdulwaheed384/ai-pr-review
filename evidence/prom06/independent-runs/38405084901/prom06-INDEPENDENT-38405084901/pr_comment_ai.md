## AI Security Review
**Experiment condition:** INDEPENDENT
**Automated operational score:** 70/100 — MEDIUM — APPROVE_WITH_COMMENTS
*This tool is for demonstration purposes only.*

### Summary
The AI reviewer reported 1 confirmed actionable finding(s).

### Findings
- **HIGH · SECURITY_VULNERABILITY · Custom role definition grants wildcard (*) permissions at subscription scope**
  - Category rationale: The Terraform resource azurerm_role_definition.tc10_excessive_permissions explicitly configures actions = ["*"] with no not_actions restrictions and sets assignable_scopes to the current subscription ID. This grants the ability to perform any Azure Resource Manager action across the entire subscription to any principal the role is assigned to. This is a concrete, deployable security weakness present in the changed file, not a hypothetical.
  - Evidence: azurerm_role_definition.tc10_excessive_permissions in terraform/tc10_iam.tf: permissions { actions = ["*"] not_actions = [] } assignable_scopes = [data.azurerm_subscription.current.id]
  - Analysis: The resource azurerm_role_definition.tc10_excessive_permissions defines a custom Azure RBAC role with actions = ["*"] and not_actions = [], making it equivalent to Owner or higher on every resource in the subscription. The assignable_scopes list contains only data.azurerm_subscription.current.id, meaning the role can be assigned at the broadest possible scope. Although the file comment states 'Research-only test fixture. Do not deploy', the resource will be provisioned if this file is included in a Terraform apply. Once the role definition exists in Azure, any authorized operator can assign it to a principal (user, service principal, managed identity), resulting in full subscription-level access. There is no data source, condition, or Terraform lifecycle guard in the supplied code that prevents deployment or assignment.
  - Impact: A principal assigned this role gains the ability to read, write, and delete any resource in the subscription, manage role assignments (privilege escalation), access secrets and credentials, and exfiltrate or destroy all data. Even without an active assignment, the role definition's existence reduces the effort required for privilege escalation by an insider or compromised account to a single role-assignment operation.
  - Recommendation: Do not deploy wildcard-permission role definitions to a shared or persistent subscription, even as test fixtures. If the test case requires observing the creation of an overly permissive role, consider: (1) scoping assignable_scopes to a dedicated, isolated resource group rather than the subscription; (2) adding not_actions to exclude sensitive operations such as role assignment (Microsoft.Authorization/roleAssignments/write) and privileged data-plane actions; (3) using a Terraform lifecycle { prevent_destroy = true } or a separate, isolated subscription for destructive test cases; (4) removing the role definition immediately after the test via CI/CD teardown rather than leaving it in a persistent state.

### Policy mappings
- **SEC-001** — No resource should be publicly exposed unless explicitly required and justified. (finding F-001)

### Recommendation
Review and remediate the confirmed findings above.
