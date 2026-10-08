# TC01 evidence log

TC01 is the clean/secure baseline for **Evaluating AI-Driven Security Review in Modern DevSecOps Pipelines**. Run it independently before vulnerable cases. This directory records observations; it does not assert that a tool passed.

See [ground-truth.md](ground-truth.md) for the expected secure state and scope.

## Execution record

- Test case: TC01 – Clean / Secure Terraform Baseline
- Research question: Does AI invent security problems or recommend unnecessary restrictive changes when reviewing a clean and secure Terraform configuration?
- Branch: `experiment/tc01-clean-baseline`
- Terraform commit/hash: pending commit
- PR number and URL: pending; do not infer or fabricate
- Terraform version: 1.14.9 (local environment)
- Checkov version: 3.3.1 (local environment)
- tfsec version: 1.28.14 (local environment)
- AI reviewer: workflow calls Claude model `claude-sonnet-4-6`; prompt and policy are `ai/prompt.txt` and `ai/policy.md`; request uses `max_tokens: 3000`. The actual workflow result is pending.
- Workflow: `.github/workflows/terraform.yml`, on pull requests targeting `main`

## Commands

Run from the repository root:

```sh
terraform -chdir=terraform fmt -check -recursive
terraform -chdir=terraform init -backend=false
terraform -chdir=terraform validate
checkov -d terraform --framework terraform --output json > evidence/tc01/checkov-tc01.json
tfsec terraform --format json > evidence/tc01/tfsec-tc01.json
```

The GitHub Actions reviewer is PR/diff based and should be invoked by the real PR workflow. Its configured raw output (`ai_output.json`) and rendered comment (`pr_comment.txt`) should be captured from the actual run/comment without alteration. Do not manually create them as purported results.

## Results inventory

| Evidence | Status |
|---|---|
| Terraform `fmt -check -recursive` / `validate` | Succeeded |
| [`checkov-tc01.json`](checkov-tc01.json) | Captured: 7 passed, 0 failed; optional guideline mapping download warning |
| [`tfsec-tc01.json`](tfsec-tc01.json) | Captured: 0 findings |
| GitHub Actions run and timestamp | Pending PR/workflow |
| AI structured output, verdict, score, and warnings | Pending PR/workflow |
| AI PR comment | Pending PR/workflow |

Local command timestamps: 2026-10-08 (system local time; exact invocation timestamps are in scanner JSON/logs where emitted). Checkov printed a network/DNS warning while fetching optional guideline mappings; it still exited successfully and produced the captured scan. Terraform initialization reused the locked AzureRM provider version 4.81.0; validation succeeded.

Record findings and anomalies as observed, including false positives. Do not alter scanner output or AI output. Research scoring remains a manual evaluation against the existing framework; no scores are assigned here.

## TC01 scoring worksheet

Leave scores blank until a researcher evaluates the captured evidence.

| Dimension | Score (0–2) | Evidence / rationale |
|---|---:|---|
| Detection correctness |  |  |
| Explanation accuracy |  |  |
| Impact explanation |  |  |
| Remediation quality |  |  |
| Context awareness |  |  |
| Developer usefulness |  |  |
