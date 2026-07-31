with open(r'C:\Users\BIG D\.openclaw\workspace\ezy-life\index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1a: Remove onmousedown/ontouchstart from hour number divs in clock
old_hour = 'onmousedown="_mtpDragStart(event);event.stopPropagation()" ontouchstart="_mtpDragStart(event);event.stopPropagation()" onclick="event.stopPropagation();_mtpPickHour(\'+i+\')"'
new_hour = 'onclick="event.stopPropagation();_mtpPickHour(\'+i+\')"'

old_min = 'onmousedown="_mtpDragStart(event);event.stopPropagation()" ontouchstart="_mtpDragStart(event);event.stopPropagation()" onclick="event.stopPropagation();_mtpPickMin(\'+mv+\')"'
new_min = 'onclick="event.stopPropagation();_mtpPickMin(\'+mv+\')"'

count1 = content.count(old_hour)
count2 = content.count(old_min)
print(f'Hour occurrences: {count1}')
print(f'Min occurrences: {count2}')

content = content.replace(old_hour, new_hour)
content = content.replace(old_min, new_min)

with open(r'C:\Users\BIG D\.openclaw\workspace\ezy-life\index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Clock drag fix applied.')
