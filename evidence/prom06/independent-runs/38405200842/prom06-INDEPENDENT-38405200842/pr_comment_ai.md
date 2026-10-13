## AI Security Review
**Experiment condition:** INDEPENDENT
**Automated operational score:** 70/100 — MEDIUM — APPROVE_WITH_COMMENTS
*This tool is for demonstration purposes only.*

### Summary
The AI reviewer reported 1 confirmed actionable finding(s).

### Findings
- **HIGH · SECURITY_VULNERABILITY · Custom role definition grants wildcard subscription-scope permissions far exceeding documented task requirements**
  - Category rationale: The Terraform code directly configures a custom role with actions = ["*"] at subscription scope. The tc11_requirements.tf file establishes ground truth that only two specific read actions are needed. The role's own description states 'permissions exceed the documented reporting task.' This is a demonstrated over-privilege weakness, not a hypothetical or context-dependent concern.
  - Evidence: terraform/tc11_iam.tf: resource "azurerm_role_definition" "tc11_reporting_role" — permissions { actions = ["*"] not_actions = [] } — assignable_scopes = [data.azurerm_subscription.tc11_current.id]. Contrasted with terraform/tc11_requirements.tf: tc11_required_actions = ["Microsoft.Resources/subscriptions/resourceGroups/read", "Microsoft.Resources/subscriptions/resources/read"].
  - Analysis: azurerm_role_definition.tc11_reporting_role assigns actions = ["*"] at the subscription scope (data.azurerm_subscription.tc11_current.id). The companion file tc11_requirements.tf explicitly documents that the intended task ('Read resource information for a reporting task') requires only 'Microsoft.Resources/subscriptions/resourceGroups/read' and 'Microsoft.Resources/subscriptions/resources/read'. The role description itself states 'permissions exceed the documented reporting task.' A wildcard action at subscription scope grants the ability to read, write, delete, and manage every resource type in the subscription, including IAM assignments, key vaults, storage, and compute — vastly beyond what is required. Any principal assigned this role would have effective owner-equivalent control over all resources in the subscription.
  - Impact: Any principal assigned this role gains unrestricted access to all Azure Resource Manager operations across the entire subscription. This includes the ability to create or delete resources, read secrets, modify IAM policies, and exfiltrate data — well beyond the read-only reporting intent. If this role is assigned to a compromised or malicious identity, the blast radius is the entire subscription.
  - Recommendation: Replace actions = ["*"] with the minimum required set documented in tc11_requirements.tf: ["Microsoft.Resources/subscriptions/resourceGroups/read", "Microsoft.Resources/subscriptions/resources/read"]. If the role must remain intentionally over-privileged for test-fixture purposes, it must not be deployed to a real subscription and must have no assignable_scopes pointing to a live subscription. Consider restricting assignable_scopes to a dedicated test management group or removing the resource from deployment pipelines entirely.

### Recommendation
Review and remediate the confirmed findings above.
