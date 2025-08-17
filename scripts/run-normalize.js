const { execSync } = require("child_process");
const path = require("path");

function runScript(scriptName) {
  console.log(`\n运行 ${scriptName}...`);
  try {
    execSync(`node ${path.join(__dirname, scriptName)}`, { stdio: "inherit" });
    return true;
  } catch (error) {
    console.error(`运行 ${scriptName} 失败`);
    return false;
  }
}

// 按顺序运行脚本
console.log("开始执行标准化流程...\n");

// 1. 运行标准化脚本
const normalizeSuccess = runScript("normalize-auto-entries.js");

// 2. 如果标准化成功，运行验证脚本
if (normalizeSuccess) {
  runScript("validate-missing.js");
} else {
  console.error("标准化失败，跳过验证步骤");
  process.exit(1);
}
