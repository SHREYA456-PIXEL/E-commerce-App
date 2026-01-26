import jwt from "jsonwebtoken";
import User from "../models/user.model.js"; // adjust path if needed

export const protectRoute = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;

    // 1. Check token exists
    if (!accessToken) {
      return res
        .status(401)
        .json({ message: "Unauthorized - no token provided" });
    }

    try {
      // 2. Verify token
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

      // 3. Find user from DB
      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        return res
          .status(401)
          .json({ message: "Unauthorized - user not found" });
      }

      // 4. Attach user to request
      req.user = user;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ message: "Unauthorized - token expired" });
      }

      throw error;
    }
  } catch (error) {
    console.error("Error in protectRoute middleware:", error.message);
    return res.status(401).json({ message: "Unauthorized - invalid token" });
  }
};

export const adminRoute = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Forbidden - admin access only" });
  }
};
