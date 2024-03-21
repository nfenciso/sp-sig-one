import { Router } from 'express';
import { 
    createEntry, 
    getPersonalEntries, 
    getPersonalSubEntries, 
    getPersonalOneEntry,
    getAppropriateEntryDetails,
    getAppropriateSubentries
} from '../controllers/entryController.js';

const router = Router();

router.post('/create-entry', createEntry);
router.post('/get-personal-entries', getPersonalEntries);
router.post('/get-personal-subentries', getPersonalSubEntries);
router.post('/get-personal-singular-entry', getPersonalOneEntry);
router.post('/check-entry-access', getAppropriateEntryDetails);
router.post('/get-appropriate-subentries', getAppropriateSubentries);

export default router;