const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // Step 1: Check header exists
    if (!authHeader) {
        console.log(authHeader);
      return res.status(401).json({
        error: "No authorization header"
      });
    }

    // Step 2: Extract token
    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        error: "Invalid token format"
      });
    }

    const token = parts[1];

    // Step 3: Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Step 4: Find user in DB
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(401).json({
        error: "User not found"
      });
    }

    // Attach full user
    req.user = user;

    next();

  } catch (err) {
    console.error("Auth Error:", err.message);

    return res.status(401).json({
      error: "Unauthorized",
      details: err.message
    });
  }
}

module.exports = authMiddleware;