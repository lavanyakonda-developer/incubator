import express from 'express';
import {
  startUpDetails,
  updateStartup,
  startUpStatus,
} from '../controllers/startup.js';

const router = express.Router();

router.get('/startup-status', startUpStatus);
router.get('/startup-details', startUpDetails);
router.post('/update-startup', updateStartup);

export default router;
