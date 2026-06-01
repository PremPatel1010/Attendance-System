import mongoose from "mongoose";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const { Schema } = mongoose;


const UserSchema = new Schema ({
   name: {
      type: String,
      required: true
   },
   email: {
      type: String,
      required: true, 
      unique: true,
      trim: true,
      lowercase: true,
      minLength: [6, 'Email must be at least 6 characters.'],
      maxLength: [50, 'Email must be at more 50 characters.']
   }, 
   password: {
      type: String,
      required: true,
      
   },
   role: {
      type: String, 
      enum: ['teacher', 'student'],
      required: true
   },
},
{
   timestamps: true
});

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  try {
    this.password = await bcrypt.hash(this.password, 10);
  } catch (err) {
    throw err;
  }
});

UserSchema.statics.hashPassword = async function (password) {
   return await bcrypt.hash(password, 10);
}

UserSchema.methods.isValidPassword = async function(password){
   console.log(password)
   console.log(this.password)
   return await bcrypt.compare(password, this.password);
}

UserSchema.methods.generateJWT = function () {
   return jwt.sign({id: this._id, email: this.email}, process.env.JWT_SECRET, {expiresIn: '24h'});
}

const User = mongoose.model('User', UserSchema);

export default User;


