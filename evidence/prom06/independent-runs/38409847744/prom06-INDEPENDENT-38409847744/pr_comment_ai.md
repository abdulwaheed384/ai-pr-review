## AI Security Review
**Experiment condition:** INDEPENDENT
**Automated operational score:** 70/100 — MEDIUM — APPROVE_WITH_COMMENTS
*This tool is for demonstration purposes only.*

### Summary
The AI reviewer reported 1 confirmed actionable finding(s).

### Findings
- **HIGH · SECURITY_VULNERABILITY · Hardcoded plaintext database password committed as a Terraform variable default**
  - Category rationale: The variable 'admin_password' in tc15_variables.tf has a plaintext hardcoded default value 'Prom06-Lab-Passw0rd-2026'. This default is committed to version control and will be recorded in Terraform state in plaintext. Any actor with read access to the repository or state backend can recover the credential without further privilege escalation.
  - Evidence: terraform/tc15_variables.tf — variable "admin_password" { default = "Prom06-Lab-Passw0rd-2026" }
  - Analysis: The file tc15_variables.tf declares a variable 'admin_password' with a hardcoded string default 'Prom06-Lab-Passw0rd-2026'. Terraform variable defaults are stored in source control and, when the variable is consumed by a resource, the resolved value is also written to Terraform state in plaintext. Even if the resource consuming this variable is not present in the supplied files, the default itself is exposed to all repository readers and to any system (CI runner, artifact store) that processes the Terraform directory. The file comment states 'Do not deploy', but the default value is still committed and readable.
  - Impact: The password is exposed to anyone with repository read access, CI/CD log access, or Terraform state access. If this credential is reused or if the fixture is accidentally applied, the database account it protects is immediately compromised without requiring any additional attack steps.
  - Recommendation: Remove the default value entirely so that Terraform requires the caller to supply the password explicitly (type = string, no default, sensitive = true). Source the value at apply-time from a secrets manager (e.g., Azure Key Vault via data source, or a Terraform Cloud/workspace variable marked sensitive). Mark the variable sensitive = true to suppress it from plan/apply output and reduce state exposure. Rotate the committed credential immediately if it has been or could be applied to any environment.

### Policy mappings
- **SEC-001** — No resource should be publicly exposed unless explicitly required and justified. (finding F-001)

### Recommendation
Review and remediate the confirmed findings above.
