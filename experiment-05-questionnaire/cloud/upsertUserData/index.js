const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
exports.main = async (event) => {
  try {
    const { OPENID } = cloud.getWXContext();
    const { name, gender, skills, opinion } = event;
    if (
      !OPENID ||
      typeof name !== "string" ||
      !name.trim() ||
      name.length > 30 ||
      !["男", "女", "不愿透露"].includes(gender) ||
      !Array.isArray(skills) ||
      !skills.length ||
      skills.some(
        (x) => !["JavaScript", "WXML", "WXSS", "Node.js", "云开发"].includes(x),
      ) ||
      typeof opinion !== "string" ||
      !opinion.trim() ||
      opinion.length > 300
    )
      throw new Error("答案格式错误");
    const data = {
      name: name.trim(),
      gender,
      skills,
      opinion: opinion.trim(),
      updateTime: db.serverDate(),
    };
    const id = OPENID;
    const existing = await db.collection("UserData").where({ _id: id }).get();
    await db
      .collection("UserData")
      .doc(id)
      .set({
        data: {
          ...data,
          _openid: OPENID,
          createTime: existing.data.length
            ? existing.data[0].createTime
            : db.serverDate(),
        },
      });
    return { success: true, action: existing.data.length ? "update" : "add" };
  } catch (e) {
    return { success: false, error: e.message };
  }
};
