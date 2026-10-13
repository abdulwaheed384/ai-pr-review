# Abstract

Infrastructure-as-Code lets cloud misconfigurations be caught at pull-request review, but the rule-based scanners used for this detect only what their rules describe and explain little. This study evaluated whether an AI reviewer based on a large language model improves Terraform security review when compared with Checkov and tfsec. A GitHub Actions pipeline ran all three tools on fifteen controlled test cases with ground truth fixed in advance.

Evidence verification showed that early AI results had been influenced by scanner output. The workflow was therefore corrected, and every case was rerun with the AI working independently, three times per case.

The AI detected 11 of 12 vulnerable cases, and a twelfth partially, against 5 for Checkov, 4 for tfsec and 8 for both scanners combined. It found every condition the scanners found, plus context-dependent and secret-related weaknesses they missed. Its errors, however, differed in kind: findings were classified inconsistently between identical runs, a third of runs on acceptable configurations raised findings, and 7 of 45 confirmed findings were false. Applying its recommended fixes resolved all twelve targets, but one recommendation for a false finding produced invalid Terraform. The study also found that comments in the code changed the AI's verdicts.

The results support using AI review as an advisory layer alongside deterministic scanners, not as a replacement or merge gate. They are limited by the small constructed sample, a single model and single-rater scoring.
