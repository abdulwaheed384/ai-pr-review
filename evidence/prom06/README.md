# PROM06 evidence archive

This branch (`prom06-evidence`) preserves the raw evidence for the PROM06 experimental evaluation. It is not intended to be merged into `main`.

| Path | Content | Source |
|---|---|---|
| `independent-runs/<run_id>/prom06-INDEPENDENT-<run_id>/` | Workflow artifacts for the independent reruns: `experiment-metadata.json`, Checkov and tfsec JSON, stderr, versions, exit codes, raw AI response, parsed `ai_output.json`, rendered PR comments | GitHub Actions artifacts downloaded by the researcher on 13 Oct 2026 (`gh run download`) |
| `independent-runs.tsv` | Run index: branch, event, run ID, commit, attempt, start time, conclusion | GitHub Actions REST API, 13 Oct 2026 |
| `workflow-runs-*.json` | Workflow run metadata for the Condition C runs (8–13 Oct) and the independent reruns | GitHub Actions REST API |
| `pr-comments/condition-c/` | Bot comments on PRs #46–#68 (earlier Condition C runs) | GitHub Issues REST API |
| `pr-comments/independent/` | Bot comments on PRs #70–#81 (independent reruns) | GitHub Issues REST API |
| `local-scans/TC01–TC12/` | Local reproduction of Checkov 3.3.1 and tfsec 1.28.14 on each `indep-tc` branch | Run in the Claude Code session, 13 Oct 2026 |
| `ground-truth/` | Ground truth for additional cases TC13–TC15, committed before their fixtures were created | Researcher |
| `PROM06_TC01-TC12_Verified_Results_Matrix.xlsx` | Verified results matrix (independent vs hybrid) with researcher decisions | Derived from the files above |

Experimental conditions:

- **Condition C (hybrid), 9–12 Oct 2026:** the workflow default before PR #69. From commit `732083d` (9 Oct 12:47 BST) the AI prompt included normalised Checkov/tfsec findings.
- **INDEPENDENT, 13 Oct 2026:** after PR #69. Every `experiment-metadata.json` records `review_mode: INDEPENDENT` and `scanner_findings_supplied_to_ai: false`.

AI model: `claude-sonnet-4-6`, hard-coded in `ai/review_runner.py` (no temperature set). The model name is not recorded in the run metadata.
