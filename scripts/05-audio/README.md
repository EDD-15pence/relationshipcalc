# 05-音频阶段 (Audio Phase)

## 文件说明

- `upload_to_github.py` - 生成音频文件并上传到 GitHub 仓库

## 使用方法

```bash
# 生成音频并上传到 GitHub
cd scripts/05-audio
python upload_to_github.py
```

## 功能说明

### upload_to_github.py

- 从 `../data/relations.json` 读取关系映射
- 使用 PaddleSpeech 生成中文语音文件
- 直接上传到 GitHub 仓库 `relationship-audio`
- 生成 CDN 映射文件
- 自动提交和推送更改

## 配置要求

- GitHub 用户名：`EDD-15pence`
- 仓库名：`relationship-audio`
- 本地仓库路径：`../../relationship-audio`

## 输出示例

```
正在生成音频文件...
正在上传到 GitHub...
✅ 音频文件已成功上传到 GitHub
```

## 依赖要求

- Python 3.7+
- PaddleSpeech
- GitPython
- GitHub 访问权限

## 优势

- **一体化处理**：同时完成音频生成和上传，无需中间步骤
- **自动管理**：自动处理重复音频文件，避免重复生成
- **CDN 支持**：生成多种 CDN 链接，确保访问稳定性
- **版本控制**：自动提交到 Git，便于版本管理

## 下一步

音频生成和部署完成后，音频文件可通过 CDN 访问，项目维护流程完成。
