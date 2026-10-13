## AI Security Review
**Experiment condition:** INDEPENDENT
**Automated operational score:** 85/100 — LOW — APPROVE
*This tool is for demonstration purposes only.*

### Summary
The AI reviewer reported 1 confirmed actionable finding(s).

### Findings
- **MEDIUM · POLICY_OR_COMPLIANCE · No diagnostic setting configured to forward NSG logs to Log Analytics**
  - Category rationale: Policy LOG-001 requires that resources exposing Azure Monitor diagnostic categories have security-relevant logs enabled and forwarded to Log Analytics. Azure NSGs support diagnostic categories (NetworkSecurityGroupEvent, NetworkSecurityGroupRuleCounter, and NSG flow logs). No azurerm_monitor_diagnostic_setting or azurerm_network_watcher_flow_log resource is present in any supplied Terraform file. The Log Analytics workspace (law-prom06-tc01-uks) is provisioned but no resource links it to the NSG for diagnostic forwarding.
  - Evidence: azurerm_network_security_group.nsg is defined in terraform/nsg.tf with no accompanying azurerm_monitor_diagnostic_setting. azurerm_log_analytics_workspace.network is defined in the same file but no resource connects the two. No diagnostic setting or flow log resource appears in any other supplied context file (main.tf, network.tf, outputs.tf, provider.tf, variables.tf).
  - Analysis: An azurerm_monitor_diagnostic_setting targeting azurerm_network_security_group.nsg and forwarding to azurerm_log_analytics_workspace.network is absent from all supplied Terraform files. Although the Log Analytics workspace, AMPLS, and private endpoint are fully provisioned, the NSG does not have a diagnostic setting resource that enables and routes its supported log categories (NetworkSecurityGroupEvent, NetworkSecurityGroupRuleCounter) to the workspace. This means NSG security event data will not be collected, violating LOG-001.
  - Impact: NSG security event and rule-counter logs will not be captured in the Log Analytics workspace. Security-relevant network activity at the NSG boundary (denied inbound/outbound connections, rule evaluations) will be invisible to operators, undermining the stated TC01 log-collection requirement and violating LOG-001.
  - Recommendation: Add an azurerm_monitor_diagnostic_setting resource targeting azurerm_network_security_group.nsg, with log categories NetworkSecurityGroupEvent and NetworkSecurityGroupRuleCounter enabled, and destination set to azurerm_log_analytics_workspace.network.id. Example:

resource "azurerm_monitor_diagnostic_setting" "nsg" {
  name                       = "diag-nsg-demo-ai"
  target_resource_id         = azurerm_network_security_group.nsg.id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.network.id

  enabled_log { category = "NetworkSecurityGroupEvent" }
  enabled_log { category = "NetworkSecurityGroupRuleCounter" }
}

### Policy mappings
- **LOG-001** — Diagnostic logs must be enabled and forwarded to Log Analytics for resources exposing Azure Monitor diagnostic categories (finding F-001)

### Recommendation
Review and remediate the confirmed findings above.
