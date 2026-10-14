"""Wording fixes agreed with AB on 14 Oct (review of ChatGPT comments 2-4), preserving run formatting.
Usage: python3 edit_v4.py in.docx out.docx changelog.json"""
import sys, json
import docx
from docx.oxml.ns import qn

src, dst, logf = sys.argv[1:4]
d = docx.Document(src)
LOG, FAIL = [], []
XMLSPACE = '{http://www.w3.org/XML/1998/namespace}space'


def tnodes(p_el):
    return [t for t in p_el.iter(qn('w:t'))]


def ptext(p_el):
    return ''.join(t.text or '' for t in tnodes(p_el))


def replace_in(p_el, old, new):
    """Replace the first occurrence of old in the paragraph text, editing w:t nodes in place
    so the formatting of the first affected run is kept."""
    ts = tnodes(p_el); full = ''.join(t.text or '' for t in ts)
    i = full.find(old)
    if i < 0:
        return False
    j = i + len(old); pos = 0; first = True
    for t in ts:
        s = t.text or ''; a, b = pos, pos + len(s); pos = b
        if b <= i or a >= j:
            continue
        lo, hi = max(i, a) - a, min(j, b) - a
        if first:
            t.text = s[:lo] + new + s[hi:]; first = False
        else:
            t.text = s[:lo] + s[hi:]
        t.set(XMLSPACE, 'preserve')
    return True


def body_pars():
    """Every paragraph in the document body, including tables, excluding nothing (captions included)."""
    return list(d.element.body.iter(qn('w:p')))


def rep(section, contains, old, new, why):
    m = [p for p in body_pars() if contains in ptext(p)]
    if len(m) != 1:
        FAIL.append(f'{section}: {contains[:50]!r} matched {len(m)} paragraphs'); return
    p = m[0]; before = ptext(p).strip()
    if not replace_in(p, old, new):
        FAIL.append(f'{section}: {old[:50]!r} not found'); return
    LOG.append((section, why, before, ptext(p).strip()))


WHY_POSTED = '“Confirmed” is the AI’s own status label; in the abstract and conclusion it read as “verified true”'
WHY_RERUN = 'Only TC01–TC12 had earlier scanner-informed runs; TC13–TC15 were only ever run independently'

# Abstract
rep('Abstract', 'Infrastructure-as-Code lets cloud misconfigurations be caught',
    'every case was rerun with the AI working independently', 'every case was run with the AI working independently', WHY_RERUN)
rep('Abstract', 'Infrastructure-as-Code lets cloud misconfigurations be caught',
    'and 7 of 45 confirmed findings were classified as false, although three of these reflected weaknesses in the test fixtures.',
    'and 7 of the 45 findings it posted were classified as false, although three reflected weaknesses in the test fixtures.',
    WHY_POSTED + ' (abstract kept at 249 words)')
# 1.4
rep('1.4', 'When I verified the evidence, I found that early AI results had been influenced',
    'so I ran every case again with the AI working independently', 'so I corrected the workflow and ran every case with the AI working independently', WHY_RERUN)
# 3.6 definition
rep('3.6', 'Individual confirmed AI findings were labelled separately as:',
    'Individual confirmed AI findings were labelled separately as:',
    'Each finding the AI marked as CONFIRMED, the only status posted to the pull request, was labelled against the ground truth as:',
    'Defines “confirmed finding” once, where the labels are introduced')
# 4.3 text and Table 4.1 caption
rep('4.3', 'Table 4.1 shows how the AI’s 45 confirmed findings divide.',
    'Table 4.1 shows how the AI’s 45 confirmed findings divide.',
    'Table 4.1 shows how the 45 findings the AI posted as confirmed divide against the ground truth.', WHY_POSTED)
rep('Table 4.1', 'AI confirmed findings across 46 independent runs',
    'AI confirmed findings across 46 independent runs', 'Findings the AI posted as confirmed across 46 independent runs', WHY_POSTED)
# 5.1 and 5.4
rep('5.1', 'That discovery led to a change in the workflow and a complete rerun.',
    'a complete rerun.', 'a full set of independent runs.', WHY_RERUN)
rep('5.4', 'Rerunning everything cost time late in the project.',
    'Rerunning everything cost time late in the project.', 'Correcting this cost time late in the project.', WHY_RERUN)
# 6.1 conclusion: both readings of the false findings, pre-set ground truth kept
rep('6.1', 'it raised findings against acceptable configurations in a third of runs on those cases',
    'in a third of runs on those cases', 'in three of the nine runs on those cases',
    'Exact count, matching the alternative reading given in the next point')
rep('6.1', 'seven of its 45 confirmed findings were classified as false',
    'seven of its 45 confirmed findings were classified as false, giving a precision of 82%. Three of these accurately described a weakness in the test fixtures, and treating them as valid raises precision to 89%.',
    'seven of the 45 findings it posted were classified as false against the ground truth fixed before the runs, a precision of 82%. '
    'I kept that classification, but three of the seven accurately described a weakness in my test fixtures. '
    'Counting them as valid gives 89% and leaves two of the nine acceptable-case runs with a false finding, not three. '
    'The other four all wrongly claimed that resources which cannot be tagged must carry tags.',
    'Both readings of the false findings shown; the ground truth fixed in advance is kept; the seven are not treated as equivalent errors')

if FAIL:
    print('FAILURES:'); [print(' -', f) for f in FAIL]; sys.exit(1)
d.save(dst)
json.dump(LOG, open(logf, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print(len(LOG), 'edits applied')
