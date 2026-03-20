
const mysql = require("mysql2/promise");
require("dotenv").config();

const host = process.env.DB_HOST;
const port = Number(process.env.DB_PORT || 4000);
const dbSslEnv = process.env.DB_SSL;

const shouldUseSsl =
  dbSslEnv === "true" ||
  (dbSslEnv !== "false" &&
    (String(host || "").includes("tidbcloud.com") || port === 4000));

const pool = mysql.createPool({
  host,
  port,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: shouldUseSsl
    ? {
        minVersion: "TLSv1.2",
        rejectUnauthorized: true,
      }
    : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
