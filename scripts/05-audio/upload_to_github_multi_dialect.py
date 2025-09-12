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

# 方言配置
DIALECTS = {
    "zh-cn": {
        "name": "普通话",
        "tts_config": {
            "am": "fastspeech2_cnndecoder_csmsc",
            "voc": "hifigan_csmsc",
            "lang": "zh"
        }
    },
    "zh-yue": {
        "name": "粤语",
        "tts_config": {
            "am": "fastspeech2_canton",
            "voc": "pwgan_aishell3",
            "lang": "canton"
        }
    },
    "zh-min": {
        "name": "闽南话",
        "tts_config": {
            "am": "fastspeech2_cnndecoder_aishell3",
            "voc": "hifigan_aishell3", 
            "lang": "zh"
        }
    }
}

# 从 JSON 加载关系表
with open("../data/relations.json", "r", encoding="utf-8") as f:
    relations = json.load(f)

# 只取前 40 个进行测试
# relations = dict(list(relations.items())[:40])

# 为每种方言创建目录和TTS实例
dialect_tts = {}
dialect_dirs = {}
dialect_cdn_maps = {}

# 创建统一的TTS实例
tts = TTSExecutor()

for dialect_code, dialect_info in DIALECTS.items():
    # 创建方言目录
    dialect_dir = os.path.join(LOCAL_REPO_PATH, f"assets/audio/{dialect_code}")
    os.makedirs(dialect_dir, exist_ok=True)
    dialect_dirs[dialect_code] = dialect_dir
    
    # 存储TTS配置
    dialect_tts[dialect_code] = dialect_info["tts_config"]
    
    # 初始化CDN映射
    dialect_cdn_maps[dialect_code] = {}

print(f"🎯 开始生成 {len(DIALECTS)} 种方言的音频文件...")

# 为每种方言生成音频
for dialect_code, dialect_info in DIALECTS.items():
    print(f"\n🗣️ 生成 {dialect_info['name']} 音频...")
    
    tts_config = dialect_tts[dialect_code]
    dialect_dir = dialect_dirs[dialect_code]
    cdn_map = dialect_cdn_maps[dialect_code]
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
            out_path = os.path.join(dialect_dir, filename)
            if not os.path.exists(out_path):
                print(f"生成 {dialect_info['name']} 音频: {out_path}")
                try:
                    tts(
                        text=text,
                        output=out_path,
                        am=tts_config["am"],
                        voc=tts_config["voc"],
                        lang=tts_config["lang"]
                    )
                except Exception as e:
                    print(f"❌ 生成失败: {text} - {e}")
                    continue
            else:
                print(f"已存在: {out_path}")
            text_to_filename[text] = filename

        # 生成 cdn_map
        cdn_map[key] = {
            "text": text,
            "raw": f"https://raw.githubusercontent.com/{GITHUB_USER}/{REPO_NAME}/{BRANCH}/assets/audio/{dialect_code}/{filename}",
            "jsdelivr": f"https://cdn.jsdelivr.net/gh/{GITHUB_USER}/{REPO_NAME}@{BRANCH}/assets/audio/{dialect_code}/{filename}",
            "ghfast": f"https://ghfast.top/https://raw.githubusercontent.com/{GITHUB_USER}/{REPO_NAME}/{BRANCH}/assets/audio/{dialect_code}/{filename}"
        }

    print(f"✅ {dialect_info['name']} 音频生成完成，共 {len(cdn_map)} 个文件")

# 保存各方言的映射表
for dialect_code, dialect_info in DIALECTS.items():
    cdn_map_path = os.path.join(LOCAL_REPO_PATH, f"cdn_map_{dialect_code}.json")
    with open(cdn_map_path, "w", encoding="utf-8") as f:
        json.dump(dialect_cdn_maps[dialect_code], f, ensure_ascii=False, indent=2)
    print(f"✅ cdn_map_{dialect_code}.json 已生成")

# 生成统一的CDN映射表（包含所有方言）
unified_cdn_map = {}
for dialect_code, dialect_info in DIALECTS.items():
    unified_cdn_map[dialect_code] = dialect_cdn_maps[dialect_code]

unified_cdn_map_path = os.path.join(LOCAL_REPO_PATH, "cdn_map_unified.json")
with open(unified_cdn_map_path, "w", encoding="utf-8") as f:
    json.dump(unified_cdn_map, f, ensure_ascii=False, indent=2)
print(f"✅ 统一CDN映射表 cdn_map_unified.json 已生成")

# Git 提交 & 推送
repo = Repo(LOCAL_REPO_PATH) if os.path.exists(os.path.join(LOCAL_REPO_PATH, ".git")) else Repo.init(LOCAL_REPO_PATH)

# 如果 remote 不存在则创建
if "relationship-audio" not in [r.name for r in repo.remotes]:
    repo.create_remote("relationship-audio", f"git@github.com:{GITHUB_USER}/{REPO_NAME}.git")

repo.git.add(all=True)

# 检查是否有修改再提交
if repo.is_dirty(untracked_files=True):
    repo.index.commit("更新多方言音频和CDN映射表")
    repo.remote(name="relationship-audio").push(refspec=f"{BRANCH}:{BRANCH}")
    print("✅ 已推送到 GitHub")
else:
    print("ℹ️ 没有变化，无需提交")

print(f"\n🎉 多方言音频生成完成！")
print(f"📁 生成的方言: {', '.join([info['name'] for info in DIALECTS.values()])}")
print(f"📊 每种方言生成文件数: {len([k for k, v in relations.items() if '的' not in v])}")

