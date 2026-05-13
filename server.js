const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "nathadev";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, __dirname),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: "nahel-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24,
    sameSite: "lax"
  }
}));

function requireAuth(req, res, next) {
  if (req.session.authenticated) return next();
  res.redirect("/admin-login");
}

app.use(express.static(__dirname));

app.get("/debug", (req, res) => {
  res.send(`
    <h3>Debug Info</h3>
    <p>Password being used: <strong>${ADMIN_PASSWORD}</strong></p>
    <p>PORT: ${PORT}</p>
    <p>Session ID: ${req.sessionID || "none"}</p>
    <p>Session authenticated: ${req.session.authenticated || false}</p>
  `);
});

app.get("/admin-login", (req, res) => {
  res.send(`
    <!doctype html>
    <html>
    <head>
      <title>Admin Login</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: "Courier New", monospace; 
          background: #f0f0f0; 
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .login-box { 
          background: #fff; 
          border: 4px solid #000; 
          padding: 40px; 
          width: 360px;
        }
        h1 { 
          font-size: 24px; 
          margin-bottom: 24px; 
          text-transform: uppercase;
          background: #ff3366;
          color: #fff;
          padding: 8px;
        }
        label { 
          display: block; 
          margin-bottom: 8px; 
          font-weight: 700;
          text-transform: uppercase;
        }
        input { 
          width: 100%; 
          padding: 12px; 
          border: 3px solid #000; 
          font-family: inherit;
          margin-bottom: 16px;
        }
        button { 
          width: 100%; 
          padding: 14px; 
          border: 3px solid #000;
          background: #00ff88;
          font-weight: 700;
          text-transform: uppercase;
          cursor: pointer;
        }
        button:hover { background: #00ccff; }
        .error { color: #ff3366; margin-bottom: 16px; }
      </style>
    </head>
    <body>
      <div class="login-box">
        <h1>Admin Login</h1>
        ${req.query.error ? '<p class="error">Wrong password!</p>' : ''}
        <form method="POST" action="/admin-login">
          <label>Password</label>
          <input type="password" name="password" required />
          <button type="submit">Login</button>
        </form>
      </div>
    </body>
    </html>
  `);
});

app.post("/admin-login", (req, res) => {
  console.log("Login attempt:", req.body.password);
  console.log("Expected password:", ADMIN_PASSWORD);
  if (req.body.password === ADMIN_PASSWORD) {
    req.session.authenticated = true;
    console.log("Login success!");
    res.redirect("/admin");
  } else {
    console.log("Login failed!");
    res.redirect("/admin-login?error=1");
  }
});

app.get("/admin", requireAuth, (req, res) => {
  const photos = JSON.parse(fs.readFileSync("photos.json", "utf8"));
  const categories = JSON.parse(fs.readFileSync("categories.json", "utf8"));
  res.send(`
    <!doctype html>
    <html>
    <head>
      <title>Admin Panel</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: "Courier New", monospace; 
          background: #f0f0f0; 
          padding: 24px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          padding: 16px;
          background: #00ff88;
          border: 4px solid #000;
        }
        h1 { font-size: 24px; text-transform: uppercase; }
        .logout { 
          background: #ff3366; 
          color: #fff; 
          padding: 12px 24px; 
          text-decoration: none;
          border: 3px solid #000;
          font-weight: 700;
          text-transform: uppercase;
        }
        .upload-box {
          background: #fff;
          border: 4px solid #000;
          padding: 32px;
          margin-bottom: 32px;
        }
        h2 { 
          margin-bottom: 24px; 
          background: #ffee00;
          padding: 8px;
          display: inline-block;
        }
        .form-group { margin-bottom: 16px; }
        label { display: block; margin-bottom: 8px; font-weight: 700; text-transform: uppercase; }
        input, select { 
          width: 100%; 
          padding: 12px; 
          border: 3px solid #000; 
          font-family: inherit;
        }
        button { 
          padding: 14px 32px; 
          border: 4px solid #000;
          background: #00ccff;
          font-weight: 700;
          text-transform: uppercase;
          cursor: pointer;
        }
        button:hover { background: #ff3366; color: #fff; }
        .preview { 
          margin-top: 16px; 
          max-width: 200px; 
          border: 3px solid #000;
        }
        .gallery { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); 
          gap: 16px;
        }
        .photo-item { 
          border: 4px solid #000; 
          padding: 8px; 
          background: #fff;
        }
        .photo-item img { width: 100%; height: 150px; object-fit: cover; }
        .photo-info { margin-top: 8px; font-size: 12px; }
        .delete-btn {
          background: #ff3366;
          color: #fff;
          border: none;
          padding: 8px 16px;
          cursor: pointer;
          margin-top: 8px;
          font-family: inherit;
        }
        .delete-btn:hover { background: #000; }
        .msg { 
          padding: 12px; 
          margin-bottom: 16px; 
          border: 3px solid #000;
        }
        .msg.success { background: #00ff88; }
        .msg.error { background: #ff3366; color: #fff; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Admin Panel</h1>
        <a href="/logout" class="logout">Logout</a>
      </div>
      
      <div class="upload-box">
        <h2>Upload Photo</h2>
        <form id="uploadForm" enctype="multipart/form-data">
          <div class="form-group">
            <label>Select Photo</label>
            <input type="file" name="photo" accept="image/*" required />
          </div>
          <div class="form-group">
            <label>Category</label>
            <select name="category">
              ${categories.map(c => `<option value="${c}">${c.charAt(0).toUpperCase() + c.slice(1)}</option>`).join("")}
            </select>
          </div>
          <div class="form-group">
            <label>Title</label>
            <input type="text" name="title" placeholder="Photo title" required />
          </div>
          <button type="submit">Upload</button>
        </form>
        <div id="msg"></div>
      </div>

      <div class="upload-box" style="border-color: #ff6600;">
        <h2 style="background: #ff6600; color: #fff;">Manage Categories</h2>
        <form id="categoryForm">
          <div class="form-group">
            <label>New Category Name</label>
            <input type="text" name="category" placeholder="e.g. landscape" required />
          </div>
          <button type="submit">Add Category</button>
        </form>
        <div id="catMsg"></div>
        <div style="margin-top: 16px;">
          <strong>Existing categories:</strong>
          <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;">
            ${categories.map(c => `<span style="background: #000; color: #fff; padding: 6px 12px; font-size: 13px; border: 2px solid #000;">${c}</span>`).join("")}
          </div>
        </div>
      </div>

      <div class="upload-box">
        <h2>Photo Gallery (${photos.length} photos)</h2>
        <div class="gallery">
          ${photos.map(p => `
            <div class="photo-item">
              <img src="${p.src}" alt="${p.title}" />
              <div class="photo-info">
                <strong>${p.title}</strong><br>
                Category: ${p.category}
              </div>
              <button class="delete-btn" onclick="deletePhoto('${p.src}')">Delete</button>
            </div>
          `).join("")}
        </div>
      </div>

      <script>
        document.getElementById("uploadForm").onsubmit = async (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const msg = document.getElementById("msg");
          
          const res = await fetch("/upload", {
            method: "POST",
            body: formData
          });
          
          if (res.ok) {
            msg.innerHTML = '<div class="msg success">Upload successful! Reloading...</div>';
            setTimeout(() => location.reload(), 1500);
          } else {
            msg.innerHTML = '<div class="msg error">Upload failed!</div>';
          }
        };

        document.getElementById("categoryForm").onsubmit = async (e) => {
          e.preventDefault();
          const data = new URLSearchParams(new FormData(e.target));
          const catMsg = document.getElementById("catMsg");
          const res = await fetch("/add-category", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: data
          });
          if (res.ok) {
            catMsg.innerHTML = '<div class="msg success">Category added! Reloading...</div>';
            setTimeout(() => location.reload(), 1500);
          } else {
            const text = await res.text();
            catMsg.innerHTML = '<div class="msg error">' + text + '</div>';
          }
        };

        async function deletePhoto(filename) {
          if (!confirm("Delete this photo?")) return;
          const res = await fetch("/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filename })
          });
          if (res.ok) location.reload();
        }
      </script>
    </body>
    </html>
  `);
});

app.post("/add-category", requireAuth, express.urlencoded({ extended: true }), (req, res) => {
  const name = req.body.category?.trim().toLowerCase();
  if (!name) return res.status(400).send("Category name is required");

  const categories = JSON.parse(fs.readFileSync("categories.json", "utf8"));
  if (categories.includes(name)) return res.status(400).send("Category already exists");

  categories.push(name);
  fs.writeFileSync("categories.json", JSON.stringify(categories, null, 2));
  res.send("OK");
});

app.post("/upload", requireAuth, upload.single("photo"), (req, res) => {
  if (!req.file) return res.status(400).send("No file");
  
  const photos = JSON.parse(fs.readFileSync("photos.json", "utf8"));
  photos.push({
    category: req.body.category,
    src: req.file.filename,
    title: req.body.title
  });
  fs.writeFileSync("photos.json", JSON.stringify(photos, null, 2));
  res.send("OK");
});

app.post("/delete", requireAuth, express.json(), (req, res) => {
  const filename = req.body.filename;
  const photos = JSON.parse(fs.readFileSync("photos.json", "utf8"));
  const newPhotos = photos.filter(p => p.src !== filename);
  fs.writeFileSync("photos.json", JSON.stringify(newPhotos, null, 2));
  
  const filepath = path.join(__dirname, filename);
  if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
  
  res.send("OK");
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}/admin`);
  console.log(`Default password: nathadev`);
});