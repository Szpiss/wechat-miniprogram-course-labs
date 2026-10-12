const http = require("http"),
  fs = require("fs"),
  path = require("path");
const port = Number(process.env.PORT) || 3002;
const storePath =
  process.env.DATA_FILE || path.join(__dirname, "data", "submissions.json");
function read() {
  try {
    return JSON.parse(fs.readFileSync(storePath, "utf8"));
  } catch (e) {
    if (e.code === "ENOENT") return [];
    throw e;
  }
}
function save(rows) {
  fs.mkdirSync(path.dirname(storePath), { recursive: true });
  fs.writeFileSync(storePath + ".tmp", JSON.stringify(rows, null, 2));
  fs.renameSync(storePath + ".tmp", storePath);
}
function send(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify(data));
}
function body(req) {
  return new Promise((resolve, reject) => {
    let s = "";
    req.on("data", (c) => {
      s += c;
      if (s.length > 65536) {
        reject(new Error("请求内容过长"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(s || "{}"));
      } catch {
        reject(new Error("JSON格式错误"));
      }
    });
  });
}
function media(req, res, u) {
  const f = path.resolve(
    __dirname,
    "../miniprogram/assets",
    path.basename(u.pathname),
  );
  if (!fs.existsSync(f)) return send(res, 404, { error: "素材不存在" });
  const size = fs.statSync(f).size,
    type =
      {
        ".wav": "audio/wav",
        ".mp3": "audio/mpeg",
        ".mp4": "video/mp4",
        ".png": "image/png",
      }[path.extname(f)] || "application/octet-stream";
  const match = /bytes=(\d+)-(\d*)/.exec(req.headers.range || "");
  if (match) {
    const start = Number(match[1]),
      end = match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
    if (start >= size) {
      res.writeHead(416, { "Content-Range": "bytes */" + size });
      return res.end();
    }
    res.writeHead(206, {
      "Content-Type": type,
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Content-Length": end - start + 1,
      "Accept-Ranges": "bytes",
      "Access-Control-Allow-Origin": "*",
    });
    fs.createReadStream(f, { start, end }).pipe(res);
  } else {
    res.writeHead(200, {
      "Content-Type": type,
      "Content-Length": size,
      "Accept-Ranges": "bytes",
      "Access-Control-Allow-Origin": "*",
    });
    fs.createReadStream(f).pipe(res);
  }
}
const server = http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url, "http://localhost");
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      });
      return res.end();
    }
    if (u.pathname === "/health") return send(res, 200, { ok: true });
    if (u.pathname.startsWith("/media/") && req.method === "GET")
      return media(req, res, u);
    if (u.pathname === "/api/guests" && req.method === "POST") {
      const b = await body(req);
      if (
        typeof b.name !== "string" ||
        !b.name.trim() ||
        b.name.length > 30 ||
        !/^1\d{10}$/.test(b.phone) ||
        !Number.isInteger(b.count) ||
        b.count < 1 ||
        b.count > 10
      )
        return send(res, 422, { error: "宾客信息格式错误" });
      const rows = read(),
        row = {
          id: Date.now().toString(36),
          name: b.name.trim(),
          phone: b.phone,
          count: b.count,
          message: String(b.message || "").slice(0, 200),
          createdAt: new Date().toISOString(),
        };
      rows.push(row);
      save(rows);
      return send(res, 201, { ok: true, id: row.id });
    }
    send(res, 404, { error: "接口不存在" });
  } catch (e) {
    send(res, 400, { error: e.message });
  }
});
if (require.main === module)
  server.listen(port, "0.0.0.0", () =>
    console.log("实验服务 http://127.0.0.1:" + port),
  );
module.exports = server;
