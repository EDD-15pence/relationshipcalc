// 亲属称呼计算核心
// token：f 爸爸, m 妈妈, h 老公, w 老婆, ob 哥哥, yb 弟弟, os 姐姐, ys 妹妹, s 儿子, d 女儿

const labelToToken = {
  爸爸: "f",
  妈妈: "m",
  老公: "h",
  老婆: "w",
  哥哥: "ob",
  弟弟: "yb",
  姐姐: "os",
  妹妹: "ys",
  儿子: "s",
  女儿: "d",
};

function key(sex, path) {
  return sex + "|" + path.join("-");
}

// 辅助函数：为男女两种性别执行相同操作
function forBothGenders(callback) {
  ["male", "female"].forEach(callback);
}

// 亲属关系映射配置
const relationshipMappings = [
  // 基础亲属关系（通用）
  { path: ["f"], name: "爸爸", gender: "both" },
  { path: ["m"], name: "妈妈", gender: "both" },
  { path: ["h"], name: "老公", gender: "female" },
  { path: ["w"], name: "老婆", gender: "male" },
  { path: ["ob"], name: "哥哥", gender: "both" },
  { path: ["yb"], name: "弟弟", gender: "both" },
  { path: ["os"], name: "姐姐", gender: "both" },
  { path: ["ys"], name: "妹妹", gender: "both" },
  { path: ["s"], name: "儿子", gender: "both" },
  { path: ["d"], name: "女儿", gender: "both" },
  // 配偶的父母（通用）
  { path: ["f", "w"], name: "妈妈", gender: "both" },
  { path: ["m", "h"], name: "爸爸", gender: "both" },
  // 祖辈（通用）
  { path: ["f", "f"], name: "爷爷", gender: "both" },
  { path: ["f", "m"], name: "奶奶", gender: "both" },
  { path: ["m", "f"], name: "外公", gender: "both" },
  { path: ["m", "m"], name: "外婆", gender: "both" },
  // 兄弟姐妹的配偶（通用）
  { path: ["ob", "w"], name: "嫂子", gender: "both" },
  { path: ["yb", "w"], name: "弟媳", gender: "both" },
  { path: ["os", "h"], name: "姐夫", gender: "both" },
  { path: ["ys", "h"], name: "妹夫", gender: "both" },
  // 子女的配偶（通用）
  { path: ["s", "w"], name: "儿媳", gender: "both" },
  { path: ["d", "h"], name: "女婿", gender: "both" },
  // 兄弟姐妹的子女（通用）
  { path: ["ob", "s"], name: "侄子", gender: "both" },
  { path: ["ob", "d"], name: "侄女", gender: "both" },
  { path: ["yb", "s"], name: "侄子", gender: "both" },
  { path: ["yb", "d"], name: "侄女", gender: "both" },
  { path: ["os", "s"], name: "外甥", gender: "both" },
  { path: ["os", "d"], name: "外甥女", gender: "both" },
  { path: ["ys", "s"], name: "外甥", gender: "both" },
  { path: ["ys", "d"], name: "外甥女", gender: "both" },
  // 堂亲关系 (父亲的兄弟姐妹的子女)（通用）
  { path: ["f", "ob", "s"], name: "堂哥", gender: "both" },
  { path: ["f", "ob", "d"], name: "堂姐", gender: "both" },
  { path: ["f", "yb", "s"], name: "堂弟", gender: "both" },
  { path: ["f", "yb", "d"], name: "堂妹", gender: "both" },
  { path: ["f", "os", "s"], name: "表哥", gender: "both" },
  { path: ["f", "os", "d"], name: "表姐", gender: "both" },
  { path: ["f", "ys", "s"], name: "表弟", gender: "both" },
  { path: ["f", "ys", "d"], name: "表妹", gender: "both" },
  // 表亲关系 (母亲的兄弟姐妹的子女)（通用）
  { path: ["m", "ob", "s"], name: "表哥", gender: "both" },
  { path: ["m", "ob", "d"], name: "表姐", gender: "both" },
  { path: ["m", "yb", "s"], name: "表弟", gender: "both" },
  { path: ["m", "yb", "d"], name: "表妹", gender: "both" },
  { path: ["m", "os", "s"], name: "表哥", gender: "both" },
  { path: ["m", "os", "d"], name: "表姐", gender: "both" },
  { path: ["m", "ys", "s"], name: "表弟", gender: "both" },
  { path: ["m", "ys", "d"], name: "表妹", gender: "both" },
  // 祖辈的兄弟姐妹关系（通用）
  { path: ["f", "f", "ob"], name: "伯公", gender: "both" },
  { path: ["f", "f", "os"], name: "姑婆", gender: "both" },
  { path: ["f", "m", "ob"], name: "舅公", gender: "both" },
  { path: ["f", "m", "os"], name: "姨婆", gender: "both" },
  { path: ["m", "f", "ob"], name: "伯公", gender: "both" },
  { path: ["m", "f", "os"], name: "姑婆", gender: "both" },
  { path: ["m", "m", "ob"], name: "舅公", gender: "both" },
  { path: ["m", "m", "os"], name: "姨婆", gender: "both" },
  // 曾祖辈关系（通用）
  { path: ["f", "f", "f"], name: "曾祖父", gender: "both" },
  { path: ["f", "f", "m"], name: "曾祖母", gender: "both" },
  { path: ["f", "m", "f"], name: "曾外祖父", gender: "both" },
  { path: ["f", "m", "m"], name: "曾外祖母", gender: "both" },
  { path: ["m", "f", "f"], name: "外曾祖父", gender: "both" },
  { path: ["m", "f", "m"], name: "外曾祖母", gender: "both" },
  { path: ["m", "m", "f"], name: "外曾外祖父", gender: "both" },
  { path: ["m", "m", "m"], name: "外曾外祖母", gender: "both" },
  // 孙辈的子女（通用）
  { path: ["s", "s"], name: "孙子", gender: "both" },
  { path: ["s", "d"], name: "孙女", gender: "both" },
  { path: ["d", "s"], name: "外孙", gender: "both" },
  { path: ["d", "d"], name: "外孙女", gender: "both" },
  // 曾孙辈（通用）
  { path: ["s", "s", "s"], name: "曾孙子", gender: "both" },
  { path: ["s", "s", "d"], name: "曾孙女", gender: "both" },
  { path: ["s", "d", "s"], name: "曾外孙", gender: "both" },
  { path: ["s", "d", "d"], name: "曾外孙女", gender: "both" },
  { path: ["d", "s", "s"], name: "外曾孙子", gender: "both" },
  { path: ["d", "s", "d"], name: "外曾孙女", gender: "both" },
  { path: ["d", "d", "s"], name: "外曾外孙", gender: "both" },
  { path: ["d", "d", "d"], name: "外曾外孙女", gender: "both" },
  // 兄弟姐妹的孙辈关系（通用）
  { path: ["ob", "s", "s"], name: "侄孙", gender: "both" },
  { path: ["ob", "s", "d"], name: "侄孙女", gender: "both" },
  { path: ["yb", "s", "s"], name: "侄孙", gender: "both" },
  { path: ["yb", "s", "d"], name: "侄孙女", gender: "both" },
  { path: ["os", "s", "s"], name: "外甥孙", gender: "both" },
  { path: ["os", "s", "d"], name: "外甥孙女", gender: "both" },
  { path: ["ys", "s", "s"], name: "外甥孙", gender: "both" },
  { path: ["ys", "s", "d"], name: "外甥孙女", gender: "both" },
  // 兄弟姐妹的兄弟姐妹关系（通用）
  { path: ["ob", "ob"], name: "哥哥", gender: "both" },
  { path: ["ob", "os"], name: "姐姐", gender: "both" },
  { path: ["ob", "yb"], name: "弟弟", gender: "both" },
  { path: ["ob", "ys"], name: "妹妹", gender: "both" },
  { path: ["yb", "ob"], name: "哥哥", gender: "both" },
  { path: ["yb", "os"], name: "姐姐", gender: "both" },
  { path: ["yb", "yb"], name: "弟弟", gender: "both" },
  { path: ["yb", "ys"], name: "妹妹", gender: "both" },
  { path: ["os", "ob"], name: "哥哥", gender: "both" },
  { path: ["os", "os"], name: "姐姐", gender: "both" },
  { path: ["os", "yb"], name: "弟弟", gender: "both" },
  { path: ["os", "ys"], name: "妹妹", gender: "both" },
  { path: ["ys", "ob"], name: "哥哥", gender: "both" },
  { path: ["ys", "os"], name: "姐姐", gender: "both" },
  { path: ["ys", "yb"], name: "弟弟", gender: "both" },
  { path: ["ys", "ys"], name: "妹妹", gender: "both" },
  // 配偶的父母（性别特定）
  { path: ["w", "f"], name: "岳父", gender: "male" },
  { path: ["w", "m"], name: "岳母", gender: "male" },
  { path: ["h", "f"], name: "公公", gender: "female" },
  { path: ["h", "m"], name: "婆婆", gender: "female" },
  // 配偶的亲属关系（性别特定）
  { path: ["w", "ob"], name: "大舅子", gender: "male" },
  { path: ["w", "yb"], name: "小舅子", gender: "male" },
  { path: ["w", "os"], name: "大姨子", gender: "male" },
  { path: ["w", "ys"], name: "小姨子", gender: "male" },
  { path: ["h", "ob"], name: "大伯子", gender: "female" },
  { path: ["h", "yb"], name: "小叔子", gender: "female" },
  { path: ["h", "os"], name: "大姑子", gender: "female" },
  { path: ["h", "ys"], name: "小姑子", gender: "female" },
  // 配偶的祖辈（性别特定）
  { path: ["w", "f", "f"], name: "太岳父", gender: "male" },
  { path: ["w", "f", "m"], name: "太岳母", gender: "male" },
  { path: ["h", "f", "f"], name: "太公公", gender: "female" },
  { path: ["h", "f", "m"], name: "太婆婆", gender: "female" },
  // 配偶的子女关系（性别特定）
  { path: ["h", "s"], name: "儿子", gender: "female" },
  { path: ["h", "d"], name: "女儿", gender: "female" },
  { path: ["w", "s"], name: "儿子", gender: "male" },
  { path: ["w", "d"], name: "女儿", gender: "male" },
  // 父母的兄弟姐妹关系（性别特定）
  { path: ["f", "ob"], name: "伯伯", gender: "both" },
  { path: ["f", "yb"], name: "叔叔", gender: "both" }, // 爸爸的弟弟(无论排行)都是叔叔
  { path: ["f", "os"], name: "姑姑", gender: "both" },
  { path: ["f", "ys"], name: "姑姑", gender: "both" },
  { path: ["m", "ob"], name: "舅舅", gender: "both" },
  { path: ["m", "yb"], name: "舅舅", gender: "both" },
  { path: ["m", "os"], name: "姨妈", gender: "both" },
  { path: ["m", "ys"], name: "小姨", gender: "both" },
  // 父母的子女关系（性别特定）
  { path: ["f", "s"], name: "我/兄弟", gender: "male" },
  { path: ["f", "s"], name: "兄弟", gender: "female" },
  { path: ["f", "d"], name: "姐妹", gender: "male" },
  { path: ["f", "d"], name: "我/姐妹", gender: "female" },
  { path: ["m", "s"], name: "我/兄弟", gender: "male" },
  { path: ["m", "s"], name: "兄弟", gender: "female" },
  { path: ["m", "d"], name: "姐妹", gender: "male" },
  { path: ["m", "d"], name: "我/姐妹", gender: "female" },
];

const resultMap = {};

// 处理亲属关系映射
forBothGenders((sex) => {
  relationshipMappings.forEach((mapping) => {
    // 如果gender为both或与当前性别匹配，则添加到resultMap
    if (mapping.gender === "both" || mapping.gender === sex) {
      resultMap[key(sex, mapping.path)] = mapping.name;
    }
  });
});

function normalizePath(tokens) {
  const arr = tokens.slice();
  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < arr.length - 1; i++) {
      const a = arr[i],
        b = arr[i + 1];
      // 配偶关系抵消 (h和w)
      if ((a === "h" && b === "w") || (a === "w" && b === "h")) {
        arr.splice(i, 2);
        changed = true;
        break;
      }
      // 父子/母子关系抵消
      if (
        (a === "s" && (b === "f" || b === "m")) ||
        (a === "d" && (b === "f" || b === "m"))
      ) {
        arr.splice(i, 2);
        changed = true;
        break;
      }
      // 配偶子女关系处理：将[亲属, w/h, s/d]规范化为[亲属, s/d]
      if (
        (a === "ob" || a === "yb" || a === "os" || a === "ys") &&
        (b === "w" || b === "h") &&
        i + 2 < arr.length &&
        (arr[i + 2] === "s" || arr[i + 2] === "d")
      ) {
        // 保留亲属和子女关系，删除配偶关系
        arr.splice(i + 1, 1);
        changed = true;
        break;
      }
      // 相同兄弟姐妹关系抵消（无论是否有共同父母）
      if (
        (a === "ob" && b === "ob") ||
        (a === "yb" && b === "yb") ||
        (a === "os" && b === "os") ||
        (a === "ys" && b === "ys")
      ) {
        arr.splice(i, 2, a);
        changed = true;
        break;
      }
      // 同一父母的兄弟姐妹关系抵消（仅当前面有共同父母时）
      const siblings = ["ob", "yb", "os", "ys"];
      if (
        i > 0 &&
        (arr[i - 1] === "f" || arr[i - 1] === "m") &&
        siblings.includes(a) &&
        siblings.includes(b) &&
        a !== b
      ) {
        // 对于姐弟/兄妹关系，保留弟弟/妹妹
        if ((a === "os" && b === "yb") || (a === "ob" && b === "ys")) {
          arr.splice(i, 2, b);
        } else {
          // 其他情况保留第一个
          arr.splice(i, 2, a);
        }
        changed = true;
        break;
      }
    }
  }
  return arr;
}

function buildAncestorName(fmSeq) {
  const n = fmSeq.length;
  if (n === 1) return fmSeq[0] === "f" ? "爸爸" : "妈妈";
  if (n === 2) {
    if (fmSeq[0] === "f") return fmSeq[1] === "f" ? "爷爷" : "奶奶";
    return fmSeq[1] === "f" ? "外公" : "外婆";
  }
  const lastMale = fmSeq[n - 1] === "f";
  const isPaternal = fmSeq[0] === "f";
  const taiCount = n - 2;
  if (isPaternal)
    return repeatStr("太", taiCount) + (lastMale ? "爷爷" : "奶奶");
  return "外" + repeatStr("太", taiCount) + (lastMale ? "公" : "婆");
}

function buildDescendantName(sdSeq) {
  const n = sdSeq.length;
  if (n === 1) return sdSeq[0] === "s" ? "儿子" : "女儿";
  if (n === 2) {
    const external = sdSeq[0] === "d" ? "外" : "";
    return external + "孙" + (sdSeq[1] === "s" ? "子" : "女");
  }
  const ranks = ["曾", "玄", "来"];
  const idx = Math.min(n - 2, ranks.length) - 1;
  const external = sdSeq[0] === "d" ? "外" : "";
  const rank = ranks[idx] || "曾";
  return external + rank + "孙" + (sdSeq[n - 1] === "s" ? "子" : "女");
}

function repeatStr(s, n) {
  // 使用Array.fill和join替代for循环
  return Array(n).fill(s).join("");
}

function findResult(isMale, pathTokens) {
  const sex = isMale ? "male" : "female";
  // 兄弟姐妹相互抵消的歧义：父/母 + 兄/弟/姐/妹 + 兄/弟/姐/妹
  // 例如：妈妈-弟弟-姐姐 → 可能是 妈妈 本人，或 妈妈的姐妹（姨妈/小姨）
  const sibs = ["ob", "yb", "os", "ys"];
  if (
    pathTokens.length >= 3 &&
    (pathTokens[0] === "m" || pathTokens[0] === "f") &&
    sibs.includes(pathTokens[1]) &&
    sibs.includes(pathTokens[2]) &&
    pathTokens[1] !== pathTokens[2]
  ) {
    const parent = pathTokens[0];
    const lastIsMale = pathTokens[2] === "ob" || pathTokens[2] === "yb";
    if (parent === "m") {
      // 妈妈 + (…)+ (哥哥/弟弟) → 妈妈/舅舅；(姐姐/妹妹) → 妈妈/姨妈/小姨
      return lastIsMale ? "舅舅" : "妈妈/姨妈/小姨";
    } else {
      // 爸爸 + (…)+ (哥哥/弟弟) → 爸爸/伯伯/叔叔；(姐姐/妹妹) → 姑姑
      return lastIsMale ? "爸爸/伯伯/叔叔" : "姑姑";
    }
  }
  const norm = normalizePath(pathTokens);
  const direct = resultMap[key(sex, norm)];
  if (direct) return direct;
  if (norm.length === 0) return "自己";
  if (norm.every((t) => t === "f" || t === "m")) return buildAncestorName(norm);
  if (norm.every((t) => t === "s" || t === "d"))
    return buildDescendantName(norm);

  // 祖辈链 + 配偶：如 爸爸-爸爸-老婆 => 奶奶
  if (norm[norm.length - 1] === "w" || norm[norm.length - 1] === "h") {
    const prefix = norm.slice(0, -1);
    if (prefix.length >= 1 && prefix.every((t) => t === "f" || t === "m")) {
      const toggled = prefix.slice();
      const lastIdx = toggled.length - 1;
      toggled[lastIdx] = toggled[lastIdx] === "f" ? "m" : "f";
      return buildAncestorName(toggled);
    }
  }
  if (
    (norm[0] === "f" || norm[0] === "m") &&
    (norm[1] === "ob" ||
      norm[1] === "yb" ||
      norm[1] === "os" ||
      norm[1] === "ys")
  ) {
    const side = norm[0],
      sib = norm[1],
      spouse = norm[2];
    if (side === "f") {
      if (sib === "ob") return spouse === "w" ? "伯母" : "伯伯";
      if (sib === "yb") return spouse === "w" ? "婶婶" : "叔叔";
      if (sib === "os" || sib === "ys") return spouse === "h" ? "姑父" : "姑姑";
    } else {
      if (sib === "ob" || sib === "yb") return spouse === "w" ? "舅妈" : "舅舅";
      if (sib === "os" || sib === "ys") return spouse === "h" ? "姨夫" : "姨妈";
    }
  }
  return "未收录的关系（待完善）";
}

function findReverseResult(isMale, pathTokens) {
  const norm = normalizePath(pathTokens);
  if (norm.length === 0) return "自己";
  const male = !!isMale;
  if (norm.length === 1) {
    switch (norm[0]) {
      case "f":
      case "m":
        return male ? "儿子" : "女儿";
      case "s":
      case "d":
        return male ? "爸爸" : "妈妈";
      case "w":
        return "老公";
      case "h":
        return "老婆";
      case "ob":
        return male ? "弟弟" : "妹妹";
      case "yb":
        return male ? "哥哥" : "姐姐";
      case "os":
        return male ? "妹妹" : "妹妹";
      case "ys":
        return male ? "姐姐" : "姐姐";
      default:
        return "未收录的关系（待完善）";
    }
  }

  // 处理多代祖辈关系
  if (norm.every((t) => t === "f" || t === "m")) {
    const generation = norm.length;
    if (generation === 2) {
      // 祖父母
      return isMale ? "孙子" : "孙女";
    } else if (generation === 3) {
      // 曾祖父母
      return isMale ? "曾孙子" : "曾孙女";
    } else if (generation === 4) {
      // 高祖父母
      return isMale ? "玄孙子" : "玄孙女";
    }
  }

  const a = norm[0],
    b = norm[1];
  if (a === "m" && (b === "f" || b === "m"))
    return isMale ? "外孙子" : "外孙女";
  if (a === "w" && (b === "f" || b === "m")) return "女婿";
  if (a === "h" && (b === "f" || b === "m")) return "儿媳";

  // 处理兄弟姐妹的配偶关系
  if ((a === "os" || a === "ys") && b === "h") {
    return male ? "妻弟" : "弟妹";
  }

  return "未收录的关系（待完善）";
}

function buildFormulaText(exprLabels, isMale, reverseMode) {
  if (!exprLabels.length) return "";
  if (!reverseMode) return "我的" + exprLabels.join("的");
  const tokens = exprLabels.map((lbl) => labelToToken[lbl]).filter(Boolean);
  const forward = findResult(isMale, tokens);
  if (forward && forward !== "未收录的关系（待完善）")
    return `${forward}称呼我`;
  return "称呼我";
}

Page({
  data: {
    isMale: true,
    expr: [],
    formulaText: "",
    displayResult: "",
    reverseMode: false,
    isDark: false,
    disableH: false,
    disableW: false,
  },
  onLoad() {
    this._recompute();
  },

  onChangeGender(e) {
    const v = e && e.detail ? e.detail.value : "male";
    const isMale = v === "male";
    this.setData({ isMale });
    this._recompute();
  },

  onTapKey(e) {
    const keyLabel =
      e && e.currentTarget && e.currentTarget.dataset
        ? e.currentTarget.dataset.key
        : "";
    if (keyLabel === "清空") {
      this.setData({ expr: [] });
      this._recompute();
      return;
    }
    if (keyLabel === "回退") {
      const next = this.data.expr.slice();
      next.pop();
      this.setData({ expr: next });
      this._recompute();
      return;
    }
    const token = labelToToken[keyLabel];
    if (!token) return;
    const next = this.data.expr.concat(keyLabel);
    this.setData({ expr: next });
    this._recompute();
  },

  onToggleReverse() {
    this.setData({ reverseMode: !this.data.reverseMode });
    this._recompute();
  },
  onToggleTheme() {
    this.setData({ isDark: !this.data.isDark });
  },

  _recompute() {
    const tokens = this.data.expr
      .map((lbl) => labelToToken[lbl])
      .filter(Boolean);
    const formulaText = buildFormulaText(
      this.data.expr,
      this.data.isMale,
      this.data.reverseMode
    );
    let displayResult = "";
    if (tokens.length > 0) {
      displayResult = this.data.reverseMode
        ? findReverseResult(this.data.isMale, tokens)
        : findResult(this.data.isMale, tokens);
    }
    // 末端性别判断：用于禁用老公/老婆键
    const tailGender = inferTailGender(tokens, this.data.isMale);
    const disableH = tailGender === "male";
    const disableW = tailGender === "female";
    this.setData({ formulaText, displayResult, disableH, disableW });
  },
});

// 推断公式末端人物的性别：
// 初始为我本人性别（isMale），每遇到 h/w 翻转视角性别；
// 遇到 f/m 固定为 male/female；
// 兄弟姐妹会设置对应的性别；
// 儿子继承男性性别，女儿继承女性性别。
function inferTailGender(tokens, isMale) {
  let gender = isMale ? "male" : "female";
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === "h") gender = "male";
    else if (t === "w") gender = "female";
    else if (t === "f") gender = "male";
    else if (t === "m") gender = "female";
    else if (t === "ob" || t === "yb") gender = "male"; // 哥哥、弟弟是男性
    else if (t === "os" || t === "ys") gender = "female"; // 姐姐、妹妹是女性
    else if (t === "s") gender = "male"; // 儿子是男性
    else if (t === "d") gender = "female"; // 女儿是女性
  }
  return gender;
}
