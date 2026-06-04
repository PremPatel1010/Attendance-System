import { getStudentService } from "../services/student.service.js";

export const getStudents = async (req, res) => {
  try {
    const Allstudents = await getStudentService();
    if(!Allstudents){
      throw new Error("Students is not present");
    }
    res.status(201).json({Allstudents});
  } catch (error) {
    res.status(403).json({error})
    console.log(error);
  }
}