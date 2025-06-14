const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

db.serialize(() => {
  db.run('DROP TABLE IF EXISTS users');
  db.run('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, favorite_color TEXT)');
  db.run('INSERT INTO users (name, favorite_color) VALUES ("Alice", "blue"), ("Bob", "green")');
  db.close();
});