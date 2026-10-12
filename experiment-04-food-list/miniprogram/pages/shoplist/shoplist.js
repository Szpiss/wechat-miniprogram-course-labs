const request = require("../../utils/request");
Page({
  data: {
    categories: [
      { id: 1, name: "热销推荐" },
      { id: 2, name: "特色菜" },
      { id: 3, name: "主食" },
      { id: 4, name: "小吃" },
      { id: 5, name: "饮品" },
      { id: 6, name: "甜点" },
    ],
    category: 1,
    items: [],
    filtered: [],
    page: 0,
    loading: false,
    hasMore: true,
    refreshing: false,
    error: "",
    keyword: "",
    refreshedAt: "",
  },
  onLoad() {
    this.generation = 0;
    this.load(true);
  },
  onUnload() {
    this.generation++;
  },
  async load(reset) {
    if (!reset && (this.data.loading || !this.data.hasMore)) return;
    const gen = reset ? ++this.generation : this.generation;
    const page = reset ? 1 : this.data.page + 1;
    this.setData({
      loading: true,
      error: "",
      ...(reset ? { items: [], filtered: [], page: 0, hasMore: true } : {}),
    });
    try {
      const r = await request("/api/foods", {
        category: this.data.category,
        page,
        size: 5,
      });
      if (gen !== this.generation) return;
      this.setData({
        items: reset ? r.items : this.data.items.concat(r.items),
        page,
        hasMore: r.hasMore,
        refreshedAt: r.refreshedAt,
      });
      this.filter();
    } catch (e) {
      if (gen === this.generation) this.setData({ error: e.message });
      wx.showToast({ title: "数据加载失败", icon: "none" });
    } finally {
      if (gen === this.generation)
        this.setData({ loading: false, refreshing: false });
      wx.stopPullDownRefresh();
    }
  },
  switchCategory(e) {
    this.setData({ category: Number(e.currentTarget.dataset.id) });
    this.load(true);
  },
  more() {
    this.load(false);
  },
  refresh() {
    this.setData({ refreshing: true });
    this.load(true);
  },
  onReachBottom() {
    this.more();
  },
  onPullDownRefresh() {
    this.refresh();
  },
  retry() {
    this.load(this.data.page === 0);
  },
  filter() {
    this.setData({
      filtered: this.data.items.filter((i) =>
        i.name.includes(this.data.keyword.trim()),
      ),
    });
  },
  search(e) {
    this.setData({ keyword: e.detail.value });
    this.filter();
  },
  call(e) {
    wx.makePhoneCall({ phoneNumber: e.currentTarget.dataset.phone });
  },
});
