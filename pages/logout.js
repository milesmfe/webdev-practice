exports.meta = { title: "Logout" };

exports.render = async function (query, req, res) {
  const cookies = require("cookie").parse(req.headers.cookie || "");
  const token = cookies.session;

  delete global.sessions?.[token];
  res.setHeader("Set-Cookie", `session=; Max-Age=0; Path=/; HttpOnly`);
  return `<p>You have been logged out. <a href="/login">Login again</a></p>`;
};
