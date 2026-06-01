import User from "../models/User.model.js";

export const CreateUser = async (name,email, password, role) => {
  console.log(email,password,name, role);
  if(!email || !password || !name || !role) {
    throw new Error('Email and password are required');
  }

  const newUser = new User({
    name,
    email,
    password,
    role
  });

  await newUser.save();

  return newUser;
  
}

export const SigninUser = async(email, password) => { 
  if(!email || !password) {
    throw new Error("Credentials missing")
  }

  const user = await User.findOne({email: email});
  
  
  if(!user){
    throw new Error("User not found")
  }

  const PassValid = await user.isValidPassword(password);

  if(PassValid){
    console.log("Signin Successfully")
    return user;
  } else {
    throw new Error("Wrong Password")
  }
  
}