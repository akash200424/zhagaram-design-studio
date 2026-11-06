const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check whether Authorization header exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no valid token provided",
      });
    }

    // Get JWT token
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing",
      });
    }

    // Never use a hardcoded fallback secret in production
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error("JWT_SECRET is not configured");

      return res.status(500).json({
        success: false,
        message: "Server authentication configuration error",
      });
    }

    // Verify JWT
    const decoded = jwt.verify(token, jwtSecret);

    // Find user associated with token
    const user = await User.findById(decoded.id).select("-password");

    // Reject if user no longer exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, user no longer exists",
      });
    }

    // Attach authenticated user to request
    req.user = user;

    next();
  } catch (error) {
    console.error("Authentication error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Not authorized, invalid or expired token",
    });
  }
};

module.exports = { protect };
