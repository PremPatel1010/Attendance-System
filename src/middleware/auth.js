import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

const getBearerToken = (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.split(" ")[1];
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
    if (error.message === "TOKEN_MISSING") {
      return res.status(401).json({ message: "Unauthorized: token missing" });
    }

    if (error.message === "USER_NOT_FOUND") {
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }

    return res.status(401).json({ message: "Unauthorized: invalid token" });
  }
};

export const requireTeacher = async (req, res, next) => {
  try {
    const user = await loadUserFromRequest(req);

    if (user.role !== "teacher") {
      return res.status(403).json({ message: "Forbidden: teacher access only" });
    }

    req.user = user;
    req.userId = user._id;
    req.teacherId = user._id;

    return next();
  } catch (error) {
    if (error.message === "TOKEN_MISSING") {
      return res.status(401).json({ message: "Unauthorized: token missing" });
    }

    if (error.message === "USER_NOT_FOUND") {
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }

    return res.status(401).json({ message: "Unauthorized: invalid token" });
  }
};
