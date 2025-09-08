import os
import json
from paddlespeech.cli.tts.infer import TTSExecutor
from git import Repo  # pip install GitPython

# 配置
GITHUB_USER = "EDD-15pence"
REPO_NAME = "relationship-audio"
BRANCH = "main"
# LOCAL_REPO_PATH指向本地audio repo，和calc repo同级
LOCAL_REPO_PATH = "../../relationship-audio"
AUDIO_DIR = os.path.join(LOCAL_REPO_PATH, "assets/audio/zh-cn")

tts = TTSExecutor()

# 从 JSON 加载关系表
with open("../data/relations.json", "r", encoding="utf-8") as f:
    relations = json.load(f)

# 只取前 40 个
# relations = dict(list(relations.items())[:40])

os.makedirs(AUDIO_DIR, exist_ok=True)

cdn_map = {}
text_to_filename = {}  # 用中文去重

for key, text in relations.items():
    # 跳过没有简称的关系
    if "的" in text:
        print(f"跳过复杂关系: {key} -> {text}")
        continue

    # 如果该中文已生成过，复用同一个文件
    if text in text_to_filename:
        filename = text_to_filename[text]
    else:
        filename = f"{key}.wav"  # 使用第一个 key 作为文件名
        out_path = os.path.join(AUDIO_DIR, filename)
        if not os.path.exists(out_path):
            print(f"生成音频: {out_path}")
            tts(text=text, output=out_path)
        else:
            print(f"已存在: {out_path}")
        text_to_filename[text] = filename

    # 生成 cdn_map
    cdn_map[key] = {
        "text": text,
        "raw": f"https://raw.githubusercontent.com/{GITHUB_USER}/{REPO_NAME}/{BRANCH}/assets/audio/zh-cn/{filename}",
        "jsdelivr": f"https://cdn.jsdelivr.net/gh/{GITHUB_USER}/{REPO_NAME}@{BRANCH}/assets/audio/zh-cn/{filename}",
        "ghfast": f"https://ghfast.top/https://raw.githubusercontent.com/{GITHUB_USER}/{REPO_NAME}/{BRANCH}/assets/audio/zh-cn/{filename}"
    }

# 保存映射表
cdn_map_path = os.path.join(LOCAL_REPO_PATH, "cdn_map.json")
with open(cdn_map_path, "w", encoding="utf-8") as f:
    json.dump(cdn_map, f, ensure_ascii=False, indent=2)

print("✅ cdn_map.json 已生成") 

# Git 提交 & 推送
repo = Repo(LOCAL_REPO_PATH) if os.path.exists(os.path.join(LOCAL_REPO_PATH, ".git")) else Repo.init(LOCAL_REPO_PATH)

# 如果 remote 不存在则创建
if "relationship-audio" not in [r.name for r in repo.remotes]:
    repo.create_remote("relationship-audio", f"git@github.com:{GITHUB_USER}/{REPO_NAME}.git")

repo.git.add(all=True)

# 检查是否有修改再提交
if repo.is_dirty(untracked_files=True):
    repo.index.commit("更新音频和 cdn_map.json")
    repo.remote(name="relationship-audio").push(refspec=f"{BRANCH}:{BRANCH}")
    print("✅ 已推送到 GitHub")
else:
    print("ℹ️ 没有变化，无需提交")
