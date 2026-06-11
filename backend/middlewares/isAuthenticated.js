import jwt from "jsonwebtoken";

const protect = async (req, res, next) => {
  try {
    // check header for token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Not authenticated, no token",
        success: false
      });
    }

    // extract token from "Bearer <token>"
    const token = authHeader.split(" ")[1];

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // attach user id to request
    req.userId = decoded.userId;

    next();

  } catch (error) {
    return res.status(401).json({
      message: "Token invalid or expired",
      success: false
    });
  }
};

export default protect;