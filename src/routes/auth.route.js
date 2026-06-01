import express from 'express';
import { signin, signup } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', (req,res) => {
  res.send("Hello world from auth")
})

router.post('/signup', signup);

router.post('/login', signin);

router.get("/me", authenticateToken, (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
    teacherId: req.teacherId ?? null,
  });
});

export default router;