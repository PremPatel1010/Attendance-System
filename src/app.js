import express from 'express'
import authRoutes from "./routes/auth.route.js"
import classRoutes from "./routes/class.route.js"
import studentRoutes from "./routes/student.route.js"
import { StartAttendance } from './controllers/class.controller.js';
import { requireTeacher } from './middleware/auth.js';
import morgan from 'morgan';
import dotenv from 'dotenv'
dotenv.config();
import connect from './db/db.js';
connect();


const app = express();
app.use(morgan('dev'));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/auth", authRoutes);
app.use("/class", classRoutes);
app.use("/students", studentRoutes);
app.post("/attendance/start", requireTeacher, StartAttendance);

app.use((err, req, res, next) => {
	if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
		return res.status(400).json({
			message: "Invalid JSON in request body",
			hint: "Use double quotes for keys/strings and remove trailing commas",
		});
	}

	next(err);
});

app.use('/', (req,res) => {
	res.send("Welcome to Attendance System!!")
})
export default app;