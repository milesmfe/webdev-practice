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

  // Whitelist of allowed page modules to prevent arbitrary file inclusion
  const allowedPageModules = {
    "/": "index",
    "/login": "login",
    "/register": "register",
    "/profile": "profile",
    "/logout": "logout",
    // Add other valid page routes here, ensure no leading/trailing slashes in keys if matching `pathname` directly
  };

  const routeModuleKey = allowedPageModules[pathname];

  try {
    if (!routeModuleKey) {
      // This specific error will be caught by the generic catch block below
      throw new Error(`Page not found for pathname: ${pathname}`);
    }
    const page = require(`./pages/${routeModuleKey}.js`);
    const html = await page.render(parsed.query, req, res);
    const wrapped = app.wrap(html, page.meta || {}, req);
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(wrapped);
  } catch (err) {
    console.error(`Error processing request for ${pathname}:`, err.message); // Log specific error for better debugging
    res.writeHead(404);
    res.end("Page not found");
  }
}).listen(3000, () => console.log("Server running on http://localhost:3000"));
