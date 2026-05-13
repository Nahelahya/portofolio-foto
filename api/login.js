module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || "nathadev";

  if (password === adminPassword) {
    const token = Buffer.from(`${Date.now()}:${adminPassword}`).toString("base64");
    res.json({ ok: true, token });
  } else {
    res.status(401).json({ ok: false, error: "Wrong password" });
  }
};
