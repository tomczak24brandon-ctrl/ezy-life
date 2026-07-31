"""
Fix ALL unescaped single-quote JS syntax errors in string concatenation HTML builders.
Run node --check after each fix until clean.
"""
import re, time, subprocess, sys

src = r"C:\Users\BIG D\.openclaw\workspace\ezy-life\index.html"
check_js = r"C:\Users\BIG D\.openclaw\workspace\ezy-life\_check.js"

with open(src, 'r', encoding='utf-8') as f:
    c = f.read()

fixes = 0

# Fix 1: mcat-upload button - getElementById with single-quoted id built inside JS string
# Bad:  onclick="document.getElementById('mcat-upload-'+'+cat.id+').click()"
# Good: onclick="mcatUploadIcon(\\''+cat.id+'\\')
# Actually the cleanest fix is to use a helper function that's already there: mcatUploadIcon
BAD1 = """+'<button class="mcat-save-btn" onclick="document.getElementById('mcat-upload-'+'+cat.id+').click()" title="Upload custom icon" style="background:var(--surface2);color:var(--text2);font-size:11px">&#128247;</button>'"""
GOOD1 = """+'<button class="mcat-save-btn" onclick="mcatUploadIcon(\\'' + cat.id + '\\')" title="Upload custom icon" style="background:var(--surface2);color:var(--text2);font-size:11px">&#128247;</button>'"""

if BAD1 in c:
    c = c.replace(BAD1, GOOD1, 1)
    print("Fixed: mcat-upload getElementById -> mcatUploadIcon helper")
    fixes += 1
else:
    # Try finding it with flexible whitespace
    # Show context around line 2061 of the JS
    script_start = c.rfind('<script>')
    js = c[script_start+8:]
    lines = js.split('\n')
    target_line = lines[2060] if len(lines) > 2060 else ''
    print(f"BAD1 not found exactly. Line 2061 of JS: {repr(target_line)}")
    # Try to find and fix it by pattern
    m = re.search(r"document\.getElementById\('mcat-upload-'\+''\+cat\.id\+'\)\.click\(\)", c)
    if m:
        old = m.group(0)
        new = "mcatUploadIcon(''+cat.id+'')"
        c = c[:m.start()] + new + c[m.end():]
        print(f"Fixed via regex: {old!r} -> {new!r}")
        fixes += 1
    else:
        # Broader search
        idx = c.find("mcat-upload-'+'+cat.id")
        if idx >= 0:
            snippet = c[max(0,idx-80):idx+150]
            print(f"Context around mcat-upload: {repr(snippet)}")

# Write temp JS and check
script_start = c.rfind('<script>')
script_end = c.rfind('</script>')
js_block = c[script_start+8:script_end]
with open(check_js, 'w', encoding='utf-8') as f:
    f.write(js_block)

result = subprocess.run(['node', '--check', check_js], capture_output=True, text=True)
if result.returncode == 0:
    print("node --check: CLEAN")
else:
    combined = result.stdout + result.stderr
    print("node --check ERRORS:")
    print(combined[:1000])

# Save if we made fixes
if fixes > 0:
    ts = int(time.time() * 1000)
    c = re.sub(r'<!-- v\d+ -->', f'<!-- v{ts} -->', c)
    with open(src, 'w', encoding='utf-8', newline='\n') as f:
        f.write(c)
    print(f"Saved v{ts}, length={len(c)}")
else:
    print("No fixes applied.")
