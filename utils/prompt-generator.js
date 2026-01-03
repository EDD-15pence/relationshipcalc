/**
 * Generate final prompt text by replacing variables
 *
 * Rules:
 * - Variables are wrapped as {{key}}
 * - Replace {{key}} with user input value
 * - If user input is empty:
 *   - use defaultValue if provided
 *   - otherwise replace with empty string
 * - Do NOT modify the original template
 *
 * @param {string} templateText
 * @param {Object} variablesConfig   // from template.variables
 * @param {Object} userValues        // key-value map
 * @returns {string}
 */
/**
 * This file follows:
 * docs/prompt-tool-design.md
 * docs/prompt-tool-folder-structure.md
 */

/**
 * 生成最终 prompt 文本
 * @param {string} templateText - 模板字符串，包含 {{key}}
 * @param {Object} variableValues - 变量值对象 { key: value }
 * @returns {string}
 */

function generatePrompt(templateText, variableValues, variablesMeta = []) {
  // 遍历所有变量元数据，逐一替换
  let result = templateText;
  if (Array.isArray(variablesMeta)) {
    variablesMeta.forEach(meta => {
      const key = meta.key;
      let value = variableValues && variableValues[key];
      if (value === undefined || value === null || value === "") {
        value = meta.defaultValue || "";
      }
      // 全局替换所有 {{key}}
      const reg = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(reg, value);
    });
  }
  return result;
}

module.exports = generatePrompt;
