Page({
  data: {
    current: 0,
    photos: ["/assets/cover1.png", "/assets/cover2.png", "/assets/cover3.png"],
    isPlayingMusic: false,
  },
  onShow() {
    this.setData({ isPlayingMusic: getApp().globalData.isPlayingMusic });
  },
  music() {
    getApp().toggleMusic();
  },
  change(e) {
    this.setData({ current: e.detail.current });
  },
  select(e) {
    this.setData({ current: Number(e.currentTarget.dataset.index) });
  },
});
