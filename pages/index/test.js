// 这是一个用于自动化测试关系计算器核心逻辑的脚本。
// 您可以通过 Node.js 来运行它 (例如: node pages/index/test.js)

// 模拟微信小程序环境
global.Page = function () {};
global.wx = {
  showShareMenu: function () {},
  showModal: function () {},
  showToast: function () {},
};

const {
  findResult,
  findReverseResult,
  normalizePath,
  relationshipMappings,
  labelToToken,
} = require("./index.js");

// --- 测试核心 ---
let failed = 0;
let passed = 0;
let totalTests = 0;
let missingRelations = []; // 记录未收录的关系

function runTest(name, testFn) {
  totalTests++;
  try {
    testFn();
    console.log(`✅ PASS: ${name}`);
    passed++;
  } catch (e) {
    console.error(`❌ FAIL: ${name}`);
    console.error(e.message);
    failed++;
  }
}

function assertEqual(actual, expected, context) {
  if (actual !== expected) {
    throw new Error(
      `[${context}] 预期结果: "${expected}", 实际结果: "${actual}"`
    );
  }
}

// --- 生成测试用例 ---

// 定义所有可用的token
const allTokens = ["f", "m", "h", "w", "ob", "yb", "os", "ys", "s", "d"];

// 生成长度为1的组合
const length1Combinations = allTokens.map((token) => [token]);

// 生成长度为2的组合
const length2Combinations = [];
for (let i = 0; i < allTokens.length; i++) {
  for (let j = 0; j < allTokens.length; j++) {
    length2Combinations.push([allTokens[i], allTokens[j]]);
  }
}

// 生成长度为3的组合
const length3Combinations = [];
for (let i = 0; i < allTokens.length; i++) {
  for (let j = 0; j < allTokens.length; j++) {
    for (let k = 0; k < allTokens.length; k++) {
      length3Combinations.push([allTokens[i], allTokens[j], allTokens[k]]);
    }
  }
}

// 合并所有要测试的组合
const allCombinations = [
  ...length1Combinations,
  ...length2Combinations,
  ...length3Combinations,
];

console.log(`开始测试 ${allCombinations.length} 个关系组合...`);
console.log(`长度1: ${length1Combinations.length} 个`);
console.log(`长度2: ${length2Combinations.length} 个`);
console.log(`长度3: ${length3Combinations.length} 个`);
console.log("");

// --- 测试所有组合 ---

// 测试正向关系（我称呼TA）
allCombinations.forEach((path, index) => {
  const pathStr = path.join("-");

  // 测试男性视角
  runTest(`正向-男: ${pathStr}`, () => {
    const result = findResult(true, path);
    if (result === "未收录的关系（待完善）") {
      missingRelations.push({
        type: "正向-男",
        path: pathStr,
        result: result,
      });
    }
    // 不抛出错误，只是记录未收录的关系
  });

  // 测试女性视角
  runTest(`正向-女: ${pathStr}`, () => {
    const result = findResult(false, path);
    if (result === "未收录的关系（待完善）") {
      missingRelations.push({
        type: "正向-女",
        path: pathStr,
        result: result,
      });
    }
    // 不抛出错误，只是记录未收录的关系
  });
});

// 测试反向关系（TA称呼我）
allCombinations.forEach((path, index) => {
  const pathStr = path.join("-");

  // 测试男性视角
  runTest(`反向-男: ${pathStr}`, () => {
    const result = findReverseResult(true, path);
    if (result === "未收录的关系（待完善）") {
      missingRelations.push({
        type: "反向-男",
        path: pathStr,
        result: result,
      });
    }
    // 不抛出错误，只是记录未收录的关系
  });

  // 测试女性视角
  runTest(`反向-女: ${pathStr}`, () => {
    const result = findReverseResult(false, path);
    if (result === "未收录的关系（待完善）") {
      missingRelations.push({
        type: "反向-女",
        path: pathStr,
        result: result,
      });
    }
    // 不抛出错误，只是记录未收录的关系
  });
});

// --- 特殊测试用例 ---
console.log("\n--- 特殊测试用例 ---");

// 测试一些已知应该正确的关系
const knownCorrectCases = [
  { path: ["f"], expected: "爸爸", description: "爸爸" },
  { path: ["m"], expected: "妈妈", description: "妈妈" },
  { path: ["f", "f"], expected: "爷爷", description: "爸爸的爸爸" },
  { path: ["f", "m"], expected: "奶奶", description: "爸爸的妈妈" },
  { path: ["m", "f"], expected: "外公", description: "妈妈的爸爸" },
  { path: ["m", "m"], expected: "外婆", description: "妈妈的妈妈" },
  { path: ["f", "ob"], expected: "伯伯", description: "爸爸的哥哥" },
  { path: ["f", "yb"], expected: "叔叔", description: "爸爸的弟弟" },
  { path: ["f", "ob", "w"], expected: "伯母", description: "爸爸的哥哥的老婆" },
  {
    path: ["f", "ob", "m", "h"],
    expected: "爷爷",
    description: "爸爸的哥哥的妈妈的老公",
  },
  {
    path: ["f", "m", "h", "s"],
    expected: "爸爸",
    description: "爸爸的妈妈的老公的儿子",
  },
];

knownCorrectCases.forEach((testCase) => {
  runTest(`已知正确: ${testCase.description}`, () => {
    const result = findResult(true, testCase.path);
    assertEqual(result, testCase.expected, testCase.description);
  });
});

// --- 测试总结 ---
console.log("\n-------------------");
console.log(
  `测试完成: ${passed} 通过, ${failed} 失败, 总计 ${totalTests} 个测试`
);
console.log(`发现 ${missingRelations.length} 个未收录的关系`);
console.log("-------------------");

// 将未收录的关系写入文件
const fs = require("fs");
const missingRelationsFile = "missing-relations.txt";

// 按类型分组
const groupedByType = {};
missingRelations.forEach((relation) => {
  if (!groupedByType[relation.type]) {
    groupedByType[relation.type] = [];
  }
  groupedByType[relation.type].push(relation.path);
});

// 生成报告内容
let report = `# 未收录的亲属关系报告\n\n`;
report += `生成时间: ${new Date().toLocaleString()}\n`;
report += `总计未收录关系: ${missingRelations.length} 个\n\n`;

// 按类型输出
Object.keys(groupedByType).forEach((type) => {
  const relations = groupedByType[type];
  report += `## ${type} (${relations.length} 个)\n\n`;

  // 按长度分组
  const byLength = {};
  relations.forEach((path) => {
    const length = path.split("-").length;
    if (!byLength[length]) byLength[length] = [];
    byLength[length].push(path);
  });

  Object.keys(byLength)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .forEach((length) => {
      const paths = byLength[length];
      report += `### 长度 ${length} (${paths.length} 个)\n`;
      paths.sort().forEach((path) => {
        report += `- ${path}\n`;
      });
      report += "\n";
    });
});

// 写入文件
fs.writeFileSync(missingRelationsFile, report, "utf8");
console.log(`\n📄 未收录关系已保存到: ${missingRelationsFile}`);

if (failed > 0) {
  console.log(`\n❌ 有 ${failed} 个测试失败，请检查相关逻辑`);
  process.exit(1); // 以非零状态码退出，表示测试失败
} else {
  console.log("\n✅ 所有测试通过！");
}
