const db = require('../database');
exports.meta = { title: 'Profile' };

exports.render = async ({ query }) => {
  const user = await db.getUser(query.name || '');
  if (!user) return `<h1>User not found</h1><a href="/">Back</a>`;
  return `
    <h1>Hello, ${user.name}</h1>
    <p>Your favorite color is <span style="color:${user.favorite_color}">${user.favorite_color}</span>.</p>
    <a href="/">Back</a>
  `;
};