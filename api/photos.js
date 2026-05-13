const cloudinary = require("./cloudinary");

module.exports = async (req, res) => {
  if (req.method !== "GET") return res.status(405).send("Method not allowed");

  try {
    const result = await cloudinary.search
      .expression("resource_type:image AND tags:photo")
      .sort_by("created_at", "desc")
      .with_field("tags")
      .with_field("context")
      .max_results(100)
      .execute();

    const photos = result.resources.map(r => ({
      src: r.secure_url,
      public_id: r.public_id,
      title: r.context?.custom?.title || "Untitled",
      category: (r.tags || []).filter(t => t !== "photo")[0] || "uncategorized",
      created_at: r.created_at,
    }));

    res.json(photos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch photos" });
  }
};
