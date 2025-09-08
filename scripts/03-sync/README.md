# 03-同步阶段 (Sync Phase)

## 文件说明

- `sync-missing-to-index.js` - 将缺失关系同步到代码中
- `list-auto-candidates.js` - 列出自动候选关系

## 使用方法

```bash
# 同步缺失关系到 index.js
cd scripts/03-sync
node sync-missing-to-index.js

# 列出候选关系
node list-auto-candidates.js
```

## 功能说明

### sync-missing-to-index.js

- 读取 `../01-test/missing-relations.txt` 文件
- 解析缺失的关系路径
- 自动生成 `relationshipMappings` 条目
- 插入到 `pages/index/index.js` 的指定区域

### list-auto-candidates.js

- 分析现有的关系映射
- 列出可能的自动候选关系
- 帮助发现遗漏的关系组合

## 输出示例

```
正在同步缺失关系...
✅ 已添加: { path: ["f", "ob"], name: "爸爸的哥哥", gender: "both" }
✅ 已添加: { path: ["m", "os"], name: "妈妈的姐姐", gender: "both" }
同步完成: 25个关系已添加
```

## 下一步

同步完成后，进入 `04-normalize` 阶段规范化关系名称。
