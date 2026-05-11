const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth/failed",
    session: false,
  }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email, name: req.user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    res.redirect(`${process.env.FRONTEND_URL}#token=${token}`);
  },
);

router.get("/auth/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Not logged in" });
  try {
    const token = authHeader.split(" ")[1];
    const user = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ user });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

router.get("/auth/failed", (req, res) => {
  res.status(401).json({ error: "Google login failed" });
});

module.exports = router;
