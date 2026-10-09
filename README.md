# AI-Powered Terraform Security Review

This project integrates:
- Terraform Cloud (IaC deployment)
- GitHub Actions (CI/CD)
- Claude AI (security review)

Workflow:
1. Developer creates PR
2. Terraform validation runs
3. AI reviews code
4. Peer approves
5. Terraform Cloud applies changes

## PROM06 experimental review pipeline

The pull request workflow validates `terraform/` and defaults to Condition C. Checkov 3.3.1 and tfsec 1.28.14 scan that directory and produce separate JSON files, separate PR comments, and run artifacts. Claude (`claude-sonnet-4-6`) independently reviews changed `.tf` files against the complete current Terraform configuration, policy, and repository README; scanner output is never read or added to its prompt. Its raw text response, parsed `ai_output.json`, and rendered AI comment are preserved separately as workflow artifacts under `run-results/`.

The workflow can also be manually dispatched from the same PR head branch for a selected condition. Select the condition and optionally provide the PR number to post comments. Supply the PR's base branch when it is not `main`. Compare runs only when their recorded experiment commit SHA matches.

| Condition | Checkov | tfsec | AI |
|---|---|---|---|
| A — Traditional | On | On | Off |
| B — AI only | Off | Off | On |
| C — Hybrid | On | On | On |

The same checked-in Terraform directory is used in each condition; switching conditions does not alter Terraform. The selected condition, PR/base references, commit, event, and workflow run ID are recorded in `run-results/experiment-metadata.json` and included in the artifact name/comments. The separate Checkov/tfsec JSON and stderr files and the AI raw/parsed/comment files are uploaded as a 90-day workflow artifact. They are not committed as test results.

AI finding categories distinguish security vulnerabilities, policy/compliance issues, context-dependent concerns, and potential false positives. The workflow validates findings and computes its **automated operational PR score** in Python using the single authoritative `ai/scoring.json`; the model does not set the score, verdict, or risk level. This workflow score is not the PROM06 academic evaluation. The researcher manually evaluates the six rubric dimensions in `ai/scoring.json`: detection correctness, explanation accuracy, impact explanation, remediation quality, context awareness, and developer usefulness.

TC01 is a network-only research case. It tags all taggable resources with documented research values and configures supported NSG security logs in a 30-day Log Analytics workspace with a 1 GB/day ingestion cap. Public workspace ingestion and query endpoints are disabled, while diagnostic-setting logs use Azure's secure private Microsoft channel. TC01 has no configured private query path, so log queries are intentionally unavailable until a private-link-connected client path is designed. Azure diagnostic settings are resource-specific: the subnet is not an independently targetable diagnostic resource, and no workload resource exists in TC01. The NSG explicitly denies all inbound and outbound traffic, subnet default outbound access is disabled, and `dns_servers = []` explicitly selects Azure-provided DNS. This intentionally empty network posture avoids introducing access for a test case with no workload. Log Analytics ingestion and workspace retention can incur Azure charges. The 30-day retention and 1 GB/day cap are research cost limits, not production audit-retention guarantees: if the cap is reached, Azure stops collection for the rest of that day and data after the cap is lost. A production workload must set its own retention, ingestion budget, and alerting requirements. Terraform plans are not applied as part of local validation.
