## AI Security Review
**Experiment condition:** INDEPENDENT
**Automated operational score:** 70/100 — MEDIUM — APPROVE_WITH_COMMENTS
*This tool is for demonstration purposes only.*

### Summary
The AI reviewer reported 1 confirmed actionable finding(s).

### Findings
- **HIGH · SECURITY_VULNERABILITY · NSG permits inbound SSH (TCP/22) from any source (0.0.0.0/0)**
  - Category rationale: The NSG security_rule 'AllowSSH' explicitly permits inbound TCP port 22 from source_address_prefix '0.0.0.0/0' to any destination at priority 300, which is evaluated before the DenyAllInbound rule at priority 4096. This exposes SSH on any attached resource to the entire internet. The inline comment '# TC02: Deliberately unrestricted SSH access' acknowledges this is intentional for the test case, but it constitutes a concrete, demonstrable security weakness in the deployed configuration regardless of research intent.
  - Evidence: azurerm_network_security_group.nsg, security_rule 'AllowSSH': priority = 300, direction = 'Inbound', access = 'Allow', protocol = 'Tcp', destination_port_range = '22', source_address_prefix = '0.0.0.0/0'. The DenyAllInbound rule at priority 4096 does not block traffic matched by this earlier rule.
  - Analysis: The 'AllowSSH' security rule in azurerm_network_security_group.nsg grants inbound access on TCP port 22 from all IP addresses (source_address_prefix = '0.0.0.0/0') at priority 300. Because lower numeric priorities are evaluated first in Azure NSGs, this rule takes precedence over the 'DenyAllInbound' rule at priority 4096, meaning any host on the internet can attempt SSH connections to resources associated with this NSG. The TC02 comment documents this as deliberate, but the configuration still represents an unrestricted public exposure of a sensitive administrative port.
  - Impact: Any internet host can initiate TCP connections to port 22 on resources in subnet-demo (10.0.1.0/24) that are associated with nsg-demo-ai. If any VM or other SSH-capable resource is attached to this subnet, it is exposed to brute-force, credential stuffing, and exploitation of SSH vulnerabilities from the entire internet.
  - Recommendation: Restrict source_address_prefix to a known management IP range or a private CIDR (e.g., the VNet address space '10.0.0.0/16') rather than '0.0.0.0/0'. If internet-reachable SSH is required by the test case, document the compensating controls (e.g., key-only authentication, fail2ban, no VM currently attached) and set a planned expiry. Remove or restrict the rule when TC02 testing is complete. Per SEC-001, public exposure must be explicitly required and justified.

### Policy mappings
- **SEC-001** — No resource should be publicly exposed unless explicitly required and justified. (finding F-001)

### Recommendation
Review and remediate the confirmed findings above.
