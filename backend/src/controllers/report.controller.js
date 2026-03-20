const pool = require("../config/db");

const reportsHealth = async (req, res) => {
  res.status(200).json({ message: "Reports API running" });
};

const getDashboardReport = async (req, res, next) => {
  try {
    /**user can not access  admin result */
    if (req.user.role === "user") {
      return res.status(403).json({
        message: "Users cannot access admin dashboard report",
      });
    }

    /** rsult query status */
    const [[userCountRow]] = await pool.query(
      "SELECT COUNT(*) AS total_users FROM users WHERE role != 'superadmin'"
    );

    /** slecet total delegations */
    const [[delegationCountRow]] = await pool.query(
      "SELECT COUNT(*) AS total_delegations FROM delegations"
    );
   
    /** slect status rows*/
    const [[statusCountRow]] = await pool.query(`
      SELECT
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_count,
        SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END) AS in_progress_count,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_count
      FROM delegations
    `);

    /** status cahrts rows  */
    const [statusChartRows] = await pool.query(`
      SELECT status, COUNT(*) AS total
      FROM delegations
      GROUP BY status
      ORDER BY status
    `);

    /**count montly rows */

    const [monthlyRows] = await pool.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') AS month,
        COUNT(*) AS total
      FROM delegations
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month ASC
    `);
    
    /** select all delegations */
    const [userDelegationRows] = await pool.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        COUNT(d.id) AS total_delegations
      FROM users u
      LEFT JOIN delegations d ON u.id = d.assigned_to
      WHERE u.role = 'user'
      GROUP BY u.id, u.name, u.email
      ORDER BY total_delegations DESC, u.name ASC
    `);

    /** success */
    res.status(200).json({
      message: "Dashboard report fetched successfully",
      summary: {
        total_users: userCountRow.total_users,
        total_delegations: delegationCountRow.total_delegations,
        pending: Number(statusCountRow.pending_count) || 0,
        in_progress: Number(statusCountRow.in_progress_count) || 0,
        completed: Number(statusCountRow.completed_count) || 0,
      },
      charts: {
        by_status: statusChartRows,
        monthly_delegations: monthlyRows,
        by_user: userDelegationRows,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMyReport = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [delegations] = await pool.query(
      `
      SELECT id, title, description, status, created_at, updated_at, created_by
      FROM delegations
      WHERE assigned_to = ?
      ORDER BY created_at DESC
      `,
      [userId]
    );

    const [[statusCountRow]] = await pool.query(
      `
      SELECT
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_count,
        SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END) AS in_progress_count,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_count
      FROM delegations
      WHERE assigned_to = ?
      `,
      [userId]
    );

    res.status(200).json({
      message: "My report fetched successfully",
      summary: {
        pending: Number(statusCountRow.pending_count) || 0,
        in_progress: Number(statusCountRow.in_progress_count) || 0,
        completed: Number(statusCountRow.completed_count) || 0,
        total: delegations.length,
      },
      delegations,
    });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  reportsHealth,
  getDashboardReport,
  getMyReport,
};
