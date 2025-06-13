import { Router } from 'express';
import {
  getContactsController,
  getContactByIdController,
  createContactController,
  patchContactController,
  deleteContactByIdController,
} from '../controllers/contacts.js';

const router = Router();

router.get('/contacts', getContactsController);
router.get('/contacts/:contactId', getContactByIdController);
router.post('/contacts', createContactController);
router.patch('/contacts/:contactId', patchContactController);
router.delete('/contacts/:contactId', deleteContactByIdController);

export default router;
