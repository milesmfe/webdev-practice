const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("database.db");

function getUserByName(name) {
  return new Promise((resolve) => {
    db.get("SELECT * FROM users WHERE name = ?", [name], (err, row) => {
      resolve(row);
    });
  });
}

function createUser(name, hash) {
  return new Promise((resolve, reject) => {
    db.run("INSERT INTO users (name, password) VALUES (?, ?)", [name, hash], function(err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
          resolve(false);
        } else {
          reject(err);
        }
      } else {
        resolve(true);
      }
    });
  });
}

module.exports = { getUserByName, createUser };
