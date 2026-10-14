import sys, docx
def count(path):
    d=docx.Document(path); mode=None; w=0; ab=0
    for p in d.paragraphs:
        t=p.text.strip(); st=p.style.name
        if t=='Abstract' and mode is None: mode='abs'; continue
        if st=='Heading 1':
            if t=='Introduction': mode='body'
            elif t=='Reference List': break
        if st in('Image Caption','Table Caption','Captioned Figure') or st.lower().startswith('toc'): continue
        if not t: continue
        n=len(t.split())
        if mode=='abs': ab+=n
        elif mode=='body': w+=n
    return ab, w
if __name__=='__main__':
    ab,w=count(sys.argv[1]); print('abstract',ab,'chapters',w,'total',ab+w)
