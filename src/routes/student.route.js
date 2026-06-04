import express from 'express';
import { requireTeacher } from '../middleware/auth.js';
import { getStudents } from '../controllers/student.controller.js';

const router = express.Router();


router.get('/', requireTeacher ,getStudents);

export default router;