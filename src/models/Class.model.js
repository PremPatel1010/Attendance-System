import mongoose from "mongoose";

const ClassSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Class = mongoose.model("Class", ClassSchema);

export default Class;
