import React, { useState } from "react";
import classes from "./Questionnaire.module.css"; // Import your CSS file
import { Button } from "../../../CommonComponents";
import _ from "lodash";
import { questions } from "../../../Incubator/RegisterStartup/helper.js";
import { FaTrash } from "react-icons/fa";
import { makeRequest } from "../../../axios";

const placeholderPdfImage =
  "https://d9-wret.s3.us-west-2.amazonaws.com/assets/palladium/production/s3fs-public/thumbnails/image/file.jpg";

const disabledStyle = {
  background: "var(--Neutral-color-Neutral-Alpha-3, rgba(0, 0, 59, 0.05))",
};

const Questionnaire = ({
  startupInfo,
  onSave,
  onBack,
  setStartupInfo,
  disableSave,
  disabled,
}) => {
  const { questionnaire } = startupInfo;

  const [showSizeExceededModal, setShowSizeExceededModal] = useState(false);

  const closeSizeExceededModal = () => {
    setShowSizeExceededModal(false); // Close the size exceeded modal
  };

  const handleCustomAnswerChange = (questionUid, answer) => {
    const index = _.findIndex(questionnaire, { uid: questionUid });

    questionnaire[index].answer = answer;

    setStartupInfo({
      ...startupInfo,
      questionnaire,
    });
  };

  // Function to handle deleting a document by index
  const handleDeleteDocument = (questionUid, documentIndex) => {
    const updatedStartupInfo = { ...startupInfo };
    const updatedQuestionnaire = [...updatedStartupInfo.questionnaire];

    const question = updatedQuestionnaire.find((q) => q.uid === questionUid);

    if (question) {
      // Remove the document at the specified index
      question.answer.splice(documentIndex, 1);

      // Update the questionnaire state with the modified question
      updatedStartupInfo.questionnaire = updatedQuestionnaire;
      setStartupInfo(updatedStartupInfo);
    }
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

  // Function to handle uploading a file(s)
  const handleFileUpload = async (questionUid, files) => {
    const updatedStartupInfo = { ...startupInfo };
    const updatedQuestionnaire = [...updatedStartupInfo.questionnaire];

    const question = updatedQuestionnaire.find((q) => q.uid === questionUid);

    if (question) {
      // Prepare an array to hold the uploaded documents
      const newDocuments = question.answer ? [...question.answer] : [];
      // Loop through the uploaded files
      for (const file of files) {
        if (file.size > 50 * 1024 * 1024) {
          setShowSizeExceededModal(true); // Show the size exceeded modal
          return; // Exit the function
        }

        // Create a new document object
        const url = await uploadFile(file);
        const newDocument = {
          name: file.name,
          url, // Generate a URL for preview
        };

        // Push the new document to the array
        newDocuments.push(newDocument);

        // Update the 'answer' property of the question with the new documents

        question.answer = newDocuments;
      }

      // Update the questionnaire state with the modified question
      updatedStartupInfo.questionnaire = updatedQuestionnaire;
      setStartupInfo(updatedStartupInfo);
    }
  };

  const handleLogoUpload = async (questionUid, files) => {
    handleFileUpload(questionUid, files);
    // Loop through the uploaded files
    for (const file of files) {
      // Create a new document object
      const url = await uploadFile(file);
      setStartupInfo({
        ...startupInfo,
        basicDetails: {
          ...startupInfo.basicDetails,
          logo: url,
        },
      });
    }
  };

  const renderAnswerBox = (question, metaData) => {
    switch (question.answer_type) {
      default:
      case "text": {
        return (
          <textarea
            // style={{ width: "90%" }}
            className={classes.textArea}
            onChange={(e) =>
              handleCustomAnswerChange(question.uid, e.target.value)
            }
            value={
              _.find(questionnaire, {
                uid: question.uid,
              })?.answer || ""
            }
            style={disabled ? disabledStyle : {}}
            disabled={disabled}
          />
        );
      }
      case "images": {
        return (
          <div className={classes.images}>
            {!_.isEmpty(question.answer) && (
              <div className={classes.imagesList}>
                {_.map(question.answer, (document, index) => (
                  <div key={index} className={classes.imageCard}>
                    <a
                      href={document.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={classes.fileName}
                    >
                      {document.name}
                    </a>
                    <FaTrash
                      className={classes.icon}
                      onClick={() => handleDeleteDocument(question.uid, index)}
                      disabled={disabled}
                    />
                  </div>
                ))}
              </div>
            )}

            {!disabled && (
              <div className={classes.chooseButtonContainer}>
                <label className={classes.uploadLabel}>
                  <span className={classes.chooseFileText}>Choose File</span>
                  <input
                    type="file"
                    accept="image/*" // Accepts all image formats
                    onChange={(e) =>
                      handleFileUpload(question.uid, e.target.files)
                    }
                    multiple={true}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            )}
          </div>
        );
      }

      case "files":
      case "file":
        return (
          <div className={classes.images}>
            {!_.isEmpty(question.answer) && (
              <div className={classes.imagesList}>
                {_.map(question.answer, (document, index) => (
                  <div key={index} className={classes.imageCard}>
                    <a
                      href={document.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={classes.fileName}
                    >
                      {document.name}
                    </a>
                    <FaTrash
                      className={classes.icon}
                      onClick={() => handleDeleteDocument(question.uid, index)}
                      disabled={disabled}
                    />
                  </div>
                ))}
              </div>
            )}

            {!disabled && (
              <div className={classes.chooseButtonContainer}>
                <label className={classes.uploadLabel}>
                  <span className={classes.chooseFileText}>Choose File</span>
                  <input
                    type="file"
                    accept=".doc, .pdf" // Accepts only .doc and .pdf files
                    onChange={(e) =>
                      handleFileUpload(question.uid, e.target.files)
                    }
                    multiple={question.answer_type === "files"}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            )}
          </div>
        );

      case "video":
        return (
          <div className={classes.images}>
            {!_.isEmpty(question.answer) && (
              <div className={classes.imagesList}>
                {_.map(question.answer, (document, index) => (
                  <div key={index} className={classes.imageCard}>
                    <a
                      href={document.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={classes.fileName}
                    >
                      {document.name}
                    </a>
                    <FaTrash
                      className={classes.icon}
                      onClick={() => handleDeleteDocument(question.uid, index)}
                      disabled={disabled}
                    />
                  </div>
                ))}
              </div>
            )}

            {!disabled && (
              <div className={classes.chooseButtonContainer}>
                <label className={classes.uploadLabel}>
                  <span className={classes.chooseFileText}>Choose File</span>
                  <input
                    type="file"
                    accept="video/*" // Accepts all video formats
                    onChange={(e) =>
                      handleFileUpload(question.uid, e.target.files)
                    }
                    multiple={false}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            )}
          </div>
        );

      case "dropdown":
        return (
          <select
            onChange={(e) =>
              handleCustomAnswerChange(question.uid, e.target.value)
            }
            value={_.find(questionnaire, { uid: question.uid })?.answer || ""}
            style={
              disabled
                ? {
                    margin: "8px 0px",
                    width: "30%",
                    height: 30,
                    borderRadius: 6,
                    border:
                      "1px solid var(--Neutral-color-Neutral-Alpha-6, rgba(1, 1, 46, 0.13))",
                    ...disabledStyle,
                  }
                : {
                    margin: "8px 0px",
                    width: "30%",
                    height: 30,
                    borderRadius: 6,
                    border:
                      "1px solid var(--Neutral-color-Neutral-Alpha-6, rgba(1, 1, 46, 0.13))",
                  }
            }
            disabled={disabled}
          >
            {_.map(metaData, (option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "date":
        return (
          <input
            type="date"
            onChange={(e) =>
              handleCustomAnswerChange(question.uid, e.target.value)
            }
            value={_.find(questionnaire, { uid: question.uid })?.answer || ""}
            style={
              disabled
                ? {
                    height: 30,
                    width: "30%",
                    borderRadius: 6,
                    border:
                      "1px solid var(--Neutral-color-Neutral-Alpha-6, rgba(1, 1, 46, 0.13))",
                    ...disabledStyle,
                  }
                : {
                    height: 30,
                    width: "30%",
                    borderRadius: 6,
                    border:
                      "1px solid var(--Neutral-color-Neutral-Alpha-6, rgba(1, 1, 46, 0.13))",
                  }
            }
            disabled={disabled}
          />
        );

      case "number":
        return (
          <input
            type="number"
            onChange={(e) =>
              handleCustomAnswerChange(question.uid, e.target.value)
            }
            value={_.find(questionnaire, { uid: question.uid })?.answer || ""}
            disabled={disabled}
            style={
              disabled
                ? {
                    height: 30,
                    width: "30%",
                    borderRadius: 6,
                    border:
                      "1px solid var(--Neutral-color-Neutral-Alpha-6, rgba(1, 1, 46, 0.13))",
                    ...disabledStyle,
                  }
                : {
                    height: 30,
                    width: "30%",
                    borderRadius: 6,
                    border:
                      "1px solid var(--Neutral-color-Neutral-Alpha-6, rgba(1, 1, 46, 0.13))",
                  }
            }
          />
        );

      case "startup_logo":
        return (
          <div className={classes.images}>
            {!_.isEmpty(question.answer) && (
              <div className={classes.imagesList}>
                {_.map(question.answer, (document, index) => (
                  <div key={index} className={classes.imageCard}>
                    <a
                      href={document.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={classes.fileName}
                    >
                      {document.name}
                    </a>
                    <FaTrash
                      className={classes.icon}
                      onClick={() => handleDeleteDocument(question.uid, index)}
                      disabled={disabled}
                    />
                  </div>
                ))}
              </div>
            )}

            {!disabled && (
              <div className={classes.chooseButtonContainer}>
                <label className={classes.uploadLabel}>
                  <span className={classes.chooseFileText}>Choose File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleLogoUpload(question.uid, e.target.files)
                    }
                    multiple={false}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            )}
          </div>
        );
    }
  };

  const renderQuestionBox = (question, metaData) => {
    if (_.isEmpty(question) || _.isEmpty(question?.question)) return;

    return (
      <div className={classes.questionContainer}>
        <div className={classes.questionText}>{question.question}</div>
        <div>{renderAnswerBox(question, metaData)}</div>
      </div>
    );
  };

  const renderQuestions = (section) => {
    return _.map(section.questions, (question, index) => {
      return (
        <div
          key={question.uid}
          className={classes.question}
          style={section.style}
        >
          {renderQuestionBox(
            _.find(questionnaire, {
              uid: question.uid,
            }),
            question?.meta_data
          )}
          {question.subQuestions &&
            _.map(question.subQuestions, (item) => {
              return (
                <>
                  {renderQuestionBox(
                    _.find(questionnaire, {
                      uid: item.uid,
                    }),
                    question?.meta_data
                  )}
                </>
              );
            })}
        </div>
      );
    });
  };

  return (
    <div className={classes.questionnaireContainer}>
      <div className={classes.detailedQuestionnaire}>
        <div className={classes.heading}>
          <div className={classes.title}>Questionnaire</div>
          <div className={classes.subTitle}>
            A detailed questionnaire is sent out to you by the Incubator
          </div>
        </div>
        <div className={classes.questionnaireSections}>
          {_.map(questions, (section, index) => {
            return (
              <div key={index} className={classes.section}>
                {_.some(
                  section?.questions,
                  (item) => !_.isEmpty(item?.question)
                ) && (
                  <div className={classes.sectionTitle}>{section.section}</div>
                )}
                <div key={index} className={classes.sectionQuestions}>
                  {renderQuestions(section)}{" "}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {showSizeExceededModal && (
        <div className={classes.modalBackground}>
          <div className={classes.modal}>
            <div className={classes.modalContent}>
              <div className={classes.modalTopContent}>
                <div className={classes.preview}>
                  <img
                    src={placeholderPdfImage}
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
                    File size exceeds the maximum allowed size of 50MB.
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
      <div className={classes.buttonContainer}>
        <Button
          name={"Back"}
          onClick={onBack}
          variant={"outline"}
          highContrast={true}
          color={"gray"}
        />

        <Button
          name={"Submit Information"}
          onClick={onSave}
          variant={"solid"}
          disabled={disableSave}
          customStyles={
            disableSave ? { cursor: "pointer" } : { backgroundColor: "#1C2024" }
          }
        />
      </div>
    </div>
  );
};

export default Questionnaire;
