import { Router } from 'express';
import {
  getContactsController,
  getContactByIdController,
} from '../controllers/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const router = Router();

router.get('/contacts', getContactsController);

router.get('/contacts/:contactId', getContactByIdController);
ctrlWrapper(getContactByIdController);

export default router;
