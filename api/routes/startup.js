import express from 'express';
import {
  startUpDetails,
  updateStartup,
  startUpStatus,
  updateStartupStatus,
  getStartupSuppDocs,
  updateDocumentApproval,
  addSupplementaryDocument,
  updateBusinessUpdatesAnswers,
  timePeriods,
  getBusinessUpdatesAnswers,
  getMetrics,
  QuarterDetails,
  updateMetricValues,
  getMetricValues,
  getMie,
  updateMie,
  getMonths,
} from '../controllers/startup.js';

const router = express.Router();

router.get('/startup-status', startUpStatus);
router.get('/startup-details', startUpDetails);
router.post('/update-startup', updateStartup);
router.post('/update-startup-status', updateStartupStatus);
router.post('/startup-supplementary-documents', getStartupSuppDocs);
router.post('/update-documents-approved', updateDocumentApproval);
router.post('/add-supplementary-documents', addSupplementaryDocument);

// Routes for Reporting Hub in Startup Home page

router.post('/get-business-update-answers', getBusinessUpdatesAnswers);
router.post('/update-business-update-answers', updateBusinessUpdatesAnswers);
router.post('/get-time-periods', timePeriods);

router.post('/get-metrics', getMetrics);
router.post('/get-months', getMonths);

//TODO : IS THIS REQUIRED?
router.post('/get-quarter-details', QuarterDetails);

router.post('/get-metric-values', getMetricValues);
router.post('/update-metric-values', updateMetricValues);

router.post('/get-mie', getMie);
router.post('/update-mie', updateMie);

export default router;
