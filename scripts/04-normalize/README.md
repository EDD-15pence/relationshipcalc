# 04-规范化阶段 (Normalization Phase)

## 文件说明

- `normalize-auto-entries.js` - 规范化自动生成的关系名称
- `run-normalize.js` - 运行规范化流程的主脚本

## 使用方法

```bash
# 运行完整的规范化流程
cd scripts/04-normalize
node run-normalize.js

# 或单独运行规范化
node normalize-auto-entries.js
```

## 功能说明

### normalize-auto-entries.js

- 读取 `pages/index/index.js` 中的关系映射
- 规范化自动生成的关系名称
- 将"爸爸的哥哥"等描述性名称转换为标准称呼"伯伯"
- 更新代码中的关系映射

### run-normalize.js

- 按顺序执行规范化流程：
  1. 运行 `normalize-auto-entries.js`
  2. 运行验证脚本（来自 02-validate）
- 提供完整的流程控制

## 规范化规则

- `爸爸的哥哥` → `伯伯`
- `妈妈的姐姐` → `姨妈`
- `老公的爸爸` → `公公`
- 等等...

## 输出示例

```
开始执行标准化流程...

运行 normalize-auto-entries.js...
✅ 规范化完成: 15个关系已更新

运行 ../02-validate/validate-missing.js...
✅ 验证通过: 所有关系计算正确
```

## 下一步

规范化完成后，进入 `05-audio` 阶段生成音频文件。
