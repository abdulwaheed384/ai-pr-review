# TC01 clean-baseline correction

This directory records the corrected TC01 Terraform configuration and local scanner observations. It is separate from the earlier TC01 attempt and does not replace its results.

## Correction scope

The configuration in `terraform/` contains the existing Resource Group, VNet, Subnet, and NSG. This correction removes custom public DNS so Azure default DNS applies, associates the Subnet with the NSG, and removes the unrestricted inbound SSH and HTTP rules. No DDoS setting, diagnostics, organizational tags, Key Vault, Storage Account, IAM/RBAC, or public application endpoint was added. No Azure deployment was performed.

Expected state for TC01: subnet-to-NSG association is explicit; there are no custom DNS servers, no custom inbound allow rules, and no unrestricted SSH or HTTP exposure. This is the bounded clean network baseline, not a production deployment.

## Historical evidence retained

The following files existed before this correction and were left untouched. Byte-for-byte copies are included in `historical-existing/` so the pre-correction scanner output remains available in this branch. These are historical outputs and must not be interpreted as the corrected scan:

- [`historical-existing/evidence/checkov-baseline.json`](historical-existing/evidence/checkov-baseline.json)
- [`historical-existing/evidence/tfsec-baseline.json`](historical-existing/evidence/tfsec-baseline.json)
- [`historical-existing/terraform/checkov-baseline.json`](historical-existing/terraform/checkov-baseline.json)
- [`historical-existing/terraform/tfsec-baseline.json`](historical-existing/terraform/tfsec-baseline.json)

The copies were checked against the pre-existing workspace files by SHA-256 and are byte-identical. Their association with a specific GitHub Actions run was not independently verified; PR #45's conversation and workflow evidence remain unchanged. The corrected raw scans below are stored separately in this new directory.

## Corrected local validation

- Terraform: 1.14.9; locked AzureRM provider: 4.81.0.
- `terraform -chdir=terraform fmt -recursive`: completed.
- `terraform -chdir=terraform fmt -check -recursive`: passed.
- `terraform -chdir=terraform validate`: passed after reinitializing the cached provider. The local AzureRM plugin intermittently failed to start before reinitialization; this was a local provider startup issue, not a Terraform diagnostic.
- Checkov: 3.3.1; command: `checkov -d terraform --framework terraform --output json`; exit code 0; 7 passed, 0 failed, 0 skipped.
- tfsec: 1.28.14; command: `tfsec terraform --format json`; exit code 0; 0 findings.
- Raw machine output: [`checkov-correction.json`](checkov-correction.json) and [`tfsec-correction.json`](tfsec-correction.json). Exit codes, versions, and stderr are retained alongside them.
- Checkov emitted a network/DNS warning while retrieving optional Prisma Cloud guideline mappings. It still completed with exit code 0 and valid JSON. This warning is preserved in `checkov-stderr.log`.
- tfsec emitted its standard maintenance notice on stderr; its scan completed with exit code 0 and valid JSON.
- Historical pre-correction local JSON counts: Checkov reported 11 passed, 4 failed, 0 skipped; tfsec reported 3 findings. These counts are from the preserved local JSON files, not a claim about the PR #45 workflow run.

## PR and AI evidence

- Correction branch: `experiment/tc01-clean-baseline-correction`.
- PR: pending creation; target `main`.
- Intended condition: C (Checkov + tfsec + AI), selected by the existing PR workflow default.
- AI model/configuration: the existing Claude PR-diff reviewer and its checked-in prompt/configuration. It receives changed Terraform only; scanner results are not passed to it.
- AI raw output, rendered AI comment, PR comments, and GitHub Actions run: pending the actual PR workflow. No AI result is claimed here.

This correction is supported by the observed local Terraform, Checkov, and tfsec results. Formal TC01 recording still requires the independent Condition C GitHub Actions run and its AI evidence.
