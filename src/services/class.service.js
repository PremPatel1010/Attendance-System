import Class from "../models/Class.model.js";
import User from "../models/User.model.js";

export const CreateClassService =  async (className, teacherId) => {
  
  if(!className) {
    throw new Error("ClassName is missing");
  }

  if(!teacherId) {
    throw new Error("Teacher ID is missing");
  }

  const newClass = new Class({className, teacherId});

  await newClass.save();
  return newClass;

}

export const AddStudentService = async(classId, studentId) => {

  const ClassToUpdate = await Class.findById(classId);

  if(!ClassToUpdate) {
    throw new Error("Class is not present");
  }

  const Student = await User.findById(studentId);

  if(!Student){
    throw new Error("Such Student is not present")
  }

  const AddStudent = await Class.updateOne(
    {_id: classId},
    {
      $push: {studentIds: studentId}
    }
  )

  console.log(AddStudent);
  return AddStudent;
  
  
}