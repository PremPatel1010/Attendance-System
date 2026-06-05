import { z } from "zod";
import { CreateUser, SigninUser } from "../services/auth.service.js";

const signupSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(6),
  role: z.enum(["teacher", "student"]),
});

const signinSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1),
});

const sendSuccess = (res, statusCode, data) => {
  return res.status(statusCode).json({ success: true, data });
};

const sendError = (res, statusCode, error) => {
  return res.status(statusCode).json({ success: false, error });
};

const parseRequest = (schema, payload) => {
  const result = schema.safeParse(payload);

  if (!result.success) {
    return null;
  }

  return result.data;
};

const stripPassword = (user) => {
  const userData = user.toObject();
  delete userData.password;
  return userData;
};

export const signup = async (req, res) => {
  try {
    const parsedBody = parseRequest(signupSchema, req.body);

    if (!parsedBody) {
      return sendError(res, 400, "Invalid request schema");
    }

    const user = await CreateUser(
      parsedBody.name,
      parsedBody.email,
      parsedBody.password,
      parsedBody.role
    );

    return sendSuccess(res, 201, stripPassword(user));
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

export const signin = async (req,res) =>  {
  try {
    const parsedBody = parseRequest(signinSchema, req.body);

    if (!parsedBody) {
      return sendError(res, 400, "Invalid request schema");
    }

    const user = await SigninUser(parsedBody.email, parsedBody.password);
    const token = await user.generateJWT();

    return sendSuccess(res, 200, { token });
  } catch (error) {
    if (error.message === "User not found" || error.message === "Wrong Password") {
      return sendError(res, 400, "Invalid email or password");
    }

    return sendError(res, 400, error.message);
  }
}
