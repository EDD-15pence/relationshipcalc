# 02-验证阶段 (Validation Phase)

## 文件说明

- `validate-missing.js` - 验证缺失关系的脚本（待创建）

## 使用方法

```bash
# 验证缺失关系
cd scripts/02-validate
node validate-missing.js
```

## 功能说明

### validate-missing.js (待创建)

- 读取 `../01-test/missing-relations.txt` 文件
- 验证每个缺失关系是否能正确计算
- 输出验证失败的关系条目
- 生成验证报告

## 预期输出

```
验证中... 1/100
✅ 验证通过: f-ob
❌ 验证失败: h-ob-s
验证完成: 95/100 通过
```

## 下一步

验证完成后，进入 `03-sync` 阶段同步关系到代码。
