App({
  onLaunch() {
    this.audio = wx.getBackgroundAudioManager();
    this.state = { playing: false, currentId: 0, position: 0, duration: 0 };
    this.listeners = [];
    const change = (p) => {
      Object.assign(this.state, p);
      this.listeners.forEach((f) => f(this.state));
    };
    this.audio.onPlay(() => change({ playing: true }));
    this.audio.onPause(() => change({ playing: false }));
    this.audio.onStop(() => change({ playing: false, position: 0 }));
    this.audio.onTimeUpdate(() =>
      change({
        position: this.audio.currentTime || 0,
        duration: this.audio.duration || 0,
      }),
    );
    this.audio.onEnded(() => {
      change({ playing: false });
      if (this.onEnded) this.onEnded();
    });
    this.audio.onError(() => {
      change({ playing: false });
      wx.showToast({ title: "音频失败，请检查本地服务", icon: "none" });
    });
  },
  subscribe(f) {
    this.listeners.push(f);
    f(this.state);
  },
  unsubscribe(f) {
    this.listeners = this.listeners.filter((x) => x !== f);
  },
  playTrack(track, url) {
    this.state.currentId = track.id;
    this.state.position = 0;
    this.state.duration = track.duration;
    this.audio.title = track.name;
    this.audio.singer = track.artist;
    this.audio.coverImgUrl = url + "/media/" + track.cover.split("/").pop();
    const src = url + "/media/" + track.file;
    if(this.audio.src === src){this.audio.seek(0);this.audio.play();}else{this.audio.src = src;}
    this.listeners.forEach((f) => f(this.state));
  },
});
