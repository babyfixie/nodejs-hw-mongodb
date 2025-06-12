import { Router } from 'express';
import { validateBody } from '../utils/validateBody.js';
import {
  loginSchema,
  registerSchema,
  emailSchema,
  resetPasswordSchema,
} from '../validation/auth.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
  authLoginController,
  authRegisterController,
  logoutController,
  refreshController,
  requestResetEmailController,
  resetPasswordController,
} from '../controllers/auth.js';

const authRouter = Router();

authRouter.post(
  '/register',
  validateBody(registerSchema),
  ctrlWrapper(authRegisterController),
);
authRouter.post(
  '/login',
  validateBody(loginSchema),
  ctrlWrapper(authLoginController),
);
authRouter.post(
  '/send-reset-email',
  validateBody(emailSchema),
  requestResetEmailController,
);
authRouter.post(
  '/reset-pwd',
  validateBody(resetPasswordSchema),
  resetPasswordController,
);
authRouter.post('/refresh', ctrlWrapper(refreshController));
authRouter.post('/logout', ctrlWrapper(logoutController));

export default authRouter;
