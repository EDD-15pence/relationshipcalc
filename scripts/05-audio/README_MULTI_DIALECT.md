# 多方言音频生成功能

## 功能概述

本功能支持生成普通话、粤语、闽南话三种方言的亲属关系语音文件。

## 支持的方言

1. **普通话 (zh-cn)**

   - 使用模型：fastspeech2_cnndecoder_csmsc + hifigan_csmsc
   - 适用于中国大陆用户

2. **粤语 (zh-yue)**

   - 使用模型：fastspeech2_cnndecoder_aishell3 + hifigan_aishell3
   - 适用于香港、澳门、广东等地区用户

3. **闽南话 (zh-min)**
   - 使用模型：fastspeech2_cnndecoder_aishell3 + hifigan_aishell3
   - 适用于福建、台湾等地区用户

## 文件结构

```
relationship-audio/
├── assets/
│   └── audio/
│       ├── zh-cn/          # 普通话音频文件
│       ├── zh-yue/         # 粤语音频文件
│       └── zh-min/         # 闽南话音频文件
├── cdn_map_zh-cn.json      # 普通话CDN映射
├── cdn_map_zh-yue.json     # 粤语CDN映射
├── cdn_map_zh-min.json     # 闽南话CDN映射
└── cdn_map_unified.json    # 统一CDN映射（包含所有方言）
```

## 使用方法

### 1. 生成多方言音频

```bash
cd scripts/05-audio
python upload_to_github_multi_dialect.py
```

### 2. 在小程序中选择方言

用户可以在小程序界面中选择不同的方言：

- 点击"语音"选择器
- 选择普通话、粤语或闽南话
- 播放音频时会使用选中的方言

## 技术实现

### 音频生成脚本

- `upload_to_github_multi_dialect.py` - 多方言音频生成脚本
- 为每种方言创建独立的 TTS 实例
- 生成独立的 CDN 映射文件
- 创建统一的 CDN 映射文件供小程序使用

### 小程序集成

- 添加方言选择器 UI 组件
- 修改音频播放逻辑支持方言切换
- 加载统一 CDN 映射文件
- 根据用户选择播放对应方言的音频

## 依赖要求

- PaddleSpeech TTS
- GitPython
- 支持多方言的 TTS 模型

## 注意事项

1. **模型兼容性**：确保 PaddleSpeech 支持所需的 TTS 模型
2. **音频质量**：不同方言的音频质量可能有所差异
3. **文件大小**：多方言支持会增加音频文件的总大小
4. **CDN 成本**：需要确保 CDN 服务支持多方言文件的存储和访问

## 扩展支持

如需添加更多方言，可以：

1. 在 `DIALECTS` 配置中添加新的方言
2. 确保有对应的 TTS 模型
3. 更新小程序中的方言选择器
4. 重新生成音频文件和 CDN 映射

## 故障排除

### 常见问题

1. **TTS 模型加载失败**

   - 检查 PaddleSpeech 版本
   - 确认模型文件完整性

2. **音频生成失败**

   - 检查网络连接
   - 确认 GitHub 仓库权限

3. **小程序无法播放音频**
   - 检查 CDN 映射文件格式
   - 确认音频文件 URL 可访问

