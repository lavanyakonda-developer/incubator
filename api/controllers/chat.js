import { db } from "../connect.js";
import _ from "lodash";

import util from "util";

const query = util.promisify(db.query).bind(db);

// Controller function to fetch incubator chats
export const incubatorChats = async (req, res) => {
  const { incubator_id, email } = req.body;

  // Fetch all chats for the given incubator_id
  const chatsQuery = `
    SELECT startup_id, sender, message, time
    FROM chats
    WHERE incubator_id = ?
    ORDER BY time ASC;
  `;

  db.query(chatsQuery, [incubator_id], async (chatsErr, chats) => {
    if (chatsErr) {
      return res.status(500).json(chatsErr);
    }

    // Use _.groupBy to organize chats by startup_id
    const chatData = _.reduce(
      chats,
      (acc, chat) => {
        const { startup_id, sender, message, time } = chat;
        _.set(
          acc,
          [startup_id, "chats"],
          _.get(acc, [startup_id, "chats"], [])
        );
        _.get(acc, [startup_id, "chats"]).push({ sender, message, time });
        return acc;
      },
      {}
    );

    // Fetch the last_seen time from chat_timestamps table
    const lastSeenQuery = `
      SELECT time
      FROM chat_timestamps
      WHERE incubator_id = ? AND startup_id = ? AND email = ?
      LIMIT 1;
    `;

    const startupIds = Object.keys(chatData);

    // Use _.forEach to iterate through startupIds and update last_seen and unreadCount
    _.forEach(startupIds, async (startupId) => {
      const lastSeenResult = await db.query(lastSeenQuery, [
        incubator_id,
        startupId,
        email,
      ]);

      if (lastSeenResult.length > 0) {
        _.set(chatData, [startupId, "last_seen"], lastSeenResult[0].time);

        // Calculate unreadCount based on last_seen
        const unreadCount = _.size(
          _.filter(
            _.get(chatData, [startupId, "chats"]),
            (chat) => chat.time > lastSeenResult[0].time
          )
        );

        _.set(chatData, [startupId, "unreadCount"], unreadCount);
      } else {
        // If last_seen is NA, set unreadCount as total number of chats
        _.set(
          chatData,
          [startupId, "unreadCount"],
          _.size(_.get(chatData, [startupId, "chats"], []))
        );
      }
    });

    // Send the organized chat data as a response
    return res.json(chatData);
  });
};

// Controller function to fetch startup chats
export const startupChats = async (req, res) => {
  const { incubator_id, startup_id, email } = req.body;

  // Fetch all chats for the given incubator_id and startup_id
  const chatsQuery = `
    SELECT sender, message, time
    FROM chats
    WHERE incubator_id = ? AND startup_id = ?
    ORDER BY time ASC;
  `;

  db.query(chatsQuery, [incubator_id, startup_id], async (chatsErr, chats) => {
    if (chatsErr) {
      return res.status(500).json(chatsErr);
    }

    // Organize chats by sender and time using _.groupBy
    const chatData = _.groupBy(chats, (chat) => chat.sender);

    // Fetch the last_seen time from chat_timestamps table
    const lastSeenQuery = `
      SELECT time
      FROM chat_timestamps
      WHERE incubator_id = ? AND startup_id = ? AND email = ?
      LIMIT 1;
    `;

    // Use _.forEach to iterate through senders and update last_seen and unreadCount
    _.forEach(chatData, async (chats, sender) => {
      const lastSeenResult = await db.query(lastSeenQuery, [
        incubator_id,
        startup_id,
        email,
      ]);

      if (lastSeenResult.length > 0) {
        _.set(chatData, [sender, "last_seen"], lastSeenResult[0].time);

        // Calculate unreadCount based on last_seen
        const unreadCount = _.size(
          _.filter(chats, (chat) => chat.time > lastSeenResult[0].time)
        );

        _.set(chatData, [sender, "unreadCount"], unreadCount);
      } else {
        // If last_seen is NA, set unreadCount as total number of chats
        _.set(chatData, [sender, "unreadCount"], _.size(chats));
      }
    });

    // Send the organized chat data as a response
    return res.json(chatData);
  });
};

export const addChat = async (req, res) => {
  try {
    const { incubator_id, startup_id, sender, message } = req.body;

    // SQL query to insert chat data into the chats table
    const insertChatQuery = `
        INSERT INTO chats (incubator_id, startup_id, sender, message)
        VALUES (?, ?, ?, ?)
      `;

    // Execute the query with provided values
    await db.query(insertChatQuery, [
      incubator_id,
      startup_id,
      sender,
      message,
    ]);

    return res.status(200).json({ message: "Chat added successfully" });
  } catch (error) {
    console.error("Error adding chat:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const addTime = async (req, res) => {
  try {
    const { incubator_id, startup_id, email, time } = req.body;

    // SQL query to insert timestamp data into the chat_timestamps table
    const insertTimeQuery = `
        INSERT INTO chat_timestamps (incubator_id, startup_id, email, time)
        VALUES (?, ?, ?, ?)
      `;

    // Execute the query with provided values
    await db.query(insertTimeQuery, [incubator_id, startup_id, email, time]);

    return res.status(200).json({ message: "Timestamp added successfully" });
  } catch (error) {
    console.error("Error adding timestamp:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
