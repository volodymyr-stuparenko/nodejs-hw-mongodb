import { Router } from 'express';
import contactsRouter from './contact.js';
import authRouter from './auth.js';

const router = Router();

router.use(contactsRouter);
router.use(authRouter);

export default router;
