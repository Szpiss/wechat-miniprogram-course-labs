const config = require("../config");
function ready() {
  if (!config.cloudEnv || !wx.cloud) throw new Error("请配置真实云环境 ID");
}
async function direct(data) {
  ready();
  const db = wx.cloud.database();
  const result = await db
    .collection("UserData")
    .where({ name: data.name })
    .get();
  if (result.data.length) {
    await db
      .collection("UserData")
      .doc(result.data[0]._id)
      .update({
        data: {
          gender: data.gender,
          skills: data.skills,
          opinion: data.opinion,
          updateTime: db.serverDate(),
        },
      });
    return { action: "update" };
  }
  await db
    .collection("UserData")
    .add({ data: { ...data, createTime: db.serverDate() } });
  return { action: "add" };
}
async function viaFunction(data) {
  ready();
  const result = await wx.cloud.callFunction({ name: "upsertUserData", data });
  if (!result.result || !result.result.success)
    throw new Error(result.result?.error || "云端操作失败");
  return result.result;
}
module.exports = { direct, viaFunction };
