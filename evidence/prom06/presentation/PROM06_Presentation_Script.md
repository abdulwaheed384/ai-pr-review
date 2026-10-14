# PROM06 presentation: speaker script

A simple, slide-by-slide script for the 10-slide deck, in everyday words. It is about 1,650 words and takes about 13 minutes at a steady pace (125 words a minute), inside the 10–15 minute limit. The same text is in each slide’s speaker notes, so PowerPoint shows it while you record.

**Tips:** speak slowly, pause briefly between slides, and point to what is on screen. If a practice run goes over 14 minutes, leave out the optional demo on slide 4.

## Slide 1: Title and introduction

*About 0:45 · 0:45 in total by the end of this slide*

Hello, my name is Abdul Waheed. This is my PROM06 research project for the MSc in Computer Science with Cybersecurity at the University of Sunderland. My supervisor is Liz Gandy.

My project asks a simple question: can an AI tool help to find security problems in cloud code? I built a system where three tools check the same code: two well-known scanners, called Checkov and tfsec, and an AI reviewer. Then I compared their results.

I will explain why this matters, what I built, how I tested it, and what I found.

## Slide 2: Can an AI reviewer catch what scanners miss?

*About 1:30 · 2:15 in total by the end of this slide*

Today, cloud systems are often built with code, using a tool called Terraform. But if one line is insecure, for example a firewall rule that lets anyone on the internet connect, that mistake is copied everywhere the code is used. And keeping these settings safe is the customer’s job, not the cloud provider’s.

To catch these mistakes, teams use scanners. A scanner checks code against a list of rules. Scanners are fast, but they only find problems that are on their list. And developers often ignore warnings that are hard to understand.

AI reviewers can read all the code and explain problems in plain English. But they can be wrong while sounding sure, and they can give different answers to the same question.

So my aim was to find out how well an AI reviewer works, compared with these scanners. I asked four questions. How accurate is it? How good are its fixes? Will its comments help developers understand? And what problems come up in real use? My objectives were to read the research, build the system, test it fairly, and find its strengths and limits.

## Slide 3: How the literature shaped the study

*About 1:15 · 3:30 in total by the end of this slide*

The research I read shaped my design.

Johnson and colleagues found that developers stop using tools that give too many unclear warnings. So I also counted false alarms, and I scored how clear the explanations were.

Rahman and colleagues listed common security mistakes in this kind of code, like open network rules and passwords left in the code. Several of my tests use exactly these mistakes.

Some tools, like the one by Li and colleagues, give the scanner’s results to the AI. Then you cannot tell what the AI found by itself. So I kept my AI separate from the scanners.

Two more ideas came later, when my first results showed they mattered. AI can give different answers to the same question, so I ran every test three times. And AI fixes can be wrong, so I tried every fix and tested it again.

The gap is simple: there are very few fair comparisons of an AI reviewer with these scanners.

## Slide 4: What I built: three independent reviewers

*About 1:20 · 4:50 in total by the end of this slide*

This is the system I built, on GitHub.

When a developer wants to change the code, they open a pull request, which is a request to add their change. This starts an automatic job. First, it checks that the code is valid. It never builds anything in the real cloud.

Then three tools check the same code. Checkov and tfsec use fixed rules. My AI reviewer sends all the code, a short security policy and the project’s read-me file to Claude, the AI model, and asks for a clear answer with no more than three findings. Each tool posts its own comment, and no tool sees the others’ results.

On the right are real results from one test. Here, SSH, which is remote login, is open to the whole internet. Checkov found nothing, so it missed the problem. tfsec marked it as critical. The AI marked it as high, and explained the risk and the fix.

> Optional demo, about 30 seconds: open pull request 71 on GitHub and scroll through the three comments. (Not part of the spoken script.)

All my code and evidence are public on GitHub.

## Slide 5: How I tested it: fixed ground truth, repeated runs

*About 1:15 · 6:05 in total by the end of this slide*

This is how I tested it.

I wrote fifteen small Terraform tests. For each one, I wrote down the correct answer before running any tool. Twelve tests have a security problem. Three are safe on purpose, to see if a tool raises false alarms.

I ran each test three times. With one extra run after a failure, that made forty-six runs. I compared every result with the correct answer, and I scored the AI’s comments on six points that I fixed in advance. Then I tried the AI’s own fixes and tested them again.

One discovery changed my study. I found that in my early runs, the AI had seen the scanners’ results, so it was not a fair test. I fixed the system, then ran every test with the AI working alone, and checked all forty-six runs to prove it.

Everything was safe: fake passwords, nothing built in the real cloud, and no personal data.

## Slide 6: RQ1: the AI detected more than both scanners

*About 1:25 · 7:30 in total by the end of this slide*

Now the results. My first question was: how accurate is the AI?

There were twelve tests with a problem. Checkov found five, and tfsec found four. Together, the scanners found eight. The AI found eleven, and half-found one more: it saw that problem every time, but showed it to the developer only once.

Three things stand out. First, the AI found three problems that both scanners missed: two secrets left in the code, and a role with too much power. It spotted that role by comparing it with a separate file of requirements.

Second, the scanners hardly overlapped. Only one test was caught by both. And Checkov missed open internet access written as 0.0.0.0/0, but caught the same rule written as a star.

Third, the AI made a different kind of mistake. On the safe tests, three runs out of nine raised a problem. And of the forty-five problems it posted, 82 out of 100 were correct, or 89 if three findings about weaknesses in my own tests count as fair.

These numbers are only for my fifteen tests.

## Slide 7: RQ2 and RQ3: useful advice, but some false claims

*About 1:40 · 9:10 in total by the end of this slide*

My second question was: how good are the AI’s fixes? I did not just read them. I tried them.

All twelve fixes solved the problem and passed Terraform’s checks. For eight, a scanner also agreed the problem was gone. And when the AI checked its own fixed code, it no longer saw the problem in nine of the twelve.

But one piece of advice was wrong. The AI said a certain role needs tags, which are labels. When I followed that advice, Terraform gave the error you can see here, and the code broke.

My third question was: will the AI’s comments help developers understand the problem? To answer it, I looked closely at every AI comment and scored it. The chart shows the average scores, out of two.

The AI explained what was wrong, why it was dangerous and how to fix it, in plain English, about the exact code. The scanners gave only a rule number and one short line. So the AI’s comments are likely to help developers learn.

But there is a risk. The lowest score was for explanation accuracy. Sometimes the AI said something false while sounding sure, and a developer could learn the wrong thing. I scored the comments once, with AI help.

## Slide 8: RQ4: code comments changed the AI’s verdict

*About 1:35 · 10:45 in total by the end of this slide*

My fourth question was about problems in real use, and this was my most surprising finding.

On the left is the same fix, checked twice. The only difference is one comment. A comment is just a note for people. It does not change what the code does.

In version A, an old comment said “Deliberately unrestricted SSH access”. The AI gave its own fix a high-risk warning, and it quoted that comment. In version B, I only changed the comment, and the AI approved the fix with just a small note. Another test showed the same thing.

So one comment can change the AI’s decision, even when the code is the same. Greshake and colleagues call this indirect prompt injection, where text that the AI reads changes what it does. In a real team, anyone who can write a comment could influence it.

I found three more problems. The AI gave different answers to the same test. Some real problems were hidden from the developer. And changes that only deleted files were not checked by the AI at all. The good news is that it was fast: feedback came in under two minutes.

## Slide 9: Evaluation: what holds up, and its limits

*About 1:20 · 12:05 in total by the end of this slide*

So, how much can we trust these results?

Some findings are strong. Scanners only find what is on their list. The two scanners helped each other. The AI found problems that need the wider picture, but its mistakes were harder to predict.

There are real limits too. I used only fifteen tests that I wrote myself, with one cloud and one AI model. I chose some tests where scanners were weak, which makes the AI look better. Ding and colleagues warn that test sets like this can flatter AI. Comments in my tests may have given the AI hints. And I scored the results only once.

My biggest lesson came from my own mistake. Results I thought were fair were not. Fixing that took time, but it saved the study. Now I only trust a result when I can trace it back to the exact run and its raw output.

Overall, I met all four objectives, within the limits of this small test set.

## Slide 10: Conclusion: an advisor beside scanners, not a gate

*About 1:10 · 13:15 in total by the end of this slide*

So, can AI help to check cloud code for security problems? On my fifteen tests, the answer is yes, but with conditions. The AI found everything the scanners found, plus three problems they missed. But its mistakes were harder to predict. So it should work next to the scanners, not replace them, and it should not decide on its own which changes are accepted.

My advice is on the left: let the scanners enforce the rules and the AI give advice, use more than one scanner, treat code comments as untrusted, show the AI’s unsure findings, test every AI fix automatically, and check changes that only delete files.

Next, I would test real-world code, use more AI models, study comment tricks on purpose, and test the comments with real developers.

The references are on this slide, and my code is on GitHub. Thank you for listening.

## Recording in PowerPoint

1. Slide Show > Rehearse Timings, to check the total is between 10 and 15 minutes.
2. Record > From Beginning (on a Mac: Slide Show > Record Slide Show). Your notes appear at the top of the recording window.
3. File > Export > Create a Video > Full HD (1080p) > Use Recorded Timings and Narrations > Create Video, and save it as MP4.
4. Play the MP4 on a Windows PC to check the sound and length, then upload it to the Canvas presentation link.
