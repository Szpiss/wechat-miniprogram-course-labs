const math = require("./math");
function initial() {
  return {
    display: "0",
    value: 0,
    acc: null,
    operator: "",
    fresh: true,
    expression: "",
    error: "",
    lastOp: "",
    lastOperand: null,
  };
}
function press(s, key) {
  s = Object.assign({}, s);
  if (key === "AC") return initial();
  if (s.error) s = initial();
  if (/^\d$/.test(key) || key === ".") {
    let d = s.fresh ? "0" : s.display;
    if (d.includes("e")) d = "0";
    if (key === ".") {
      if (!d.includes(".")) d += ".";
    } else {
      if (d.replace(/[^0-9]/g, "").length >= 13 && d !== "0") return s;
      d = d === "0" ? key : d === "-0" ? "-" + key : d + key;
    }
    s.display = d;
    s.value = Number(d);
    s.fresh = false;
    s.lastOp = "";
    return s;
  }
  if (key === "DEL") {
    if (s.fresh) return s;
    s.display = s.display.slice(0, -1);
    if (!s.display || s.display === "-") s.display = "0";
    s.value = Number(s.display);
    return s;
  }
  if (key === "±") {
    s.value = -s.value;
    s.display = s.display.startsWith("-")
      ? s.display.slice(1)
      : s.display === "0"
        ? "-0"
        : "-" + s.display;
    s.fresh = false;
    return s;
  }
  try {
    if (["+", "-", "×", "÷"].includes(key)) {
      if (s.operator && !s.fresh) {
        s.value = math.calculate(s.acc, s.value, s.operator);
        s.display = math.format(s.value);
      }
      s.acc = s.value;
      s.operator = key;
      s.expression = math.format(s.acc) + " " + key;
      s.fresh = true;
      s.lastOp = "";
      return s;
    }
    if (key === "=") {
      const op = s.operator || s.lastOp;
      if (!op) return s;
      const b = s.operator ? s.value : s.lastOperand;
      const a = s.operator ? s.acc : s.value;
      s.value = math.calculate(a, b, op);
      s.expression = math.format(a) + " " + op + " " + math.format(b) + " =";
      s.display = math.format(s.value);
      s.lastOp = op;
      s.lastOperand = b;
      s.operator = "";
      s.acc = null;
      s.fresh = true;
      return s;
    }
  } catch (e) {
    s.error = e.message;
    s.display = "错误";
    s.expression = e.message;
    s.fresh = true;
  }
  return s;
}
module.exports = { initial, press };
