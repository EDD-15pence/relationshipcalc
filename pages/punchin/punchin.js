Page({
  data: {
    nowTime: '',
    habits: [], // 习惯列表
    isDark: false,
    showAddModal: false, // 显示添加习惯弹窗
    editingHabit: null, // 正在编辑的习惯
    newHabit: {
      name: '',
      icon: '✅',
      color: '#007aff',
      reminderTime: '', // 提醒时间 HH:mm
      difficulty: 'easy' // easy/medium/hard (能力维度)
    }
  },

  onLoad() {
    this.loadSettings();
    this.updateNowTime();
    this.loadHabits();
    this.nowTimer = setInterval(() => this.updateNowTime(), 1000);
    this.checkReminders();
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.loadHabits();
    this.checkReminders();
  },

  onUnload() {
    clearInterval(this.nowTimer);
  },

  loadSettings() {
    const isDark = wx.getStorageSync('darkMode') || false;
    this.setData({ isDark });
  },

  updateNowTime() {
    const now = new Date();
    const fmt = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0') + ' ' +
      String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0') + ':' + String(now.getSeconds()).padStart(2,'0');
    this.setData({ nowTime: fmt });
  },

  // 加载习惯列表
  loadHabits() {
    const raw = wx.getStorageSync('habits') || '[]';
    let habits = [];
    try { 
      habits = JSON.parse(raw);
      // 计算每个习惯的统计数据
      habits = habits.map(habit => this.calculateHabitStats(habit));
    } catch (e) { 
      habits = []; 
    }
    this.setData({ habits });
  },

  // 保存习惯列表
  saveHabits(habits) {
    try { 
      wx.setStorageSync('habits', JSON.stringify(habits)); 
    } catch (e) { 
      console.warn('保存失败', e); 
    }
  },

  // 计算习惯统计数据（福格模型 - 动机增强）
  calculateHabitStats(habit) {
    const today = this.getTodayString();
    const records = habit.records || [];
    
    // 计算连续天数
    let consecutiveDays = 0;
    let checkDate = new Date();
    for (let i = 0; i < 365; i++) {
      const dateStr = this.formatDate(checkDate);
      if (records.includes(dateStr)) {
        consecutiveDays++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // 计算总天数
    const totalDays = records.length;

    // 计算本月完成率
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const monthRecords = records.filter(date => {
      const d = new Date(date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });
    const daysInMonth = new Date(thisYear, thisMonth + 1, 0).getDate();
    const monthProgress = daysInMonth > 0 ? (monthRecords.length / daysInMonth * 100).toFixed(0) : 0;

    // 今天是否已打卡
    const isTodayChecked = records.includes(today);

    // 计算最佳连续天数
    let bestStreak = 0;
    let currentStreak = 0;
    const sortedRecords = [...records].sort();
    for (let i = 0; i < sortedRecords.length; i++) {
      if (i === 0) {
        currentStreak = 1;
      } else {
        const prevDate = new Date(sortedRecords[i-1]);
        const currDate = new Date(sortedRecords[i]);
        const diffDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          currentStreak++;
        } else {
          bestStreak = Math.max(bestStreak, currentStreak);
          currentStreak = 1;
        }
      }
    }
    bestStreak = Math.max(bestStreak, currentStreak);

    return {
      ...habit,
      consecutiveDays,
      totalDays,
      monthProgress,
      isTodayChecked,
      bestStreak
    };
  },

  // 打卡（福格模型 - 能力：简化操作）
  onCheckIn(e) {
    const habitId = e.currentTarget.dataset.id;
    const habits = this.data.habits;
    const habit = habits.find(h => h.id === habitId);
    
    if (!habit) return;

    const today = this.getTodayString();
    const records = habit.records || [];

    if (records.includes(today)) {
      wx.showToast({
        title: '今天已打卡',
        icon: 'none'
      });
      return;
    }

    // 添加打卡记录
    records.push(today);
    habit.records = records;
    
    // 保存
    this.saveHabits(habits);
    
    // 重新计算统计
    const updatedHabit = this.calculateHabitStats(habit);
    const updatedHabits = habits.map(h => h.id === habitId ? updatedHabit : h);
    this.setData({ habits: updatedHabits });

    // 激励反馈（动机增强）
    wx.showToast({
      title: `已打卡！连续${updatedHabit.consecutiveDays}天`,
      icon: 'success',
      duration: 2000
    });

    // 成就提示
    if (updatedHabit.consecutiveDays === 7) {
      setTimeout(() => {
        wx.showModal({
          title: '🎉 恭喜！',
          content: `你已经连续打卡${updatedHabit.consecutiveDays}天了！继续保持！`,
          showCancel: false
        });
      }, 2000);
    } else if (updatedHabit.consecutiveDays === 30) {
      setTimeout(() => {
        wx.showModal({
          title: '🏆 太棒了！',
          content: `你已经连续打卡${updatedHabit.consecutiveDays}天了！这是一个了不起的成就！`,
          showCancel: false
        });
      }, 2000);
    }
  },

  // 取消打卡
  onUncheck(e) {
    const habitId = e.currentTarget.dataset.id;
    const habits = this.data.habits;
    const habit = habits.find(h => h.id === habitId);
    
    if (!habit) return;

    const today = this.getTodayString();
    const records = habit.records || [];

    if (!records.includes(today)) {
      return;
    }

    wx.showModal({
      title: '确认',
      content: '确定要取消今天的打卡吗？',
      success: (res) => {
        if (res.confirm) {
          habit.records = records.filter(date => date !== today);
          this.saveHabits(habits);
          
          const updatedHabit = this.calculateHabitStats(habit);
          const updatedHabits = habits.map(h => h.id === habitId ? updatedHabit : h);
          this.setData({ habits: updatedHabits });
        }
      }
    });
  },

  // 显示添加习惯弹窗
  onShowAddModal() {
    this.setData({ 
      showAddModal: true,
      editingHabit: null,
      newHabit: {
        name: '',
        icon: '✅',
        color: '#007aff',
        reminderTime: '',
        difficulty: 'easy'
      }
    });
  },

  // 关闭添加习惯弹窗
  onCloseAddModal() {
    this.setData({ showAddModal: false, editingHabit: null });
  },

  // 编辑习惯
  onEditHabit(e) {
    const habitId = e.currentTarget.dataset.id;
    const habit = this.data.habits.find(h => h.id === habitId);
    if (habit) {
      this.setData({
        showAddModal: true,
        editingHabit: habit,
        newHabit: {
          name: habit.name,
          icon: habit.icon,
          color: habit.color,
          reminderTime: habit.reminderTime || '',
          difficulty: habit.difficulty || 'easy'
        }
      });
    }
  },

  // 输入习惯名称
  onHabitNameInput(e) {
    this.setData({
      'newHabit.name': e.detail.value
    });
  },

  // 选择图标
  onSelectIcon(e) {
    const icon = e.currentTarget.dataset.icon;
    this.setData({
      'newHabit.icon': icon
    });
  },

  // 选择颜色
  onSelectColor(e) {
    const color = e.currentTarget.dataset.color;
    this.setData({
      'newHabit.color': color
    });
  },

  // 选择难度
  onSelectDifficulty(e) {
    const difficulty = e.currentTarget.dataset.difficulty;
    this.setData({
      'newHabit.difficulty': difficulty
    });
  },

  // 设置提醒时间
  onReminderTimeChange(e) {
    this.setData({
      'newHabit.reminderTime': e.detail.value
    });
  },

  // 保存习惯
  onSaveHabit() {
    const { newHabit, editingHabit, habits } = this.data;
    
    if (!newHabit.name.trim()) {
      wx.showToast({
        title: '请输入习惯名称',
        icon: 'none'
      });
      return;
    }

    let updatedHabits = [...habits];

    if (editingHabit) {
      // 编辑现有习惯
      const index = updatedHabits.findIndex(h => h.id === editingHabit.id);
      if (index !== -1) {
        updatedHabits[index] = {
          ...updatedHabits[index],
          name: newHabit.name,
          icon: newHabit.icon,
          color: newHabit.color,
          reminderTime: newHabit.reminderTime,
          difficulty: newHabit.difficulty
        };
      }
    } else {
      // 添加新习惯
      const newHabitData = {
        id: Date.now().toString(),
        name: newHabit.name,
        icon: newHabit.icon,
        color: newHabit.color,
        reminderTime: newHabit.reminderTime,
        difficulty: newHabit.difficulty,
        records: [],
        createdAt: new Date().toISOString()
      };
      updatedHabits.push(newHabitData);
    }

    this.saveHabits(updatedHabits);
    this.loadHabits();
    this.onCloseAddModal();

    wx.showToast({
      title: editingHabit ? '已更新' : '已添加',
      icon: 'success'
    });
  },

  // 删除习惯
  onDeleteHabit(e) {
    const habitId = e.currentTarget.dataset.id;
    const habit = this.data.habits.find(h => h.id === habitId);
    
    if (!habit) return;

    wx.showModal({
      title: '确认删除',
      content: `确定要删除习惯"${habit.name}"吗？此操作不可恢复。`,
      success: (res) => {
        if (res.confirm) {
          const updatedHabits = this.data.habits.filter(h => h.id !== habitId);
          this.saveHabits(updatedHabits);
          this.setData({ habits: updatedHabits });
          
          wx.showToast({
            title: '已删除',
            icon: 'success'
          });
        }
      }
    });
  },

  // 查看习惯详情
  onViewHabitDetail(e) {
    const habitId = e.currentTarget.dataset.id;
    const habit = this.data.habits.find(h => h.id === habitId);
    
    if (!habit) return;

    const stats = this.calculateHabitStats(habit);
    const message = `习惯：${habit.name}\n\n` +
      `连续打卡：${stats.consecutiveDays}天\n` +
      `总打卡：${stats.totalDays}天\n` +
      `最佳连续：${stats.bestStreak}天\n` +
      `本月完成率：${stats.monthProgress}%`;

    wx.showModal({
      title: '习惯统计',
      content: message,
      showCancel: false
    });
  },

  // 工具函数：获取今天的日期字符串
  getTodayString() {
    const today = new Date();
    return this.formatDate(today);
  },

  // 工具函数：格式化日期为 YYYY-MM-DD
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 检查提醒（福格模型 - 触发）
  checkReminders() {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    this.data.habits.forEach(habit => {
      if (habit.reminderTime && habit.reminderTime === currentTime) {
        const stats = this.calculateHabitStats(habit);
        if (!stats.isTodayChecked) {
          // 可以在这里添加推送通知（需要用户授权）
          wx.showToast({
            title: `提醒：${habit.name}`,
            icon: 'none',
            duration: 3000
          });
        }
      }
    });
  },

  onToggleTheme() {
    const isDark = !this.data.isDark;
    wx.setStorageSync('darkMode', isDark);
    this.setData({ isDark });
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 空函数，用于阻止事件冒泡
  }
});
