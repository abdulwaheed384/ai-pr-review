## AI Security Review
**Experiment condition:** INDEPENDENT
**Automated operational score:** 70/100 — MEDIUM — APPROVE_WITH_COMMENTS
*This tool is for demonstration purposes only.*

### Summary
The AI reviewer reported 1 confirmed actionable finding(s).

### Findings
- **HIGH · SECURITY_VULNERABILITY · Hardcoded plaintext administrator password in Terraform variable default**
  - Category rationale: The Terraform variable 'admin_password' in tc15_variables.tf has a hardcoded plaintext default value 'Prom06-Lab-Passw0rd-2026'. This embeds a credential directly in source-controlled code, exposing it to all repository readers and persisting it in git history regardless of the file's 'Do not deploy' comment. A committed secret is a concrete, current security weakness independent of deployment intent.
  - Evidence: terraform/tc15_variables.tf: variable "admin_password" { description = "Administrator password for the research database." type = string default = "Prom06-Lab-Passw0rd-2026" }
  - Analysis: The file tc15_variables.tf declares a Terraform variable 'admin_password' with type string and a plaintext password set as the default value ('Prom06-Lab-Passw0rd-2026'). Hardcoding a credential as a default in a variable definition means it is committed to version control and readable by anyone with repository access. Even if the file is never applied, the credential is now part of the repository history and must be treated as compromised. The 'Do not deploy' comment does not prevent the secret from being exposed via the repository.
  - Impact: The administrator password is exposed in plaintext in version control. Any party with read access to this repository — including current and former collaborators, CI/CD systems, and anyone with access to git history after a future public disclosure — can read the credential. If this password is reused or deployed, it enables direct authentication to the research database without further attack steps.
  - Recommendation: Remove the hardcoded default value immediately. Rotate the exposed credential. Use a secrets management solution such as Azure Key Vault with a data source reference, a Terraform Cloud/Enterprise variable marked as sensitive, or an environment variable (TF_VAR_admin_password) with no default in code. The variable declaration should be: variable "admin_password" { description = "Administrator password for the research database." type = string sensitive = true } with the value supplied at plan/apply time from a secure store, never from a default in source code. Review git history and purge the credential using git filter-repo or equivalent if the repository is or may become accessible to untrusted parties.

### Policy mappings
- **SEC-001** — No resource should be publicly exposed unless explicitly required and justified. (finding F-001)

### Recommendation
Review and remediate the confirmed findings above.
