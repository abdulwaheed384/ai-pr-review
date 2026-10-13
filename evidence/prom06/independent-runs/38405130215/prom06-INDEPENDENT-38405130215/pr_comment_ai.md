## AI Security Review
**Experiment condition:** INDEPENDENT
**Automated operational score:** 40/100 — CRITICAL — DO_NOT_MERGE
*This tool is for demonstration purposes only.*

### Summary
The AI reviewer reported 2 confirmed actionable finding(s).

### Findings
- **HIGH · SECURITY_VULNERABILITY · Unrestricted inbound RDP access from any source (0.0.0.0/0) on port 3389**
  - Category rationale: The NSG security rule 'AllowRDP' permits unrestricted inbound TCP traffic on port 3389 from any source (0.0.0.0/0) at priority 301, which evaluates before the DenyAllInbound rule at priority 4096. This is a concrete, currently deployed security weakness: any host on the internet can attempt RDP connections to resources in the associated subnet. The comment acknowledges this is deliberate for testing (TC03), but the code as written exposes RDP publicly, which is a demonstrated vulnerability in the supplied configuration.
  - Evidence: azurerm_network_security_group.nsg, security_rule 'AllowRDP': priority=301, direction=Inbound, access=Allow, protocol=Tcp, source_address_prefix='0.0.0.0/0', destination_port_range='3389'. Associated with azurerm_subnet.subnet via azurerm_subnet_network_security_group_association.subnet.
  - Analysis: The NSG 'nsg-demo-ai' contains a security rule named 'AllowRDP' at priority 301 that allows inbound TCP traffic on destination port 3389 from source_address_prefix '0.0.0.0/0' to any destination. Because this rule is evaluated at priority 301, it takes precedence over the explicit DenyAllInbound rule at priority 4096. Any internet host can reach RDP on resources in the associated subnet (subnet-demo, 10.0.1.0/24). The inline comment cites TC03 and describes this as a controlled security testing rule, but no compensating access control (such as a JIT policy, source IP restriction, or bastion host) is configured in the supplied files.
  - Impact: Any internet-reachable host on the subnet is exposed to brute-force, credential-stuffing, and exploitation attempts against RDP. Even in a research context this creates attack surface that could result in unauthorised access, lateral movement, or data exfiltration if any workload is deployed into the subnet.
  - Recommendation: Restrict source_address_prefix to a known operator or management IP range rather than '0.0.0.0/0'. If RDP access is genuinely required for testing, scope it to specific source CIDRs or use Azure Bastion with a dedicated subnet. If public RDP is a deliberate test condition, document the time-bounded nature and ensure no persistent workloads are deployed into the subnet while the rule is active.
- **HIGH · POLICY_OR_COMPLIANCE · SEC-001 violation: public RDP exposure without documented policy justification**
  - Category rationale: Policy SEC-001 states that no resource should be publicly exposed unless explicitly required and justified. The AllowRDP rule exposes RDP to 0.0.0.0/0. The comment references TC03 as the justification, but TC03 is not a supplied policy document and is not part of the reviewed policy set; policy.md SEC-001 does not recognise a test-case identifier as sufficient justification within the policy framework. This is a policy mapping to F-001, not an independent finding.
  - Evidence: azurerm_network_security_group.nsg, security_rule 'AllowRDP': source_address_prefix='0.0.0.0/0', destination_port_range='3389'. Policy SEC-001: 'No resource should be publicly exposed unless explicitly required and justified.'
  - Analysis: SEC-001 requires that no resource be publicly exposed unless explicitly required and justified within the policy framework. The 'AllowRDP' rule at priority 301 exposes port 3389 to 0.0.0.0/0. The inline code comment ('TC03: Deliberately unrestricted RDP access for controlled security testing') references a test-case identifier not defined in the supplied policy documentation. This does not constitute a policy-recognised justification under SEC-001.
  - Impact: Same as F-001: internet-wide RDP exposure on the associated subnet.
  - Recommendation: Supply a formal policy exception or change request referencing SEC-001 if public RDP is a documented test requirement, or restrict the source range as described in F-001.

### Policy mappings
- **SEC-001** — No public exposure without explicit justification (finding F-001)

### Recommendation
Review and remediate the confirmed findings above.
