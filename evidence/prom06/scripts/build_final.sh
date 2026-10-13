set -e
F=/home/claude/prom06-outputs/final
cd /home/claude && python3 /tmp/claude-0/-home-claude-ai-pr-review/8123617a-09e1-5f82-8592-b520c5c856e4/scratchpad/assemble.py
cd $F && pandoc PROM06_Dissertation_full.md -f markdown+fenced_divs+raw_attribute -o stage1.docx
python3 /tmp/claude-0/-home-claude-ai-pr-review/8123617a-09e1-5f82-8592-b520c5c856e4/scratchpad/format_docx.py stage1.docx stage2.docx
timeout 300 python3 /tmp/claude-0/-home-claude-ai-pr-review/8123617a-09e1-5f82-8592-b520c5c856e4/scratchpad/update_toc.py stage2.docx PROM06_Dissertation_AbdulWaheed_209333039.docx PROM06_Dissertation_AbdulWaheed_209333039.pdf
pdfinfo PROM06_Dissertation_AbdulWaheed_209333039.pdf | grep Pages
