import sys
from openpyxl import load_workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
P="/home/claude/prom06-outputs/PROM06_TC01-TC12_Verified_Results_Matrix.xlsx"
wb=load_workbook(P)
for s in ("AI Quality Scoring","Scoring Rules","Inter-rater Check"):
    if s in wb.sheetnames: del wb[s]
F="Arial"
H=Font(name=F,bold=True,color="FFFFFF"); HF=PatternFill("solid",fgColor="1F3864")
B=Font(name=F); BB=Font(name=F,bold=True); TI=Font(name=F,bold=True,size=14); IT=Font(name=F,italic=True)
BLUE=Font(name=F,color="0000FF")
thin=Side(style="thin",color="BFBFBF"); BOR=Border(left=thin,right=thin,top=thin,bottom=thin)
WR=Alignment(wrap_text=True,vertical="top")
def hdr(ws,row,cols,widths):
    for j,(c,w) in enumerate(zip(cols,widths),1):
        x=ws.cell(row=row,column=j,value=c); x.font=H; x.fill=HF; x.alignment=Alignment(wrap_text=True,vertical="center"); x.border=BOR
        ws.column_dimensions[get_column_letter(j)].width=w

# ---------------- Scoring Rules ----------------
sr=wb.create_sheet("Scoring Rules")
sr.column_dimensions["A"].width=24; sr.column_dimensions["B"].width=55; sr.column_dimensions["C"].width=45; sr.column_dimensions["D"].width=45
sr["A1"]="AI explanation and remediation quality — operational scoring rules"; sr["A1"].font=TI
sr["A2"]=("Rubric dimensions and 0–2 scale come from the TC01–TC12 Ground-Truth Matrix (remediation-quality rubric). "
          "The operational definitions below were written on 13 Oct 2026 to make the rubric applicable consistently. "
          "They were written AFTER the AI outputs had been read, by an AI assistant (Claude) acting as scorer; see the disclosure at the bottom.")
sr["A2"].font=IT; sr["A2"].alignment=WR; sr.merge_cells("A2:D3"); sr.row_dimensions[2].height=30
hdr(sr,5,["Dimension","2 = full","1 = partial","0 = none / wrong"],[24,55,45,45])
rules=[
 ("D  Detection correctness (vulnerable case)","Target condition raised as CONFIRMED on the correct resource.","Target raised but as NEEDS_CONTEXT (hidden from PR comment), or only partly identified.","Target not raised, classified FALSE_POSITIVE, or run failed validation."),
 ("D  Detection correctness (non-vulnerable case)","No confirmed finding against the acceptable configuration.","Only a LOW or unrelated confirmed finding.","Blocks (fails the gate on) the acceptable configuration."),
 ("E  Explanation accuracy","Every technical and policy claim is correct.","Contains one or more inaccurate claims, or maps the finding to an inapplicable policy (e.g. SEC-001 'public exposure' applied to IAM, TLS or secrets; tags claimed on a non-taggable resource type).","Core explanation materially wrong."),
 ("I  Impact explanation","Specific consequence for this configuration (who can reach/do what).","Generic or partly inaccurate impact.","Missing."),
 ("R  Remediation quality","Correct, actionable, addresses the root cause and would yield the ground-truth secure state.","Partly correct, or misses part of the secure state, or adds questionable advice.","Wrong or absent."),
 ("C  Context awareness","Correctly uses related resources/files (associations, requirements, other files).","Some context used but incomplete or misread.","Ignores relevant context."),
 ("U  Developer usefulness","A developer could act on the PR comment immediately; no noise.","Useful but with noise: extra false or duplicate CONFIRMED findings.","Misleading or useless in the PR comment: target hidden (NEEDS_CONTEXT is not shown), run failed, or legitimate configuration blocked."),
]
for i,r in enumerate(rules,6):
    for j,v in enumerate(r,1):
        c=sr.cell(row=i,column=j,value=v); c.font=BB if j==1 else B; c.alignment=WR; c.border=BOR
    sr.row_dimensions[i].height=60
notes=[
 "Scope: vulnerable cases (TC02–TC11, TC13, TC15) are scored on all six dimensions (max 12). Non-vulnerable cases (TC01, TC12, TC14) are scored on D, E and U only (max 6); I, R and C are 'n/a'.",
 "Each run is scored separately (3 runs per case; 4 for TC08 because one PR run failed validation and a fourth dispatch was made).",
 "Only the AI output of the INDEPENDENT condition is scored (scanner_findings_supplied_to_ai = false). Hybrid (Condition C) outputs are not scored here.",
 "Policy mis-mapping is penalised under E only (not U) to avoid double counting; it is also flagged separately in column O of 'AI Quality Scoring' so analysis can exclude it.",
 "Disclosure / validity threat: the scorer is an AI assistant that read all outputs before writing these rules. To mitigate, AB should independently score the stratified sample on 'Inter-rater Check' before results are reported; agreement is calculated there.",
 "TC13–TC15 (added 13 Oct 2026) were scored from their ai_output.json artefacts after AB downloaded them (13 Oct, 15:50), using the same rules.",
]
r0=6+len(rules)+1
sr.cell(row=r0,column=1,value="Application notes").font=BB
for k,n in enumerate(notes,r0+1):
    c=sr.cell(row=k,column=1,value=f"{k-r0}. {n}"); c.font=B; c.alignment=WR; sr.merge_cells(start_row=k,start_column=1,end_row=k,end_column=4); sr.row_dimensions[k].height=32

# ---------------- AI Quality Scoring ----------------
ws=wb.create_sheet("AI Quality Scoring")
cols=["TC","Run","Run ID","Event","Ground truth","Target status in AI output","D","E","I","R","C","U","Total","Max","Score %","Policy mis-map?","Noise in PR comment?","Scorer justification"]
hdr(ws,1,cols,[6,5,13,16,13,24,5,5,5,5,5,5,7,6,8,10,11,90])
V="Vulnerable"; N="Not vulnerable"; NA="n/a"
runs=[
("TC01",1,38404582550,"pull_request",N,"No confirmed findings",2,2,NA,NA,NA,2,"N","N","Clean. One FALSE_POSITIVE informational note (DNS zone name split) correctly dismissed; not shown in PR comment."),
("TC01",2,38405003190,"workflow_dispatch",N,"No findings",2,2,NA,NA,NA,2,"N","N","Clean; no findings."),
("TC01",3,38405111880,"workflow_dispatch",N,"No confirmed findings",2,2,NA,NA,NA,2,"N","N","Clean. Three FALSE_POSITIVE informational notes, all correct dismissals (outbound deny, DDoS not applicable, NSG association present)."),
("TC02",1,38404584887,"pull_request",V,"CONFIRMED",2,2,2,2,2,2,"N","N","SSH 22 from 0.0.0.0/0 identified on the correct rule; specific internet brute-force impact; restrict source to approved CIDR/Bastion; uses NSG–subnet association."),
("TC02",2,38405012851,"workflow_dispatch",V,"CONFIRMED",2,2,2,2,2,2,"N","N","As run 1; accurate and actionable."),
("TC02",3,38405121064,"workflow_dispatch",V,"CONFIRMED",2,2,2,2,2,2,"N","N","As run 1; accurate and actionable."),
("TC03",1,38404589228,"pull_request",V,"CONFIRMED",2,2,2,2,2,2,"N","N","RDP 3389 from any source; SEC-001 mapping appropriate (public exposure); remediation restricts source / Bastion."),
("TC03",2,38405022162,"workflow_dispatch",V,"CONFIRMED",2,2,2,2,2,2,"N","N","As run 1."),
("TC03",3,38405130215,"workflow_dispatch",V,"CONFIRMED",2,2,2,2,2,1,"N","Y","Target correct, but a second CONFIRMED HIGH finding (F-002 'SEC-001 violation') duplicates F-001 — duplicate noise in the PR comment."),
("TC04",1,38404592498,"pull_request",V,"CONFIRMED",2,2,1,1,2,2,"N","N","HTTP 80 from any source identified; impact framed as generic exposure with no reference to unencrypted HTTP; remediation restricts source only, no HTTPS/redirect alternative."),
("TC04",2,38405031009,"workflow_dispatch",V,"CONFIRMED",2,2,1,1,2,2,"N","N","As run 1 (no unencrypted-transport reasoning, no HTTPS alternative)."),
("TC04",3,38405139458,"workflow_dispatch",V,"CONFIRMED",2,2,1,1,2,2,"N","N","As run 1."),
("TC05",1,38404594354,"pull_request",V,"CONFIRMED",2,2,2,2,2,2,"N","N","Missing subnet–NSG association found by cross-file reasoning (NSG exists, no association). Extra NEEDS_CONTEXT LOW note on DNS comment, not shown in PR comment."),
("TC05",2,38405039302,"workflow_dispatch",V,"CONFIRMED",2,2,2,2,2,2,"N","N","As run 1."),
("TC05",3,38405149036,"workflow_dispatch",V,"CONFIRMED",2,2,2,2,2,2,"N","N","As run 1 (severity MEDIUM rather than HIGH; does not affect rubric)."),
("TC06",1,38404596950,"pull_request",V,"CONFIRMED",2,2,2,2,2,2,"N","N","Public DNS resolver on VNet mapped correctly to NET-002; remediation: Azure-provided or internal DNS."),
("TC06",2,38405047995,"workflow_dispatch",V,"CONFIRMED",2,2,2,2,2,2,"N","N","As run 1."),
("TC06",3,38405157604,"workflow_dispatch",V,"CONFIRMED",2,2,2,2,2,2,"N","N","As run 1."),
("TC07",1,38404600206,"pull_request",V,"CONFIRMED",2,1,2,2,2,2,"Y","N","min_tls_version TLS1_0 correctly identified with TLS1_2 remediation. TLS finding mapped to SEC-001 (public exposure) — inapplicable; no encryption policy exists in ai/policy.md. Tag finding (owner, cost-center missing) is correct."),
("TC07",2,38405057461,"workflow_dispatch",V,"CONFIRMED",2,1,2,2,2,2,"Y","N","As run 1 (SEC-001 mis-mapping; tag finding correct)."),
("TC07",3,38405166219,"workflow_dispatch",V,"CONFIRMED",2,1,2,2,2,2,"Y","N","As run 1 (SEC-001 mis-mapping; tag finding correct)."),
("TC08",1,38404605125,"pull_request",V,"FALSE_POSITIVE (run failed validation)",0,1,1,2,1,0,"N","N","Missing NSG diagnostic setting raised but classified FALSE_POSITIVE while mapped to LOG-001; validate_review rejected output, run failed. Summary misreads the comment as stating the omission is intentional. Recommendation itself correct. No PR comment produced."),
("TC08",2,38405066857,"workflow_dispatch",V,"NEEDS_CONTEXT",1,2,2,2,2,0,"N","N","Explanation, impact and remediation (diagnostic setting with both NSG categories) accurate, but NEEDS_CONTEXT is not shown in the PR comment, so the developer sees no finding."),
("TC08",3,38405174844,"workflow_dispatch",V,"NEEDS_CONTEXT",1,2,2,2,2,0,"N","N","As run 2."),
("TC08",4,38405218950,"workflow_dispatch",V,"CONFIRMED",2,2,2,2,2,2,"N","N","CONFIRMED and mapped to LOG-001 with a complete azurerm_monitor_diagnostic_setting example."),
("TC09",1,38404607277,"pull_request",V,"CONFIRMED",2,1,1,2,2,2,"N","N","Hard-coded credential in local found (scanners missed it). Claims the unused local would appear in state/plan — inaccurate for an unreferenced local. Remediation (Key Vault / sensitive variable, rotate) correct."),
("TC09",2,38405075984,"workflow_dispatch",V,"CONFIRMED",2,1,1,2,2,2,"Y","N","As run 1, plus mapped to SEC-001 (public exposure) — inapplicable to secrets."),
("TC09",3,38405183161,"workflow_dispatch",V,"CONFIRMED",2,1,1,2,2,2,"Y","N","As run 2."),
("TC10",1,38404612132,"pull_request",V,"CONFIRMED",2,1,2,1,2,1,"N","Y","Wildcard Actions at subscription scope correctly identified. Second CONFIRMED finding claims azurerm_role_definition needs TAG-001 tags — resource is not taggable (false positive). Remediation includes questionable lifecycle advice."),
("TC10",2,38405084901,"workflow_dispatch",V,"CONFIRMED",2,1,2,2,2,2,"Y","N","Target correct; mapped to SEC-001 (public exposure) — inapplicable to IAM."),
("TC10",3,38405192342,"workflow_dispatch",V,"CONFIRMED",2,1,2,2,2,1,"Y","Y","Target correct; SEC-001 mis-mapping plus false TAG-001 finding on non-taggable role definition."),
("TC11",1,38404613836,"pull_request",V,"CONFIRMED",2,1,2,2,2,2,"Y","N","Wildcard custom role vs documented least-privilege task requirement in another file identified; SEC-001 mis-mapping. (Construct not isolated: wildcard alone also triggers Checkov CKV_AZURE_39.)"),
("TC11",2,38405093864,"workflow_dispatch",V,"CONFIRMED",2,1,2,2,2,2,"Y","N","As run 1; explicitly compares against documented task requirements."),
("TC11",3,38405200842,"workflow_dispatch",V,"CONFIRMED",2,2,2,2,2,2,"N","N","As run 2, without policy mis-mapping."),
("TC12",1,38404619147,"pull_request",N,"CONFIRMED HIGH (blocks)",0,1,NA,NA,NA,0,"N","Y","Legitimate public HTTPS treated as HIGH vulnerability; gate blocked (score 50). Also claims azurerm_network_security_rule supports tags (false)."),
("TC12",2,38405103514,"workflow_dispatch",N,"CONFIRMED LOW (tag) only",1,1,NA,NA,NA,1,"N","Y","HTTPS exposure correctly not confirmed (destination-scope note as NEEDS_CONTEXT). Confirmed LOW TAG-001 finding is false: network security rules are not taggable."),
("TC12",3,38405210047,"workflow_dispatch",N,"No confirmed findings",2,2,NA,NA,NA,2,"N","N","Correctly accepted; correctly states rules are not taggable. Caveat: cites the fixture comment 'Ground truth: public TCP/443 ingress is intentional' — the test file cues the answer."),
("TC13",1,38409744211,"pull_request",V,"CONFIRMED",2,2,2,2,2,2,"N","N","Contributor at subscription vs Reader-on-RG requirement identified by cross-file reasoning (tc13_requirements.tf); exact remediation (Reader, resource-group scope). No policy mapping."),
("TC13",2,38409804722,"workflow_dispatch",V,"CONFIRMED",2,1,2,2,2,2,"N","N","Target and fix correct, but claims Contributor can modify role assignments; Contributor excludes Microsoft.Authorization write/delete actions (NotActions)."),
("TC13",3,38409830032,"workflow_dispatch",V,"CONFIRMED",2,1,2,2,2,2,"N","N","Target and fix correct; impact lists 'IAM assignments' among what Contributor can modify — inaccurate (Microsoft.Authorization write excluded)."),
("TC14",1,38409748586,"pull_request",N,"CONFIRMED LOW (wildcard destination)",1,2,NA,NA,NA,1,"N","Y","Restricted SSH correctly not treated as public exposure, but a hardening suggestion was CONFIRMED at LOW; ground truth TC14-GT-01 says no confirmed finding."),
("TC14",2,38409813127,"workflow_dispatch",N,"No confirmed findings",2,2,NA,NA,NA,2,"N","N","Accepted; NEEDS_CONTEXT LOW note asking to confirm the address is a managed bastion (hidden from PR comment) — reasonable."),
("TC14",3,38409838825,"workflow_dispatch",N,"No confirmed findings",2,2,NA,NA,NA,2,"N","N","Accepted; NEEDS_CONTEXT MEDIUM note on bastion ownership plus correct FALSE_POSITIVE dismissals (outbound deny, log quota)."),
("TC15",1,38409752049,"pull_request",V,"CONFIRMED",2,2,2,2,2,2,"N","N","Hard-coded default password found (scanners missed it). Accurate impact (repository/history exposure); remediation: remove default, sensitive = true, secret store, rotate, purge history."),
("TC15",2,38409821867,"workflow_dispatch",V,"CONFIRMED",2,1,2,2,2,2,"N","N","Target and remediation correct; states the default 'will appear in the Terraform state file' — inaccurate for an unreferenced variable (state holds resource attributes, not variable defaults)."),
("TC15",3,38409847744,"workflow_dispatch",V,"CONFIRMED",2,2,2,2,2,2,"N","N","Target correct; correctly qualifies that values reach state only when consumed by a resource; remediation complete (no default, sensitive, secret store, rotate)."),
]
for i,r in enumerate(runs,2):
    tc,rn,rid,ev,gt,st,D,E,I,R,C,U,pm,nz,just=r
    vals=[tc,rn,str(rid),ev,gt,st,D,E,I,R,C,U,f"=SUM(G{i}:L{i})",f'=IF(E{i}="Vulnerable",12,6)',f"=M{i}/N{i}",pm,nz,just]
    for j,v in enumerate(vals,1):
        c=ws.cell(row=i,column=j,value=v); c.border=BOR; c.alignment=WR if j in (6,18) else Alignment(vertical="top",horizontal="center" if 7<=j<=17 else None)
        c.font=BLUE if 7<=j<=12 else B
    ws.cell(row=i,column=15).number_format="0%"
last=len(runs)+1
ws.freeze_panes="C2"; ws.auto_filter.ref=f"A1:R{last}"
ws.cell(row=last+1,column=1,value="Blue = scorer input (0–2). Totals and percentages are formulas. Source: ai_output.json in each prom06-INDEPENDENT-<run_id> artefact; rules on 'Scoring Rules'.").font=IT

# Summary block
s=last+3
ws.cell(row=s,column=1,value="Summary (formulas)").font=TI
hdr_row=s+1
for j,c in enumerate(["Measure","","","","","","D","E","I","R","C","U","","","Score %"],1):
    if c or j==1:
        x=ws.cell(row=hdr_row,column=j,value=c); x.font=H; x.fill=HF
rng=lambda col:f"{col}$2:{col}${last}"
GT=rng("$E")
rows=[("Mean — vulnerable runs (TC02–TC11, TC13, TC15)",'"Vulnerable"'),("Mean — non-vulnerable runs (TC01, TC12, TC14)",'"Not vulnerable"')]
for k,(lab,crit) in enumerate(rows,hdr_row+1):
    ws.cell(row=k,column=1,value=lab).font=BB
    for col in "GHIJKL":
        if crit=='"Not vulnerable"' and col in "IJK":
            ws[f"{col}{k}"]="n/a"; continue
        ws[f"{col}{k}"]=f"=AVERAGEIFS({col}$2:{col}${last},{GT},{crit})"; ws[f"{col}{k}"].number_format="0.00"
    ws[f"O{k}"]=f"=AVERAGEIFS(O$2:O${last},{GT},{crit})"; ws[f"O{k}"].number_format="0%"
k=hdr_row+3
ws.cell(row=k,column=1,value="Runs with policy mis-mapping").font=BB; ws[f"G{k}"]=f'=COUNTIF(P$2:P${last},"Y")&" of "&COUNTA(P$2:P${last})'
ws.cell(row=k+1,column=1,value="Runs with noise in PR comment").font=BB; ws[f"G{k+1}"]=f'=COUNTIF(Q$2:Q${last},"Y")&" of "&COUNTA(Q$2:Q${last})'
ws.cell(row=k+2,column=1,value="Vulnerable runs scoring 2 on every dimension").font=BB; ws[f"G{k+2}"]=f'=SUMPRODUCT(({GT}="Vulnerable")*(M$2:M${last}=12))&" of "&COUNTIF({GT},"Vulnerable")'
# per-TC
t=k+4
ws.cell(row=t,column=1,value="Per test case").font=TI
for j,c in enumerate(["TC","Runs","Mean D","Mean E","Mean U","Mean R (vuln.)","Mean score %","Min score %"],1):
    x=ws.cell(row=t+1,column=j,value=c); x.font=H; x.fill=HF
tcs=sorted({r[0] for r in runs})
for q,tc in enumerate(tcs,t+2):
    ws.cell(row=q,column=1,value=tc).font=BB
    A=f"$A$2:$A${last}"
    ws.cell(row=q,column=2,value=f'=COUNTIF({A},A{q})')
    for col,src in ((3,"G"),(4,"H"),(5,"L")):
        c=ws.cell(row=q,column=col,value=f"=AVERAGEIF({A},A{q},{src}$2:{src}${last})"); c.number_format="0.00"
    c=ws.cell(row=q,column=6,value=f'=IFERROR(AVERAGEIF({A},A{q},J$2:J${last}),"n/a")'); c.number_format="0.00"
    c=ws.cell(row=q,column=7,value=f"=AVERAGEIF({A},A{q},O$2:O${last})"); c.number_format="0%"
    c=ws.cell(row=q,column=8,value=f'=_xlfn.MINIFS(O$2:O${last},{A},A{q})'); c.number_format="0%"

# ---------------- Inter-rater Check ----------------
ir=wb.create_sheet("Inter-rater Check")
ir["A1"]="Inter-rater check — AB to score independently"; ir["A1"].font=TI
ir["A2"]=("How to use: before looking at the 'AI Quality Scoring' sheet, open each run's ai_output.json (or PR comment) and the ground truth, apply 'Scoring Rules', "
          "and type your 0–2 scores in the yellow cells (columns D–I; leave I/R/C blank for TC01/TC12). Agreement updates automatically. Sample: 10 of 37 runs, stratified to include clean, partial, failed and false-positive cases.")
ir["A2"].font=IT; ir["A2"].alignment=WR; ir.merge_cells("A2:R3"); ir.row_dimensions[2].height=45
ir["A4"]="Example of the expected format (not part of the sample): TC02 run 1 → D 2, E 2, I 2, R 2, C 2, U 2."; ir["A4"].font=IT
cols2=["TC","Run","Run ID","AB: D","AB: E","AB: I","AB: R","AB: C","AB: U","AI scorer: D","E","I","R","C","U","Exact matches","Dimensions scored","Within 1 point"]
hdr(ir,6,cols2,[6,5,13,7,7,7,7,7,7,10,6,6,6,6,6,10,11,10])
sample=[("TC02",1),("TC04",2),("TC07",1),("TC08",1),("TC08",4),("TC09",2),("TC10",1),("TC11",3),("TC12",1),("TC12",2)]
Y=PatternFill("solid",fgColor="FFFF00")
for i,(tc,rn) in enumerate(sample,7):
    idx=next(n for n,r in enumerate(runs,2) if r[0]==tc and r[1]==rn)
    ir.cell(row=i,column=1,value=tc); ir.cell(row=i,column=2,value=rn); ir.cell(row=i,column=3,value=f"='AI Quality Scoring'!C{idx}")
    for j in range(4,10):
        c=ir.cell(row=i,column=j); c.fill=Y; c.border=BOR
    for j,col in enumerate("GHIJKL",10):
        ir.cell(row=i,column=j,value=f"='AI Quality Scoring'!{col}{idx}").font=Font(name=F,color="008000")
    ex="+".join([f'IF(AND(ISNUMBER({a}{i}),ISNUMBER({b}{i})),--({a}{i}={b}{i}),0)' for a,b in zip("DEFGHI",["J","K","L","M","N","O"])])
    sc="+".join([f'--AND(ISNUMBER({a}{i}),ISNUMBER({b}{i}))' for a,b in zip("DEFGHI",["J","K","L","M","N","O"])])
    w1="+".join([f'IF(AND(ISNUMBER({a}{i}),ISNUMBER({b}{i})),--(ABS({a}{i}-{b}{i})<=1),0)' for a,b in zip("DEFGHI",["J","K","L","M","N","O"])])
    ir.cell(row=i,column=16,value="="+ex); ir.cell(row=i,column=17,value="="+sc); ir.cell(row=i,column=18,value="="+w1)
    for j in range(1,19):
        x=ir.cell(row=i,column=j); x.border=BOR
        if x.font.color is None or j<4 or j>15: x.font=B
e=7+len(sample)
ir.cell(row=e+1,column=1,value="Exact agreement").font=BB
ir.cell(row=e+1,column=4,value=f'=IF(SUM(Q7:Q{e-1})=0,"not yet scored",SUM(P7:P{e-1})/SUM(Q7:Q{e-1}))').number_format="0%"
ir.cell(row=e+2,column=1,value="Agreement within 1 point").font=BB
ir.cell(row=e+2,column=4,value=f'=IF(SUM(Q7:Q{e-1})=0,"not yet scored",SUM(R7:R{e-1})/SUM(Q7:Q{e-1}))').number_format="0%"
ir.cell(row=e+3,column=1,value="Green = linked from 'AI Quality Scoring'. Discuss and record any disagreement > 1 point before reporting; do not overwrite the original AI-scorer values.").font=IT

# order: put new sheets after Decisions & Caveats
order=wb.sheetnames
for name in ("Scoring Rules","AI Quality Scoring","Inter-rater Check"):
    wb.move_sheet(name, offset=order.index("Decisions & Caveats")+1-wb.sheetnames.index(name)+("Scoring Rules","AI Quality Scoring","Inter-rater Check").index(name))
wb.save(P); print("saved", wb.sheetnames)
