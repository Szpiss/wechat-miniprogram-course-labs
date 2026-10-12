Page({
  data: {
    avatar: "/assets/avatar.png",
    nickname: "同学",
    initials: ["食", "宿", "影", "闲", "购", "行", "动", "便", "校"],
    banners: [
      {
        src: "/assets/cover1.png",
        title: "发现身边的美好",
        desc: "生活服务，一站直达",
      },
      {
        src: "/assets/cover2.png",
        title: "周末慢生活",
        desc: "探索城市的小惊喜",
      },
      {
        src: "/assets/cover3.png",
        title: "绿色出行",
        desc: "一起享受校园周边",
      },
    ],
    categories: [
      "美食",
      "酒店",
      "电影",
      "休闲",
      "购物",
      "出行",
      "运动",
      "便民",
      "校园",
    ],
  },
  onLoad() {
    const profile = wx.getStorageSync("profile");
    if (profile) this.setData(profile);
  },
  chooseAvatar(e) {
    const src = e.detail.avatarUrl;
    wx.getFileSystemManager().saveFile({
      tempFilePath: src,
      success: (r) => {
        this.setData({ avatar: r.savedFilePath });
        this.saveProfile();
      },
      fail: () => {
        this.setData({ avatar: src });
        wx.showToast({ title: "本次头像已更新", icon: "none" });
      },
    });
  },
  nicknameChange(e) {
    this.setData({ nickname: e.detail.value.trim() || "同学" });
    this.saveProfile();
  },
  saveProfile() {
    wx.setStorageSync("profile", {
      avatar: this.data.avatar,
      nickname: this.data.nickname,
    });
  },
  openService(e) {
    wx.navigateTo({
      url:
        "/pages/detail/detail?name=" +
        encodeURIComponent(e.currentTarget.dataset.name),
    });
  },
});
