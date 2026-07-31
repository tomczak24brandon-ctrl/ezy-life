import re, time, subprocess

src = r"C:\Users\BIG D\.openclaw\workspace\ezy-life\index.html"
check_js = r"C:\Users\BIG D\.openclaw\workspace\ezy-life\_check.js"

with open(src, 'r', encoding='utf-8') as f:
    c = f.read()

fixes = 0

# Fix 1: hamburger menu icon (☰ = &#9776;)
bad1 = 'onclick="toggleMobileSidebar()">?</button>'
good1 = 'onclick="toggleMobileSidebar()">&#9776;</button>'
if bad1 in c:
    c = c.replace(bad1, good1, 1)
    print("Fixed: hamburger menu icon")
    fixes += 1
else:
    print(f"Hamburger not found as '?': checking...")
    idx = c.find("toggleMobileSidebar()")
    if idx >= 0:
        print(f"  Context: {repr(c[idx:idx+60])}")

# Fix 2: page title '?? EZY Life' -> '🏠 EZY Life'
bad2 = "page-title').textContent = '?? EZY Life'"
good2 = "page-title').textContent = '\U0001F3E0 EZY Life'"
if bad2 in c:
    c = c.replace(bad2, good2, 1)
    print("Fixed: page title emoji")
    fixes += 1
else:
    # Try with actual question marks
    idx = c.find("EZY Life'")
    while idx >= 0:
        snippet = c[max(0,idx-40):idx+20]
        print(f"  EZY Life context: {repr(snippet)}")
        idx = c.find("EZY Life'", idx+1)

# Run node check
script_start = c.rfind('<script>')
script_end = c.rfind('</script>')
js_block = c[script_start+8:script_end]
with open(check_js, 'w', encoding='utf-8') as f:
    f.write(js_block)
result = subprocess.run(['node', '--check', check_js], capture_output=True, text=True)
combined = result.stdout + result.stderr
print(f"node --check: {'CLEAN' if result.returncode == 0 else 'ERRORS'}")
if result.returncode != 0:
    print(combined[:600])

ts = int(time.time() * 1000)
c = re.sub(r'<!-- v\d+ -->', f'<!-- v{ts} -->', c)
with open(src, 'w', encoding='utf-8', newline='\n') as f:
    f.write(c)
print(f"Saved v{ts}, length={len(c)}, fixes={fixes}")
