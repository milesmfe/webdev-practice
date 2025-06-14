const cookie = require("cookie");
const { escapeHtml } = require("../utils");

exports.wrap = function (body, meta = {}, req) {
  const cookies = cookie.parse(req.headers.cookie || "");
  const user = global.sessions?.[cookies.session];
  const safeUserDisplay = user ? escapeHtml(user) : null;
  const authLinks = user
    ? `<p>Logged in as ${safeUserDisplay} | <a href="/logout">Logout</a></p>`
    : `<p><a href="/login">Login</a> | <a href="/register">Register</a></p>`;

  return `
<!DOCTYPE html>
<html>
  <head>
    <title>${escapeHtml(meta.title || "Untitled")}</title>
    <link rel="stylesheet" href="public/style.css">
  </head>
  <body>
    <div class="container">
      ${authLinks}
      ${body}
    </div>
  </body>
</html>
`;
};
