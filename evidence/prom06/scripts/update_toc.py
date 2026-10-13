"""Open a .docx in headless LibreOffice, update all indexes (TOC, lists), save as .docx and export PDF."""
import sys, time, subprocess, tempfile, os
sys.path.insert(0, "/root/.claude/skills/synced/cf0d7e50-8ae6-43ed-88bb-6aa4d7cd8ece_6a9848f8-e8b6-4a18-80e9-e09e49605f83/docx/scripts")
from office.soffice import get_soffice_env
import uno
from com.sun.star.beans import PropertyValue

src, out_docx, out_pdf = [os.path.abspath(p) for p in sys.argv[1:4]]
prof = tempfile.mkdtemp()
env = get_soffice_env()
proc = subprocess.Popen(["soffice", "--headless", "--invisible", "--nologo", "--norestore", f"-env:UserInstallation=file://{prof}",
                         "--accept=socket,host=127.0.0.1,port=2002;urp;"], env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
local = uno.getComponentContext()
resolver = local.ServiceManager.createInstanceWithContext("com.sun.star.bridge.UnoUrlResolver", local)
ctx = None
for _ in range(60):
    try:
        ctx = resolver.resolve("uno:socket,host=127.0.0.1,port=2002;urp;StarOffice.ComponentContext"); break
    except Exception:
        time.sleep(1)
desktop = ctx.ServiceManager.createInstanceWithContext("com.sun.star.frame.Desktop", ctx)
def P(n, v):
    p = PropertyValue(); p.Name = n; p.Value = v; return p
doc = desktop.loadComponentFromURL(uno.systemPathToFileUrl(src), "_blank", 0, (P("Hidden", True),))
for _ in range(2):
    idx = doc.getDocumentIndexes()
    for i in range(idx.getCount()):
        idx.getByIndex(i).update()
    doc.refresh()
doc.storeToURL(uno.systemPathToFileUrl(out_docx), (P("FilterName", "MS Word 2007 XML"),))
doc.storeToURL(uno.systemPathToFileUrl(out_pdf), (P("FilterName", "writer_pdf_Export"),))
doc.close(True)
try:
    desktop.terminate()
except Exception:
    pass
proc.wait(timeout=30)
print("ok")
