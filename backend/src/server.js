require("dotenv").config();
const app = require("./app");
const pool = require("./config/db");
const initDb = require("./config/initDb");

const PORT = process.env.PORT || 5000;

(async () => {
  if (process.env.DB_INIT === "true") {
    await initDb(pool);
    console.log("DB schema ensured");
  }

  app.listen(PORT, () => {
    console.log(`server i runing on ${PORT}`);
  });
})().catch((err) => {
  console.error("Server startup error:", err.message);
  process.exit(1);
});

