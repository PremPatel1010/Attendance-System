import { getStudentService } from "../services/student.service.js";

const sendSuccess = (res, statusCode, data) => {
  return res.status(statusCode).json({ success: true, data });
};

const sendError = (res, statusCode, error) => {
  return res.status(statusCode).json({ success: false, error });
};

export const getStudents = async (req, res) => {
  try {
    const Allstudents = await getStudentService();

    return sendSuccess(res, 200, Allstudents);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
}