import { db } from "../connect.js";
import _ from "lodash";

import util from "util";

const query = util.promisify(db.query).bind(db);

export const incubatorChats = async (req, res) => {
  const { incubator_id, email } = req.body;

  // Fetch all chats for the given incubator_id
  const chatsQuery = `
    SELECT id, startup_id, sender, message, time
    FROM chats
    WHERE incubator_id = ?
    ORDER BY time ASC;
  `;

  db.query(chatsQuery, [incubator_id], async (chatsErr, chats) => {
    if (chatsErr) {
      return res.status(500).json(chatsErr);
    }

    // Use _.groupBy to organize chats by startup_id
    let chatData = chats.reduce((acc, chat) => {
      const { startup_id, sender, message, time, id } = chat;

      if (!acc[startup_id]) {
        acc[startup_id] = { chats: [] };
      }

      acc[startup_id].chats.push({ sender, message, time, id });

      return acc;
    }, {});

    // Fetch the last_seen time from all_timestamps table
    const lastSeenQuery = `
      SELECT time
      FROM all_timestamps
      WHERE incubator_id = ? AND startup_id = ? AND email = ? AND type = ?
      LIMIT 1;
    `;

    const startupIds = Object.keys(chatData);

    // Use a loop with async/await to update chatData with last_seen and unreadCount

    for (const startupId of startupIds) {
      const lastSeenResult = await query(lastSeenQuery, [
        incubator_id,
        startupId,
        email,
        "CHAT",
      ]);

      if (lastSeenResult.length > 0) {
        chatData[startupId] = {
          ...chatData[startupId],
          last_seen: lastSeenResult[0].time,
          unreadCount: _.filter(chatData[startupId].chats, (chat) => {
            const chatTime = new Date(chat.time);
            const lastSeenTimeUpdated = new Date(lastSeenResult[0].time);

            return chatTime > lastSeenTimeUpdated;
          }).length,
        };
      } else {
        chatData[startupId] = {
          ...chatData[startupId],
          unreadCount: chatData[startupId].chats
            ? chatData[startupId].chats.length
            : 0,
        };
      }
    }

    // Send the organized chat data as a response

    return res.json(chatData);
  });
};

// Controller function to fetch startup chats
export const startupChats = async (req, res) => {
  const { incubator_id, startup_id, email } = req.body;

  // Fetch all chats for the given incubator_id and startup_id
  const chatsQuery = `
    SELECT id, sender, message, time
    FROM chats
    WHERE incubator_id = ? AND startup_id = ?
    ORDER BY time ASC;
  `;

  db.query(chatsQuery, [incubator_id, startup_id], async (chatsErr, chats) => {
    if (chatsErr) {
      return res.status(500).json(chatsErr);
    }

    // Fetch the last_seen time from all_timestamps table
    const lastSeenQuery = `
      SELECT time
      FROM all_timestamps
      WHERE incubator_id = ? AND startup_id = ? AND email = ? AND type = ?
      LIMIT 1;
    `;

    const lastSeenResult = await query(lastSeenQuery, [
      incubator_id,
      startup_id,
      email,
      "CHAT",
    ]);

    // Calculate unreadCount based on last_seen
    const lastSeenTime =
      lastSeenResult.length > 0 ? lastSeenResult[0].time : "NA";
    const unreadCount = _.size(
      _.filter(chats, (chat) => {
        const chatTime = new Date(chat.time);
        const lastSeenTimeUpdated = new Date(lastSeenTime);

        return chatTime > lastSeenTimeUpdated;
      })
    );

    // Create the response object with chats, unreadCount, and last_seen
    const response = {
      chats,
      unreadCount,
      last_seen: lastSeenTime,
    };

    // Send the response
    return res.json(response);
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
    const { incubator_id, startup_id, email, time, type = "CHAT" } = req.body;

    // Check if a row with the given incubator_id, startup_id, and email already exists
    const checkExistingRowQuery = `
      SELECT id FROM all_timestamps
      WHERE incubator_id = ? AND startup_id = ? AND email = ? AND type = ?
    `;

    const [existingRow] = await query(checkExistingRowQuery, [
      incubator_id,
      startup_id,
      email,
      type,
    ]);

    if (existingRow) {
      // Row exists, update the timestamp
      const updateTimestampQuery = `
        UPDATE all_timestamps
        SET time = ?
        WHERE incubator_id = ? AND startup_id = ? AND email = ? AND type = ?
      `;

      await db.query(updateTimestampQuery, [
        time,
        incubator_id,
        startup_id,
        email,
        type,
      ]);
    } else {
      // Row does not exist, insert a new row with the timestamp
      const insertTimestampQuery = `
        INSERT INTO all_timestamps (incubator_id, startup_id, email, time, type)
        VALUES (?, ?, ?, ?, ?)
      `;

      await db.query(insertTimestampQuery, [
        incubator_id,
        startup_id,
        email,
        time,
        type,
      ]);
    }

    return res
      .status(200)
      .json({ message: "Timestamp added/updated successfully" });
  } catch (error) {
    console.error("Error adding/updating timestamp:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
