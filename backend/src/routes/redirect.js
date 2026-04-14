const express = require("express");
const router = express.Router();
const { findByCode } = require("../models/urlModel");
const { getCache, setCache } = require("../services/cache");
const { Queue } = require("bullmq");

const analyticsQueue = new Queue("analytics", {
  connection: { url: process.env.REDIS_URL },
});

router.get("/:code", async (req, res) => {
  const { code } = req.params;

  try {
    let entry = await getCache(code);

    if (!entry) {
      entry = await findByCode(code);
      if (!entry) return res.status(404).json({ error: "Short URL not found" });
      await setCache(code, entry);
    }

    if (entry.expires_at && new Date() > new Date(entry.expires_at)) {
      return res.status(410).json({ error: "This link has expired" });
    }

    // Push analytics job asynchronously — don't await, redirect immediately
    analyticsQueue.add("click", {
      shortCode: code,
      referrer: req.headers["referer"] || null,
      userAgent: req.headers["user-agent"],
      ip: req.ip,
    });

    res.redirect(301, entry.original_url);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;
