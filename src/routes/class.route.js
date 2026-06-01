import express from 'express';
import { AddStudent, CreateClass } from '../controllers/class.controller.js';
import { requireTeacher } from '../middleware/auth.js';


const router = express.Router();

router.post('/', requireTeacher, CreateClass);
router.post('/:id/add-student', requireTeacher, AddStudent);


export default router;