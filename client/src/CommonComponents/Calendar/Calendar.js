import React, { useEffect, useState } from "react";
import classes from "./Calendar.module.css";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid"; // a plugin!
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import _ from "lodash";
import Button from "../Button";
import { makeRequest } from "../../axios";
import axios from "axios";
import { CalendarIcon } from "@radix-ui/react-icons";

const Calendar = (props) => {
  const { userId, role, style } = props;
  const [googleEvents, setGoogleEvents] = useState([]);
  const [isEventFormOpen, setEventFormOpen] = useState(false);
  const [endDateError, setEndDateError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [hostEmail, setHostEmail] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: "",
    end: "",
    description: "",
    guests: [],
  });

  const [calendarDetails, setCalendarDetails] = useState(null);

  const isTokenExpired = (token) => {
    if (!token.expiry_date) {
      return true;
    }

    const currentTimestamp = Date.now();
    const expiryTimestamp = parseInt(token.expiry_date);

    return expiryTimestamp < currentTimestamp;
  };

  const fetchCalendarToken = async () => {
    try {
      const response = await makeRequest.post(`google/getCalendarToken`, {
        userId,
        userRole: role,
      });

      if (response.status === 200) {
        const data = response.data;

        const isExpired = isTokenExpired(data?.token);

        if (!(_.isEmpty(data?.token) || isExpired)) {
          setCalendarDetails(_.get(data, "token", {}));
        }
      } else {
        console.error("Error fetching data:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchCalendarToken();

    return () => {
      setCalendarDetails(null);
    };
  }, []);

  const fetchGoogleCalendarEvents = async (accessToken) => {
    if (_.isEmpty(accessToken)) {
      return [];
    }

    let events = [];
    try {
      const response = await axios.get(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      events = response.data.items; // Array of calendar events
    } catch (error) {
      console.error("Error fetching Google Calendar events", error);
    }

    return events;
  };

  const fetchGoogleCalendarEmail = async (accessToken) => {
    if (_.isEmpty(accessToken)) {
      return [];
    }

    let email = "";
    try {
      const response = await axios.get(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      email = response.data.summary; // Array of calendar events
    } catch (error) {
      console.error("Error fetching Google Calendar events", error);
    }

    return email;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!_.isEmpty(calendarDetails?.access_token)) {
        const events = await fetchGoogleCalendarEvents(
          calendarDetails?.access_token
        );

        const email = await fetchGoogleCalendarEmail(
          calendarDetails?.access_token
        );

        setHostEmail(email);

        setGoogleEvents(events);
      }
    };

    fetchData();
  }, [calendarDetails]);

  const handleEventClick = (eventInfo) => {
    const {
      id,
      title,
      start,
      end,
      extendedProps: { description, guests, hostEmail },
      guestsCanInviteOthers = false,
    } = eventInfo.event;

    const startDate = new Date(start);
    const endDate = new Date(end);

    var startDateUTC = startDate.getTime();
    var startDateIST = new Date(startDateUTC);
    //date shifting for IST timezone (+5 hours and 30 minutes)
    startDateIST.setHours(startDateIST.getHours() + 5);
    startDateIST.setMinutes(startDateIST.getMinutes() + 30);

    var endDateUTC = endDate.getTime();
    var endDateIST = new Date(endDateUTC);
    //date shifting for IST timezone (+5 hours and 30 minutes)
    endDateIST.setHours(endDateIST.getHours() + 5);
    endDateIST.setMinutes(endDateIST.getMinutes() + 30);

    //Convert Date objects to ISO format strings
    const isoStartTime = startDateIST.toISOString().slice(0, 16);
    const isoEndTime = endDateIST.toISOString().slice(0, 16);

    setSelectedEvent({
      id,
      title,
      start: isoStartTime,
      end: isoEndTime,
      description,
      guests,
      hostEmail,
      guestsCanInviteOthers,
    });
  };

  const handleEventUpdate = async (e) => {
    const { id: eventId } = selectedEvent;

    try {
      const response = await makeRequest.put(
        `google/update-event/${eventId}`,
        selectedEvent,
        {
          params: {
            ...calendarDetails,
          },
        }
      );

      const updatedEventId = _.get(response, "data.id", null);

      const updatedEvents = _.map(googleEvents, (event) => {
        if (event.id == updatedEventId) {
          return response.data;
        } else {
          return event;
        }
      });

      setGoogleEvents(updatedEvents);
      setSelectedEvent(null);
    } catch (error) {
      // Handle errors (e.g., show an error message to the user)
      console.error("Error updating event:", error);
    }
  };

  const handleEventDelete = async () => {
    try {
      const { id: eventId } = selectedEvent;

      // Make an HTTP DELETE request to the backend to delete the event
      const response = await makeRequest.delete(
        `/google/delete-event/${eventId}`,
        {
          params: {
            ...calendarDetails,
          },
        }
      );

      const updatedEvents = _.filter(googleEvents, (event) => {
        return event.id !== eventId;
      });

      setGoogleEvents(updatedEvents);
      setSelectedEvent(null);
    } catch (error) {
      // Handle errors (e.g., show an error message to the user)
      console.error("Error deleting event:", error);
    }
  };

  const handleDateSelect = (selectInfo) => {
    const startDate = new Date(selectInfo.start);
    const endDate = new Date(selectInfo.end);

    var startDateUTC = startDate.getTime();
    var startDateIST = new Date(startDateUTC);
    //date shifting for IST timezone (+5 hours and 30 minutes)
    startDateIST.setHours(startDateIST.getHours() + 5);
    startDateIST.setMinutes(startDateIST.getMinutes() + 30);

    var endDateUTC = endDate.getTime();
    var endDateIST = new Date(endDateUTC);
    //date shifting for IST timezone (+5 hours and 30 minutes)
    endDateIST.setHours(endDateIST.getHours() + 5);
    endDateIST.setMinutes(endDateIST.getMinutes() + 30);

    //Convert Date objects to ISO format strings
    const isoStartTime = startDateIST.toISOString().slice(0, 16);
    const isoEndTime = endDateIST.toISOString().slice(0, 16);

    // Set the start and end times in the newEvent state
    setNewEvent((prev) => {
      return { ...prev, start: isoStartTime, end: isoEndTime };
    });

    // Open the event creation form/modal
    setEventFormOpen(true);
  };

  const handleEventCreate = async () => {
    try {
      // Send the new event data to your backend API
      const response = await makeRequest.post("google/create-event", {
        ...newEvent,
        ...calendarDetails,
      });

      const updatedEvents = _.concat(googleEvents, [response.data]);
      setGoogleEvents(updatedEvents);

      // Close the event creation form/modal
      setEventFormOpen(false);
      setNewEvent({
        title: "",
        start: "",
        end: "",
        description: "",
        guests: "",
        hostEmail, // Default host email
      });

      // You can also refresh the calendar data if needed
      // Call a function to fetch and update the events in your FullCalendar component
    } catch (error) {
      // Handle errors (e.g., display an error message)
      console.error("Error creating event:", error);
    }
  };

  const isValidEmailList = (emailList) => {
    const emails = _.split(emailList, ",").map((email) => email.trim());

    // Regular expression for validating email addresses
    const emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;

    for (const email of emails) {
      if (!emailRegex.test(email)) {
        return false;
      }
    }

    return true;
  };

  const handleGoogle = async () => {
    const scope = "https://www.googleapis.com/auth/calendar.events";

    const client = window.google.accounts.oauth2.initCodeClient({
      client_id:
        "435073120598-qeggl5r34fgme2aq2cjhcc0rds7ecnp2.apps.googleusercontent.com", //Client id created in cloud console,
      scope: scope,
      ux_mode: "popup",
      callback: async (response) => {
        try {
          if (!response.code) {
            return;
          }

          //sending the code to backend nodejs express
          makeRequest
            .post("google/storerefreshtoken", {
              code: response.code,
              userId,
              userRole: role,
            })
            .then(async (data) => {
              const events = await fetchGoogleCalendarEvents(
                data?.data?.token?.tokens?.access_token
              );

              const email = await fetchGoogleCalendarEmail(
                data?.data?.token?.tokens?.access_token
              );

              setCalendarDetails(data?.data?.token?.tokens);
              setHostEmail(email);
              setGoogleEvents(events);
            })
            .catch((error) => {
              console.error("Error storing or retrieving token:", error);
              // Handle the error as needed, such as displaying an error message to the user.
            });
        } catch (error) {
          console.error("error", error);
        }
      },
    });
    client.requestCode();
  };

  return (
    <div className={classes.integrateCalendar} style={style}>
      <script src="https://accounts.google.com/gsi/client"></script>
      {calendarDetails ? (
        <FullCalendar
          plugins={[
            interactionPlugin,
            dayGridPlugin,
            timeGridPlugin,
            listPlugin,
          ]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek", // Add view options here
          }}
          events={_.map(googleEvents, (googleEvent) => ({
            id: googleEvent?.id,
            title: googleEvent?.summary,
            start: googleEvent?.start?.dateTime,
            end: googleEvent?.end?.dateTime,
            allDay: false, // Set to false for time-based events
            extendedProps: {
              hostEmail: googleEvent?.organizer?.email,
              guests: _.map(
                googleEvent?.attendees,
                (attendee) => attendee?.email
              ),
              description: googleEvent?.description,
            },
            guestsCanInviteOthers: googleEvent?.guestsCanInviteOthers,
          }))}
          eventClick={handleEventClick}
          selectable={true}
          select={handleDateSelect}
          editable={true}
        />
      ) : (
        <Button
          name={"Integrate Google Calendar"}
          onClick={handleGoogle}
          size={"3"}
          variant={"solid"}
          customStyles={{ backgroundColor: "#1C2024", width: 400, gap: 12 }}
          icon={<CalendarIcon />}
        />
      )}
      {isEventFormOpen && (
        <div className={classes.modalBackground}>
          <div className={classes.modal}>
            <div className={classes.modalContent}>
              <div className={classes.modalTopContent}>
                <div className={classes.modalColumn}>
                  <h2 style={{ margin: 0 }}>Create Event</h2>
                  <div className={classes.modalColumn}>
                    <label htmlFor="title">Event Title:</label>
                    <input
                      className={classes.inputField}
                      type="text"
                      id="title"
                      placeholder="Enter event title"
                      value={newEvent.title}
                      onChange={(e) =>
                        setNewEvent({
                          ...newEvent,
                          title: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className={classes.modalColumn}>
                    <label htmlFor="start">Start Time:</label>
                    <input
                      className={classes.inputField}
                      type="datetime-local"
                      id="start"
                      value={newEvent.start}
                      onChange={(e) =>
                        setNewEvent({
                          ...newEvent,
                          start: e.target.value,
                        })
                      }
                      style={{ height: 28 }}
                    />
                  </div>

                  <div className={classes.modalColumn}>
                    <label htmlFor="end">End Time:</label>
                    <input
                      className={classes.inputField}
                      type="datetime-local"
                      id="end"
                      value={newEvent.end}
                      style={{ height: 28 }}
                      onChange={(e) => {
                        const endDate = new Date(e.target.value);
                        const startDate = new Date(newEvent.start);

                        if (endDate < startDate) {
                          setEndDateError(
                            "End date can't be before start date"
                          );
                        } else {
                          setEndDateError(null); // Clear the error message
                        }

                        setNewEvent({
                          ...newEvent,
                          end: e.target.value,
                        });
                      }}
                    />
                    {endDateError && (
                      <p
                        style={{
                          color: "red",
                          margin: "4px 0px",
                          fontSize: "14",
                          fontFamily: "Inter",
                        }}
                      >
                        {endDateError}
                      </p>
                    )}
                  </div>

                  <div className={classes.modalColumn}>
                    <label htmlFor="description">Description:</label>
                    <textarea
                      id="description"
                      placeholder="Enter event description"
                      value={newEvent.description}
                      onChange={(e) =>
                        setNewEvent({
                          ...newEvent,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className={classes.modalColumn}>
                    <label htmlFor="guests">
                      Guests (comma-separated emails):
                    </label>
                    <input
                      className={classes.inputField}
                      type="text"
                      id="guests"
                      placeholder="Enter guest emails"
                      value={newEvent.guests}
                      onChange={(e) =>
                        setNewEvent({
                          ...newEvent,
                          guests: e.target.value,
                        })
                      }
                    />
                  </div>
                  {!_.isEmpty(newEvent.guests) &&
                    !isValidEmailList(newEvent.guests) && (
                      <p
                        style={{
                          color: "red",
                          margin: "4px 0px",
                          fontSize: "14",
                          fontFamily: "Inter",
                        }}
                      >
                        Invalid email format. Please use comma-separated emails.
                      </p>
                    )}
                </div>
              </div>

              <div className={classes.buttons}>
                <Button
                  name={"Cancel"}
                  onClick={() => setEventFormOpen(false)}
                  size={"3"}
                  variant={"solid"}
                  customStyles={{ backgroundColor: "#1C2024" }}
                />
                <Button
                  name={"Create Event"}
                  onClick={handleEventCreate}
                  disabled={_.some(
                    newEvent,
                    (value) =>
                      !value ||
                      _.isEmpty(value) ||
                      !isValidEmailList(newEvent?.guests) ||
                      endDateError
                  )}
                  size={"3"}
                  variant={"solid"}
                  customStyles={
                    _.some(
                      newEvent,
                      (value) =>
                        !value ||
                        _.isEmpty(value) ||
                        !isValidEmailList(newEvent?.guests) ||
                        endDateError
                    )
                      ? { cursor: "not-allowed" }
                      : { backgroundColor: "#1C2024" }
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedEvent && (
        <div className={classes.modalBackground}>
          <div className={classes.modal}>
            <div className={classes.modalContent}>
              <div className={classes.modalTopContent}>
                <div className={classes.modalColumn}>
                  <h2 style={{ margin: 0 }}>Event Details</h2>
                  <div className={classes.modalColumn}>
                    <label htmlFor="title">Event Title:</label>
                    <input
                      className={classes.inputField}
                      type="text"
                      id="title"
                      placeholder="Event title"
                      value={selectedEvent?.title}
                      onChange={(e) =>
                        setSelectedEvent((prev) => {
                          return {
                            ...prev,
                            title: e.target.value,
                          };
                        })
                      }
                      disabled={!_.isEqual(hostEmail, selectedEvent?.hostEmail)}
                    />
                  </div>
                  <div className={classes.modalColumn}>
                    <label htmlFor="start">Start Time:</label>
                    <input
                      className={classes.inputField}
                      type="datetime-local"
                      id="start"
                      value={selectedEvent?.start}
                      style={{ height: 28 }}
                      onChange={(e) =>
                        setSelectedEvent((prev) => {
                          return {
                            ...prev,
                            start: e.target.value,
                          };
                        })
                      }
                      disabled={!_.isEqual(hostEmail, selectedEvent?.hostEmail)}
                    />
                  </div>

                  <div className={classes.modalColumn}>
                    <label htmlFor="end">End Time:</label>
                    <input
                      className={classes.inputField}
                      type="datetime-local"
                      id="end"
                      value={selectedEvent?.end}
                      style={{ height: 28 }}
                      disabled={!_.isEqual(hostEmail, selectedEvent?.hostEmail)}
                      onChange={(e) => {
                        const endDate = new Date(e.target.value);
                        const startDate = new Date(selectedEvent.start);

                        if (endDate < startDate) {
                          setEndDateError(
                            "End date can't be before start date"
                          );
                        } else {
                          setEndDateError(null); // Clear the error message
                        }

                        setSelectedEvent((prev) => {
                          return {
                            ...prev,
                            end: e.target.value,
                          };
                        });
                      }}
                    />
                    {endDateError && (
                      <p
                        style={{
                          color: "red",
                          margin: "4px 0px",
                          fontSize: "14",
                          fontFamily: "Inter",
                        }}
                      >
                        {endDateError}
                      </p>
                    )}
                  </div>
                  <div className={classes.modalColumn}>
                    <label htmlFor="description">Description:</label>
                    <textarea
                      id="description"
                      placeholder="Enter event description"
                      value={selectedEvent.description}
                      onChange={(e) =>
                        setSelectedEvent((prev) => {
                          return {
                            ...prev,
                            description: e.target.value,
                          };
                        })
                      }
                      disabled={!_.isEqual(hostEmail, selectedEvent?.hostEmail)}
                    />
                  </div>
                  <div className={classes.modalColumn}>
                    <label htmlFor="guests">
                      Guests (comma-separated emails):
                    </label>
                    <input
                      className={classes.inputField}
                      type="text"
                      id="guests"
                      placeholder="Enter guest emails"
                      value={selectedEvent?.guests}
                      onChange={(e) =>
                        setSelectedEvent((prev) => {
                          return {
                            ...prev,
                            guests: e.target.value,
                          };
                        })
                      }
                      disabled={
                        !(
                          _.isEqual(hostEmail, selectedEvent?.hostEmail) ||
                          selectedEvent?.guestsCanInviteOthers
                        )
                      }
                    />
                  </div>
                  {!_.isEmpty(selectedEvent.guests) &&
                    !isValidEmailList(selectedEvent.guests) && (
                      <p
                        style={{
                          color: "red",
                          margin: "4px 0px",
                          fontSize: "14",
                          fontFamily: "Inter",
                        }}
                      >
                        Invalid email format. Please use comma-separated emails.
                      </p>
                    )}
                </div>
              </div>

              <div className={classes.buttons}>
                <Button
                  name={"Delete Event"}
                  onClick={handleEventDelete}
                  disabled={!_.isEqual(hostEmail, selectedEvent?.hostEmail)}
                  size={"3"}
                  variant={"outline"}
                />
                <Button
                  name={"Cancel"}
                  onClick={() => setSelectedEvent(null)}
                  size={"3"}
                  variant={"outline"}
                  customStyles={{ backgroundColor: "#1C2024" }}
                />
                <Button
                  name={"Update Event"}
                  onClick={handleEventUpdate}
                  disabled={
                    !(
                      _.isEqual(hostEmail, selectedEvent?.hostEmail) ||
                      selectedEvent?.guestsCanInviteOthers
                    ) || endDateError
                  }
                  size={"3"}
                  variant={"solid"}
                  customStyles={
                    !(
                      _.isEqual(hostEmail, selectedEvent?.hostEmail) ||
                      selectedEvent?.guestsCanInviteOthers
                    ) || endDateError
                      ? { cursor: "not-allowed" }
                      : { backgroundColor: "#1C2024" }
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
