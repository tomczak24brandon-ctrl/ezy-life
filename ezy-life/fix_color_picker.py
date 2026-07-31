"""
Fix buildTdColorPicker - replace the mangled pickTdColor return line with a clean version
using data-col attribute to avoid single-quote escaping hell.
"""
import re, time, subprocess

src = r"C:\Users\BIG D\.openclaw\workspace\ezy-life\index.html"
check_js = r"C:\Users\BIG D\.openclaw\workspace\ezy-life\_check.js"

with open(src, 'r', encoding='utf-8') as f:
    c = f.read()

# Find and replace the entire buildTdColorPicker function
OLD_FN = re.search(
    r'function buildTdColorPicker\(\) \{.*?\}(?=\s*\nfunction)',
    c, re.DOTALL
)
if OLD_FN:
    print(f"Found buildTdColorPicker at {OLD_FN.start()}-{OLD_FN.end()}")
    print(f"Current:\n{OLD_FN.group(0)[:400]}")
else:
    print("NOT FOUND via regex")

NEW_FN = (
    'function buildTdColorPicker() {\n'
    '  var el = document.getElementById(\'td-color-picker\');\n'
    '  if (!el) return;\n'
    '  var colors = [\'#1f6feb\',\'#2ea043\',\'#e3b341\',\'#f85149\',\'#a371f7\',\'#fd7e14\',\'#20c997\',\'#e36396\'];\n'
    '  el.innerHTML = colors.map(function(col) {\n'
    '    var active = col === _tdTaskColor ? \' style="outline:3px solid #fff;outline-offset:2px"\' : \'\';\n'
    '    return \'<button type="button" class="color-swatch" data-col="\' + col + \'" \'\n'
    '      + \'style="background:\' + col + \';width:28px;height:28px;border-radius:50%;border:none;cursor:pointer;margin:2px"\'\n'
    '      + active\n'
    '      + \' onclick="pickTdColor(this.dataset.col)"></button>\';\n'
    '  }).join(\'\');\n'
    '}'
)

if OLD_FN:
    c = c[:OLD_FN.start()] + NEW_FN + c[OLD_FN.end():]
    print("Replaced buildTdColorPicker")
else:
    # Fallback: find by unique string and replace whole block
    marker = "function buildTdColorPicker() {"
    idx = c.find(marker)
    if idx >= 0:
        # find the closing brace (next function)
        next_fn = c.find("\nfunction ", idx + len(marker))
        old_block = c[idx:next_fn]
        c = c.replace(old_block, NEW_FN + '\n', 1)
        print("Replaced via marker fallback")
    else:
        print("FAIL: could not find buildTdColorPicker")

# Also fix pickTdColor to accept string arg directly (it already does - just receives col value)
# Verify pickTdColor function
idx2 = c.find("function pickTdColor(")
print(f"\npickTdColor at {idx2}:")
print(c[idx2:idx2+100])

# Run node check
script_start = c.rfind('<script>')
script_end = c.rfind('</script>')
js_block = c[script_start+8:script_end]
with open(check_js, 'w', encoding='utf-8') as f:
    f.write(js_block)
result = subprocess.run(['node', '--check', check_js], capture_output=True, text=True)
combined = result.stdout + result.stderr
print(f"\nnode --check: {'CLEAN' if result.returncode == 0 else 'ERROR'}")
if result.returncode != 0:
    print(combined[:600])

# Save
ts = int(time.time() * 1000)
c = re.sub(r'<!-- v\d+ -->', f'<!-- v{ts} -->', c)
with open(src, 'w', encoding='utf-8', newline='\n') as f:
    f.write(c)
print(f"\nSaved v{ts}, length={len(c)}")
