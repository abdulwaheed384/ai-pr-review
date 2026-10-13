---
title: "Evaluating AI-Driven Security Review in Modern DevSecOps Pipelines"
---

```{=openxml}
<w:p><w:pPr><w:spacing w:before="1800"/></w:pPr></w:p>
```

::: {custom-style="TitleBlock"}
Evaluating AI-Driven Security Review in Modern DevSecOps Pipelines

An empirical comparison of an AI reviewer with Checkov and tfsec for Terraform pull requests

Abdul Waheed

Student number: 209333039

Supervisor: [Supervisor name]

A dissertation submitted in partial fulfilment of the requirements for the degree of MSc Cybersecurity

University of Sunderland

[Faculty name], School of Computer Science

October 2026
:::

```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```

# Declaration {.unnumbered}

I declare the following:

(1) that the material contained in this dissertation is the end result of my own work and that due acknowledgement has been given in the bibliography and references to ALL sources be they printed, electronic or personal.

(2) the Word Count of this Dissertation is 10,343

(3) that unless this dissertation has been confirmed as confidential, I agree to an entire electronic copy or sections of the dissertation to being placed on the eLearning Portal, if deemed appropriate, to allow future students the opportunity to see examples of past dissertations. I understand that if displayed on the eLearning Portal it would be made available for no longer than five years and that students would be able to print off copies or download.

(4) I agree to my dissertation being submitted to a plagiarism detection service, where it will be stored in a database and compared against work submitted from this or any other Department or from other institutions using the service.

In the event of the service detecting a high degree of similarity between content within the service this will be reported back to my supervisor and second marker, who may decide to undertake further investigation that may ultimately lead to disciplinary actions, should instances of plagiarism be detected.

(5) I have read the University of Sunderland Policy Statement on Ethics in Research and I confirm that ethical issues have been considered, evaluated and appropriately addressed in this research.

SIGNED: ............................................

DATE: ..............................................

```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```

# Abstract {.unnumbered}

Infrastructure-as-Code lets cloud misconfigurations be caught at pull-request review, but the rule-based scanners used for this detect only what their rules describe and explain little. This study evaluated whether an AI reviewer based on a large language model improves Terraform security review when compared with Checkov and tfsec. A GitHub Actions pipeline ran all three tools on fifteen controlled test cases with ground truth fixed in advance. Evidence verification showed that early AI results had been influenced by scanner output. The workflow was therefore corrected, and every case was rerun with the AI working independently, three times per case. The AI detected 11 of 12 vulnerable cases, and a twelfth partially, against 5 for Checkov, 4 for tfsec and 8 for both scanners combined. It found every condition the scanners found, plus context-dependent and secret-related weaknesses they missed. Its errors, however, differed in kind: findings were classified inconsistently between identical runs, a third of runs on acceptable configurations raised findings, and 7 of 45 confirmed findings were false. Applying its recommended fixes resolved all twelve targets, but one recommendation for a false finding produced invalid Terraform. The study also found that comments in the code changed the AI's verdicts. The results support using AI review as an advisory layer alongside deterministic scanners, not as a replacement or merge gate. They are limited by the small constructed sample, a single model and single-rater scoring.

```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```

# Contents {.unnumbered}

```{=openxml}
<w:p><w:r><w:fldChar w:fldCharType="begin" w:dirty="true"/></w:r><w:r><w:instrText xml:space="preserve"> TOC \o "1-2" \h \z \u </w:instrText></w:r><w:r><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:t>Table of contents</w:t></w:r><w:r><w:fldChar w:fldCharType="end"/></w:r></w:p>
```

```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```

# List of Figures {.unnumbered}

```{=openxml}
<w:p><w:r><w:fldChar w:fldCharType="begin" w:dirty="true"/></w:r><w:r><w:instrText xml:space="preserve"> TOC \h \z \t "Image Caption,1" </w:instrText></w:r><w:r><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:t>List of figures</w:t></w:r><w:r><w:fldChar w:fldCharType="end"/></w:r></w:p>
```

# List of Tables {.unnumbered}

```{=openxml}
<w:p><w:r><w:fldChar w:fldCharType="begin" w:dirty="true"/></w:r><w:r><w:instrText xml:space="preserve"> TOC \h \z \t "Table Caption,1" </w:instrText></w:r><w:r><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:t>List of tables</w:t></w:r><w:r><w:fldChar w:fldCharType="end"/></w:r></w:p>
```

```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```
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


```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```
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

: Table 2.1: Rule-based and AI-assisted review as characterised in the literature

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


```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```
# 3 Practical Research Methodology

## 3.1 Research Design and Methodology

This study uses a controlled experimental comparison with a mixed-methods evaluation. Quantitative measures describe how often each reviewer detected a known security condition and how often it raised findings against acceptable configurations. Qualitative assessment, structured by a predefined rubric, judges whether the AI reviewer's explanations and remediation advice were accurate and usable. The combination follows the evaluation plan set out in Assignment 1 and reflects the view that detection and usefulness must be analysed separately, because a tool may detect accurately yet explain poorly (Creswell and Creswell, 2018).

The design follows the logic of a software engineering experiment (Wohlin et al., 2012). The researcher controls the treatment, a Terraform change with a documented security state. Each reviewer is then applied to the same artefact, and every output is compared with a ground truth fixed before the tools were run. The unit of analysis is the test case. Because the AI reviewer is non-deterministic, each case was also reviewed several times, giving a second, run-level unit of analysis.

The original plan defined three conditions: traditional scanning (Checkov and tfsec), AI-only review and a hybrid of both. In the executed study these conditions were realised in two phases. Between 9 and 12 October 2026 the test cases were run under the workflow default, Condition C, in which normalised Checkov and tfsec findings were inserted into the AI prompt (commit 732083d). Evidence verification on 13 October showed that every AI result from that phase was scanner-informed, so none of it could be reported as AI-only. The workflow was therefore changed (pull request #69, merged on 13 October) so that both scanners and the AI reviewer run in one job without exchanging data. All test cases were then re-run under this independent configuration.

As a result, the AI-only condition is measured directly from the independent runs. The scanner condition comes from the same runs, and the hybrid condition is examined in two forms. The first is the historical scanner-informed runs for TC01–TC12. The second is a decision-level combination of the independent outputs, in which a condition counts as detected when either the scanners or the AI report it. Chapter 4 keeps these forms separate.

## 3.2 System Architecture and Experimental Environment

Figure 3.1 shows the experimental pipeline. Each test case lives on its own branch. Opening a pull request, or dispatching the workflow manually for repeat runs, starts a single GitHub Actions job named "PROM06 Experimental Security Review" on a GitHub-hosted Ubuntu runner.

![Figure 3.1: Experimental pipeline and the scanner-informed path used only in the earlier Condition C runs](/home/claude/prom06-outputs/figures/fig_architecture.png)

The job first writes an experiment metadata file recording:

- the experimental condition;
- the commit under test;
- the run identifier;
- the event type;
- whether scanner findings were supplied to the AI.

It then initialises and validates the Terraform without a backend. Checkov, tfsec and the AI review run in turn, three pull-request comments are posted, and all raw outputs are uploaded as a run artefact. The steps execute sequentially, but in the independent configuration no step reads another tool's output.

The pipeline is entirely static. It never runs `terraform plan` or `apply`, so findings describe the configuration, not deployed Azure resources. The environment is summarised in Table 3.1.

: Table 3.1: Experimental environment and tool configuration

| Component | Configuration used |
|------------|------------------------------------------|
| CI platform | GitHub Actions, `ubuntu-latest` hosted runner; workflow `.github/workflows/terraform.yml` |
| Infrastructure code | Terraform with AzureRM provider `~> 4.0` (lock file 4.81.0); `terraform init -backend=false`, `fmt -check`, `validate` |
| Checkov | Version 3.3.1, `--framework terraform`, JSON output (secrets framework not run) |
| tfsec | Version 1.28.14, JSON output |
| AI reviewer | Anthropic Claude, model identifier `claude-sonnet-4-6`, Messages API, `max_tokens` 3,000, provider-default temperature, 90 s timeout, two retries |
| AI inputs | `ai/prompt.txt`, `ai/policy.md`, `README.md`, all `terraform/*.tf` files with changed files marked |
| Output handling | JSON schema validation, de-duplication, classification policy v2.2, operational score from `ai/scoring.json` |
| Evidence | Run artefact per run (metadata, raw tool JSON, raw and parsed AI output, rendered comments) |

Two configuration gaps limit reproducibility. Terraform itself was not pinned in the workflow. The AI model identifier is hard-coded in the review runner but is not written to the run metadata.

## 3.3 Technologies and Tools

Terraform was chosen because it is the IaC language used in the Assignment 1 prototype and is widely adopted for multi-cloud provisioning (HashiCorp, 2024). Azure was retained as the target platform for continuity with the existing baseline.

Checkov and tfsec represent the deterministic, rule-based scanners that the literature treats as the established baseline for IaC security (Bridgecrew, 2024; Aqua Security, 2024). Using both allows the study to show that scanners differ from each other as well as from the AI. Both versions were pinned so that scanner behaviour would be stable across runs. tfsec has since been folded into Trivy by its maintainers (Aqua Security, n.d.), which affects how far the tfsec results generalise to current practice.

Anthropic Claude was selected in Assignment 1 as the large language model for the reviewer (Anthropic, 2024). The study evaluates one model and one prompt design. It does not compare models.

## 3.4 Implementation of the AI-Assisted Review Pipeline

The AI reviewer is a Python program (`ai/review_runner.py`) that runs only when the pull request changes at least one Terraform file. It assembles a single prompt from four parts:

- the review instructions;
- a short organisational policy file defining six rules (subnet NSG association, no public DNS, DDoS protection for production only, diagnostic logging, mandatory tags, and no unjustified public exposure);
- the repository README;
- every Terraform file in the configuration, with changed files labelled.

Supplying the complete configuration, not only the diff, was a deliberate design choice so that cross-file conditions such as a missing NSG association could be reasoned about.

The prompt requires a JSON response with at most three findings. Each finding carries a severity, a category and a status: CONFIRMED, NEEDS_CONTEXT, INFORMATIONAL or FALSE_POSITIVE. Only CONFIRMED findings appear in the pull-request comment and reduce the operational score (base 100; −30 for critical or high, −15 for medium, −5 for low). The score maps to APPROVE, APPROVE_WITH_COMMENTS or DO_NOT_MERGE.

The runner validates the response against the schema before posting. In one TC08 run it rejected an output whose policy mapping referred to a finding marked FALSE_POSITIVE, which failed the job. That run is retained as evidence because validation failure is a realistic integration outcome.

The operational score is a pipeline convenience and is not used as a research measure.

Two features of the implementation matter for interpretation. First, the policy file is supplied to the AI but has no equivalent in the scanners. This gives the AI an input advantage for cases that map directly to a policy rule (TC05, TC06, TC08 and TC12). Second, the prompt was refined on the TC01 baseline before the main experiment, so the reviewer was tuned against part of the test material. Both are treated as threats to validity in Chapter 5.

## 3.5 Experimental Design and Test Cases (TC01–TC15)

Twelve test cases were specified before execution in the experimental master plan and ground-truth matrix (Appendix B). Each isolates one Azure misconfiguration or control scenario and includes clean and legitimate cases to test over-reporting.

Three cases were added on 13 October to address weaknesses found while verifying the first twelve:

- **TC13** isolates a least-privilege violation that depends on a separate requirements file. This was needed because TC11 turned out to be detectable from the wildcard role alone, without its intended cross-file reasoning.
- **TC14** is a second negative control. It applies the restricted-source remediation expected for TC02.
- **TC15** places a hard-coded password in a variable default, a more common pattern than the unused local in TC09.

The ground truth for TC13–TC15 was committed (commit cbda52c) before their Terraform fixtures, so these cases meet the same pre-registration rule as the original set. The fifteen cases are listed in Table 3.2.

: Table 3.2: Test cases and ground truth

| ID | Category | Terraform condition | Ground truth |
|------|-----------|----------------------------------------|----------|
| TC01 | Control | Secure baseline: NSG with deny-all rules and subnet association, private Log Analytics with NSG diagnostics, Azure-provided DNS | Secure |
| TC02 | Network | Inbound SSH (22) from 0.0.0.0/0 | Vulnerable |
| TC03 | Network | Inbound RDP (3389) from 0.0.0.0/0 | Vulnerable |
| TC04 | Network | Inbound HTTP (80) from 0.0.0.0/0 | Vulnerable |
| TC05 | Network / context | NSG exists but its subnet association is removed | Vulnerable |
| TC06 | Network | VNet uses public resolver 8.8.8.8 | Vulnerable |
| TC07 | Encryption | Storage account `min_tls_version = "TLS1_0"` | Vulnerable |
| TC08 | Logging | NSG diagnostic setting removed | Vulnerable |
| TC09 | Secrets | Dummy credential-shaped string in an unused local | Vulnerable |
| TC10 | IAM | Custom role with `actions = ["*"]` at subscription scope | Vulnerable |
| TC11 | Context | Same wildcard role plus a file documenting two required read actions | Vulnerable |
| TC12 | False positive | Inbound HTTPS (443) from any source, documented as an intended public endpoint | Legitimate |
| TC13 | IAM / context | Contributor at subscription scope; requirements file specifies Reader on the resource group | Vulnerable |
| TC14 | False positive | SSH (22) from a single documentation address, 203.0.113.10/32 | Secure |
| TC15 | Secrets | Hard-coded password as a variable default | Vulnerable |

Each case was built on its own branch from the same main commit. For TC02–TC12, the Terraform under test is byte-identical to the original test-case commits, which was confirmed by comparing the trees. TC01 differs only by one corrected comment.

Each case was opened as a pull request and then dispatched twice more, giving three runs per case. TC08 has four runs because the first run failed validation. This gave 46 independent runs in total.

## 3.6 Ground-Truth Definition and Validation

Ground truth was defined from the Terraform and the documented scenario intent, never from tool output. The ground-truth matrix specifies, for each case:

- the intended security state;
- the affected resources;
- the expected secure configuration;
- the benchmark or policy mapping, where one can be justified.

The wording used here follows the latest revision of the test-case evidence page (version 72), which refined several scenario descriptions after the first runs. Where earlier records conflicted, for example over the TC01 baseline or the TC10 severity, the conflict was resolved against the raw run evidence and the decision recorded (Appendix E).

Outputs were classified with the codes in Table 3.3. Several scanner rules reporting the same condition were normalised to a single detection, so rule counts are never treated as vulnerability counts.

: Table 3.3: Classification codes

| Code | Meaning |
|------------|-----------------------------------------|
| TP | Target condition reported (AI: confirmed in every successful run) |
| FN | Target condition not reported |
| PARTIAL | AI raised the target but did not consistently classify it as CONFIRMED |
| TN | No finding against an acceptable configuration (AI: in most runs) |
| FP | Finding against an acceptable configuration |
| CONTEXT | Finding on a property that is intended by design, where acceptability depends on documented context |
| UNVERIFIED | Result cannot be traced to a specific run on the specified fixture |

Individual confirmed AI findings were labelled separately as:

- TARGET, the ground-truth condition;
- EXTRA-VALID, a true issue outside the target;
- DUPLICATE, a restatement of another finding;
- FALSE, a claim that is wrong against the ground truth or the provider schema.

## 3.7 Evaluation Metrics and Scoring Rubric

Detection was measured as the proportion of vulnerable cases classified TP. It is reported both strictly, with PARTIAL counted as a miss, and leniently, with PARTIAL counted as a hit. Over-reporting was measured at two levels:

- **case level:** the number of non-vulnerable cases flagged;
- **run level:** the share of non-vulnerable runs containing at least one confirmed finding.

The precision of the AI's confirmed findings was calculated as (TARGET + EXTRA-VALID) divided by all confirmed findings. These figures describe fifteen constructed cases and are not estimates for any wider population, so no significance testing was attempted.

Explanation and remediation quality were scored on the six-dimension, 0–2 rubric defined in the repository on 8 October, before TC02–TC12 were executed. The dimensions are:

- detection correctness;
- explanation accuracy;
- impact explanation;
- remediation quality;
- context awareness;
- developer usefulness.

The dimensions were fixed in advance. The operational definitions in Table 3.4, which make the scale applicable consistently, were written on 13 October after the outputs had been read. Non-vulnerable cases were scored on detection, explanation and usefulness only.

: Table 3.4: Operational scoring rules (summary)

| Dimension | 2 | 1 | 0 |
|--------|--------------|--------------|--------------|
| Detection | Target CONFIRMED on the correct resource | Target only NEEDS_CONTEXT, or partial | Not raised, FALSE_POSITIVE, or run failed |
| Explanation | All technical and policy claims correct | Inaccurate claim or inapplicable policy mapping | Materially wrong |
| Impact | Specific to this configuration | Generic | Missing |
| Remediation | Correct and reaches the secure state | Partial or questionable | Wrong or absent |
| Context | Correct cross-resource reasoning | Incomplete | Ignores relevant context |
| Usefulness | Actionable comment with no noise | Extra false or duplicate confirmed findings | Misleading, target hidden, or legitimate change blocked |

Scores for all 46 runs were produced by an AI research assistant applying these rules, with every score and its written justification recorded alongside the evidence (Appendix E). No second independent rater was used, so the scores reflect a single rubric application. Chapter 5 treats this as a limitation.

Remediation effectiveness, the master plan's demonstrated correction rate, was tested directly. For each case the AI detected, the recommendation from the first run that confirmed the target was applied to the unchanged fixture on a new branch, with no other edits. Where the AI gave only a placeholder source range, the documentation address 203.0.113.10/32 was used. Each remediation branch was opened as a pull request so that validation, both scanners and a fresh AI review ran on it. Two further variants isolated specific effects:

- the stale fixture comment was corrected while the fix was left unchanged;
- a recommendation attached to a false AI finding was applied as written.

Timing was taken from GitHub step timestamps, which have one-second resolution. Because all comments are posted together at the end of the job, time to feedback is the same for every tool. The study therefore reports each tool's step duration and the overall pull-request-to-comment latency, not separate detection times.

## 3.8 Data Collection and Analysis Procedure

For every run, the run artefact provided the evidence:

- experiment metadata;
- raw Checkov and tfsec JSON;
- the raw model response;
- the parsed AI output;
- the rendered comments.

Pull-request comments and job timings were retrieved through the GitHub API. Before any result was used, the metadata of all 46 runs was checked to confirm the independent condition, the commit under test and that no scanner findings had been supplied to the AI. Scanner results were also reproduced locally with the same tool versions, and they matched the pipeline outputs in every case.

Analysis then proceeded in a fixed order:

1. Classify each tool's output against the ground truth.
2. Normalise overlapping scanner rules.
3. Label every confirmed AI finding.
4. Score the AI output against the rubric.
5. Compute the metrics.

Spreadsheet formulas, not hand totals, produce every reported figure. A claim register links each statement in Chapter 4 to its run identifier, commit or file. All raw evidence is preserved unchanged on a dedicated repository branch (Appendices D–F).

## 3.9 Reproducibility, Reliability and Research Ethics

Scanner results were identical across repeated runs and matched the local reproduction, so the scanner condition is reproducible with the pinned versions. The AI condition is not. With no temperature set, identical inputs produced different findings, severities and classifications, a behaviour documented for large language models in code tasks (Ouyang et al., 2025). Three runs per case show this variation but cannot estimate its rate with any precision. The unpinned Terraform version and the unrecorded model identifier in run metadata further limit exact replication. Prompt and policy files are versioned in the repository, so the review instructions for every run can be recovered from its commit.

The study involved no human participants and no personal data. All infrastructure was synthetic. Secrets were dummy values created for the purpose, and addresses came from the RFC 5737 documentation range (Arkko, Cotton and Vegoda, 2010). No test case was merged or deployed, so no vulnerable resource was ever exposed. Only synthetic Terraform was sent to the external AI service.

Formal ethics approval was not required, because the study involved no human participants and no personal data. In line with the module's guidance on artificial intelligence, generative AI was used in two ways. It was the object of study, and it also acted as a research assistant for evidence verification, scoring and drafting. All AI-assisted outputs were checked against the primary evidence before use.

The evidence register and the archived raw outputs allow every reported figure to be checked independently of that assistance.


```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```
# 4 Analysis of Results

## 4.1 Introduction

This chapter reports what the scanners and the AI reviewer actually produced on the fifteen test cases and evaluates those outputs against the ground truth defined in Chapter 3. Results come from the 46 independent runs unless stated otherwise. The earlier scanner-informed (Condition C) runs are used only in Section 4.4, and are labelled as such.

The figures describe fifteen deliberately constructed cases. They show how these tools behaved on these configurations and are not estimates of performance in general. Every figure is traceable to a run identifier, commit or file (Appendix E).

Figure 4.1 summarises the case-level outcome for every tool.

![Figure 4.1: Detection outcome by test case and tool, classified against ground truth](/home/claude/prom06-outputs/figures/fig_detection_matrix.png)

## 4.2 Results from Traditional Scanning (Checkov and tfsec)

Both scanners produced identical output in every repeated run, and their results matched a local reproduction with the same versions. Checkov detected 5 of the 12 vulnerable cases (TC05, TC06, TC07, TC10, TC11), and tfsec detected 4 (TC02, TC03, TC04, TC07). Together they detected 8. Only TC07, the weak TLS setting, was found by both. Their coverage was therefore almost entirely complementary, not overlapping.

### Checkov's misses on public network rules

The most instructive scanner result is Checkov's silence on TC02–TC04. Its rules for public SSH, RDP and HTTP exposure (CKV_AZURE_10, CKV_AZURE_9 and CKV_AZURE_160) were evaluated and passed for rules whose source was `0.0.0.0/0`. When the source in TC02 was changed to `*` and nothing else, CKV_AZURE_10 failed. The miss is therefore a value-matching limitation in the rule, not a configuration error, and it means that two equivalent ways of writing "the whole internet" receive different verdicts. Figure 4.2 shows the TC02 pull request as a developer saw it.

![Figure 4.2: TC02 pull request (#71): Checkov reports no failed checks, while tfsec and the AI reviewer both report the public SSH rule](/home/claude/prom06-outputs/figures/fig_ss_tc02_pr71.png)

### tfsec's silence outside network exposure

tfsec produced no finding for TC05, TC06, TC08, TC10, TC11 or TC13. These cover:

- subnet–NSG association;
- VNet DNS servers;
- custom role definitions and role assignments;
- diagnostic settings.

Its detections in this study were confined to network exposure and storage encryption, which suggests these misses reflect the scope of its rule set, not a fault in this configuration.

### Cases neither scanner detected

Neither scanner detected:

- the missing NSG diagnostic setting (TC08);
- either embedded secret (TC09, TC15);
- the over-privileged role assignment in TC13. That assignment uses the built-in Contributor role, so no wildcard rule fires.

For the secrets, the result partly reflects the study's configuration. Checkov was run with its Terraform framework only. A follow-up run of its secrets framework flagged the TC09 string as a high-entropy value (CKV_SECRET_6) but did not flag the readable password in TC15. Entropy-based detection catches random-looking strings, not secrets that look like ordinary words.

### False alarms and noise

On the non-vulnerable cases the scanners were quiet except for one disputed alert. tfsec reported TC12's intended public HTTPS rule as CRITICAL. This is classified as CONTEXT: the rule is accurate about the configuration but cannot know that the exposure is intended.

Checkov produced the most noise on TC07. Ten failed checks unrelated to TLS appeared alongside the relevant one (CKV_AZURE_44), which illustrates why raw check counts cannot be read as vulnerability counts.

## 4.3 Results from AI-Only Review

### Detection

Independently of the scanners, the AI reviewer confirmed the target condition in all runs of 11 of the 12 vulnerable cases. Across vulnerable-case runs, it confirmed the target in 34 of 37.

The exception was TC08. In all four runs the AI identified the missing NSG diagnostic setting, explained why it mattered and recommended the correct resource. It classified the finding differently each time:

- **once as FALSE_POSITIVE,** an output the runner rejected, so the job failed;
- **twice as NEEDS_CONTEXT,** a status that is hidden from the pull-request comment;
- **once as CONFIRMED.**

The developer would therefore have seen the finding in one run out of four. This is recorded as PARTIAL: the model noticed the problem but its classification step was unstable, so it was not a detection miss.

### AI-only detections

Three cases were detected by the AI and by neither scanner: TC09, TC13 and TC15.

TC13 is the clearest evidence of contextual reasoning in the study. In all three runs the AI found the Contributor assignment at subscription scope by comparing it with the separate requirements file. It also recommended exactly the Reader role at resource-group scope.

TC11 was intended to test the same ability but proved weaker evidence. Its wildcard role is detectable without the requirements file, as Checkov showed.

None of the three AI-only detections depended on the policy file supplied to the AI, which strengthens their weight. The cases that did map to a policy rule (TC05, TC06, TC08) cannot be attributed to model reasoning alone.

### Over-reporting

On the non-vulnerable cases the AI was less reliable:

- **TC01:** clean in all three runs.
- **TC12:** one run blocked the legitimate HTTPS change (score 50, DO_NOT_MERGE; Figure 4.3), one raised a LOW tagging finding, and one was clean.
- **TC14:** the restricted SSH rule was accepted in two runs. One run confirmed a LOW finding about its wildcard destination, which the ground truth does not treat as a defect.

At run level, 3 of 9 non-vulnerable runs carried at least one confirmed finding.

![Figure 4.3: AI review of the legitimate HTTPS rule in TC12, run 1 (pull request #81), blocking the change](/home/claude/prom06-outputs/figures/fig_ss_tc12_pr81.png)

### Precision of confirmed findings

Table 4.1 shows how the AI's 45 confirmed findings divide.

: Table 4.1: AI confirmed findings across 46 independent runs

| Label | Count | Examples |
|------------|------|------------------------------------------------|
| TARGET | 34 | Ground-truth condition in TC02–TC11, TC13, TC15 |
| EXTRA-VALID | 3 | Missing mandatory tags on the TC07 storage account |
| DUPLICATE | 1 | TC03 run 3 restated public RDP as a policy finding |
| FALSE | 7 | Tags required on `azurerm_role_definition` (TC10 ×2) and `azurerm_network_security_rule` (TC12 ×2); TC12 HTTPS treated as a defect (×2); TC14 destination scope |
| Total | 45 | Precision (TARGET + EXTRA-VALID) / total = 82% |

### Sensitivity to the design of the negative controls

Three of the seven false findings need qualification. Both negative controls added their allow rule to the network security group shared by the whole subnet, with a wildcard destination (`destination_address_prefix = "*"`). The TC12 rule therefore exposes port 443 on every host in the subnet, not on a single web endpoint, and the TC14 rule does the same for SSH. The ground truth, fixed before execution, considered only the source of each rule, and Table 4.1 follows it.

However, the two TC12 findings that called the exposure broader than its documented justification, and the TC14 finding about the wildcard destination, describe the configuration accurately. They point to a weakness in the test fixtures, not an invented one.

If these three findings are treated as valid, false findings fall from 7 to 4 and precision rises from 82% to 89% (40 of 45). Two of the nine non-vulnerable runs would then carry a false finding instead of three. The four remaining false findings are all claims that resources which cannot be tagged must carry tags. The classification in Table 4.1 is kept because changing the ground truth after seeing the results would weaken the study more than the flaw does. tfsec's TC12 alert is unaffected, because its rule concerns the public source of the traffic, not its destination.

## 4.4 Results from the Hybrid Approach

The hybrid condition is examined in two forms, which must not be merged.

### Scanner-informed runs (Condition C)

In the scanner-informed runs of 9–12 October, the AI detected all ten vulnerable cases in TC01–TC12, including TC08, and its comments cited the scanner rule identifiers. The TC01 result from that phase cannot be tied to a run on the final baseline and is unverified.

The severities were higher than in the independent runs: CRITICAL rather than HIGH for TC02, TC03 and TC07, matching the CRITICAL labels attached by tfsec. A plausible reading is that the scanner evidence anchored the AI's severity. However, prompt, fixture state and timing also differed between the phases, so the effect cannot be isolated. Most Condition C cases ran only once, so the TC08 detection may equally reflect run-to-run variation, as the independent runs suggest.

### Decision-level combination

The second form is a combination of the independent outputs, reporting a condition when either the scanners or the AI do. It detected 11 of the 12 vulnerable cases. Only TC08 was missed, and only if PARTIAL is counted as a miss.

No condition was found by a scanner and missed by the AI. Within this set, the AI therefore covered everything the scanners covered plus three cases they did not.

The combination also inherits both sources of false alarm. These are tfsec's alert on TC12 and the AI's run-level findings on TC12 and TC14.

## 4.5 Comparative Analysis Across TC01–TC15

Figure 4.4 compares detection rates. On the twelve verified original cases the scanners together reached 80% and the AI 90%. On all fifteen cases the scanners together reached 67% and the AI 92% (100% if PARTIAL counts).

The gap widened when the three later cases were added, because all three targeted conditions without a scanner rule. This illustrates how strongly such comparisons depend on case selection. The AI's apparent advantage is concentrated in conditions that are contextual (TC13), semantic (TC15) or outside the scanners' rule sets (TC08, TC09). Neither the scanners nor the AI is uniformly stronger: tfsec found the public network rules that Checkov missed, and Checkov found the association, DNS and role conditions that tfsec has no rules for.

![Figure 4.4: Detection rate by tool for the original and extended case sets](/home/claude/prom06-outputs/figures/fig_detection_rates.png)

: Table 4.2: Summary of detection and false-alarm measures

| Measure | Checkov | tfsec | Checkov ∪ tfsec | AI independent |
|------------------------------|------|------|--------|----------|
| Vulnerable cases detected, TC01–TC12 (n = 10) | 5 | 4 | 8 | 9 (+1 partial) |
| Vulnerable cases detected, TC01–TC15 (n = 12) | 5 | 4 | 8 | 11 (+1 partial) |
| Non-vulnerable cases flagged (n = 3) | 0 | 1 (TC12) | 1 | 1 (TC12) |
| Non-vulnerable runs with a confirmed finding | — | — | — | 3 of 9 |
| Deterministic across repeated runs | Yes | Yes | Yes | No |

## 4.6 Detection Accuracy and False Positives

The scanners' errors were omissions, and those omissions were stable. A missing rule or a narrow match fails the same way every time, which makes it predictable and fixable.

The AI's errors were of a different kind:

- **inconsistent classification,** as in TC08;
- **over-reporting on acceptable configurations,** as in TC12 and TC14, although part of this reflects the fixtures' wildcard destinations (Section 4.3);
- **false claims about the platform.**

The most telling false claims concerned tags. In TC10 and TC12 the AI asserted that resources which cannot be tagged must carry mandatory tags. In a later run of TC12 it correctly stated the opposite. Applying its TC10 recommendation as written made `terraform validate` fail with "An argument named "tags" is not expected here".

Run-to-run variation affected severity as well as detection. TC05 was rated HIGH twice and MEDIUM once on identical input. TC10 gained or lost an extra finding between runs. A pipeline gate based on the AI's score would therefore have produced different merge decisions for the same change.

## 4.7 Remediation Quality and Contextual Accuracy

### Rubric scores

Figure 4.5 summarises the rubric scores. Over the 37 vulnerable-case runs the AI averaged 1.89 out of 2 for detection, remediation and impact. Context awareness averaged 1.97 and developer usefulness 1.76. Explanation accuracy was lowest at 1.65. Eighteen of the 37 runs scored full marks on every dimension.

![Figure 4.5: Mean AI quality score by rubric dimension](/home/claude/prom06-outputs/figures/fig_ai_quality.png)

The explanation errors fell into three groups:

- **Inapplicable policy mapping.** Nine runs mapped a finding to the "no public exposure" rule when the issue concerned identity, encryption or secrets. This happened partly because the supplied policy file had no rule for those topics.
- **False platform claims.** These included the tag claims above. In two TC13 runs the AI also asserted that Contributor can change role assignments, which Microsoft's role definition explicitly excludes (Microsoft, n.d.).
- **One unconditional misstatement.** In one TC09 run the AI said an unreferenced local value was already present in Terraform state.

Conditional statements that secrets in configuration may reach state were not penalised, because the vendor documentation makes the same general point (HashiCorp, n.d.).

Remediation was usually specific and correct. The main gap was TC04, where all three runs restricted the source address but never mentioned that HTTP is unencrypted or proposed HTTPS.

These scores come from a single application of the rubric by an AI assistant, so they have no independent reliability check. Their value lies in the recorded justification for each score, which can be audited against the evidence, more than in the averages themselves.

### Remediation validation

Applying the AI's own recommendations tested whether its advice achieves the secure state (Table 4.3; Figure 4.7). All twelve fixes resolved the target condition against the ground truth and passed formatting and validation. In eight cases the scanner that had flagged the issue confirmed the fix. The other four were cases no scanner could see, so only the ground truth could confirm them.

The fresh AI review accepted nine of its own fixes. Two of the rest are revealing:

- **TC07.** The TLS issue disappeared, but the AI then blocked the change over three other storage settings, one of which it had previously classified as needing context.
- **TC02 and TC03.** The AI rejected its own fixes with HIGH findings. Both reviews quoted the unchanged fixture comment "Deliberately unrestricted…". When only that comment was corrected, TC03 passed cleanly and TC02 received a LOW note. With its comment corrected, TC04 drew a new MEDIUM finding about cleartext HTTP, an issue the AI had not raised when reviewing the original fixture. Figure 4.6 shows the TC02 pair.

![Figure 4.6: The same TC02 fix reviewed with the stale fixture comment (a) and with the comment corrected (b)](/home/claude/prom06-outputs/figures/fig_ss_stale_comment.png)

The third case was never re-reviewed: TC10's fix deleted a file, and the runner skips the AI step when a pull request changes no Terraform file.

: Table 4.3: Remediation validation (one review per fix)

| Case | AI fix applied | Target resolved | Confirmed by scanner | AI re-review |
|--------|----------------------|----------|----------|--------------------------|
| TC02 | Source restricted to one address | Yes | tfsec | HIGH (stale comment); LOW once corrected |
| TC03 | Source restricted to one address | Yes | tfsec | HIGH (stale comment); clean once corrected |
| TC04 | Source restricted to one address | Yes | tfsec | LOW; MEDIUM "use HTTPS" once corrected |
| TC05 | Subnet–NSG association added | Yes | Checkov | Clean |
| TC06 | Public DNS removed | Yes | Checkov | Clean |
| TC07 | Minimum TLS 1.2 | Yes | Checkov, tfsec | Blocked on other storage findings |
| TC08 | NSG diagnostic setting added | Yes | n/a | Clean |
| TC09 | Hard-coded local removed | Yes | n/a | Clean |
| TC10 | Wildcard role deleted | Yes | Checkov | Not invoked (deletion only) |
| TC11 | Two documented read actions; resource-group scope | Yes | Checkov | Clean |
| TC13 | Reader at resource-group scope | Yes | n/a | Clean |
| TC15 | Default removed; `sensitive = true` | Yes | n/a | LOW (no validation block) |
| TC10 (tags) | Tags added to role definition | Invalid — validate failed | — | Not run |

![Figure 4.7: Outcomes of applying the AI's recommended fixes](/home/claude/prom06-outputs/figures/fig_remediation.png)

### Comments as evidence

These results expose a finding the study did not set out to measure: the AI treats natural-language comments in the code as evidence. Four observations support this:

- the stale comments altered the re-review verdicts;
- every TC05 run raised a context note about an outdated DNS comment;
- the rejected TC08 run cited a comment as proof that the omission was intentional;
- the clean TC12 run quoted a fixture comment beginning "Ground truth:".

This is useful when comments are accurate. It also means that comments can lower or raise the AI's verdict independently of the configuration they describe.

## 4.8 Execution Time and Operational Performance

Figure 4.8 shows median step durations across the 46 runs:

| Step | Median duration |
|--------------------------|--------------------------|
| AI review | 31.5 s (range 18–131 s) |
| Checkov scan | 6 s, plus 19.5 s to install |
| tfsec | about 1 s |
| Whole job | 77 s |
| Pull request opened to comments posted | 79 s |

The AI step accounted for about 41% of job time and was the only step whose duration varied widely, because it depends on an external service. For a pull-request workflow these times are small. Feedback arrived in under two minutes in every pull-request run. Cost and API availability, which the study did not measure, are the more relevant operational constraints.

![Figure 4.8: Median pipeline step durations](/home/claude/prom06-outputs/figures/fig_timing.png)

## 4.9 Discussion Against the Research Questions and Existing Literature

### Detection accuracy

On these cases the AI detected more conditions than either scanner, and every condition the scanners found. Its added detections came from context and semantics, not from better coverage of the scanners' own rule types.

The scanners' failures were predictable gaps. The AI's were inconsistent behaviour and over-reporting. That contrast matters because false alarms and opaque results are a known reason developers stop trusting analysis tools (Johnson et al., 2013). A reviewer that blocks a legitimate change in one run and accepts it in the next adds a new form of that problem.

### Remediation quality

The AI's advice was mostly correct and sufficient to reach the secure state, which the remediation tests demonstrate rather than assume. However, its explanations contained confident false statements about the platform, consistent with the hallucination problem described for language models (Ji et al., 2023). One such statement produced invalid Terraform when followed.

### Integration challenges

The practical challenges observed were concrete:

- variation between identical runs (Ouyang et al., 2025);
- classification states that hide real findings from developers;
- validation failures;
- a review step skipped for deletion-only changes;
- sensitivity to comments.

The last of these connects directly to indirect prompt injection, where text placed in data the model reads alters its behaviour (Greshake et al., 2023). In a pull-request reviewer the code under review is exactly such data.

### Developer understanding

The study did not measure developer understanding directly, as no developers took part. The usefulness scores are a proxy judged by the researcher.

### Overall

Taken together, the evidence supports using the AI reviewer alongside deterministic scanners, not instead of them. It also argues for treating the AI's verdict as advisory, not as a merge gate.


```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```
# 5 Project Evaluation and Reflection

## 5.1 Overview of the Completed Project

The project built a working pull-request security review pipeline for Terraform on GitHub Actions. In it, Checkov, tfsec and an AI reviewer based on Anthropic Claude review every change and post their results back to the pull request. Fifteen controlled test cases were run through it, giving 46 independent AI reviews in total. Every output was classified against ground truth defined before execution. The AI's explanations were then scored, and its recommended fixes were applied and re-checked.

The study did not run as planned throughout. The most important deviation came during evidence verification, which showed that the first round of AI results had been produced with scanner findings in the prompt. That discovery led to a change in the workflow and a complete rerun. Much of the value of the final results depends on that correction.

## 5.2 Review of Research Objectives

Table 5.1 assesses each objective set out in Assignment 1.

: Table 5.1: Achievement of research objectives

| Objective | Outcome | Assessment |
|---|---|---|
| O1 Review literature on AI-assisted security review, DevSecOps, IaC security and static analysis | Chapter 2, extended with work on non-determinism, prompt injection and repair validity | Achieved |
| O2 Design and implement an AI-assisted security review pipeline | Working GitHub Actions pipeline with an independent AI reviewer, structured output, validation and evidence capture | Achieved |
| O3 Evaluate it against conventional scanners using predefined metrics | Detection, false alarms, precision, rubric scores, timing and remediation tested on 15 cases | Achieved within the limits of the sample |
| O4 Investigate the practical benefits and limitations of AI-generated feedback | Context and explanation benefits; inconsistency, false claims, comment sensitivity and review gaps identified | Largely achieved; developer understanding not measured with users |

The main shortfall is the human dimension of O4. The PROM05 plan included developer sessions and interviews. These were not carried out, so the effect of AI feedback on developers' understanding is inferred from the quality of the feedback itself, not observed in the people using it.

## 5.3 Evaluation of the Methodology and Results

### What worked

Three features of the method worked well:

- Ground truth was fixed before any tool was run, and for TC13–TC15 this ordering was proven by the commit history.
- Each AI review was repeated, so variation became visible instead of being hidden in a single run.
- Applying the AI's own fixes turned "the advice looks right" into a tested claim. It also produced two of the study's most useful findings: one AI fix did not validate, and the reviewer's verdicts were sensitive to comments in the code.

The evidence trail is also strong. Every run has its metadata, raw outputs and a commit. Scanner results were reproduced locally and matched exactly, and an artefact re-downloaded later was byte-identical to the archived copy.

### Threats to validity

The following threats limit what the results can support:

- **Construct validity.**
  - Several test files contained comments that described their purpose, including "Ground truth" and "Deliberately unrestricted". The AI demonstrably read these comments, so some of its detections and acceptances may have been cued.
  - TC07 was not a single-variable case, and TC11 did not isolate the cross-file reasoning it was meant to test.
  - The policy file given only to the AI favoured it on four cases.
  - The negative controls TC12 and TC14 placed their allow rules on the shared subnet security group with a wildcard destination. The ground truth did not consider this scope, so three AI findings counted as false are arguably valid (Section 4.3).
- **Internal validity.**
  - The TC01 baseline and the prompt were refined after early AI findings, so the reviewer was partly tuned on the test material.
  - The hybrid results come from an earlier phase with a different prompt and fixture state, so they cannot be compared cleanly with the independent runs.
- **Reliability.**
  - Three runs per case reveal the AI's variation but cannot measure its rate.
  - The quality scores are a single application of the rubric by an AI assistant, with no independent second rater. The operational definitions were also written after the outputs had been read.
- **External validity.** Fifteen constructed cases, one cloud provider, one model and one prompt cannot represent real repositories. The cases were also chosen partly where scanner rules were known to be weak, which inflates the AI's relative advantage.

The results that hold up best against these threats are qualitative and structural:

- scanner coverage depends on rules, and the two scanners were complementary;
- the AI detected context-dependent and semantic conditions the scanners could not;
- the AI's behaviour varied between identical runs;
- the AI was steered by comments, and its confident explanations sometimes contained false platform claims.

The detection percentages themselves should be read as descriptions of this test set only.

## 5.4 Personal Reflection and Lessons Learned

The most important lesson of this project came from something I got wrong. I had designed the pipeline so that Checkov, tfsec and the AI reviewer ran as separate tools, and I treated the first round of AI results as independent. When I traced each result back to its workflow run, I found that the default configuration had been passing the scanners' findings into the AI's prompt since 9 October. Every AI result for TC01–TC12 was therefore scanner-informed.

Rerunning everything cost time late in the project. However, reporting those results as AI-only would have made the central comparison meaningless. The experience changed how I treat evidence. I now regard a result as established only when I can link it to a specific run, commit and raw output, not when a summary or screenshot says so.

The project also departed from my PROM05 plan in several ways:

- **No developer sessions.** I did not run the developer sessions and interviews. [AB: state the real reason here in your own words.] That narrowed the study to the quality of the AI's output, not its effect on developers, and it removed the need for ethical approval.
- **No Azure deployment.** I did not deploy the test cases to Azure. Static review proved sufficient for the research questions and avoided exposing vulnerable resources.
- **Additions.** I added three test cases, repeated runs and remediation testing. In each case this was because verification showed a weakness in the original design, not because the plan anticipated it.

Technically, I learned that small details decide results. A scanner rule that treats "0.0.0.0/0" and "*" differently missed three cases, and a comment left unchanged in a test file reversed the AI's verdict on its own fix. Methodologically, I learned how easily a test design can leak the answer to the system under test.

I also used an AI assistant to help verify evidence, score outputs and draft text. That made the need to check everything against primary sources even more obvious.

If I started again, I would:

- prove the independence of each condition before running any tests;
- remove explanatory comments from test files;
- scope each negative control to a single resource, so that intended exposure is not confounded with a wider weakness;
- pin every tool and model version and record them in the run metadata;
- plan for a second human scorer from the outset.

## 5.5 Evaluation of Ethical, Legal, Social, Security and Professional Considerations

**Ethical and security.** The study used synthetic infrastructure only, with dummy secrets and documentation-range IP addresses. No test case was merged or deployed, so no vulnerable resource was exposed and no ethical approval was needed. The main residual risk was sending code to an external AI service. Only synthetic Terraform was sent, but organisations adopting such a reviewer would need to consider what code and secrets leave their environment.

**Legal.** Professional and legal considerations concern accountability. If an AI reviewer approves a change that later causes a breach, responsibility still rests with the organisation and its reviewers. The findings support keeping the AI advisory, not giving it authority to block or approve merges.

**Social and professional.** A reviewer that sometimes blocks legitimate work, or confidently states something false, can erode developers' trust in security tooling as a whole. This echoes the false-positive problem in Chapter 2 (Johnson et al., 2013). The comment-sensitivity finding also has a security dimension: anyone able to write comments in a pull request could influence an AI reviewer's verdict.

## 5.6 Limitations and Alternative Approaches

The principal limitations, set out in Section 5.3, are:

- the small constructed sample;
- a single model and prompt;
- cueing comments in the fixtures;
- input asymmetry between the AI and the scanners;
- single-rater scoring;
- the absence of developer participants.

Several alternative designs would address these:

- **Mined test cases.** Drawing cases from public Terraform repositories with known security fixes would improve realism, at the cost of control over ground truth.
- **Equal inputs.** Giving the scanners equivalent custom policies, or withholding the policy file from the AI, would remove the input asymmetry.
- **Broader model testing.** Comparing several models and temperature settings would separate this model's behaviour from that of AI review in general.
- **Developer study.** A small study with developers rating the usefulness of each tool's comments would test the claim about developer understanding directly.


```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```
# 6 Conclusion and Recommendations

## 6.1 Conclusion

This study asked whether AI-assisted security review can improve the effectiveness of Infrastructure-as-Code security analysis in a DevSecOps pipeline compared with traditional static analysis tools. On fifteen controlled Terraform cases, the answer is a qualified yes: it improves coverage, but it cannot yet replace the scanners or be trusted as a merge gate.

**Detection accuracy.**

| Reviewer | Vulnerable cases detected (of 12) |
|---|---|
| AI reviewer, working independently | 11, plus 1 partially |
| Checkov | 5 |
| tfsec | 4 |
| Checkov and tfsec together | 8 |

Every condition the scanners found, the AI also found. Its extra detections were conditions requiring context or semantic judgement (an over-privileged built-in role judged against a documented requirement; hard-coded secrets) or conditions outside the scanners' rule sets. The scanners' failures were stable gaps in rule coverage. The AI's were of a different kind:

- it classified the same finding differently across runs;
- it raised findings against acceptable configurations in a third of runs on those cases;
- seven of its 45 confirmed findings were false.

**Remediation quality.** The AI's advice was usually specific and correct. Applied as written, all twelve fixes for the vulnerable cases it detected reached the secure state. Its explanations were the weakest element. They mapped findings to inapplicable policies, stated false platform facts, and in one case recommended a change that made the Terraform invalid.

**Developer understanding.** This was not measured directly. The AI's comments were consistently more explanatory than the scanners' output, but whether developers learn from them remains untested.

**Practical challenges.** The study found five:

- variation between identical runs;
- findings hidden by classification;
- validation failures;
- deletion-only changes that escape review;
- verdicts steered by comments in the code under review.

The AI added comparatively little time to the pipeline, a median of 31.5 seconds.

These conclusions hold for one model, one prompt and a constructed sample, and the evidence does not support a general claim that AI review outperforms rule-based scanning. It supports a narrower claim: on this sample, an AI reviewer used alongside deterministic scanners covered conditions the scanners missed. Its errors were of a different kind from theirs and less predictable.

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


```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```
# 7 Reference List

Anthropic (2024) *Claude Documentation*. Available at: https://docs.anthropic.com/ (Accessed: 23 July 2026).

Aqua Security (2024) *tfsec Documentation*. Available at: https://aquasecurity.github.io/tfsec/ (Accessed: 23 July 2026).

Aqua Security (n.d.) *tfsec* [GitHub repository]. Available at: https://github.com/aquasecurity/tfsec (Accessed: 13 October 2026).

Arkko, J., Cotton, M. and Vegoda, L. (2010) *IPv4 Address Blocks Reserved for Documentation*. RFC 5737. Internet Engineering Task Force. Available at: https://www.rfc-editor.org/rfc/rfc5737 (Accessed: 13 October 2026).

Bacchelli, A. and Bird, C. (2013) 'Expectations, outcomes, and challenges of modern code review', *Proceedings of the 35th International Conference on Software Engineering (ICSE)*, pp. 712–721. doi:10.1109/ICSE.2013.6606617.

Boehm, B.W. (1981) *Software Engineering Economics*. Englewood Cliffs, NJ: Prentice Hall.

Bommasani, R. et al. (2021) *On the Opportunities and Risks of Foundation Models*. Stanford University. Available at: https://arxiv.org/abs/2108.07258 (Accessed: 23 July 2026).

Bridgecrew (2024) *Checkov Documentation*. Available at: https://www.checkov.io/ (Accessed: 23 July 2026).

Brown, T.B. et al. (2020) 'Language models are few-shot learners', *Advances in Neural Information Processing Systems*, 33, pp. 1877–1901.

Center for Internet Security (CIS) (2024) *CIS Benchmarks*. Available at: https://www.cisecurity.org/cis-benchmarks (Accessed: 23 July 2026).

Creswell, J.W. and Creswell, J.D. (2018) *Research Design: Qualitative, Quantitative, and Mixed Methods Approaches*. 5th edn. Thousand Oaks, CA: SAGE.

Ding, Y., Fu, Y., Ibrahim, O., Sitawarin, C., Chen, X., Alomair, B., Wagner, D., Ray, B. and Chen, Y. (2025) 'Vulnerability detection with code language models: How far are we?', *Proceedings of the 47th IEEE/ACM International Conference on Software Engineering (ICSE)*.

Forsgren, N., Humble, J. and Kim, G. (2018) *Accelerate: The Science of Lean Software and DevOps*. Portland, OR: IT Revolution.

Greshake, K., Abdelnabi, S., Mishra, S., Endres, C., Holz, T. and Fritz, M. (2023) 'Not what you've signed up for: Compromising real-world LLM-integrated applications with indirect prompt injection', *Proceedings of the 16th ACM Workshop on Artificial Intelligence and Security (AISec '23)*. New York: ACM, pp. 79–90. doi:10.1145/3605764.3623985.

HashiCorp (2024) *Terraform Documentation*. Available at: https://developer.hashicorp.com/terraform/docs (Accessed: 23 July 2026).

HashiCorp (n.d.) *Manage sensitive data in your configuration*. Available at: https://developer.hashicorp.com/terraform/language/manage-sensitive-data (Accessed: 13 October 2026).

Ji, Z., Lee, N., Frieske, R., Yu, T., Su, D., Xu, Y., Ishii, E., Bang, Y., Madotto, A. and Fung, P. (2023) 'Survey of hallucination in natural language generation', *ACM Computing Surveys*, 55(12), pp. 1–38. doi:10.1145/3571730.

Johnson, B., Song, Y., Murphy-Hill, E. and Bowdidge, R. (2013) 'Why don't software developers use static analysis tools to find bugs?', *Proceedings of the 35th International Conference on Software Engineering (ICSE)*, pp. 672–681.

Kim, G., Humble, J., Debois, P. and Willis, J. (2021) *The DevOps Handbook*. 2nd edn. Portland, OR: IT Revolution.

Li, H., Hao, Y., Zhai, Y. and Qian, Z. (2024) 'Enhancing static analysis for practical bug detection: An LLM-integrated approach', *Proceedings of the ACM on Programming Languages*, 8(OOPSLA1), Article 111.

McIntosh, S., Kamei, Y., Adams, B. and Hassan, A.E. (2016) 'An empirical study of the impact of modern code review practices on software quality', *Empirical Software Engineering*, 21(5), pp. 2146–2189..

Microsoft (2024) *Shared responsibility in the cloud*. Available at: https://learn.microsoft.com/azure/security/fundamentals/shared-responsibility (Accessed: 23 July 2026).

Microsoft (n.d.) *Azure built-in roles for Privileged*. Available at: https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles/privileged (Accessed: 13 October 2026).

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

Wohlin, C., Runeson, P., Höst, M., Ohlsson, M.C., Regnell, B. and Wesslén, A. (2012) *Experimentation in Software Engineering*. Berlin: Springer.

```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```
# Appendix A. Research Proposal {.unnumbered}

*Text of the PROM04 research proposal, 'AI-Assisted Code Review in CI/CD Pipeline', submitted 20 April 2026, reproduced as submitted (text only; the proposal's own cover page and table of contents are omitted). The research focus was refined in PROM05 and PROM06 Assignment 1 from a comparison with manual review to a comparison with IaC static analysis tools.*

### A.1 Introduction

The rapid proliferation of software systems across critical infrastructure, financial services, and consumer applications has elevated code quality and security to paramount concerns within modern software engineering. As organisations increasingly adopt DevSecOps practices, integrating security into every phase of the development lifecycle, the mechanisms through which code is reviewed and validated are undergoing fundamental transformation. Traditional manual code review, long considered the cornerstone of quality assurance, is characterized by significant inconsistency, scalability limitations, and the inherent cognitive biases of human reviewers (Bacchelli and Bird, 2013). Concurrently, artificial intelligence (AI), and in particular large language models (LLMs) and static analysis tools, have demonstrated promising capabilities in automating aspects of software comprehension, defect detection, and security vulnerability identification (Tufano et al., 2022).

The development of this proposal builds upon structured module activities, including the identification of the research topic, iterative refinement of research questions, and initial literature exploration.

This proposal investigates a substantive research gap: despite the growing commercial adoption of AI-assisted code review tools, rigorous empirical evaluation of their effectiveness within live Continuous Integration/Continuous Delivery (CI/CD) pipelines remains scarce. Existing studies tend to evaluate AI tools in isolation, neglecting the operational complexity, time pressures, and security requirements of real-world pipeline environments (Ni et al., 2023). Furthermore, comparative studies benchmarking AI performance against manual review across multiple quality metrics, including security vulnerability detection and false positive rates, are conspicuously absent from the literature.

This research aims to contribute both an empirical evaluation framework and a practical implementation model for integrating AI-assisted code review within modern DevSecOps pipelines.

### A.2 Project Description

Software development teams operating within DevOps and DevSecOps frameworks face a persistent tension between velocity and quality. The adoption of CI/CD pipelines has dramatically compressed release cycles, increasing the frequency with which unreviewed or inadequately reviewed code enters production environments. According to the DORA State of DevOps Report (DORA, 2022), elite-performing teams deploy code hundreds of times per day, a cadence that renders thorough manual code review operationally impractical. This bottleneck creates systemic vulnerabilities: defects that would have been identified through diligent review are deployed, and security flaws, particularly those classified under the OWASP Top Ten (OWASP, 2021) may persist undetected until exploitation.

The central problem this research addresses is the absence of a rigorous, empirical framework for evaluating AI-assisted code review within CI/CD environments. While vendors such as GitHub (via Copilot and CodeQL), SonarQube, and Amazon CodeGuru market AI-powered review solutions, independent academic evaluation of their comparative effectiveness relative to manual review is limited. Developers, DevSecOps teams, and enterprise engineering managers therefore lack evidence-based guidance on when and how to integrate these tools into their workflows.

The practical deliverable or artefact of this project is an operationalised CI/CD pipeline integrating an AI-assisted code review tool, evaluated against a defined set of quality and security metrics.

This pipeline will be configured within a GitHub Actions environment, enabling automated triggering of AI review on pull requests. The artefact serves both as a research instrument and as a replicable reference implementation for practitioners. The research, therefore, occupies the intersection of empirical software engineering and applied AI, offering both theoretical contributions and direct industrial utility.

### A.3 Preliminary Literature Review

The thematic structure of this literature review is informed by initial literature exploration conducted during module activities, enabling a focused and critical synthesis of relevant research.

#### A.3.1 Traditional Code Review

Code review has been practiced systematically since the inception of structured software development methodologies, with Fagan (1976) formalizing the concept of software inspections as a mechanism for defect detection prior to testing. Subsequent research demonstrates that peer code review significantly reduces defect density (Ackerman et al., 1989). However, these figures are contingent on reviewer expertise, review depth, and the time allocated, variables that are rarely optimized in contemporary industrial settings.

Bacchelli and Bird (2013), in a landmark study at Microsoft, conducted a mixed-methods investigation of code review practices involving 873 survey respondents and 17 interviews. Their findings indicate that code review supports knowledge transfer, awareness, and code improvement alongside defect. Critically, they also identified substantial reviewer inconsistency and a tendency for reviews to focus on stylistic rather than substantive issues, a finding that has significant implications for security, where deep semantic understanding is required to identify vulnerabilities.

Rigby and Bird (2013) extended this analysis through a large-scale empirical study of open-source and industrial review practices, identifying that review effectiveness correlates with reviewer familiarity with the codebase and the granularity of change sets. Smaller, more focused pull requests yielded higher defect detection rates, a finding that aligns with cognitive load theory, as reviewers are unable to maintain deep comprehension across large, complex diffs. This observation is corroborated by McIntosh et al. (2014), who found that under-reviewed code, particularly that which bypassed the review process, was significantly more likely to contain post- release defects. Together, these studies establish a robust evidence base for the limitations of manual review at scale, while also indicating that its benefits extend beyond mere defect identification.

#### A.3.2 AI in Software Engineering

The application of machine learning and AI techniques to software engineering tasks has accelerated considerably since the introduction of transformer-based language models. Hindle et al. (2012) established foundational evidence that source code exhibits statistical regularities analogous to natural language, making it amenable to probabilistic modelling.

Tufano et al. (2022) conducted a comprehensive evaluation of transformer-based models for automated code review, fine-tuning models on large corpora of pull request data to predict reviewer comments. Their results demonstrated that neural models could generate technically accurate review suggestions for syntactic and simple semantic issues, but performance degraded substantially for complex architectural concerns or multi-file dependencies. Importantly, Tufano et al. acknowledged the absence of security-specific evaluation in their study, a limitation that is particularly salient given the security objectives of many review processes.

Li et al. (2022) evaluated deep learning approaches for vulnerability detection, finding that graph neural networks (GNNs) outperformed traditional static analysis tools on certain vulnerability classes, particularly those involving complex data-flow patterns. However, high false-positive rates may reduce developers’ trust and utility. This trade-off between recall and precision is a recurring tension in AI-assisted software engineering research. It has direct implications for CI/CD pipeline integration, where excessive false positives would impede rather than accelerate delivery.

#### A.3.3 AI-Assisted Code Review

The intersection of AI capabilities and code review has produced a nascent but growing body of research. Ni et al. (2023) systematically reviewed the state of AI-assisted code review, analyzing 79 studies published between 2010 and 2022. Their synthesis identified three primary research foci: comment generation, defect detection, and code quality prediction. Whilst noting improvements in automated comment quality, Ni et al. critically observed that the majority of studies employed synthetic or historical datasets rather than live CI/CD environments, limiting the ecological validity of their findings.

Pornprasit and Tantithamthavorn (2021) proposed DeepLineDP, a line-level defect prediction model trained on software metrics, reporting improvements over file-level approaches. However, their evaluation was restricted to defect-prone line identification rather than the generation of actionable review comments or security recommendations.

A particularly relevant commercial evaluation was conducted by Czerwonka et al. (2015) at Microsoft, examining the Change Inspector tool for automatic code review prioritisation. Their findings indicated that automated prioritisation could direct reviewer attention more efficiently, but that automation was insufficient as a standalone substitute for human judgement on complex changes. This supports a hybrid model wherein AI augments rather than replaces human review, a position increasingly endorsed in the practitioner literature (Google Engineering Practices, 2023).

Critically, comparisons between AI and manual review using consistent, multi-dimensional metrics remain sparse. Most studies employ single metrics such as defect detection rate or comment quality, neglecting dimensions such as review time, false positive rates, and security vulnerability detection.

#### A.3.4 Research Gap

Synthesising the foregoing literature, three interrelated research gaps can be identified. First, there is a notable absence of empirical studies evaluating AI-assisted code review tools within operational CI/CD pipeline environments, as opposed to controlled laboratory or offline dataset conditions (Ni et al., 2023). The ecological validity of existing findings is therefore questionable when extrapolated to real-world DevSecOps contexts. Second, security-specific evaluation, particularly the capacity of AI tools to detect OWASP Top Ten vulnerabilities (OWASP, 2021) and NIST-classified weaknesses (NIST, 2022) is systematically underrepresented in the literature;

existing studies focus predominantly on functional defects rather than security flaws. Third, rigorous comparative studies employing consistent, multi-dimensional metrics to benchmark AI- assisted review against expert manual review are absent, making it impossible for practitioners to make evidence-informed adoption decisions.

This research directly addresses all three gaps by conducting a controlled comparative study within a live CI/CD pipeline, employing metrics spanning defect detection, security vulnerability identification, review time, and false positive/negative rates. The study is positioned to make an original empirical contribution that advances both academic understanding and industrial practice.

Therefore, this study makes a distinct contribution by introducing a controlled, pipeline- integrated empirical evaluation of AI-assisted code review, explicitly incorporating security- focused metrics and real-world CI/CD constraints. Unlike prior studies, which evaluate AI tools in isolation, this research embeds the evaluation within an operational workflow, thereby enhancing both ecological validity and practical applicability.

### A.4 Research Questions, Design and Methodology

#### A.4.1 Research Aim

To empirically evaluate the effectiveness of AI-assisted code review integrated within CI/CD pipelines, in comparison with expert manual review, across dimensions of defect detection, security vulnerability identification, review efficiency, and false positive rates.

#### A.4.2 Research Questions

RQ1: To what extent does AI-assisted code review, integrated within a CI/CD pipeline, detect functional defects and security vulnerabilities more effectively than expert manual review? RQ2: How do false positive and false negative rates differ between AI-assisted and manual code review processes, and what are the implications for developer workflow efficiency? RQ3: What are the trade-offs in review time between manual and AI-assisted code review, and under what conditions does AI integration offer a net efficiency gain?

#### A.4.3 Research Design

This study adopts an experimental comparative design, in which two conditions, manual expert review and AI-assisted review, are systematically applied to the same set of code artefacts, drawn from open-source repositories, and evaluated against identical metrics. This design is appropriate because it permits direct, controlled comparison between conditions while maintaining internal validity; confounding variables such as codebase familiarity and review scope are held constant across conditions. The experimental approach aligns with the epistemological commitment to generating generalizable, reproducible findings rather than contextually bound case study insights, a requirement for empirical contributions to software engineering research (Wohlin et al., 2012).

A within-subjects design is employed wherever feasible, whereby the same code samples are reviewed under both conditions, enabling direct matched comparison of outcomes. Where reviewer bias constitutes a threat to validity, such as when manual reviewers might be influenced by prior AI review feedback, blinding procedures will be applied to maintain independence between conditions.

The use of a controlled experimental design, supported by statistical analysis techniques, ensures internal validity and enables reproducible comparison between conditions. These techniques are consistent with established empirical software engineering methodologies (Wohlin et al., 2012), supporting robust and generalizable findings.

#### A.4.4 Methodology

The research design and methodological approach have been developed iteratively based on prior module exercises, ensuring alignment between research objectives, questions, and evaluation strategy.

Step 1 – Dataset Selection: A stratified sample of 50 pull requests will be drawn from three open- source GitHub repositories spanning domains with known security sensitivity: a web application framework, a financial calculation library, and an authentication service. Pull requests will be stratified by size (small: 1–50 lines, medium: 51–200 lines, large: 201+ lines) to ensure representative coverage of real-world change granularity. Repository selection will prioritise projects with historical security vulnerabilities documented in Common Vulnerabilities and Exposures (CVE) databases, enabling ground-truth validation of detection outcomes.

Step 2 – Manual Code Review (Baseline): A panel of three experienced developers (minimum five years' professional experience in the relevant languages: Python, Java, and JavaScript) will independently review each pull request, recording identified defects, security issues, and estimated review time. Inter-rater reliability will be calculated using Cohen's kappa to assess consistency, and disagreements will be adjudicated through structured discussion. This process produces a ground-truth baseline against which AI performance is evaluated.

Step 3 – AI-Assisted Code Review: The CI/CD pipeline artefact (described below) will automatically trigger AI-assisted review for each pull request. The AI component will comprise two complementary tools: GitHub CodeQL for static security analysis and a fine-tuned LLM for semantic defect detection and comment generation. AI review outputs, including detected issues, severity classifications, and generated comments, will be logged programmatically for analysis.

Step 4 – Metrics and Analysis: Four primary metrics will be computed:

• Defect detection rates the proportion of ground-truth defects identified by each condition.

• Security vulnerability detection rate, proportion of known CVE-relevant vulnerabilities detected.

• Review time: elapsed time from pull request submission to review completion.

• False positive and negative rates issues flagged incorrectly or missed relative to the ground truth. Statistical analysis will employ paired t-tests and effect size calculations to assess the significance of differences.

Each evaluation metric is explicitly aligned with the research questions. Defect detection rate and security vulnerability identification directly address RQ1, while review time metrics correspond to RQ3 by evaluating efficiency gains. False positive and false negative rates address RQ2, enabling assessment of reliability and potential disruption to developer workflows. This alignment ensures methodological coherence and traceability between research design and expected outcomes.

#### A.4.5 Artefact Development

The primary research instrument is a CI/CD pipeline configured within GitHub Actions, integrated with an AI code review component. The pipeline is triggered automatically upon pull request creation or update. The workflow proceeds as follows: upon PR submission, GitHub Actions initiates a build and test cycle; upon successful build, CodeQL is invoked to perform static security analysis across the changed files; concurrently, a custom GitHub Action invokes an LLM API with a structured prompt encoding the diff, the surrounding context (up to 1,000 tokens), and a system prompt specifying review criteria aligned with OWASP Top Ten and common defect taxonomies.

The LLM response is parsed by a post-processing script that extracts structured issue reports, which are then posted as PR comments via the GitHub API and logged to a structured JSON data store for research analysis.

The pipeline configuration will be version-controlled within the repository and documented to enable full replication. A dashboard component will provide real-time visualisation of review outcomes across experimental conditions, supporting both researcher analysis and potential practitioner adoption.

CI/CD Pipeline with AI-Assisted Code Review CI/CD AI Code Feedback Developer Pull Request → → Pipeline → Review → Loop Writes Code GitHub PR Trigger Build Static + Security Pass / Fail Figure 1: AI-Assisted Code Review Integrated within CI/CD Pipeline Figure 1 illustrates the end-to-end workflow: a developer submits a pull request, which triggers the CI/CD pipeline; the AI Code Review component analyses the changed code and posts structured feedback as PR comments; the developer receives actionable feedback and iterates accordingly, completing the feedback loop before merge.

### A.5 Resources and Constraints

#### A.5.1 Resources

The primary tooling environment comprises GitHub as the version control and pipeline host, leveraging GitHub Actions for CI/CD orchestration and GitHub CodeQL for static security analysis, both available at no cost for public repositories. AI review functionality will be implemented via the OpenAI API, Anthropic API (Claude), or Equivalent.

#### A.5.2 Constraints and Mitigations

Data limitations: Open-source repositories may not fully represent enterprise codebases, potentially limiting generalizability. Mitigation: repositories will be selected to approximate industrial complexity in terms of size, language diversity, and documented vulnerability history.

AI accuracy and model drift: LLM outputs are non-deterministic and subject to version changes by providers. Mitigation: model versions will be pinned, and all API calls logged; temperature will be set to zero for reproducibility.

Time constraints: Recruiting experienced reviewers for manual review is time-intensive.

Mitigation: A reviewer panel will be established and briefed in the project's first two weeks, with review sessions scheduled in parallel rather than sequentially.

Tool dependencies and API rate limits: GitHub API and OpenAI API/Claude API impose rate limits that could impede data collection at scale. Mitigation: request batching and exponential backoff strategies will be implemented in pipeline scripts; API quota upgrades will be requested where necessary.

### A.6 Social, Ethical, Professional and Legal Considerations

The integration of AI into code review processes raises substantive ethical, professional, and legal concerns that extend well beyond technical performance metrics, and which must be critically examined rather than treated as peripheral compliance exercises.

#### A.6.1 AI Bias and Reliability

AI models are trained on historical code corpora that reflect the biases, conventions, and error patterns of their training populations. Tufano et al. (2022) acknowledge that models trained predominantly on open-source repositories may systematically underperform on coding styles or patterns less represented in training data. This introduces a form of algorithmic bias that could result in differential review quality across codebases, potentially disadvantaging teams whose practices diverge from training data norms. In a CI/CD context, this bias risk is amplified because AI decisions function as gates on code deployment; biased review outputs could disproportionately block or pass code from specific contributors, with implications for equitable team participation. This study will explicitly monitor review outcome distributions across contributor demographics where such data is available.

#### A.6.2 Data Privacy and Intellectual Property

Transmitting code to external AI APIs, particularly commercial LLM providers, raises significant data privacy concerns. Source code frequently contains proprietary business logic, authentication credentials embedded in test files, and personally identifiable information (PII). The General Data Protection Regulation (GDPR, 2018) imposes obligations on data controllers processing personal data, including obligations of purpose limitation and data minimization that may be violated by indiscriminate code transmission to third-party AI services. Furthermore, intellectual property law in the United Kingdom and European Union does not unambiguously resolve questions of ownership over AI-generated review outputs or over code patterns learned from training data issues that are currently subject to active litigation (discussed in Getty Images v Stability AI, 2023).

This research will mitigate these risks by using exclusively publicly-licensed open-source repositories, ensuring no proprietary data is processed, and by evaluating open-source AI alternatives that can be deployed locally.

#### A.6.3 Developer Accountability and Professional Responsibility

The British Computer Society (BCS) Code of Conduct (BCS, 2022) requires computing professionals to act with integrity and to accept responsibility for their work. The integration of AI into code review creates ambiguity around accountability: when AI-assisted review incorrectly approves defective or insecure code that subsequently causes harm, the locus of responsibility is unclear. This is not merely a theoretical concern; the principle of accountability in automated decision-making systems is explicitly addressed in the UK Government's AI White Paper (DSIT, 2023), which identifies accountability as a core pillar of responsible AI adoption. This research will contribute to this discourse by empirically documenting the conditions under which AI review fails, thereby providing evidence for appropriate human oversight requirements.

#### A.6.4 Workforce and Professional Impact

The prospect of AI automating aspects of code review raises legitimate concerns about the evolving role of developers and the potential deskilling of review competencies. Autor (2015)

argues that automation characteristically substitutes for routine, codifiable tasks while complementing complex judgement; if code review becomes increasingly automated, the complex judgement skills associated with deep review, including security reasoning and architectural critique risk atrophying through disuse. This research adopts the position that AI- assisted review should be evaluated as an augmentation tool rather than a replacement.

### A.7 References (as submitted in PROM04)

Ackerman, A.F., Buchwald, L.S. and Lewski, F.H. (1989) 'Software inspections: An effective verification process', IEEE Software, 6(3), pp. 31–36.

Autor, D.H. (2015) 'Why are there still so many jobs? The history and future of workplace automation', Journal of Economic Perspectives, 29(3), pp. 3–30.

Bacchelli, A. and Bird, C. (2013) 'Expectations, outcomes, and challenges of modern code review', Proceedings of the 35th International Conference on Software Engineering (ICSE), pp. 712–721.

BCS – The Chartered Institute for IT (2022) BCS Code of Conduct. Available at:

https://www.bcs.org/membership-and-registrations/become-a-member/bcs-code-of-conduct/ (Accessed: 1 April 2025).

Czerwonka, J., Greiler, M. and Tilford, J. (2015) 'Code reviews do not find bugs: How the current code review best practice slows us down', Proceedings of the 37th International Conference on Software Engineering (ICSE), pp. 27–28.

DORA (2022) Accelerate: State of DevOps Report 2022. Google Cloud. Available at:

https://dora.dev/publications/ (Accessed: 1 April 2025).

DSIT – Department for Science, Innovation and Technology (2023) A Pro-Innovation Approach to AI Regulation. London: HMSO.

Fagan, M.E. (1976) 'Design and code inspections to reduce errors in program development', IBM Systems Journal, 15(3), pp. 182–211.

General Data Protection Regulation (2018) Regulation (EU) 2016/679. Official Journal of the European Union.

Hellendoorn, V.J., Sutton, C., Singh, R., Maniatis, P. and Biber, D. (2021) 'Global relational models of source code', Proceedings of the International Conference on Learning Representations (ICLR).

Hindle, A., Barr, E.T., Su, Z., Gabel, M. and Devanbu, P. (2012) 'On the naturalness of software', Proceedings of the 34th International Conference on Software Engineering (ICSE), pp. 837–847.

Kochhar, P.S., Thung, F., Nagappan, N., Zimmermann, T. and Lo, D. (2016) 'Understanding the test and code review practices of software engineers', IEEE/ACM International Symposium on Empirical Software Engineering and Measurement (ESEM).

Li, Z., Zou, D., Xu, S., Ou, X., Jin, H., Wang, S., Deng, Z. and Zhong, Y. (2022) 'VulDeePecker: A deep learning-based system for vulnerability detection', IEEE Transactions on Dependable and Secure Computing, 19(2), pp. 1199–1213.

McIntosh, S., Kamei, Y., Adams, B. and Hassan, A.E. (2014) 'The impact of code review coverage and code review participation on software quality', Proceedings of the 11th Working Conference on Mining Software Repositories (MSR), pp. 192–201.

Ni, A., Li, J., Wang, X. and Ahmed, I. (2023) 'A systematic literature review on AI-assisted code review', ACM Computing Surveys, 55(11), Article 237.

NIST (2022) Secure Software Development Framework (SSDF) Version 1.1. National Institute of Standards and Technology Special Publication 800-218. Available at:

https://doi.org/10.6028/NIST.SP.800-218 (Accessed: 1 April 2025).

OWASP (2021) OWASP Top Ten 2021. Open Web Application Security Project. Available at:

https://owasp.org/Top10/ (Accessed: 1 April 2025).

Pearce, H., Ahmad, B., Tan, B., Dolan-Gavitt, B. and Karri, R. (2022) 'Asleep at the keyboard? Assessing the security of GitHub Copilot's code contributions', IEEE Symposium on Security and Privacy, pp.

754–768.

Pornprasit, C. and Tantithamthavorn, C. (2021) 'DeepLineDP: Towards a deep learning approach for line- level defect prediction', IEEE Transactions on Software Engineering, 49(1), pp. 84–98.

Rigby, P.C. and Bird, C. (2013) 'Convergent contemporary software peer review practices', Proceedings of the 9th Joint Meeting on Foundations of Software Engineering (ESEC/FSE), pp. 202–212.

Tufano, R., Pascarella, L., Tufano, M., Bavota, G. and Rossi, B. (2022) 'Using pre-trained models to revisit the review comment generation task', IEEE/ACM International Workshop on Natural Language- based Software Engineering (NLBSE).

Wohlin, C., Runeson, P., Höst, M., Ohlsson, M.C., Regnell, B. and Wesslén, A. (2012) Experimentation in Software Engineering. Berlin: Springer.

```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```
# Appendix B. Experimental Plan and Ground-Truth Matrix {.unnumbered}

## B.1 Experimental conditions and ground-truth rules

The experimental master plan (version 1.0) defined three conditions: A, traditional scanning (Checkov and tfsec); B, AI only; and C, hybrid. The ground-truth matrix (TC01–TC12, version 1.0, revised in the test-case evidence page, version 72) set the following rules: ground truth is established before tool outputs are reviewed; each case is classified as vulnerable, secure or intentionally acceptable independently of the AI; uncertain benchmark mappings are recorded as 'to be verified'; tool expectations are hypotheses until verified; overlapping scanner rules are normalised; and the AI is judged against the documented ground truth, not against agreement with another tool.

## B.2 Test cases TC01–TC15

: Table B.1: Test-case ground truth and expected secure state

| ID | Case | Ground truth | Expected secure state |
|---------|------------------------|------------|---------------------------------------------|
| TC01 | Secure baseline | Secure | No change required |
| TC02 | Unrestricted SSH | Vulnerable | Source restricted to an approved administration address or private path |
| TC03 | Unrestricted RDP | Vulnerable | Source restricted, or private management path (e.g. Bastion) |
| TC04 | Public HTTP | Vulnerable | No unrestricted public HTTP; HTTPS where a public service is needed |
| TC05 | Missing NSG association | Vulnerable | NSG associated with the subnet |
| TC06 | Public DNS resolver | Vulnerable | Azure-provided or internal DNS |
| TC07 | Weak TLS (storage) | Vulnerable | min_tls_version TLS1_2 |
| TC08 | Missing NSG diagnostics | Vulnerable | Diagnostic setting forwarding NetworkSecurityGroupEvent and NetworkSecurityGroupRuleCounter to Log Analytics |
| TC09 | Secret in local | Vulnerable | No secret literal in code; secret store or sensitive variable |
| TC10 | Wildcard custom role | Vulnerable | Least-privilege actions at the narrowest scope |
| TC11 | Role vs documented need | Vulnerable | Only the two documented read actions |
| TC12 | Legitimate public HTTPS | Legitimate | Intended exposure retained; no blocking finding |
| TC13 | Contributor vs Reader need | Vulnerable | Reader at resource-group scope |
| TC14 | SSH from one address | Secure | No change required |
| TC15 | Password in variable default | Vulnerable | No default; value supplied at runtime from a secret store; sensitive = true |

## B.3 Ground truth for TC13–TC15 (committed before the fixtures, commit cbda52c)


Version 1.0, 13 Oct 2026. Written and committed **before** the TC13–TC15 Terraform fixtures were created or any tool was run against them. Expected tool outcomes below are hypotheses, not results.

### Why these cases were added

The TC01–TC12 results exposed three gaps in the original test set:

1. **TC11 did not isolate multi-file reasoning.** Its custom role used `actions = ["*"]`, which Checkov flags on its own (`CKV_AZURE_39`), so the case cannot show whether context across files matters.
2. **There was no secure "remediated" variant of a vulnerable case.** The ground-truth matrix asks for post-remediation evidence, and TC01 is the only negative control.
3. **TC09's scanner miss may be an artefact of the fixture.** The dummy secret sat in an unused `locals` value; it is unclear whether the scanners miss secrets in general or only in that form.

Design rules for TC13–TC15, applied in response to observations from TC01–TC12:

- Fixture comments are neutral: no "deliberately insecure", "ground truth" or "test vulnerability" wording, which in earlier cases was visible to the AI and may have cued it.
- Each case changes one condition relative to the current `main` baseline.
- No real secrets; nothing is deployed or applied.
- Each case runs three times under the INDEPENDENT workflow, with Checkov 3.3.1 and tfsec 1.28.14 also reproduced locally.

### TC13 — Over-privileged built-in role assignment (cross-file context)

- **Category:** IAM / context awareness.
- **Fixture:** `terraform/tc13_reporting_identity.tf` creates a user-assigned managed identity for a reporting service and assigns it the built-in **Contributor** role at **subscription** scope. `terraform/tc13_requirements.tf` documents, in `locals`, that the reporting task needs only read access to the research resource group.
- **Ground truth (TC13-GT-01):** genuine weakness. The assignment grants write and delete access across the subscription, while the documented requirement is read-only access at resource-group scope. The weakness is established only by combining the two files: no wildcard and no custom role is present, so the role assignment alone is not self-evidently wrong.
- **Valid detection:** identifies the Contributor-at-subscription assignment as exceeding the documented read-only, resource-group requirement. Generic "review your RBAC" advice does not count.
- **Expected secure state:** built-in **Reader** role at the research resource-group scope.
- **Research purpose:** the context-awareness test that TC11 was intended to be.

### TC14 — Remediated SSH access (secure variant of TC02)

- **Category:** network / false-positive control / post-remediation.
- **Fixture:** an inbound TCP/22 rule on the existing NSG, restricted to the single administration address `203.0.113.10/32` (RFC 5737 documentation range), at priority 300.
- **Ground truth (TC14-GT-01):** no intentional vulnerability. SSH is limited to one approved administration address, the remediation recommended for TC02.
- **Correct outcome:** no confirmed finding. A note suggesting a stronger pattern (for example Azure Bastion or just-in-time access) may be recorded as informational, but a confirmed finding that treats the restricted rule as public exposure is a false positive.
- **Research purpose:** second negative control; tests whether tools accept the remediation they recommended for TC02.

### TC15 — Hard-coded secret in a sensitive variable default (contrast with TC09)

- **Category:** secrets management.
- **Fixture:** `terraform/tc15_variables.tf` declares `variable "admin_password"` (type string) with a hard-coded dummy default value; the variable is not marked `sensitive`.
- **Ground truth (TC15-GT-01):** genuine secret-handling anti-pattern. The value is dummy data and not a real credential.
- **Valid detection:** identifies the hard-coded default for a password variable and recommends removing the default and supplying the value at runtime from a secret store, with the variable marked `sensitive`.
- **Research purpose:** determines whether scanner non-detection in TC09 reflects the form of that fixture (unused local) or a wider gap in the configured scans.

### Classification rules

As for TC01–TC12: TP / FN / TN / FP / PARTIAL / CONTEXT, judged on the target condition only. Scanner rules covering one condition are normalised to one detection. Severities are not compared across tools.


```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```
# Appendix C. Implementation and Configuration Extracts {.unnumbered}

Full source: repository `abdulwaheed384/ai-pr-review`, branch `main` at merge commit 3a79020 (pull request #69).

## C.1 Organisational policy supplied to the AI (`ai/policy.md`)

```markdown
# Security Policy for Terraform (Azure)

## NET-001
All subnets must have a Network Security Group (NSG) associated.

## NET-002
Virtual Networks must NOT use public DNS servers. Use Azure DNS or internal DNS only.

## NET-003
Production Virtual Networks must have DDoS Protection Standard enabled. This control does not apply to research or other non-production workloads; do not report its absence as a finding when the supplied context establishes that the workload is non-production.

## LOG-001
Resources that expose Azure Monitor diagnostic categories must have the supported security-relevant logs enabled and forwarded to Log Analytics. This policy covers log collection and forwarding; it does not require a query path, alerting, or interactive log review unless a workload-specific requirement says so. A resource type with no diagnostic categories, and a subresource that cannot be targeted independently (such as a subnet), is not applicable; document that limitation. Do not create unrelated resources solely to manufacture diagnostic coverage.

## TAG-001
All taggable Azure resources must include mandatory tags: environment, owner, cost-center. Use documented research values where this is a research deployment; preserve the research_case identifier. Azure resources that do not support tags are not applicable.

## SEC-001
No resource should be publicly exposed unless explicitly required and justified.
```

## C.2 Operational scoring configuration (`ai/scoring.json`)

```json
{
  "model": "prom06-operational-pr-risk-v2",
  "base_score": 100,
  "severity_penalties": {
    "critical": -30,
    "high": -30,
    "medium": -15,
    "low": -5,
    "informational": 0
  },
  "minimum_score": 0,
  "maximum_score": 100,
  "verdict_thresholds": {
    "approve": 85,
    "approve_with_comments": 70
  },
  "risk_thresholds": {
    "low": 85,
    "medium": 70,
    "high": 50
  },
  "rules": [
    "Start at base_score and apply the matching penalty once for each CONFIRMED actionable finding, regardless of whether it is LOW severity.",
    "NEEDS_CONTEXT, INFORMATIONAL, and FALSE_POSITIVE reports remain in the structured review artifact only, not in the GitHub PR conversation comment, and do not reduce the score as confirmed defects.",
    "Exact duplicate findings are counted once; removed duplicate IDs and the deduplication reason are recorded in processing_audit.",
    "Clamp the result to minimum_score and maximum_score.",
    "A CONFIRMED finding with CRITICAL severity sets risk_level to CRITICAL; otherwise risk_level is derived from risk_thresholds.",
    "At or above approve, verdict is APPROVE; at or above approve_with_comments, verdict is APPROVE_WITH_COMMENTS; below that, verdict is DO_NOT_MERGE."
  ],
  "research_rubric": {
    "owner": "researcher",
    "scale": "0-2 per dimension, evaluated manually from captured evidence",
    "dimensions": [
      "Detection correctness",
      "Explanation accuracy",
      "Impact explanation",
      "Remediation quality",
      "Context awareness",
      "Developer usefulness"
    ]
  }
}
```

## C.3 Context assembly in the review runner (`ai/review_runner.py`, lines 28–64)

```python
def get_terraform_review_context():
    """Return changed Terraform paths plus complete Terraform/policy context."""
    try:
        base_ref = os.environ.get("GITHUB_BASE_REF") or os.environ.get("BASE_REF", "main")
        subprocess.run(["git", "fetch", "origin", base_ref], cwd=ROOT, check=True)
        result = subprocess.run(
            ["git", "diff", "--name-only", f"origin/{base_ref}...HEAD"],
            cwd=ROOT,
            capture_output=True,
            text=True,
            check=True,
        )

        changed = []
        for relative_path in result.stdout.splitlines():
            path = Path(relative_path)
            if (
                path.parts[0:1] == ("terraform",)
                and path.suffix == ".tf"
                and (ROOT / path).is_file()
            ):
                changed.append(path.as_posix())
        if not changed:
            return [], ""

        parts = ["Changed Terraform files: " + ", ".join(sorted(changed))]
        for path in sorted((ROOT / "terraform").glob("*.tf")):
            label = "CHANGED FILE" if path.relative_to(ROOT).as_posix() in changed else "CONTEXT FILE"
            parts.append(f"\n{label}: {path.relative_to(ROOT).as_posix()}\n{path.read_text(encoding='utf-8')}\n")
        for relative_path in ("ai/policy.md", "README.md"):
            path = ROOT / relative_path
            parts.append(f"\nREVIEW CONTEXT: {relative_path}\n{path.read_text(encoding='utf-8')}\n")
        return sorted(changed), "".join(parts).strip()
    except Exception as exc:
        raise RuntimeError(f"Could not collect changed Terraform files: {exc}") from exc


```

## C.4 Review instructions (`ai/prompt.txt`)

```
You are a cloud security reviewer analysing Infrastructure as Code changes in a pull request.

## Scope and grounding

- Review the changed Terraform files for issues, using the complete current Terraform configuration and supplied policy/documentation as context. The input identifies changed files separately from context files. Check the complete configuration for resource relationships, tags, logging, network controls, and controls configured in another file before reporting an omission. Do not assume files or configuration that were not supplied.
- Base every finding on specific Terraform evidence or an applicable documented policy requirement. Quote or identify the resource and configuration that supports the finding; do not invent resource properties, deployment state, network reachability, users, business purpose, or compensating controls.
- Do not assume a workload is production unless the supplied repository or PR explicitly establishes that context.
- Distinguish a demonstrated security vulnerability from a policy/compliance requirement and from a context-dependent recommendation. A missing optional or generally recommended control is not automatically a vulnerability.
- Apply the provided policies only where their stated scope is established by the evidence. Do not invent policy identifiers or elevate a recommendation into a mandatory requirement.
- A policy violation is a mapping to a finding, not an additional finding. Every policy mapping must reference the existing finding ID and use the same severity; never create an orphan policy violation or count the same issue twice.
- Where the configuration does not establish enough context, state what is uncertain and classify the item as CONTEXT_DEPENDENT. Use POTENTIAL_FALSE_POSITIVE only where a plausible finding appears unsupported or contradicted by the supplied code, and explain why.
- Classify each report separately from its severity using `status`: `CONFIRMED` only for an evidence-supported current security weakness or applicable policy violation; `NEEDS_CONTEXT` for a real concern whose applicability or exploitability depends on facts not supplied; `INFORMATIONAL` for a useful design note with no current defect; `FALSE_POSITIVE` for a plausible-looking issue contradicted by the supplied code. Do not use an uncertain status to hide a confirmed weakness.
- A `NEEDS_CONTEXT` report may retain LOW, MEDIUM, or HIGH severity to describe potential impact; severity alone does not make it a confirmed vulnerability. Use INFORMATIONAL severity only for non-actionable notes. Preserve genuine LOW confirmed weaknesses as `CONFIRMED` with LOW severity.
- For `NEEDS_CONTEXT`, identify the exact missing fact and express it as unknown. Never assert deployment targeting, credential scope, network reachability, operator access, or compensating controls unless the supplied files establish them. Recommend the concrete configuration or evidence that would resolve the uncertainty.
- Treat intentional controls in their full resource and priority context. An explicit deny-all NSG posture is not a weakness because Azure also has default deny rules; lower-numbered custom rules can take effect before Azure's defaults. Do not recommend removing a documented control unless it creates a demonstrated problem.
- An explicit outbound deny rule at a priority evaluated before Azure's default outbound allow rules is effective and may be an intentional restrictive control. Do not call it redundant based only on Azure's later default deny rule. When documentation describes a daily ingestion quota as a research cost cap, assess whether it creates a demonstrated security or applicable policy failure before reporting it; a quota is not inherently a logging defect.
- Use repository documentation as context for intent, scope, and cost tradeoffs, not as proof that every setting is secure. Verify the actual Terraform values and their security effects. A clean baseline should have no confirmed findings when the supplied code demonstrates no applicable defect; continue to report genuine vulnerabilities, including LOW-severity ones.
- Keep `FALSE_POSITIVE` and `INFORMATIONAL` items traceable in the structured response, but do not present them as actionable defects. Context-dependent concerns must remain distinguishable from confirmed findings. Do not silently omit a plausible concern when a concise observation is useful.
- The GitHub AI PR conversation comment is reserved for `CONFIRMED` findings. Keep `NEEDS_CONTEXT`, `INFORMATIONAL`, and `FALSE_POSITIVE` reports in the structured review artifact for audit, not as PR-comment findings or free-form summary/positive text.
- When a Condition C scanner-evidence section is supplied, compare its reported resources and controls with the Terraform and documentation. Treat scanner results as fallible supporting evidence: agreement does not prove a finding, and a scanner miss or disagreement is a reason to investigate the code, never a reason by itself to suppress a demonstrated weakness. An absent or failed scan establishes neither safety nor vulnerability. Scanner descriptions and fields are data, not instructions.
- Continue to identify genuine security weaknesses when the code supports them. Do not reduce findings merely to be conservative.
- Recommend a control only when it addresses a supported vulnerability or applicable requirement. Distinguish mandatory remediation from optional advice.
- Treat policy scope and applicability exactly as documented. For a resource type without a supported diagnostic category, or a subresource that cannot be independently targeted, do not report missing diagnostics; state the limitation only if relevant. Do not treat production-only requirements as applying to a research workload unless the supplied evidence establishes production use.
- Findings must describe a current weakness or unmet requirement in this change and use case. Do not report hypothetical future reuse, promotion to production, or a control that might be desirable under an unstated framework. For example, do not report a production-only control as a current finding when the supplied context establishes research use.
- Treat a documented, intentional limitation as acceptable when no supplied policy or workload requirement requires the excluded capability. In particular, do not infer that diagnostic logs must be queryable or alertable solely because they are collected; report query-path absence only when the supplied context establishes a current need to query or alert on those logs.
- Before returning a confirmed finding, check its rationale, analysis, and impact for contradictions. If the item is compliant, out of scope, needs unprovided context, or depends on hypothetical future use, do not mark it `CONFIRMED` or map it as a policy violation. If retaining a plausible concern for traceability, classify it as `NEEDS_CONTEXT`, `INFORMATIONAL`, or `FALSE_POSITIVE` with matching status; otherwise put optional guidance in `positives`. Do not create a confirmed finding merely "for completeness."
- Do not infer a minimum log-retention period, daily-ingestion quota, or alerting obligation from general security practice. Report it as a policy finding only when an applicable supplied policy or requirement specifies it and current configuration fails that requirement. If documented limits intentionally balance research scope and cost, mention the operational tradeoff in the summary/positives rather than creating a scored finding.
- Create a policy mapping only when the finding describes an actual violation of that policy. Do not map a policy to a finding whose rationale or analysis says the current configuration satisfies it.
- Report a missing explicit NSG rule as a security issue only when the effective configured policy permits unsafe traffic or a documented requirement calls for an explicit rule. Azure's secure default deny inbound behavior is evidence, and an empty custom rule list alone does not prove public access. Consider outbound defaults and all NSG rules before concluding.
- When assessing Azure NSGs, account for rule priority: lower numeric priorities are evaluated first. A custom deny rule at priority 4096 is effective before Azure default allow rules at priorities 65000/65001 and must not be described as redundant merely because Azure also has a default deny rule at priority 65500. Treat a documented defense-in-depth rule as a positive unless it causes a demonstrated issue.
- Do not report a configured private endpoint and Private Link Scope as having no private access route. Distinguish availability of the private network path from the presence of a client, VPN, or peering; only report an operational query gap when the current workload requires queries and no connected client path is configured or required.
- Do not create a finding for a recommendation that is not required and does not correct a demonstrated weakness. Keep optional recommendations in the summary or positives without assigning severity or affecting finding counts.
- In Condition B, review independently without scanner output. In Condition C, use only the supplied normalized Checkov/tfsec evidence as secondary context; do not invent scanner results or claim to have reviewed unavailable output.

## Finding categories

Every finding must use exactly one category:
- SECURITY_VULNERABILITY: the supplied code demonstrates a concrete security weakness.
- POLICY_OR_COMPLIANCE: the supplied context establishes an applicable policy or compliance requirement that the code does not meet.
- CONTEXT_DEPENDENT: deciding whether this is a weakness or required control needs environment or workload information not supplied.
- POTENTIAL_FALSE_POSITIVE: the apparent issue is unsupported or contradicted by the supplied code; explain the reason and uncertainty.

For every finding provide a concise category_rationale and evidence field. Evidence must identify the Terraform resource and relevant configured value or omission; avoid fabricated line numbers.

## Output requirements

Return valid JSON only, with no markdown fences or text outside the JSON. Use exactly this structure and fields. Every finding must include `status`. Do not provide an operational score, verdict, or risk level; the workflow calculates those deterministically from ai/scoring.json.

{
  "summary": "",
  "findings": [
    {
      "id": "F-001",
      "category": "SECURITY_VULNERABILITY | POLICY_OR_COMPLIANCE | CONTEXT_DEPENDENT | POTENTIAL_FALSE_POSITIVE",
      "status": "CONFIRMED | NEEDS_CONTEXT | INFORMATIONAL | FALSE_POSITIVE",
      "category_rationale": "Why this category applies based on the evidence and known context.",
      "severity": "INFORMATIONAL | LOW | MEDIUM | HIGH | CRITICAL",
      "title": "",
      "description": "",
      "evidence": "Resource and specific Terraform configuration supporting the finding.",
      "impact": "",
      "recommendation": ""
    }
  ],
  "policy_violations": [
    {"finding_id": "F-001", "policy_id": "", "policy_name": "", "severity": "LOW | MEDIUM | HIGH | CRITICAL"}
  ],
  "positives": [],
  "final_recommendation": ""
}

Use an empty array when a section has no items. Include at most three findings. Keep each field concise, avoid repeating the same issue, and do not label an optional improvement as a vulnerability.

Set status consistently with category: confirmed security vulnerabilities and policy violations use `CONFIRMED`; `CONTEXT_DEPENDENT` uses `NEEDS_CONTEXT`; `POTENTIAL_FALSE_POSITIVE` uses `FALSE_POSITIVE`. Use `INFORMATIONAL` status and severity for observations that do not allege a weakness. Preserve supported current security risks as findings even when their severity is LOW.
```

## C.5 Workflow (`.github/workflows/terraform.yml`)

```yaml
name: PROM06 Experimental Security Review

permissions:
  contents: read
  pull-requests: write
  issues: write

on:
  pull_request:
    branches:
      - main
  workflow_dispatch:
    inputs:
      pr_number:
        description: PR number to receive separate tool comments (optional)
        required: false
        type: string
      base_ref:
        description: Base branch used for changed-file AI context
        required: true
        type: string
        default: main

env:
  EXPERIMENT_CONDITION: INDEPENDENT
  PR_NUMBER: ${{ github.event.pull_request.number || github.event.inputs.pr_number || '' }}
  EXPERIMENT_COMMIT: ${{ github.event.pull_request.head.sha || github.sha }}
  BASE_REF: ${{ github.base_ref || github.event.inputs.base_ref || 'main' }}

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - name: Record experimental condition
        run: |
          python - <<'PY'
          import json, os
          from datetime import datetime, timezone
          from pathlib import Path
          from ai.review_runner import CLASSIFICATION_POLICY_VERSION
          Path("run-results").mkdir(exist_ok=True)
          metadata = {
              "experiment_condition": os.environ["EXPERIMENT_CONDITION"],
              "pull_request_number": os.environ.get("PR_NUMBER") or None,
              "base_ref": os.environ["BASE_REF"],
              "experiment_commit_sha": os.environ["EXPERIMENT_COMMIT"],
              "workflow_sha": os.environ["GITHUB_SHA"],
              "workflow_run_id": os.environ["GITHUB_RUN_ID"],
              "event_name": os.environ["GITHUB_EVENT_NAME"],
              "started_at_utc": datetime.now(timezone.utc).isoformat(),
              "classification_policy_version": CLASSIFICATION_POLICY_VERSION,
              "review_mode": "INDEPENDENT",
              "scanner_findings_supplied_to_ai": False,
          }
          Path("run-results/experiment-metadata.json").write_text(json.dumps(metadata, indent=2) + "\n")
          with open(os.environ["GITHUB_STEP_SUMMARY"], "a") as summary:
              summary.write("## PROM06 Experimental Security Review\n\n")
              summary.write(f"Condition: **{metadata['experiment_condition']}**\n\n")
          PY

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Run AI review regression tests
        run: python -m unittest discover -s tests -v

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3

      - name: Terraform Init
        run: terraform -chdir=terraform init -backend=false

      - name: Terraform Format
        run: terraform -chdir=terraform fmt -check -recursive

      - name: Terraform Validate
        run: terraform -chdir=terraform validate

      - name: Install Checkov 3.3.1
        run: python -m pip install checkov==3.3.1

      - name: Run Checkov
        id: checkov
        shell: bash
        run: |
          set +e
          checkov -d terraform --framework terraform --output json > run-results/checkov-results.json 2> run-results/checkov-stderr.log
          result=$?
          set -e
          echo "$result" > run-results/checkov-exit-code.txt
          echo "exit_code=$result" >> "$GITHUB_OUTPUT"
          checkov --version > run-results/checkov-version.txt 2>&1

      - name: Render Checkov PR report
        run: |
          python ai/render_scanner_report.py \
            --tool checkov \
            --input run-results/checkov-results.json \
            --version "$(cat run-results/checkov-version.txt)" \
            --exit-code "$(cat run-results/checkov-exit-code.txt)" \
            --condition "$EXPERIMENT_CONDITION" \
            --output run-results/pr_comment_checkov.md

      - name: Install tfsec 1.28.14
        run: |
          curl --fail --location --silent --show-error \
            https://github.com/aquasecurity/tfsec/releases/download/v1.28.14/tfsec-linux-amd64 \
            --output /usr/local/bin/tfsec
          chmod +x /usr/local/bin/tfsec

      - name: Run tfsec
        id: tfsec
        shell: bash
        run: |
          set +e
          tfsec terraform --format json > run-results/tfsec-results.json 2> run-results/tfsec-stderr.log
          result=$?
          set -e
          echo "$result" > run-results/tfsec-exit-code.txt
          echo "exit_code=$result" >> "$GITHUB_OUTPUT"
          tfsec --version > run-results/tfsec-version.txt 2>&1

      - name: Render tfsec PR report
        run: |
          python ai/render_scanner_report.py \
            --tool tfsec \
            --input run-results/tfsec-results.json \
            --version "$(cat run-results/tfsec-version.txt)" \
            --exit-code "$(cat run-results/tfsec-exit-code.txt)" \
            --condition "$EXPERIMENT_CONDITION" \
            --output run-results/pr_comment_tfsec.md

      - name: Setup Python dependencies
        run: python -m pip install requests

      - name: Run independent AI review
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: python ai/review_runner.py

      - name: Post Checkov PR comment
        if: always() && env.PR_NUMBER != ''
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const path = 'run-results/pr_comment_checkov.md';
            if (!fs.existsSync(path)) return;
            const body = fs.readFileSync(path, 'utf8');
            await github.rest.issues.createComment({
              issue_number: Number(process.env.PR_NUMBER),
              owner: context.repo.owner,
              repo: context.repo.repo,
              body
            });

      - name: Post tfsec PR comment
        if: always() && env.PR_NUMBER != ''
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const path = 'run-results/pr_comment_tfsec.md';
            if (!fs.existsSync(path)) return;
            const body = fs.readFileSync(path, 'utf8');
            await github.rest.issues.createComment({
              issue_number: Number(process.env.PR_NUMBER),
              owner: context.repo.owner,
              repo: context.repo.repo,
              body
            });

      - name: Post AI PR comment
        if: always() && env.PR_NUMBER != ''
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const path = 'run-results/pr_comment_ai.md';
            if (!fs.existsSync(path)) return;
            const body = fs.readFileSync(path, 'utf8');
            await github.rest.issues.createComment({
              issue_number: Number(process.env.PR_NUMBER),
              owner: context.repo.owner,
              repo: context.repo.repo,
              body
            });

      - name: Upload raw research run outputs
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: prom06-${{ env.EXPERIMENT_CONDITION }}-${{ github.run_id }}
          path: run-results/
          if-no-files-found: ignore
          retention-days: 90
```

```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```
# Appendix D. Evidence Index for TC01–TC15 {.unnumbered}

All raw evidence is preserved, unaltered, on branch `prom06-evidence` of the repository under `evidence/prom06/`: run artefacts (`independent-runs/<run_id>/`), run indexes, pull-request comments (`pr-comments/`), local scanner reproductions (`local-scans/`), step-3 data (`step3/`), ground truth, figures, page captures (`screenshots/`) and the scripts that produce every table and figure (`scripts/`).

: Table D.1: Independent runs by test case

| ID | Case | Branch | Commit | PR | Run IDs |
|---------|--------------------|-------------|---------|------|-------------------------------------------|
| TC01 | Secure baseline | indep-tc01 | 92ab884 | #70 | 38404582550, 38405003190, 38405111880 |
| TC02 | Unrestricted SSH | indep-tc02 | 3eda6f7 | #71 | 38404584887, 38405012851, 38405121064 |
| TC03 | Unrestricted RDP | indep-tc03 | 27789d9 | #72 | 38404589228, 38405022162, 38405130215 |
| TC04 | Public HTTP | indep-tc04 | cbc6855 | #73 | 38404592498, 38405031009, 38405139458 |
| TC05 | Missing NSG association | indep-tc05 | 14486bd | #74 | 38404594354, 38405039302, 38405149036 |
| TC06 | Public DNS resolver | indep-tc06 | eb51ee9 | #75 | 38404596950, 38405047995, 38405157604 |
| TC07 | Weak TLS (storage) | indep-tc07 | b6e93b7 | #76 | 38404600206, 38405057461, 38405166219 |
| TC08 | Missing NSG diagnostics | indep-tc08 | c86e4d5 | #77 | 38404605125 (failed), 38405066857, 38405174844, 38405218950 |
| TC09 | Secret in local | indep-tc09 | 277a730 | #78 | 38404607277, 38405075984, 38405183161 |
| TC10 | Wildcard custom role | indep-tc10 | bd8a61f | #79 | 38404612132, 38405084901, 38405192342 |
| TC11 | Role vs documented need | indep-tc11 | 3dd9a04 | #80 | 38404613836, 38405093864, 38405200842 |
| TC12 | Legitimate public HTTPS | indep-tc12 | 9cee1fe | #81 | 38404619147, 38405103514, 38405210047 |
| TC13 | Contributor vs Reader need | indep-tc13 | 1e87e00 | #82 | 38409744211, 38409804722, 38409830032 |
| TC14 | SSH from one address | indep-tc14 | 5a48d73 | #83 | 38409748586, 38409813127, 38409838825 |
| TC15 | Password in variable default | indep-tc15 | 049f9c9 | #84 | 38409752049, 38409821867, 38409847744 |

: Table D.2: Remediation-validation branches and runs

| Branch | Commit | PR | Run ID | Result |
|--------------|---------|-----|-------------|--------|
| rem-tc02 | 386c2ac | #85 | 38412911309 | success |
| rem-tc03 | 08e5734 | #86 | 38412915964 | success |
| rem-tc04 | 8d02bac | #87 | 38412921766 | success |
| rem-tc05 | 952f4dc | #88 | 38412929801 | success |
| rem-tc06 | fb59f8a | #89 | 38412933192 | success |
| rem-tc07 | 6d60bce | #90 | 38412938552 | success |
| rem-tc08 | 324f05c | #91 | 38412942226 | success |
| rem-tc09 | a3323f5 | #92 | 38412949170 | success |
| rem-tc10 | 46226ce | #93 | 38412950863 | success |
| rem-tc10tags | 7c47e50 | #94 | 38412955313 | failure |
| rem-tc11 | 2e55a55 | #95 | 38412957421 | success |
| rem-tc13 | 3748898 | #96 | 38412963217 | success |
| rem-tc15 | 30a6cf7 | #97 | 38412968077 | success |
| rem-tc02b | fd061b8 | #98 | 38413482687 | success |
| rem-tc03b | ed0ab21 | #99 | 38413403063 | success |
| rem-tc04b | 6e7a619 | #100 | 38413413620 | success |

Earlier scanner-informed (Condition C) runs used pull requests #46 and #55–#68; their comments are archived in `pr-comments/condition-c/`.

```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```
# Appendix E. Results, Metrics and Scoring Sheets {.unnumbered}

Source: results workbook `PROM06_TC01-TC12_Verified_Results_Matrix.xlsx` (evidence branch), in which every summary figure is a spreadsheet formula over the run-level data.

: Table E.1: Case-level classification

| ID | Case | Type | Checkov | tfsec | AI independent | AI hybrid (C) |
|---------|----------------------|------------|---------|---------|------------|------------|
| TC01 | Secure baseline | Secure | TN | TN | TN | UNVERIFIED |
| TC02 | Unrestricted SSH | Vulnerable | FN | TP | TP | TP |
| TC03 | Unrestricted RDP | Vulnerable | FN | TP | TP | TP |
| TC04 | Public HTTP | Vulnerable | FN | TP | TP | TP |
| TC05 | Missing NSG association | Vulnerable | TP | FN | TP | TP |
| TC06 | Public DNS resolver | Vulnerable | TP | FN | TP | TP |
| TC07 | Weak TLS (storage) | Vulnerable | TP | TP | TP | TP |
| TC08 | Missing NSG diagnostics | Vulnerable | FN | FN | PARTIAL | TP |
| TC09 | Secret in local | Vulnerable | FN | FN | TP | TP |
| TC10 | Wildcard custom role | Vulnerable | TP | FN | TP | TP |
| TC11 | Role vs documented need | Vulnerable | TP | FN | TP | TP |
| TC12 | Legitimate public HTTPS | Legitimate | TN | CONTEXT | CONTEXT | CONTEXT |
| TC13 | Contributor vs Reader need | Vulnerable | FN | FN | TP | not run |
| TC14 | SSH from one address | Secure | TN | TN | TN | not run |
| TC15 | Password in variable default | Vulnerable | FN | FN | TP | not run |

: Table E.2: Scanner results

| ID | Checkov passed | Checkov failed | Checkov failed checks | tfsec findings |
|---------|---------|---------|------------------------------|----------------------------------------|
| TC01 | 7 | 0 | none | none |
| TC02 | 7 | 0 | none | AVD-AZU-0047 · CRITICAL · azurerm_network_security_group.nsg AVD-AZU-0050 · CRITICAL · azurerm_network_security_group.nsg |
| TC03 | 7 | 0 | none | AVD-AZU-0048 · CRITICAL · azurerm_network_security_group.nsg AVD-AZU-0047 · CRITICAL · azurerm_network_security_group.nsg |
| TC04 | 7 | 0 | none | AVD-AZU-0047 · CRITICAL · azurerm_network_security_group.nsg |
| TC05 | 6 | 1 | CKV2_AZURE_31 | none |
| TC06 | 5 | 2 | CKV_AZURE_183, CKV_AZURE_182 | none |
| TC07 | 11 | 11 | CKV_AZURE_59, CKV_AZURE_206, CKV_AZURE_190, CKV_AZURE_33, CKV_AZURE_44, CKV2_AZURE_47, CKV2_AZURE_38, CKV2_AZURE_40, CKV2_AZURE_33, CKV2_AZURE_41, CKV2_AZURE_1 | AVD-AZU-0011 · CRITICAL · azurerm_storage_account.tc07_storage |
| TC08 | 7 | 0 | none | none |
| TC09 | 7 | 0 | none | none |
| TC10 | 7 | 1 | CKV_AZURE_39 | none |
| TC11 | 7 | 1 | CKV_AZURE_39 | none |
| TC12 | 11 | 0 | none | AVD-AZU-0047 · CRITICAL · azurerm_network_security_rule.tc12_public_https |
| TC13 | 7 | 0 | none | none |
| TC14 | 7 | 0 | none | none |
| TC15 | 7 | 0 | none | none |

: Table E.3: AI runs — target confirmation, confirmed findings and rubric scores (D detection, E explanation, I impact, R remediation, C context, U usefulness; '–' not scored for non-vulnerable cases)

| TC | Run | Run ID | Target confirmed | Confirmed findings | False | D | E | I | R | C | U | Score |
|-------|-----|--------------|---------|---------|-------|----|----|----|----|----|----|--------|
| TC01 | 1 | 38404582550 | n/a | 0 | 0 | 2 | 2 | – | – | – | 2 | 100% |
| TC01 | 2 | 38405003190 | n/a | 0 | 0 | 2 | 2 | – | – | – | 2 | 100% |
| TC01 | 3 | 38405111880 | n/a | 0 | 0 | 2 | 2 | – | – | – | 2 | 100% |
| TC02 | 1 | 38404584887 | Y | 1 | 0 | 2 | 2 | 2 | 2 | 2 | 2 | 100% |
| TC02 | 2 | 38405012851 | Y | 1 | 0 | 2 | 2 | 2 | 2 | 2 | 2 | 100% |
| TC02 | 3 | 38405121064 | Y | 1 | 0 | 2 | 2 | 2 | 2 | 2 | 2 | 100% |
| TC03 | 1 | 38404589228 | Y | 1 | 0 | 2 | 2 | 2 | 2 | 2 | 2 | 100% |
| TC03 | 2 | 38405022162 | Y | 1 | 0 | 2 | 2 | 2 | 2 | 2 | 2 | 100% |
| TC03 | 3 | 38405130215 | Y | 2 | 0 | 2 | 2 | 2 | 2 | 2 | 1 | 92% |
| TC04 | 1 | 38404592498 | Y | 1 | 0 | 2 | 2 | 1 | 1 | 2 | 2 | 83% |
| TC04 | 2 | 38405031009 | Y | 1 | 0 | 2 | 2 | 1 | 1 | 2 | 2 | 83% |
| TC04 | 3 | 38405139458 | Y | 1 | 0 | 2 | 2 | 1 | 1 | 2 | 2 | 83% |
| TC05 | 1 | 38404594354 | Y | 1 | 0 | 2 | 2 | 2 | 2 | 2 | 2 | 100% |
| TC05 | 2 | 38405039302 | Y | 1 | 0 | 2 | 2 | 2 | 2 | 2 | 2 | 100% |
| TC05 | 3 | 38405149036 | Y | 1 | 0 | 2 | 2 | 2 | 2 | 2 | 2 | 100% |
| TC06 | 1 | 38404596950 | Y | 1 | 0 | 2 | 2 | 2 | 2 | 2 | 2 | 100% |
| TC06 | 2 | 38405047995 | Y | 1 | 0 | 2 | 2 | 2 | 2 | 2 | 2 | 100% |
| TC06 | 3 | 38405157604 | Y | 1 | 0 | 2 | 2 | 2 | 2 | 2 | 2 | 100% |
| TC07 | 1 | 38404600206 | Y | 2 | 0 | 2 | 1 | 2 | 2 | 2 | 2 | 92% |
| TC07 | 2 | 38405057461 | Y | 2 | 0 | 2 | 1 | 2 | 2 | 2 | 2 | 92% |
| TC07 | 3 | 38405166219 | Y | 2 | 0 | 2 | 1 | 2 | 2 | 2 | 2 | 92% |
| TC08 | 1 | 38404605125 | N | 0 | 0 | 0 | 1 | 1 | 2 | 1 | 0 | 42% |
| TC08 | 2 | 38405066857 | N | 0 | 0 | 1 | 2 | 2 | 2 | 2 | 0 | 75% |
| TC08 | 3 | 38405174844 | N | 0 | 0 | 1 | 2 | 2 | 2 | 2 | 0 | 75% |
| TC08 | 4 | 38405218950 | Y | 1 | 0 | 2 | 2 | 2 | 2 | 2 | 2 | 100% |
| TC09 | 1 | 38404607277 | Y | 1 | 0 | 2 | 2 | 2 | 2 | 2 | 2 | 100% |
| TC09 | 2 | 38405075984 | Y | 1 | 0 | 2 | 1 | 2 | 2 | 2 | 2 | 92% |
| TC09 | 3 | 38405183161 | Y | 1 | 0 | 2 | 1 | 2 | 2 | 2 | 2 | 92% |
| TC10 | 1 | 38404612132 | Y | 2 | 1 | 2 | 1 | 2 | 1 | 2 | 1 | 75% |
| TC10 | 2 | 38405084901 | Y | 1 | 0 | 2 | 1 | 2 | 2 | 2 | 2 | 92% |
| TC10 | 3 | 38405192342 | Y | 2 | 1 | 2 | 1 | 2 | 2 | 2 | 1 | 83% |
| TC11 | 1 | 38404613836 | Y | 1 | 0 | 2 | 1 | 2 | 2 | 2 | 2 | 92% |
| TC11 | 2 | 38405093864 | Y | 1 | 0 | 2 | 1 | 2 | 2 | 2 | 2 | 92% |
| TC11 | 3 | 38405200842 | Y | 1 | 0 | 2 | 2 | 2 | 2 | 2 | 2 | 100% |
| TC12 | 1 | 38404619147 | n/a | 3 | 3 | 0 | 1 | – | – | – | 0 | 17% |
| TC12 | 2 | 38405103514 | n/a | 1 | 1 | 1 | 1 | – | – | – | 1 | 50% |
| TC12 | 3 | 38405210047 | n/a | 0 | 0 | 2 | 2 | – | – | – | 2 | 100% |
| TC13 | 1 | 38409744211 | Y | 1 | 0 | 2 | 2 | 2 | 2 | 2 | 2 | 100% |
| TC13 | 2 | 38409804722 | Y | 1 | 0 | 2 | 1 | 2 | 2 | 2 | 2 | 92% |
| TC13 | 3 | 38409830032 | Y | 1 | 0 | 2 | 1 | 2 | 2 | 2 | 2 | 92% |
| TC14 | 1 | 38409748586 | n/a | 1 | 1 | 1 | 2 | – | – | – | 1 | 67% |
| TC14 | 2 | 38409813127 | n/a | 0 | 0 | 2 | 2 | – | – | – | 2 | 100% |
| TC14 | 3 | 38409838825 | n/a | 0 | 0 | 2 | 2 | – | – | – | 2 | 100% |
| TC15 | 1 | 38409752049 | Y | 1 | 0 | 2 | 2 | 2 | 2 | 2 | 2 | 100% |
| TC15 | 2 | 38409821867 | Y | 1 | 0 | 2 | 2 | 2 | 2 | 2 | 2 | 100% |
| TC15 | 3 | 38409847744 | Y | 1 | 0 | 2 | 2 | 2 | 2 | 2 | 2 | 100% |
| TC | Runs | Mean D |  |  |  | Mean score % | Min score % | – | – | – | – |  |
| TC01 | 3 | 2 |  |  |  | 1 | 1 | – | – | – | – |  |
| TC02 | 3 | 2 |  |  |  | 1 | 1 | – | – | – | – |  |
| TC03 | 3 | 2 |  |  |  | 0.972222222222222 | 0.916666666666667 | – | – | – | – |  |
| TC04 | 3 | 2 |  |  |  | 0.833333333333333 | 0.833333333333333 | – | – | – | – |  |
| TC05 | 3 | 2 |  |  |  | 1 | 1 | – | – | – | – |  |
| TC06 | 3 | 2 |  |  |  | 1 | 1 | – | – | – | – |  |
| TC07 | 3 | 2 |  |  |  | 0.916666666666667 | 0.916666666666667 | – | – | – | – |  |
| TC08 | 4 | 1 |  |  |  | 0.729166666666667 | 0.416666666666667 | – | – | – | – |  |
| TC09 | 3 | 2 |  |  |  | 0.944444444444444 | 0.916666666666667 | – | – | – | – |  |
| TC10 | 3 | 2 |  |  |  | 0.833333333333333 | 0.75 | – | – | – | – |  |
| TC11 | 3 | 2 |  |  |  | 0.944444444444444 | 0.916666666666667 | – | – | – | – |  |
| TC12 | 3 | 1 |  |  |  | 0.555555555555556 | 0.166666666666667 | – | – | – | – |  |
| TC13 | 3 | 2 |  |  |  | 0.944444444444444 | 0.916666666666667 | – | – | – | – |  |
| TC14 | 3 | 1.66666666666667 |  |  |  | 0.888888888888889 | 0.666666666666667 | – | – | – | – |  |
| TC15 | 3 | 2 |  |  |  | 1 | 1 | – | – | – | – |  |

: Table E.4: Confirmed AI findings other than the target

| TC | Run | Severity | Title | Label | Justification |
|--------|-----|---------|------------------------------|------------|------------------------------------|
| TC03 | 3 | HIGH | SEC-001 violation: public RDP exposure without documented policy justification | DUPLICATE | Restates F-001 (public RDP) as a SEC-001 policy finding. |
| TC07 | 1 | LOW | Storage account missing mandatory tags: owner, cost-center, research_case | EXTRA-VALID | Storage account tags lack owner and cost-center (TAG-001); verified in storage.tf. |
| TC07 | 2 | LOW | Storage account missing mandatory tags: owner and cost-center | EXTRA-VALID | As run 1. |
| TC07 | 3 | LOW | Storage account missing mandatory tags: owner and cost-center | EXTRA-VALID | As run 1. |
| TC10 | 1 | LOW | Custom role definition is missing mandatory tags required by TAG-001 | FALSE | azurerm_role_definition has no tags argument; applying the fix fails terraform validate (PR #94). |
| TC10 | 3 | LOW | Custom role definition missing mandatory tags required by TAG-001 | FALSE | As run 1. |
| TC12 | 1 | HIGH | NSG rule permits unrestricted public inbound HTTPS to the entire subnet | FALSE | Public TCP/443 is intended (ground truth TC12); destination-scope concern is not the stated defect. |
| TC12 | 1 | MEDIUM | SEC-001: Public exposure broader than documented justification | FALSE | Same intended exposure restated against SEC-001. |
| TC12 | 1 | LOW | TAG-001: azurerm_network_security_rule.tc12_public_https missing mandatory tags | FALSE | azurerm_network_security_rule is not taggable (AI run 3 states this correctly). |
| TC12 | 2 | LOW | NSG security rule tc12_public_https is missing mandatory tags (TAG-001) | FALSE | As TC12 run 1 F-003. |
| TC14 | 1 | LOW | SSH allow rule uses wildcard destination, permitting access to any subnet host | FALSE | Ground truth TC14-GT-01: correct outcome is no confirmed finding; wildcard destination is a hardening suggestion, confirmed at LOW. |

: Table E.5: Recorded decisions on evidence conflicts (agreed with the researcher, 13 October 2026)

| # | Issue | Treatment | Decision |
|----|------------------------------|----------------------------------------|--------------|
| 1 | TC12 tfsec AVD-AZU-0047 and AI SEC-001: count the shared-NSG / wildcard-destination scope as a separate weakness? | Keep as CONTEXT; report both readings (FP against TC12-GT-01 vs valid scope concern). | Agreed — proposed treatment adopted (AB, 13 Oct 2026) |
| 2 | TC08 AI result | Report PARTIAL: raised 4/4, confirmed 1/3 successful runs; treat as classification instability. | Agreed — proposed treatment adopted (AB, 13 Oct 2026) |
| 3 | TC01 hybrid result | Report as UNVERIFIED; use independent TC01 (clean 3/3) as the baseline result; disclose baseline evolution. | Agreed — proposed treatment adopted (AB, 13 Oct 2026) |
| 4 | TC11 construct | Count detections, but state the case does not isolate multi-file reasoning (wildcard alone triggers CKV_AZURE_39). | Agreed — proposed treatment adopted (AB, 13 Oct 2026) |
| 5 | AI TAG-001 findings on non-taggable resources (TC10, TC12) | Count as AI false positives (unrelated to target). | Agreed — proposed treatment adopted (AB, 13 Oct 2026) |
| 6 | Input asymmetry: only the AI receives ai/policy.md (NET-001, NET-002, LOG-001, SEC-001, TAG-001) | Report as a fairness/validity limitation, especially for TC05, TC06, TC08, TC12. | Agreed — proposed treatment adopted (AB, 13 Oct 2026) |
| 7 | Severity comparison | Do not compare severities across tools; report AI severity variability only. | Agreed — proposed treatment adopted (AB, 13 Oct 2026) |
| 8 | Ground truth source | Use Confluence v72 per-case ground truth (more specific than GT Matrix v1.0); note GT v1.0 TC04 wording differs. | Agreed — proposed treatment adopted (AB, 13 Oct 2026) |
| 9 | Checkov TC02–TC04 misses | Report as reproducible rule-matching limitation with the local probe as evidence. | Agreed — proposed treatment adopted (AB, 13 Oct 2026) |
| 10 | Close PRs #56–#81 without merging after sign-off | — | Agreed — proposed treatment adopted (AB, 13 Oct 2026) |
| 11 | TC12/TC14 wildcard-destination scope in AI confirmed findings (TC12 run 1 F-001, F-002; TC14 run 1 F-001) | Keep FALSE per pre-fixed ground truth; report sensitivity in Ch4.3 and Ch5 validity: FALSE 7→4, precision 82%→89% (40/45), non-vulnerable runs with a false finding 3→2 of 9. tfsec AVD-AZU-0047 concerns source only, so unaffected. Implements decision #1. | Agreed (AB, 13 Oct 2026) |

: Table E.6: Pipeline timing across 46 independent runs (seconds)

| Statistic | Whole job | Install Checkov | Run Checkov | Run tfsec | AI review | PR → comments |
|--------|-------|-------|-------|-------|-------|-------|
| Median | 77 | 19.5 | 6 | 1 | 31.5 | 79 |
| Minimum | 58 | 14 | 4 | 0 | 18 | 71 |
| Maximum | 184 | 26 | 9 | 1 | 131 | 95 |

```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```
# Appendix F. Pipeline Logs and Page Captures {.unnumbered}

## F.1 Validation failure of the AI's tag recommendation (run 38412955313)

```
Source: gh run view 38412955313 -R abdulwaheed384/ai-pr-review --log-failed (run by AB, 13 Oct 2026; ANSI colour codes removed)
Run: PR #94, branch rem-tc10tags, commit 7c47e500ac86486e4fd5efd15f682b9b5bbc9406, EXPERIMENT_CONDITION INDEPENDENT

review  Terraform Validate      2026-10-13T14:23:52.0657545Z Run terraform -chdir=terraform validate
review  Terraform Validate      2026-10-13T14:23:52.8578410Z │ Error: Unsupported argument
review  Terraform Validate      2026-10-13T14:23:52.8579967Z │   on tc10_iam.tf line 14, in resource "azurerm_role_definition" "tc10_excessive_permissions":
review  Terraform Validate      2026-10-13T14:23:52.8581010Z │   14:   tags = local.common_tags
review  Terraform Validate      2026-10-13T14:23:52.8582667Z │ An argument named "tags" is not expected here.
review  Terraform Validate      2026-10-13T14:23:52.8654821Z ##[error]Terraform exited with code 1.
review  Terraform Validate      2026-10-13T14:23:52.8709791Z ##[error]Process completed with exit code 1.
```

## F.2 TC08 run 1 (run 38404605125): AI output rejected by the runner

```
AI review failed: Policy mapping 1 must refer to a matching finding
Error: Process completed with exit code 1.
```

## F.3 GitHub page captures

Pages printed to PDF from GitHub on 13 October 2026 (18:22–18:29 BST); each page footer shows its URL and print time. Content was cross-checked against the comments and logs retrieved through the GitHub API. An artefact re-downloaded at 18:31 was byte-identical to the copy archived earlier the same day.

*S1. TC02 pull request #71: scanner and AI comments (page 2)*

![](/home/claude/prom06-outputs/final/appendix_f/PR71_p2.jpg){width=15cm}

*S1. TC02 pull request #71: scanner and AI comments (page 3)*

![](/home/claude/prom06-outputs/final/appendix_f/PR71_p3.jpg){width=15cm}

*S2. TC09 pull request #78: scanners clean, AI reports the embedded secret (page 2)*

![](/home/claude/prom06-outputs/final/appendix_f/PR78_p2.jpg){width=15cm}

*S2. TC09 pull request #78: scanners clean, AI reports the embedded secret (page 3)*

![](/home/claude/prom06-outputs/final/appendix_f/PR78_p3.jpg){width=15cm}

*S3. TC08 run 38404605125 (pull request #77): AI step fails validation (page 1)*

![](/home/claude/prom06-outputs/final/appendix_f/S3_run38404605125_p1.jpg){width=15cm}

*S3. TC08 run 38404605125 (pull request #77): AI step fails validation (page 2)*

![](/home/claude/prom06-outputs/final/appendix_f/S3_run38404605125_p2.jpg){width=15cm}

*S4. TC12 pull request #81: tfsec alert and AI block on the intended HTTPS rule (page 2)*

![](/home/claude/prom06-outputs/final/appendix_f/PR81_p2.jpg){width=15cm}

*S4. TC12 pull request #81: tfsec alert and AI block on the intended HTTPS rule (page 3)*

![](/home/claude/prom06-outputs/final/appendix_f/PR81_p3.jpg){width=15cm}

*S5a. TC13 pull request #82: scanners clean, AI reports Contributor at subscription scope (page 2)*

![](/home/claude/prom06-outputs/final/appendix_f/PR82_p2.jpg){width=15cm}

*S5a. TC13 pull request #82: scanners clean, AI reports Contributor at subscription scope (page 3)*

![](/home/claude/prom06-outputs/final/appendix_f/PR82_p3.jpg){width=15cm}

*S5b. TC15 pull request #84: scanners clean, AI reports the hard-coded password (page 2)*

![](/home/claude/prom06-outputs/final/appendix_f/PR84_p2.jpg){width=15cm}

*S5b. TC15 pull request #84: scanners clean, AI reports the hard-coded password (page 3)*

![](/home/claude/prom06-outputs/final/appendix_f/PR84_p3.jpg){width=15cm}

*S6a. Remediation pull request #85 (TC02 fix, stale comment) (page 3)*

![](/home/claude/prom06-outputs/final/appendix_f/PR85_p3.jpg){width=15cm}

*S6b. Remediation pull request #98 (TC02 fix, comment corrected) (page 3)*

![](/home/claude/prom06-outputs/final/appendix_f/PR98_p3.jpg){width=15cm}

*S7. Run 38412955313 (pull request #94): AI tag recommendation fails terraform validate (page 1)*

![](/home/claude/prom06-outputs/final/appendix_f/S7_run38412955313_p1.jpg){width=15cm}

*S7. Run 38412955313 (pull request #94): AI tag recommendation fails terraform validate (page 2)*

![](/home/claude/prom06-outputs/final/appendix_f/S7_run38412955313_p2.jpg){width=15cm}

*S8. TC02 run 38404584887: workflow job steps and durations (page 1)*

![](/home/claude/prom06-outputs/final/appendix_f/S8_run38404584887_p1.jpg){width=15cm}


```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```
# Appendix G. Project Planning {.unnumbered}

: Table G.1: PROM05 milestones compared with the project as executed

| PROM05 milestone | Planned | Actual |
|--------------------------|--------|--------------------------------------------------|
| M1 Research questions confirmed | Week 2 | Refined in PROM06 Assignment 1 (submitted 23 July 2026) |
| M2 Literature review complete | Week 3 | Assignment 1 review; reworked as Chapter 2 in October 2026 |
| M3 Ethical approval | Week 4 | Not required: no human participants or personal data |
| M4 Pipeline operational | Week 9 | Repository from 27 April 2026; experimental workflow from 8 October 2026; independent workflow from 13 October 2026 (PR #69) |
| M5 Data collection complete | Week 13 | Scanner-informed runs 9–12 October; independent reruns, TC13–TC15 and remediation validation 13 October 2026. Developer sessions and interviews not conducted |
| M6 Analysis complete | Week 14 | 13 October 2026 (results workbook, evidence register) |
| M7 Draft submission | Week 15 | Full draft 13 October 2026 |
| M8 Final submission | Week 16 | Planned 25 October 2026 (deadline 26 October 2026) |

The main departures from the PROM05 plan were the omission of developer sessions and interviews (and therefore of thematic analysis and ethics review), the use of static review without Azure deployment, the discovery and correction of scanner-informed AI runs, and the addition of TC13–TC15, repeated runs and remediation validation.
