const { createUser } = require("../database");
const bcrypt = require("bcrypt");

exports.meta = { title: "Register" };

exports.render = async function (query, req, res) {
  if (req.method === "POST") {
    let body = "";
    req.on("data", chunk => (body += chunk));
    return new Promise((resolve) => {
      req.on("end", async () => {
        const params = new URLSearchParams(body);
        const name = params.get("name");
        const pass = params.get("password");

        const hash = await bcrypt.hash(pass, 10);
        try {
          const ok = await createUser(name, hash);
          if (ok) {
            const token = require("crypto").randomBytes(32).toString("hex");
            global.sessions[token] = name;
            res.setHeader("Set-Cookie", `session=${token}; HttpOnly; Path=/`);
            resolve(`<p>Registration successful! <a href="/profile">Go to profile</a></p>`);
          } else {
            resolve(`<p>Username already taken. <a href="/register">Try again</a></p>`);
          }
        } catch (e) {
          console.error("DB error:", e);
          resolve(`<p>Server error. Please try again later.</p>`);
        }
      });
    });
  }

  return `
    <form method="POST">
      <input name="name" placeholder="Username">
      <input name="password" type="password" placeholder="Password">
      <button>Register</button>
    </form>
  `;
};
