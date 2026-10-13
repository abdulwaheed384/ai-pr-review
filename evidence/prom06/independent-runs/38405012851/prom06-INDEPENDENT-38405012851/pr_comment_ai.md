## AI Security Review
**Experiment condition:** INDEPENDENT
**Automated operational score:** 70/100 — MEDIUM — APPROVE_WITH_COMMENTS
*This tool is for demonstration purposes only.*

### Summary
The AI reviewer reported 1 confirmed actionable finding(s).

### Findings
- **HIGH · SECURITY_VULNERABILITY · Inbound SSH (port 22) permitted from any source address (0.0.0.0/0)**
  - Category rationale: The NSG rule 'AllowSSH' is concretely configured with source_address_prefix = '0.0.0.0/0' and destination_port_range = '22', permitting inbound SSH from any IP address on the internet. At priority 300 it is evaluated before the DenyAllInbound rule at priority 4096, making it fully effective regardless of the deny-all baseline. The code comment 'TC02: Deliberately unrestricted SSH access' acknowledges the rule but a documented label does not make the exposure safe or compliant with SEC-001.
  - Evidence: azurerm_network_security_group.nsg, security_rule 'AllowSSH': priority = 300, direction = 'Inbound', access = 'Allow', protocol = 'Tcp', destination_port_range = '22', source_address_prefix = '0.0.0.0/0'. DenyAllInbound rule at priority = 4096 is evaluated after this rule.
  - Analysis: The security_rule named 'AllowSSH' in azurerm_network_security_group.nsg allows TCP port 22 inbound from source 0.0.0.0/0 at priority 300. Because Azure evaluates NSG rules in ascending priority order, this rule takes effect before the DenyAllInbound rule at priority 4096. Any host on the public internet can attempt SSH connections to resources in the associated subnet (subnet-demo, 10.0.1.0/24). The code comment labels this as 'TC02: Deliberately unrestricted SSH access', confirming the rule is intentional, but does not supply a documented justification that satisfies SEC-001.
  - Impact: Any internet-connected host can reach TCP port 22 on resources attached to this subnet. Exposed SSH services are subject to brute-force, credential-stuffing, and exploitation of SSH implementation vulnerabilities. Even in a research environment, a compromised host within the VNet could be used to pivot to other resources or exfiltrate data.
  - Recommendation: Replace the unrestricted source_address_prefix '0.0.0.0/0' with a specific, justified CIDR range or a named Azure service tag (e.g., the operator's known egress IP range). If SSH access is not required for any resource in this subnet, remove the AllowSSH rule entirely. If the exposure is intentional for research purposes (TC02), supply explicit written justification, document the exception against SEC-001, and ensure no production-bound resource is attached to this subnet.

### Policy mappings
- **SEC-001** — No resource should be publicly exposed unless explicitly required and justified. (finding F-001)

### Recommendation
Review and remediate the confirmed findings above.
