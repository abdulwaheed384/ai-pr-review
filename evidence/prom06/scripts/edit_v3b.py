import sys, json, docx
sys.argv=[sys.argv[0],'stage1.docx','stage2.docx','changes.json']
src,dst,logf=sys.argv[1:4]
exec(open('/tmp/claude-0/-home-claude-ai-pr-review/8123617a-09e1-5f82-8592-b520c5c856e4/scratchpad/edit_v3.py').read().split('# ================================================================== DECLARATION')[0].replace("src, dst, logf = sys.argv[1:4]\nd = docx.Document(src)","d = docx.Document(src)"))
prev=json.load(open(logf))
rep('2.5','On repair, Pearce et al.\xa0(2023)','They also show that proposed fixes must be validated, not assumed to work.','They also show that a proposed fix has to be tested before it can be trusted.','Plainer wording')
rep('References','McIntosh, S., Kamei, Y., Adams, B. and Hassan, A.E. (2016)','pp.\xa02146–2189.','pp.\xa02146–2189. doi:10.1007/s10664-015-9381-9.','DOI verified (Crossref)')
rep('References','Tufano, R., Masiero, S.','pp.\xa02291–2302.','pp.\xa02291–2302. doi:10.1145/3510003.3510621.','DOI verified (Crossref)')
d.save(dst)
prev['log']+=LOG; prev['fail']=[f for f in prev['fail'] if 'Bridgecrew' not in f and 'Pearce' not in f and 'McIntosh' not in f and 'Tufano' not in f]+FAIL
json.dump(prev,open(logf,'w'),ensure_ascii=False,indent=1)
print('added',len(LOG),'fail',FAIL)
