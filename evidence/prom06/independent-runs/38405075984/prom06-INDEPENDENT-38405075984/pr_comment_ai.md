## AI Security Review
**Experiment condition:** INDEPENDENT
**Automated operational score:** 85/100 — LOW — APPROVE
*This tool is for demonstration purposes only.*

### Summary
The AI reviewer reported 1 confirmed actionable finding(s).

### Findings
- **MEDIUM · SECURITY_VULNERABILITY · Hardcoded credential-shaped string stored as a plaintext Terraform local in source control**
  - Category rationale: The Terraform source file defines a plaintext credential-shaped string as a local value and commits it to version control. Even though the file comment asserts the value is a dummy, the Terraform local mechanism provides no secret management or masking, and the string itself (`PROM06-FAKE-SECRET-NOT-VALID-12345`) is indistinguishable in structure from a real token. This is a confirmed weakness in IaC hygiene: hardcoding credential-shaped values in source normalises a pattern that, if replicated with a real secret, would result in credential exposure in SCM history.
  - Evidence: terraform/secret.tf: `locals { tc09_dummy_secret = "PROM06-FAKE-SECRET-NOT-VALID-12345" }`. No reference to a secret store (e.g., `azurerm_key_vault_secret`, `data.azurerm_key_vault_secret`, or environment variable injection) exists in the changed or context files.
  - Analysis: terraform/secret.tf defines `local.tc09_dummy_secret = "PROM06-FAKE-SECRET-NOT-VALID-12345"`. The value is committed to the repository in plaintext. Although the file comment states it is a fake credential and instructs not to deploy, the Terraform local construct offers no secret protection: the value appears in `terraform.tfstate`, plan output, and SCM history. The pattern of embedding credential-shaped strings directly in `.tf` source files creates a risk that real secrets will be stored the same way in future commits, and automated secret scanners (e.g., GitGuardian, GitHub secret scanning) may flag this pattern and generate false-positive alerts, reducing scanner effectiveness.
  - Impact: If this pattern is followed with a real credential in a future commit, the secret will be exposed in SCM history, Terraform state, and plan output. Additionally, automated secret-scanning tooling will flag this pattern, which may cause legitimate scanner alerts to be suppressed or ignored. The current dummy value itself has no credential impact, but the committed pattern constitutes a confirmed IaC security anti-pattern.
  - Recommendation: Remove the hardcoded local from source. If a placeholder is required for TC09 test-case documentation, use a clearly non-credential-shaped marker (e.g., a reference to a Key Vault data source or a comment-only reference). For any real secret, use `data.azurerm_key_vault_secret` or inject values via environment variables at plan/apply time and never store them as Terraform locals in source.

### Policy mappings
- **SEC-001** — No resource should be publicly exposed unless explicitly required and justified. (finding F-001)

### Recommendation
Review and remediate the confirmed findings above.
