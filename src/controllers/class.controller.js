import { z } from "zod";
import {
  AddStudentService,
  CreateClassService,
  GetClassService,
} from "../services/class.service.js";
import activeSession from "../websocket/session.js";
import Class from "../models/Class.model.js";
import Attendance from "../models/Attendance.model.js";
import User from "../models/User.model.js";

const createClassSchema = z.object({
  className: z.string().trim().min(1),
});

const classIdSchema = z.object({
  classId: z.string().trim().min(1),
});

const addStudentSchema = z.object({
  classId: z.string().trim().min(1),
  studentId: z.string().trim().min(1),
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

const canAccessClass = (classDoc, user) => {
  if (user.role === "teacher") {
    return classDoc.teacherId.toString() === user._id.toString();
  }

  return classDoc.studentIds.some(
    (studentId) => studentId.toString() === user._id.toString(),
  );
};

export const CreateClass = async (req, res) => {
  try {
    const parsedBody = parseRequest(createClassSchema, req.body);

    if (!parsedBody) {
      return sendError(res, 400, "Invalid request schema");
    }

    const teacherId = req.teacherId;

    const classname = await CreateClassService(parsedBody.className, teacherId);

    return sendSuccess(res, 201, classname);
  } catch (error) {
    console.log(error);
    return sendError(res, 400, error.message);
  }
};

export const AddStudent = async (req, res) => {
  try {
    const parsedBody = parseRequest(addStudentSchema, {
      classId: req.params.id,
      studentId: req.body.studentId,
    });

    if (!parsedBody) {
      return sendError(res, 400, "Invalid request schema");
    }

    const classDoc = await GetClassService(parsedBody.classId);

    if (classDoc.teacherId.toString() !== req.teacherId.toString()) {
      return sendError(res, 403, "Forbidden, not class teacher");
    }

    const student = await User.findById(parsedBody.studentId);

    if (!student) {
      return sendError(res, 404, "Student not found");
    }

    const updatedClass = await AddStudentService(parsedBody.classId, parsedBody.studentId);

    return sendSuccess(res, 200, updatedClass);
  } catch (error) {
    if (error.message === "Class is not present" || error.message === "No such class is present") {
      return sendError(res, 404, "Class not found");
    }

    return sendError(res, 400, error.message);
  }
};

export const GetClass = async (req, res) => {
  try {
    const parsedBody = parseRequest(classIdSchema, { classId: req.params.id });

    if (!parsedBody) {
      return sendError(res, 400, "Invalid request schema");
    }

    const classDoc = await GetClassService(parsedBody.classId);

    if (!canAccessClass(classDoc, req.user)) {
      return sendError(res, 403, "Forbidden, not class teacher");
    }

    await classDoc.populate("studentIds", "-password");
    const classData = classDoc.toObject();
    classData.students = classData.studentIds;
    delete classData.studentIds;

    return sendSuccess(res, 200, classData);
  } catch (error) {
    if (error.message === "No such class is present") {
      return sendError(res, 404, "Class not found");
    }

    return sendError(res, 400, error.message);
  }
};

export const getMyAttendace = async (req, res) => {
  try {
    const parsedBody = parseRequest(classIdSchema, { classId: req.params.id });

    if (!parsedBody) {
      return sendError(res, 400, "Invalid request schema");
    }

    const classDoc = await GetClassService(parsedBody.classId);

    if (req.user.role !== "student") {
      return sendError(res, 403, "Forbidden, student access required");
    }

    if (!classDoc.studentIds.some((studentId) => studentId.toString() === req.user._id.toString())) {
      return sendError(res, 403, "Forbidden, not enrolled in class");
    }

    const attendanceRecord = await Attendance.findOne({
      classId: classDoc._id,
      studentId: req.user._id,
    }).sort({ createdAt: -1 });

    return sendSuccess(res, 200, {
      classId: classDoc._id,
      status: attendanceRecord ? attendanceRecord.status : null,
    });
  } catch (error) {}
};

export const StartAttendance = async (req, res) => {
  try {
    const parsedBody = parseRequest(classIdSchema, { classId: req.body.classId });

    if (!parsedBody) {
      return sendError(res, 400, "Invalid request schema");
    }

    const classDoc = await Class.findById(parsedBody.classId);

    if (!classDoc) {
      return sendError(res, 404, "Class not found");
    }

    if (classDoc.teacherId.toString() !== req.teacherId.toString()) {
      return sendError(res, 403, "Forbidden, not class teacher");
    }

    activeSession.classId = parsedBody.classId;
    activeSession.startedAt = new Date().toISOString();
    activeSession.attendance = {};
    console.log(activeSession);

    return sendSuccess(res, 200, activeSession);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};
