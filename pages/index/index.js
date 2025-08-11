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

const resultMap = {};
["male", "female"].forEach((sex) => {
  resultMap[key(sex, ["f"])] = "爸爸";
  resultMap[key(sex, ["m"])] = "妈妈";
  resultMap[key(sex, ["h"])] = "老公";
  resultMap[key(sex, ["w"])] = "老婆";
  resultMap[key(sex, ["ob"])] = "哥哥";
  resultMap[key(sex, ["yb"])] = "弟弟";
  resultMap[key(sex, ["os"])] = "姐姐";
  resultMap[key(sex, ["ys"])] = "妹妹";
  resultMap[key(sex, ["s"])] = "儿子";
  resultMap[key(sex, ["d"])] = "女儿";
});
["male", "female"].forEach((sex) => {
  resultMap[key(sex, ["f", "w"])] = "妈妈";
  resultMap[key(sex, ["m", "h"])] = "爸爸";
});
resultMap[key("male", ["w", "f"])] = "岳父";
resultMap[key("male", ["w", "m"])] = "岳母";
resultMap[key("female", ["h", "f"])] = "公公";
resultMap[key("female", ["h", "m"])] = "婆婆";
["male", "female"].forEach((sex) => {
  resultMap[key(sex, ["f", "f"])] = "爷爷";
  resultMap[key(sex, ["f", "m"])] = "奶奶";
  resultMap[key(sex, ["m", "f"])] = "外公";
  resultMap[key(sex, ["m", "m"])] = "外婆";
});
["male", "female"].forEach((sex) => {
  resultMap[key(sex, ["ob", "w"])] = "嫂子";
  resultMap[key(sex, ["yb", "w"])] = "弟媳";
  resultMap[key(sex, ["os", "h"])] = "姐夫";
  resultMap[key(sex, ["ys", "h"])] = "妹夫";
});
["male", "female"].forEach((sex) => {
  resultMap[key(sex, ["s", "w"])] = "儿媳";
  resultMap[key(sex, ["d", "h"])] = "女婿";
});

// 添加兄弟姐妹的子女关系
["male", "female"].forEach((sex) => {
  resultMap[key(sex, ["ob", "s"])] = "侄子";
  resultMap[key(sex, ["ob", "d"])] = "侄女";
  resultMap[key(sex, ["yb", "s"])] = "侄子";
  resultMap[key(sex, ["yb", "d"])] = "侄女";
  resultMap[key(sex, ["os", "s"])] = "外甥";
  resultMap[key(sex, ["os", "d"])] = "外甥女";
  resultMap[key(sex, ["ys", "s"])] = "外甥";
  resultMap[key(sex, ["ys", "d"])] = "外甥女";
});

// 添加堂亲关系 (父亲的兄弟姐妹的子女)
["male", "female"].forEach((sex) => {
  resultMap[key(sex, ["f", "ob", "s"])] = "堂哥";
  resultMap[key(sex, ["f", "ob", "d"])] = "堂姐";
  resultMap[key(sex, ["f", "yb", "s"])] = "堂弟";
  resultMap[key(sex, ["f", "yb", "d"])] = "堂妹";
  resultMap[key(sex, ["f", "os", "s"])] = "表哥";
  resultMap[key(sex, ["f", "os", "d"])] = "表姐";
  resultMap[key(sex, ["f", "ys", "s"])] = "表弟";
  resultMap[key(sex, ["f", "ys", "d"])] = "表妹";
});

// 添加表亲关系 (母亲的兄弟姐妹的子女)
["male", "female"].forEach((sex) => {
  resultMap[key(sex, ["m", "ob", "s"])] = "表哥";
  resultMap[key(sex, ["m", "ob", "d"])] = "表姐";
  resultMap[key(sex, ["m", "yb", "s"])] = "表弟";
  resultMap[key(sex, ["m", "yb", "d"])] = "表妹";
  resultMap[key(sex, ["m", "os", "s"])] = "表哥";
  resultMap[key(sex, ["m", "os", "d"])] = "表姐";
  resultMap[key(sex, ["m", "ys", "s"])] = "表弟";
  resultMap[key(sex, ["m", "ys", "d"])] = "表妹";
});

// 添加祖辈的兄弟姐妹关系
["male", "female"].forEach((sex) => {
  resultMap[key(sex, ["f", "f", "ob"])] = "伯公";
  resultMap[key(sex, ["f", "f", "os"])] = "姑婆";
  resultMap[key(sex, ["f", "m", "ob"])] = "舅公";
  resultMap[key(sex, ["f", "m", "os"])] = "姨婆";
  resultMap[key(sex, ["m", "f", "ob"])] = "伯公";
  resultMap[key(sex, ["m", "f", "os"])] = "姑婆";
  resultMap[key(sex, ["m", "m", "ob"])] = "舅公";
  resultMap[key(sex, ["m", "m", "os"])] = "姨婆";
});

// 添加曾祖辈关系
["male", "female"].forEach((sex) => {
  resultMap[key(sex, ["f", "f", "f"])] = "曾祖父";
  resultMap[key(sex, ["f", "f", "m"])] = "曾祖母";
  resultMap[key(sex, ["f", "m", "f"])] = "曾外祖父";
  resultMap[key(sex, ["f", "m", "m"])] = "曾外祖母";
  resultMap[key(sex, ["m", "f", "f"])] = "外曾祖父";
  resultMap[key(sex, ["m", "f", "m"])] = "外曾祖母";
  resultMap[key(sex, ["m", "m", "f"])] = "外曾外祖父";
  resultMap[key(sex, ["m", "m", "m"])] = "外曾外祖母";
});

// 添加配偶的亲属关系
resultMap[key("male", ["w", "ob"])] = "大舅子";
resultMap[key("male", ["w", "yb"])] = "小舅子";
resultMap[key("male", ["w", "os"])] = "大姨子";
resultMap[key("male", ["w", "ys"])] = "小姨子";
resultMap[key("female", ["h", "ob"])] = "大伯子";
resultMap[key("female", ["h", "yb"])] = "小叔子";
resultMap[key("female", ["h", "os"])] = "大姑子";
resultMap[key("female", ["h", "ys"])] = "小姑子";

// 添加孙辈的子女
["male", "female"].forEach((sex) => {
  resultMap[key(sex, ["s", "s"])] = "孙子";
  resultMap[key(sex, ["s", "d"])] = "孙女";
  resultMap[key(sex, ["d", "s"])] = "外孙";
  resultMap[key(sex, ["d", "d"])] = "外孙女";
});

// 添加曾孙辈
["male", "female"].forEach((sex) => {
  resultMap[key(sex, ["s", "s", "s"])] = "曾孙子";
  resultMap[key(sex, ["s", "s", "d"])] = "曾孙女";
  resultMap[key(sex, ["s", "d", "s"])] = "曾外孙";
  resultMap[key(sex, ["s", "d", "d"])] = "曾外孙女";
  resultMap[key(sex, ["d", "s", "s"])] = "外曾孙子";
  resultMap[key(sex, ["d", "s", "d"])] = "外曾孙女";
  resultMap[key(sex, ["d", "d", "s"])] = "外曾外孙";
  resultMap[key(sex, ["d", "d", "d"])] = "外曾外孙女";

  // 添加兄弟姐妹的孙辈关系
  resultMap[key(sex, ["ob", "s", "s"])] = "侄孙";
  resultMap[key(sex, ["ob", "s", "d"])] = "侄孙女";
  resultMap[key(sex, ["yb", "s", "s"])] = "侄孙";
  resultMap[key(sex, ["yb", "s", "d"])] = "侄孙女";
  resultMap[key(sex, ["os", "s", "s"])] = "外甥孙";
  resultMap[key(sex, ["os", "s", "d"])] = "外甥孙女";
  resultMap[key(sex, ["ys", "s", "s"])] = "外甥孙";
  resultMap[key(sex, ["ys", "s", "d"])] = "外甥孙女";
});

// 添加配偶的祖辈
resultMap[key("male", ["w", "f", "f"])] = "太岳父";
resultMap[key("male", ["w", "f", "m"])] = "太岳母";
resultMap[key("female", ["h", "f", "f"])] = "太公公";
resultMap[key("female", ["h", "f", "m"])] = "太婆婆";

// 添加配偶的子女关系
// 女性视角（老公的子女）
resultMap[key("female", ["h", "s"])] = "儿子";
resultMap[key("female", ["h", "d"])] = "女儿";
// 男性视角（老婆的子女）
resultMap[key("male", ["w", "s"])] = "儿子";
resultMap[key("male", ["w", "d"])] = "女儿";

// 添加兄弟姐妹的兄弟姐妹关系
["male", "female"].forEach((sex) => {
  // 兄弟姐妹的兄弟姐妹关系映射
  // 直接亲属关系（明确的兄弟姐妹关系）
  resultMap[key(sex, ["ob", "ob"])] = "哥哥";  
  resultMap[key(sex, ["ob", "os"])] = "姐姐";  
  resultMap[key(sex, ["ob", "yb"])] = "弟弟";  
  resultMap[key(sex, ["ob", "ys"])] = "妹妹";  

  resultMap[key(sex, ["yb", "ob"])] = "哥哥";  
  resultMap[key(sex, ["yb", "os"])] = "姐姐";  
  resultMap[key(sex, ["yb", "yb"])] = "弟弟";  
  resultMap[key(sex, ["yb", "ys"])] = "妹妹";  

  resultMap[key(sex, ["os", "ob"])] = "哥哥";  
  resultMap[key(sex, ["os", "os"])] = "姐姐";  
  resultMap[key(sex, ["os", "yb"])] = "弟弟";  
  resultMap[key(sex, ["os", "ys"])] = "妹妹";  

  resultMap[key(sex, ["ys", "ob"])] = "哥哥";  
  resultMap[key(sex, ["ys", "os"])] = "姐姐";  
  resultMap[key(sex, ["ys", "yb"])] = "弟弟";  
  resultMap[key(sex, ["ys", "ys"])] = "妹妹";  
});

// 添加父母的兄弟姐妹关系
// 爸爸的兄弟/姐妹
resultMap[key("male", ["f", "ob"])] = "伯伯";
resultMap[key("female", ["f", "ob"])] = "伯伯";
resultMap[key("male", ["f", "yb"])] = "叔叔";
resultMap[key("female", ["f", "yb"])] = "叔叔";
resultMap[key("male", ["f", "os"])] = "姑姑";
resultMap[key("female", ["f", "os"])] = "姑姑";
resultMap[key("male", ["f", "ys"])] = "姑姑";
resultMap[key("female", ["f", "ys"])] = "姑姑";
// 妈妈的兄弟/姐妹
resultMap[key("male", ["m", "ob"])] = "舅舅";
resultMap[key("female", ["m", "ob"])] = "舅舅";
resultMap[key("male", ["m", "yb"])] = "舅舅";
resultMap[key("female", ["m", "yb"])] = "舅舅";
resultMap[key("male", ["m", "os"])] = "姨妈";
resultMap[key("female", ["m", "os"])] = "姨妈";
resultMap[key("male", ["m", "ys"])] = "小姨";
resultMap[key("female", ["m", "ys"])] = "小姨";

// 添加父母的子女关系(兄弟/姐妹)
// 爸爸的儿子
resultMap[key("male", ["f", "s"])] = "我/兄弟";
resultMap[key("female", ["f", "s"])] = "兄弟";
// 爸爸的女儿
resultMap[key("male", ["f", "d"])] = "姐妹";
resultMap[key("female", ["f", "d"])] = "我/姐妹";
// 妈妈的儿子
resultMap[key("male", ["m", "s"])] = "我/兄弟";
resultMap[key("female", ["m", "s"])] = "兄弟";
// 妈妈的女儿
resultMap[key("male", ["m", "d"])] = "姐妹";
resultMap[key("female", ["m", "d"])] = "我/姐妹";

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
      // 相同兄弟姐妹关系抵消（如哥哥的哥哥 → 哥哥）
        if ((a === "ob" && b === "ob") || 
            (a === "yb" && b === "yb") || 
            (a === "os" && b === "os") || 
            (a === "ys" && b === "ys")) {
          arr.splice(i, 2, a);
          changed = true;
          break;
        }
        // 配偶子女关系处理：将[亲属, w/h, s/d]规范化为[亲属, s/d]
        if ((a === "ob" || a === "yb" || a === "os" || a === "ys") && 
            (b === "w" || b === "h") && (i + 2 < arr.length) && 
            (arr[i + 2] === "s" || arr[i + 2] === "d")) {
          // 保留亲属和子女关系，删除配偶关系
          arr.splice(i + 1, 1);
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
  let out = "";
  for (let i = 0; i < n; i++) out += s;
  return out;
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
    sibs.includes(pathTokens[2])
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
