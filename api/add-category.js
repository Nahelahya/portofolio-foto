const cloudinary = require("./cloudinary");

function verifyToken(token) {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, "base64").toString("utf8");
    const [, password] = decoded.split(":");
    return password === (process.env.ADMIN_PASSWORD || "nathadev");
  } catch { return false; }
}

module.exports = async (req, res) => {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!verifyToken(req.headers.authorization)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { category } = req.body || {};
  if (!category || !category.trim()) {
    return res.status(400).json({ error: "Category name required" });
  }

  const name = category.trim().toLowerCase();

  try {
    const result = await cloudinary.api.tags({ max_results: 100 });
    if ((result.tags || []).includes(name)) {
      return res.status(400).json({ error: "Category already exists" });
    }

    res.json({ ok: true, category: name });
  } catch (err) {
    console.error("Add category error:", err);
    res.status(500).json({ error: "Failed to add category: " + err.message });
  }
};
