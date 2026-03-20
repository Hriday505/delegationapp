const bcrypt = require('bcrypt')
const { validationResult } = require("express-validator");
const pool = require("../config/db");
const logActivity = require("../utlis/logActivity");

//** fetch users from database */

const getAllUsers = async (req, res, next) => {


      try {
   /** qury to fetch users */   
    let query = `
      SELECT id, name, email, role, created_at
      FROM users
    `;
    
    /** store result array */
    let values = [];

    /** hide super user fom amdin */
    if (req.user.role === "admin") {
      query += ` WHERE role != ?`;
      values.push("superadmin");
    }


    query += ` ORDER BY created_at DESC`;

    const [users] = await pool.query(query, values);

    res.status(200).json({
      message: "Users fetched successfully",
      users,
    });
  } catch (error) {
    next(error);
  }

}

//*** create users */
const createUser = async (req, res, next) => {
  try {

    /*** validation results from route validators */
    const errors = validationResult(req);

     /*** throw erro if empty  */
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    /**request  payloads */
    const { name, email, password, role } = req.body;

    /** chekc if users already exists  */
    const [existingUsers] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

     /** chekc if registerd  */
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

     /** chekc if admin or user request */
    if (req.user.role === "admin" && role !== "user") {
      return res.status(403).json({
        message: "Admin can only create users with role 'user'",
      });
    }
 
    /** supeadmin can create  admina and user*/
    if (
      req.user.role === "superadmin" &&
      !["admin", "user"].includes(role)
    ) {
      return res.status(400).json({
        message: "Superadmin can only create admin or user",
      });
    }

     /** has the password  */
    const hashedPassword = await bcrypt.hash(password, 10);
    
    /** inster into db */
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role]
    );

    /** log activity */
    await logActivity(
      req.user.id,
      `Created new ${role}: ${email}`
    );

   /* show result **/
    res.status(201).json({
      message: `${role} created successfully`,
      user: {
        id: result.insertId,
        name,
        email,
        role,
      },
    });
  } catch (error) {
    next(error);
  }
};


/** update users */
const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    /** only amdin and user can change role */
    if (!["admin", "user"].includes(role)) {
      return res.status(400).json({
        message: "Role must be either admin or user",
      });
    }

    /**query for user role */
    const [users] = await pool.query(
      "SELECT id, email, role FROM users WHERE id = ?",
      [id]
    );

    /** if user not valid */
    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

     
    const targetUser = users[0];

    /** superadmin can not chnage his own role */
    if (targetUser.id === req.user.id) {
      return res.status(400).json({
        message: "You cannot change your own role",
      });
    }

    /** super admin role can not be changed */
    if (targetUser.role === "superadmin") {
      return res.status(403).json({
        message: "Superadmin role cannot be changed",
      });
    }

    /** update user */
    await pool.query(
      "UPDATE users SET role = ? WHERE id = ?",
      [role, id]
    );

    /** log activity */
    await logActivity(
      req.user.id,
      `Updated role for ${targetUser.email} to ${role}`
    );


    /** success  */
    res.status(200).json({
      message: "User role updated successfully",
    });
  } catch (error) {
    next(error);
  }
};


/*** delete users */
const deleteUser = async (req, res, next) => {
  try {
    /** slecet id fousers */
    const { id } = req.params;

    /** query for user */
    const [users] = await pool.query(
      "SELECT id, email, role FROM users WHERE id = ?",
      [id]
    );

    /** if usre not found */
    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const targetUser = users[0];

    /** normal user can onot delete  */
    if (targetUser.id === req.user.id) {
      return res.status(400).json({
        message: "You cannot delete your own account",
      });
    }

    /** superadmin can nt delete */
    if (targetUser.role === "superadmin") {
      return res.status(403).json({
        message: "Superadmin cannot be deleted",
      });
    }

    /** delete query */
    await pool.query("DELETE FROM users WHERE id = ?", [id]);

    await logActivity(
      req.user.id,
      `Deleted user: ${targetUser.email}`
    );

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUserRole,
  deleteUser,
};
