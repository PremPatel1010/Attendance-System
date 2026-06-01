import { CreateUser, SigninUser } from "../services/auth.service.js";

export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const user = await CreateUser(name,email, password, role);

    const token = await user.generateJWT();
    delete user._doc.password;
    
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const signin = async (req,res) =>  {
  try {
    const {email, password} = req.body;

  const user = await SigninUser(email, password);

  const token = await user.generateJWT();

  res.status(201).json({token});
  } catch (error) {
    res.status(400).send(error.message);
    console.log(error)
  }
}
