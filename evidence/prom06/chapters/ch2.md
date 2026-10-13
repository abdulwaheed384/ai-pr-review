# 2 Literature Review

## 2.1 Introduction

This chapter reviews the research that frames the evaluation of an AI-assisted security reviewer for Terraform. It develops the review from Assignment 1 in three ways:

- It replaces vendor descriptions with empirical studies wherever such studies exist.
- It corrects citation errors in the earlier version.
- It adds three strands of work that the experiment showed to be essential: the non-determinism of language models, prompt injection, and the validity of AI-proposed fixes.

Sections 2.2 to 2.5 move from the delivery context, through Infrastructure-as-Code (IaC) security and rule-based analysis, to AI-assisted review. Section 2.6 compares the approaches and states the gap this study addresses.

## 2.2 DevSecOps and Secure Software Development

DevSecOps extends DevOps by moving security activity into the continuous integration and delivery pipeline instead of leaving it to a final assessment (Kim et al., 2021). The underlying argument is economic and practical. Defects found close to the change that introduced them are cheaper to fix (Boehm, 1981), and frequent releases leave no room for a separate security phase (Forsgren, Humble and Kim, 2018). The NIST Secure Software Development Framework (SSDF) formalises this expectation. It recommends that organisations review code and configuration for vulnerabilities and use automated tools to support that review throughout development (NIST, 2022).

Empirical work suggests that adoption is harder than the principle. In an early practitioner study, Rahman and Williams (2016) found that security practices commonly associated with DevOps included automated monitoring and security tooling in the pipeline. Practitioners also reported difficulty integrating such practices without slowing delivery.

A later systematic review by Rajapakse et al. (2022) organised the challenges of adopting DevSecOps into people, practice, tool and infrastructure themes. Tool-related problems, including complex tooling and false positives from automated security testing, were among the most prominent.

Two points follow for this study. First, the pull request is the natural place for automated security review in a DevSecOps workflow, because it is where a change is inspected before it is merged. Second, the literature already treats false positives and poor integration as reasons security tools fail in practice. Any new reviewer, AI-based or not, should therefore be judged on whether its findings are actionable, not only on how many issues it reports.

Much of the DevSecOps literature rests on practitioner perception and grey literature, not controlled measurement. It establishes what practitioners value and struggle with, but says little about how well specific tools detect specific weaknesses. That gap is narrower, and more measurable, in the IaC literature.

## 2.3 Infrastructure-as-Code Security

IaC describes infrastructure in machine-readable files that can be versioned, reviewed and applied automatically (Morris, 2020). Terraform is a widely used example and supports Azure, AWS and Google Cloud through provider plugins (HashiCorp, 2024). Treating infrastructure as code brings software practices such as version control and peer review to configuration. It also means that a single insecure definition can be replicated across every environment that uses it.

Under the cloud shared-responsibility model, customers remain responsible for configuring the services they deploy (Microsoft, 2024). Misconfiguration is therefore a customer-side risk that IaC review is well placed to catch.

Research specifically on IaC security is relatively recent. A systematic mapping by Rahman, Mahdavi-Hezaveh and Williams (2019) found that IaC research had concentrated on frameworks and tools, with comparatively little attention to defects and security. The most influential empirical study since then is Rahman, Parnin and Williams (2019). They defined seven "security smells" in configuration scripts and found them recurring across open-source repositories:

- admin by default;
- empty passwords;
- hard-coded secrets;
- binding to unrestricted IP addresses such as 0.0.0.0;
- suspicious comments;
- HTTP without TLS;
- weak cryptography.

Several of these correspond directly to the test cases used here. Unrestricted addresses appear in TC02–TC04, HTTP in TC04, and hard-coded secrets in TC09 and TC15. The smell of "suspicious comments", meaning comments that signal known weaknesses, became relevant in an unexpected way in Chapter 4.

Tool research shows that detection depends heavily on how rules are written. Saavedra and Ferreira (2022) built GLITCH, a framework that applies one set of smell definitions across several IaC languages through an intermediate representation. Comparing it with existing language-specific analysers, they found that detection quality varied with both the tool and the language, and that precision for some smells remained low.

These studies concern configuration-management languages such as Ansible, Chef and Puppet more than Terraform. Their lesson nevertheless carries over: a rule-based analyser detects exactly what its rules describe. Equivalent ways of writing the same weakness can produce different results, and Chapter 4 observed this directly with Checkov.

The IaC literature thus provides a well-grounded taxonomy of weaknesses and evidence that rule-based detection is uneven. It provides much less evidence about cloud-provider-specific Terraform scanners, whose behaviour is documented mainly by their vendors.

## 2.4 Traditional Security Review Techniques

Two established techniques review a change before it is merged: human code review and automated static analysis.

### Human code review

Modern code review is near-universal in professional development. Its security value, however, is less certain than its popularity suggests. Bacchelli and Bird (2013) found at Microsoft that developers' main stated motivation for review was finding defects. In practice, reviews mostly produced code improvements, knowledge transfer and shared understanding. McIntosh et al. (2016) linked low review coverage and participation to more post-release defects, which supports review as a quality practice. Neither study shows that reviewers reliably detect security weaknesses, which require specialist knowledge that many reviewers lack.

### Static analysis

Static analysis addresses scale. IaC scanners such as Checkov and tfsec evaluate configuration against libraries of policy rules before deployment (Bridgecrew, 2024; Aqua Security, 2024). Their strengths are consistency and speed: the same input always yields the same result, and the checks run in seconds within a pipeline.

The main weakness of static analysis is well documented. In interviews, Johnson et al. (2013) found that false positives and poorly explained warnings were the leading reasons developers did not use static analysis tools. Sadowski et al. (2018) reported Google's experience of embedding analysis in code review at scale. Developers ignored or disabled checks they saw as noisy or unhelpful, so the effective false-positive rate as perceived by developers had to be kept low for analysis to be used at all.

These findings shift the question from "what can the tool detect?" to "what will developers act on?". They also explain why richer explanations are attractive.

The limits of rule-based IaC scanning follow from its design:

- **Recall equals rule coverage.** A misconfiguration with no corresponding rule is invisible, however serious.
- **Rules evaluate configuration in isolation.** A rule cannot know whether a public endpoint is intended, or whether a role exceeds a requirement written in another file.
- **Published claims about coverage are largely the vendors' own.** Independent comparisons of Checkov and tfsec against a defined ground truth are scarce in the literature reviewed.

These are precisely the points at which an AI reviewer might add value, and they are where Chapter 4 looks for it.

### Policy-as-code and benchmarks

Most built-in scanner rules encode public benchmarks such as the CIS Benchmarks (CIS, 2024; Bridgecrew, 2024). This anchors them to widely accepted controls, but it also bounds what they can see. Organisation-specific requirements fall outside any public benchmark unless someone writes a custom policy for them, for example:

- mandatory tags;
- where logs must be sent;
- which roles a service may hold.

In practice, much of what a security reviewer checks is local policy, not generic best practice. A fair comparison between a scanner and a reviewer that is given the organisation's policy must therefore account for that difference in input. Chapter 3 treats it as a threat to validity.

## 2.5 AI in Software Security and Code Review

### What language models offer

Large language models (LLMs) are trained on large collections of text and code, and can generate and explain code from natural-language instructions (Brown et al., 2020; Bommasani et al., 2021). For security review, two properties matter:

- they can read a whole configuration and its documentation together, which offers the cross-resource context that rule-based tools lack;
- they produce explanations and fixes in prose, addressing the explanation gap that Johnson et al. (2013) identified.

Early work on automating code review showed that pre-trained models can generate review comments resembling human ones, although usefulness varied widely (Tufano et al., 2022).

### Empirical evidence on detection and repair

The empirical evidence on security tasks is more cautious than the promise. Pearce et al. (2022) found that around 40% of programs generated by GitHub Copilot in security-relevant scenarios contained vulnerabilities. Fluent code is therefore not secure code.

On detection, Ding et al. (2025) built a more realistic vulnerability benchmark, PrimeVul. They showed that code language models performed far worse on it than earlier benchmarks had suggested, with even large general-purpose models struggling to separate vulnerable from fixed code. The authors attributed earlier optimism partly to flawed datasets, which is a warning about evaluations built on unrepresentative cases.

On repair, Pearce et al. (2023) found that LLMs could fix many synthetic and hand-crafted vulnerable examples without additional training, but were much less reliable on real-world vulnerabilities. Together these studies suggest that LLM performance is highly sensitive to how realistic the test material is. They also show that proposed fixes must be validated, not assumed to work.

### Known failure modes

Four documented failure modes are directly relevant to a pipeline reviewer.

1. **Hallucination.** Models produce plausible statements that are unsupported or false (Ji et al., 2023). In security review this can mean a non-existent requirement, or a fix that does not compile.
2. **Non-determinism.** Ouyang et al. (2025) showed that repeated requests with the same prompt often yield materially different code, even at the lowest temperature setting. A reviewer that returns different verdicts for the same change undermines the consistency that makes automated gates trustworthy.
3. **Prompt injection.** Greshake et al. (2023) demonstrated that instructions or misleading text embedded in data an LLM processes can redirect its behaviour, and OWASP ranks prompt injection as the leading risk for LLM applications (OWASP Foundation, 2024). For a code reviewer, the code under review is untrusted input, comments included.
4. **Over-trust.** Automation bias leads people to accept automated recommendations without adequate scrutiny (Parasuraman and Riley, 1997). Confident, well-written AI explanations may encourage this.

### Combining LLMs with static analysis

Several studies combine the two techniques instead of choosing between them. Li et al. (2024), for example, used static analysis to identify candidate bugs and an LLM to reason about each candidate, reducing the false positives that pure static analysis produced. Designs of this kind place the LLM downstream of the tool, so the tool's output becomes part of the model's input.

That raises a methodological issue for evaluation. If the model is shown the scanner's findings, its apparent detections may restate them, and its severity judgements may be anchored to them. The contribution of the AI then cannot be separated from that of the scanner. This concern, together with the automation bias described above, is why the present study distinguishes independent AI review from scanner-informed review.

Usability studies of AI coding assistants report that developers value them but struggle to judge the correctness of their output (Vaithilingam, Zhang and Glassman, 2022). This reinforces the need for human oversight.

### Limits of the existing evidence

Most of this evidence concerns general-purpose programming languages, code generation or benchmark vulnerability classification. Little of it examines LLMs reviewing IaC changes inside a working pipeline. Few studies test the same model repeatedly on identical input, or check whether the advice it gives actually produces a secure configuration.

## 2.6 Comparative Analysis and Research Gap

Table 2.1 summarises how the literature characterises the two approaches.

Table 2.1: Rule-based and AI-assisted review as characterised in the literature

| Dimension | Rule-based IaC scanning | LLM-based review |
|---|---|---|
| Basis | Explicit policy rules (Bridgecrew, 2024; Aqua Security, 2024) | Learned patterns over code and text (Brown et al., 2020) |
| Repeatability | Deterministic | Non-deterministic (Ouyang et al., 2025) |
| Coverage | Limited to written rules; sensitive to syntax (Saavedra and Ferreira, 2022) | Not rule-bound, but uneven on realistic data (Ding et al., 2025) |
| Context | Evaluates resources largely in isolation | Can read related files and documentation |
| Explanation | Brief, often generic (Johnson et al., 2013) | Detailed, but may contain false claims (Ji et al., 2023) |
| Remediation | Fixed guidance per rule | Tailored, but needs validation (Pearce et al., 2023) |
| Main risks | False positives, missed variants, alert fatigue (Sadowski et al., 2018) | Hallucination, inconsistency, prompt injection (Greshake et al., 2023) |

The literature broadly agrees that the two approaches are complementary: scanners for consistent enforcement of known rules, LLMs for context and explanation. Assignment 1 reached the same conclusion. That agreement, however, rests more on argument than on measurement. Four gaps are relevant to this study.

1. **Little head-to-head evidence for IaC.** There is little empirical comparison of an LLM reviewer with established Terraform scanners on the same changes against an independently defined ground truth. Vendor documentation describes what scanners check, and LLM studies mostly use general-purpose code.
2. **Hybrid evaluations rarely control for independence.** When an AI is given scanner output, its apparent detections may simply restate the scanner. Comparisons that do not separate independent and scanner-informed AI results cannot attribute value to the AI.
3. **Pipeline concerns are seldom measured together.** Repeatability, classification of findings and the effect of untrusted content such as comments are documented separately in general LLM research. They are seldom measured together in a pull-request setting where they determine whether a change is merged.
4. **Remediation is rarely validated.** AI remediation is usually assessed by reading it, not by applying it and checking the result. The repair literature (Pearce et al., 2023) shows why that matters.

The realism problem identified by Ding et al. (2025) applies to any evaluation, including this one. Constructed test cases allow ground truth to be fixed in advance and each weakness to be isolated. They do not represent the frequency or subtlety of weaknesses in real repositories, and they risk cueing the reviewer, for example through explanatory comments. Controlled cases are therefore suited to explaining how tools behave, not to estimating how often they succeed in practice.

This study addresses these gaps on a small scale. It compares an independent AI reviewer with Checkov and tfsec on fifteen Terraform cases with pre-defined ground truth. It separates scanner-informed results from independent ones and repeats each AI review. It then applies the AI's own fixes and re-checks them. The contribution is bounded by the number of cases and the single model, but the design responds directly to the weaknesses identified above.

## 2.7 Chapter Summary

The literature establishes that security review belongs in the delivery pipeline (NIST, 2022). It also shows that adoption fails when tools are noisy or unhelpful (Johnson et al., 2013; Rajapakse et al., 2022). IaC research provides a taxonomy of common weaknesses and shows that rule-based detection is only as complete as its rules (Rahman, Parnin and Williams, 2019; Saavedra and Ferreira, 2022).

LLMs offer context and explanation. They also bring documented problems with accuracy, consistency and manipulation, and evidence from realistic evaluations is weaker than early claims (Ding et al., 2025). The gap is empirical: how an LLM reviewer actually behaves alongside established IaC scanners in a working pull-request pipeline. Chapter 3 describes the method used to examine it.

## References cited in this chapter

Aqua Security (2024) *tfsec Documentation*. Available at: https://aquasecurity.github.io/tfsec/ (Accessed: 23 July 2026).

Bacchelli, A. and Bird, C. (2013) 'Expectations, outcomes, and challenges of modern code review', *Proceedings of the 35th International Conference on Software Engineering (ICSE)*, pp. 712–721. doi:10.1109/ICSE.2013.6606617.

Boehm, B.W. (1981) *Software Engineering Economics*. Englewood Cliffs, NJ: Prentice Hall.

Bommasani, R. et al. (2021) *On the Opportunities and Risks of Foundation Models*. Stanford University. Available at: https://arxiv.org/abs/2108.07258 (Accessed: 23 July 2026).

Bridgecrew (2024) *Checkov Documentation*. Available at: https://www.checkov.io/ (Accessed: 23 July 2026).

Brown, T.B. et al. (2020) 'Language models are few-shot learners', *Advances in Neural Information Processing Systems*, 33, pp. 1877–1901.

Center for Internet Security (CIS) (2024) *CIS Benchmarks*. Available at: https://www.cisecurity.org/cis-benchmarks (Accessed: 23 July 2026).

Ding, Y., Fu, Y., Ibrahim, O., Sitawarin, C., Chen, X., Alomair, B., Wagner, D., Ray, B. and Chen, Y. (2025) 'Vulnerability detection with code language models: How far are we?', *Proceedings of the 47th IEEE/ACM International Conference on Software Engineering (ICSE)*.

Forsgren, N., Humble, J. and Kim, G. (2018) *Accelerate: The Science of Lean Software and DevOps*. Portland, OR: IT Revolution.

Greshake, K., Abdelnabi, S., Mishra, S., Endres, C., Holz, T. and Fritz, M. (2023) 'Not what you've signed up for: Compromising real-world LLM-integrated applications with indirect prompt injection', *Proceedings of the 16th ACM Workshop on Artificial Intelligence and Security (AISec '23)*, pp. 79–90. doi:10.1145/3605764.3623985.

HashiCorp (2024) *Terraform Documentation*. Available at: https://developer.hashicorp.com/terraform/docs (Accessed: 23 July 2026).

Ji, Z. et al. (2023) 'Survey of hallucination in natural language generation', *ACM Computing Surveys*, 55(12), pp. 1–38. doi:10.1145/3571730.

Johnson, B., Song, Y., Murphy-Hill, E. and Bowdidge, R. (2013) 'Why don't software developers use static analysis tools to find bugs?', *Proceedings of the 35th International Conference on Software Engineering (ICSE)*, pp. 672–681.

Kim, G., Humble, J., Debois, P. and Willis, J. (2021) *The DevOps Handbook*. 2nd edn. Portland, OR: IT Revolution.

Li, H., Hao, Y., Zhai, Y. and Qian, Z. (2024) 'Enhancing static analysis for practical bug detection: An LLM-integrated approach', *Proceedings of the ACM on Programming Languages*, 8(OOPSLA1), Article 111.

McIntosh, S., Kamei, Y., Adams, B. and Hassan, A.E. (2016) 'An empirical study of the impact of modern code review practices on software quality', *Empirical Software Engineering*, 21(5), pp. 2146–2189..

Microsoft (2024) *Shared responsibility in the cloud*. Available at: https://learn.microsoft.com/azure/security/fundamentals/shared-responsibility (Accessed: 23 July 2026).

Morris, K. (2020) *Infrastructure as Code: Dynamic Systems for the Cloud Age*. 2nd edn. Sebastopol, CA: O'Reilly Media.

National Institute of Standards and Technology (NIST) (2022) *Secure Software Development Framework (SSDF) Version 1.1*. NIST SP 800-218. Gaithersburg, MD: NIST. doi:10.6028/NIST.SP.800-218.

Ouyang, S., Zhang, J.M., Harman, M. and Wang, M. (2025) 'An empirical study of the non-determinism of ChatGPT in code generation', *ACM Transactions on Software Engineering and Methodology*, 34(2).

OWASP Foundation (2024) *OWASP Top 10 for LLM Applications 2025*. Available at: https://genai.owasp.org/llm-top-10/ (Accessed: 13 October 2026).

Parasuraman, R. and Riley, V. (1997) 'Humans and automation: Use, misuse, disuse, abuse', *Human Factors*, 39(2), pp. 230–253. doi:10.1518/001872097778543886.

Pearce, H., Ahmad, B., Tan, B., Dolan-Gavitt, B. and Karri, R. (2022) 'Asleep at the keyboard? Assessing the security of GitHub Copilot's code contributions', *2022 IEEE Symposium on Security and Privacy (SP)*, pp. 754–768. doi:10.1109/SP46214.2022.9833571.

Pearce, H., Tan, B., Ahmad, B., Karri, R. and Dolan-Gavitt, B. (2023) 'Examining zero-shot vulnerability repair with large language models', *2023 IEEE Symposium on Security and Privacy (SP)*, pp. 2339–2356. doi:10.1109/SP46215.2023.10179324.

Rahman, A., Mahdavi-Hezaveh, R. and Williams, L. (2019) 'A systematic mapping study of infrastructure as code research', *Information and Software Technology*, 108, pp. 65–77. doi:10.1016/j.infsof.2018.12.004.

Rahman, A., Parnin, C. and Williams, L. (2019) 'The seven sins: Security smells in infrastructure as code scripts', *Proceedings of the 41st International Conference on Software Engineering (ICSE)*, pp. 164–175. doi:10.1109/ICSE.2019.00033.

Rahman, A.A.U. and Williams, L. (2016) 'Software security in DevOps: Synthesizing practitioners' perceptions and practices', *Proceedings of the International Workshop on Continuous Software Evolution and Delivery (CSED '16)*, pp. 70–76. doi:10.1145/2896941.2896946.

Rajapakse, R.N., Zahedi, M., Babar, M.A. and Shen, H. (2022) 'Challenges and solutions when adopting DevSecOps: A systematic review', *Information and Software Technology*, 141, 106700. doi:10.1016/j.infsof.2021.106700.

Saavedra, N. and Ferreira, J.F. (2022) 'GLITCH: Automated polyglot security smell detection in infrastructure as code', *Proceedings of the 37th IEEE/ACM International Conference on Automated Software Engineering (ASE '22)*. doi:10.1145/3551349.3556945.

Sadowski, C., Aftandilian, E., Eagle, A., Miller-Cunningham, L. and Jaspan, C. (2018) 'Lessons from building static analysis tools at Google', *Communications of the ACM*, 61(4), pp. 58–66. doi:10.1145/3188720.

Tufano, R., Masiero, S., Mastropaolo, A., Pascarella, L., Poshyvanyk, D. and Bavota, G. (2022) 'Using pre-trained models to boost code review automation', *Proceedings of the 44th International Conference on Software Engineering (ICSE)*, pp. 2291–2302.

Vaithilingam, P., Zhang, T. and Glassman, E.L. (2022) 'Expectation vs. experience: Evaluating the usability of code generation tools powered by large language models', *CHI Conference on Human Factors in Computing Systems Extended Abstracts (CHI EA '22)*. doi:10.1145/3491101.3519665.
