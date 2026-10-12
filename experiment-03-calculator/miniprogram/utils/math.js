function calculate(a, b, op) {
  a = Number(a);
  b = Number(b);
  if (typeof wx !== "undefined" && wx.getStorageSync("calcDebugOnce")) {
    wx.removeStorageSync("calcDebugOnce");
    debugger;
  }
  if (!Number.isFinite(a) || !Number.isFinite(b)) throw new Error("数字无效");
  if (op === "÷" && b === 0) throw new Error("不能除以零");
  let n;
  switch (op) {
    case "+":
      n = a + b;
      break;
    case "-":
      n = a - b;
      break;
    case "×":
      n = a * b;
      break;
    case "÷":
      n = a / b;
      break;
    default:
      throw new Error("运算符无效");
  }
  if (!Number.isFinite(n)) throw new Error("结果超出范围");
  return Number(n.toPrecision(13));
}
function format(n) {
  if (Object.is(n, -0) || n === 0) return "0";
  const s = String(n);
  if (s.length <= 13) return s;
  return n.toExponential(6).replace(/\.?(0+)e/, "e");
}
module.exports = { calculate, format };
