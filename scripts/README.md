# 项目维护脚本 (Maintenance Scripts)

## 概述

这个目录包含了关系计算器项目的所有维护脚本，按照维护流程的步骤进行了重新组织。

## 目录结构

```
scripts/
├── 01-test/           # 测试阶段
├── 02-validate/       # 验证阶段
├── 03-sync/          # 同步阶段
├── 04-normalize/     # 规范化阶段
├── 05-audio/         # 音频阶段（生成+上传）
├── data/             # 数据文件
└── logs/             # 日志文件
```

## 维护流程

### 1. 测试阶段 (01-test)

- 运行 `test.js` 全面测试关系计算逻辑
- 生成 `missing-relations.txt` 记录未收录关系

### 2. 验证阶段 (02-validate)

- 验证缺失关系是否能正确计算
- 生成验证报告

### 3. 同步阶段 (03-sync)

- 将缺失关系同步到代码中
- 自动生成 `relationshipMappings` 条目

### 4. 规范化阶段 (04-normalize)

- 规范化自动生成的关系名称
- 将描述性名称转换为标准称呼

### 5. 音频阶段 (05-audio)

- 使用 PaddleSpeech 生成中文语音文件
- 直接上传到 GitHub 仓库 `relationship-audio`
- 生成 CDN 映射文件
- 自动提交和推送更改

## 快速开始

### 一键执行（推荐）

```bash
# 使用 Node.js 脚本（跨平台）
cd scripts
node run-maintenance.js

# 或使用 Windows 批处理脚本
cd scripts
run-maintenance.bat
```

### 分步执行

```bash
# 1. 运行测试
cd scripts/01-test
node test.js

# 2. 同步关系到代码
cd ../03-sync
node sync-missing-to-index.js

# 3. 规范化关系名称
cd ../04-normalize
node run-normalize.js

# 4. 生成音频并上传到 GitHub
cd ../05-audio
python upload_to_github.py
```

## 注意事项

- 按顺序执行各个阶段的脚本
- 每个阶段完成后检查输出结果
- 遇到错误时查看对应的日志文件
- 定期清理日志文件避免占用过多空间

## 依赖要求

- Node.js (用于 JavaScript 脚本)
- Python 3.7+ (用于 Python 脚本)
- PaddleSpeech (用于音频生成)
- GitPython (用于 GitHub 上传)
