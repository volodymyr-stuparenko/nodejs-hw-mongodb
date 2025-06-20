import { Router } from 'express';
import {
  getContactsController,
  getContactByIdController,
  createContactController,
  patchContactController,
  deleteContactByIdController,
} from '../controllers/contacts.js';
import {
  createContactSchema,
  updateContactSchema,
} from '../validation/contacts.js';
import { validateBody } from '../middlewares/validateBody.js';
import { isValidId } from '../middlewares/isValidId.js';

const router = Router();

router.get('/contacts', getContactsController);
router.get('/contacts/:contactId', isValidId, getContactByIdController);
router.post(
  '/contacts',
  validateBody(createContactSchema),
  createContactController,
);
router.patch(
  '/contacts/:contactId',
  isValidId,
  validateBody(updateContactSchema),
  patchContactController,
);
router.delete('/contacts/:contactId', isValidId, deleteContactByIdController);

export default router;
