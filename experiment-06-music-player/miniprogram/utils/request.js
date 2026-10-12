const config = require("../config");
module.exports = (path, data, method = "GET") =>
  new Promise((resolve, reject) =>
    wx.request({
      url: config.baseUrl + path,
      data,
      method,
      timeout: 8000,
      success: (r) => {
        if (r.statusCode >= 200 && r.statusCode < 300) resolve(r.data);
        else reject(new Error(r.data.error || "请求失败"));
      },
      fail: () =>
        reject(new Error("无法连接本地服务，请先启动 server/index.js")),
    }),
  );
