import React, { useState, useEffect, useRef } from "react";
import { makeRequest } from "../../../../axios";
import classes from "./SupplementaryDocuments.module.css";
import _ from "lodash";
import { useParams } from "react-router-dom";
import { Button } from "../../../../CommonComponents";
import { DocumentsContainer } from "../../../../Incubator/StartupHomeView/helper";
import moment from "moment";

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

// TODO : Placeholder image URLs for doc and pdf
const placeholderDocImage =
  "https://d9-wret.s3.us-west-2.amazonaws.com/assets/palladium/production/s3fs-public/thumbnails/image/file.jpg";
const placeholderPdfImage =
  "https://d9-wret.s3.us-west-2.amazonaws.com/assets/palladium/production/s3fs-public/thumbnails/image/file.jpg";

const SupplementaryDocuments = ({ socket, incubator_id, startup_id }) => {
  const { incubator_id: incubatorId, startup_id: startupId } = useParams();
  const [pendingDocuments, setPendingDocuments] = useState([]);
  const [approvedDocuments, setApprovedDocuments] = useState([]);
  const [rejectedDocuments, setRejectedDocuments] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false); // Add state to control the modal
  const [showSizeExceededModal, setShowSizeExceededModal] = useState(false); // Add state for size exceeded modal
  const [documentInfo, setDocumentInfo] = useState({
    selectedFile: null,
    name: "",
    size: "",
    format: "",
    url: "",
  });

  const fileInputRef = useRef(null);

  const closeModal = () => {
    // Close the modal
    setShowUploadModal(false);
    setDocumentInfo({
      selectedFile: null,
      name: "",
      size: "",
      format: "",
      isSignatureRequired: false,
    });
  };

  const closeSizeExceededModal = () => {
    setShowSizeExceededModal(false); // Close the size exceeded modal
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await makeRequest.post(
          `startup/startup-supplementary-documents`,
          {
            startup_id: startupId,
          }
        );

        if (response.status === 200) {
          const data = response.data;

          setPendingDocuments(data.pendingDocuments);
          setApprovedDocuments(data.approvedDocuments);
          setRejectedDocuments(data.rejectedDocuments);
        } else {
          console.error("Error fetching data:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (startupId) {
      fetchData();
    }
  }, [startupId]);

  const uploadDocumentMutation = async () => {
    const document = {
      document_name: documentInfo?.name,
      document_url: documentInfo?.url,
      document_format: documentInfo?.format,
      document_size: documentInfo?.size,
    };
    try {
      const response = await makeRequest.post(
        `startup/add-supplementary-documents`,
        {
          startup_id: startupId,
          document,
        }
      );

      if (response.status === 200) {
        setPendingDocuments([...pendingDocuments, documentInfo]);

        const notificationData = {
          id: getRandomNumber(),
          room: `${incubator_id}-${startup_id}`,
          time: moment().format("YYYY-MM-DD HH:mm:ss"),
          sender: "startup",
          incubator_id,
          startup_id,
          text: "has added a supplementary document.",
          redirect_type: "GO_TO_SUPPLEMENTARY_DOCS",
        };

        await socket.emit("send_notification", notificationData);
        await makeRequest.post(
          "notification/add-notification",
          notificationData
        );
      } else {
        console.error("Error fetching data:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }

    closeModal();
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await makeRequest.post("/incubator/upload", formData);

    if (response.status === 200) {
      return response.data.fileUrl;
    } else {
      console.error("Error fetching data:", response.statusText);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];

    if (file.size > 1024 * 1024) {
      setShowSizeExceededModal(true); // Show the size exceeded modal
      e.target.value = ""; // Clear the file input
      return;
    }
    if (file) {
      const url = await uploadFile(file);

      setDocumentInfo({
        selectedFile: file,
        name: file.name,
        size: `${(file.size / 1024).toFixed(2)} KB`,
        format: file.type,
        isSignatureRequired: false,
        url,
      });
      setShowUploadModal(true);
    }
  };

  const onClickButton = async ({ id, status }) => {
    try {
      const response = await makeRequest.post(
        `startup/update-documents-approved`,
        {
          startup_id: startupId,
          documentId: id,
          status,
        }
      );

      if (response.status === 200) {
        const data = response.data;

        setPendingDocuments(data.pendingDocuments);
        setApprovedDocuments(data.approvedDocuments);
        setRejectedDocuments(data.rejectedDocuments);
      } else {
        console.error("Error fetching data:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div className={classes.container}>
      <div className={classes.documentsContainer}>
        <div className={classes.heading}>
          <h3>Pending Documents</h3>
          {_.isEmpty(incubatorId) && (
            <div className={classes.chooseButtonContainer}>
              <label className={classes.uploadLabel}>
                <span className={classes.chooseFileText}>Upload File</span>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                  style={{ display: "none" }}
                />
              </label>
            </div>
          )}
        </div>
        <DocumentsContainer
          documents={pendingDocuments}
          showApproveButton={!_.isEmpty(incubatorId)}
          onClickButton={onClickButton}
        />
      </div>
      <div className={classes.documentsContainer}>
        <h3>Approved Documents</h3>
        <DocumentsContainer documents={approvedDocuments} />
      </div>

      <div className={classes.documentsContainer}>
        <h3>Rejected Documents</h3>
        <DocumentsContainer documents={rejectedDocuments} />
      </div>

      {showUploadModal && documentInfo.selectedFile && (
        <div className={classes.modalBackground}>
          <div className={classes.modal}>
            <div className={classes.modalContent}>
              <div className={classes.modalTopContent}>
                <div className={classes.preview}>
                  <img
                    src={
                      documentInfo.format === "application/pdf"
                        ? placeholderPdfImage
                        : placeholderDocImage
                    }
                    alt="Document Preview"
                    width="100"
                    height="100"
                  />
                </div>
                <div className={classes.details}>
                  <div className={classes.detail}>
                    <strong>Document Name:</strong> {documentInfo.name}
                  </div>
                  <div className={classes.detail}>
                    <strong>Document Size:</strong> {documentInfo.size}
                  </div>
                  <div className={classes.detail}>
                    <strong>Document Format:</strong>{" "}
                    {documentInfo.name.split(".").pop()}
                  </div>
                </div>
              </div>

              <div className={classes.buttons}>
                <Button
                  name={"Cancel"}
                  onClick={closeModal}
                  customStyles={{ backgroundColor: "#ff6d6d" }}
                />
                <Button name={"Upload"} onClick={uploadDocumentMutation} />
              </div>
            </div>
          </div>
        </div>
      )}

      {showSizeExceededModal && (
        <div className={classes.modalBackground}>
          <div className={classes.modal}>
            <div className={classes.modalContent}>
              <div className={classes.modalTopContent}>
                <div className={classes.preview}>
                  <img
                    src={
                      documentInfo.format === "application/pdf"
                        ? placeholderPdfImage
                        : placeholderDocImage
                    }
                    alt="Document Preview"
                    width="100"
                    height="100"
                  />
                </div>
                <div className={classes.details}>
                  <div className={classes.detail}>
                    <strong>File size exceeded</strong>
                  </div>
                  <div className={classes.detail}>
                    File size exceeds the maximum allowed size of 1MB.
                  </div>
                </div>
              </div>
              <div className={classes.buttons}>
                <Button
                  name={"Cancel"}
                  onClick={closeSizeExceededModal}
                  customStyles={{ backgroundColor: "#ff6d6d" }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplementaryDocuments;
