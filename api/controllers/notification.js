import { db } from "../connect.js";
import _ from "lodash";

import util from "util";

const query = util.promisify(db.query).bind(db);

export const allIncubatorNotifications = async (req, res) => {
  const { sender, incubator_id, email } = req.body;

  try {
    const notificationsQuery = `
      SELECT id, sender, time, text, redirect_type, startup_id
      FROM notifications
      WHERE incubator_id = ? AND sender = ?
      ORDER BY time DESC;
    `;

    const notifications = await query(notificationsQuery, [
      incubator_id,
      sender,
    ]);

    if (!notifications || notifications.length === 0) {
      return res.json({
        notifications: [],
        last_seen: "NA",
      });
    }

    const notifTimestampQuery = `
      SELECT time
      FROM notif_timestamps
      WHERE email = ?
      LIMIT 1;
    `;

    const notifTimestampResult = await query(notifTimestampQuery, [email]);

    const notifTimestamp =
      notifTimestampResult.length > 0 ? notifTimestampResult[0].time : "NA";

    const formattedNotifications = await Promise.all(
      _.map(notifications, async (notif) => {
        const startupQuery = `
          SELECT id, logo, name
          FROM startups
          WHERE id = ? 
        `;

        const startup = await query(startupQuery, [notif.startup_id]);

        let name = "";
        let logo = "";

        if (startup.length > 0) {
          name = startup[0].name;
          logo = startup[0].logo;
        }

        return {
          startup_id: notif.startup_id,
          incubator_id,
          isRead: notifTimestamp > notif.time,
          logo,
          name,
          id: notif.id,
          text: notif.text,
          redirect_type: notif.redirect_type,
        };
      })
    );

    const response = {
      notifications: formattedNotifications,
      showUnReadCount: _.some(formattedNotifications, (item) => !item.isRead),
    };

    return res.json(response);
  } catch (error) {
    console.error("Error in allNotifications:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const allStartupNotifications = async (req, res) => {
  const { sender, startup_id, email, incubator_id } = req.body;

  try {
    const notificationsQuery = `
      SELECT id, sender, time, text, redirect_type
      FROM notifications
      WHERE startup_id = ? AND sender = ?
      ORDER BY time DESC;
    `;

    const notifications = await query(notificationsQuery, [startup_id, sender]);

    if (!notifications || notifications.length === 0) {
      return res.json({
        notifications: [],
        showUnReadCount: false,
      });
    }

    const notifTimestampQuery = `
      SELECT time
      FROM notif_timestamps
      WHERE email = ?
      LIMIT 1;
    `;

    const notifTimestampResult = await query(notifTimestampQuery, [email]);

    const notifTimestamp =
      notifTimestampResult.length > 0 ? notifTimestampResult[0].time : "NA";

    const incubatorQuery = `
      SELECT id, logo, name
      FROM incubators
      WHERE id = ? 
    `;

    const incubator = await query(incubatorQuery, [incubator_id]);

    let name = "";
    let logo = "";

    if (incubator.length > 0) {
      name = incubator[0].name;
      logo = incubator[0].logo;
    }

    const formattedNotifications = _.map(notifications, (notif) => {
      return {
        startup_id: startup_id,
        incubator_id: notif.incubator_id,
        isRead: notifTimestamp > notif.time,
        logo,
        name,
        id: notif.id,
        text: notif.text,
        redirect_type: notif.redirect_type,
      };
    });

    const response = {
      notifications: formattedNotifications,
      showUnReadCount: _.some(formattedNotifications, (item) => !item.isRead),
    };

    return res.json(response);
  } catch (error) {
    console.error("Error in allNotifications:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const addNotification = async (req, res) => {
  try {
    const { incubator_id, startup_id, sender, text, redirect_type } = req.body;

    // SQL query to insert notification data into the notifications table
    const insertNotificationQuery = `
      INSERT INTO notifications (incubator_id, startup_id, sender, text, redirect_type)
      VALUES (?, ?, ?, ?, ?)
    `;

    // Execute the query with provided values
    await db.query(insertNotificationQuery, [
      incubator_id,
      startup_id,
      sender,
      text,
      redirect_type,
    ]);

    return res.status(200).json({ message: "Notification added successfully" });
  } catch (error) {
    console.error("Error adding notification:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const addNotifications = async (req, res) => {
  try {
    const { incubator_id, sender, text, redirect_type, startupIds } = req.body;

    // Create an array to store promises for each notification insertion
    const insertionPromises = [];

    // Loop through each startup_id and create an insertion promise
    startupIds.forEach((startup_id) => {
      const insertNotificationQuery = `
        INSERT INTO notifications (incubator_id, startup_id, sender, text, redirect_type)
        VALUES (?, ?, ?, ?, ?)
      `;

      // Execute the query with provided values and push the promise into the array
      insertionPromises.push(
        db.query(insertNotificationQuery, [
          incubator_id,
          startup_id,
          sender,
          text,
          redirect_type,
        ])
      );
    });

    // Wait for all insertion promises to complete
    await Promise.all(insertionPromises);

    return res
      .status(200)
      .json({ message: "Notifications added successfully" });
  } catch (error) {
    console.error("Error adding notifications:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const addNotificationTime = async (req, res) => {
  try {
    const { email, time } = req.body;

    // Check if a row with the given email already exists in notif_timestamps table
    const checkExistingRowQuery = `
      SELECT id FROM notif_timestamps WHERE email = ?
    `;

    const [existingRow] = await query(checkExistingRowQuery, [email]);

    if (existingRow) {
      // Row exists, update the timestamp
      const updateTimestampQuery = `
        UPDATE notif_timestamps
        SET time = ?
        WHERE email = ?
      `;

      await db.query(updateTimestampQuery, [time, email]);
    } else {
      // Row does not exist, insert a new row with the timestamp
      const insertTimestampQuery = `
        INSERT INTO notif_timestamps (email, time)
        VALUES (?, ?)
      `;

      await db.query(insertTimestampQuery, [email, time]);
    }

    return res
      .status(200)
      .json({ message: "Notification timestamp added/updated successfully" });
  } catch (error) {
    console.error("Error adding/updating notification timestamp:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
