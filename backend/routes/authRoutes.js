import express from 'express';
import userController from '../controllers/userController.js';

const router = express.Router();

router.post('/reg', userController.register);
router.post('/login', userController.login);
router.post('/refresh-token', userController.refreshToken);
router.post('/logout', userController.logout);

export default router;
