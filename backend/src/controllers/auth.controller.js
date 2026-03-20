const bcrypt = require("bcrypt");
const {validationResult} = require("express-validator");
const pool = require('../config/db')
const generateToken = require('../utlis/generateToken')
const logActivity = require("../utlis/logActivity");


//** register funtion */
const register = async (req, res, next) => {    


  try {

    //** collect avlodation error */
    const errors = validationResult(req);

    //** throw error if vaildate failed */
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      });
    }


    /*** read input request payload */
    const { name, email, password, role } = req.body;

    /** check if email exist */
    const [existingUsers] = await pool.query(   
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    /*** give warining if email already have on table */
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }
 
    /** has the password with bcrypt */
    const hashedPassword = await bcrypt.hash(password, 10);

    /** check role */
    const safeRole = role && ["superadmin", "admin", "user"].includes(role)
      ? role
      : "user";

      /** inster data into db */
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, safeRole]
    );

    /** log if data inserted into db */
    await logActivity(result.insertId, `Registered as ${safeRole}`);

    /**give reponse if sucess */
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: result.insertId,
        name,
        email,
        role: safeRole,
      },
    });
  } catch (error) {
    /**error if failed  */
    next(error);
  }
};

//** login function */
const login = async (req, res, next) => {


  try {
    
    //** throw error if vaildate failed */
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      });
    }

     /*** read input request payload */
    const { email, password } = req.body;

     /** check if email exist */
    const [users] = await pool.query(
      "SELECT id, name, email, password, role FROM users WHERE email = ?",
      [email]
    );

    /** throw  error if password or email is wrong */
    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
 
  
    const user = users[0];
     
    /** chekc if encrypted password & user password is matched  */
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    /** if password not match giev error */
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    /**creates JWT token using user id, role, email */
    const token = generateToken(user);

    /** log result */
    await logActivity(user.id, "Logged in");
   
    /** give response if success */
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    /** give error if failed  */
    next(error);
  }
};

/** */
const me = async (req, res, next) => {
  try {

    /**query db to slecet logged in user details  */
    const [users] = await pool.query(
      "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
      [req.user.id]
    );

     /** give error if user not found */
    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    /** sucdess */
    res.status(200).json({
      user: users[0],
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  me,
};
