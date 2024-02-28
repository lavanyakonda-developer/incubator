import React, { useState, useEffect } from "react";
import classes from "./IncubatorHome.module.css"; // Import your CSS file
import _ from "lodash";
import { makeRequest, API, socketAPI } from "../../axios";
import {
  Button,
  Chat,
  NotificationPanel,
  Calendar,
  UpdatePassword,
} from "../../CommonComponents";
import { logout } from "../../auth/helper";
import { useNavigate, useParams } from "react-router-dom";
import { updateStartupIdsOfIncubator } from "../../auth/helper.js";
import moment from "moment";
import { FaTimesCircle } from "react-icons/fa";
import io from "socket.io-client";
import { isAuthenticated } from "../../auth/helper";
import {
  RocketIcon,
  ChatBubbleIcon,
  CalendarIcon,
  PersonIcon,
  ClockIcon,
  LayersIcon,
  RowsIcon,
  PlusCircledIcon,
  CheckCircledIcon,
  Cross2Icon,
  TimerIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";
import { Table, Badge } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";

const colors = [
  "tomato",
  "red",
  "ruby",
  "crimson",
  "pink",
  "plum",
  "purple",
  "violet",
  "iris",
  "indigo",
  "blue",
  "cyan",
  "teal",
  "jade",
  "green",
  "grass",
  "brown",
  "orange",
  "sky",
  "mint",
  "lime",
  "yellow",
  "amber",
  "gold",
  "bronze",
  "gray",
];

const colorMap = {}; // Object to store mapping of sector names to colors

// Function to generate a consistent color for a sector name
function getColorForSector(sectorName) {
  if (colorMap.hasOwnProperty(sectorName)) {
    // If sector name already has a color assigned, return that color
    return colorMap[sectorName];
  } else {
    // If sector name doesn't have a color assigned yet, assign a color from the available colors
    const color = colors.shift(); // Remove the first color from the array
    colorMap[sectorName] = color; // Map the sector name to the color
    return color;
  }
}

const socket = io.connect(socketAPI);

const rowStyle = {
  height: 44,
  verticalAlign: "middle",
};

const columnHeaderStyle = {
  fontWeight: 500,
  fontFamily: "Inter",
  fontSize: 14,
};

const getRandomNumber = () => {
  const min = 0;
  const max = 100;
  // Check if inclusive (default) or exclusive
  const inclusive = max !== max - 1;

  if (inclusive) {
    // Generate random number between min and max (inclusive)
    return Math.random() * (max - min + 1) + min;
  } else {
    // Generate random number between min and max (exclusive)
    return Math.random() * (max - min) + min;
  }
};

const tabs = [
  { label: "Onboarding", key: "homeDashboard", icon: <RocketIcon /> },
  { label: "Startups", key: "startups", icon: <LayersIcon /> },
  {
    label: "Communication",
    key: "communicationTab",
    icon: <ChatBubbleIcon />,
  },
  { label: "Calendar", key: "calendarTab", icon: <CalendarIcon /> },
  { label: "Activity log", key: "activityLog", icon: <RowsIcon /> },
];

const buttonStyle = {
  height: 40,
  fontSize: 16,
};

const IncubatorHome = (props) => {
  const { incubator_id: incubatorId } = useParams();

  const { user } = isAuthenticated();
  const navigate = useNavigate();

  const [selectedTab, setSelectedTab] = useState("homeDashboard");
  const [room, setRoom] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [startups, setStartups] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [allMessages, setAllMessages] = useState({});
  const [messageList, setMessageList] = useState([]);
  const [comp, setComp] = useState(null);
  const [notifications, setNotifications] = useState({});
  const [showUnReadCount, setShowUnReadCount] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [customRequestReminder, setCustomRequestReminder] =
    useState("Custom Request");
  const [selectedStartups, setSelectedStartups] = useState([]);
  const [incubatorDetails, setIncubatorDetails] = useState({
    id: incubatorId,
    name: "",
    logo: "",
  });
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/home-page");
    }
  }, [user]);

  const { email, id, role } = user || {};

  const handleStartupChange = (e) => {
    const value = _.toNumber(e.target.value);
    if (selectedStartups.includes(value)) {
      setSelectedStartups(
        selectedStartups.filter((startup) => startup !== value)
      );
    } else {
      setSelectedStartups([...selectedStartups, value]);
    }
  };

  const openPanel = () => {
    setIsPanelOpen(true);
  };

  const closePanel = () => {
    setIsPanelOpen(false);
  };

  const fetchNotifications = async () => {
    try {
      const response = await makeRequest.post(
        `notification/get-incubator-notifications`,
        {
          incubator_id: incubatorId,
          email,
          sender: "startup",
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
          `incubator/incubator-home?incubator_id=${incubatorId}`
        );

        if (response.status === 200) {
          const data = response.data;

          setIncubatorDetails(data.incubator);
          setStartups(data.startups);

          const startupIds = _.map(data.startups, (item) => item.id);
          updateStartupIdsOfIncubator({ startupIds });
        } else {
          console.error("Error fetching data:", response.statusText);
        }
      } catch (error) {
        navigate("/");
        console.error("Error fetching data:", error);
      }
    };

    if (incubatorId) {
      fetchData();
      fetchNotifications();
    }
  }, [incubatorId]);

  const fetchChats = async () => {
    try {
      const response = await makeRequest.post(`chat/incubator-chats`, {
        incubator_id: incubatorId,
        email,
      });

      if (response.status === 200) {
        const data = response.data;

        setAllMessages(data);
      } else {
        console.error("Error fetching data:", response.statusText);
      }
    } catch (error) {
      navigate("/");
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    _.forEach(startups, (startup) => {
      socket.emit("join_room", `${incubatorId}-${startup.id}`);
    });
  }, [startups]);

  useEffect(() => {
    //Fetching on home because we have to show red dot when there's unread messages
    if (selectedTab == "communicationTab" || selectedTab == "homeDashboard") {
      fetchChats();
    }
  }, [selectedTab, showChat]);

  useEffect(() => {
    socket.on("receive_message", () => {
      fetchChats();
    });

    socket.on("receive_notification", (data) => {
      fetchNotifications();
    });
  }, [socket]);

  const getTextFromKey = ({ key }) => {
    switch (key) {
      case "REPORTING_ACTIVITY_REMINDER":
        return `has sent you a Reporting activity reminder`;
      case "COMPLIANCE_ACTIVITY_REMINDER":
        return `has sent you a Compliance activity reminder`;
      case "CUSTOM_REMINDER":
        return `added ${customRequestReminder}`;
    }
  };

  // Send notifications on raising request
  const sendNotifications = async ({ key }) => {
    try {
      _.forEach(selectedStartups, async (selectedStartup) => {
        const notificationData = {
          id: getRandomNumber(),
          room: `${incubatorId}-${selectedStartup}`,
          time: moment().format("YYYY-MM-DD HH:mm:ss"),
          sender: "incubator",
          incubator_id: incubatorId,
          startup_id: selectedStartup,
          text: getTextFromKey({ key }),
          redirect_type: key,
        };

        await socket.emit("send_notification", notificationData);
      });

      const notificationsData = {
        incubator_id: incubatorId,
        sender: "incubator",
        text: getTextFromKey({ key }),
        redirect_type: key,
        startupIds: selectedStartups,
      };

      const response = await makeRequest.post(
        "notification/add-notifications",
        {
          ...notificationsData,
        }
      );

      if (response.status === 200) {
      } else {
        console.error("Error fetching data:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleTabClick = (tabName) => {
    setSearchTerm("");
    setSelectedTab(tabName);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // const approvedStartups = _.filter(startups, (item) => {
  //   // return item.status == "APPROVED";
  //   return true;
  // });

  // const filteredApprovedStartups = _.filter(approvedStartups, (item) =>
  //   !_.isEmpty(searchTerm)
  //     ? _.some(_.values(item), (value) =>
  //         _.includes(_.lowerCase(value), _.lowerCase(searchTerm))
  //       )
  //     : true
  // );

  const getStatus = ({ status, isDraft }) => {
    if (isDraft) {
      return "Onboarding Inprogress";
    } else {
      switch (status) {
        case "PENDING":
          return "Pending from startup";
        case "SUBMITTED":
          return "Waiting for Approval";
        case "APPROVED":
          return "Approved";
        case "REJECTED":
          return "Rejected by you";
      }
    }
  };

  const getStatusIcon = ({ status, isDraft }) => {
    if (isDraft) {
      return <RocketIcon color="#256E93" />;
    } else {
      switch (status) {
        case "PENDING":
          return <TimerIcon color="#FFBA1A" />;
        case "SUBMITTED":
          return <ExclamationTriangleIcon color="#783200CF" />;
        case "APPROVED":
          return <CheckCircledIcon color="#008347D6" />;
        case "REJECTED":
          return <Cross2Icon color="#D93D42" />;
      }
    }
  };

  const handleStartupClick = ({ status, isDraft, id, tab = null }) => {
    if (isDraft) {
      navigate(`/incubator/${incubatorId}/home/register-startup/${id}`);
      return;
    } else {
      switch (status) {
        // {
        //   navigate(
        //     `/incubator/${incubatorId}/home/register-startup/${id}?status=${status}&disabled=true`
        //   );
        //   return;
        // }

        case "PENDING":
        case "REJECTED":
        case "SUBMITTED":
        case "APPROVED": {
          if (tab) {
            navigate(
              `/incubator/${incubatorId}/home/startup-home/${id}?tab=${tab}`
            );
          } else {
            navigate(`/incubator/${incubatorId}/home/startup-home/${id}`);
          }
          return;
        }

        default:
          return;
      }
    }
  };

  const onClickStartup = ({ startup_id, tab }) => {
    const { status, isDraft, id } = _.find(startups, { id: startup_id });
    handleStartupClick({ status, isDraft, id, tab });
  };

  const goToStartupChat = ({ id }) => {
    setMessageList(_.uniqBy(_.get(allMessages, `${id}.chats`, []), "id"));
    setRoom(`${incubatorId}-${id}`);

    setShowChat(true);
  };

  const filteredStartups = _.filter(startups, (item) =>
    !_.isEmpty(searchTerm)
      ? _.some(_.values(item), (value) =>
          _.includes(_.lowerCase(value), _.lowerCase(searchTerm))
        ) ||
        _.includes(
          _.lowerCase(
            getStatus({
              status: item.status,
              isDraft: item.is_draft,
            })
          ),
          _.lowerCase(searchTerm)
        )
      : true
  );

  const approvedStartups = _.filter(
    filteredStartups,
    (startup) => startup.status == "APPROVED"
  );

  const nonApprovedStartups = _.filter(
    filteredStartups,
    (startup) => startup.status != "APPROVED"
  );

  const getRightComponent = () => {
    switch (selectedTab) {
      case "homeDashboard":
        return (
          <div className={classes.rightColumn}>
            <div className={classes.tableContainer}>
              <div className={classes.headingContainer}>
                <div className={classes.headingTitle}>Onboarding</div>
                <div className={classes.headingSubTitle}>
                  Let’s enter some basic details to initiate the onboarding
                  process of the startup{" "}
                </div>
              </div>

              <div className={classes.tableHeader}>
                <input
                  type="text"
                  className={classes.searchBar}
                  placeholder="Search"
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <div className={classes.buttonContainer}>
                  <Button
                    shouldRedirect={true}
                    redirectUrl={`/incubator/${incubatorId}/home/register-startup`}
                    name={"Add a startup"}
                    iconStart={true}
                    icon={<PlusCircledIcon width={18} height={18} />}
                    size={"2"}
                    variant={"solid"}
                    customStyles={{
                      backgroundColor: "#1C2024",
                      gap: 8,
                      borderRadius: 4,
                    }}
                    textStyle={{ color: "white" }}
                  />
                </div>
              </div>

              <Table.Root
                size={"3"}
                variant={"ghost"}
                style={{ overflow: "auto" }}
              >
                <Table.Header>
                  <Table.Row style={rowStyle}>
                    <Table.ColumnHeaderCell style={columnHeaderStyle}>
                      Startup Name
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell style={columnHeaderStyle}>
                      Sector
                    </Table.ColumnHeaderCell>

                    <Table.ColumnHeaderCell style={columnHeaderStyle}>
                      Status
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell style={columnHeaderStyle}>
                      Date of joining
                    </Table.ColumnHeaderCell>
                    {/* MIGHT USE IN FUTURE */}
                    {/* <Table.ColumnHeaderCell style={columnHeaderStyle}>
                      Reporting Hub
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell style={columnHeaderStyle}>
                      Go to chat
                    </Table.ColumnHeaderCell> */}

                    <Table.ColumnHeaderCell
                      style={columnHeaderStyle}
                    ></Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {_.map(nonApprovedStartups, (startup) => {
                    const startupLogoName = _.last(_.split(startup.logo, "/"));
                    // Set the href attribute to the document's URL
                    const startupLogo = !_.isEmpty(startupLogoName)
                      ? `${API}/uploads/${startupLogoName}`
                      : "";
                    return (
                      <Table.Row style={rowStyle}>
                        <Table.RowHeaderCell>
                          <div className={classes.startupNameLogo}>
                            <div className={classes.imageContainer}>
                              <img
                                className={classes.startupLogo}
                                src={startupLogo}
                              />
                            </div>
                            <div
                              className={classes.startupName}
                              onClick={() =>
                                handleStartupClick({
                                  status: startup.status,
                                  isDraft: startup.is_draft,
                                  id: startup.id,
                                })
                              }
                            >
                              {startup.name}
                            </div>
                          </div>
                        </Table.RowHeaderCell>
                        <Table.Cell
                          onClick={() => setSearchTerm(startup.industry)}
                          style={{ cursor: "pointer" }}
                        >
                          <Badge
                            size={1}
                            variant={"soft"}
                            color={getColorForSector(startup.industry)}
                            style={{ padding: 6, borderRadius: 4 }}
                          >
                            {" "}
                            {startup.industry}
                          </Badge>
                        </Table.Cell>

                        <Table.Cell
                          onClick={() =>
                            setSearchTerm(
                              getStatus({
                                status: startup.status,
                                isDraft: startup.is_draft,
                              })
                            )
                          }
                          style={{ cursor: "pointer" }}
                        >
                          <div className={classes.statusDiv}>
                            {getStatusIcon({
                              status: startup.status,
                              isDraft: startup.is_draft,
                            })}
                            {getStatus({
                              status: startup.status,
                              isDraft: startup.is_draft,
                            })}
                          </div>
                        </Table.Cell>

                        <Table.Cell>
                          {moment(startup.created_at).format("Do MMM YYYY")}
                        </Table.Cell>
                        {/* MIGHT USE IN FUTURE */}
                        {/* <Table.Cell>
                          {startup?.color == "green" ? (
                            <FaCheckCircle style={{ color: "green" }} />
                          ) : (
                            <FaTimesCircle
                              style={{
                                color: _.get(startup, "color", "red"),
                              }}
                            />
                          )}
                        </Table.Cell>

                        <Table.Cell
                          onClick={() => {
                            setSelectedTab("communicationTab");
                            goToStartupChat({
                              id: startup.id,
                            });
                            setComp(
                              <div className={classes.startupNameLogo}>
                                <div className={classes.imageContainer}>
                                  <img
                                    className={classes.startupLogo}
                                    src={startupLogo}
                                  />
                                </div>
                                <div className={classes.startupName}>
                                  {startup.name}
                                </div>
                              </div>
                            );
                          }}
                        >
                          <FaComment />
                          {_.get(allMessages, `${startup.id}.unreadCount`, 0) >
                            0 && (
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
                        </Table.Cell> */}
                        <Table.Cell
                          onClick={() =>
                            handleStartupClick({
                              status: startup.status,
                              isDraft: startup.is_draft,
                              id: startup.id,
                            })
                          }
                          style={{ cursor: "pointer" }}
                        >
                          <ChevronRightIcon />
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table.Root>
            </div>
          </div>
        );

      case "startups":
        return (
          <div className={classes.rightColumn}>
            <div className={classes.tableContainer}>
              <div className={classes.headingContainer}>
                <div className={classes.headingTitle}>Startups</div>
                <div className={classes.headingSubTitle}>
                  Track your on-boarded startups using this dashboard
                </div>
              </div>

              <div className={classes.tableHeader}>
                <input
                  type="text"
                  className={classes.searchBar}
                  placeholder="Search"
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <div className={classes.buttonContainer}>
                  <Button
                    name={"Raise a request"}
                    onClick={() => {
                      setShowRequestModal(true);
                    }}
                    iconStart={true}
                    icon={<PlusCircledIcon width={18} height={18} />}
                    size={"2"}
                    variant={"solid"}
                    customStyles={{
                      backgroundColor: "#1C2024",
                      gap: 8,
                      borderRadius: 4,
                    }}
                    textStyle={{ color: "white" }}
                  />
                </div>
              </div>

              <Table.Root
                size={"3"}
                variant={"ghost"}
                style={{ overflow: "auto" }}
              >
                <Table.Header>
                  <Table.Row style={rowStyle}>
                    <Table.ColumnHeaderCell style={columnHeaderStyle}>
                      Startup Name
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell style={columnHeaderStyle}>
                      Sector
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell style={columnHeaderStyle}>
                      Stage
                    </Table.ColumnHeaderCell>

                    <Table.ColumnHeaderCell style={columnHeaderStyle}>
                      Date of joining
                    </Table.ColumnHeaderCell>
                    {/* MIGHT USE IN FUTURE */}
                    {/* <Table.ColumnHeaderCell  style={columnHeaderStyle}>
                      Reporting Hub
                    </Table.ColumnHeaderCell  style={columnHeaderStyle}>
                    <Table.ColumnHeaderCell  style={columnHeaderStyle}>Go to chat</Table.ColumnHeaderCell> */}
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {_.map(approvedStartups, (startup) => {
                    const startupLogoName = _.last(_.split(startup.logo, "/"));
                    // Set the href attribute to the document's URL
                    const startupLogo = !_.isEmpty(startupLogoName)
                      ? `${API}/uploads/${startupLogoName}`
                      : "";
                    return (
                      <Table.Row style={rowStyle}>
                        <Table.RowHeaderCell>
                          {" "}
                          <div className={classes.startupNameLogo}>
                            <div className={classes.imageContainer}>
                              <img
                                className={classes.startupLogo}
                                src={startupLogo}
                              />
                            </div>
                            <div
                              className={classes.startupName}
                              onClick={() =>
                                handleStartupClick({
                                  status: startup.status,
                                  isDraft: startup.is_draft,
                                  id: startup.id,
                                })
                              }
                            >
                              {startup.name}
                            </div>
                          </div>
                        </Table.RowHeaderCell>
                        <Table.Cell
                          onClick={() => setSearchTerm(startup.industry)}
                          style={{ cursor: "pointer" }}
                        >
                          <Badge
                            size={1}
                            variant={"soft"}
                            color={getColorForSector(startup.industry)}
                            style={{ padding: 6, borderRadius: 4 }}
                          >
                            {startup.industry}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell
                          onClick={() => setSearchTerm(startup.stateOfStartup)}
                          style={{ cursor: "pointer" }}
                        >
                          {startup.stateOfStartup}
                        </Table.Cell>

                        <Table.Cell>
                          {moment(startup.created_at).format("Do MMM YYYY")}
                        </Table.Cell>
                        {/* MIGHT USE IN FUTURE */}
                        {/* 
                        <Table.Cell>
                          {startup?.color == "green" ? (
                            <FaCheckCircle style={{ color: "green" }} />
                          ) : (
                            <FaTimesCircle
                              style={{
                                color: _.get(startup, "color", "red"),
                              }}
                            />
                          )}
                        </Table.Cell>

                        <Table.Cell
                          onClick={() => {
                            setSelectedTab("communicationTab");
                            goToStartupChat({
                              id: startup.id,
                            });
                            setComp(
                              <div className={classes.startupNameLogo}>
                                <div className={classes.imageContainer}>
                                  <img
                                    className={classes.startupLogo}
                                    src={startupLogo}
                                  />
                                </div>
                                <div className={classes.startupName}>
                                  {startup.name}
                                </div>
                              </div>
                            );
                          }}
                        >
                          <FaComment />
                          {_.get(allMessages, `${startup.id}.unreadCount`, 0) >
                            0 && (
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
                        </Table.Cell> */}

                        <Table.Cell
                          onClick={() =>
                            handleStartupClick({
                              status: startup.status,
                              isDraft: startup.is_draft,
                              id: startup.id,
                            })
                          }
                          style={{ cursor: "pointer" }}
                        >
                          <ChevronRightIcon />
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table.Root>
            </div>

            {showRequestModal && (
              <div className={classes.modalBackground}>
                <div className={classes.modal}>
                  <div className={classes.modalHeader}>
                    <h3 style={{ marginTop: 0, marginBottom: 0 }}>
                      Raise a request
                    </h3>
                    <FaTimesCircle
                      onClick={() => {
                        setSelectedStartups([]);
                        setCustomRequestReminder("Custom Request");
                        setShowRequestModal(false);
                      }}
                    />
                  </div>

                  <h4>Select Startups to send a request :</h4>
                  <div className={classes.checkboxes}>
                    {_.map(startups, (option) => {
                      return (
                        <label key={option.id}>
                          <input
                            type="checkbox"
                            value={option.id}
                            onChange={handleStartupChange}
                            checked={_.includes(selectedStartups, option.id)}
                          />
                          {option.name}
                        </label>
                      );
                    })}
                  </div>
                  <div className={classes.modalContent}>
                    <div className={classes.modalTopContent}>
                      <span>Reporting activity reminder</span>
                      <Button
                        name={"Send request"}
                        disabled={_.isEmpty(selectedStartups)}
                        onClick={() => {
                          sendNotifications({
                            key: "REPORTING_ACTIVITY_REMINDER",
                          });
                        }}
                      />
                    </div>
                    <div className={classes.modalTopContent}>
                      <span>Compliance activity reminder</span>
                      <Button
                        name={"Send request"}
                        disabled={_.isEmpty(selectedStartups)}
                        onClick={() => {
                          sendNotifications({
                            key: "COMPLIANCE_ACTIVITY_REMINDER",
                          });
                        }}
                      />
                    </div>
                    <div className={classes.modalTopContent}>
                      <span style={{ width: "60%" }}>
                        <input
                          className={classes.inputField}
                          type="text"
                          value={customRequestReminder}
                          onChange={(event) => {
                            setCustomRequestReminder(event.target.value);
                          }}
                          style={{
                            fontSize: 14,
                            paddingLeft: 4,
                            width: "80%",
                          }}
                        />
                      </span>
                      <Button
                        name={"Send request"}
                        disabled={_.isEmpty(selectedStartups)}
                        onClick={() => {
                          sendNotifications({ key: "CUSTOM_REMINDER" });
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case "activityLog":
        return (
          <NotificationPanel
            isOpen={true}
            onClose={closePanel}
            email={email}
            notifications={notifications}
            fetchNotifications={fetchNotifications}
            onClickStartup={onClickStartup}
          />
        );
      case "communicationTab":
        return (
          <div className={classes.rightColumn}>
            {!showChat ? (
              <div className={classes.tableContainer}>
                <div className={classes.tableHeader}>
                  <input
                    type="text"
                    className={classes.searchBar}
                    placeholder="Search startups"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>

                <div className={classes.startupsList}>
                  {_.map(filteredStartups, (startup) => {
                    const startupLogoName = _.last(_.split(startup.logo, "/"));
                    // Set the href attribute to the document's URL
                    const startupLogo = !_.isEmpty(startupLogoName)
                      ? `${API}/uploads/${startupLogoName}`
                      : "";

                    return (
                      <div className={classes.startupNameLogo2}>
                        <div className={classes.imageContainer}>
                          <img
                            className={classes.startupLogo}
                            src={startupLogo}
                          />
                        </div>
                        <div
                          className={classes.startupName}
                          onClick={() => {
                            goToStartupChat({
                              id: startup.id,
                            });
                            setComp(
                              <div className={classes.startupNameLogo3}>
                                <div className={classes.imageContainer}>
                                  <img
                                    className={classes.startupLogo}
                                    src={startupLogo}
                                  />
                                </div>
                                <div className={classes.startupName}>
                                  {startup.name}
                                </div>
                              </div>
                            );
                          }}
                        >
                          {startup.name}
                        </div>
                        {_.get(allMessages, `${startup.id}.unreadCount`, 0) >
                          0 && (
                          <div className={classes.unreadCount}>
                            {_.get(allMessages, `${startup.id}.unreadCount`, 0)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <Chat
                socket={socket}
                room={room}
                email={email}
                setShowChat={setShowChat}
                showBack={true}
                messageList={messageList}
                setMessageList={setMessageList}
                comp={comp}
                incubator_id={_.split(room, "-")?.[0]}
                startup_id={_.split(room, "-")?.[1]}
                fetchChats={fetchChats}
              />
            )}
          </div>
        );

      case "calendarTab":
        return (
          <Calendar
            userId={id}
            role={role}
            style={{
              padding: "20px 20px 0px 20px",
              flex: "3 1",
              overflowY: "auto",
            }}
          />
        );

      case "passwordChange":
        return <UpdatePassword userId={id} role={role} />;
      default:
        return <div className={classes.rightColumn} />;
    }
  };

  const userLogout = async () => {
    await logout();
    window.location.reload();
  };

  const changePassword = () => {
    setSelectedTab("passwordChange");
  };

  const incubatorLogoName = _.last(_.split(incubatorDetails.logo, "/"));
  const incubatorLogo = !_.isEmpty(incubatorLogoName)
    ? `${API}/uploads/${incubatorLogoName}`
    : "";

  return (
    <div className={classes.incubatorHome}>
      <div className={classes.leftColumn}>
        <div className={classes.incubatorDetails}>
          <img className={classes.incubatorLogo} src={incubatorLogo} />
          <div className={classes.incubatorName}>{incubatorDetails.name}</div>
        </div>

        <div className={classes.tabMenu}>
          {_.map(tabs, (tab) => {
            return (
              <Button
                size={"2"}
                variant={"ghost"}
                name={tab.label}
                color={"neutral"}
                onClick={() => handleTabClick(tab.key)}
                state={selectedTab === tab.key ? "active" : "default"}
                highContrast={true}
                iconStart={true}
                icon={tab.icon}
                customStyles={{
                  gap: 8,
                  boxShadow:
                    selectedTab === tab.key
                      ? "0px 1px 4px 0px rgba(0, 0, 61, 0.05), 0px 2px 1px -1px rgba(0, 0, 61, 0.05), 0px 1px 3px 0px rgba(0, 0, 0, 0.05"
                      : "none",
                  width: 230,
                  justifyContent: "flex-start",
                  color:
                    selectedTab === tab.key ? "black" : "rgb(96, 100, 108)",
                }}
              />
            );
          })}

          <div className={classes.separator}>
            <div className={classes.line}></div>
          </div>
          <Button
            name={"Change Password"}
            onClick={changePassword}
            icon={<PersonIcon />}
            highContrast={true}
            iconStart={true}
            customStyles={{
              gap: 8,
              boxShadow:
                selectedTab === "passwordChange"
                  ? "0px 1px 4px 0px rgba(0, 0, 61, 0.05), 0px 2px 1px -1px rgba(0, 0, 61, 0.05), 0px 1px 3px 0px rgba(0, 0, 0, 0.05"
                  : "none",
              width: 230,
              justifyContent: "flex-start",
              color:
                selectedTab === "passwordChange"
                  ? "black"
                  : "rgb(96, 100, 108)",
            }}
            size={"2"}
            variant={"ghost"}
            color={"neutral"}
          />
          <Button
            name={"Logout"}
            onClick={userLogout}
            icon={<ClockIcon />}
            highContrast={true}
            iconStart={true}
            customStyles={{
              gap: 8,
              width: 230,
              justifyContent: "flex-start",
              color: "rgb(96, 100, 108)",
            }}
            size={"2"}
            variant={"ghost"}
            color={"neutral"}
          />
        </div>
        <div className={classes.logout}></div>
      </div>
      {getRightComponent()}
    </div>
  );
};

export default IncubatorHome;
