const path = require("path");
const fs = require("fs");

// 在 Node 环境中 mock 小程序全局对象，避免 Page(...) 运行时报错
if (typeof global.Page === "undefined") global.Page = function () {};
if (typeof global.wx === "undefined")
  global.wx = { showShareMenu: function () {} };

const idx = require("../../pages/index/index.js");

// 只保留形如: "yb-ob-m" 或 "- yb-ob-m" 的有效 token 行，忽略注释或统计行
const VALID_LINE_RE =
  /^(?:-\s*)?(?:f|m|h|w|ob|yb|os|ys|s|d)(?:-(?:f|m|h|w|ob|yb|os|ys|s|d))*$/;

const missing = fs
  .readFileSync(
    path.join(__dirname, "..", "01-test", "missing-relations.txt"),
    "utf8"
  )
  .split(/\r?\n/)
  .map((l) => l.trim())
  .filter(Boolean)
  .filter((l) => VALID_LINE_RE.test(l));

function parseLine(line) {
  // 清理可能的前导 '- '，然后按 '-' 分割 token
  const clean = line.replace(/^[-\s]*/, "");
  return clean
    .split("-")
    .map((t) => t.trim())
    .filter(Boolean);
}

const failures = [];
missing.forEach((line) => {
  const tokens = parseLine(line).map((t) => t);
  try {
    const res = idx.findResult(true, tokens);
    if (!res || (res.name && res.name.includes("未收录"))) {
      failures.push({ line, tokens, res });
    }
  } catch (e) {
    failures.push({ line, tokens, err: e.message });
  }
});

console.log("总条目:", missing.length);
console.log("失败条目:", failures.length);
if (failures.length) console.log(JSON.stringify(failures, null, 2));

process.exit(failures.length ? 1 : 0);
