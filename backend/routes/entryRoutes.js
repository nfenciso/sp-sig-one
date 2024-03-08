import { Router } from 'express';
import { createEntry, getPersonalEntries, getPersonalSubEntries } from '../controllers/entryController.js';

const router = Router();

router.post('/create-entry', createEntry);
router.post('/get-personal-entries', getPersonalEntries);
router.post('/get-personal-subentries', getPersonalSubEntries);

export default router;