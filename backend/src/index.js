const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const session = require("express-session");
const passport = require("./config/passport");
const { createTables } = require("./models/urlModel");

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [process.env.FRONTEND_URL, "http://localhost:5173"],
    credentials: true,
  }),
);

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/", require("./routes/auth"));
app.use("/", require("./routes/shorten"));
app.use("/", require("./routes/redirect"));
app.use("/", require("./routes/stats"));

require("./workers/analyticsWorker");

const PORT = process.env.PORT || 3000;

const start = async () => {
  await createTables();
  app.listen(PORT, () => console.log(`LinkForge running on port ${PORT}`));
};

start();
