const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

// 颜色输出
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runScript(scriptPath, description) {
  log(`\n${colors.bright}${colors.blue}🚀 ${description}${colors.reset}`);
  log(`${colors.cyan}运行: ${scriptPath}${colors.reset}`);

  try {
    const startTime = Date.now();
    execSync(`node ${scriptPath}`, {
      stdio: "inherit",
      cwd: path.dirname(scriptPath),
    });
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    log(`${colors.green}✅ ${description} 完成 (${duration}s)${colors.reset}`);
    return true;
  } catch (error) {
    log(`${colors.red}❌ ${description} 失败${colors.reset}`);
    log(`${colors.red}错误: ${error.message}${colors.reset}`);
    return false;
  }
}

function runPythonScript(scriptPath, description) {
  log(`\n${colors.bright}${colors.blue}🚀 ${description}${colors.reset}`);
  log(`${colors.cyan}运行: ${scriptPath}${colors.reset}`);

  try {
    const startTime = Date.now();
    execSync(`python ${scriptPath}`, {
      stdio: "inherit",
      cwd: path.dirname(scriptPath),
    });
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    log(`${colors.green}✅ ${description} 完成 (${duration}s)${colors.reset}`);
    return true;
  } catch (error) {
    log(`${colors.red}❌ ${description} 失败${colors.reset}`);
    log(`${colors.red}错误: ${error.message}${colors.reset}`);
    return false;
  }
}

function checkDependencies() {
  log(`${colors.bright}${colors.yellow}🔍 检查依赖...${colors.reset}`);

  const dependencies = [
    { name: "Node.js", command: "node --version" },
    { name: "Python", command: "python --version" },
  ];

  for (const dep of dependencies) {
    try {
      const version = execSync(dep.command, { encoding: "utf8" }).trim();
      log(`${colors.green}✅ ${dep.name}: ${version}${colors.reset}`);
    } catch (error) {
      log(`${colors.red}❌ ${dep.name} 未安装或不可用${colors.reset}`);
      return false;
    }
  }

  return true;
}

function main() {
  log(
    `${colors.bright}${colors.magenta}🎯 关系计算器项目维护脚本${colors.reset}`
  );
  log(`${colors.cyan}================================${colors.reset}`);

  const startTime = Date.now();

  // 检查依赖
  if (!checkDependencies()) {
    log(`${colors.red}❌ 依赖检查失败，请安装必要的依赖${colors.reset}`);
    process.exit(1);
  }

  // 定义维护步骤
  const steps = [
    {
      type: "node",
      path: path.join(__dirname, "01-test", "test.js"),
      description: "步骤 1: 运行测试，发现未收录关系",
    },
    {
      type: "node",
      path: path.join(__dirname, "02-validate", "validate-missing.js"),
      description: "步骤 2: 验证缺失关系",
    },
    {
      type: "node",
      path: path.join(__dirname, "03-sync", "sync-missing-to-index.js"),
      description: "步骤 3: 同步缺失关系到代码",
    },
    {
      type: "node",
      path: path.join(__dirname, "04-normalize", "run-normalize.js"),
      description: "步骤 4: 规范化关系名称",
    },
    {
      type: "python",
      path: path.join(__dirname, "data", "extract_relations.py"),
      description: "步骤 5: 提取关系到 relations.json",
    },
    {
      type: "python",
      path: path.join(__dirname, "05-audio", "upload_to_github.py"),
      description: "步骤 6: 生成音频并上传到 GitHub",
    },
  ];

  let successCount = 0;
  let totalSteps = steps.length;

  // 执行每个步骤
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const stepNumber = i + 1;

    log(
      `\n${colors.bright}${colors.blue}📋 步骤 ${stepNumber}/${totalSteps}${colors.reset}`
    );

    let success = false;
    if (step.type === "node") {
      success = runScript(step.path, step.description);
    } else if (step.type === "python") {
      success = runPythonScript(step.path, step.description);
    }

    if (success) {
      successCount++;
    } else {
      log(`\n${colors.red}❌ 维护流程在第 ${stepNumber} 步失败${colors.reset}`);
      log(`${colors.yellow}💡 请检查错误信息并修复后重新运行${colors.reset}`);
      process.exit(1);
    }
  }

  // 完成总结
  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1);

  log(`\n${colors.bright}${colors.green}🎉 维护流程完成！${colors.reset}`);
  log(`${colors.cyan}================================${colors.reset}`);
  log(
    `${colors.green}✅ 成功完成: ${successCount}/${totalSteps} 个步骤${colors.reset}`
  );
  log(`${colors.blue}⏱️  总耗时: ${totalDuration} 秒${colors.reset}`);

  log(`\n${colors.bright}${colors.yellow}📋 完成的任务:${colors.reset}`);
  log(`${colors.green}  • 测试关系计算逻辑${colors.reset}`);
  log(`${colors.green}  • 验证缺失关系${colors.reset}`);
  log(`${colors.green}  • 同步缺失关系到代码${colors.reset}`);
  log(`${colors.green}  • 规范化关系名称${colors.reset}`);
  log(`${colors.green}  • 提取关系到 relations.json${colors.reset}`);
  log(`${colors.green}  • 生成音频并上传到 GitHub${colors.reset}`);

  log(
    `\n${colors.bright}${colors.cyan}🚀 项目维护完成！音频文件已可通过 CDN 访问${colors.reset}`
  );
}

// 处理中断信号
process.on("SIGINT", () => {
  log(`\n${colors.yellow}⚠️  维护流程被用户中断${colors.reset}`);
  process.exit(1);
});

// 运行主函数
main();
