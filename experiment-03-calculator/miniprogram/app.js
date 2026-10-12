App({
  onLaunch() {
    this.globalData.theme = wx.getStorageSync("theme") || "light";
  },
  globalData: { theme: "light" },
});

// 原生计算器应用入口
