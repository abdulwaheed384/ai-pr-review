## AI Security Review
**Experiment condition:** INDEPENDENT
**Automated operational score:** 65/100 — HIGH — DO_NOT_MERGE
*This tool is for demonstration purposes only.*

### Summary
The AI reviewer reported 2 confirmed actionable finding(s).

### Findings
- **HIGH · SECURITY_VULNERABILITY · Storage account permits insecure TLS 1.0 and TLS 1.1 connections**
  - Category rationale: The Terraform resource explicitly sets min_tls_version = "TLS1_0", which permits connections using TLS 1.0 and TLS 1.1. These protocol versions have known cryptographic weaknesses (POODLE, BEAST, deprecated cipher suites) and are considered insecure. This is a demonstrable current weakness in the supplied code regardless of workload classification.
  - Evidence: Resource azurerm_storage_account.tc07_storage in terraform/storage.tf: min_tls_version = "TLS1_0"
  - Analysis: The storage account prom06tc07storage sets min_tls_version = "TLS1_0", allowing clients to negotiate TLS 1.0 or TLS 1.1 sessions. Both protocol versions are deprecated and known to be vulnerable to attacks such as POODLE and BEAST. Azure Storage defaults to TLS1_2 when this attribute is omitted; setting it to TLS1_0 is an explicit downgrade. The Azure provider documentation and Microsoft guidance recommend TLS1_2 as the minimum.
  - Impact: Any client or service communicating with this storage account over TLS 1.0 or 1.1 is exposed to protocol-level attacks that can result in session interception or data exposure in transit.
  - Recommendation: Set min_tls_version = "TLS1_2" in the azurerm_storage_account resource. TLS 1.2 is the current Azure platform minimum recommendation and eliminates the known weaknesses of earlier protocol versions.
- **LOW · POLICY_OR_COMPLIANCE · Storage account missing mandatory tags: owner, cost-center, research_case**
  - Category rationale: Policy TAG-001 requires all taggable Azure resources to include mandatory tags: environment, owner, cost-center, and research_case. The storage account includes only Environment and TestCase tags; owner, cost-center, and research_case are absent. The storage account is a taggable resource and the policy applies.
  - Evidence: Resource azurerm_storage_account.tc07_storage in terraform/storage.tf: tags block contains only { Environment = "Research", TestCase = "TC07" }. Required tags owner, cost-center, and research_case are absent.
  - Analysis: TAG-001 mandates that all taggable Azure resources include four tags: environment, owner, cost-center, and research_case. The azurerm_storage_account.tc07_storage resource defines only Environment and TestCase tags. The three required tags owner, cost-center, and research_case are not present. Note also that the tag key Environment uses a capital E, which may diverge from the lowercase environment convention used in local.common_tags elsewhere in the repository, though the policy does not enforce case.
  - Impact: Missing mandatory tags prevent accurate cost attribution, ownership identification, and research case traceability, violating TAG-001 governance requirements.
  - Recommendation: Add the missing mandatory tags to the storage account. For consistency with the repository pattern, extend or replace the inline tags block with values equivalent to local.common_tags, or define a local for TC07 that includes environment, owner, cost-center, and research_case with appropriate TC07 values.

### Policy mappings
- **SEC-001** — No resource should be publicly exposed unless explicitly required and justified. (finding F-001)
- **TAG-001** — All taggable Azure resources must include mandatory tags: environment, owner, cost-center, research_case. (finding F-002)

### Recommendation
Review and remediate the confirmed findings above.
