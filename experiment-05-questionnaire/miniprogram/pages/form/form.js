const request = require("../../utils/request"),
  config = require("../../config"),
  cloud = require("../../utils/cloud");
Page({
  data: {
    title: "学习调查",
    questions: [],
    name: "",
    gender: "",
    skills: [],
    selectedSkills: {},
    opinion: "",
    loading: true,
    submitting: false,
    error: "",
    status: "",
    mode: config.storageMode,
  },
  onLoad() {
    this.load();
  },
  async load() {
    this.setData({ loading: true, error: "" });
    try {
      const r = await request("/api/questions");
      this.setData({ title: r.title, questions: r.questions });
    } catch (e) {
      this.setData({ error: e.message });
    } finally {
      this.setData({ loading: false });
    }
  },
  input(e) {
    this.setData({ [e.currentTarget.dataset.id]: e.detail.value });
  },
  radioChange(e) {
    this.setData({ [e.currentTarget.dataset.id]: e.detail.value });
  },
  checkboxChange(e) {
    const selectedSkills = {};
    e.detail.value.forEach(value => { selectedSkills[value] = true; });
    this.setData({ [e.currentTarget.dataset.id]: e.detail.value, selectedSkills });
  },
  async submit() {
    if (this.data.submitting) return;
    if (!this.data.questions.length) {
      wx.showToast({ title: "请先加载问卷", icon: "none" });
      return;
    }
    const { name, gender, skills, opinion } = this.data;
    if (!name.trim()) {
      wx.showToast({ title: "请填写姓名", icon: "none" });
      return;
    }
    for (const q of this.data.questions) {
      const answer = this.data[q.id];
      if (
        q.required &&
        (!answer ||
          !answer.length ||
          (typeof answer === "string" && !answer.trim()))
      ) {
        wx.showToast({ title: "请完成：" + q.title, icon: "none" });
        return;
      }
    }
    const payload = {
      name: name.trim(),
      gender,
      skills,
      opinion: opinion.trim(),
    };
    this.setData({ submitting: true, status: "" });
    wx.showLoading({ title: "提交中" });
    try {
      let r;
      if (config.storageMode === "cloud-direct")
        r = await cloud.direct(payload);
      else if (config.storageMode === "cloud-function")
        r = await cloud.viaFunction(payload);
      else r = await request("/api/submissions", payload, "POST");
      this.setData({
        status: r.id
          ? "提交成功，记录编号 " + r.id
          : r.action === "update"
            ? "云记录更新成功"
            : "云记录新增成功",
      });
      wx.showToast({ title: "提交成功" });
    } catch (e) {
      this.setData({ status: e.message });
      wx.showToast({ title: "提交失败", icon: "none" });
    } finally {
      wx.hideLoading();
      this.setData({ submitting: false });
    }
  },
});
