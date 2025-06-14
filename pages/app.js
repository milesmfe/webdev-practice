const cookie = require("cookie");

exports.wrap = function (body, meta = {}, req) {
  const cookies = cookie.parse(req.headers.cookie || "");
  const user = global.sessions?.[cookies.session];
  const authLinks = user
    ? `<p>Logged in as ${user} | <a href="/logout">Logout</a></p>`
    : `<p><a href="/login">Login</a> | <a href="/register">Register</a></p>`;

  return `
<!DOCTYPE html>
<html>
  <head>
    <title>${meta.title || "Untitled"}</title>
    <link rel="stylesheet" href="/public/style.css">
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
