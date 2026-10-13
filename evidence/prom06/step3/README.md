# Step 3 evidence (13 Oct 2026)

- `jobs/<run_id>.json` — GitHub Actions jobs API output (step timestamps) for the 46 independent runs (TC01–TC15).
- `step-timings.tsv` — derived per-run step durations (source for the workbook 'Timing' sheet).
- `confirmed_findings_raw.tsv` — every CONFIRMED AI finding: TC01–TC12 from ai_output.json artefacts, TC13–TC15 from PR comments #82–#84 (ordered by timestamp).
- `tc13-15-runs.tsv`, `prs.tsv` — run and PR metadata.
- Remediation validation (DCR): branches `rem-tc02` … `rem-tc15` (plus `rem-tc02b/03b/04b` with the stale fixture comment corrected and `rem-tc10tags` applying the AI's tag recommendation verbatim) → PRs #85–#100.
  - `rem-runs.tsv`, `rem-runs-b.tsv` — run IDs; `rem-jobs/` — step results (rem-tc10tags failed at Terraform Validate).
  - `rem-pr-comments/pr85–pr100.json` — Checkov, tfsec and AI comments posted by the INDEPENDENT workflow.
  - `rem-local-scans/` — local Checkov 3.3.1 / tfsec 1.28.14 on each remediated tree.
- Scripts that build the workbook sheets are in `../scripts/`.

Fixes were implemented by the research assistant (Claude) from the AI's own recommendation text; interpretation choices are recorded in the workbook sheet 'Remediation Validation'. Nothing was merged or applied to Azure.
