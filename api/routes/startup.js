import express from 'express';
import {
  startUpDetails,
  updateStartup,
  startUpStatus,
  updateStartupStatus,
  getStartupSuppDocs,
  updateDocumentApproval,
} from '../controllers/startup.js';

const router = express.Router();

router.get('/startup-status', startUpStatus);
router.get('/startup-details', startUpDetails);
router.post('/update-startup', updateStartup);
router.post('/update-startup-status', updateStartupStatus);
router.post('/startup-supplementary-documents', getStartupSuppDocs);
router.post('/update-documents-approved', updateDocumentApproval);

export default router;
