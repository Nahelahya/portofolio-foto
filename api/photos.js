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
    const result = await cloudinary.search
      .expression("resource_type:image AND folder=portfolio")
      .sort_by("created_at", "desc")
      .with_field("tags")
      .with_field("context")
      .max_results(100)
      .execute();

    const photos = (result.resources || []).map(r => ({
      src: r.secure_url,
      public_id: r.public_id,
      title: r.context?.custom?.title || r.context?.custom?.caption || "Untitled",
      category: (r.tags || []).filter(t => t !== "photo")[0] || "uncategorized",
      created_at: r.created_at,
    }));

    res.json(photos);
  } catch (err) {
    console.error("Photos error:", err);
    res.status(500).json({ error: "Failed to fetch photos: " + err.message });
  }
};
