const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

exports.getUser = name => new Promise((resolve) => {
  db.get('SELECT * FROM users WHERE name = ?', [name], (_, row) => resolve(row));
});