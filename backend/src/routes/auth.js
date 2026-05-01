const express = require("express");
const router = express.Router();
const passport = require("passport");

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/failed" }),
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}?loggedIn=true`);
  },
);

router.get("/auth/me", (req, res) => {
  if (req.user) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ error: "Not logged in" });
  }
});

router.get("/auth/logout", (req, res) => {
  req.logout(() => {
    res.json({ message: "Logged out" });
  });
});

router.get("/auth/failed", (req, res) => {
  res.status(401).json({ error: "Google login failed" });
});

module.exports = router;
