const config = require("../../config");
Page({
  data: {
    video: config.baseUrl + "/media/wedding.mp4",
    isPlayingMusic: false,
    error: "",
    videoPlaying: false,
  },
  onShow() {
    this.setData({ isPlayingMusic: getApp().globalData.isPlayingMusic });
  },
  music() {
    getApp().toggleMusic();
  },
  onPlay() {
    if (getApp().globalData.isPlayingMusic) getApp().bgm.pause();
    this.setData({ videoPlaying: true });
  },
  onPause() {
    this.setData({ videoPlaying: false });
  },
  onError() {
    this.setData({ error: "视频加载失败，请启动本地服务后重试" });
  },
  retry() {
    this.setData({
      error: "",
      video: config.baseUrl + "/media/wedding.mp4?t=" + Date.now(),
    });
  },
});
