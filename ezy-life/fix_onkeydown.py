import re, time

src = r"C:\Users\BIG D\.openclaw\workspace\ezy-life\index.html"
with open(src, 'r', encoding='utf-8') as f:
    c = f.read()

# The broken pattern: single-quoted JS string containing === 'Enter' with unescaped single quotes
# This kills the JS parser
BAD  = "      + 'onkeydown=\"if(event.key==='Enter'){event.preventDefault();this.blur();}\" '"
GOOD = "      + 'onkeydown=\"if(event.key===\\'Enter\\'){event.preventDefault();this.blur();}\" '"

count = c.count(BAD)
print(f"Found {count} occurrences of broken onkeydown")
c = c.replace(BAD, GOOD)
print(f"Fixed: now {c.count(BAD)} remain")

# Also fix the renderNewSubList version
BAD2  = "      + 'onkeydown=\"if(event.key===\\'Enter\\'){event.preventDefault();this.blur();}\" '"
# This one was already escaped in the original script - check
count2 = c.count("event.key==='Enter'")
print(f"Remaining unescaped 'Enter' in JS string: {count2}")
# Find and show context
idx = c.find("event.key==='Enter'")
while idx >= 0:
    print(f"  At {idx}: {repr(c[max(0,idx-30):idx+50])}")
    idx = c.find("event.key==='Enter'", idx+1)

# Bump version
ts = int(time.time() * 1000)
c = re.sub(r'<!-- v\d+ -->', f'<!-- v{ts} -->', c)
with open(src, 'w', encoding='utf-8', newline='\n') as f:
    f.write(c)
print(f"Saved. v{ts}, length={len(c)}")
