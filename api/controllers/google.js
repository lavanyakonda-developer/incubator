import express from "express";
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import _ from "lodash";
import { db } from "../connect.js";
import util from "util";
const query = util.promisify(db.query).bind(db);

const router = express.Router();

const oAuth2Clients = new OAuth2Client(
  "435073120598-qeggl5r34fgme2aq2cjhcc0rds7ecnp2.apps.googleusercontent.com",
  "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",
  "http://localhost:3000"
);

async function GetRefreshToken(token) {
  let refreshToken = await oAuth2Clients.getToken(token);
  return refreshToken;
}

export const createEvent = async (req, res) => {
  try {
    const {
      title,
      start,
      end,
      description,
      guests,
      hostEmail,
      access_token,
      refresh_token,
    } = req.body;

    // Set up the OAuth2 client with the user's access token
    oAuth2Clients.setCredentials({
      access_token,
      refresh_token,
    });

    const calendar = google.calendar({ version: "v3", auth: oAuth2Clients });

    // Ensure that 'start' and 'end' are in ISO 8601 format
    const isoStartTime = new Date(start).toISOString();
    const isoEndTime = new Date(end).toISOString();

    const event = {
      summary: title,
      start: {
        dateTime: isoStartTime,
        timeZone: "Asia/Kolkata", // Replace with the desired time zone
      },
      end: {
        dateTime: isoEndTime,
        timeZone: "Asia/Kolkata", // Replace with the desired time zone
      },
      description: description,
      attendees: _.split(guests, ",").map((guest) => ({ email: guest.trim() })),
    };

    const createdEvent = await calendar.events.insert({
      calendarId: "primary", // Replace with the calendar ID you want to use
      resource: event,
    });

    res.status(200).json(createdEvent.data);
  } catch (error) {
    // Handle errors (e.g., send an error response to the frontend)
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Failed to create event" });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { title, start, end, description, guests } = req.body;

    const { access_token, refresh_token } = req.query;

    // Set up the OAuth2 client with the user's access token
    oAuth2Clients.setCredentials({
      access_token,
      refresh_token,
    });

    const calendar = google.calendar({ version: "v3", auth: oAuth2Clients });

    // Ensure that 'start' and 'end' are in ISO 8601 format
    const isoStartTime = new Date(start).toISOString();
    const isoEndTime = new Date(end).toISOString();

    const event = {
      summary: title,
      start: {
        dateTime: isoStartTime,
        timeZone: "Asia/Kolkata", // Replace with the desired time zone
      },
      end: {
        dateTime: isoEndTime,
        timeZone: "Asia/Kolkata", // Replace with the desired time zone
      },
      description: description,
      attendees: _.split(guests, ",").map((guest) => ({ email: guest.trim() })),
    };

    const updatedEvent = await calendar.events.update({
      calendarId: "primary", // Replace with the calendar ID
      eventId: eventId, // The event ID you want to update
      resource: event,
    });

    res.status(200).json(updatedEvent.data);
  } catch (error) {
    // Handle errors (e.g., send an error response to the frontend)
    console.error("Error updating event:", error);
    res.status(500).json({ error: "Failed to update event" });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const { access_token, refresh_token } = req.query;

    // Set up the OAuth2 client with the user's access token
    oAuth2Clients.setCredentials({
      access_token,
      refresh_token,
    });

    const calendar = google.calendar({ version: "v3", auth: oAuth2Clients });

    // Delete the event using the eventId
    await calendar.events.delete({
      calendarId: "primary", // Replace with the calendar ID you want to use
      eventId: eventId,
    });

    // Send a success response
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    // Handle errors (e.g., send an error response to the frontend)
    console.error("Error deleting event:", error);
    res.status(500).json({ error: "Failed to delete event" });
  }
};

export const storeRefreshToken = async function (req, res) {
  try {
    const token = await GetRefreshToken(req.body.code);

    const { userId, userRole } = req.body;

    // Define the table name based on the user's role
    const tableName =
      userRole === "incubator_founder"
        ? "incubator_founders"
        : "startup_founders";

    // Update the user's token in the database
    const updateTokenQuery = `UPDATE ${tableName} SET token = ? WHERE id = ?`;
    const updatedToken = JSON.stringify(token);
    await db.query(updateTokenQuery, [updatedToken, userId]);

    res.send({ token });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getToken = async function (req, res) {
  try {
    const { userId, userRole } = req.body;

    // Define the table name based on the user's role (either 'incubator_founders' or 'startup_founders')
    const tableName =
      userRole === "incubator_founder"
        ? "incubator_founders"
        : "startup_founders";

    // Query the database to fetch the token based on userId
    const query = `SELECT token FROM ${tableName} WHERE id = ?`;

    db.query(query, [userId], (err, result) => {
      if (err) {
        console.error("Error fetching token from the database: ", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      if (result.length === 0) {
        // Token not found for the user
        return res.status(404).json({ error: "Token not found" });
      }

      const token = JSON.parse(result[0].token);

      res.send({ token: _.get(token, "tokens", {}) });
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
