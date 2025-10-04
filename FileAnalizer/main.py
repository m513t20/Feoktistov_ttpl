from pathlib import Path 
from collections import defaultdict

path_to_file = input()
path_to_file = Path(path_to_file)

if not path_to_file.exists:
    raise Exception("file not found")

with open(path_to_file) as source:
    lines=source.readlines()
    text="".join(lines)

print(f'lines in file = {len(lines)}')
print(f'symbols in file = {len(text)}')
print(f'empty strings = {lines.count('\n')}')

chars_arr = defaultdict(lambda:0)
for i in text:
    chars_arr[i]+=1
print(f'frequency dict = {chars_arr}')