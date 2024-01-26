import express from "express";
import {
  createEvent,
  updateEvent,
  deleteEvent,
  storeRefreshToken,
  getToken,
} from "../controllers/google.js";

const router = express.Router();

router.post("/create-event", createEvent);
router.put("/update-event/:eventId", updateEvent);
router.delete("/delete-event/:eventId", deleteEvent);
router.post("/storerefreshtoken", storeRefreshToken);
router.post("/getCalendarToken", getToken);

export default router;
