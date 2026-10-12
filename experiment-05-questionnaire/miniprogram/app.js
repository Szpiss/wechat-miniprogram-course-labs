const config = require("./config");
App({
  onLaunch() {
    if (config.cloudEnv && wx.cloud)
      wx.cloud.init({ env: config.cloudEnv, traceUser: true });
  },
});
