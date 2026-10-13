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

The pull request workflow validates `terraform/` and runs Checkov 3.3.1, tfsec 1.28.14, and the AI reviewer independently on the same Terraform commit. Each tool produces its own raw output, separate PR comment, and evidence artifact. The AI reviewer receives changed Terraform files and the repository Terraform/policy context, but it is never given Checkov or tfsec findings. Scanner findings are not used as AI input or as ground truth.

The workflow can be manually dispatched from a PR head branch and optionally given the PR number for posting separate tool comments. Supply the PR base branch when it is not `main`. Compare results only when their recorded experiment commit SHA matches.

AI finding classification policy v2.2 adds a status separate from severity (`CONFIRMED`, `NEEDS_CONTEXT`, `INFORMATIONAL`, or `FALSE_POSITIVE`). Confirmed findings, including genuine LOW-severity issues, affect the operational score and appear in the AI PR comment. Context-dependent, informational, and potential false-positive reports remain in structured audit artifacts but are excluded from the PR conversation comment. Exact duplicate reports are collapsed with duplicate IDs and reasons recorded in `processing_audit`. The AI operational score is computed in Python using `ai/scoring.json`; the model does not set the score, verdict, or risk level. This workflow score is not the PROM06 academic evaluation. The researcher manually evaluates detection correctness, explanation accuracy, impact explanation, remediation quality, context awareness, and developer usefulness.

| Tool | Input | Output |
|---|---|---|
| Checkov | Terraform directory | Independent scanner JSON, stderr/version/exit-code files and PR comment |
| tfsec | Terraform directory | Independent scanner JSON, stderr/version/exit-code files and PR comment |
| AI reviewer | Terraform diff, complete Terraform configuration, repository README and `ai/policy.md` | Independent raw model response, parsed JSON, audit data and PR comment |

All three tools run in the same workflow run against the same checked-out commit, but they do not exchange findings. The review mode, PR/base references, commit, event, workflow run ID, and timestamp are recorded in `run-results/experiment-metadata.json`. Metadata explicitly records `scanner_findings_supplied_to_ai: false`. Separate scanner JSON/stderr files and AI raw/parsed/comment files are uploaded as a 90-day workflow artifact. They are not committed as test results.

AI finding categories distinguish security vulnerabilities, policy/compliance issues, context-dependent concerns, and potential false positives. The automated operational PR score is a workflow aid, not an academic metric. Evaluate detection and feedback quality against predefined ground truth and preserve raw evidence for each test case.

