const jwt = require("jsonwebtoken");



const authMiddleware = (req, res, next) => {
  
  //** take berear token from header */
  const authHeader = req.headers.authorization;

   //** error is token not find */
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  //** extract toeken  */
  const token = authHeader.split(" ")[1];

  //** if token find then process else give error */
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;