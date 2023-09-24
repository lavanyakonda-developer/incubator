import React, { useState } from 'react';
import classes from './DetailedQuestionnaire.module.css'; // Import your CSS file
import { Button } from '../../../CommonComponents';
import _ from 'lodash';

const DetailedQuestionnaire = ({
  startupInfo,
  onDraftExit,
  onCancel,
  onSave,
  onBack,
  setStartupInfo,
  questionnaireData,
  disableSave,
  disableDraft,
}) => {
  const [customQuestions, setCustomQuestions] = useState(
    _.find(questionnaireData, (item) => item.uid == 'customQuestions')
      ?.questions
  );

  const handleCustomAnswerChange = (questionUid, answer) => {
    const updatedQuestionIndex = _.findIndex(customQuestions, {
      uid: questionUid,
    });
    customQuestions[updatedQuestionIndex].question = answer;
    setCustomQuestions(customQuestions);

    const updatedQuestions = [
      ..._.filter(questionnaireData, (item) => item.uid != 'customQuestions'),
      {
        section: 'Your Questions ( If any )',
        uid: 'customQuestions',
        style: {
          display: 'flex',
          gap: 16,
          alignItems: 'center',
        },
        questions: customQuestions,
      },
    ];

    setStartupInfo({
      ...startupInfo,
      questionnaire: updatedQuestions,
    });
  };

  const saveAndContinue = () => {
    const updatedQuestions = [
      ..._.filter(questionnaireData, (item) => item.uid != 'customQuestions'),
      {
        section: 'Your Questions ( If any )',
        uid: 'customQuestions',
        style: {
          display: 'flex',
          gap: 16,
          alignItems: 'center',
        },
        questions: customQuestions,
      },
    ];

    setStartupInfo({
      ...startupInfo,
      questionnaire: updatedQuestions,
    });

    onSave();
  };

  const renderQuestions = (section) => {
    return _.map(section.questions, (question, index) => {
      return (
        <div key={index} className={classes.question} style={section.style}>
          <div className={classes.questionText} style={question.style}>
            {question.number ? question.number : question.question}
          </div>
          {question.subQuestions &&
            _.map(question.subQuestions, (item) => {
              return (
                <div
                  className={classes.questionText}
                  style={{ paddingLeft: 16 }}
                >
                  {item.question}
                </div>
              );
            })}
          {question.uid.startsWith('customQuestion') && (
            <textarea
              style={{ margin: '8px 0px', width: '90%' }}
              onChange={(e) =>
                handleCustomAnswerChange(question.uid, e.target.value)
              }
              value={
                _.find(customQuestions, {
                  uid: question.uid,
                })?.question || ''
              }
            />
          )}
        </div>
      );
    });
  };

  return (
    <div className={classes.questionnaireContainer}>
      <div className={classes.detailedQuestionnaire}>
        <div className={classes.questionnaireSections}>
          {_.map(questionnaireData, (section, index) => (
            <div key={index} className={classes.section}>
              <h3>{section.section}</h3>
              {renderQuestions(section)}
            </div>
          ))}
        </div>
        <div className={classes.buttonContainer}>
          <Button
            name={'Draft and Exit'}
            onClick={onDraftExit}
            disabled={disableDraft}
            customStyles={{ backgroundColor: '#ccc' }}
          />
          <Button name={'Back'} onClick={onBack} />
          <Button
            name={'Cancel'}
            onClick={onCancel}
            customStyles={{ backgroundColor: '#ff6d6d' }}
          />
          {/* TODO : Add tooltip when disabled. */}
          <Button
            name={'Save'}
            onClick={saveAndContinue}
            disabled={disableSave}
          />
        </div>
      </div>
    </div>
  );
};

export default DetailedQuestionnaire;
