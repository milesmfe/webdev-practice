const http = require("http");
const fs = require("fs");
const path = require("path");
const app = require("./pages/app");


global.sessions = {};

http.createServer(async (req, res) => {
  const parsed = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsed.pathname;

  // Serve static files
  if (pathname.startsWith("/public/")) {
    const filePath = path.join(__dirname, pathname);
    if (fs.existsSync(filePath)) {
      res.writeHead(200);
      return fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404); return res.end("Not found");
    }
  }

  const route = pathname === "/" ? "index" : pathname.slice(1);
  try {
    const page = require(`./pages/${route}.js`);
    const html = await page.render(parsed.query, req, res);
    const wrapped = app.wrap(html, page.meta || {}, req);
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(wrapped);
  } catch (err) {
    res.writeHead(404);
    res.end("Page not found");
  }
}).listen(3000, () => console.log("Server running on http://localhost:3000"));
