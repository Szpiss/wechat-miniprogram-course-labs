Page({
  data: { name: "生活服务", message: "" },
  onLoad(o) {
    const name = decodeURIComponent(o.name || "生活服务");
    this.setData({
      name,
      message:
        "这里提供" +
        name +
        "服务的校园周边使用指南。可先查询营业时间、位置和费用，再安排出行。",
    });
  },
  remind() {
    wx.showToast({ title: "已加入本地服务提醒", icon: "success" });
  },
});
