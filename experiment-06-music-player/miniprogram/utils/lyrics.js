function parse(text) {
  const lines = [];
  String(text || "")
    .split(/\r?\n/)
    .forEach((row) => {
      const content = row.replace(/\[[^\]]*\]/g, "").trim();
      const regex = /\[(\d+):(\d+(?:\.\d+)?)\]/g;
      let m;
      while ((m = regex.exec(row)))
        lines.push({ time: Number(m[1]) * 60 + Number(m[2]), text: content });
    });
  return lines.sort((a, b) => a.time - b.time);
}
function indexAt(lines, time) {
  let index = -1;
  for (let i = 0; i < lines.length && lines[i].time <= time; i++) index = i;
  return index;
}
function time(s) {
  s = Math.max(0, Math.floor(Number(s) || 0));
  return Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2);
}
module.exports = { parse, indexAt, time };
