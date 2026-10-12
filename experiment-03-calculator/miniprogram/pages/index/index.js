const calc = require("../../utils/calc");
Page({
  data: {
    display: "0",
    expression: "",
    theme: "light",
    keys: [
      "AC",
      "DEL",
      "±",
      "÷",
      "7",
      "8",
      "9",
      "×",
      "4",
      "5",
      "6",
      "-",
      "1",
      "2",
      "3",
      "+",
      "0",
      ".",
      "=",
    ],
  },
  onLoad() {
    this.state = calc.initial();
    this.setData({ theme: getApp().globalData.theme });
  },
  key(e) {
    this.state = calc.press(this.state, e.currentTarget.dataset.key);
    this.setData({
      display: this.state.display,
      expression: this.state.expression,
    });
    if (this.state.error)
      wx.showToast({ title: this.state.error, icon: "none" });
  },
  toggleTheme() {
    const theme = this.data.theme === "light" ? "dark" : "light";
    getApp().globalData.theme = theme;
    wx.setStorageSync("theme", theme);
    this.setData({ theme });
  },
});
