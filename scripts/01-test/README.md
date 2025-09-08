# 01-测试阶段 (Testing Phase)

## 文件说明

- `test.js` - 主测试脚本，用于全面测试关系计算逻辑
- `missing-relations.txt` - 测试结果文件，记录未收录的关系

## 使用方法

```bash
# 运行测试脚本
cd scripts/01-test
node test.js
```

## 功能说明

### test.js

- 生成所有可能的关系组合（长度 1-3，共 1110 个）
- 测试 4 种情况：正向-男、正向-女、反向-男、反向-女
- 总计测试 4440 个用例
- 自动生成 `missing-relations.txt` 文件

### missing-relations.txt

- 记录所有"未收录的关系"
- 按关系长度分组显示
- 提供详细的测试结果统计

## 输出示例

```
✅ PASS: 基础关系测试
❌ FAIL: 复杂关系测试
```

## 下一步

测试完成后，进入 `02-validate` 阶段验证缺失关系。
