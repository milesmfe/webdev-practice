exports.meta = { title: "Profile" };
const { escapeHtml } = require("../utils");

exports.render = async function (query, req) {
  const cookies = require("cookie").parse(req.headers.cookie || "");
  const session = cookies.session;
  const user = global.sessions?.[session];

  if (!user) {
    return `<p>Please <a href="/login">log in</a> to view your profile.</p>`;
  }

  return `<h1>Welcome, ${escapeHtml(user)}!</h1><p>This is your private profile page.</p>`;
};
