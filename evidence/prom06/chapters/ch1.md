# 1 Introduction

## 1.1 Background

Cloud infrastructure is increasingly defined as code. Tools such as Terraform describe networks, identities and storage in version-controlled files, so infrastructure can be reviewed and changed through the same pull-request process as application code (Morris, 2020; HashiCorp, 2024). This brings a security risk with it. An insecure definition, such as a firewall rule open to the internet or an over-privileged role, is reproduced wherever the code is applied. Under the cloud shared-responsibility model, preventing such misconfiguration is the customer's responsibility (Microsoft, 2024).

DevSecOps responds by placing automated security checks in the delivery pipeline (Kim et al., 2021; NIST, 2022). For Infrastructure-as-Code (IaC), this usually means rule-based scanners such as Checkov and tfsec. They are fast and consistent, but they can only detect what their rules describe, and their terse, numerous warnings are a well-documented reason developers disregard them (Johnson et al., 2013).

Large language models (LLMs) offer a different kind of review. They can read a whole configuration, reason about how its parts relate and explain a problem in plain language. They also hallucinate, vary between runs and can be manipulated by the text they read (Ji et al., 2023; Ouyang et al., 2025; Greshake et al., 2023).

Whether an AI reviewer adds value to an IaC pipeline, and at what risk, is therefore an empirical question. This study investigates it with a working pipeline and controlled test cases.

## 1.2 Aims

This research aims to evaluate the effectiveness of an AI-driven security review system integrated within a modern DevSecOps pipeline for Infrastructure-as-Code. It compares AI-assisted security review with traditional static analysis tools to determine whether AI can:

- improve vulnerability detection;
- provide more meaningful remediation guidance;
- enhance secure development practices.

The primary research question, carried forward from Assignment 1, is whether AI-assisted security review can improve the effectiveness of IaC security analysis within a DevSecOps pipeline compared with traditional static analysis tools. It is examined through four questions:

- **RQ1:** How accurately does the AI reviewer detect IaC vulnerabilities compared with Checkov and tfsec?
- **RQ2:** What is the quality of the AI's remediation guidance?
- **RQ3:** What is the likely impact of AI feedback on developer understanding?
- **RQ4:** What practical challenges arise in integrating AI review into a secure development workflow?

## 1.3 Objectives

The study has four objectives:

1. Review the literature on AI-assisted security review, DevSecOps, IaC security and traditional static analysis tools.
2. Design and implement an AI-assisted security review pipeline for Terraform pull requests.
3. Evaluate the pipeline against conventional scanners using predefined metrics and an independently defined ground truth.
4. Investigate the practical benefits and limitations of AI-generated security feedback.

## 1.4 Research Approach

The study uses a controlled experimental comparison with mixed-methods evaluation. A GitHub Actions pipeline runs Checkov, tfsec and an AI reviewer based on Anthropic Claude on every Terraform pull request. Fifteen test cases, each with ground truth fixed before execution, cover network exposure, logging, encryption, secrets and identity. They also include secure and legitimately public configurations.

After a verification check found that early AI results had been influenced by scanner output, the AI was run independently and every case was repeated. Outputs were classified against the ground truth, explanation and remediation were scored on a predefined rubric, and the AI's recommended fixes were applied and re-tested. The contribution is an evidence-based account of how the approaches behave, not a general performance estimate.

## 1.5 Structure of the Report

- **Chapter 2** reviews research on DevSecOps, IaC security, static analysis and LLM-based review, and identifies the gap addressed.
- **Chapter 3** describes the pipeline, test cases, ground truth, metrics and procedure.
- **Chapter 4** presents and analyses the results against the research questions.
- **Chapter 5** evaluates the project, its validity and the researcher's own learning.
- **Chapter 6** draws conclusions and makes recommendations.

Supporting evidence is in the appendices.

## 1.6 Ethical, Social, Professional, Legal and Security Considerations

The study involved no human participants and no personal data, and formal ethics approval was not required. All infrastructure was synthetic. Secrets were dummy values, and network addresses came from the range reserved for documentation (Arkko, Cotton and Vegoda, 2010). No vulnerable configuration was merged or deployed, and only synthetic code was sent to the external AI service.

Generative AI was both the subject of the study and, as permitted by the module guidance, a research assistant for evidence verification, scoring and drafting. Its outputs were checked against primary evidence.

The wider professional issues are trust and accountability:

- an AI reviewer that is confidently wrong, or that can be steered by text in a pull request, raises questions about responsibility for security decisions;
- such a reviewer raises the question of how far automated judgement should be relied on.

Chapter 5 returns to both issues.

## References cited in this chapter

Arkko, J., Cotton, M. and Vegoda, L. (2010) *IPv4 Address Blocks Reserved for Documentation*. RFC 5737. Internet Engineering Task Force. Available at: https://www.rfc-editor.org/rfc/rfc5737 (Accessed: 13 October 2026).

Greshake, K., Abdelnabi, S., Mishra, S., Endres, C., Holz, T. and Fritz, M. (2023) 'Not what you've signed up for: Compromising real-world LLM-integrated applications with indirect prompt injection', *Proceedings of the 16th ACM Workshop on Artificial Intelligence and Security (AISec '23)*, pp. 79–90. doi:10.1145/3605764.3623985.

HashiCorp (2024) *Terraform Documentation*. Available at: https://developer.hashicorp.com/terraform/docs (Accessed: 23 July 2026).

Ji, Z. et al. (2023) 'Survey of hallucination in natural language generation', *ACM Computing Surveys*, 55(12), pp. 1–38. doi:10.1145/3571730.

Johnson, B., Song, Y., Murphy-Hill, E. and Bowdidge, R. (2013) 'Why don't software developers use static analysis tools to find bugs?', *Proceedings of the 35th International Conference on Software Engineering (ICSE)*, pp. 672–681.

Kim, G., Humble, J., Debois, P. and Willis, J. (2021) *The DevOps Handbook*. 2nd edn. Portland, OR: IT Revolution.

Microsoft (2024) *Shared responsibility in the cloud*. Available at: https://learn.microsoft.com/azure/security/fundamentals/shared-responsibility (Accessed: 23 July 2026).

Morris, K. (2020) *Infrastructure as Code: Dynamic Systems for the Cloud Age*. 2nd edn. Sebastopol, CA: O'Reilly Media.

National Institute of Standards and Technology (NIST) (2022) *Secure Software Development Framework (SSDF) Version 1.1*. NIST SP 800-218. Gaithersburg, MD: NIST. doi:10.6028/NIST.SP.800-218.

Ouyang, S., Zhang, J.M., Harman, M. and Wang, M. (2025) 'An empirical study of the non-determinism of ChatGPT in code generation', *ACM Transactions on Software Engineering and Methodology*, 34(2).
