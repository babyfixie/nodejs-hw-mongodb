import express from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshSession,
} from '../controllers/auth.js';

import { authenticate } from '../middlewares/authenticate.js';
import { validateBody } from '../middlewares/validateBody.js';
import { registerSchema, loginUserSchema } from '../schemas/authSchemas.js';

const router = express.Router();

router.post(
  '/register',
  validateBody(registerSchema),
  ctrlWrapper(registerUser)
);
router.post('/login', validateBody(loginUserSchema), ctrlWrapper(loginUser));
router.post('/refresh', ctrlWrapper(refreshSession));
router.post('/logout', ctrlWrapper(logoutUser));

export default router;
