const express = require("express");
const router = express.Router();
const { generateCode } = require("../services/shortener");
const { insertUrl, findByCode, findByUserId } = require("../models/urlModel");
const rateLimiter = require("../middleware/rateLimiter");

router.post("/shorten", rateLimiter, async (req, res) => {
  const { url, alias, expiresIn } = req.body;

  if (!url) return res.status(400).json({ error: "URL is required" });

  try {
    let code = alias || generateCode();

    if (alias) {
      const existing = await findByCode(alias);
      if (existing)
        return res.status(409).json({ error: "Alias already taken" });
    }

    const expiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 1000)
      : null;

    const userId = req.user ? req.user.id : null;

    const entry = await insertUrl(url, code, alias || null, expiresAt, userId);

    res.json({
      shortUrl: `${process.env.BASE_URL}/${entry.short_code}`,
      code: entry.short_code,
      expiresAt: entry.expires_at,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/my-links", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Not logged in" });
  try {
    const links = await findByUserId(req.user.id);
    res.json({ links });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;
