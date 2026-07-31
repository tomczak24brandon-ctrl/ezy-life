import re, subprocess

src = r"C:\Users\BIG D\.openclaw\workspace\ezy-life\index.html"
check_js = r"C:\Users\BIG D\.openclaw\workspace\ezy-life\_check.js"

with open(src, 'r', encoding='utf-8') as f:
    c = f.read()

# Replace whatever apiKey is currently there
c = re.sub(r'apiKey: "[^"]*"', 'apiKey: "AIzaSyDqekx9bFgWmEyp_rv-YqthlaLWCSex1AM"', c, count=1)
print("API key set")

# Verify
idx = c.find("apiKey:")
print("Verified:", repr(c[idx:idx+60]))

# node --check
script_start = c.rfind('<script>')
script_end = c.rfind('</script>')
js_block = c[script_start+8:script_end]
with open(check_js, 'w', encoding='utf-8') as f:
    f.write(js_block)
result = subprocess.run(['node', '--check', check_js], capture_output=True, text=True)
print(f"node --check: {'CLEAN' if result.returncode == 0 else 'ERRORS'}")
if result.returncode != 0:
    print(result.stderr[:500])

with open(src, 'w', encoding='utf-8', newline='\n') as f:
    f.write(c)
print(f"Saved, length={len(c)}")
