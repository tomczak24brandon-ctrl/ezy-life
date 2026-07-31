src = r"C:\Users\BIG D\.openclaw\workspace\ezy-life\index.html"
with open(src, 'r', encoding='utf-8') as f:
    c = f.read()

def show(label, idx, length=500):
    if idx < 0:
        print(f"=== {label}: NOT FOUND ===")
        return
    end = c.find('\nfunction ', idx + 50)
    if end < 0 or end - idx > length:
        end = idx + length
    print(f"=== {label} at {idx} ===")
    print(c[idx:end])
    print()

# CREDS
show("CREDS", c.find("var CREDS"), 200)

# doLogin
show("doLogin", c.find("function doLogin("))

# login screen show/hide
for kw in ["login-screen'", 'login-screen"', "getElementById('login-screen')", 'getElementById("login-screen")', ".style.display"]:
    idx = c.find(kw)
    while idx >= 0:
        snippet = c[max(0,idx-40):idx+120]
        if 'login' in snippet.lower() or 'display' in snippet.lower():
            print(f"login display at {idx}: {repr(snippet[:120])}")
        idx = c.find(kw, idx+1)
        break

# appInit calls
print("\n=== appInit() call sites ===")
idx = c.find("appInit()")
while idx >= 0:
    print(f"  at {idx}: {repr(c[max(0,idx-40):idx+60])}")
    idx = c.find("appInit()", idx+1)

# ezy_user
print("\n=== ezy_user references ===")
idx = c.find("ezy_user")
while idx >= 0:
    print(f"  at {idx}: {repr(c[max(0,idx-30):idx+80])}")
    idx = c.find("ezy_user", idx+1)
