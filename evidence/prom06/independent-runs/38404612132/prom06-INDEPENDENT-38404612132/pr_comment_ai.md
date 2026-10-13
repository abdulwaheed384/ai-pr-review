## AI Security Review
**Experiment condition:** INDEPENDENT
**Automated operational score:** 65/100 — HIGH — DO_NOT_MERGE
*This tool is for demonstration purposes only.*

### Summary
The AI reviewer reported 2 confirmed actionable finding(s).

### Findings
- **HIGH · SECURITY_VULNERABILITY · Custom role definition grants unrestricted wildcard ('*') permissions at subscription scope**
  - Category rationale: The Terraform resource directly provisions a subscription-scoped custom role definition whose only permission entry is actions = ['*'] with no not_actions constraints. This is a concrete, demonstrable over-privilege configuration: any principal assigned this role gains unrestricted control over every Azure resource type in the subscription. The risk is real at role-definition creation because the overly broad assignable_scopes and actions are immediately available for assignment, not hypothetical.
  - Evidence: azurerm_role_definition.tc10_excessive_permissions: permissions { actions = ["*"] not_actions = [] } and assignable_scopes = [data.azurerm_subscription.current.id]. The role is scoped to the subscription, not to a resource group or narrower boundary.
  - Analysis: The resource azurerm_role_definition.tc10_excessive_permissions defines a custom RBAC role with actions = ["*"] and not_actions = []. It is assignable at data.azurerm_subscription.current.id (the entire subscription). Any principal assigned this role can perform every Azure Resource Manager operation — including creating, deleting, or modifying any resource, reading secrets, modifying IAM assignments, and disabling security controls — across the full subscription. The 'research-only' comment in the file header does not restrict the role's actual Azure permissions or prevent assignment.
  - Impact: If assigned to any principal (user, group, service principal, or managed identity), this role confers full control over the entire subscription: lateral movement to all resources, privilege escalation, data exfiltration, destruction of logging and security infrastructure, and bypass of all other controls deployed in this repository.
  - Recommendation: Remove or do not deploy this role definition. If a test fixture for excessive-permission detection is genuinely required, scope the assignable_scopes to a dedicated, isolated resource group (e.g., the existing rg-network-demo-ai), replace actions = ["*"] with the minimum set of actions needed for the specific test scenario, and add lifecycle { prevent_destroy = true } with a matching role assignment removal gate. Ensure the role definition is destroyed immediately after testing and is never present in a shared or production subscription.
- **LOW · POLICY_OR_COMPLIANCE · Custom role definition is missing mandatory tags required by TAG-001**
  - Category rationale: Policy SEC-001 states that no resource should be publicly exposed unless explicitly required and justified. While the role definition itself is not a network-exposed resource, SEC-001's broader intent covers resources that create unacceptable risk exposure. More directly, the role's subscription-wide assignable_scopes without any documented justification or compensating assignment control violates the spirit of least-privilege that SEC-001 enforces. Additionally, TAG-001 requires all taggable Azure resources to include mandatory tags (environment, owner, cost-center); the azurerm_role_definition resource does not include a tags block.
  - Evidence: azurerm_role_definition.tc10_excessive_permissions: no tags argument is present in tc10_iam.tf. local.common_tags is defined in main.tf and applied to all other resources in the repository but is absent from this resource.
  - Analysis: azurerm_role_definition.tc10_excessive_permissions does not include a tags block with the mandatory environment, owner, and cost-center keys required by policy TAG-001. While azurerm_role_definition supports tags in the AzureRM provider v4, none are configured. This prevents cost attribution and environment classification for this resource.
  - Impact: The role definition cannot be identified by mandatory governance tags, preventing cost-center attribution (PROM06-RESEARCH) and environment classification. Operationally this is low impact but violates the TAG-001 compliance requirement.
  - Recommendation: Add tags = local.common_tags to azurerm_role_definition.tc10_excessive_permissions, consistent with all other tagged resources in this repository.

### Policy mappings
- **TAG-001** — Mandatory resource tagging (environment, owner, cost-center) (finding F-002)

### Recommendation
Review and remediate the confirmed findings above.
