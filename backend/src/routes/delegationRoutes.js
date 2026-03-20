const express = require("express");
const { body } = require("express-validator");
const {
  getAllDelegations,
  getDelegationById,
  createDelegation,
  updateDelegation,
  updateDelegationStatus,
  deleteDelegation,
} = require("../controllers/delegation.controller");
const authMiddleware = require("../middleware/auth.Middleware");
const roleMiddleware = require("../middleware/role.Middleware");

const router = express.Router();


router.get(
  "/",
  authMiddleware,
  roleMiddleware("superadmin", "admin", "user"),
  getAllDelegations
);

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("superadmin", "admin", "user"),
  getDelegationById
);

router.post(
  "/:id",
  authMiddleware,
  roleMiddleware("superadmin", "admin"),
    [
    body("title").notEmpty().withMessage("Title is required"),
    body("assigned_to")
      .isInt({ min: 1 })
      .withMessage("assigned_to must be a valid user id"),
    body("status")
      .optional()
      .isIn(["pending", "in-progress", "completed"])
      .withMessage("Invalid status"),
  ],
  createDelegation
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("superadmin", "admin"),
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("assigned_to")
      .isInt({ min: 1 })
      .withMessage("assigned_to must be a valid user id"),
    body("status")
      .isIn(["pending", "in-progress", "completed"])
      .withMessage("Invalid status"),
  ],
  updateDelegation
);


router.put(
  "/:id/status",
  authMiddleware,
  roleMiddleware("superadmin", "admin", "user"),
  [
    body("status")
      .isIn(["pending", "in-progress", "completed"])
      .withMessage("Invalid status"),
  ],
  updateDelegationStatus
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("superadmin"),
  deleteDelegation
);

module.exports = router;
