const fs = require("fs");
const path = require("path");

const repoRoot = path.join(__dirname, "..");
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

  // 路径化简规则
  function simplifyPath(tokens) {
    // 转换为数组以便处理
    const path = [...tokens];
    let changed = true;

    while (changed) {
      changed = false;

      // 规则1: 父母的配偶就是父母
      // f,m,h -> f (爸爸的妈妈的老公 -> 爷爷)
      // f,m,w -> f (爸爸的妈妈的老婆 -> 奶奶)
      for (let i = 0; i < path.length - 2; i++) {
        if (
          (path[i] === "f" || path[i] === "m") &&
          (path[i + 1] === "m" || path[i + 1] === "f") &&
          (path[i + 2] === "h" || path[i + 2] === "w")
        ) {
          path.splice(i + 1, 2);
          changed = true;
          break;
        }
      }

      // 规则2: 祖辈配偶的子女映射
      // f,f,w,s -> special (爷爷的老婆的儿子 -> 爸爸/伯伯/叔叔)
      // f,f,h,s -> special (爷爷的老公的儿子 -> 爸爸/伯伯/叔叔)
      // f,m,w,s -> special (奶奶的老婆的儿子 -> 爸爸/伯伯/叔叔)
      // f,m,h,s -> special (奶奶的老公的儿子 -> 爸爸/伯伯/叔叔)
      for (let i = 0; i < path.length - 3; i++) {
        if (
          path[i] === "f" &&
          (path[i + 1] === "f" || path[i + 1] === "m") &&
          (path[i + 2] === "h" || path[i + 2] === "w") &&
          path[i + 3] === "s"
        ) {
          // 标记为特殊情况，稍后处理
          path.splice(i, 4, "special_paternal_uncle");
          changed = true;
          break;
        }
        // 外祖父母的配偶的子女
        if (
          path[i] === "m" &&
          (path[i + 1] === "f" || path[i + 1] === "m") &&
          (path[i + 2] === "h" || path[i + 2] === "w") &&
          path[i + 3] === "s"
        ) {
          path.splice(i, 4, "special_maternal_uncle");
          changed = true;
          break;
        }
      }

      // 规则3: 父母的子女化简为父母（仅在直接父母子女关系时）
      // f,m,s -> f (爸爸的妈妈的儿子 -> 爸爸)
      // f,m,d -> f (爸爸的妈妈的女儿 -> 爸爸)
      // f,f,s -> f (爸爸的爸爸的儿子 -> 爸爸)
      // f,f,d -> f (爸爸的爸爸的女儿 -> 爸爸)
      // 注意：这个规则只在直接父母子女关系时应用，避免误化简兄弟姐妹
      for (let i = 0; i < path.length - 2; i++) {
        if (
          (path[i] === "f" || path[i] === "m") &&
          (path[i + 1] === "f" || path[i + 1] === "m") &&
          (path[i + 2] === "s" || path[i + 2] === "d") &&
          // 确保中间的不是兄弟姐妹
          !["ob", "yb", "os", "ys"].includes(path[i + 1])
        ) {
          path.splice(i + 1, 2);
          changed = true;
          break;
        }
      }

      // 规则4: 兄弟姐妹的父母化简为父母（仅在路径开头时）
      // ob,f -> f (哥哥的爸爸 -> 爸爸)
      // ob,m -> m (哥哥的妈妈 -> 妈妈)
      // os,f -> f (姐姐的爸爸 -> 爸爸)
      // os,m -> m (姐姐的妈妈 -> 妈妈)
      // yb,f -> f (弟弟的爸爸 -> 爸爸)
      // yb,m -> m (弟弟的妈妈 -> 妈妈)
      // ys,f -> f (妹妹的爸爸 -> 爸爸)
      // ys,m -> m (妹妹的妈妈 -> 妈妈)
      // 注意：这个规则只在路径开头时应用，避免过度化简
      if (
        path.length >= 2 &&
        ["ob", "yb", "os", "ys"].includes(path[0]) &&
        (path[1] === "f" || path[1] === "m")
      ) {
        path.splice(0, 1);
        changed = true;
      }

      // 规则5: 兄弟姐妹子女的配偶化简
      // ob,s,w -> 侄媳妇 (哥哥的儿子的老婆 -> 侄媳妇)
      // ob,s,h -> 侄女婿 (哥哥的女儿的老公 -> 侄女婿)
      // ob,d,w -> 侄媳妇 (哥哥的女儿的老婆 -> 侄媳妇)
      // ob,d,h -> 侄女婿 (哥哥的女儿的老公 -> 侄女婿)
      // os,s,w -> 侄媳妇 (姐姐的儿子的老婆 -> 侄媳妇)
      // os,s,h -> 侄女婿 (姐姐的女儿的老公 -> 侄女婿)
      // os,d,w -> 侄媳妇 (姐姐的女儿的老婆 -> 侄媳妇)
      // os,d,h -> 侄女婿 (姐姐的女儿的老公 -> 侄女婿)
      for (let i = 0; i < path.length - 3; i++) {
        if (
          ["ob", "yb", "os", "ys"].includes(path[i]) &&
          (path[i + 1] === "s" || path[i + 1] === "d") &&
          (path[i + 2] === "h" || path[i + 2] === "w")
        ) {
          // 标记为特殊情况，稍后处理
          if (path[i + 2] === "w") {
            path.splice(i, 3, "special_niece_in_law");
          } else {
            path.splice(i, 3, "special_nephew_in_law");
          }
          changed = true;
          break;
        }
      }

      // 规则6: 兄弟姐妹父母的配偶化简（新增）
      // f,ob,f,w -> 奶奶 (爸爸的哥哥的爸爸的老婆 -> 奶奶)
      // f,ob,f,h -> 爷爷 (爸爸的哥哥的爸爸的老公 -> 爷爷)
      // f,ob,m,w -> 奶奶 (爸爸的哥哥的妈妈的老婆 -> 奶奶)
      // f,ob,m,h -> 外公 (爸爸的哥哥的妈妈的老公 -> 外公)
      // m,ob,f,w -> 外婆 (妈妈的哥哥的爸爸的老婆 -> 外婆)
      // m,ob,f,h -> 外公 (妈妈的哥哥的爸爸的老公 -> 外公)
      // m,ob,m,w -> 外婆 (妈妈的哥哥的妈妈的老婆 -> 外婆)
      // m,ob,m,h -> 外公 (妈妈的哥哥的妈妈的老公 -> 外公)
      for (let i = 0; i < path.length - 3; i++) {
        if (
          (path[i] === "f" || path[i] === "m") &&
          ["ob", "yb", "os", "ys"].includes(path[i + 1]) &&
          (path[i + 2] === "f" || path[i + 2] === "m") &&
          (path[i + 3] === "h" || path[i + 3] === "w")
        ) {
          // 标记为特殊情况，稍后处理
          if (path[i] === "f") {
            if (path[i + 2] === "f") {
              // 爸爸的兄弟姐妹的爸爸的配偶
              if (path[i + 3] === "w") {
                path.splice(i, 4, "special_paternal_grandmother");
              } else {
                path.splice(i, 4, "special_paternal_grandfather");
              }
            } else {
              // 爸爸的兄弟姐妹的妈妈的配偶
              if (path[i + 3] === "w") {
                path.splice(i, 4, "special_paternal_grandmother");
              } else {
                path.splice(i, 4, "special_paternal_grandfather");
              }
            }
          } else {
            // 妈妈的兄弟姐妹的父母的配偶
            if (path[i + 3] === "w") {
              path.splice(i, 4, "special_maternal_grandmother");
            } else {
              path.splice(i, 4, "special_maternal_grandfather");
            }
          }
          changed = true;
          break;
        }
      }

      // 规则7: 祖辈的兄弟姐妹化简（新增）
      // f,f,ob -> 伯公 (爸爸的爸爸的哥哥 -> 伯公)
      // f,f,yb -> 叔公 (爸爸的爸爸的弟弟 -> 叔公)
      // f,f,os -> 姑婆 (爸爸的爸爸的姐姐 -> 姑婆)
      // f,f,ys -> 姑婆 (爸爸的爸爸的妹妹 -> 姑婆)
      // f,m,ob -> 舅公 (爸爸的妈妈的哥哥 -> 舅公)
      // f,m,yb -> 舅公 (爸爸的妈妈的弟弟 -> 舅公)
      // f,m,os -> 姨婆 (爸爸的妈妈的姐姐 -> 姨婆)
      // f,m,ys -> 姨婆 (爸爸的妈妈的妹妹 -> 姨婆)
      // m,f,ob -> 伯公 (妈妈的爸爸的哥哥 -> 伯公)
      // m,f,yb -> 叔公 (妈妈的爸爸的弟弟 -> 叔公)
      // m,f,os -> 姑婆 (妈妈的爸爸的姐姐 -> 姑婆)
      // m,f,ys -> 姑婆 (妈妈的爸爸的妹妹 -> 姑婆)
      // m,m,ob -> 舅公 (妈妈的妈妈的哥哥 -> 舅公)
      // m,m,yb -> 舅公 (妈妈的妈妈的弟弟 -> 舅公)
      // m,m,os -> 姨婆 (妈妈的妈妈的姐姐 -> 姨婆)
      // m,m,ys -> 姨婆 (妈妈的妈妈的妹妹 -> 姨婆)
      for (let i = 0; i < path.length - 2; i++) {
        if (
          (path[i] === "f" || path[i] === "m") &&
          (path[i + 1] === "f" || path[i + 1] === "m") &&
          ["ob", "yb", "os", "ys"].includes(path[i + 2])
        ) {
          // 标记为特殊情况，稍后处理
          if (path[i] === "f") {
            if (path[i + 1] === "f") {
              // 爸爸的爸爸的兄弟姐妹
              if (path[i + 2] === "ob" || path[i + 2] === "yb") {
                path.splice(i, 3, "special_paternal_granduncle");
              } else {
                path.splice(i, 3, "special_paternal_grandaunt");
              }
            } else {
              // 爸爸的妈妈的兄弟姐妹
              if (path[i + 2] === "ob" || path[i + 2] === "yb") {
                path.splice(i, 3, "special_paternal_granduncle");
              } else {
                path.splice(i, 3, "special_paternal_grandaunt");
              }
            }
          } else {
            // 妈妈的父母的兄弟姐妹
            if (path[i + 2] === "ob" || path[i + 2] === "yb") {
              path.splice(i, 3, "special_maternal_granduncle");
            } else {
              path.splice(i, 3, "special_maternal_grandaunt");
            }
          }
          changed = true;
          break;
        }
      }
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

    // 处理特殊情况
    if (simplifiedTokens.length === 1) {
      if (simplifiedTokens[0] === "special_paternal_uncle") {
        return {
          ...relation,
          normalizedName: "爸爸/伯伯/叔叔",
        };
      }
      if (simplifiedTokens[0] === "special_maternal_uncle") {
        return {
          ...relation,
          normalizedName: "舅舅",
        };
      }
      if (simplifiedTokens[0] === "special_niece_in_law") {
        return {
          ...relation,
          normalizedName: "侄媳妇",
        };
      }
      if (simplifiedTokens[0] === "special_nephew_in_law") {
        return {
          ...relation,
          normalizedName: "侄女婿",
        };
      }

      if (simplifiedTokens[0] === "special_paternal_grandmother") {
        return {
          ...relation,
          normalizedName: "奶奶",
        };
      }
      if (simplifiedTokens[0] === "special_paternal_grandfather") {
        return {
          ...relation,
          normalizedName: "爷爷",
        };
      }
      if (simplifiedTokens[0] === "special_maternal_grandmother") {
        return {
          ...relation,
          normalizedName: "外婆",
        };
      }
      if (simplifiedTokens[0] === "special_maternal_grandfather") {
        return {
          ...relation,
          normalizedName: "外公",
        };
      }
      if (simplifiedTokens[0] === "special_paternal_granduncle") {
        return {
          ...relation,
          normalizedName: "舅公",
        };
      }
      if (simplifiedTokens[0] === "special_paternal_grandaunt") {
        return {
          ...relation,
          normalizedName: "姨婆",
        };
      }
      if (simplifiedTokens[0] === "special_maternal_granduncle") {
        return {
          ...relation,
          normalizedName: "舅公",
        };
      }
      if (simplifiedTokens[0] === "special_maternal_grandaunt") {
        return {
          ...relation,
          normalizedName: "姨婆",
        };
      }
    }

    // 1. 先检查化简后的路径是否有对应的标准称谓
    let newName = standardMap.get(simplifiedKey);
    if (newName) {
      return {
        ...relation,
        normalizedName: newName,
      };
    }

    // 2. 如果当前称谓已经是标准称谓，保持不变
    if (Array.from(standardMap.values()).includes(relation.name)) {
      return {
        ...relation,
        normalizedName: relation.name,
      };
    }

    // 3. 尝试原始路径
    newName = standardMap.get(tokens.join(","));

    // 4. 如果还是没找到，退化为基础称谓拼接
    if (!newName) {
      if (tokens.length === 1) {
        newName = tokenToLabel[tokens[0]] || relation.name;
      } else {
        newName = tokens.map((t) => tokenToLabel[t] || t).join("的");
      }
    }

    return {
      ...relation,
      normalizedName: newName,
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
