const fs = require("fs");
const path = require("path");

const repoRoot = path.join(__dirname, "..", "..");
const missingPath = path.join(
  repoRoot,
  "scripts",
  "01-test",
  "missing-relations.txt"
);
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

function readMissing() {
  const raw = fs.readFileSync(missingPath, "utf8");
  const VALID_LINE_RE =
    /^(?:-\s*)?(?:f|m|h|w|ob|yb|os|ys|s|d)(?:-(?:f|m|h|w|ob|yb|os|ys|s|d))*$/;
  return raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => VALID_LINE_RE.test(l))
    .filter((l) => !l.startsWith("-")) // 过滤掉以负号开头的行（不需要的关系）
    .map((l) => l.replace(/^[-\s]*/, ""))
    .map((l) =>
      l
        .split("-")
        .map((t) => t.trim())
        .filter(Boolean)
    );
}

function buildEntry(tokens) {
  const name = tokens.map((t) => tokenToLabel[t] || t).join("的");
  return `  { path: [${tokens
    .map((t) => '"' + t + '"')
    .join(", ")}], name: "${name}", gender: "both" },`;
}

function sync() {
  const missing = readMissing();
  const indexRaw = fs.readFileSync(indexPath, "utf8");

  const startMarker = "// 以下为自动补充的缺失关系（已修正）";
  const endMarker = "// 曾孙辈（通用）";
  const startIdx = indexRaw.indexOf(startMarker);
  const endIdx = indexRaw.indexOf(endMarker, startIdx);
  if (startIdx === -1 || endIdx === -1) {
    console.error("无法定位自动补充区的标记，请手动检查 index.js");
    process.exit(2);
  }

  // 找出现有 path set（避免重复）
  const pathRe = /\{\s*path:\s*\[([^\]]+)\],/g;
  const existing = new Set();
  let m;
  while ((m = pathRe.exec(indexRaw)) !== null) {
    const inside = m[1]
      .split(",")
      .map((s) => s.replace(/['"\s]/g, ""))
      .filter(Boolean)
      .join("-");
    existing.add(inside);
  }

  const unique = [];
  for (const tokens of missing) {
    const key = tokens.join("-");
    if (!existing.has(key)) {
      existing.add(key);
      unique.push(tokens);
    }
  }

  // 如果没有新条目需要添加，直接返回
  if (unique.length === 0) {
    console.log("没有新条目需要添加");
    return;
  }

  // 在自动补充区的末尾添加新条目，而不是替换整个区域
  const insertPoint = endIdx;
  const newEntries = unique.map(buildEntry).join("\n") + "\n";
  const header = `\n  // 自动同步自 missing-relations.txt，共 ${unique.length} 条新条目（去重后）\n`;

  const newContent =
    indexRaw.slice(0, insertPoint) +
    header +
    newEntries +
    "\n  " +
    indexRaw.slice(insertPoint);

  fs.writeFileSync(indexPath, newContent, "utf8");
  console.log("已更新", indexPath, "添加条目:", unique.length);
}

sync();
