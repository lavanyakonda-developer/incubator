import React, { useState, useRef } from "react";
import classes from "./DocumentUpload.module.css"; // Import your CSS file
import { Button } from "../../../CommonComponents";
import _ from "lodash";
import { saveAs } from "file-saver";
import { makeRequest, API } from "../../../axios";
import { FileIcon, DownloadIcon, TrashIcon } from "@radix-ui/react-icons";

// TODO : Placeholder image URLs for doc and pdf
const placeholderDocImage =
  "https://d9-wret.s3.us-west-2.amazonaws.com/assets/palladium/production/s3fs-public/thumbnails/image/file.jpg";
const placeholderPdfImage =
  "https://d9-wret.s3.us-west-2.amazonaws.com/assets/palladium/production/s3fs-public/thumbnails/image/file.jpg";

const disabledStyle = {
  background: "var(--Neutral-color-Neutral-Alpha-3, rgba(0, 0, 59, 0.05))",
};

const DocumentUpload = ({
  uploadedDocuments,
  onDraftExit,
  onCancel,
  onNext,
  onBack,
  requestedDocuments,
  startupInfo,
  setStartupInfo,
  disableDraft,
  disabled,
}) => {
  const setUploadedDocuments = (newDocuments) => {
    setStartupInfo({
      ...startupInfo,
      documentUpload: {
        ...startupInfo.documentUpload,
        uploadedDocuments: newDocuments,
      },
    });
  };

  const setRequestedDocuments = (newDocuments) => {
    setStartupInfo({
      ...startupInfo,
      documentUpload: {
        ...startupInfo.documentUpload,
        requestedDocuments: newDocuments,
      },
    });
  };

  const [documentInfo, setDocumentInfo] = useState({
    selectedFile: null,
    name: "",
    size: "",
    format: "",
    isSignatureRequired: false,
    url: "",
  });
  const [showUploadModal, setShowUploadModal] = useState(false); // Add state to control the modal
  const [showSizeExceededModal, setShowSizeExceededModal] = useState(false); // Add state for size exceeded modal

  const fileInputRef = useRef(null);

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

  const handleUpload = () => {
    if (documentInfo.selectedFile) {
      setUploadedDocuments([...uploadedDocuments, documentInfo]);

      // Clear form fields
      setDocumentInfo({
        selectedFile: null,
        name: "",
        size: "",
        format: "",
        isSignatureRequired: false,
        url: "",
      });
      // Reset file input field
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      // Show the modal after uploading
      setShowUploadModal(false);
    }
  };

  const handleRequestedDocumentChange = (index, value) => {
    const updatedRequestedDocuments = [...requestedDocuments];
    updatedRequestedDocuments[index] = value;
    setRequestedDocuments(updatedRequestedDocuments);
  };

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

  const handleDelete = (documentIndex) => {
    // Remove the selected document from the list
    const updatedDocuments = [...uploadedDocuments];
    updatedDocuments.splice(documentIndex, 1);
    setUploadedDocuments(updatedDocuments);
  };

  const handleDownload = (documentIndex) => {
    // Get the document's file data and name from the uploadedDocuments array
    const documentData = uploadedDocuments[documentIndex];

    if (documentData && documentData.file) {
      // Extract the filename from the document data (modify this based on your data structure)
      const filename = documentData.name;

      // Convert the file data to a Blob
      const blob = new Blob([documentData.file], {
        type: documentData.format, // Use the correct MIME type
      });

      // Check if the Blob was successfully created
      if (blob) {
        // Initiate the download using FileSaver.js or browser's native download
        saveAs(blob, filename);
      } else {
        console.error("Failed to create Blob from file data.");
      }
    } else if (documentData && documentData.url) {
      // Create an anchor element
      const downloadLink = document.createElement("a");

      const fileName = _.last(_.split(documentData.url, "/"));
      // Set the href attribute to the document's URL
      downloadLink.href = `${API}/uploads/${fileName}`;

      // Specify the download attribute to suggest a filename (optional)
      downloadLink.setAttribute("download", documentData.name);
      // Set the target attribute to "_blank" to open the link in a new tab/window
      downloadLink.setAttribute("target", "_blank");

      // Simulate a click on the anchor element to initiate the download
      downloadLink.click();
    } else {
      console.error("Invalid document data or missing file.");
    }
  };

  return (
    <div className={classes.container}>
      <div className={classes.heading}>
        <div className={classes.title}>Document requirements</div>
        <div className={classes.subTitle}>
          Request and upload the necessary documents required from the startup.
        </div>
      </div>
      <div
        className={`${classes.documentUpload} ${classes.documentUploadCard}`}
      >
        <div className={classes.requestedDocumentsCard}>
          <div className={classes.heading}>
            <div className={classes.documentsContainerTitle}>
              Requested Documents
            </div>
            <div className={classes.subTitle}>
              Request and upload the necessary documents required from the
              startup.
            </div>
          </div>
          <ol className={classes.requestedDocumentsList}>
            {_.map(requestedDocuments, (document, index) => (
              <li key={index}>
                <input
                  type="text"
                  value={document}
                  onChange={(e) =>
                    handleRequestedDocumentChange(index, e.target.value)
                  }
                  style={
                    disabled
                      ? { ...disabledStyle, maxWidth: "96%" }
                      : { maxWidth: "96%" }
                  }
                  className={classes.inputField}
                  disabled={disabled}
                />
              </li>
            ))}
          </ol>
        </div>

        <div className={classes.uploadedDocuments}>
          <div className={classes.documentsContainerHeading}>
            <div className={classes.documentsContainerTitle}>
              Upload documents
            </div>
            {!disabled && (
              <div className={classes.chooseButtonContainer}>
                <label className={classes.uploadLabel}>
                  <span className={classes.chooseFileText}>
                    Upload documents
                  </span>
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
          <div className={classes.previewDocumentsContainer}>
            {_.map(uploadedDocuments, (document, index) => (
              // <div className={classes.documentCard} key={index}>
              //   <div className={classes.cardPreview}>
              //     <img
              //       src={
              //         documentInfo.format === "application/pdf"
              //           ? placeholderPdfImage
              //           : placeholderDocImage
              //       }
              //       alt={`Document ${index + 1}`}
              //       width="40"
              //       height="60"
              //     />
              //   </div>
              //   <div className={classes.cardActions}>
              //     <FaDownload
              //       className={classes.icon}
              //       onClick={() => handleDownload(index)}
              //     />
              //     <FaTrash
              //       className={classes.icon}
              //       onClick={() => handleDelete(index)}
              //     />
              //   </div>
              //   <div className={classes.cardDetails}>
              //     <div>
              //       <strong>Name:</strong> {document.name}
              //     </div>
              //     <div>
              //       <strong>Size:</strong> {document.size}
              //     </div>
              //     <div>
              //       <strong>Signature Required:</strong>{" "}
              //       {document.isSignatureRequired ? "Yes" : "No"}
              //     </div>
              //   </div>
              // </div>

              <div className={classes.documentCard} key={index}>
                <div className={classes.fileNameAndIconContainer}>
                  {" "}
                  <FileIcon width="20" height="20" />
                  <div className={classes.documentCardName}>
                    {document.name}
                  </div>
                </div>

                <div className={classes.cardActions}>
                  <DownloadIcon
                    className={classes.icon}
                    onClick={() => handleDownload(index)}
                  />
                  <TrashIcon
                    className={classes.icon}
                    onClick={() => handleDelete(index)}
                    color="red"
                  />
                </div>
              </div>
            ))}
          </div>
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
                <div className={classes.signature}>
                  <input
                    type="checkbox"
                    id="signatureRequired"
                    checked={documentInfo.isSignatureRequired}
                    onChange={() =>
                      setDocumentInfo({
                        ...documentInfo,
                        isSignatureRequired: !documentInfo.isSignatureRequired,
                      })
                    }
                    width={16}
                    height={16}
                  />
                  <label htmlFor="signatureRequired">
                    Does the document require a signature?
                  </label>
                </div>
                <div className={classes.buttons}>
                  <Button
                    name={"Cancel"}
                    onClick={closeModal}
                    customStyles={{ backgroundColor: "#ff6d6d" }}
                  />
                  <Button name={"Upload"} onClick={handleUpload} />
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
      <div className={classes.buttonContainer}>
        <Button
          name={"Back"}
          onClick={onBack}
          variant={"outline"}
          highContrast={true}
          color={"gray"}
        />

        <div className={classes.buttonContainerRight}>
          <Button
            name={"Save as Draft"}
            onClick={onDraftExit}
            variant={"outline"}
            disabled={disableDraft}
            highContrast={true}
            color={"gray"}
          />
          <Button
            name={"Next"}
            onClick={onNext}
            variant={"solid"}
            customStyles={{ backgroundColor: "#1C2024", width: 68 }}
          />
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;
