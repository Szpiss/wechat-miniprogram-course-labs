const request = require("../../utils/request");
Page({
  data: {
    name: "",
    phone: "",
    count: "1",
    message: "",
    submitting: false,
    status: "",
    isPlayingMusic: false,
  },
  onShow() {
    this.setData({ isPlayingMusic: getApp().globalData.isPlayingMusic });
  },
  music() {
    getApp().toggleMusic();
  },
  input(e) {
    this.setData({ [e.currentTarget.dataset.key]: e.detail.value });
  },
  async submit() {
    if (this.data.submitting) return;
    const { name, phone, count, message } = this.data;
    if (
      !name.trim() ||
      !/^1\d{10}$/.test(phone) ||
      !/^([1-9]|10)$/.test(count)
    ) {
      wx.showToast({ title: "请填写姓名、11位手机和1至10人数", icon: "none" });
      return;
    }
    this.setData({ submitting: true, status: "" });
    try {
      const r = await request(
        "/api/guests",
        { name: name.trim(), phone, count: Number(count), message },
        "POST",
      );
      this.setData({ status: "报名成功，编号 " + r.id });
      wx.showToast({ title: "提交成功" });
    } catch (e) {
      this.setData({ status: e.message });
      wx.showToast({ title: "提交失败", icon: "none" });
    } finally {
      this.setData({ submitting: false });
    }
  },
});
