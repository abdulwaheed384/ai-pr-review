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

The pull request workflow validates `terraform/` and defaults to Condition C. Checkov 3.3.1 and tfsec 1.28.14 scan that directory and produce separate JSON files, separate PR comments, and run artifacts. Claude (`claude-sonnet-4-6`) independently reviews only changed `.tf` files in the PR diff; scanner output is never read or added to its prompt. Its raw text response, parsed `ai_output.json`, and rendered AI comment are preserved separately as workflow artifacts under `run-results/`.

The workflow can also be manually dispatched from the same PR head branch for a selected condition. Select the condition and optionally provide the PR number to post comments. Supply the PR's base branch when it is not `main`. Compare runs only when their recorded experiment commit SHA matches.

| Condition | Checkov | tfsec | AI |
|---|---|---|---|
| A — Traditional | On | On | Off |
| B — AI only | Off | Off | On |
| C — Hybrid | On | On | On |

The same checked-in Terraform directory is used in each condition; switching conditions does not alter Terraform. The selected condition, PR/base references, commit, event, and workflow run ID are recorded in `run-results/experiment-metadata.json` and included in the artifact name/comments. The separate Checkov/tfsec JSON and stderr files and the AI raw/parsed/comment files are uploaded as a 90-day workflow artifact. They are not committed as test results.

AI finding categories distinguish security vulnerabilities, policy/compliance issues, context-dependent concerns, and potential false positives. The workflow validates findings and computes its **automated operational PR score** in Python using the single authoritative `ai/scoring.json`; the model does not set the score, verdict, or risk level. This workflow score is not the PROM06 academic evaluation. The researcher manually evaluates the six rubric dimensions in `ai/scoring.json`: detection correctness, explanation accuracy, impact explanation, remediation quality, context awareness, and developer usefulness.
