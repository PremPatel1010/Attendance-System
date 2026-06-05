import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

const getBearerToken = (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  if (authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  return authHeader;
};

const loadUserFromRequest = async (req) => {
  const token = getBearerToken(req);

  if (!token) {
    throw new Error("TOKEN_MISSING");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select("name email role");

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  return user;
};

export const authenticateToken = async (req, res, next) => {
  try {
    const user = await loadUserFromRequest(req);

    req.user = user;
    req.userId = user._id;
    req.teacherId = user.role === "teacher" ? user._id : undefined;

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized, token missing or invalid",
    });
  }
};

export const requireTeacher = async (req, res, next) => {
  try {
    const user = await loadUserFromRequest(req);

    if (user.role !== "teacher") {
      return res.status(403).json({
        success: false,
        error: "Forbidden, teacher access required",
      });
    }

    req.user = user;
    req.userId = user._id;
    req.teacherId = user._id;

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized, token missing or invalid",
    });
  }
};
