
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access denied. Token required."
      });
    }

    const token = authHeader.split(" ")[1];

    // Debugging: check which token Hoppscotch sends
    const tokenInfo = jwt.decode(token);

    console.log(
      "Received token issued at:",
      tokenInfo?.iat
        ? new Date(tokenInfo.iat * 1000).toISOString()
        : "Invalid"
    );

    console.log(
      "Received token expires at:",
      tokenInfo?.exp
        ? new Date(tokenInfo.exp * 1000).toISOString()
        : "Invalid"
    );

    // Verify token before allowing access
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.userId;
    next();

  } catch (error) {
    console.error("JWT Error:", error.name, error.message);

    if (error.expiredAt) {
      console.error(
        "Token expired at:",
        error.expiredAt.toISOString()
      );
    }

    console.error("Server current time:", new Date().toISOString());

    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};

module.exports = authMiddleware;
