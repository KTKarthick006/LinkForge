const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const pool = require("../models/db");
require("dotenv").config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://linkforge-pdez.onrender.com/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const name = profile.displayName;
        const googleId = profile.id;

        // Check if user exists
        let result = await pool.query(
          `SELECT * FROM users WHERE google_id = $1`,
          [googleId],
        );

        if (result.rows.length === 0) {
          // Create new user
          result = await pool.query(
            `INSERT INTO users (google_id, email, name)
         VALUES ($1, $2, $3) RETURNING *`,
            [googleId, email, name],
          );
        }

        return done(null, result.rows[0]);
      } catch (err) {
        return done(err, null);
      }
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
    done(null, result.rows[0]);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
