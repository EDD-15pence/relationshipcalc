import os
import json
from paddlespeech.cli.tts.infer import TTSExecutor
from git import Repo  # pip install GitPython

# 配置
GITHUB_USER = "EDD-15pence"
REPO_NAME = "relationship-audio"
BRANCH = "main"
# LOCAL_REPO_PATH指向本地audio repo，和calc repo同级
LOCAL_REPO_PATH = "../../../relationship-audio"

# 从 JSON 加载关系表
with open("../data/relations.json", "r", encoding="utf-8") as f:
    relations = json.load(f)

# 只取前 10 个进行测试
relations = dict(list(relations.items())[:10])

# 创建目录
AUDIO_DIR = os.path.join(LOCAL_REPO_PATH, "assets/audio/zh-cn")
os.makedirs(AUDIO_DIR, exist_ok=True)

# 创建TTS实例（使用默认配置）
try:
    tts = TTSExecutor()
    print("✅ TTS实例创建成功")
except Exception as e:
    print(f"❌ TTS实例创建失败: {e}")
    exit(1)

cdn_map = {}
text_to_filename = {}  # 用中文去重

print(f"🎯 开始生成音频文件，共 {len(relations)} 个关系...")

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
            print(f"生成音频: {text} -> {out_path}")
            try:
                tts(text=text, output=out_path)
                print(f"✅ 成功生成: {text}")
            except Exception as e:
                print(f"❌ 生成失败: {text} - {e}")
                continue
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
try:
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
except Exception as e:
    print(f"⚠️ Git操作失败: {e}")

print(f"\n🎉 音频生成完成！")
print(f"📊 生成文件数: {len(cdn_map)}")




