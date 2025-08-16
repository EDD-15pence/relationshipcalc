const fs = require("fs");
const path = require("path");

const indexPath = path.join(__dirname, "..", "pages", "index", "index.js");
const raw = fs.readFileSync(indexPath, "utf8");

const startMarker = "// 以下为自动补充的缺失关系（已修正）";
const endMarker = "// 曾孙辈（通用）";
const si = raw.indexOf(startMarker);
const ei = raw.indexOf(endMarker, si);
if (si === -1 || ei === -1) {
  console.error("找不到自动补充区标记");
  process.exit(2);
}
const block = raw.slice(si + startMarker.length, ei);

const entryRe =
  /\{\s*path:\s*\[([^\]]+)\],\s*name:\s*\"([^\"]*)\",\s*gender:\s*\"both\"\s*\},?/g;
let m;
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
function canonFor(tokens) {
  if (tokens.length === 1) return tokenToLabel[tokens[0]];
  if (tokens.length === 2) {
    const [a, b] = tokens;
    if ((a === "f" || a === "m") && (b === "f" || b === "m")) {
      if (a === "f") return b === "f" ? "爷爷" : "奶奶";
      return b === "f" ? "外公" : "外婆";
    }
    // parent + sibling
    if ((a === "f" || a === "m") && ["ob", "yb", "os", "ys"].includes(b)) {
      if (a === "f") {
        if (b === "ob") return "伯父";
        if (b === "yb") return "叔父";
        if (b === "os" || b === "ys") return "姑妈";
      } else {
        if (b === "ob" || b === "yb") return "舅舅";
        if (b === "os" || b === "ys") return "姨妈";
      }
    }
    // child chain
    if ((a === "s" || a === "d") && (b === "s" || b === "d")) {
      const ext = a === "d" ? "外" : "";
      return ext + (b === "s" ? "孙子" : "孙女");
    }
    // spouse+parent or spouse+child fallback
    if ((a === "h" || a === "w") && (b === "f" || b === "m"))
      return tokenToLabel[a] + "的" + tokenToLabel[b];
    if ((a === "h" || a === "w") && (b === "s" || b === "d"))
      return tokenToLabel[a] + "的" + tokenToLabel[b];
  }
  return null;
}

const candidates = [];
while ((m = entryRe.exec(block)) !== null) {
  const inside = m[1];
  const name = m[2];
  const tokens = inside
    .split(",")
    .map((s) => s.replace(/["'\s]/g, ""))
    .filter(Boolean);
  if (tokens.length <= 2) {
    const canon = canonFor(tokens);
    if (canon && canon !== name) {
      candidates.push({ tokens, old: name, canon });
    }
  }
}

console.log("候选数量:", candidates.length);
candidates
  .slice(0, 200)
  .forEach((c) => console.log(c.tokens.join("-"), "=>", c.old, "->", c.canon));

if (candidates.length === 0) process.exit(0);
else process.exit(0);
