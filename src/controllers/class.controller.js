import { now } from "mongoose";
import {
  AddStudentService,
  CreateClassService,
  GetClassService,
} from "../services/class.service.js";
import activeSession from "../websocket/session.js";
import Class from "../models/Class.model.js";

export const CreateClass = async (req, res) => {
  try {
    const { className } = req.body;
    const teacherId = req.teacherId;

    const classname = await CreateClassService(className, teacherId);

    res.status(201).json({ classname });
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
};

export const AddStudent = async (req, res) => {
  try {
    const classId = req.params.id;
    if (!classId) {
      throw new Error("Class Id is required");
    }

    const { studentId } = req.body;

    if (!studentId) {
      throw new Error("Student is required");
    }

    const AddStudent = await AddStudentService(classId, studentId);

    res.status(201).json({ AddStudent });
  } catch (error) {
    res.status(400).send(error.message);
    console.error(error);
  }
};

export const GetClass = async (req, res) => {
  try {
    const classId = req.params.id;
    if (!classId) {
      throw new Error("Class Id is required");
    }

    const GetClass = await GetClassService(classId);

    res.status(201).json({ GetClass });
  } catch (error) {
    res.status(400).send(error.message);
    console.error(error);
  }
};

export const getMyAttendace = async (req, res) => {
  try {
    const classId = req.params.id;
    if (!classId) {
      throw new Error("classid is not present");
    }
  } catch (error) {}
};

export const StartAttendance = async (req, res) => {
  try {
    const classId = req.body.classId;
    if (!classId) {
      throw new Error("ClassId is not present");
    }
    const ActualClass = await Class.exists({_id: classId})
    console.log(ActualClass)
    
    if(!ActualClass){
      throw new Error("No such class is present")
    }


    activeSession.classId = classId;
    activeSession.startedAt = now();
    console.log(activeSession);

    res.status(201).json(activeSession);
  } catch (error) {
    res.status(403).json(error);
    console.log(error);
  }
};
