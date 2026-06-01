import mongoose from "mongoose";
import dotenv from "dotenv"
dotenv.config();

const uri = process.env.MONGO_URI;
console.log("📌 MongoDB URI:", uri);

function connect() {
  if (!uri) {
    console.error("❌ ERROR: MONGO_URI is not defined in .env file");
    process.exit(1);
  }

  mongoose
     .connect(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
     })
     .then(() => {
        console.log("✅ Database connected Successfully")
     })
     .catch((err) => {
      console.error("❌ Connection Error:", err.message);
      console.log(err)
     })
}

export default connect;