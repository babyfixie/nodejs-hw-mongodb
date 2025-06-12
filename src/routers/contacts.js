import express from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
  getContacts,
  getContactById,
  createContact,
  patchContact,
  deleteContact,
} from '../controllers/contactController.js';

import { validateBody } from '../middlewares/validateBody.js';
import { isValidId } from '../middlewares/isValidId.js';
import { authenticate } from '../middlewares/authenticate.js';
import {
  createContactSchema,
  updateContactSchema,
} from '../schemas/contactSchemas.js';

const router = express.Router();

router.use(authenticate);

router.get('/', ctrlWrapper(getContacts));
router.get('/:contactId', isValidId, ctrlWrapper(getContactById));
router.post('/', validateBody(createContactSchema), ctrlWrapper(createContact));
router.patch(
  '/:contactId',
  isValidId,
  validateBody(updateContactSchema),
  ctrlWrapper(patchContact)
);
router.delete('/:contactId', isValidId, ctrlWrapper(deleteContact));

export default router;
