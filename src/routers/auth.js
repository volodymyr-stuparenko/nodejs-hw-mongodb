import { Router } from 'express';
import { loginUserSchema, registerUserSchema } from '../validation/auth.js';
import {
  loginUserController,
  registerUserController,
} from '../controllers/auth.js';
import { validateBody } from '../middlewares/validateBody.js';

const authRouter = Router();

authRouter.post(
  '/auth/register',
  validateBody(registerUserSchema),
  registerUserController,
);

authRouter.post(
  '/auth/login',
  validateBody(loginUserSchema),
  loginUserController,
);

export default authRouter;
