# 日志文件 (Log Files)

## 文件说明

- `exp/` - 实验日志目录
- 包含各种脚本的运行日志

## 日志文件

### 音频生成日志

- `py_gen_audio.*.log` - PaddleSpeech 音频生成日志

### GitHub 上传日志

- `py_upload_to_github.*.log` - GitHub 上传脚本日志

## 日志格式

```
2025-08-27 21:22:44.052 | DEBUG | paddlespeech.s2t:<module>:41 - register user softmax to paddle, remove this when fixed!
```

## 用途

- 调试脚本运行问题
- 监控脚本执行状态
- 记录错误和警告信息

## 清理建议

- 定期清理过期的日志文件
- 保留重要的错误日志用于调试
- 使用日志轮转避免文件过大
