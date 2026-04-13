const express = require("express");
const dotenv = require("dotenv");
const { createTables } = require("./models/urlModel");

dotenv.config();

const app = express();
app.use(express.json());

app.use("/", require("./routes/shorten"));
app.use("/", require("./routes/redirect"));
app.use("/", require("./routes/stats"));

require("./workers/analyticsWorker"); // start the worker

const PORT = process.env.PORT || 3000;

const start = async () => {
  await createTables();
  app.listen(PORT, () => console.log(`LinkForge running on port ${PORT}`));
};

start();
