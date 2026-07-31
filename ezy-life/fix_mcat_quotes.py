import re, time, sys

src = r"C:\Users\BIG D\.openclaw\workspace\ezy-life\index.html"
with open(src, 'r', encoding='utf-8') as f:
    c = f.read()

old = """      +'<input class="mcat-name-inp" id="mcat-name-'+cat.id+'" value="'+esc(cat.name)+'" maxlength="32" onkeydown="if(event.key==='Enter'){mcatSave('+cat.id+');}">'"""

new = """      +'<input class="mcat-name-inp" id="mcat-name-'+cat.id+'" value="'+esc(cat.name)+'" maxlength="32" onkeydown="if(event.key==&quot;Enter&quot;){mcatSave('+cat.id+');}">'"""

if old in c:
    c = c.replace(old, new, 1)
    sys.stdout.buffer.write(b"OK: fixed onkeydown quotes in renderMcatList\n")
else:
    sys.stdout.buffer.write(b"MISS: onkeydown quotes\n")
    # Show context
    idx = c.find("mcat-name-inp")
    sys.stdout.buffer.write(repr(c[idx:idx+300]).encode('utf-8') + b'\n')

ts = int(time.time() * 1000)
c = re.sub(r'<!-- v\d+ -->', f'<!-- v{ts} -->', c)
with open(src, 'w', encoding='utf-8') as f:
    f.write(c)
sys.stdout.buffer.write(f"Written v{ts}. Length: {len(c)}\n".encode('utf-8'))
