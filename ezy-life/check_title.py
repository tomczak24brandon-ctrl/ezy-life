src = r"C:\Users\BIG D\.openclaw\workspace\ezy-life\index.html"
with open(src, 'rb') as f:
    c = f.read()
needle = b"textContent = '"
idx = c.find(needle)
while idx >= 0:
    snippet = c[idx:idx+60]
    decoded = snippet.decode('utf-8', errors='replace')
    if 'EZY' in decoded or 'Life' in decoded:
        print('Bytes:', snippet.hex())
        print('Decoded:', repr(decoded))
        break
    idx = c.find(needle, idx+1)
