import express from 'express';
import { AddStudent, CreateClass, GetClass, getMyAttendace, StartAttendance } from '../controllers/class.controller.js';
import { authenticateToken, requireTeacher } from '../middleware/auth.js';


const router = express.Router();

router.post('/', requireTeacher, CreateClass);
router.post('/:id/add-student', requireTeacher, AddStudent);
router.get('/:id', authenticateToken, GetClass);
router.get('/:id/my-attendance', authenticateToken, getMyAttendace);
router.post('/attendance/start', requireTeacher, StartAttendance);


export default router;