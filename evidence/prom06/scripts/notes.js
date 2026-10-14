// Speaker notes (spoken script), one entry per slide. British English, first person.
module.exports = [
// 1
`[Slide 1 · about 40 seconds]

Hello, I'm Abdul Waheed. This is my PROM06 research project for the MSc in Computer Science with Cybersecurity at the University of Sunderland, supervised by Liz Gandy.

My project evaluates AI-driven security review in a DevSecOps pipeline. I built a pipeline where two established scanners, Checkov and tfsec, and an AI reviewer all review the same Terraform pull requests. Then I compared their results against answers I had fixed in advance.

I'll cover why this matters, what I built, how I tested it, what I found and what it means.`,

// 2
`[Slide 2 · about 1 minute 25 seconds]

Cloud infrastructure is now written as code. With Terraform, one insecure line, such as a firewall rule open to the whole internet, is copied into every environment that uses it. And under the shared-responsibility model, getting that configuration right is the customer's job.

Teams usually catch these mistakes with rule-based scanners. They are fast and consistent, but they only find what their rules describe, and developers tend to ignore noisy, poorly explained warnings.

AI reviewers promise something different. They read the whole configuration and explain problems in plain language. But they can also state false things with confidence, and give different answers to the same input.

So my aim was to evaluate how effective an AI security reviewer is in a DevSecOps pipeline, compared with Checkov and tfsec. My four questions cover detection accuracy, the quality of its fixes, its likely effect on developer understanding, and the practical challenges of using it. My objectives were to review the literature, build the pipeline, evaluate it against a fixed ground truth, and investigate the benefits and limits.

This sits at the heart of my programme: secure software delivery, cloud security and the safe use of AI.`,

// 3
`[Slide 3 · about 1 minute 20 seconds]

The literature shaped both how I designed the study and how I read the results.

Johnson and colleagues found that developers abandon tools whose warnings are noisy and poorly explained, so I measured false alarms and scored the explanations, not just detections.

Rahman and colleagues documented security smells that keep appearing in infrastructure code, such as open network addresses and hard-coded secrets, and several of my test cases are exactly these.

Hybrid designs, like the one by Li and colleagues, pass the scanner's output to the language model. Then you can't tell what the AI found on its own, so I kept my reviewer independent.

The last two rows I added once my early results showed they mattered. Models answer the same request differently, so I repeated every review. And their claims and fixes can be wrong, so I applied every fix and tested it again.

The gap is the lack of head-to-head evidence: an AI reviewer against Terraform scanners, on the same changes and a fixed ground truth, with independence, repeatability and fixes tested together.`,

// 4
`[Slide 4 · about 1 minute 25 seconds]

This is what I built. Every Terraform pull request starts one GitHub Actions job. It first checks that the code is valid. It never runs plan or apply, so nothing is ever deployed. Then three reviewers run: Checkov, tfsec and my AI reviewer, which sends all the Terraform files, a short policy file and the README to Claude, and asks for a structured answer with at most three findings. Each tool posts its own comment on the pull request, every raw output is saved, and no tool sees another tool's results.

On the right is real output from pull request 71. This is test case TC02, where SSH is open to the whole internet. Checkov passed seven checks and failed none, so it missed the problem. tfsec flagged it as critical. The AI reviewer flagged it as high, and explained the risk and how to fix it.

[Optional demo, about 30 seconds: open pull request 71 on GitHub and scroll through the three comments.]

All the code and run evidence are public in my GitHub repository.`,

// 5
`[Slide 5 · about 1 minute 20 seconds]

Here's how I tested it. I wrote fifteen Terraform test cases and fixed the correct answer for each one before running any tool. Twelve contain a vulnerability, across network exposure, encryption, logging, secrets and identity. Three are acceptable, including a web endpoint that is meant to be public, to check whether the tools raise false alarms.

Each case was opened as a pull request and then run twice more, giving forty-six independent runs. I classified every output against the ground truth, scored the AI's output on six dimensions I had fixed in advance, and finally applied the AI's own fixes and ran all the checks again.

One discovery changed the study. When I traced my early results back to their workflow runs, I found the AI had been given the scanners' findings in its prompt, so those results weren't independent. I changed the workflow in pull request 69, ran every case with the AI working independently, and checked the metadata of all forty-six runs.

Ethically, everything was synthetic: dummy secrets, documentation IP addresses, nothing merged or deployed, and no personal data.`,

// 6
`[Slide 6 · about 1 minute 25 seconds]

Now the results, starting with RQ1, detection accuracy. Of the twelve vulnerable cases, Checkov found five and tfsec four, eight together. The AI reviewer found eleven, and partly found a twelfth: it noticed a missing logging setting in all four runs, but showed it to the developer only once.

Three things stand out. First, three cases were found only by the AI: two hard-coded secrets, and an over-privileged role that could only be judged against a separate requirements file.

Second, the scanners barely overlapped. Only the weak-TLS case was caught by both, and Checkov passed rules open to 0.0.0.0/0 but failed the very same rule written with a star.

Third, the AI made a different kind of error. Three of nine runs on acceptable configurations raised a finding, and once it blocked a legitimate HTTPS change, the kind of false alarm that erodes trust in tools. Of the forty-five findings it posted, 82 per cent were correct, or 89 per cent if three findings about weaknesses in my own test files count as valid.

The whole gap comes from three cases no scanner rule covers, and these numbers describe my fifteen cases, not real-world rates.`,

// 7
`[Slide 7 · about 1 minute 20 seconds]

For RQ2, I didn't just read the AI's fixes, I applied them. All twelve resolved the problem and passed validation, and for eight, the scanner that had flagged the issue confirmed the fix. On a fresh AI review, nine no longer raised the original problem.

But one recommendation was simply wrong. In a TC10 run, the AI claimed a role definition must carry tags. Applying that made terraform validate fail, as you can see here.

For RQ3, I judged the likely effect on developer understanding from the feedback itself. The chart shows the average rubric scores over thirty-seven runs. The AI explained what was wrong, why it mattered and how to fix it, in plain language, while the scanners gave a rule ID and one generic line. That points to a positive likely impact.

The weakest score was explanation accuracy, at 1.65. Some explanations stated false platform facts with confidence, the hallucination problem from the literature, and a developer could learn those as facts. These scores come from a single rater, with AI assistance, and every score's reasoning is recorded.`,

// 8
`[Slide 8 · about 1 minute 25 seconds]

RQ4 is about practical challenges, and this was my most surprising finding. On the left is the same TC02 fix, reviewed twice. In version A, the old comment "Deliberately unrestricted SSH access" was still in the file. The AI raised a high-severity finding against its own fix and quoted that comment. In version B, only the comment changed, and the AI approved it with a low note. TC03 behaved the same way.

So text in the code can raise or lower the AI's verdict, whatever the configuration says. This is a form of indirect prompt injection, as Greshake and colleagues describe. In a real pull request, anyone who can write a comment could influence the reviewer.

Three other challenges. The same input gave different answers: TC08 was classified three ways in four runs, and TC05 was rated high, high, then medium. Findings could be hidden or skipped: a "needs context" finding never reaches the developer, and a pull request that only deletes a file skips the AI step. The time cost, though, was small: a median of 31.5 seconds for the AI, and comments in under two minutes.`,

// 9
`[Slide 9 · about 1 minute 20 seconds]

So how far can these results be trusted? What holds up best is structural: scanner coverage depends on rules, the two scanners complemented each other, the AI found problems that need context, and its errors were less predictable.

The limits are real. Fifteen constructed cases, one cloud, one model and one prompt can't represent real repositories, and I partly chose cases where scanner rules were weak. As Ding and colleagues warn, constructed test sets can flatter AI models. Comments in my test files may have cued the AI, only the AI got the policy file, and the scoring was done once, with AI assistance.

My biggest lesson came from my own mistake. Results I first treated as independent were not. Fixing it cost time, but it saved the study, and now I only treat a result as established when I can link it to a run, a commit and the raw output.

Overall, all four objectives were met, with the evaluation valid within the limits of the sample.`,

// 10
`[Slide 10 · about 1 minute 10 seconds]

So, can AI-assisted review improve infrastructure-as-code security analysis? On these fifteen cases, the answer is a qualified yes. It improved coverage, finding everything the scanners found plus three cases they missed. But its errors were less predictable, so it shouldn't replace the scanners or decide merges.

My recommendations are on the left: let the scanners enforce and the AI advise; run more than one scanner; treat comments and pull-request text as untrusted; show uncertain findings instead of hiding them; validate AI fixes automatically; and review deletion-only changes and log the model version.

For future research, the next step is realism: real Terraform changes from public repositories, many more runs across several models, a deliberate study of comment manipulation, and a study with developers.

The references are on the right, and all the code and evidence are on GitHub. Thank you for listening.`,
];
