import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { makeRequest, socketAPI } from "../../axios";
import classes from "./StartupOnboarding.module.css";
import BasicDetails from "./BasicDetails";
import DocumentsUpload from "./DocumentsUpload";
import Questionnaire from "./Questionnaire";
import _ from "lodash";
import { isAuthenticated } from "../../auth/helper";
import moment from "moment";
import { Button } from "../../CommonComponents";

import io from "socket.io-client";
const socket = io.connect(socketAPI);

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
  { label: "Basic Details", key: "basicDetails" },
  { label: "Document Submission", key: "documentUpload" },
  { label: "Complete Questionnaire", key: "questionnaire" },
];

const StartupOnboarding = () => {
  const { startup_id } = useParams();
  const { user } = isAuthenticated();
  const { email, incubator_id } = user;
  const [selectedTab, setSelectedTab] = useState("basicDetails");
  const [startupInfo, setStartupInfo] = useState("");

  const navigate = useNavigate();

  const getUpdatedData = (data) => {
    const requestedDocuments = data?.documentUpload?.requestedDocuments;
    return {
      ...data,
      documentUpload: {
        ...data?.documentUpload,
        updatedRequestedDocuments: _.map(requestedDocuments, (item) => {
          const existingDoc = _.find(
            data?.documentUpload?.requestedDocumentsList,
            { name: item }
          );

          return existingDoc
            ? existingDoc
            : {
                format: "",
                name: item,
                size: "",
                url: "",
              };
        }),
      },
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await makeRequest.get(
          `startup/startup-details?startup_id=${startup_id}`
        );

        if (response.status === 200) {
          const data = response.data;

          if (
            !_.includes(
              ["PENDING"],
              _.get(data, "basicDetails.status", "PENDING")
            )
          ) {
            navigate(`/startup/${startup_id}/home`);
          }

          setStartupInfo(getUpdatedData(data));
        } else {
          console.error("Error fetching data:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (startup_id) {
      fetchData();
      socket.emit("join_room", `${incubator_id}-${startup_id}`);
    }
  }, [startup_id]);

  // Function to switch tabs
  const handleTabClick = (tabKey) => {
    setSelectedTab(tabKey);
  };

  const getModifiedData = () => {
    const startupDetails = {
      startup_id: startupInfo.basicDetails.id,
      name: startupInfo.basicDetails.name || "",
      logo: startupInfo.basicDetails.logo || "",
      dpiit_number: startupInfo.basicDetails.dpiitNumber || "",
      industry: startupInfo.basicDetails.industrySegment || "",
      status: "SUBMITTED",
      requestedDocuments: _.map(
        startupInfo.documentUpload.updatedRequestedDocuments,
        (item) => {
          return {
            document_name: item.name,
            document_url: item.url,
            document_size: item.size,
            document_format: item.format,
          };
        }
      ),
      questionnaire: startupInfo.questionnaire,
    };

    return startupDetails;
  };

  // Function to handle saving the data in the current tab
  const handleSave = async () => {
    const data = getModifiedData(false);
    try {
      const response = await makeRequest.post("startup/update-startup", {
        ...data,
      });

      if (response.status === 200) {
        const data = response.data;
        const { startup_id: startupId } = data;

        if (startupId) {
          navigate(`/startup/${startupId}/home`);
        } else {
          navigate("/");
        }

        const notificationData = {
          id: getRandomNumber(),
          room: `${incubator_id}-${startup_id}`,
          time: moment().format("YYYY-MM-DD HH:mm:ss"),
          sender: "startup",
          incubator_id,
          startup_id,
          text: "has successfully submitted the details.",
          redirect_type: "GO_TO_STARTUP",
        };

        await socket.emit("send_notification", notificationData);
        await makeRequest.post(
          "notification/add-notification",
          notificationData
        );
      } else {
        console.error("Error fetching data:", response.statusText);
        navigate("/");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      navigate("/");
      window.location.reload();
    }
  };

  // Function to handle "Next" button click
  const handleNext = () => {
    const index = _.findIndex(tabs, { key: selectedTab });

    if (index > -1 && index < _.size(tabs) - 1) {
      handleTabClick(tabs[index + 1]?.key);
    }
  };

  const handleBack = () => {
    const index = _.findIndex(tabs, { key: selectedTab });

    if (index - 1 > -1 && index - 1 < _.size(tabs)) {
      handleTabClick(tabs[index - 1]?.key);
    }
  };

  const disableSave =
    _.isEmpty(startupInfo?.basicDetails?.name) ||
    !startupInfo?.basicDetails?.dpiitNumber ||
    _.some(startupInfo?.documentUpload?.updatedRequestedDocuments, (item) =>
      _.isEmpty(item.url)
    ) ||
    _.some(
      startupInfo?.questionnaire,
      (item) => _.isEmpty(item?.answer) && !_.isEmpty(item?.question)
    );

  const renderTabContent = () => {
    switch (selectedTab) {
      case "basicDetails":
        return (
          <BasicDetails
            setStartupInfo={setStartupInfo}
            onNext={handleNext}
            startupInfo={startupInfo}
          />
        );
      case "documentUpload":
        return (
          <DocumentsUpload
            startupInfo={startupInfo}
            setStartupInfo={setStartupInfo}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case "questionnaire":
        return (
          <Questionnaire
            startupInfo={startupInfo}
            setStartupInfo={setStartupInfo}
            onBack={handleBack}
            onSave={handleSave}
            disableSave={disableSave}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={classes.container}>
      <div className={classes.tabMenu}>
        {tabs.map((tab) => (
          // <div
          //   key={tab.key}
          //   className={`${classes.tab} ${
          //     selectedTab === tab.key ? classes.activeTab : ""
          //   }`}
          //   onClick={() => handleTabClick(tab.key)}
          // >
          //   {tab.label}
          // </div>
          <Button
            size={"2"}
            variant={"ghost"}
            name={tab.label}
            color={"neutral"}
            onClick={() => handleTabClick(tab.key)}
            state={selectedTab === tab.key ? "active" : "default"}
            highContrast={true}
            customStyles={{
              gap: 8,
              boxShadow:
                selectedTab === tab.key
                  ? "0px 1px 4px 0px rgba(0, 0, 61, 0.05), 0px 2px 1px -1px rgba(0, 0, 61, 0.05), 0px 1px 3px 0px rgba(0, 0, 0, 0.05"
                  : "none",
              width: 230,
              justifyContent: "flex-start",
              color: selectedTab === tab.key ? "black" : "rgb(96, 100, 108)",
            }}
          />
        ))}
      </div>

      <div className={classes.rightContainer}>{renderTabContent()}</div>
    </div>
  );
};

export default StartupOnboarding;
