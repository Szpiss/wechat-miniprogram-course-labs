const config = require("./config");
App({
  globalData: { isPlayingMusic: false },
  onLaunch() {
    this.bgm = wx.getBackgroundAudioManager();
    this.bgm.onPlay(() => this.notify(true));
    this.bgm.onPause(() => this.notify(false));
    this.bgm.onStop(() => this.notify(false));
    this.bgm.onEnded(() => this.notify(false));
    this.bgm.onError(() => {
      this.notify(false);
      wx.showToast({ title: "音频加载失败，请启动服务", icon: "none" });
    });
  },
  notify(value) {
    this.globalData.isPlayingMusic = value;
    getCurrentPages().forEach((p) => p.setData({ isPlayingMusic: value }));
  },
  toggleMusic() {
    if (this.globalData.isPlayingMusic) this.bgm.pause();
    else if (this.bgm.src) this.bgm.play();
    else {
      this.bgm.title = "婚礼演示旋律";
      this.bgm.singer = "课程原创演示";
      this.bgm.src = config.baseUrl + "/media/track1.mp3";
    }
  },
});
