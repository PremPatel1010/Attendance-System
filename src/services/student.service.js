import User from "../models/User.model.js"

export const getStudentService = async () => {

  const Allstudents = await User.find({role : "student"}, {password: 0})
  console.log(Allstudents);

  return Allstudents;
  
}