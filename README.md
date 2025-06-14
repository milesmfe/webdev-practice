# Building a Minimal Server-Side Rendered (SSR) Website with Node.js and Authentication

This guide walks you through how to build a minimal, low-level server-side rendered website using **Node.js**, without relying on any frameworks like Express, React, or Next.js. It includes:

- Manual HTTP handling
- Dynamic page rendering and routing
- A reusable HTML templating/layout system
- SQLite database integration for user persistence
- User registration with password hashing (using `bcrypt`)
- User login and session management (using cookies)
- Protected routes (user profile)
- User logout functionality
- Static file serving (e.g., for CSS)

---

## ✨ Features

- **Core Node.js:** Built using the native `http` module.
- **Server-Side Rendering (SSR):** HTML is generated on the server for each request.
- **Dynamic Routing:** Pages are loaded as modules based on the URL.
- **Templating System:** A simple layout wrapper (`pages/app.js`) provides consistent page structure.
- **User Authentication:**
    - Secure user registration with password hashing (`bcrypt`).
    - Login mechanism verifying credentials against the database.
    - Session management using HTTP cookies and an in-memory session store.
    - Logout functionality to clear sessions.
- **Database Integration:** Uses SQLite for storing user data.
- **Static Asset Serving:** Serves CSS files from a `/public` directory.
- **Modular Page Structure:** Each page (`index.js`, `login.js`, etc.) is a self-contained module.

---

## 📁 Project Structure

```
.
├── server.js         # Core HTTP server, request handling, and routing logic
├── pages/            # Directory for dynamic page modules
│   ├── app.js        # Global HTML wrapper/layout template
│   ├── index.js      # Home page logic
│   ├── login.js      # Login page, form, and authentication logic
│   ├── register.js   # Registration page, form, and user creation logic
│   ├── profile.js    # User profile page (requires login)
│   └── logout.js     # Handles user logout and session clearing
├── public/           # Directory for static assets
│   └── style.css     # Example stylesheet (linked in app.js)
├── database.js       # SQLite helper functions (e.g., getUserByName, createUser)
├── seed.js           # Script to initialize the database schema (creates 'users' table)
├── database.db       # SQLite database file (created by seed.js/on first run)
├── package.json      # Project metadata and dependencies
└── package-lock.json # Records exact versions of dependencies
```

---

## ⚙️ Setup Instructions

1.  **Install Node.js:**
    Ensure you have Node.js and npm installed. You can download it from https://nodejs.org.

2.  **Create Project Structure:**
    Set up the directories and files as shown in the "Project Structure" section.

3.  **Initialize Project & Install Dependencies:**
    Navigate to your project directory in the terminal and run:
    ```bash
    npm init -y
    npm install sqlite3 bcrypt cookie
    ```
    This will create a `package.json` and install the necessary libraries:
    *   `sqlite3`: For interacting with the SQLite database.
    *   `bcrypt`: For hashing passwords securely.
    *   `cookie`: For parsing and serializing HTTP cookies.

4.  **Initialize Database Schema:**
    Run the seed script to create the `users` table in your database:
    ```bash
    node seed.js
    ```
    This script (defined in `seed.js`) connects to `database.db` and executes a `CREATE TABLE IF NOT EXISTS users (...)` statement.

5.  **Start the Server:**
    ```bash
    node server.js
    ```

6.  **Open in Your Browser:**
    Navigate to `http://localhost:3000/`. You should see the home page.

---

## 🌐 How It Works

### Overview Diagram

This diagram illustrates the basic flow for a request:

```
[Browser] --(GET /profile)--> [server.js]
     |
     v
[dynamically require pages/profile.js]
     |
     v
[call render(query, req, res) -> returns HTML string or Promise<string>]
     |
     v
[wrap in pages/app.js HTML layout, including auth links]
     |
     v
<-- Full HTML Response Sent to Browser (including Set-Cookie header if login/register)
```

### `server.js` — Core Server Logic

This file is the heart of the application, responsible for handling all incoming HTTP requests.

-   **HTTP Server Creation:**
    It uses Node.js's built-in `http` module to create a server:
    ```javascript
    // server.js
    const http = require("http");
    http.createServer(async (req, res) => {
      // ... request handling logic ...
    }).listen(3000, () => console.log("Server running on http://localhost:3000"));
    ```

-   **URL Parsing:**
    The server parses the request URL to determine the path and query parameters:
    ```javascript
    // server.js
    const parsed = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsed.pathname;
    ```

-   **Static File Serving:**
    If a request path starts with `/public/`, `server.js` attempts to serve a static file (e.g., CSS, images) from the `./public` directory.
    ```javascript
    // server.js
    if (pathname.startsWith("/public/")) {
      const filePath = path.join(__dirname, pathname);
      if (fs.existsSync(filePath)) {
        res.writeHead(200); // Potentially add Content-Type based on file extension
        return fs.createReadStream(filePath).pipe(res);
      } else {
        res.writeHead(404); return res.end("Not found");
      }
    }
    ```

-   **Dynamic Routing & Page Loading:**
    For other paths, `server.js` determines the route and dynamically requires the corresponding JavaScript module from the `pages/` directory.
    ```javascript
    // server.js
    const route = pathname === "/" ? "index" : pathname.slice(1);
    try {
      const page = require(`./pages/${route}.js`);
      // ...
    } catch (err) {
      res.writeHead(404);
      res.end("Page not found");
    }
    ```
    This means adding a new page is as simple as creating a new `.js` file in the `pages` directory.

-   **Rendering Page Content:**
    Once the page module is loaded, its `render` function is called. This function can be asynchronous and is responsible for generating the HTML content for that specific page. It receives query parameters, the request object (`req`), and the response object (`res`).
    ```javascript
    // server.js
    const html = await page.render(parsed.query, req, res);
    ```
    The `req` and `res` objects are passed to `render` to allow pages to handle POST requests (like in `login.js` and `register.js`) and set headers (like `Set-Cookie`).

-   **Wrapping Content with Layout:**
    The HTML returned by `page.render()` is then passed to `app.wrap()` from `pages/app.js` to be embedded within the common site layout.
    ```javascript
    // server.js
    const wrapped = app.wrap(html, page.meta || {}, req);
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(wrapped);
    ```

-   **Session Store Initialization:**
    A global, in-memory object `global.sessions` is used to store active user sessions.
    ```javascript
    // server.js
    global.sessions = {};
    ```
    **Note:** This is a very basic session store. For production, sessions should be stored in a more persistent and scalable solution (e.g., Redis, database). Data in `global.sessions` will be lost if the server restarts.

### `pages/app.js` — HTML Layout Wrapper

This module acts as a master template, providing the common HTML structure (doctype, head, body, styles, etc.) for all pages.

-   **`wrap(body, meta, req)` function:**
    -   `body`: The HTML content generated by the specific page module (e.g., `index.js`, `login.js`).
    -   `meta`: An object, typically from `page.meta`, used here for setting the `<title>`.
    -   `req`: The HTTP request object, used to access cookies and determine authentication status.

-   **Authentication Links:**
    It dynamically generates navigation links based on the user's authentication state by checking for a session cookie and a corresponding entry in `global.sessions`.
    ```javascript
    // pages/app.js
    const cookie = require("cookie");
    // ...
    const cookies = cookie.parse(req.headers.cookie || "");
    const user = global.sessions?.[cookies.session];
    const authLinks = user
      ? `<p>Logged in as ${user} | <a href="/logout">Logout</a></p>`
      : `<p><a href="/login">Login</a> | <a href="/register">Register</a></p>`;
    ```

-   **HTML Structure:**
    It returns a complete HTML document string, injecting the page-specific `body`, `meta.title`, and the dynamic `authLinks`.
    ```html
    // Example output from pages/app.js
    <!DOCTYPE html>
    <html>
      <head>
        <title>${meta.title || "Untitled"}</title>
        <link rel="stylesheet" href="/public/style.css">
      </head>
      <body>
        <div class="container">
          ${authLinks} <!-- Dynamic login/logout links -->
          ${body}      <!-- Content from the specific page module -->
        </div>
      </body>
    </html>
    ```

### Page Modules (`pages/*.js`) — Dynamic Content & Logic

Each file in the `pages/` directory (except `app.js`) represents a distinct page or route. They typically export:
-   `meta`: An object containing page-specific metadata (e.g., `meta = { title: "Login" }`).
-   `render(query, req, res)`: An asynchronous function that returns an HTML string or a Promise resolving to an HTML string.

-   **`pages/index.js` (Home Page):**
    A simple page that displays a welcome message.
    ```javascript
    // pages/index.js
    exports.meta = { title: "Home" };
    exports.render = async function () {
      return "<h1>Welcome to the Home Page!</h1>";
    };
    ```

-   **`pages/register.js` (Registration):**
    -   **GET Request:** Displays a registration form with fields for username and password.
    -   **POST Request:**
        -   Reads the form data from the request body.
        -   Hashes the password using `bcrypt.hash(pass, 10)`.
        -   Calls `createUser(name, hash)` (from `database.js`) to store the new user.
        -   If successful, it generates a session token, stores it in `global.sessions`, and sets a `session` cookie.
        ```javascript
        // pages/register.js (inside POST handling)
        const hash = await bcrypt.hash(pass, 10);
        // ...
        const token = require("crypto").randomBytes(32).toString("hex");
        global.sessions[token] = name;
        res.setHeader("Set-Cookie", `session=${token}; HttpOnly; Path=/`);
        ```

-   **`pages/login.js` (Login):**
    -   **GET Request:** Displays a login form.
    -   **POST Request:**
        -   Reads form data.
        -   Retrieves the user by name using `getUserByName(name)` (from `database.js`).
        -   Compares the provided password with the stored hash using `bcrypt.compare(pass, user.password)`.
        -   If credentials are valid, it generates a session token, stores it, and sets the `session` cookie, similar to registration.
        ```javascript
        // pages/login.js (inside POST handling)
        const user = await getUserByName(name);
        if (user && await bcrypt.compare(pass, user.password)) {
          const token = crypto.randomBytes(32).toString("hex");
          global.sessions[token] = name;
          res.setHeader("Set-Cookie", `session=${token}; HttpOnly; Path=/`);
          // ...
        }
        ```

-   **`pages/profile.js` (User Profile):**
    This is a protected page. It checks for an active session by:
    1.  Parsing cookies from `req.headers.cookie`.
    2.  Looking up the session token in `global.sessions`.
    If a valid session exists, it displays a personalized welcome message. Otherwise, it prompts the user to log in.
    ```javascript
    // pages/profile.js
    const cookies = require("cookie").parse(req.headers.cookie || "");
    const session = cookies.session;
    const user = global.sessions?.[session];

    if (!user) {
      return `<p>Please <a href="/login">log in</a> to view your profile.</p>`;
    }
    return `<h1>Welcome, ${user}!</h1><p>This is your private profile page.</p>`;
    ```

-   **`pages/logout.js` (Logout):**
    -   Retrieves the session token from the cookies.
    -   Deletes the session entry from `global.sessions`.
    -   Instructs the browser to clear the `session` cookie by setting its `Max-Age` to 0.
    ```javascript
    // pages/logout.js
    delete global.sessions?.[token];
    res.setHeader("Set-Cookie", `session=; Max-Age=0; Path=/; HttpOnly`);
    ```

### Session Management

-   **`global.sessions`:** An in-memory JavaScript object in `server.js` acts as the session store. It maps session tokens (random strings) to usernames (e.g., `{'someRandomToken': 'alice'}`).
    -   **Pros:** Simple to implement for this minimal example.
    -   **Cons:**
        -   **Not Persistent:** All sessions are lost if the server restarts.
        -   **Not Scalable:** Cannot be easily shared across multiple server instances.
        -   For production applications, use a dedicated session store like Redis or a database-backed session table.

-   **Cookies:**
    -   When a user logs in or registers successfully, a `session` cookie is set in the browser via the `Set-Cookie` header.
    -   Example: `Set-Cookie: session=yourRandomSessionToken; HttpOnly; Path=/`
        -   `HttpOnly`: Prevents client-side JavaScript from accessing the cookie, mitigating XSS attacks.
        -   `Path=/`: Makes the cookie available across the entire site.
    -   On subsequent requests, the browser sends this cookie back to the server, allowing `pages/app.js` and `pages/profile.js` to identify the user.
    -   Logout clears this cookie by setting its expiration date to the past (`Max-Age=0`).

### Database Interaction (`database.js` & `seed.js`)

-   **`seed.js`:**
    This script initializes the SQLite database (`database.db`). It creates the `users` table if it doesn't already exist.
    ```javascript
    // seed.js
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        name TEXT PRIMARY KEY,
        password TEXT -- Stores the hashed password
      )
    `);
    ```

-   **`database.js` (Inferred):**
    This file (not explicitly provided in the context but its functions are used by `login.js` and `register.js`) would contain helper functions to interact with the SQLite database. Based on usage, it should export:
    -   `getUserByName(name)`: Executes a `SELECT` query to fetch a user by their username. Used during login to retrieve the stored password hash.
        ```javascript
        // Example (conceptual database.js)
        // const sqlite3 = require("sqlite3").verbose();
        // const db = new sqlite3.Database("database.db");
        // exports.getUserByName = (name) => {
        //   return new Promise((resolve, reject) => {
        //     db.get("SELECT * FROM users WHERE name = ?", [name], (err, row) => {
        //       if (err) return reject(err);
        //       resolve(row);
        //     });
        //   });
        // };
        ```
    -   `createUser(name, hashedPassword)`: Executes an `INSERT` query to add a new user with their username and hashed password. Used during registration.
        ```javascript
        // Example (conceptual database.js)
        // exports.createUser = (name, hashedPassword) => {
        //   return new Promise((resolve, reject) => {
        //     db.run("INSERT INTO users (name, password) VALUES (?, ?)", [name, hashedPassword], function(err) {
        //       if (err) { // e.g., UNIQUE constraint failed if username exists
        //         console.error("DB createUser error:", err.message);
        //         return resolve(false); // Or reject(err) depending on error handling strategy
        //       }
        //       resolve(this.changes > 0); // True if a row was inserted
        //     });
        //   });
        // };
        ```

---

## 🎨 `public/style.css` — Styling

Located in `/public/style.css`, this file is referenced by `pages/app.js` in the `<head>` section:
```html
<link rel="stylesheet" href="/public/style.css">
```
It's served statically by `server.js` and can contain any CSS rules to style your website, including layout, typography, colors, and animations.

---

## ✅ Why This Architecture Works

-   ✨ **Modular**: Each page is its own self-contained JavaScript module (`pages/*.js`), responsible for its own logic and rendering.
-   🔄 **Reusable Layout**: `pages/app.js` provides a consistent HTML wrapper for all pages, reducing boilerplate and ensuring a uniform look and feel.
-   🧩 **Dynamic Content**: Pages can generate HTML based on request data (query parameters, user session), and database lookups.
-   📁 **No Frameworks (Almost!)**: You have direct control over the request-response cycle using Node.js's core `http` module. Small helper libraries like `cookie` and `bcrypt` are used for specific tasks but don't dictate the overall architecture.
-   🧠 **Educational**: This approach helps in understanding the fundamental concepts of web servers, SSR, routing, and authentication from the ground up.

---

## 🧾 Summary of Files

| File                | Purpose                                                                 |
|---------------------|-------------------------------------------------------------------------|
| `server.js`         | Main HTTP server; handles requests, routing, static files, dynamic pages |
| `pages/app.js`      | Global HTML layout/template wrapper; includes auth-aware links          |
| `pages/index.js`    | Renders the home page content.                                          |
| `pages/login.js`    | Renders login form; handles login POST requests and session creation.   |
| `pages/register.js` | Renders registration form; handles POST requests and user creation.     |
| `pages/profile.js`  | Renders user profile; protected, requires active session.               |
| `pages/logout.js`   | Handles user logout; clears session and cookie.                         |
| `public/style.css`  | Contains CSS styles for the website.                                    |
| `database.js`       | (Assumed) Helper functions for SQLite database operations (CRUD users). |
| `seed.js`           | Script to set up the initial database schema (`users` table).           |
| `database.db`       | The SQLite database file.                                               |
| `package.json`      | Lists project dependencies (`sqlite3`, `bcrypt`, `cookie`) and scripts. |
| `package-lock.json` | Ensures reproducible builds by locking dependency versions.             |

---

## 📚 Want to Learn More?

To deepen your understanding, explore these topics:
-   Node.js `http` module documentation.
-   SQLite and SQL basics.
-   Password hashing best practices (why `bcrypt` is used).
-   HTTP cookies and session management security.
-   Common web vulnerabilities (XSS, CSRF) and how to mitigate them.
-   The differences and trade-offs between SSR, CSR (Client-Side Rendering), and frameworks like Express.js, Next.js, or SvelteKit.