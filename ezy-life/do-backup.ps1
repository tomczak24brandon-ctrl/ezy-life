$b = "index-STABLE-" + (Get-Date -f "yyyy-MM-dd-HHmm") + ".html"
Copy-Item index.html $b
Get-Item $b | Select-Object Name, Length, LastWriteTime
