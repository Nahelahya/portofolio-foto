const cloudinary = require("./cloudinary");

module.exports = async (req, res) => {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const result = await cloudinary.api.tags({ max_results: 100 });
    const categories = (result.tags || [])
      .filter(t => t !== "photo")
      .sort();
    res.json(categories);
  } catch (err) {
    console.error("Categories error:", err);
    res.status(500).json({ error: "Failed to fetch categories: " + err.message });
  }
};
