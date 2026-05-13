const cloudinary = require("./cloudinary");

module.exports = async (req, res) => {
  if (req.method !== "GET") return res.status(405).send("Method not allowed");

  try {
    const result = await cloudinary.api.tags({
      max_results: 100,
    });

    const categories = result.tags
      .filter(t => t !== "photo")
      .sort();

    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};
