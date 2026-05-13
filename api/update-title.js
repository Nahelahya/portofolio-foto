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

  const { public_id, title } = req.body || {};
  if (!public_id) return res.status(400).json({ error: "Missing public_id" });
  if (!title || !title.trim()) return res.status(400).json({ error: "Title is required" });

  try {
    await cloudinary.api.update(public_id, {
      resource_type: "image",
      context: `custom|title=${title.trim()}`,
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("Update title error:", err);
    res.status(500).json({ error: "Failed to update title: " + err.message });
  }
};
