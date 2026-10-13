# 6 Conclusion and Recommendations

## 6.1 Conclusion

This study asked whether AI-assisted security review can improve the effectiveness of Infrastructure-as-Code security analysis in a DevSecOps pipeline compared with traditional static analysis tools. On fifteen controlled Terraform cases, the answer is a qualified yes: it improves coverage, but it cannot yet replace the scanners or be trusted as a merge gate.

**Detection accuracy.**

| Reviewer | Vulnerable cases detected (12 vulnerable cases in TC01–TC15) |
|---|---|
| AI reviewer, working independently | 11, plus 1 partially |
| Checkov | 5 |
| tfsec | 4 |
| Checkov and tfsec together | 8 |

On the original twelve-case set (TC01–TC12, ten vulnerable cases), the AI detected 9 plus 1 partially and the scanners together 8.

Every condition the scanners found, the AI also found. Its extra detections were conditions requiring context or semantic judgement (an over-privileged built-in role judged against a documented requirement; hard-coded secrets) or conditions outside the scanners' rule sets. The scanners' failures were stable gaps in rule coverage. The AI's were of a different kind:

- it classified the same finding differently across runs;
- it raised findings against acceptable configurations in a third of runs on those cases;
- seven of its 45 confirmed findings were classified as false, giving a precision of 82%. Three of these accurately described a weakness in the test fixtures, and treating them as valid raises precision to 89%.

**Remediation quality.** The AI's advice was usually specific and correct. Applied as written, all twelve fixes for the vulnerable cases it detected reached the secure state. Its explanations were the weakest element. They mapped findings to inapplicable policies, stated false platform facts, and in one case recommended a change that made the Terraform invalid.

**Developer understanding.** This was not measured directly. The AI's comments were consistently more explanatory than the scanners' output, but whether developers learn from them remains untested.

**Practical challenges.** The study found five:

- variation between identical runs;
- findings hidden by classification;
- validation failures;
- deletion-only changes that escape review;
- verdicts steered by comments in the code under review.

The AI added comparatively little time to the pipeline, a median of 31.5 seconds.

These conclusions, including the precision figures, hold for one model, one prompt and a constructed sample. They are not measures of real-world performance, and the evidence does not support a general claim that AI review outperforms rule-based scanning. It supports a narrower claim: on this sample, an AI reviewer used alongside deterministic scanners covered conditions the scanners missed. Its errors were of a different kind from theirs and less predictable.

## 6.2 Practical Recommendations

For teams considering AI review in an IaC pipeline, the evidence supports the following:

1. **Keep deterministic scanners as the enforcement layer** and use the AI as an additional, advisory reviewer. Its findings should prompt human attention, not block or approve merges by themselves.
2. **Run more than one scanner, or check each scanner's rule coverage against the organisation's risks.** In this study, Checkov and tfsec had almost no overlap.
3. **Treat code comments and pull-request text as untrusted input to the AI.** Strip or flag them before review, or instruct the model to base findings only on configuration values.
4. **Surface uncertain AI findings to the developer** instead of hiding them. TC08 showed a real issue lost behind a NEEDS_CONTEXT status.
5. **Validate AI-proposed fixes automatically** with `terraform validate` and the scanners before suggesting them, since a plausible fix can be invalid.
6. **Review deletion-only changes,** and record the model version and sampling settings in every run, so that behaviour can be audited later.

## 6.3 Further Research

The most useful next step is scale and realism. Evaluating the same design on Terraform changes mined from public repositories with known security fixes would test whether the patterns found here persist outside constructed cases.

Several other directions follow from this study:

- repeating each review many times, and across several models and temperature settings, would measure variation directly instead of merely showing it exists;
- a deliberate adversarial study of comment-based manipulation would establish how easily a pull request can steer an AI reviewer;
- a study with developers would test whether AI explanations actually improve understanding and remediation compared with scanner output.

## 6.4 Alternative Approaches and Future Improvements

The artefact itself could be improved in three ways:

- give the scanners custom policies equivalent to the AI's policy file, so that the comparison is fair;
- feed the AI only configuration, with comments removed, to reduce cueing;
- combine the two layers deliberately, using the AI to explain and prioritise scanner findings while running its own independent review in parallel.

Comparing this layered design with the independent design used here would show whether the AI adds most value as a second detector or as an interpreter of scanner output.
