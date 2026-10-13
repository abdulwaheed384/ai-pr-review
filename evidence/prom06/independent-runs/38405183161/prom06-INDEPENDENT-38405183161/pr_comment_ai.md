## AI Security Review
**Experiment condition:** INDEPENDENT
**Automated operational score:** 85/100 — LOW — APPROVE
*This tool is for demonstration purposes only.*

### Summary
The AI reviewer reported 1 confirmed actionable finding(s).

### Findings
- **MEDIUM · SECURITY_VULNERABILITY · Hardcoded secret-like string embedded in Terraform local value**
  - Category rationale: A plaintext credential-like string is hardcoded directly in a Terraform local value in source-controlled code. Even though the file comment states it is a dummy value for research testing, the value is indistinguishable from a real secret to secret-scanning tools and to future contributors who may copy the pattern. Hardcoding secrets—real or placeholder—in IaC source files is a demonstrated bad practice that the supplied code exhibits right now, independent of deployment intent.
  - Evidence: terraform/secret.tf: `locals { tc09_dummy_secret = "PROM06-FAKE-SECRET-NOT-VALID-12345" }`. The value is a bare string literal with no sensitivity marker and no external secret reference.
  - Analysis: terraform/secret.tf defines a Terraform local named `tc09_dummy_secret` whose value is the plaintext string `"PROM06-FAKE-SECRET-NOT-VALID-12345"`. The file comment states this is a research test and not a real credential, and instructs that it must not be deployed. Despite that intent, the pattern of storing any credential-like value as a Terraform local in version-controlled source introduces concrete risks: (1) automated secret-scanning tools (e.g., GitHub secret scanning, truffleHog, detect-secrets) will alert on the value regardless of comments; (2) the pattern normalises hardcoded secrets in the codebase and may be replicated with real values by contributors; (3) Terraform state, plan output, and CI logs will contain the plaintext value if the configuration is ever applied. The file provides no mechanism—such as a reference to Azure Key Vault or a Terraform variable with `sensitive = true`—to prevent accidental promotion to a real secret.
  - Impact: If this pattern is replicated with a real credential, the secret would be stored in plaintext in version control, Terraform state, and CI artefacts. Even as a declared dummy, it will trigger secret-scanning alerts and may desensitise reviewers to hardcoded values in this codebase. There is no technical control preventing the value from being replaced with a real secret and applied.
  - Recommendation: Remove the hardcoded string from source control entirely. If a placeholder is required for research testing of secret-detection tooling, use a clearly structured test fixture outside the deployable Terraform configuration (e.g., a dedicated test-fixtures directory with a README that explicitly excludes it from `terraform apply`). For any real secret references, use `data "azurerm_key_vault_secret"` or a `variable` block with `sensitive = true` and supply the value at runtime, never as a literal in source.

### Policy mappings
- **SEC-001** — No resource should be publicly exposed unless explicitly required and justified. (finding F-001)

### Recommendation
Review and remediate the confirmed findings above.
