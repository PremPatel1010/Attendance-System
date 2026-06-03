import express from 'express';
import { AddStudent, CreateClass, GetClass } from '../controllers/class.controller.js';
import { authenticateToken, requireTeacher } from '../middleware/auth.js';


const router = express.Router();

router.post('/', requireTeacher, CreateClass);
router.post('/:id/add-student', requireTeacher, AddStudent);
router.get('/:id', authenticateToken, GetClass);


export default router;