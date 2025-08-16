const fs = require("fs");
const path = require("path");

const repoRoot = path.join(__dirname, "..");
const indexPath = path.join(repoRoot, "pages", "index", "index.js");

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

function buildAncestorName(seq) {
  const n = seq.length;
  if (n === 1) return seq[0] === "f" ? "爸爸" : "妈妈";
  if (n === 2) {
    if (seq[0] === "f") return seq[1] === "f" ? "爷爷" : "奶奶";
    return seq[1] === "f" ? "外公" : "外婆";
  }
  return seq.map((t) => tokenToLabel[t] || t).join("的");
}

function buildDescendantName(seq) {
  const n = seq.length;
  if (n === 1) return seq[0] === "s" ? "儿子" : "女儿";
  if (n === 2) {
    const ext = seq[0] === "d" ? "外" : "";
    return ext + (seq[1] === "s" ? "孙子" : "孙女");
  }
  return seq.map((t) => tokenToLabel[t] || t).join("的");
}

function normalizeTwoTokens(a, b) {
  // parent + sibling
  if ((a === "f" || a === "m") && ["ob", "yb", "os", "ys"].includes(b)) {
    if (a === "f") {
      if (b === "ob") return "伯父";
      if (b === "yb") return "叔父";
      if (b === "os") return "姑妈";
      if (b === "ys") return "姑姑";
    }
    if (a === "m") {
      if (b === "ob" || b === "yb") return "舅舅";
      if (b === "os" || b === "ys") return "姨妈";
    }
  }
  // generic spouse/child combos keep descriptive short forms
  if ((a === "h" || a === "w") && (b === "s" || b === "d")) {
    return tokenToLabel[a] + "的" + tokenToLabel[b];
  }
  // sibling + parent/other fallback
  return null;
}

function run() {
  let raw = fs.readFileSync(indexPath, "utf8");

  const startMarker = "// 以下为自动补充的缺失关系（已修正）";
  const endMarker = "// 曾孙辈（通用）"; // 与 index.js 中的注释完全匹配（全角括号）
  const si = raw.indexOf(startMarker);
  const ei = raw.indexOf(endMarker, si);
  if (si === -1 || ei === -1) {
    console.error("找不到自动补充区的标记，跳过");
    process.exit(2);
  }

  const before = raw.slice(0, si + startMarker.length);
  const after = raw.slice(ei);
  const block = raw.slice(si + startMarker.length, ei);

  const entryRe =
    /(\{\s*path:\s*\[([^\]]+)\],\s*name:\s*\"([^\"]*)\",\s*gender:\s*\"both\"\s*\},?)/g;
  let m;
  let replaced = block;
  const updates = [];
  while ((m = entryRe.exec(block)) !== null) {
    const full = m[1];
    const inside = m[2];
    const name = m[3];
    const tokens = inside
      .split(",")
      .map((s) => s.replace(/["'\s]/g, ""))
      .filter(Boolean);
    let newName = name;

    try {
      if (tokens.length === 1) {
        newName = tokenToLabel[tokens[0]] || newName;
      } else if (tokens.length === 2) {
        // ancestor/descendant
        if (
          (tokens[0] === "f" || tokens[0] === "m") &&
          (tokens[1] === "f" || tokens[1] === "m")
        ) {
          newName = buildAncestorName(tokens);
        } else if (
          (tokens[0] === "s" || tokens[0] === "d") &&
          (tokens[1] === "s" || tokens[1] === "d")
        ) {
          newName = buildDescendantName(tokens);
        } else {
          const two = normalizeTwoTokens(tokens[0], tokens[1]);
          if (two) newName = two;
          else newName = tokens.map((t) => tokenToLabel[t] || t).join("的");
        }
      } else if (tokens.length === 3) {
        // 规范化：后代链 + 配偶（例如 d-d-h => 外孙女的老公）
        const [a, b, c] = tokens;
        try {
          const isDescendantPair =
            (a === "s" || a === "d") && (b === "s" || b === "d");
          const isSpouse = c === "h" || c === "w";
          if (isDescendantPair && isSpouse) {
            // 使用 buildDescendantName 生成 后代称谓，再根据配偶性别做更自然的拼接
            const desc = buildDescendantName([a, b]);
            if (c === "h") {
              // 男性配偶：如果后代称谓以“女”结尾，使用“婿”（如“外孙女婿”），否则回退为“的老公”
              if (desc.endsWith("女")) newName = desc + "婿";
              else newName = desc + "的老公";
            } else {
              // 女性配偶：保留“的老婆”回退
              newName = desc + "的老婆";
            }
          } else {
            // 保持原样
            newName = name;
          }
        } catch (e) {
          newName = name;
        }
      } else {
        // keep existing for longer paths
        newName = name;
      }
    } catch (e) {
      // fallback
      newName = tokens.map((t) => tokenToLabel[t] || t).join("的");
    }

    if (newName !== name) {
      const newFull = full.replace(`name: "${name}"`, `name: "${newName}"`);
      replaced = replaced.replace(full, newFull);
      updates.push({ tokens, old: name, newName });
    }
  }

  if (updates.length === 0) {
    console.log("未检测到需要修改的条目");
    return;
  }

  const newContent = before + replaced + after;
  fs.writeFileSync(indexPath, newContent, "utf8");

  console.log("已规范化条目数:", updates.length);
  // 列出前 20 个修改以便审阅
  updates
    .slice(0, 20)
    .forEach((u) => console.log(u.tokens.join("-"), u.old, "=>", u.newName));
}

run();
