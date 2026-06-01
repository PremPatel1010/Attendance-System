import mongoose from "mongoose";


const AttendanceSchema = new mongoose.Schema ({
  classId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['present','absent'],
    required: true
  },
},
{
  timestamps: true
})


const Attendance = mongoose.model('Attendance', AttendanceSchema);

export default Attendance;