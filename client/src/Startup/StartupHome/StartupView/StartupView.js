import React, { useState, useEffect } from "react";
import { logout, isAuthenticated } from "../../../auth/helper";
import classes from "./StartupView.module.css";
import { makeRequest, API, socketAPI } from "../../../axios";
import _ from "lodash";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button, Chat, NotificationPanel } from "../../../CommonComponents";
import { startupProfileQuestions } from "../../../Incubator/RegisterStartup/helper.js";
import {
  renderQuestions,
  DocumentsContainer,
} from "../../../Incubator/StartupHomeView/helper.js";
import { FaBell } from "react-icons/fa";
import SupplementaryDocuments from "./SupplementaryDocuments";
import BusinessUpdates from "./BusinessUpdates";
import Kpi from "./Kpi";
import Mie from "./Mie";
import io from "socket.io-client";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid"; // a plugin!
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";

const socket = io.connect(socketAPI);

const tabs = [
  { label: "Home", key: "homeDashboard", visibleRole: "startup_founder" },
  {
    label: "Startup Profile",
    key: "startupProfile",
    sections: ["startupIdentifier"],
    subTabs: [
      {
        key: "companyDetails",
        label: "Company Details",
        sections: ["startupIdentifier"],
      },
      {
        key: "founderDetails",
        label: "Founder Details",
        sections: ["founderDetails"],
      },
      {
        key: "pitchAndDigital",
        label: "Elevator Pitch and Digital Presence",
        sections: ["digitalPresence", "pitchYourStartup"],
      },
      {
        key: "characteristics",
        label: "Characteristics",
        sections: ["startupCharacteristics"],
      },
      {
        key: "funding",
        label: "Funding",
        sections: ["fundDeploymentPlan", "fundingDetails"],
      },
      {
        key: "others",
        label: "Others",
        sections: ["intellectualProperty", "achievements", "customQuestions"],
      },
    ],
  },
  {
    label: "Documents",
    key: "documentRepository",
    subTabs: [
      { key: "onboarding", label: "Onboarding documents" },
      { key: "supplementary", label: "Supplementary documents" },
    ],
  },
  {
    label: "Reporting Tab",
    key: "reportingTab",
    subTabs: [
      { key: "businessUpdates", label: "Business updates" },
      { key: "kpi", label: "Key performance indicators" },
      { key: "mie", label: "Mandatory Information exchange" },
    ],
  },
  {
    label: "Communication Tab",
    key: "communicationTab",
    visibleRole: "startup_founder",
  },
];

const StartupView = () => {
  const { startup_id } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = isAuthenticated();
  const { email, incubator_id, role, id: userId } = user;

  const [selectedTab, setSelectedTab] = useState(
    searchParams.get("tab") || role == "startup_founder"
      ? "homeDashboard"
      : "companyDetails"
  );

  // const [selectedTab, setSelectedTab] = useState(
  //   searchParams.get("tab") || "companyDetails"
  // );
  const [startupInfo, setStartupInfo] = useState({});
  const [notifications, setNotifications] = useState({});
  const [unreadCount, setUnReadCount] = useState(0);
  const [messageList, setMessageList] = useState([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [showUnReadCount, setShowUnReadCount] = useState(false);
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

  const navigate = useNavigate();

  const { basicDetails } = startupInfo || {};

  const openPanel = () => {
    setIsPanelOpen(true);
  };

  const closePanel = () => {
    setIsPanelOpen(false);
  };

  const handleTabClick = (tabName) => {
    const tab = _.find(tabs, { key: tabName });
    if (!_.isEmpty(tab?.subTabs)) {
      if (_.some(tab?.subTabs, { key: selectedTab })) {
        return;
      }
      setSelectedTab(_.first(tab?.subTabs)?.key);
    } else {
      setSelectedTab(tabName);
    }
  };

  const room = `${incubator_id}-${startup_id}`;

  const joinRoom = () => {
    if (email !== "" && room !== "") {
      socket.emit("join_room", room);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await makeRequest.post(
        `notification/get-startup-notifications`,
        {
          startup_id,
          email,
          sender: "incubator",
          incubator_id,
        }
      );

      if (response.status === 200) {
        const data = response.data;

        setNotifications(_.uniqBy(data?.notifications, "id"));
        setShowUnReadCount(data?.showUnReadCount);
      } else {
        console.error("Error fetching data:", response.statusText);
      }
    } catch (error) {
      navigate("/");
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await makeRequest.get(
          `startup/startup-details?startup_id=${startup_id}`
        );

        if (response.status === 200) {
          const data = response.data;

          setStartupInfo(data);
        } else {
          console.error("Error fetching data:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (startup_id) {
      fetchData();
      joinRoom();
      fetchNotifications();
    }
  }, [startup_id]);

  const fetchChats = async () => {
    try {
      const response = await makeRequest.post(`chat/startup-chats`, {
        incubator_id,
        email,
        startup_id,
      });

      if (response.status === 200) {
        const data = response.data;
        setMessageList(_.uniqBy(data?.chats), "id");
        setUnReadCount(_.get(data, "unreadCount", 0));
      } else {
        console.error("Error fetching data:", response.statusText);
      }
    } catch (error) {
      navigate("/");
      console.error("Error fetching data:", error);
    }
  };

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
      navigate("/");
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (selectedTab == "communicationTab") {
      fetchChats();
    }

    if (selectedTab == "homeDashboard") {
      fetchCalendarToken();
    }

    return () => {
      setCalendarDetails(null);
    };
  }, [selectedTab]);

  useEffect(() => {
    socket.on("receive_message", () => {
      fetchChats();
    });

    socket.on("receive_notification", (data) => {
      fetchNotifications();
    });
  }, [socket]);

  const startupLogoName = _.last(_.split(_.get(basicDetails, "logo", ""), "/"));
  // Set the href attribute to the document's URL
  const startupLogo = !_.isEmpty(startupLogoName)
    ? `${API}/uploads/${startupLogoName}`
    : "";

  const userLogout = async () => {
    navigate("/home-page");
    await logout();
  };

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

  console.log(
    "*******",
    _.some(newEvent, (value) => {
      console.log(
        value,
        !value,
        _.isEmpty(value),
        !isValidEmailList(newEvent?.guests),
        endDateError
      );
      return (
        !value ||
        _.isEmpty(value) ||
        !isValidEmailList(newEvent?.guests) ||
        endDateError
      );
    })
  );

  const getRightComponent = () => {
    switch (selectedTab) {
      case "companyDetails":
      case "founderDetails":
      case "pitchAndDigital":
      case "characteristics":
      case "funding":
      case "others": {
        const subTabs = _.get(
          _.find(tabs, { key: "startupProfile" }),
          "subTabs",
          []
        );
        const sections = _.get(
          _.find(subTabs, { key: selectedTab }),
          "sections",
          []
        );
        return (
          <div className={classes.questionnaireSections}>
            {_.map(
              _.filter(startupProfileQuestions, (item) =>
                _.includes(sections, item.uid)
              ),
              (section, index) => (
                <div key={index} className={classes.section}>
                  <h3>{section.section}</h3>
                  {renderQuestions({ startupInfo, section })}
                </div>
              )
            )}
          </div>
        );
      }
      case "documentRepository":
      case "onboarding": {
        return (
          <>
            <h3>Onboarding Documents</h3>
            <DocumentsContainer
              documents={[
                ..._.get(startupInfo, "documentUpload.uploadedDocuments", []),
                ..._.get(
                  startupInfo,
                  "documentUpload.requestedDocumentsList",
                  []
                ),
              ]}
            />
          </>
        );
      }
      case "supplementary": {
        return (
          <SupplementaryDocuments
            socket={socket}
            incubator_id={incubator_id}
            startup_id={startup_id}
          />
        );
      }

      case "businessUpdates": {
        return <BusinessUpdates />;
      }

      case "kpi":
        return <Kpi user={user} />;

      case "mie":
        return <Mie />;

      case "communicationTab": {
        return (
          <Chat
            socket={socket}
            room={room}
            email={email}
            messageList={messageList}
            setMessageList={setMessageList}
            incubator_id={_.split(room, "-")?.[0]}
            startup_id={_.split(room, "-")?.[1]}
            fetchChats={fetchChats}
          />
        );
      }

      case "homeDashboard": {
        return (
          <div className={classes.homeDashboard}>
            <div className={classes.header}>
              <h2></h2>
              <div onClick={openPanel}>
                <FaBell
                  style={{
                    fontSize: 32,
                    height: 36,
                  }}
                  onClick={openPanel}
                />

                {showUnReadCount && (
                  <span
                    style={{
                      position: "absolute",
                      background: "red",
                      color: "white",
                      borderRadius: "50%",
                      padding: "4px",
                      marginLeft: "-6px",
                    }}
                  />
                )}
              </div>
            </div>
            <div className={classes.integrateCalendar}>
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
                              <p style={{ color: "red", margin: "4px 0px" }}>
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
                              <p style={{ color: "red", margin: "4px 0px" }}>
                                Invalid email format. Please use comma-separated
                                emails.
                              </p>
                            )}
                        </div>
                      </div>

                      <div className={classes.buttons}>
                        <Button
                          name={"Cancel"}
                          onClick={() => setEventFormOpen(false)}
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
                              disabled={
                                !_.isEqual(hostEmail, selectedEvent?.hostEmail)
                              }
                            />
                          </div>
                          <div className={classes.modalColumn}>
                            <label htmlFor="start">Start Time:</label>
                            <input
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
                              disabled={
                                !_.isEqual(hostEmail, selectedEvent?.hostEmail)
                              }
                            />
                          </div>

                          <div className={classes.modalColumn}>
                            <label htmlFor="end">End Time:</label>
                            <input
                              type="datetime-local"
                              id="end"
                              value={selectedEvent?.end}
                              style={{ height: 28 }}
                              disabled={
                                !_.isEqual(hostEmail, selectedEvent?.hostEmail)
                              }
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
                              <p style={{ color: "red", margin: "4px 0px" }}>
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
                              disabled={
                                !_.isEqual(hostEmail, selectedEvent?.hostEmail)
                              }
                            />
                          </div>
                          <div className={classes.modalColumn}>
                            <label htmlFor="guests">
                              Guests (comma-separated emails):
                            </label>
                            <input
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
                                  _.isEqual(
                                    hostEmail,
                                    selectedEvent?.hostEmail
                                  ) || selectedEvent?.guestsCanInviteOthers
                                )
                              }
                            />
                          </div>
                          {!_.isEmpty(selectedEvent.guests) &&
                            !isValidEmailList(selectedEvent.guests) && (
                              <p style={{ color: "red", margin: "4px 0px" }}>
                                Invalid email format. Please use comma-separated
                                emails.
                              </p>
                            )}
                        </div>
                      </div>

                      <div className={classes.buttons}>
                        <Button
                          name={"Delete Event"}
                          onClick={handleEventDelete}
                          disabled={
                            !_.isEqual(hostEmail, selectedEvent?.hostEmail)
                          }
                        />
                        <Button
                          name={"Cancel"}
                          onClick={() => setSelectedEvent(null)}
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
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className={classes.container}>
      <div className={classes.leftContainer}>
        <div className={classes.startupDetails}>
          <img className={classes.logo} src={startupLogo} alt={"logo"} />
          <div className={classes.name}>{_.get(basicDetails, "name", "")}</div>
        </div>

        <div className={classes.tabMenu}>
          {_.map(tabs, (tab) => {
            if (
              (!_.isEmpty(tab.subTabs) && selectedTab === tab.key) ||
              _.some(tab.subTabs, { key: selectedTab })
            ) {
              return (
                <>
                  <div
                    className={`${classes.tab} ${
                      selectedTab === tab.key ? classes.activeTab : ""
                    }`}
                    onClick={() => handleTabClick(tab.key)}
                    key={tab.key}
                  >
                    {`${tab.label}`}
                  </div>
                  {_.map(tab.subTabs, (task) => {
                    return (
                      <div
                        className={`${classes.tab} ${
                          selectedTab === task.key ? classes.activeTab : ""
                        }`}
                        style={{ paddingLeft: 36 }}
                        onClick={() => handleTabClick(task.key)}
                        key={task.key}
                      >
                        {task.label}
                      </div>
                    );
                  })}
                </>
              );
            }
            return (
              <>
                {_.isEmpty(tab.visibleRole) ||
                (!_.isEmpty(tab.visibleRole) && role == tab?.visibleRole) ? (
                  <div
                    className={`${classes.tab} ${
                      selectedTab === tab.key ? classes.activeTab : ""
                    }`}
                    onClick={() => handleTabClick(tab.key)}
                    key={tab.key}
                  >
                    {`${tab.label} ${
                      unreadCount > 0 &&
                      tab.key == "communicationTab" &&
                      selectedTab != "communicationTab"
                        ? `- ${unreadCount}`
                        : ""
                    }`}
                  </div>
                ) : null}{" "}
              </>
            );
          })}
        </div>
        <div className={classes.logout}>
          <Button
            name={"Logout"}
            onClick={userLogout}
            customStyles={{
              width: 100,
              fontSize: 16,
              color: "black",
              justifyContent: "left",
              backgroundColor: "#f0f0f0",
            }}
          />
        </div>
      </div>
      <div className={classes.rightContainer}>{getRightComponent()}</div>
      {isPanelOpen && (
        <NotificationPanel
          isOpen={isPanelOpen}
          onClose={closePanel}
          email={email}
          notifications={notifications}
          fetchNotifications={fetchNotifications}
          // onClickStartup={onClickStartup}
        />
      )}
    </div>
  );
};

export default StartupView;
