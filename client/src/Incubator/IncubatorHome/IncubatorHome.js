import React, { useState, useEffect } from "react";
import classes from "./IncubatorHome.module.css"; // Import your CSS file
import _ from "lodash";
import { makeRequest, API, socketAPI } from "../../axios";
import { Button, Chat, NotificationPanel } from "../../CommonComponents";
import { logout } from "../../auth/helper";
import { useNavigate, useParams } from "react-router-dom";
import { updateStartupIdsOfIncubator } from "../../auth/helper.js";
import moment from "moment";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaComment,
  FaBell,
} from "react-icons/fa";
import io from "socket.io-client";
import { isAuthenticated } from "../../auth/helper";

const socket = io.connect(socketAPI);

const tabs = [
  { label: "Home Dashboard", key: "homeDashboard" },
  { label: "Communication Tab", key: "communicationTab" },
];

const buttonStyle = {
  height: 40,
  fontSize: 16,
};

const IncubatorHome = (props) => {
  const { incubator_id: incubatorId } = useParams();

  const { user } = isAuthenticated();

  const { email } = user;

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

  const [incubatorDetails, setIncubatorDetails] = useState({
    id: incubatorId,
    name: "",
    logo: "",
  });

  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const openPanel = () => {
    setIsPanelOpen(true);
  };

  const closePanel = () => {
    setIsPanelOpen(false);
  };

  const navigate = useNavigate();

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
    if (selectedTab == "communicationTab") {
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

  const handleTabClick = (tabName) => {
    setSearchTerm("");
    setSelectedTab(tabName);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredStartups = _.filter(startups, (item) =>
    !_.isEmpty(searchTerm)
      ? _.some(_.values(item), (value) =>
          _.includes(_.lowerCase(value), _.lowerCase(searchTerm))
        )
      : true
  );

  const approvedStartups = _.filter(startups, (item) => {
    // return item.status == "APPROVED";
    return true;
  });

  const filteredApprovedStartups = _.filter(approvedStartups, (item) =>
    !_.isEmpty(searchTerm)
      ? _.some(_.values(item), (value) =>
          _.includes(_.lowerCase(value), _.lowerCase(searchTerm))
        )
      : true
  );

  const getStatus = ({ status, isDraft }) => {
    if (isDraft) {
      return "Drafted by you";
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

  const handleStartupClick = ({ status, isDraft, id, tab = null }) => {
    if (isDraft) {
      navigate(`/incubator/${incubatorId}/home/register-startup/${id}`);
      return;
    } else {
      switch (status) {
        case "PENDING":
        case "SUBMITTED":
        case "APPROVED":
        case "REJECTED": {
          if (tab) {
            navigate(
              `/incubator/${incubatorId}/home/startup-home/${id}?tab=${tab}`
            );
          } else {
            navigate(`/incubator/${incubatorId}/home/startup-home/${id}`);
          }
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

  const getRightComponent = () => {
    switch (selectedTab) {
      case "homeDashboard":
        return (
          <div className={classes.rightColumn}>
            <div className={classes.tableContainer}>
              <div></div>
              <div className={classes.tableHeader}>
                <input
                  type="text"
                  className={classes.searchBar}
                  placeholder="Search startups"
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <div className={classes.buttonContainer}>
                  <Button
                    shouldRedirect={true}
                    redirectUrl={`/incubator/${incubatorId}/home/register-startup`}
                    name={"Raise a request"}
                    customStyles={buttonStyle}
                  />
                  <Button
                    shouldRedirect={true}
                    redirectUrl={`/incubator/${incubatorId}/home/register-startup`}
                    name={"Add Startup"}
                    customStyles={buttonStyle}
                  />
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
              </div>
              <div className={classes.startupsCount}>{`${_.size(
                startups
              )} Startups`}</div>
              <div className={classes.startupTableContainer}>
                <table className={classes.startupTable}>
                  <thead>
                    <tr key={"header"}>
                      <th>Startup Name</th>
                      <th>Sector</th>
                      <th style={{ width: 200 }}>Stage</th>
                      <th>Status</th>
                      <th>Date of joining</th>
                      <th>Reporting Hub</th>
                      <th>Go to chat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {_.map(filteredStartups, (startup) => {
                      const startupLogoName = _.last(
                        _.split(startup.logo, "/")
                      );
                      // Set the href attribute to the document's URL
                      const startupLogo = !_.isEmpty(startupLogoName)
                        ? `${API}/uploads/${startupLogoName}`
                        : "";
                      return (
                        <tr key={startup.id}>
                          <td>
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
                          </td>
                          <td>{startup.industry}</td>
                          <td>{startup.stateOfStartup}</td>
                          <td>
                            {getStatus({
                              status: startup.status,
                              isDraft: startup.is_draft,
                            })}
                          </td>
                          <td>
                            {moment(startup.created_at).format("Do MMM YYYY")}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {startup?.color == "green" ? (
                              <FaCheckCircle style={{ color: "green" }} />
                            ) : (
                              <FaTimesCircle
                                style={{
                                  color: _.get(startup, "color", "red"),
                                }}
                              />
                            )}
                          </td>
                          <td
                            style={{ textAlign: "center" }}
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
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            {isPanelOpen && (
              <NotificationPanel
                isOpen={isPanelOpen}
                onClose={closePanel}
                email={email}
                notifications={notifications}
                fetchNotifications={fetchNotifications}
                onClickStartup={onClickStartup}
              />
            )}
          </div>
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
                <div className={classes.startupsCount}>{`${_.size(
                  approvedStartups
                )} Approved Startups`}</div>
                <div className={classes.startupsList}>
                  {_.map(filteredApprovedStartups, (startup) => {
                    const startupLogoName = _.last(_.split(startup.logo, "/"));
                    // Set the href attribute to the document's URL
                    const startupLogo = !_.isEmpty(startupLogoName)
                      ? `${API}/uploads/${startupLogoName}`
                      : "";

                    return (
                      <div className={classes.startupNameLogo}>
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
      default:
        return <div className={classes.rightColumn} />;
    }
  };

  const userLogout = () => {
    logout();
    navigate("/home-page");
  };

  return (
    <div className={classes.incubatorHome}>
      <div className={classes.leftColumn}>
        <div className={classes.incubatorDetails}>
          <img className={classes.incubatorLogo} src={incubatorDetails.logo} />
          <div className={classes.incubatorName}>{incubatorDetails.name}</div>
        </div>

        <div className={classes.tabMenu}>
          {_.map(tabs, (tab) => {
            return (
              <div
                className={`${classes.tab} ${
                  selectedTab === tab.key ? classes.activeTab : ""
                }`}
                onClick={() => handleTabClick(tab.key)}
                key={tab.key}
              >
                {tab.label}
              </div>
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
      {getRightComponent()}
    </div>
  );
};

export default IncubatorHome;
