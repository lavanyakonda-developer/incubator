// RegisterStartup.js

import React, { useState, useEffect } from "react";
import classes from "./RegisterStartup..module.css"; // Import your CSS file
import BasicDetails from "./BasicDetails";
import ReferralCode from "./ReferralCode";
import DocumentUpload from "./DocumentUpload";
import DetailedQuestionnaire from "./DetailedQuestionnaire";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import _ from "lodash";
import { questions } from "./helper";
import { makeRequest, API } from "../../axios";
import { Button } from "../../CommonComponents";
import { isAuthenticated } from "../../auth/helper";
import { CopyIcon, Cross1Icon } from "@radix-ui/react-icons";
import Questionnaire from "../../Startup/StartupOnboarding/Questionnaire/Questionnaire";

const tabs = [
  { label: "Basic Info", key: "basicDetails" },
  { label: "Document Upload", key: "documentUpload" },
  {
    label: "Detailed Questionnaire",
    key: "questionnaire",
  },
];

const isValidEmail = (email) => {
  // Regular expression for validating email addresses
  const emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;

  if (!emailRegex.test(email)) {
    return false;
  }

  return true;
};

const generateRandomCode = (length) => {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    code += charset.charAt(randomIndex);
  }

  return code;
};

const RegisterStartup = (props) => {
  const {
    startupId,
    topContainer,
    disabled,
    status,
    startupInfo: oldStartupInfo,
  } = props;
  const { startup_id } = useParams();

  const updatedStartupId = startupId ? startupId : startup_id;
  const { incubator_id: incubatorId } = useParams();
  const [searchParams] = useSearchParams();

  const [showInvitationSentModal, setShowInvitationSentModal] = useState(false);

  const navigate = useNavigate();

  const goHome = () => {
    const { token, user } = isAuthenticated();
    const isIncubatorFounder = _.isEqual(user?.role, "incubator_founder");
    const isStartupFounder = _.isEqual(user?.role, "startup_founder");

    const route =
      token && user?.incubator_id && isIncubatorFounder
        ? `/incubator/${user?.incubator_id}/home`
        : token && user?.startup_id && isStartupFounder
        ? `/startup/${user?.startup_id}/home`
        : "/home-page";

    navigate(route);
  };

  const [draftStartup, setDraftStartup] = useState(null);

  const getStartupInfo = (data) => {
    const startup = draftStartup ? draftStartup : data;

    if (!_.isEmpty(startup)) {
      const existingQuestions = startup.questionnaire;
      return {
        basicDetails: {
          ...startup.basicDetails,
        },
        documentUpload: {
          uploadedDocuments: startup.documentUpload.uploadedDocuments,
          requestedDocuments: startup.documentUpload.requestedDocuments.concat(
            Array(5 - startup.documentUpload.requestedDocuments.length).fill("")
          ),
        },
        questionnaire: _.map(questions, (section) => {
          const updatedSection = {
            ...section,
            questions: _.map(section.questions, (item) => {
              if (item.subQuestions) {
                const updatedSubQuestions = _.map(
                  item.subQuestions,
                  (subItem) => {
                    return {
                      ...subItem,
                      question: _.get(
                        _.find(existingQuestions, { uid: subItem.uid }),
                        "question",
                        subItem.question
                      ),
                    };
                  }
                );
                return {
                  ...item,
                  subQuestions: updatedSubQuestions,
                };
              } else {
                return {
                  ...item,
                  question: _.get(
                    _.find(existingQuestions, { uid: item.uid }),
                    "question",
                    item.question
                  ),
                };
              }
            }),
          };
          return updatedSection;
        }),
      };
    } else {
      return {
        basicDetails: {
          id: "",
          name: "",
          dpiitNumber: "",
          industrySegment: "",
          founderName: "",
          founderRole: "",
          founderEmail: "",
          founderMobile: "",
          coFounders: [],
          referralCode: generateRandomCode(10),
        },
        documentUpload: {
          uploadedDocuments: [],
          requestedDocuments: ["", "", "", "", ""],
        },
        questionnaire: questions,
      };
    }
  };

  const [startupInfo, setStartupInfo] = useState(getStartupInfo());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await makeRequest.get(
          `startup/startup-details?startup_id=${updatedStartupId}`
        );

        if (response.status === 200) {
          const data = response.data;

          setDraftStartup(data);

          setStartupInfo(getStartupInfo(data));
        } else {
          console.error("Error fetching data:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (updatedStartupId) {
      fetchData();
    }
  }, []);

  const [selectedTab, setSelectedTab] = useState("basicDetails"); // Set the initial selected tab

  // Function to switch tabs
  const handleTabClick = (tabKey) => {
    setSelectedTab(tabKey);
  };

  const getModifiedData = (isDraft = false) => {
    const coFounders = _.filter(
      startupInfo.basicDetails.coFounders,
      (founder) => {
        return (
          !_.isEmpty(founder.name) &&
          !_.isEmpty(founder.designation) &&
          !_.isEmpty(founder.phone_number) &&
          isValidEmail(founder.email)
        );
      }
    );

    const startupDetails = {
      id: startupInfo.basicDetails.id,
      name: startupInfo.basicDetails.name || "",
      dpiit_number: startupInfo.basicDetails.dpiitNumber || "",
      industry: startupInfo.basicDetails.industrySegment || "",
      referral_code:
        startupInfo.basicDetails.referralCode || generateRandomCode(10),
      incubator_id: incubatorId,
      is_draft: isDraft,
      founders: _.concat(
        [
          {
            name: startupInfo.basicDetails.founderName,
            email: startupInfo.basicDetails.founderEmail,
            phone_number: startupInfo.basicDetails.founderMobile,
            designation: startupInfo.basicDetails.founderRole,
          },
        ],
        coFounders
      ),
      uploadedDocuments: startupInfo.documentUpload.uploadedDocuments,
      requestedDocuments: _.filter(
        startupInfo.documentUpload.requestedDocuments,
        (item) => !_.isEmpty(item)
      ),
      questionnaire: startupInfo.questionnaire,
    };

    return startupDetails;
  };

  // Function to handle saving the data in the current tab
  const handleSave = async () => {
    const data = getModifiedData(false);

    try {
      const response = await makeRequest.post("api/auth/startup-register", {
        ...data,
      });

      if (response.status === 200) {
        const data = response.data;
      } else {
        console.error("Error fetching data:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }

    setShowInvitationSentModal(true);
  };

  // Function to handle "Save as Draft" button click
  const handleDraftExit = async () => {
    const data = getModifiedData(true);

    try {
      const response = await makeRequest.post(`api/auth/startup-register`, {
        ...data,
      });

      if (response.status === 200) {
        const data = response.data;
      } else {
        console.error("Error fetching data:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }

    goHome();
  };

  // Function to handle "Cancel" button click
  const handleCancel = () => {
    goHome();
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
    _.isEmpty(startupInfo.basicDetails.name) ||
    !startupInfo.basicDetails.dpiitNumber ||
    _.isEmpty(startupInfo.basicDetails.founderName) ||
    _.isEmpty(startupInfo.basicDetails.founderRole) ||
    _.isEmpty(startupInfo.basicDetails.founderEmail) ||
    _.isEmpty(startupInfo.basicDetails.founderMobile) ||
    (!_.isEmpty(startupInfo.basicDetails.coFounders) &&
      _.some(startupInfo.basicDetails.coFounders, (item) => {
        return (
          (_.isEmpty(item.name) ||
            _.isEmpty(item.designation) ||
            _.isEmpty(item.phone_number) ||
            !isValidEmail(item.email)) &&
          !(
            _.isEmpty(item.name) &&
            _.isEmpty(item.designation) &&
            _.isEmpty(item.phone_number) &&
            !isValidEmail(item.email)
          )
        );
      }));

  // Conditionally render the selected tab
  const renderTabContent = () => {
    switch (selectedTab) {
      case "basicDetails":
        return (
          <BasicDetails
            startupInfo={startupInfo}
            onDraftExit={handleDraftExit}
            onCancel={handleCancel}
            onNext={handleNext}
            setStartupInfo={setStartupInfo}
            disabled={disabled}
            disableDraft={disableSave || disabled}
          />
        );
      // case "referralLink":
      //   return (
      //     <ReferralCode
      //       startupInfo={startupInfo}
      //       onDraftExit={handleDraftExit}
      //       onCancel={handleCancel}
      //       onNext={handleNext}
      //       onBack={handleBack}
      //       disableDraft={disableSave}
      //     />
      //   );
      case "documentUpload":
        return (
          <DocumentUpload
            uploadedDocuments={startupInfo.documentUpload.uploadedDocuments}
            requestedDocuments={startupInfo.documentUpload.requestedDocuments}
            setStartupInfo={setStartupInfo}
            startupInfo={startupInfo}
            onDraftExit={handleDraftExit}
            onCancel={handleCancel}
            onNext={handleNext}
            onBack={handleBack}
            disabled={disabled}
            disableDraft={disableSave || disabled}
          />
        );
      case "questionnaire": {
        if (status == "SUBMITTED" || status == "REJECTED") {
          return (
            <Questionnaire
              startupInfo={oldStartupInfo}
              setStartupInfo={setStartupInfo}
              onBack={handleBack}
              onSave={handleSave}
              disableSave={disableSave || disabled}
              disabled={disabled}
            />
          );
        } else {
          return (
            <DetailedQuestionnaire
              questionnaireData={startupInfo.questionnaire}
              onDraftExit={handleDraftExit}
              onBack={handleBack}
              onCancel={handleCancel}
              onNext={handleNext}
              onSave={handleSave}
              setStartupInfo={setStartupInfo}
              startupInfo={startupInfo}
              disableSave={disableSave || disabled}
              disabled={disabled}
              disableDraft={disableSave || disabled}
            />
          );
        }
      }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(startupInfo.basicDetails.referralCode);
    goHome();
    setShowInvitationSentModal(false);
  };

  return (
    <div className={classes.startupRegistrationTabs}>
      <div className={classes.tabContainer}>
        <Button
          onClick={() => {
            goHome();
          }}
          icon={<Cross1Icon />}
          variant={"soft"}
          customStyles={{
            width: 100,
            fontSize: 16,
            color: "black",
            justifyContent: "left",
            // backgroundColor: "#f0f0f0",
            padding: "24px 16px",
          }}
          color={"black"}
        />
        <div className={classes.tabMenu}>
          {_.map(tabs, (tab) => (
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
      </div>

      <div className={classes.rightContainer}>
        <>
          {topContainer && topContainer}
          {renderTabContent()}
        </>
      </div>
      {showInvitationSentModal && (
        <div className={classes.modalBackground}>
          <div className={classes.modal}>
            <div className={classes.modalContent}>
              <div className={classes.crossButtonDiv}>
                <Button
                  onClick={() => {
                    goHome();
                  }}
                  icon={<Cross1Icon />}
                  variant={"soft"}
                  customStyles={{
                    width: 100,
                    fontSize: 16,
                    color: "black",
                    justifyContent: "left",
                    padding: "24px 16px",
                  }}
                  color={"black"}
                />
              </div>
              <div className={classes.imageContainer}>
                <img
                  src={`${API}/uploads/image2.png`}
                  width={240}
                  height={240}
                />
              </div>

              <div className={classes.textContainer}>
                <div className={classes.heading}>
                  {`Invitation sent to ${startupInfo?.basicDetails?.name}`}
                </div>
                <div className={classes.subHeading}>
                  {" "}
                  We’ve sent an invite to the startup founders over email! The
                  invite includes a referral code that can be used by the
                  startup to initiate their setup or you could share the code
                  too.
                </div>
              </div>

              <div className={classes.buttons}>
                <Button
                  name={startupInfo?.basicDetails?.referralCode}
                  // onClick={handleCancel}
                  customStyles={{
                    backgroundColor: "#ff6d6d",
                    width: "40%",
                    height: 40,
                    padding: 4,
                    alignItems: "center",
                    borderRadius: 6,
                    border:
                      "1px solid var(--Neutral-color-Neutral-Alpha-6, rgba(1, 1, 46, 0.13))",
                    background: "rgba(255, 255, 255, 0.90)",
                    color: "black",
                  }}
                />
                <Button
                  name={"Copy Invite code"}
                  size={"3"}
                  variant={"solid"}
                  customStyles={{
                    backgroundColor: "#1C2024",
                    gap: 8,
                    borderRadius: 6,
                    padding: 4,
                    width: "40%",
                    cursor: "pointer",
                  }}
                  onClick={copyToClipboard}
                  icon={<CopyIcon width={24} height={24} />}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterStartup;
