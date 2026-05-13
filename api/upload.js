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

  try {
    const { image, category, title } = req.body;
    if (!image) return res.status(400).json({ error: "No image data" });

    const result = await cloudinary.uploader.upload(image, {
      tags: ["photo", category || "uncategorized"],
      context: `custom|title=${title || "Untitled"}`,
      folder: "portfolio",
    });

    res.json({ ok: true, src: result.secure_url });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed: " + err.message });
  }
};
