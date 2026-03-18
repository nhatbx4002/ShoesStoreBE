import express from 'express';
import { registerController, loginController } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /register
router.post('/register', registerController);

// POST /login
router.post('/login', loginController);

// GET /me (protected)
router.get('/me', authMiddleware, (req, res) => {
    res.json({ user: req.user });
});

export default router;
