## AI Security Review
**Experiment condition:** INDEPENDENT
**Automated operational score:** 65/100 — HIGH — DO_NOT_MERGE
*This tool is for demonstration purposes only.*

### Summary
The AI reviewer reported 2 confirmed actionable finding(s).

### Findings
- **HIGH · SECURITY_VULNERABILITY · Storage account allows deprecated TLS 1.0 connections**
  - Category rationale: The storage account explicitly sets min_tls_version = 'TLS1_0', enabling TLS 1.0 and TLS 1.1 connections. TLS 1.0 and 1.1 are deprecated protocols with known vulnerabilities (POODLE, BEAST, etc.). This is a concrete, demonstrable security weakness in the supplied code regardless of workload classification.
  - Evidence: azurerm_storage_account.tc07_storage: min_tls_version = "TLS1_0" in terraform/storage.tf.
  - Analysis: The storage account 'prom06tc07storage' is configured with min_tls_version = "TLS1_0", which permits clients to connect using TLS 1.0 and TLS 1.1. Both versions have known cryptographic weaknesses and are deprecated by Microsoft. The Azure platform default and security best practice is TLS1_2.
  - Impact: Clients can negotiate TLS 1.0 or 1.1 connections to this storage account, exposing data in transit to protocol-level attacks such as POODLE and BEAST. This affects confidentiality and integrity of data transferred to and from the storage account.
  - Recommendation: Set min_tls_version = "TLS1_2" in the azurerm_storage_account resource. TLS 1.2 is the minimum acceptable version and is the Azure platform default for new storage accounts.
- **LOW · POLICY_OR_COMPLIANCE · Storage account missing mandatory tags: owner and cost-center**
  - Category rationale: Policy TAG-001 requires all taggable Azure resources to include mandatory tags: environment, owner, and cost-center. The storage account's tags block contains only 'Environment' and 'TestCase', omitting both 'owner' and 'cost-center'. This is a direct, verifiable violation of the supplied policy.
  - Evidence: azurerm_storage_account.tc07_storage tags block in terraform/storage.tf: tags = { Environment = "Research", TestCase = "TC07" }. Required keys 'owner' and 'cost-center' are not present. Policy TAG-001 in ai/policy.md mandates environment, owner, and cost-center on all taggable resources.
  - Analysis: The azurerm_storage_account.tc07_storage resource includes a tags block with 'Environment' and 'TestCase' keys only. The mandatory 'owner' and 'cost-center' tags required by TAG-001 are absent. The policy explicitly states that research deployments should use documented research values for these keys. Additionally, the tag key casing ('Environment' vs. the policy-specified 'environment') is inconsistent with the common_tags convention used elsewhere in the repository, though the primary violation is the missing required keys.
  - Impact: Resources without mandatory tags cannot be correctly attributed for cost tracking, ownership, or security governance, violating the organizational tagging policy.
  - Recommendation: Add the missing mandatory tags to the storage account. Following the pattern in local.common_tags (terraform/main.tf), the tags block should include at minimum: environment = "research", owner = "<team or owner value>", cost-center = "<cost center value>". Also align tag key casing with the repository convention (lowercase keys).

### Policy mappings
- **SEC-001** — No resource should be publicly exposed unless explicitly required and justified. (finding F-001)
- **TAG-001** — Mandatory resource tagging: environment, owner, cost-center (finding F-002)

### Recommendation
Review and remediate the confirmed findings above.
