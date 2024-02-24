import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { makeRequest } from "../../axios";
import _ from "lodash";
import { Button } from "../../CommonComponents";
import classes from "./StartupHomeView.module.css";
import { questions } from "../RegisterStartup/helper.js";
import StartupView from "../../Startup/StartupHome/StartupView";
import { renderQuestions, DocumentsContainer } from "./helper";
import { isAuthenticated } from "../../auth/helper";
import RegisterStartup from "../RegisterStartup";

const getStatusContainer = (status, handleReject, handleStatusChange) => {
  switch (status) {
    case "PENDING":
      return (
        <div className={classes.messageContainer}>
          🎉 Onboarding initiated! Waiting for startup to request for approval.
        </div>
      );
    case "REJECTED":
      return (
        <div
          className={classes.messageContainer}
          style={{
            backgroundColor: "#FF010110",
            color: "#BB0007D5",
          }}
        >
          🔎 You have rejected the startup, Please wait until they re-submit the
          details.
        </div>
      );

    case "SUBMITTED":
      return (
        <div
          className={classes.messageContainer}
          style={{
            backgroundColor: "#FFF9ED",
            color: "rgba(120, 50, 0, 0.81)",
          }}
        >
          🔎 Approval request raised! You can verify the details and take
          necessary action.
          <div className={classes.messageContainerButtons}>
            <Button
              onClick={handleReject}
              name={"Decline"}
              customStyles={{
                backgroundColor: "#FF010110",
                color: "#BB0007D5",
              }}
              variant={"solid"}
            />
            <Button
              onClick={() => handleStatusChange({ status: "APPROVED" })}
              name={"Approve"}
              customStyles={{
                backgroundColor: "#02BA3C16",
                color: "#006B3BE7",
              }}
              variant={"solid"}
            />
          </div>
        </div>
      );

    default:
      return null;
  }
};

const StartupHomeView = () => {
  const { startup_id } = useParams();

  const { user } = isAuthenticated();

  const [rejectMessage, setRejectMessage] = useState("");
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [basicDetails, setBasicDetails] = useState("PENDING");
  const [startupInfo, setStartupInfo] = useState({});
  const navigate = useNavigate();

  const handleStatusChange = async ({ status, reject_message = "" }) => {
    try {
      await makeRequest.post(`startup/update-startup-status`, {
        startup_id,
        status,
        reject_message,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }

    navigate("/");
    setRejectMessage("");
  };

  const handleReject = () => {
    setShowRejectBox(true);
  };

  const handleCancel = () => {
    setShowRejectBox(false);
    setRejectMessage("");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statusResponse = await makeRequest.get(
          `startup/startup-status?startup_id=${startup_id}`
        );

        const status = statusResponse?.data?.status;

        setBasicDetails(statusResponse?.data);

        if (!_.includes(["PENDING"], status)) {
          const response = await makeRequest.get(
            `startup/startup-details?startup_id=${startup_id}`
          );

          if (response.status === 200) {
            const data = response.data;

            setStartupInfo(data);
          } else {
            console.error("Error fetching data:", response.statusText);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (startup_id) {
      fetchData();
    }
  }, [startup_id]);

  const PendingComponent = () => {
    return (
      <div className={classes.waitingContainer}>
        {`You have initiated the onboarding for "${_.get(
          basicDetails,
          "name",
          ""
        )}" but the founders haven't registered yet`}
        <Button
          shouldRedirect={true}
          redirectUrl={`/incubator/${user?.incubator_id}/home`}
          name={"Go Home"}
          size={"3"}
          variant={"outline"}
          customStyles={{ backgroundColor: "#1C2024" }}
          textStyle={{ color: "white" }}
        />
      </div>
    );
  };

  const RejectedComponent = () => {
    return (
      <div className={classes.rejectBox}>
        <span className={classes.text}>
          {`You have rejected the startup onboarding with the following message: "${_.get(
            basicDetails,
            "reject_message",
            ""
          )}"`}
        </span>
        <Button
          shouldRedirect={true}
          redirectUrl={`/incubator/${user?.incubator_id}/home`}
          name={"Go Home"}
          size={"3"}
          variant={"outline"}
          customStyles={{ backgroundColor: "#1C2024" }}
          textStyle={{ color: "white" }}
        />
      </div>
    );
  };

  const ReviewStartup = () => {
    return (
      <div className={classes.reviewContainer}>
        <div className={classes.reviewBox}>
          <div
            className={classes.reviewText}
            style={{
              background: "var(--Semantic-colors-Warning-2, #FFF9ED)",
              color: "rgba(120, 50, 0, 0.81)",
            }}
          >
            {` 🔎 Approval request raised by ${_.get(
              basicDetails,
              "name",
              ""
            )} ! You can verify the details and take
            necessary action.`}
          </div>
          <div className={classes.buttonContainer}>
            <Button
              shouldRedirect={true}
              redirectUrl={`/incubator/${user?.incubator_id}/home`}
              name={"Go Home"}
              size={"3"}
              variant={"outline"}
              customStyles={{ backgroundColor: "#1C2024" }}
              textStyle={{ color: "white" }}
            />
            <Button
              onClick={handleReject}
              name={"Decline"}
              customStyles={{ backgroundColor: "#FF010110" }}
            />
            <Button
              onClick={() => handleStatusChange({ status: "APPROVED" })}
              name={"Approve"}
            />
          </div>
        </div>
        <div className={classes.innerContainer}>
          <h2 className={classes.detailsHeader}>Details Submitted</h2>

          <div className={classes.detailsContainer}>
            <div className={classes.info}>
              <label className={classes.question}>Startup Name:</label>
              <span className={classes.answer}>
                {_.get(startupInfo, "basicDetails.name", "")}
              </span>
            </div>
            <div className={classes.info}>
              <label className={classes.question}>Dpiit Number:</label>
              <span className={classes.answer}>
                {_.get(startupInfo, "basicDetails.dpiitNumber", "")}
              </span>
            </div>
            <div className={classes.info}>
              <label className={classes.question}>Industry Segment:</label>
              <span className={classes.answer}>
                {_.get(startupInfo, "basicDetails.industrySegment", "")}
              </span>
            </div>
          </div>

          <div className={classes.documentsContainer}>
            <div className={classes.heading}> Documents Uploaded</div>

            <DocumentsContainer
              documents={startupInfo?.documentUpload?.uploadedDocuments}
            />
          </div>
          <div className={classes.documentsContainer}>
            <div className={classes.heading}> Requested Documents </div>

            <DocumentsContainer
              documents={startupInfo?.documentUpload?.requestedDocumentsList}
            />
          </div>
          <div className={classes.questionnaire}>
            <div className={classes.heading}> Questions answered </div>
            <div className={classes.questionnaireSections}>
              {_.map(questions, (section, index) => (
                <div key={index} className={classes.section}>
                  <h4>{section.section}</h4>
                  {renderQuestions({ startupInfo, section })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getContainer = () => {
    switch (basicDetails?.status) {
      // case "PENDING":
      //   return <PendingComponent />;
      // case "REJECTED":
      //   return <RejectedComponent />;
      // default:
      // case "SUBMITTED":
      //   return <ReviewStartup />;
      // case "APPROVED":
      //   return <StartupView />;

      default:
      case "SUBMITTED":
      case "PENDING":
      case "REJECTED":
        return (
          <RegisterStartup
            topContainer={getStatusContainer(
              basicDetails?.status,
              handleReject,
              handleStatusChange
            )}
            disabled={true}
            status={basicDetails?.status}
            startupInfo={startupInfo}
          />
        );
      case "APPROVED":
        return <StartupView />;
    }
  };

  return (
    <div className={classes.container}>
      <div className={classes.container}>{getContainer()}</div>

      {showRejectBox && (
        <div className={classes.modalBackground}>
          <div className={classes.modal}>
            <div className={classes.modalContent}>
              <h3 style={{ padding: "8px 0px", margin: 0 }}>
                {"Please add reason for rejection"}
              </h3>
              <div className={classes.signature}>
                <textarea
                  rows="5"
                  id="rejectMessage"
                  onChange={(e) => setRejectMessage(e.target.value)}
                  style={{ height: 120, width: "100%" }}
                />
              </div>
              <div className={classes.buttons}>
                <Button
                  name={"Cancel"}
                  onClick={handleCancel}
                  customStyles={{ backgroundColor: "#ff6d6d" }}
                />
                <Button
                  name={"Decline"}
                  onClick={() =>
                    handleStatusChange({
                      status: "REJECTED",
                      reject_message: rejectMessage,
                    })
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

export default StartupHomeView;
