const cloudinary = require("./cloudinary");

function verifyToken(token) {
  if (!token) return false;
  const decoded = Buffer.from(token, "base64").toString("utf8");
  const [, password] = decoded.split(":");
  return password === (process.env.ADMIN_PASSWORD || "nathadev");
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  if (!verifyToken(req.headers.authorization)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { category } = req.body;
  if (!category) return res.status(400).json({ error: "Category name required" });

  const name = category.trim().toLowerCase();
  if (!name) return res.status(400).json({ error: "Invalid category name" });

  try {
    const result = await cloudinary.api.tags({ max_results: 100 });
    if (result.tags.includes(name)) {
      return res.status(400).json({ error: "Category already exists" });
    }

    res.json({ ok: true, category: name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add category" });
  }
};
