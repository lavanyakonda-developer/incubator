import React, { useState, useEffect } from "react";
import { logout, isAuthenticated } from "../../../auth/helper";
import classes from "./StartupView.module.css";
import { makeRequest, API, socketAPI } from "../../../axios";
import _ from "lodash";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button, Chat } from "../../../CommonComponents";
import { startupProfileQuestions } from "../../../Incubator/RegisterStartup/helper.js";
import {
  renderQuestions,
  DocumentsContainer,
} from "../../../Incubator/StartupHomeView/helper.js";
import SupplementaryDocuments from "./SupplementaryDocuments";
import BusinessUpdates from "./BusinessUpdates";
import Kpi from "./Kpi";
import Mie from "./Mie";
import io from "socket.io-client";
const socket = io.connect(socketAPI);

const tabs = [
  //{ label: 'Home', key: 'homeDashboard' },
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
  },
];

const StartupView = () => {
  const { startup_id } = useParams();
  const [searchParams] = useSearchParams();

  const [selectedTab, setSelectedTab] = useState(
    searchParams.get("tab") || "companyDetails"
  );
  const [startupInfo, setStartupInfo] = useState({});

  const [unreadCount, setUnReadCount] = useState(0);
  const [messageList, setMessageList] = useState([]);
  const navigate = useNavigate();
  const { user } = isAuthenticated();
  const { email, incubator_id } = user;

  const { basicDetails } = startupInfo || {};

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

  useEffect(() => {
    if (selectedTab == "communicationTab") {
      fetchChats();
    }
  }, [selectedTab]);

  useEffect(() => {
    socket.on("receive_message", () => {
      fetchChats();
    });
  }, [socket]);

  const startupLogoName = _.last(_.split(_.get(basicDetails, "logo", ""), "/"));
  // Set the href attribute to the document's URL
  const startupLogo = !_.isEmpty(startupLogoName)
    ? `${API}/uploads/${startupLogoName}`
    : "";

  const userLogout = () => {
    logout();
    navigate("/home-page");
  };

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
        return <Kpi />;

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
    </div>
  );
};

export default StartupView;
