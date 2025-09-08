# 数据文件 (Data Files)

## 文件说明

- `relations.json` - 关系映射数据文件
- `extract_relations.py` - 从代码中提取关系数据的脚本

## 使用方法

```bash
# 提取关系数据
cd scripts/data
python extract_relations.py
```

## 功能说明

### relations.json

- 包含所有亲属关系的映射数据
- 格式：`{"关系路径": "中文称呼"}`
- 例如：`{"f": "爸爸", "m": "妈妈", "fob": "伯伯"}`

### extract_relations.py

- 从 `../../pages/index/index.js` 读取 `relationshipMappings`
- 解析关系映射数据
- 生成 `relations.json` 文件

## 数据格式

```json
{
  "f": "爸爸",
  "m": "妈妈",
  "fob": "伯伯",
  "mos": "姨妈"
}
```

## 用途

- 为音频生成提供数据源
- 为其他脚本提供关系映射
- 作为项目的核心数据文件
