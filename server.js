const http = require('http');
const fs = require('fs');
const path = require('path');

const PAGES_DIR = path.join(__dirname, 'pages');
const appWrapper = require(path.join(PAGES_DIR, 'app.js'));

http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const query = Object.fromEntries(parsedUrl.searchParams.entries());

  // Static file serving
  if (pathname.startsWith('/public/')) {
    const file = path.join(__dirname, pathname);
    return fs.readFile(file, (err, data) => {
      if (err) return res.writeHead(404).end('Not found');
      const type = { '.css': 'text/css', '.js': 'application/javascript' }[path.extname(file)] || 'text/plain';
      res.writeHead(200, { 'Content-Type': type });
      res.end(data);
    });
  }

  // Page module loading
  const name = pathname === '/' ? 'index' : pathname.slice(1);
  const file = path.join(PAGES_DIR, `${name}.js`);

  if (fs.existsSync(file)) {
    delete require.cache[require.resolve(file)];
    const page = require(file);
    const content = await page.render({ query });
    const html = appWrapper.wrap(content, page.meta || {});
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>404 Not Found</h1>');
  }
}).listen(3000, () => console.log('Server at http://localhost:3000'));