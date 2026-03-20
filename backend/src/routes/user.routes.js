const express = require("express");
const { body } = require("express-validator");
const {
  getAllUsers,
  createUser,
  updateUserRole,
  deleteUser,
} = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth.Middleware");
const roleMiddleware = require("../middleware/role.Middleware");

const router = express.Router();


//** get users route */
router.get(
  "/",
  authMiddleware,
  roleMiddleware("superadmin", "admin"),
  getAllUsers
);

/** post user route*/
router.post(
  "/",
  authMiddleware,
  roleMiddleware("superadmin", "admin"),
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role")
      .isIn(["admin", "user"])
      .withMessage("Role must be admin or user"),
  ],
  createUser
);

//** spueradmin can only chnage role */

router.put(
  "/:id/role",
  authMiddleware,
  roleMiddleware("superadmin"),
  [
    body("role")
      .isIn(["admin", "user"])
      .withMessage("Role must be admin or user"),
  ],
  updateUserRole
);


/** superadmin  can only delete user */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("superadmin"),
  deleteUser
);

module.exports = router;

