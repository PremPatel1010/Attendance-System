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

  try {
    await newClass.save();
    return newClass;
  } catch (error) {
    const isClassNameDuplicate =
      error?.code === 11000 &&
      (error?.keyPattern?.className || error?.message?.includes("className"));

    if (!isClassNameDuplicate) {
      throw error;
    }

    await Class.collection.dropIndex("className_1").catch(() => {});
    await newClass.save();
    return newClass;
  }

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

  ClassToUpdate.studentIds.addToSet(studentId);
  await ClassToUpdate.save();

  return ClassToUpdate;
  
  
}

export const GetClassService = async(classId) => {
  console.log(classId)
  const GetClass = await Class.findById(classId)

  if(!GetClass){
    throw new Error("No such class is present");
  }

  console.log(GetClass)

  return GetClass;
}

