import express from 'express';
import userController from '../controllers/userController.js';
import { verifyToken } from '../middleware/authJWT.js';

const router = express.Router();

router.get('/profil', verifyToken, userController.getProfile);

export default router;
