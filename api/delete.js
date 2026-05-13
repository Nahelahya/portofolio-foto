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

  const { public_id } = req.body;
  if (!public_id) return res.status(400).json({ error: "Missing public_id" });

  try {
    await cloudinary.uploader.destroy(public_id);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
};
