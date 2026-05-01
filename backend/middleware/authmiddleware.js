const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // 1. Check header
    if (!authHeader) {
      return res.status(401).json({
        error: "No authorization header"
      });
    }

    // 2. Extract token
    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        error: "Invalid token format"
      });
    }

    const token = parts[1];

    // 3. Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // IMPORTANT: use userId (not email)
    const user = await User.findById(decoded.userId).select(
      "_id email plan sheets"
    );

    if (!user) {
      return res.status(401).json({
        error: "User not found"
      });
    }

    // 4. Attach minimal user context
    req.user = {
      id: user._id,
      email: user.email,
      plan: user.plan,
      sheetId: user.sheets?.spreadsheetId || null
    };

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