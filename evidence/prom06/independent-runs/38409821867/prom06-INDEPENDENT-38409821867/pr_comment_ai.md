## AI Security Review
**Experiment condition:** INDEPENDENT
**Automated operational score:** 70/100 — MEDIUM — APPROVE_WITH_COMMENTS
*This tool is for demonstration purposes only.*

### Summary
The AI reviewer reported 1 confirmed actionable finding(s).

### Findings
- **HIGH · SECURITY_VULNERABILITY · Hardcoded plaintext password in Terraform variable default**
  - Category rationale: The variable 'admin_password' in tc15_variables.tf contains a hardcoded plaintext password as its default value ('Prom06-Lab-Passw0rd-2026'). This value is committed to source control, making it readable to any party with repository access. A default value in a Terraform variable is stored in the state file and version history regardless of whether the variable is overridden at runtime. This is a concrete, demonstrated weakness independent of the research or non-production context.
  - Evidence: terraform/tc15_variables.tf: variable "admin_password" { default = "Prom06-Lab-Passw0rd-2026" }
  - Analysis: The file tc15_variables.tf declares a variable 'admin_password' with a hardcoded default value of 'Prom06-Lab-Passw0rd-2026'. Any credential stored as a Terraform variable default is committed to version control in plaintext and will appear in the Terraform state file. This exposes the credential to all repository contributors, CI/CD pipeline logs, and anyone with access to the state backend, for the lifetime of the repository history.
  - Impact: The password is exposed in version control history and Terraform state. If this credential is used against any deployed resource (e.g., a database), it can be extracted by any party with repository read access or state backend access. Even if the variable is overridden at deploy time, the default value persists in git history and may be mistakenly used in non-production deployments.
  - Recommendation: Remove the default value entirely so that Terraform requires the caller to supply the password explicitly at plan/apply time. Source the secret from a secure store such as Azure Key Vault (via a data source), a CI/CD secret variable, or a secrets management tool. If the default has already been committed, rotate the credential and consider the previous value permanently compromised. Example: remove the 'default' attribute and retrieve the value with 'data "azurerm_key_vault_secret"' or pass it via a TF_VAR_ environment variable from the pipeline secrets store.

### Policy mappings
- **SEC-001** — No resource should be publicly exposed unless explicitly required and justified. (finding F-001)

### Recommendation
Review and remediate the confirmed findings above.
