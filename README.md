
# Building a Minimal Server-Side Rendered (SSR) Website with Node.js

This guide walks you through how to build a minimal, low-level server-side rendered website using **Node.js**, without relying on any frameworks like Express, React, or Next.js. It includes:

- Manual HTTP handling
- Dynamic page rendering
- HTML templating
- Database integration
- A reusable layout system (like a minimal SSR framework)

---

## 📁 Project Structure

```
my-ssr-site/
├── server.js         # Core server logic (unchanging)
├── pages/            # Dynamic content modules
│   ├── app.js        # Global HTML wrapper
│   ├── index.js      # Home page logic
│   └── profile.js    # Profile page (user-specific)
├── public/           # Static assets (CSS, images)
│   └── style.css     # Modern styling & animation
├── database.js       # SQLite helper
└── database.db       # SQLite database file
```

---

## ⚙️ Setup Instructions

1. **Install Node.js**  
   → https://nodejs.org

2. **Create the project structure** as shown above.

3. **Initialize the project**:
   ```bash
   npm init -y
   npm install sqlite3
   ```

4. **Optional: Seed your database** with sample users using a `seed.js` script.

5. **Start the server**:
   ```bash
   node server.js
   ```

6. **Open in your browser**:
   ```
   http://localhost:3000/
   ```

---

## 🌐 How SSR Works in This Project

### Overview Diagram

```
[Browser] --(GET /profile?name=Alice)--> [server.js]
     |
     v
[dynamically require pages/profile.js]
     |
     v
[call render(query) -> returns HTML]
     |
     v
[wrap in pages/app.js HTML layout]
     |
     v
<-- Full HTML Response Sent to Browser
```

---

## 🧠 server.js — Core Server Logic

This is your **backend engine**. It:

- Reads the requested URL
- Checks if it's a static file (like `style.css`)
- Dynamically loads a JavaScript module from `pages/`
- Calls the `render()` function of that module
- Wraps the result using `app.js`
- Responds with the full HTML

**Key logic (simplified):**
```js
const route = pathname === "/" ? "index" : pathname.slice(1);
const page = require(`./pages/${route}.js`);
const html = app.wrap(await page.render(query), page.meta || {});
res.end(html);
```

### Why this is powerful:

- `server.js` **never changes**, even when adding new pages.
- Each page is just a JS file that returns HTML dynamically.

---

## 🧱 app.js — HTML Layout Wrapper

This is like a "parent template" (like `_app.jsx` or `layout.tsx` in Next.js).

**Responsibility:**
- Wraps every page's HTML content in a full document structure.
- Applies shared styles and layout.
- Accepts a `meta.title` to customize the page title.

**Example Output:**
```html
<!DOCTYPE html>
<html>
  <head>
    <title>Home</title>
    <link rel="stylesheet" href="/public/style.css">
  </head>
  <body>
    <div class="container">
      <!-- page content here -->
    </div>
  </body>
</html>
```

---

## 🏠 index.js — The Home Page

**Exports:**
- `meta`: Page metadata
- `render(query)`: A function that returns an HTML string

**Purpose:** Show a form that lets the user enter their name:
```html
<form method="GET" action="/profile">
  <input name="name" placeholder="Enter your name">
  <button type="submit">See Profile</button>
</form>
```

The form submits to `/profile?name=...`.

---

## 👤 profile.js — Dynamic User Profile

This page receives a query like `?name=Alice`, fetches user data from the database, and renders a personalized message.

**Example Output:**
```html
<h1>Hello, Alice</h1>
<p>Your favorite color is <span style="color: blue;">blue</span>.</p>
```

If the user isn’t found, it shows:
```html
<h1>User Not Found</h1>
```

---

## 🗃️ database.js — SQLite Helper

This file provides an async function `getUser(name)`:

```js
db.get("SELECT * FROM users WHERE name = ?", [name], (err, row) => {
  resolve(row);
});
```

You can expand this to support inserting users, updates, etc.

The schema might look like:
```sql
CREATE TABLE users (
  name TEXT PRIMARY KEY,
  color TEXT
);
```

Seed example:
```js
INSERT INTO users (name, color) VALUES ('Alice', 'blue'), ('Bob', 'green');
```

---

## 🎨 style.css — Clean Styling & Animation

Located in `/public/style.css` (not shown here), this file is loaded globally via `app.js`. It includes:

- Responsive layout
- Smooth transitions
- Button and form styling
- Theming support via CSS variables

---

## ✅ Why This Architecture Works

- ✨ **Modular**: Every page is its own module
- 🔄 **Reusable layout**: `app.js` acts like a root wrapper
- 🧩 **Dynamic content**: Pages render HTML based on data
- 📁 **No frameworks**: You control every line of code
- 🧠 **Educational**: Understand everything from request → response

---

## 🧾 Summary

| File          | Purpose                            |
|---------------|-------------------------------------|
| server.js     | Main HTTP server (never changes)    |
| pages/*.js    | Individual pages that render HTML   |
| app.js        | Layout and HTML boilerplate         |
| database.js   | Interacts with SQLite               |
| style.css     | Styling for layout and animations   |

---

## 📚 Want to Learn More?

Look into:
- Node.js `http` module
- SQLite basics
- HTML templating strategies
- What frameworks like Express or React abstract away
