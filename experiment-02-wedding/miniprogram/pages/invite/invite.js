Page({
  data: { isPlayingMusic: false },
  onShow() {
    this.setData({ isPlayingMusic: getApp().globalData.isPlayingMusic });
  },
  music() {
    getApp().toggleMusic();
  },
  call(e) {
    wx.makePhoneCall({ phoneNumber: e.currentTarget.dataset.phone });
  },
});
