import express from "express";
import {
  allStartupNotifications,
  allIncubatorNotifications,
  addNotification,
  addNotificationTime,
  addNotifications,
} from "../controllers/notification.js";

const router = express.Router();

router.post("/get-startup-notifications", allStartupNotifications);
router.post("/get-incubator-notifications", allIncubatorNotifications);

router.post("/add-notification", addNotification);
router.post("/add-notifications", addNotifications);
router.post("/add-notification-time", addNotificationTime);

export default router;
