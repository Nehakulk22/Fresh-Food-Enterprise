const jwt = require("jsonwebtoken");
const User = require("../models/User");

const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // No token is okay.
    // The existing module can continue working normally.
    if (!token) {
      return next();
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.id).select("-password");

    if (user && user.isActive) {
      req.user = user;
    }

    next();
  } catch (error) {
    // Do not block the existing business module
    // because of an optional authentication problem.
    req.user = null;
    next();
  }
};

module.exports = optionalAuth;