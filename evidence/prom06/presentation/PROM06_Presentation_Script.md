# PROM06 presentation: speaker script

A simple, slide-by-slide script for the 10-slide deck. It is about 1,600 words and takes about 13 minutes at a steady pace (125 words a minute), inside the 10–15 minute limit. The same text is in each slide’s speaker notes, so PowerPoint shows it while you record.

**Tips:** speak slowly, pause briefly between slides, and point to what is on screen. The optional 30-second demo on slide 4 would add about half a minute.

## Slide 1: Title

*About 0:45 · 0:45 in total by the end of this slide*

Hello, my name is Abdul Waheed. This is my PROM06 research project for the MSc in Computer Science with Cybersecurity at the University of Sunderland. My supervisor is Liz Gandy.

My project evaluates AI-driven security review in a DevSecOps pipeline. In simple terms, I built a pipeline where three reviewers check the same Terraform code: two well-known scanners, Checkov and tfsec, and an AI reviewer. Then I compared their results.

I’ll explain why this matters, what I built, how I tested it, what I found and what it means.

## Slide 2: Can an AI reviewer catch what scanners miss?

*About 1:25 · 2:10 in total by the end of this slide*

Today, cloud infrastructure is written as code. With Terraform, one insecure line, such as a firewall rule open to the whole internet, is copied into every environment that uses it. And in the cloud, setting things up securely is the customer’s job, not the provider’s.

Most teams catch these mistakes with rule-based scanners. They are fast and consistent, but they only find what their rules describe. And developers often ignore warnings that are noisy or hard to understand.

AI reviewers work differently. They read the whole configuration and explain problems in plain language. But they can also be confidently wrong, and give different answers to the same question.

So my aim was to evaluate how well an AI security reviewer works in a DevSecOps pipeline, compared with Checkov and tfsec. I asked four questions: how accurate it is, how good its fixes are, how it is likely to affect developer understanding, and what problems come up in practice. My objectives were to review the literature, build the pipeline, test it against fixed answers, and find its benefits and limits.

## Slide 3: How the literature shaped the study

*About 1:20 · 3:30 in total by the end of this slide*

The research I read shaped how I designed this study.

Johnson and colleagues found that developers stop using tools with noisy, unclear warnings. So I didn’t only count what each tool found. I also counted false alarms and scored the explanations.

Rahman and colleagues listed common security mistakes in infrastructure code, such as open network rules and secrets written into the code. Several of my test cases are exactly these mistakes.

Some tools, like the one by Li and colleagues, give the scanner’s results to the AI. Then you can’t tell what the AI found by itself. So I kept my AI reviewer separate.

I added two more ideas once my early results showed they mattered. AI can answer the same question differently, so I ran every review three times. And AI fixes can be wrong, so I applied every fix and tested it again.

The gap is simple: there are very few fair, direct comparisons of an AI reviewer with Terraform scanners.

## Slide 4: What I built: three independent reviewers

*About 1:10 · 4:40 in total by the end of this slide*

This is what I built. When a developer opens a pull request with Terraform code, GitHub Actions starts one job.

First, it checks that the code is valid. It never deploys anything.

Then three reviewers check the same code. Checkov and tfsec use fixed rules. My AI reviewer sends all the Terraform files, a short security policy and the README to Claude, and asks for a structured answer with at most three findings. Each tool posts its own comment on the pull request, and no tool sees another tool’s results.

On the right are real results from pull request 71. In this test, SSH is open to the whole internet. Checkov passed seven checks and found nothing, so it missed the problem. tfsec flagged it as critical. The AI reviewer flagged it as high, and explained the risk and the fix.

[Optional demo, about 30 seconds: open pull request 71 on GitHub and scroll through the three comments.]

All the code and evidence are public on my GitHub.

## Slide 5: How I tested it: fixed ground truth, repeated runs

*About 1:25 · 6:05 in total by the end of this slide*

Here is how I tested it.

I wrote fifteen Terraform test cases. For each one, I wrote down the correct answer before running any tool. I call this the ground truth. Twelve cases have a security problem. Three are safe, including a web server that is meant to be public. These check for false alarms.

I opened each case as a pull request and ran it twice more. With one extra run after a failed one, that gave forty-six runs. I checked every result against the ground truth and scored the AI on six criteria I fixed in advance. Finally, I applied the AI’s own fixes and tested them again.

One discovery changed the study. When I traced my early results back, I found the AI had been given the scanners’ findings, so those results were not independent. I fixed the workflow in pull request 69, ran every case with the AI working on its own, and checked all forty-six runs to prove it.

Everything was synthetic: fake secrets, nothing deployed and no personal data.

## Slide 6: RQ1: the AI detected more than both scanners

*About 1:25 · 7:30 in total by the end of this slide*

Now the results. My first question was about detection.

Out of twelve cases with a problem, Checkov found five and tfsec found four. Together, they found eight. The AI reviewer found eleven, and part of a twelfth. In that case, it noticed the problem every time but showed it to the developer only once.

Three things stand out. First, three problems were found only by the AI: two secrets written into the code, and a role with too much access, which it spotted by comparing it with a separate requirements file.

Second, the scanners barely overlapped. Only one case was caught by both. And Checkov missed rules open to 0.0.0.0/0, but caught the same rule written as a star.

Third, the AI made a different kind of mistake. Three of nine runs on safe cases raised a finding. Of the forty-five findings it posted, 82 per cent were correct, or 89 per cent if three findings about weaknesses in my own test files count as valid.

These numbers describe my fifteen cases only, not the real world.

## Slide 7: RQ2 and RQ3: useful advice, but some false claims

*About 1:30 · 9:00 in total by the end of this slide*

My second question was about the quality of the AI’s fixes. I didn’t just read them. I applied them.

All twelve fixes solved the problem and passed Terraform’s checks. For eight of them, a scanner also confirmed the fix. When the AI reviewed its own fixes, nine of the twelve no longer raised the problem.

But one piece of advice was simply wrong. The AI said a role definition needs tags. When I applied that, Terraform failed with the error you can see here.

My third question was about the likely effect on developers’ understanding. I judged this from the feedback itself. The chart shows the average scores out of two. The AI explained what was wrong, why it mattered and how to fix it, in plain language. The scanners only gave a rule ID and one short line. So the likely effect is positive.

The lowest score was for the accuracy of explanations. Sometimes the AI stated something false with confidence, and a developer could learn it as fact. These scores come from one scoring pass with AI help, and no second rater.

## Slide 8: RQ4: code comments changed the AI’s verdict

*About 1:30 · 10:30 in total by the end of this slide*

My fourth question was about practical challenges, and this was my most surprising finding.

On the left is the same fix, reviewed twice. The only difference is a comment in the code.

In version A, an old comment still said “Deliberately unrestricted SSH access”. The AI gave its own fix a high-severity finding and quoted that comment. In version B, I only corrected the comment, and the AI approved the change with just a low note. Another test case behaved the same way.

So text in the code can change the AI’s verdict, even when the code is the same. This is a form of what Greshake and colleagues call indirect prompt injection. In a real team, anyone who can write a comment could influence the AI.

I found three more challenges. The same input gave different answers: one case was classified three different ways in four runs. Some real findings were hidden from the developer, and pull requests that only delete files skipped the AI completely. Time was not a problem: the AI took about thirty seconds, and feedback arrived in under two minutes.

## Slide 9: Evaluation: what holds up, and its limits

*About 1:20 · 11:50 in total by the end of this slide*

So, how far can we trust these results?

Some findings are strong. Scanners only cover what their rules describe. The two scanners complemented each other. The AI found problems that need context, and its mistakes were less predictable.

But there are real limits. I used fifteen test cases that I built myself, one cloud, one AI model and one prompt. I also chose some cases where scanner rules were weak, which makes the AI look better. As Ding and colleagues warn, test sets like this can flatter AI. Comments in my test files may have given the AI hints. And the scoring was done once, without a second person.

My biggest lesson came from my own mistake. Results I first thought were independent were not. Fixing that cost time, but it saved the study. Now I only trust a result when I can link it to a run, a commit and the raw output.

Overall, all four objectives were met, within the limits of this sample.

## Slide 10: Conclusion: an advisor beside scanners, not a gate

*About 1:10 · 13:00 in total by the end of this slide*

So, can AI improve the security review of infrastructure code? On these fifteen cases, my answer is a qualified yes. The AI found everything the scanners found, plus three problems they missed. But its mistakes were less predictable. So it should support the scanners, not replace them, and it should not decide which changes get merged.

My recommendations are on the left: let the scanners enforce and the AI advise, use more than one scanner, treat comments as untrusted, show uncertain findings, test every AI fix automatically, and review changes that only delete files.

For future work, I would test real-world Terraform changes, run many more reviews across different AI models, study comment manipulation on purpose, and test the feedback with real developers.

The references are on this slide, and the code and evidence are on GitHub. Thank you for listening.

## Recording in PowerPoint

1. Slide Show > Rehearse Timings, to check the total is between 10 and 15 minutes.
2. Record > From Beginning (on a Mac: Slide Show > Record Slide Show). Your notes appear at the top of the recording window.
3. File > Export > Create a Video > Full HD (1080p) > Use Recorded Timings and Narrations > Create Video, and save it as MP4.
4. Play the MP4 on a Windows PC to check the sound and length, then upload it to the Canvas presentation link.
