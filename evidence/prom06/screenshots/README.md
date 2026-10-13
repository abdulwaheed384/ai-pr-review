# GitHub page captures (printed to PDF by AB, 13 Oct 2026 ~18:22 BST)

| File | Register ID | Shows |
|---|---|---|
| PR71.pdf | S1 | TC02: Checkov 7/0 clean; tfsec AVD-AZU-0047 + 0050; AI HIGH SSH (70) |
| PR78.pdf | S2 | TC09: both scanners clean; AI MEDIUM hard-coded secret (85) |
| PR81.pdf | S4 | TC12: tfsec CRITICAL; AI run 1 HIGH, 50/100 DO_NOT_MERGE on intended HTTPS |
| PR82.pdf | S5 | TC13: scanners clean; AI HIGH Contributor vs Reader (70) |
| PR84.pdf | S5 | TC15: scanners clean; AI HIGH hard-coded password (70) |
| PR85.pdf | S6 | REM-TC02: AI HIGH citing TEST-NET address and the stale comment (70) |
| PR98.pdf | S6 | REM-TC02b: comment corrected; AI LOW only (95, APPROVE) |

Every page footer carries the URL and the print timestamp. Content was cross-checked against the PR comments retrieved through the API (step3/rem-pr-comments, pr-comments/independent).
| S3_run38404605125.pdf | S3 | TC08 run 1 (PR #77) job page: "Run independent AI review" failed with "AI review failed: Policy mapping 1 must refer to a matching finding"; env shows EXPERIMENT_CONDITION INDEPENDENT, commit c86e4d5 |
| S7_run38412955313.pdf | S7 | REM-TC10tags job page: Terraform Validate "Error: Unsupported argument … An argument named "tags" is not expected here" (tc10_iam.tf line 14); later steps skipped |
| S8a_run38404584887_job_steps.pdf | S8 (partial) | TC02 run 1 job page: all steps with durations, INDEPENDENT. The run Summary page with the Artifacts list is still to be captured |

Captured 13 Oct 2026, 18:28–18:29 BST.

## Integrity check (13 Oct 2026, 18:31)
AB re-downloaded artefact prom06-INDEPENDENT-38404584887 from the run page instead of capturing the Summary page. All 14 files are byte-identical to the copy downloaded earlier in the day (independent-runs/38404584887). This confirms that the archived artefacts are unchanged GitHub outputs. It replaces the need for the S8 Summary capture.
