import { AddStudentService, CreateClassService } from "../services/class.service.js";

export const CreateClass = async (req,res) => {
  try {
    const {className} = req.body;
    const teacherId = req.teacherId;

    const classname = await CreateClassService(className, teacherId);
    
    res.status(201).json({ classname });
  } catch (error) {
    console.log(error)
    res.status(400).send(error.message);
    
  }

}

export const AddStudent = async (req, res) => {
  try {
    const classId = req.params.id;
    if(!classId) {
      throw new Error("Class Id is required");
    }

    const {studentId} = req.body;

    if(!studentId) {
      throw new Error("Student is required");
    }

    const AddStudent = await AddStudentService(classId, studentId);

    
    res.status(201).json({message : "Sucess"})
    
  } catch (error) {
    res.status(400).send(error.message);
    console.error(error);
    
  }
}