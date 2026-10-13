## AI Security Review
**Experiment condition:** INDEPENDENT
**Automated operational score:** 65/100 — HIGH — DO_NOT_MERGE
*This tool is for demonstration purposes only.*

### Summary
The AI reviewer reported 2 confirmed actionable finding(s).

### Findings
- **HIGH · SECURITY_VULNERABILITY · Subscription-scoped wildcard role definition grants unrestricted ARM permissions**
  - Category rationale: The role definition configures actions = ["*"] at subscription scope with no not_actions exclusions. When assigned, this permits every ARM operation on every resource in the subscription. The Terraform resource will be created as a live Azure object upon apply regardless of the code comment; there is no conditional or count = 0 guard. This is a concrete, deployable excessive-privilege definition that violates least-privilege principles and the supplied SEC-001 policy.
  - Evidence: Resource azurerm_role_definition.tc10_excessive_permissions: permissions { actions = ["*"], not_actions = [] }, assignable_scopes = [data.azurerm_subscription.current.id], scope = data.azurerm_subscription.current.id. No count or conditional expression present.
  - Analysis: azurerm_role_definition.tc10_excessive_permissions defines a custom role with actions = ["*"] and not_actions = [], assigned at the subscription scope (data.azurerm_subscription.current.id). Any principal assigned this role gains the ability to perform every Azure Resource Manager operation—including creating, modifying, and deleting resources, reading secrets, and managing role assignments—across the entire subscription. The code comment 'Research-only test fixture. Do not deploy.' is not a Terraform guard; the resource will be provisioned on terraform apply. No count, lifecycle condition, or workspace-gating mechanism is present to prevent accidental or intentional deployment and subsequent assignment.
  - Impact: If this role is assigned to any principal (user, service principal, or managed identity), that principal receives unrestricted control of the subscription: data exfiltration, privilege escalation, resource destruction, and lateral movement across all services are possible. The broad assignable_scopes at subscription level means the role is available for assignment to any resource group or resource within the subscription.
  - Recommendation: Remove this resource from the Terraform configuration or gate it with count = 0 (or a feature-flag variable defaulting to 0) to prevent deployment. If the role must exist for research testing, scope it to a dedicated, isolated resource group rather than the subscription, restrict actions to the minimum required for the test scenario, and add not_actions exclusions for sensitive namespaces (e.g., Microsoft.Authorization/*/write, Microsoft.KeyVault/*/). Ensure no role assignment resource references this definition in any applied configuration.
- **LOW · POLICY_OR_COMPLIANCE · Custom role definition missing mandatory tags required by TAG-001**
  - Category rationale: TAG-001 requires all taggable Azure resources to include the mandatory tags: environment, owner, cost-center. The azurerm_role_definition resource supports tags in the azurerm provider and the resource is missing a tags argument entirely. The common_tags local is defined in main.tf and used consistently on all other resources in the repository but is absent from this resource.
  - Evidence: Resource azurerm_role_definition.tc10_excessive_permissions in terraform/tc10_iam.tf: no tags argument present. local.common_tags defined in terraform/main.tf with keys environment, owner, cost-center, research_case. All other taggable resources in the repository include tags = local.common_tags.
  - Analysis: The azurerm_role_definition.tc10_excessive_permissions resource does not include a tags block. TAG-001 requires every taggable Azure resource to carry the mandatory tags: environment, owner, and cost-center. All other resources in the repository (azurerm_resource_group, azurerm_virtual_network, azurerm_network_security_group, azurerm_log_analytics_workspace, etc.) apply tags = local.common_tags, but this new resource omits the tags argument entirely.
  - Impact: The role definition is untagged and cannot be associated with the correct cost center or environment in billing, compliance, or asset-management tooling. This breaks the TAG-001 mandatory tagging posture.
  - Recommendation: Add tags = local.common_tags to azurerm_role_definition.tc10_excessive_permissions, consistent with all other resources in this repository.

### Policy mappings
- **SEC-001** — No resource should be publicly exposed unless explicitly required and justified. (finding F-001)
- **TAG-001** — All taggable Azure resources must include mandatory tags: environment, owner, cost-center. (finding F-002)

### Recommendation
Review and remediate the confirmed findings above.
