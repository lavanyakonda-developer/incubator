import _ from 'lodash';
import classes from './StartupHomeView.module.css';
import { FaDownload } from 'react-icons/fa';
import { API } from '../../axios';

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

export const DocumentsContainer = ({ documents, skipDetails = false }) => {
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
          </div>
        </div>
      ))}
    </div>
  );
};

export const renderAnswerBox = ({ startupInfo, question, metaData }) => {
  switch (question.answer_type) {
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
  }
};

export const renderQuestionBox = ({ startupInfo, question, metaData }) => {
  if (_.isEmpty(question) || _.isEmpty(question?.question)) return;

  return (
    <div className={classes.questionContainer}>
      <div className={classes.question}>{`${question.question} :`}</div>
      <div>{renderAnswerBox({ startupInfo, question, metaData })}</div>
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
          question: _.find(startupInfo?.questionnaire, {
            uid: question.uid,
          }),
          metaData: question?.meta_data,
        })}
        {question.subQuestions &&
          _.map(question.subQuestions, (item) => {
            return (
              <>
                {renderQuestionBox({
                  startupInfo,
                  question: _.find(startupInfo?.questionnaire, {
                    uid: item.uid,
                  }),
                  metaData: question?.meta_data,
                })}
              </>
            );
          })}
      </div>
    );
  });
};
