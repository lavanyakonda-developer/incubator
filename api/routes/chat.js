import express from "express";
import {
  incubatorChats,
  startupChats,
  addChat,
  addTime,
} from "../controllers/chat.js";

const router = express.Router();

router.post("/incubator-chats", incubatorChats);
router.post("/startup-chats", startupChats);

router.post("/add-chat", addChat);
router.post("/add-time", addTime);

export default router;
