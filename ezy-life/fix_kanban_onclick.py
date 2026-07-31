import re, time, sys

src = r"C:\Users\BIG D\.openclaw\workspace\ezy-life\index.html"
with open(src, 'r', encoding='utf-8') as f:
    c = f.read()

old = r"kcard-steps\')&&!event.target.closest(\'.kcard-chevron\')&&!event.target.closest(\'.kcard-done-chk\'))openGoalDetail"
new = r"kcard-steps\')&&!event.target.closest(\'.kcard-chevron\')&&!event.target.closest(\'.kcard-done-chk\')&&!event.target.closest(\'.kcard-edit-btn\'))openGoalDetail"

if old in c:
    c = c.replace(old, new, 1)
    sys.stdout.buffer.write(b"OK: onclick exclusion\n")
else:
    sys.stdout.buffer.write(b"MISS: onclick exclusion\n")

ts = int(time.time() * 1000)
c = re.sub(r'<!-- v\d+ -->', f'<!-- v{ts} -->', c)
with open(src, 'w', encoding='utf-8') as f:
    f.write(c)
sys.stdout.buffer.write(f"Written v{ts}. Length: {len(c)}\n".encode('utf-8'))
