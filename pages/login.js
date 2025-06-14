const crypto = require("crypto");
const { getUserByName } = require("../database");
const bcrypt = require("bcrypt");

exports.meta = { title: "Login" };

exports.render = async function (query, req, res) {
  if (req.method === "POST") {
    let body = "";
    req.on("data", chunk => (body += chunk));
    return new Promise((resolve) => {
      req.on("end", async () => {
        const params = new URLSearchParams(body);
        const name = params.get("name");
        const pass = params.get("password");

        const user = await getUserByName(name);
        if (user && await bcrypt.compare(pass, user.password)) {
          const token = crypto.randomBytes(32).toString("hex");
          global.sessions[token] = name;

          res.setHeader("Set-Cookie", `session=${token}; HttpOnly; Path=/`);
          resolve(`<p>Login successful! <a href="/profile">Go to profile</a></p>`);
        } else {
          resolve(`<p>Login failed. <a href="/login">Try again</a></p>`);
        }
      });
    });
  }

  return `
    <form method="POST">
      <input name="name" placeholder="Username">
      <input name="password" type="password" placeholder="Password">
      <button>Login</button>
    </form>
  `;
};
