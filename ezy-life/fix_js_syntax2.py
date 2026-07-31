"""
Iteratively extract JS, check with node, fix unescaped single-quote errors, repeat until clean.
"""
import re, time, subprocess, sys

src = r"C:\Users\BIG D\.openclaw\workspace\ezy-life\index.html"
check_js = r"C:\Users\BIG D\.openclaw\workspace\ezy-life\_check.js"

with open(src, 'r', encoding='utf-8') as f:
    c = f.read()

def get_js(content):
    ss = content.rfind('<script>')
    se = content.rfind('</script>')
    return content[ss+8:se]

def check(content):
    js = get_js(content)
    with open(check_js, 'w', encoding='utf-8') as f:
        f.write(js)
    r = subprocess.run(['node', '--check', check_js], capture_output=True, text=True)
    return r.returncode, r.stdout + r.stderr

def get_error_line(msg):
    m = re.search(r'_check\.js:(\d+)', msg)
    return int(m.group(1)) if m else None

MAX_ROUNDS = 20
for rnd in range(MAX_ROUNDS):
    rc, err = check(c)
    if rc == 0:
        print(f"Round {rnd}: CLEAN")
        break

    lineno = get_error_line(err)
    print(f"Round {rnd}: error at line {lineno}")

    if lineno is None:
        print("Can't parse error line. Output:")
        print(err[:500])
        break

    # Get the offending line from JS
    js = get_js(c)
    lines = js.split('\n')
    if lineno > len(lines):
        print(f"Line {lineno} out of range ({len(lines)} lines)")
        break

    bad_line = lines[lineno - 1]
    print(f"Bad line: {repr(bad_line)}")

    # Strategy: find this line in the full file content and fix it
    # The issue is always: a single-quoted JS string containing unescaped single quotes
    # Pattern: onclick/onblur/etc="...('something')..." inside a JS string delimited by '
    # Fix: replace inner ' with \\'

    # Find the exact bad_line in c
    idx = c.find(bad_line)
    if idx < 0:
        # Try stripped
        idx = c.find(bad_line.strip())
        if idx < 0:
            print(f"Line not found in source: {repr(bad_line[:80])}")
            break

    # The fix: inside a JS string (single-quoted) that has onclick="func('...arg...')"
    # The inner single quotes need to be escaped as \\'
    # Use regex to find and fix the specific pattern on this line

    # Find all single-quote pairs that look like they're argument quotes inside double-quoted attributes
    # Pattern in source: '...onclick="someFunc('...', '...')"...'
    # We need to escape the inner ones

    # Specific known patterns to fix:
    fixed = False

    # Pattern: pickTdColor(''+col+'')  -> pickTdColor(\''+col+'\')
    m = re.search(r"pickTdColor\(''\+col\+''\)", bad_line)
    if m:
        fixed_line = bad_line.replace("pickTdColor(''+col+'')", r"pickTdColor(\''+col+'\\')")
        c = c.replace(bad_line, fixed_line, 1)
        print(f"Fixed: pickTdColor quotes")
        fixed = True

    # Pattern: mcatToggleEP(''+catId+'')
    if not fixed:
        m = re.search(r"mcatToggleEP\(''\+\S+\+''\)", bad_line)
        if m:
            old = m.group(0)
            new = old.replace("(''+", "(\\''+").replace("+'')","+'\\')") 
            fixed_line = bad_line.replace(old, new)
            c = c.replace(bad_line, fixed_line, 1)
            print(f"Fixed: mcatToggleEP quotes: {old!r} -> {new!r}")
            fixed = True

    # Generic: any onclick/onblur/etc="func('  or  func('" inside a single-quoted string
    if not fixed:
        # Find all occurrences of unescaped 'something' inside a double-quoted attr inside a JS string
        # The line starts with a single quote (JS string context)
        stripped = bad_line.strip()
        if stripped.startswith('+') or stripped.startswith("'") or stripped.startswith('"'):
            # Try to find all handler attributes with unescaped single quotes inside
            # Replace: onclick="func('val')" -> onclick="func(\\'val\\')"
            # Careful: only within the JS string context
            def fix_handler_quotes(line):
                # Match: (on\w+)="([^"]*'[^"]*)"  but only when we're in a JS single-quoted string
                # Simpler: find all on*="..." attrs and escape internal single quotes
                def replacer(m):
                    attr = m.group(1)
                    val = m.group(2)
                    # Escape unescaped single quotes that aren't already escaped
                    val_fixed = re.sub(r"(?<!\\)'", r"\\'", val)
                    if val_fixed != val:
                        return f'{attr}="{val_fixed}"'
                    return m.group(0)
                return re.sub(r'(on\w+)="([^"]*\'[^"]*)"', replacer, line)

            fixed_line = fix_handler_quotes(bad_line)
            if fixed_line != bad_line:
                c = c.replace(bad_line, fixed_line, 1)
                print(f"Fixed (generic handler quotes)")
                print(f"  Before: {repr(bad_line[:120])}")
                print(f"  After:  {repr(fixed_line[:120])}")
                fixed = True

    if not fixed:
        print(f"No fix applied for: {repr(bad_line[:120])}")
        print("Error output:")
        print(err[:600])
        break

else:
    print("Max rounds reached")

# Final check
rc, err = check(c)
print(f"\nFinal check: {'CLEAN' if rc==0 else 'ERRORS'}")
if rc != 0:
    print(err[:800])

# Save
ts = int(time.time() * 1000)
c = re.sub(r'<!-- v\d+ -->', f'<!-- v{ts} -->', c)
with open(src, 'w', encoding='utf-8', newline='\n') as f:
    f.write(c)
print(f"Saved v{ts}, length={len(c)}")
