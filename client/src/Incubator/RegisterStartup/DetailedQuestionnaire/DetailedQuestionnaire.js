import React, { useState } from "react";
import classes from "./DetailedQuestionnaire.module.css"; // Import your CSS file
import { Button } from "../../../CommonComponents";
import _ from "lodash";

const disabledStyle = {
  background: "var(--Neutral-color-Neutral-Alpha-3, rgba(0, 0, 59, 0.05))",
};

const DetailedQuestionnaire = ({
  startupInfo,
  onDraftExit,
  onSave,
  onBack,
  setStartupInfo,
  questionnaireData,
  disableSave,
  disableDraft,
  disabled,
}) => {
  const [customQuestions, setCustomQuestions] = useState(
    _.find(questionnaireData, (item) => item.uid == "customQuestions")
      ?.questions
  );

  const handleCustomAnswerChange = (questionUid, answer) => {
    const updatedQuestionIndex = _.findIndex(customQuestions, {
      uid: questionUid,
    });
    customQuestions[updatedQuestionIndex].question = answer;
    setCustomQuestions(customQuestions);

    const updatedQuestions = [
      ..._.filter(questionnaireData, (item) => item.uid != "customQuestions"),
      {
        section: "Your Questions ( If any )",
        uid: "customQuestions",
        style: {
          display: "flex",
          gap: 16,
          alignItems: "center",
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
      ..._.filter(questionnaireData, (item) => item.uid != "customQuestions"),
      {
        section: "Your Questions ( If any )",
        uid: "customQuestions",
        style: {
          display: "flex",
          gap: 16,
          alignItems: "center",
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
        <div
          key={question.uid}
          className={classes.question}
          style={section.style}
        >
          <div
            className={question.number ? null : classes.questionText}
            style={question.style}
          >
            {question.number ? question.number : question.question}
          </div>
          {question.subQuestions &&
            _.map(question.subQuestions, (item) => {
              return (
                <div
                  className={classes.questionText}
                  style={{ paddingLeft: 16 }}
                  key={item.uid}
                >
                  {item.question}
                </div>
              );
            })}
          {question.uid.startsWith("customQuestion") && (
            <textarea
              onChange={(e) =>
                handleCustomAnswerChange(question.uid, e.target.value)
              }
              value={
                _.find(customQuestions, {
                  uid: question.uid,
                })?.question || ""
              }
              className={classes.textArea}
              style={disabled ? { ...disabledStyle } : {}}
              disabled={disabled}
            />
          )}
        </div>
      );
    });
  };

  return (
    <div className={classes.questionnaireContainer}>
      <div className={classes.heading}>
        <div className={classes.title}>Questionnaire</div>
        <div className={classes.subTitle}>
          A detailed questionnaire is sent out to the startup during their
          on-boarding process
        </div>
      </div>
      <div className={classes.detailedQuestionnaire}>
        <div className={classes.questionnaireSections}>
          {_.map(questionnaireData, (section, index) => (
            <div key={index} className={classes.section}>
              <div className={classes.sectionTitle}>{section.section}</div>
              <div key={index} className={classes.sectionQuestions}>
                {renderQuestions(section)}{" "}
              </div>
            </div>
          ))}
        </div>
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
          />
          <Button
            name={"Initiate onboarding"}
            onClick={saveAndContinue}
            disabled={disableSave}
            variant={"solid"}
            customStyles={
              disableSave
                ? { pointer: "not-allowed" }
                : { backgroundColor: "#008F4ACF" }
            }
          />
        </div>
      </div>
    </div>
  );
};

export default DetailedQuestionnaire;
