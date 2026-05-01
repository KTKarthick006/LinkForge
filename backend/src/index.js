const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const session = require("express-session");
const passport = require("./config/passport");
const { createTables } = require("./models/urlModel");

dotenv.config();

const app = express();

// CORS configuration (merged properly)
app.use(
  cors({
    origin: [process.env.FRONTEND_URL, "http://localhost:5173"],
    credentials: true,
  }),
);

// Middleware
app.use(express.json());

// Session setup (only needed if using auth)
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  }),
);

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

// Routes (combined from both)
app.use("/", require("./routes/auth"));
app.use("/", require("./routes/shorten"));
app.use("/", require("./routes/redirect"));
app.use("/", require("./routes/stats"));

// Background worker
require("./workers/analyticsWorker");

const PORT = process.env.PORT || 3000;

// Start server
const start = async () => {
  await createTables();
  app.listen(PORT, () => console.log(`LinkForge running on port ${PORT}`));
};

start();
