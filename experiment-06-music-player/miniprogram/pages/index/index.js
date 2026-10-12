const request = require("../../utils/request"),
  config = require("../../config"),
  lyrics = require("../../utils/lyrics");
Page({
  data: {
    tracks: [],
    visible: [],
    playlists: [],
    playlist: "all",
    keyword: "",
    current: 0,
    track: null,
    playing: false,
    position: 0,
    duration: 24,
    timeLabel: "0:00",
    durationLabel: "0:24",
    lines: [],
    lyricIndex: -1,
    lyricAnchor: "line-0",
    favorites: [],
    mode: "循环",
    error: "",
    loading: true,
  },
  onLoad() {
    this.setData({ favorites: wx.getStorageSync("favorites") || [] });
    this.sync = (s) => {
      const track =
        this.data.tracks.find((t) => t.id === s.currentId) || this.data.track;
      const lines =
        track && track.id !== this.data.track?.id
          ? lyrics.parse(track.lrc)
          : this.data.lines;
      const idx = lyrics.indexAt(lines, s.position);
      this.setData({
        track,
        lines,
        playing: s.playing,
        position: s.position,
        duration: s.duration || 24,
        timeLabel: lyrics.time(s.position),
        durationLabel: lyrics.time(s.duration || 24),
        lyricIndex: idx,
        lyricAnchor: "line-" + Math.max(0, idx - 1),
        favorite: track ? this.data.favorites.includes(track.id) : false,
      });
    };
    getApp().subscribe(this.sync);
    getApp().onEnded = () => this.next(true);
    this.load();
  },
  onUnload() {
    getApp().unsubscribe(this.sync);
    getApp().onEnded = null;
  },
  async load() {
    this.setData({ loading: true, error: "" });
    try {
      const r = await request("/api/tracks");
      this.setData({ tracks: r.tracks, playlists: r.playlists });
      this.filter();
      this.sync(getApp().state);
      if (!this.data.track) this.selectTrack(r.tracks[0], false);
    } catch (e) {
      this.setData({ error: e.message });
    } finally {
      this.setData({ loading: false });
    }
  },
  filter() {
    const list = this.data.playlists.find((p) => p.id === this.data.playlist);
    this.setData({
      visible: this.data.tracks.filter(
        (t) =>
          (!list || list.ids.includes(t.id)) &&
          t.name.includes(this.data.keyword.trim()),
      ),
    });
  },
  search(e) {
    this.setData({ keyword: e.detail.value });
    this.filter();
  },
  playlist(e) {
    this.setData({ playlist: e.currentTarget.dataset.id });
    this.filter();
  },
  tab(e) {
    this.setData({ current: Number(e.currentTarget.dataset.index) });
  },
  swipe(e) {
    this.setData({ current: e.detail.current });
  },
  choose(e) {
    const t = this.data.visible[Number(e.currentTarget.dataset.index)];
    if (t) {
      this.selectTrack(t, true);
      this.setData({ current: 1 });
    }
  },
  selectTrack(t, play) {
    this.setData({
      track: t,
      lines: lyrics.parse(t.lrc),
      lyricIndex: -1,
      position: 0,
      timeLabel: "0:00",
      favorite: this.data.favorites.includes(t.id),
    });
    if (play) getApp().playTrack(t, config.baseUrl);
  },
  toggle() {
    const app = getApp();
    if (!this.data.track) return;
    if (this.data.playing) app.audio.pause();
    else if (app.state.currentId === this.data.track.id && app.audio.src)
      app.audio.play();
    else app.playTrack(this.data.track, config.baseUrl);
  },
  next(ended) {
    if (ended === true && this.data.mode === "单曲") {
      getApp().audio.seek(0);
      getApp().audio.play();
      return;
    }
    this.move(1);
  },
  previous() {
    this.move(-1);
  },
  move(delta) {
    const list = this.data.playlists.find((p) => p.id === this.data.playlist),
      tracks = this.data.tracks.filter((t) => !list || list.ids.includes(t.id));
    if (!tracks.length) return;
    let i = tracks.findIndex((t) => t.id === this.data.track?.id);
    if (this.data.mode === "随机" && delta === 1)
      i = Math.floor(Math.random() * tracks.length);
    else i = (i + delta + tracks.length) % tracks.length;
    this.selectTrack(tracks[i], true);
  },
  seek(e) {
    if (getApp().state.currentId !== this.data.track?.id) return;
    getApp().audio.seek(Number(e.detail.value));
  },
  favorite() {
    if (!this.data.track) return;
    let ids = this.data.favorites.slice();
    const i = ids.indexOf(this.data.track.id);
    i < 0 ? ids.push(this.data.track.id) : ids.splice(i, 1);
    wx.setStorageSync("favorites", ids);
    this.setData({
      favorites: ids,
      favorite: ids.includes(this.data.track.id),
    });
  },
  mode() {
    const modes = ["循环", "单曲", "随机"];
    this.setData({ mode: modes[(modes.indexOf(this.data.mode) + 1) % 3] });
  },
});
