import re
import json

with open("../../pages/index/index.js", "r", encoding="utf-8") as f:
    content = f.read()

# 找到 relationshipMappings 数组
start = content.find("relationshipMappings")
if start == -1:
    raise ValueError("未找到 relationshipMappings")

bracket_start = content.find("[", start)
if bracket_start == -1:
    raise ValueError("未找到 [")

# 找到匹配的 ]
count = 0
for i, c in enumerate(content[bracket_start:], start=bracket_start):
    if c == "[":
        count += 1
    elif c == "]":
        count -= 1
        if count == 0:
            bracket_end = i
            break

array_body = content[bracket_start+1:bracket_end]

# 匹配每个对象
object_pattern = re.compile(r"{(.*?)}", re.S)
matches = object_pattern.findall(array_body)

relations = {}

for obj in matches:
    # 匹配 path 数组
    path_match = re.search(r'path\s*:\s*\[([^\]]+)\]', obj)
    if not path_match:
        continue
    path_keys = [p.strip().strip('"').strip("'") for p in path_match.group(1).split(",")]

    # 匹配 name
    name_match = re.search(r'name\s*:\s*["\'](.*?)["\']', obj)
    if not name_match:
        continue
    name = name_match.group(1)

    # 直接拼接字母
    full_key = "".join(path_keys)
    relations[full_key] = name

# 保存 JSON
with open("relations.json", "w", encoding="utf-8") as f:
    json.dump(relations, f, ensure_ascii=False, indent=4)

print("✅ 已生成 relations.json")
