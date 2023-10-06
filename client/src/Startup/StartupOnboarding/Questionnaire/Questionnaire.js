import React from 'react';
import classes from './Questionnaire.module.css'; // Import your CSS file
import { Button } from '../../../CommonComponents';
import _ from 'lodash';
import { questions } from '../../../Incubator/RegisterStartup/helper.js';
import { FaTrash } from 'react-icons/fa';
import { makeRequest } from '../../../axios';

const Questionnaire = ({
  startupInfo,
  onSave,
  onBack,
  setStartupInfo,
  disableSave,
}) => {
  const { questionnaire } = startupInfo;

  const customQuestions = _.filter(questionnaire, (question) =>
    _.startsWith(question.uid, 'customQuestion')
  );

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
    formData.append('file', file);

    const response = await makeRequest.post('/incubator/upload', formData);

    if (response.status === 200) {
      return response.data.fileUrl;
    } else {
      console.error('Error fetching data:', response.statusText);
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
        // Create a new document object
        const url = await uploadFile(file);
        const newDocument = {
          name: file.name,
          url, // Generate a URL for preview
        };

        // Push the new document to the array
        newDocuments.push(newDocument);
      }

      // Update the 'answer' property of the question with the new documents

      question.answer = newDocuments;

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
      case 'text':
        return (
          <textarea
            style={{ width: '90%' }}
            onChange={(e) =>
              handleCustomAnswerChange(question.uid, e.target.value)
            }
            value={
              _.find(questionnaire, {
                uid: question.uid,
              })?.answer || ''
            }
          />
        );

      case 'images': {
        return (
          <div className={classes.images}>
            {!_.isEmpty(question.answer) && (
              <div className={classes.imagesList}>
                {_.map(question.answer, (document, index) => (
                  <div key={index} className={classes.imageCard}>
                    <a
                      href={document.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className={classes.fileName}
                    >
                      {document.name}
                    </a>
                    <FaTrash
                      className={classes.icon}
                      onClick={() => handleDeleteDocument(question.uid, index)}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className={classes.chooseButtonContainer}>
              <label className={classes.uploadLabel}>
                <span className={classes.chooseFileText}>Choose File</span>
                <input
                  type='file'
                  accept='image/*' // Accepts all image formats
                  onChange={(e) =>
                    handleFileUpload(question.uid, e.target.files)
                  }
                  multiple={true}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>
        );
      }

      case 'files':
      case 'file':
        return (
          <div className={classes.images}>
            {!_.isEmpty(question.answer) && (
              <div className={classes.imagesList}>
                {_.map(question.answer, (document, index) => (
                  <div key={index} className={classes.imageCard}>
                    <a
                      href={document.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className={classes.fileName}
                    >
                      {document.name}
                    </a>
                    <FaTrash
                      className={classes.icon}
                      onClick={() => handleDeleteDocument(question.uid, index)}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className={classes.chooseButtonContainer}>
              <label className={classes.uploadLabel}>
                <span className={classes.chooseFileText}>Choose File</span>
                <input
                  type='file'
                  accept='.doc, .pdf' // Accepts only .doc and .pdf files
                  onChange={(e) =>
                    handleFileUpload(question.uid, e.target.files)
                  }
                  multiple={question.answer_type === 'files'}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>
        );

      case 'video':
        return (
          <div className={classes.images}>
            {!_.isEmpty(question.answer) && (
              <div className={classes.imagesList}>
                {_.map(question.answer, (document, index) => (
                  <div key={index} className={classes.imageCard}>
                    <a
                      href={document.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className={classes.fileName}
                    >
                      {document.name}
                    </a>
                    <FaTrash
                      className={classes.icon}
                      onClick={() => handleDeleteDocument(question.uid, index)}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className={classes.chooseButtonContainer}>
              <label className={classes.uploadLabel}>
                <span className={classes.chooseFileText}>Choose File</span>
                <input
                  type='file'
                  accept='video/*' // Accepts all video formats
                  onChange={(e) =>
                    handleFileUpload(question.uid, e.target.files)
                  }
                  multiple={false}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>
        );

      case 'dropdown':
        return (
          <select
            style={{ margin: '8px 0px', width: '20%', height: 30 }}
            onChange={(e) =>
              handleCustomAnswerChange(question.uid, e.target.value)
            }
            value={_.find(questionnaire, { uid: question.uid })?.answer || ''}
          >
            <option value=''>Select</option>
            {_.map(metaData, (option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'date':
        return (
          <input
            type='date'
            onChange={(e) =>
              handleCustomAnswerChange(question.uid, e.target.value)
            }
            value={_.find(questionnaire, { uid: question.uid })?.answer || ''}
            style={{ height: 30, width: 120 }}
          />
        );

      case 'number':
        return (
          <input
            type='number'
            onChange={(e) =>
              handleCustomAnswerChange(question.uid, e.target.value)
            }
            value={_.find(questionnaire, { uid: question.uid })?.answer || ''}
            style={{ height: 20, width: 120 }}
          />
        );

      case 'startup_logo':
        return (
          <div className={classes.images}>
            {!_.isEmpty(question.answer) && (
              <div className={classes.imagesList}>
                {_.map(question.answer, (document, index) => (
                  <div key={index} className={classes.imageCard}>
                    <a
                      href={document.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className={classes.fileName}
                    >
                      {document.name}
                    </a>
                    <FaTrash
                      className={classes.icon}
                      onClick={() => handleDeleteDocument(question.uid, index)}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className={classes.chooseButtonContainer}>
              <label className={classes.uploadLabel}>
                <span className={classes.chooseFileText}>Choose File</span>
                <input
                  type='file'
                  accept='image/*'
                  onChange={(e) =>
                    handleLogoUpload(question.uid, e.target.files)
                  }
                  multiple={false}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
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
        <div className={classes.questionnaireSections}>
          {_.map(questions, (section, index) => {
            return (
              <div key={index} className={classes.section}>
                {_.some(
                  section?.questions,
                  (item) => !_.isEmpty(item?.question)
                ) && <h3>{section.section}</h3>}
                {renderQuestions(section)}
              </div>
            );
          })}
        </div>
        <div className={classes.buttonContainer}>
          <Button name={'Back'} onClick={onBack} />

          {/* TODO : Add tooltip when disabled. */}
          <Button name={'Save'} onClick={onSave} disabled={disableSave} />
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;
