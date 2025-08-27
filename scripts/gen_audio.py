import os
import json
from paddlespeech.cli.tts.infer import TTSExecutor

tts = TTSExecutor()

# 从 JSON 加载关系表
with open("relations.json", "r", encoding="utf-8") as f:
    relations = json.load(f)

output_dir = "../assets/audio/zh-cn"
os.makedirs(output_dir, exist_ok=True)

# 根据中文名去重生成语音文件
name_to_file = {}
for text in set(relations.values()):
    # 文件名用中文名生成，非法字符替换成下划线
    safe_name = "".join(c if c.isalnum() else "_" for c in text)
    out_path = os.path.join(output_dir, f"{safe_name}.wav")
    if os.path.exists(out_path):
        print(f"已存在，跳过: {out_path}")
    else:
        print(f"正在生成: {out_path}")
        tts(text=text, output=out_path)
    name_to_file[text] = out_path

# 最终生成路径 -> 文件映射
path_to_file = {k: name_to_file[v] for k, v in relations.items()}

# 保存映射
with open("path_to_audio.json", "w", encoding="utf-8") as f:
    json.dump(path_to_file, f, ensure_ascii=False, indent=4)

print("✅ 所有语音已生成/更新完成")
