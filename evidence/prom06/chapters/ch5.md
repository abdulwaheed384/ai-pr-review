# 5 Project Evaluation and Reflection

## 5.1 Overview of the Completed Project

The project built a working pull-request security review pipeline for Terraform on GitHub Actions. In it, Checkov, tfsec and an AI reviewer based on Anthropic Claude review every change and post their results back to the pull request. Fifteen controlled test cases were run through it, giving 46 independent AI reviews in total. Every output was classified against ground truth defined before execution. The AI's explanations were then scored, and its recommended fixes were applied and re-checked.

The study did not run as planned throughout. The most important deviation came during evidence verification, which showed that the first round of AI results had been produced with scanner findings in the prompt. That discovery led to a change in the workflow and a complete rerun. Much of the value of the final results depends on that correction.

## 5.2 Review of Research Objectives

Table 5.1 assesses each objective set out in Assignment 1.

Table 5.1: Achievement of research objectives

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

## References cited in this chapter

Johnson, B., Song, Y., Murphy-Hill, E. and Bowdidge, R. (2013) 'Why don't software developers use static analysis tools to find bugs?', *Proceedings of the 35th International Conference on Software Engineering (ICSE)*, pp. 672–681.
