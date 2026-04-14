const express = require("express");
const router = express.Router();
const pool = require("../models/db");

router.get("/stats/:code", async (req, res) => {
  const { code } = req.params;
  try {
    const total = await pool.query(
      `SELECT COUNT(*) as total_clicks FROM clicks WHERE short_code = $1`,
      [code],
    );

    const byCountry = await pool.query(
      `SELECT country, COUNT(*) as count FROM clicks
       WHERE short_code = $1 GROUP BY country ORDER BY count DESC`,
      [code],
    );

    const byDevice = await pool.query(
      `SELECT device, COUNT(*) as count FROM clicks
       WHERE short_code = $1 GROUP BY device ORDER BY count DESC`,
      [code],
    );

    res.json({
      code,
      totalClicks: parseInt(total.rows[0].total_clicks),
      byCountry: byCountry.rows,
      byDevice: byDevice.rows,
    });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;
