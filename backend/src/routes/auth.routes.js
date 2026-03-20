const express = require("express");
const { body } = require("express-validator");
const {
  register,
  login,
  me,
} = require("../controllers/auth.controller");

const authMiddleware = require('../middleware/auth.Middleware')
const router = express.Router();


router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role")
      .optional()
      .isIn(["superadmin", "admin", "user"])
      .withMessage("Invalid role"),
  ],
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  login
);

router.get("/me", authMiddleware, me);

module.exports = router;
