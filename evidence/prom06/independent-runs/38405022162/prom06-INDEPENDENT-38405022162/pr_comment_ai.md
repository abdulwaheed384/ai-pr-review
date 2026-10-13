## AI Security Review
**Experiment condition:** INDEPENDENT
**Automated operational score:** 70/100 — MEDIUM — APPROVE_WITH_COMMENTS
*This tool is for demonstration purposes only.*

### Summary
The AI reviewer reported 1 confirmed actionable finding(s).

### Findings
- **HIGH · SECURITY_VULNERABILITY · Unrestricted inbound RDP (port 3389) permitted from 0.0.0.0/0**
  - Category rationale: The NSG security_rule 'AllowRDP' permits inbound TCP port 3389 from source_address_prefix '0.0.0.0/0' to any destination. This is a concrete, demonstrated configuration that exposes RDP to the public internet. The inline comment acknowledges the rule is 'deliberately unrestricted' and 'insecure'. The SEC-001 policy requires that no resource be publicly exposed unless explicitly required and justified; the code comment asserts testing justification but provides no scope-limiting control such as a restricted source prefix, JIT access policy, or time-bound mechanism. The priority-301 rule is evaluated before the priority-4096 DenyAllInbound rule, confirming it is effective.
  - Evidence: azurerm_network_security_group.nsg, security_rule 'AllowRDP': direction='Inbound', access='Allow', protocol='Tcp', destination_port_range='3389', source_address_prefix='0.0.0.0/0', priority=301. Comment reads: '# TC03: Deliberately unrestricted RDP access. This insecure rule is for controlled security testing only.'
  - Analysis: The NSG resource 'azurerm_network_security_group.nsg' contains a security_rule named 'AllowRDP' at priority 301 that allows inbound TCP traffic on port 3389 from any source address (0.0.0.0/0) to any destination in the subnet. RDP exposed to the public internet is a high-value attack surface: it is routinely targeted by brute-force, credential-stuffing, and exploitation campaigns. The in-code justification ('controlled security testing only') does not configure a technical restriction on who can reach the port.
  - Impact: Any host on the public internet can attempt RDP connections to resources in subnet-demo (10.0.1.0/24). Even in a research or testing context, a reachable RDP port can be exploited to gain unauthorised interactive access, pivot to connected networks, or be used as a command-and-control foothold if credentials are weak or a vulnerability exists in the RDP implementation.
  - Recommendation: Restrict source_address_prefix to a specific trusted IP range (e.g., the organisation's egress NAT IP or VPN gateway prefix) rather than 0.0.0.0/0. If unrestricted access is genuinely required for a time-limited test, document a planned removal date and consider using Azure Just-In-Time VM access or a Bastion host to avoid persistent public exposure. Remove or tighten the rule immediately after testing is complete.

### Policy mappings
- **SEC-001** — No resource should be publicly exposed unless explicitly required and justified. (finding F-001)

### Recommendation
Review and remediate the confirmed findings above.
