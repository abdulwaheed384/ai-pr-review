import re,subprocess,sys
def lines(pdf):
    out=subprocess.run(['pdftotext','-bbox-layout',pdf,'-'],capture_output=True,text=True).stdout
    res=[]
    for pi,p in enumerate(out.split('<page ')[1:],1):
        for m in re.finditer(r'<line xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)</line>',p,re.S):
            w=' '.join(re.findall(r'>([^<]+)</word>',m.group(5)))
            res.append((pi,float(m.group(2)),float(m.group(4)),w))
    return res
if __name__=='__main__':
    for pi,y0,y1,w in lines(sys.argv[1]):
        if any(k in w for k in sys.argv[2:]): print(pi,round(y0),round(y1),w[:90])
