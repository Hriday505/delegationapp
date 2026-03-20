const express = require("express");
const authMiddleware = require("../middleware/auth.Middleware");
const roleMiddleware = require("../middleware/role.Middleware");
const {
  reportsHealth,
  getDashboardReport,
  getMyReport,
} = require("../controllers/report.controller");

const router = express.Router();

router.get("/health", reportsHealth);

router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware("superadmin", "admin"),
  getDashboardReport
);

router.get("/me", authMiddleware, roleMiddleware("superadmin", "admin", "user"), getMyReport);

module.exports = router;
