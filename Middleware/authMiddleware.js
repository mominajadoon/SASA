const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    console.log("No token provided");
    return res.status(401).json({ error: "Access denied" });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // Adjust based on your token structure
    req.user = verified.user || verified;

    next();
  } catch (error) {
    console.log("Invalid token:", error.message);
    res.status(400).json({ error: "Invalid token" });
  }
};

module.exports = authMiddleware;
