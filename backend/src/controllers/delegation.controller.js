const { validationResult } = require("express-validator");
const pool = require("../config/db");
const logActivity = require("../utlis/logActivity");

/** get all delegated works */
const getAllDelegations = async (req, res, next) => {

    /** table joining */
  try {
    let query = `
      SELECT 
        d.id,
        d.title,
        d.description,
        d.status,
        d.created_at,
        d.assigned_to,
        d.created_by,
        assignedUser.name AS assigned_to_name,
        assignedUser.email AS assigned_to_email,
        creatorUser.name AS created_by_name,
        creatorUser.email AS created_by_email
      FROM delegations d
      JOIN users assignedUser ON d.assigned_to = assignedUser.id
      JOIN users creatorUser ON d.created_by = creatorUser.id
    `;


    const values = [];

    /** user can see only his deletgations */
    if (req.user.role === "user") {
      query += ` WHERE d.assigned_to = ?`;
      values.push(req.user.id);
    }

    query += ` ORDER BY d.created_at DESC`;
     
    const [delegations] = await pool.query(query, values);
   /*fetch all delegation*/
    res.status(200).json({
      message: "Delegations fetched successfully",
      delegations,
    });
  } catch (error) {
    next(error);
  }
};


const getDelegationById = async (req, res, next) => {
  try {
    /**get user if from url */
    const { id } = req.params;

    /** joining query */
    const [delegations] = await pool.query(
      `
      SELECT 
        d.id,
        d.title,
        d.description,
        d.status,
        d.created_at,
        d.assigned_to,
        d.created_by,
        assignedUser.name AS assigned_to_name,
        assignedUser.email AS assigned_to_email,
        creatorUser.name AS created_by_name,
        creatorUser.email AS created_by_email
      FROM delegations d
      JOIN users assignedUser ON d.assigned_to = assignedUser.id
      JOIN users creatorUser ON d.created_by = creatorUser.id
      WHERE d.id = ?
      `,
      [id]
    );

    /** if  no delegetaion */
    if (delegations.length === 0) {
      return res.status(404).json({ message: "Delegation not found" });
    }

    const delegation = delegations[0];

    /** user cant access other users delegations */
    if (
      req.user.role === "user" &&
      delegation.assigned_to !== req.user.id
    ) {
      return res.status(403).json({
        message: "You can only view your own delegations",
      });
    }
 /** success */
    res.status(200).json({
      message: "Delegation fetched successfully",
      delegation,
    });
  } catch (error) {
    next(error);
  }
};



/**  create delegation */
const createDelegation = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      });
    }
  
    /** payload */
    const { title, description, assigned_to, status } = req.body;
  
    /**sleect assigner user */
    const [users] = await pool.query(
      "SELECT id, role FROM users WHERE id = ?",
      [assigned_to]
    );
    /** if assigner user ot find */
    if (users.length === 0) {
      return res.status(404).json({ message: "Assigned user not found" });
    }

    const assignedUser = users[0];

  /** super user can not be delegated */
    if (assignedUser.role === "superadmin") {
      return res.status(400).json({
        message: "Delegation cannot be assigned to superadmin",
      });
    }

    const safeStatus = status || "pending";

    /** insert data into db */
    const [result] = await pool.query(
      `
      INSERT INTO delegations (title, description, assigned_to, created_by, status)
      VALUES (?, ?, ?, ?, ?)
      `,
      [title, description || null, assigned_to, req.user.id, safeStatus]
    );

    await logActivity(
      req.user.id,
      `Created delegation #${result.insertId} assigned to user ID ${assigned_to}`
    );

    /** success */
    res.status(201).json({
      message: "Delegation created successfully",
      delegation: {
        id: result.insertId,
        title,
        description,
        assigned_to,
        created_by: req.user.id,
        status: safeStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};


/**update delegation */

const updateDelegation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, assigned_to, status } = req.body;

    const [delegations] = await pool.query(
      "SELECT id FROM delegations WHERE id = ?",
      [id]
    );

    if (delegations.length === 0) {
      return res.status(404).json({ message: "Delegation not found" });
    }

    const [users] = await pool.query(
      "SELECT id, role FROM users WHERE id = ?",
      [assigned_to]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "Assigned user not found" });
    }

    const assignedUser = users[0];

    if (assignedUser.role === "superadmin") {
      return res.status(400).json({
        message: "Delegation cannot be assigned to superadmin",
      });
    }

    await pool.query(
      `
      UPDATE delegations
      SET title = ?, description = ?, assigned_to = ?, status = ?
      WHERE id = ?
      `,
      [title, description || null, assigned_to, status, id]
    );

    await logActivity(req.user.id, `Updated delegation #${id}`);

    res.status(200).json({
      message: "Delegation updated successfully",
    });
  } catch (error) {
    next(error);
  }
};


/*** update delegation staus */
const updateDelegationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "in-progress", "completed"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
      });
    }

    const [delegations] = await pool.query(
      "SELECT id, assigned_to, status FROM delegations WHERE id = ?",
      [id]
    );

    if (delegations.length === 0) {
      return res.status(404).json({ message: "Delegation not found" });
    }

    const delegation = delegations[0];

    if (
      req.user.role === "user" &&
      delegation.assigned_to !== req.user.id
    ) {
      return res.status(403).json({
        message: "You can update status only for your own delegations",
      });
    }

    await pool.query(
      "UPDATE delegations SET status = ? WHERE id = ?",
      [status, id]
    );

    await logActivity(
      req.user.id,
      `Updated delegation #${id} status to ${status}`
    );

    res.status(200).json({
      message: "Delegation status updated successfully",
    });
  } catch (error) {
    next(error);
  }
};


/** delete delegation */

const deleteDelegation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [delegations] = await pool.query(
      "SELECT id FROM delegations WHERE id = ?",
      [id]
    );

    if (delegations.length === 0) {
      return res.status(404).json({ message: "Delegation not found" });
    }

    await pool.query("DELETE FROM delegations WHERE id = ?", [id]);

    await logActivity(req.user.id, `Deleted delegation #${id}`);

    res.status(200).json({
      message: "Delegation deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDelegations,
  getDelegationById,
  createDelegation,
  updateDelegation,
  updateDelegationStatus,
  deleteDelegation,
};
