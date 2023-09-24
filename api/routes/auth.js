import express from 'express';
import {
  incubatorLogin,
  incubatorRegister,
  logout,
  startupRegister,
  startupLogin,
} from '../controllers/auth.js';

const router = express.Router();

router.post('/incubator-login', incubatorLogin);
router.post('/incubator-register', incubatorRegister);
router.post('/logout', logout);
router.post('/startup-register', startupRegister);
router.post('/startup-login', startupLogin);

export default router;
