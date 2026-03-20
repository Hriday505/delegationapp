const pool = require('../config/db');

const logActivity = async(userId,action)=>{

//** log query activities */
try {

    await pool.query(
      "INSERT INTO activity_logs (user_id, action) VALUES (?, ?)",
      [userId, action]
    );
  } catch (error) {
    console.error("Activity log error:", error.message);
  }


}


 module.exports = logActivity;