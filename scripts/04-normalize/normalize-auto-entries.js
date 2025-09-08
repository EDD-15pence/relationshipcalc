const fs = require("fs");
const path = require("path");

const repoRoot = path.join(__dirname, "..", "..");
const indexPath = path.join(repoRoot, "pages", "index", "index.js");

// 基础称谓词典
const tokenToLabel = {
  f: "爸爸",
  m: "妈妈",
  h: "老公",
  w: "老婆",
  ob: "哥哥",
  yb: "弟弟",
  os: "姐姐",
  ys: "妹妹",
  s: "儿子",
  d: "女儿",
};

function run() {
  // 创建备份
  const backupPath =
    indexPath + ".backup." + new Date().toISOString().replace(/[:.]/g, "-");
  console.log("创建备份文件:", backupPath);
  fs.copyFileSync(indexPath, backupPath);

  let raw = fs.readFileSync(indexPath, "utf8");

  // 提取所有关系映射，构建标准映射表
  const standardMap = new Map();
  const relationRegex =
    /\{\s*path:\s*\[([^\]]+)\],\s*name:\s*"([^\"]*)",\s*gender:\s*"([^\"]*)"\s*\}/g;
  let match;
  while ((match = relationRegex.exec(raw)) !== null) {
    const pathStr = match[1]
      .split(",")
      .map((s) => s.replace(/["'\s]/g, ""))
      .filter(Boolean)
      .join(",");
    standardMap.set(pathStr, match[2]);
  }

  // 再次遍历所有关系，进行规范化
  const allRelations = [];
  relationRegex.lastIndex = 0;
  while ((match = relationRegex.exec(raw)) !== null) {
    // 正确解析path数组，去除引号和空格
    const pathArray = match[1]
      .split(",")
      .map((s) => s.replace(/["'\s]/g, ""))
      .filter(Boolean);

    allRelations.push({
      pathStr: pathArray.join(","),
      name: match[2],
      gender: match[3],
      full: match[0],
    });
  }

  // 添加调试信息：显示所有读取到的关系
  console.log(`总共读取到 ${allRelations.length} 个关系`);

  // 查找包含 ob 和 w 的关系
  const obWRelations = allRelations.filter(
    (r) =>
      r.pathStr.includes("ob") && r.pathStr.includes("w") && r.name === "爸爸"
  );

  if (obWRelations.length > 0) {
    console.log(
      `\n找到 ${obWRelations.length} 个包含 ob 和 w 且名称为"爸爸"的关系:`
    );
    obWRelations.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.pathStr} -> ${r.name}`);
    });
  } else {
    console.log('\n没有找到包含 ob 和 w 且名称为"爸爸"的关系');
  }

  // 查找包含 f,ob,w 路径且名称为"伯父的老婆"的关系
  const fObWRelations = allRelations.filter(
    (r) => r.pathStr === "f,ob,w" && r.name === "伯父的老婆"
  );

  if (fObWRelations.length > 0) {
    console.log(
      `\n找到 ${fObWRelations.length} 个 f,ob,w -> "伯父的老婆" 的错误映射:`
    );
    fObWRelations.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.pathStr} -> ${r.name}`);
    });
  } else {
    console.log('\n没有找到 f,ob,w -> "伯父的老婆" 的错误映射');
  }

  // 显示前几个关系的详细信息
  console.log("\n前5个关系的详细信息:");
  allRelations.slice(0, 5).forEach((r, i) => {
    console.log(`  ${i + 1}. pathStr: "${r.pathStr}" -> name: "${r.name}"`);
  });

  // 查找所有包含 ob 的关系
  const allObRelations = allRelations.filter((r) => r.pathStr.includes("ob"));
  console.log(`\n找到 ${allObRelations.length} 个包含 ob 的关系:`);
  allObRelations.slice(0, 10).forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.pathStr} -> ${r.name}`);
  });

  // 新的保守化简规则
  function simplifyPath(tokens) {
    // 转换为数组以便处理
    const path = [...tokens];
    let changed = true;

    while (changed) {
      changed = false;

      // 规则1: 父母的配偶化简（仅在直接关系时）
      // f,m,h -> f (爸爸的妈妈的老公 -> 爷爷)
      // f,m,w -> f (爸爸的妈妈的老婆 -> 奶奶)
      // 但只在路径长度为3且没有其他复杂关系时应用
      if (path.length === 3) {
        if (
          (path[0] === "f" || path[0] === "m") &&
          (path[1] === "m" || path[1] === "f") &&
          (path[2] === "h" || path[2] === "w")
        ) {
          path.splice(1, 2);
          changed = true;
          continue;
        }
      }

      // 规则2: 兄弟姐妹的父母化简（仅在路径开头且长度为2时）
      // ob,f -> f (哥哥的爸爸 -> 爸爸)
      // ob,m -> m (哥哥的妈妈 -> 妈妈)
      // 只在路径开头且长度为2时应用，避免过度化简
      if (path.length === 2) {
        if (
          ["ob", "yb", "os", "ys"].includes(path[0]) &&
          (path[1] === "f" || path[1] === "m")
        ) {
          path.splice(0, 1);
          changed = true;
          continue;
        }
      }

      // 规则3: 简单的重复关系化简
      // f,f -> f (爸爸的爸爸 -> 爷爷，但这里我们保持原样，因为已经有专门的映射)
      // 这个规则暂时禁用，因为可能导致错误

      // 规则4: 配偶关系的简单化简
      // h,h -> h (老公的老公 -> 老公，同性关系保持)
      // w,w -> w (老婆的老婆 -> 老婆，同性关系保持)
      // 这个规则暂时禁用，因为可能导致错误

      // 注意：我们移除了所有复杂的化简规则，只保留最基本和安全的规则
      // 这样可以避免错误地修改关系名称
    }
    return path;
  }

  // 对所有关系进行标准化处理
  const normalizedRelations = allRelations.map((relation) => {
    const tokens = relation.pathStr
      .split(",")
      .map((s) => s.replace(/["'\s]/g, ""))
      .filter(Boolean);

    // 首先尝试化简路径
    const simplifiedTokens = simplifyPath(tokens);
    const simplifiedKey = simplifiedTokens.join(",");

    // 添加调试信息
    if (
      relation.name === "爸爸" &&
      relation.pathStr.includes("ob") &&
      relation.pathStr.includes("w")
    ) {
      console.log(`调试路径化简: ${relation.pathStr} -> ${simplifiedKey}`);
      console.log(`  原始tokens: [${tokens.join(", ")}]`);
      console.log(`  化简后tokens: [${simplifiedTokens.join(", ")}]`);
    }

    // 新的保守策略：不进行复杂的特殊情况处理
    // 只保留最基本的关系名称规范化

    // 新的保守规范化策略
    // 1. 如果当前称谓已经是标准称谓，保持不变
    if (Array.from(standardMap.values()).includes(relation.name)) {
      return {
        ...relation,
        normalizedName: relation.name,
      };
    }

    // 2. 检查原始路径是否有对应的标准称谓
    let newName = standardMap.get(tokens.join(","));
    if (newName) {
      return {
        ...relation,
        normalizedName: newName,
      };
    }

    // 3. 检查化简后的路径是否有对应的标准称谓
    newName = standardMap.get(simplifiedKey);
    if (newName) {
      return {
        ...relation,
        normalizedName: newName,
      };
    }

    // 4. 如果都没找到，保持原名称不变
    // 这样可以避免错误地修改关系名称
    return {
      ...relation,
      normalizedName: relation.name,
    };
  });

  // 生成新的文件内容
  const changes = normalizedRelations.filter(
    (r) => r.normalizedName !== r.name
  );
  if (changes.length === 0) {
    console.log("未检测到需要修改的条目");
    return;
  }

  let newContent = raw;
  changes.forEach((change) => {
    const oldEntry = change.full;
    const newEntry = oldEntry.replace(
      'name: "' + change.name + '"',
      'name: "' + change.normalizedName + '"'
    );
    newContent = newContent.replace(oldEntry, newEntry);
  });

  // 写入文件
  fs.writeFileSync(indexPath, newContent, "utf8");

  console.log("\n规范化结果:");
  console.log("总条目数:", allRelations.length);
  console.log("已更新条目数:", changes.length);
  console.log("\n更新明细:");

  // 按照关系路径长度分类显示更新
  const changesByLength = new Map();
  changes.forEach((c) => {
    const tokens = c.pathStr
      .split(",")
      .map((s) => s.replace(/["'\s]/g, ""))
      .filter(Boolean);
    const len = tokens.length;
    if (!changesByLength.has(len)) {
      changesByLength.set(len, []);
    }
    changesByLength.get(len).push(c);
  });

  // 打印各类更新
  for (const [len, items] of changesByLength) {
    console.log(`\n${len}层关系 (${items.length}个):`);
    items.forEach((c) => {
      const path = c.pathStr.replace(/["'\s]/g, "");
      console.log(
        `  ${path.split(",").join("-")} : ${c.name} => ${c.normalizedName}`
      );
    });
  }
}

run();
