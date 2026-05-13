const cloudinary = require("./cloudinary");
const formidable = require("formidable");

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

  const form = formidable({});

  try {
    const [fields, files] = await form.parse(req);
    const file = files.photo?.[0];
    if (!file) return res.status(400).json({ error: "No file" });

    const category = fields.category?.[0] || "uncategorized";
    const title = fields.title?.[0] || "Untitled";

    const result = await cloudinary.uploader.upload(file.filepath, {
      tags: ["photo", category],
      context: { custom: { title } },
      use_filename: true,
    });

    res.json({ ok: true, src: result.secure_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
};

module.exports.config = {
  api: {
    bodyParser: false,
  },
};
