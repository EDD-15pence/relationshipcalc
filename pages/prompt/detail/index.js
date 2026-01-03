/**
 * This file follows:
 * docs/prompt-tool-design.md
 * docs/prompt-tool-folder-structure.md
 */
const templates = require('../../../data/prompt-templates');
const generatePrompt = require('../../../utils/prompt-generator');

Page({
  data: {
    template: null,
    varValues: {},
    copyTip: ''
  },
  onLoad(query) {
    const id = query.id;
    const template = templates.find(t => t.id === id);
    if (template) {
      // 初始化变量值
      const varValues = {};
      template.variables.forEach(v => {
        varValues[v.key] = v.defaultValue || '';
      });
      this.setData({ template, varValues });
    }
  },
  onVarInput(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({
      [`varValues.${key}`]: e.detail.value
    });
  },
  onCopyPrompt() {
    const finalPrompt = generatePrompt(this.data.template.template, this.data.varValues, this.data.template.variables);
    wx.setClipboardData({
      data: finalPrompt,
      success: () => {
        wx.showToast({ title: '已复制到剪贴板', icon: 'none' });
      },
      fail: (err) => {
        console.error('复制失败', err);
        wx.showModal({ title: '复制失败', content: JSON.stringify(err), showCancel: false });
      }
    });
  }
});