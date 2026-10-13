# PROM06 additional test cases TC13–TC15 — ground truth

Version 1.0, 13 Oct 2026. Written and committed **before** the TC13–TC15 Terraform fixtures were created or any tool was run against them. Expected tool outcomes below are hypotheses, not results.

## Why these cases were added

The TC01–TC12 results exposed three gaps in the original test set:

1. **TC11 did not isolate multi-file reasoning.** Its custom role used `actions = ["*"]`, which Checkov flags on its own (`CKV_AZURE_39`), so the case cannot show whether context across files matters.
2. **There was no secure "remediated" variant of a vulnerable case.** The ground-truth matrix asks for post-remediation evidence, and TC01 is the only negative control.
3. **TC09's scanner miss may be an artefact of the fixture.** The dummy secret sat in an unused `locals` value; it is unclear whether the scanners miss secrets in general or only in that form.

Design rules for TC13–TC15, applied in response to observations from TC01–TC12:

- Fixture comments are neutral: no "deliberately insecure", "ground truth" or "test vulnerability" wording, which in earlier cases was visible to the AI and may have cued it.
- Each case changes one condition relative to the current `main` baseline.
- No real secrets; nothing is deployed or applied.
- Each case runs three times under the INDEPENDENT workflow, with Checkov 3.3.1 and tfsec 1.28.14 also reproduced locally.

## TC13 — Over-privileged built-in role assignment (cross-file context)

- **Category:** IAM / context awareness.
- **Fixture:** `terraform/tc13_reporting_identity.tf` creates a user-assigned managed identity for a reporting service and assigns it the built-in **Contributor** role at **subscription** scope. `terraform/tc13_requirements.tf` documents, in `locals`, that the reporting task needs only read access to the research resource group.
- **Ground truth (TC13-GT-01):** genuine weakness. The assignment grants write and delete access across the subscription, while the documented requirement is read-only access at resource-group scope. The weakness is established only by combining the two files: no wildcard and no custom role is present, so the role assignment alone is not self-evidently wrong.
- **Valid detection:** identifies the Contributor-at-subscription assignment as exceeding the documented read-only, resource-group requirement. Generic "review your RBAC" advice does not count.
- **Expected secure state:** built-in **Reader** role at the research resource-group scope.
- **Research purpose:** the context-awareness test that TC11 was intended to be.

## TC14 — Remediated SSH access (secure variant of TC02)

- **Category:** network / false-positive control / post-remediation.
- **Fixture:** an inbound TCP/22 rule on the existing NSG, restricted to the single administration address `203.0.113.10/32` (RFC 5737 documentation range), at priority 300.
- **Ground truth (TC14-GT-01):** no intentional vulnerability. SSH is limited to one approved administration address, the remediation recommended for TC02.
- **Correct outcome:** no confirmed finding. A note suggesting a stronger pattern (for example Azure Bastion or just-in-time access) may be recorded as informational, but a confirmed finding that treats the restricted rule as public exposure is a false positive.
- **Research purpose:** second negative control; tests whether tools accept the remediation they recommended for TC02.

## TC15 — Hard-coded secret in a sensitive variable default (contrast with TC09)

- **Category:** secrets management.
- **Fixture:** `terraform/tc15_variables.tf` declares `variable "admin_password"` (type string) with a hard-coded dummy default value; the variable is not marked `sensitive`.
- **Ground truth (TC15-GT-01):** genuine secret-handling anti-pattern. The value is dummy data and not a real credential.
- **Valid detection:** identifies the hard-coded default for a password variable and recommends removing the default and supplying the value at runtime from a secret store, with the variable marked `sensitive`.
- **Research purpose:** determines whether scanner non-detection in TC09 reflects the form of that fixture (unused local) or a wider gap in the configured scans.

## Classification rules

As for TC01–TC12: TP / FN / TN / FP / PARTIAL / CONTEXT, judged on the target condition only. Scanner rules covering one condition are normalised to one detection. Severities are not compared across tools.
