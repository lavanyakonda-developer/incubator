import _ from 'lodash';
import classes from './StartupHomeView.module.css';
import { FaDownload } from 'react-icons/fa';
import { API } from '../../axios';
import { Button } from '../../CommonComponents';

const placeholderDocImage =
  'https://d9-wret.s3.us-west-2.amazonaws.com/assets/palladium/production/s3fs-public/thumbnails/image/file.jpg';
const placeholderPdfImage =
  'https://d9-wret.s3.us-west-2.amazonaws.com/assets/palladium/production/s3fs-public/thumbnails/image/file.jpg';

export const handleDownload = (documentData) => {
  if (documentData && documentData.url) {
    // Create an anchor element
    const downloadLink = document.createElement('a');

    const fileName = _.last(_.split(documentData.url, '/'));
    // Set the href attribute to the document's URL

    downloadLink.href = `${API}/uploads/${fileName}`;

    // Specify the download attribute to suggest a filename (optional)
    downloadLink.setAttribute('download', documentData.name);
    // Set the target attribute to "_blank" to open the link in a new tab/window
    downloadLink.setAttribute('target', '_blank');

    // Simulate a click on the anchor element to initiate the download
    downloadLink.click();
  } else {
    console.error('Invalid document data or missing file.');
  }
};

export const DocumentsContainer = ({
  documents,
  skipDetails = false,
  showApproveButton = false,
  onClickApprove,
}) => {
  if (!documents || _.isEmpty(documents)) {
    return 'No documents uploaded';
  }
  return (
    <div className={classes.previewDocumentsContainer}>
      {_.map(documents, (document, index) => (
        <div className={classes.documentCard} key={index}>
          <div className={classes.cardPreview}>
            <img
              src={
                document?.format === 'application/pdf'
                  ? placeholderPdfImage
                  : placeholderDocImage
              }
              alt={`Document ${index + 1}`}
              width='40'
              height='60'
            />
          </div>
          <div className={classes.cardActions}>
            <FaDownload
              className={classes.icon}
              onClick={() => handleDownload(document)}
            />
          </div>

          <div className={classes.cardDetails}>
            <div>
              <strong>Name:</strong> {document?.name}
            </div>
            {!skipDetails && (
              <div>
                <strong>Size:</strong> {document?.size}
              </div>
            )}
            {!skipDetails && (
              <div>
                <strong>Signature Required:</strong>{' '}
                {document?.isSignatureRequired ? 'Yes' : 'No'}
              </div>
            )}
            {showApproveButton && (
              <Button
                name={'Approve'}
                onClick={() => onClickApprove(document?.id)}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export const renderAnswerBox = ({ startupInfo, question, metaData }) => {
  switch (question?.answer_type) {
    case 'number':
    case 'date':
    case 'text':
      return (
        _.find(startupInfo?.questionnaire, {
          uid: question.uid,
        })?.answer || 'Not answered'
      );

    case 'startup_logo':
    case 'video':
    case 'files':
    case 'file':
    case 'images': {
      return (
        <DocumentsContainer documents={question?.answer} skipDetails={true} />
      );
    }

    case 'dropdown':
      return _.get(
        _.find(metaData, {
          key: _.find(startupInfo?.questionnaire, {
            uid: question.uid,
          })?.answer,
        }),
        'label',
        'Not answered'
      );

    case 'basicInfoField':
      return _.get(
        startupInfo?.basicDetails,
        `${question.field_name}`,
        'Not answered'
      );

    case 'founderDetails':
      return (
        <>
          <div className={classes.questionContainer}>
            <div className={classes.question}>{`Founder Name:`}</div>
            <span>{_.get(startupInfo, 'basicDetails.founderName')}</span>
          </div>
          <div className={classes.questionContainer}>
            <div className={classes.question}>{`Founder Role:`}</div>
            <span>{_.get(startupInfo, 'basicDetails.founderRole')}</span>
          </div>
          <div className={classes.questionContainer}>
            <div className={classes.question}>{`Founder Email:`}</div>
            <span>{_.get(startupInfo, 'basicDetails.founderEmail')}</span>
          </div>
          <div className={classes.questionContainer}>
            <div className={classes.question}>{`Founder Mobile:`}</div>
            <span>{_.get(startupInfo, 'basicDetails.founderMobile')}</span>
          </div>
          {_.map(
            _.get(startupInfo, 'basicDetails.coFounders'),
            (founder, index) => {
              return (
                <>
                  <div className={classes.questionContainer}>
                    <div className={classes.question}>{`Co-Founder(${
                      index + 1
                    }) Name:`}</div>
                    <span>{_.get(founder, 'name')}</span>
                  </div>
                  <div className={classes.questionContainer}>
                    <div className={classes.question}>{`Co-Founder(${
                      index + 1
                    }) Role:`}</div>
                    <span>{_.get(founder, 'designation')}</span>
                  </div>
                  <div className={classes.questionContainer}>
                    <div className={classes.question}>{`Co-Founder(${
                      index + 1
                    }) Email:`}</div>
                    <span>{_.get(founder, 'email')}</span>
                  </div>
                  <div className={classes.questionContainer}>
                    <div className={classes.question}>{`Co-Founder(${
                      index + 1
                    }) Mobile:`}</div>
                    <span>{_.get(founder, 'phone_number')}</span>
                  </div>
                </>
              );
            }
          )}
        </>
      );
  }
};

export const renderQuestionBox = ({ startupInfo, question }) => {
  const updatedQuestion = {
    ..._.find(startupInfo?.questionnaire, {
      uid: question?.uid,
    }),
    ...question,
    question: _.isEmpty(question?.question)
      ? _.find(startupInfo?.questionnaire, {
          uid: question?.uid,
        })?.question
      : question?.question,
  };

  if (_.isEmpty(updatedQuestion) || _.isEmpty(updatedQuestion?.question)) {
    return;
  }

  return (
    <div className={classes.questionContainer}>
      <div className={classes.question}>{`${updatedQuestion?.question} :`}</div>
      <div>
        {renderAnswerBox({
          startupInfo,
          question: updatedQuestion,
          metaData: updatedQuestion?.meta_data,
        })}
      </div>
    </div>
  );
};

export const renderQuestions = ({ startupInfo, section }) => {
  return _.map(section.questions, (question, index) => {
    return (
      <div
        key={question.uid}
        className={classes.questionBox}
        style={section.style}
      >
        {renderQuestionBox({
          startupInfo,
          question,
        })}
        {question.subQuestions &&
          _.map(question.subQuestions, (item) => {
            return (
              <>
                {renderQuestionBox({
                  startupInfo,
                  question: item,
                })}
              </>
            );
          })}
      </div>
    );
  });
};
