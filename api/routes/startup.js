import express from 'express';
import { startUpDetails } from '../controllers/startup.js';

const router = express.Router();

router.get('/startup-details', startUpDetails);

export default router;
