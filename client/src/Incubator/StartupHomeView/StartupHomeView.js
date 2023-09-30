import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { makeRequest, API } from '../../axios';
import _ from 'lodash';
import { Button } from '../../CommonComponents';
import classes from './StartupHomeView.module.css';
import { FaDownload } from 'react-icons/fa';
import { questions } from '../RegisterStartup/helper.js';

// TODO : Placeholder image URLs for doc and pdf
const placeholderDocImage =
  'https://d9-wret.s3.us-west-2.amazonaws.com/assets/palladium/production/s3fs-public/thumbnails/image/file.jpg';
const placeholderPdfImage =
  'https://d9-wret.s3.us-west-2.amazonaws.com/assets/palladium/production/s3fs-public/thumbnails/image/file.jpg';

const tabs = [
  //{ label: 'Home Dashboard', key: 'homeDashboard' },
  // { label: 'Document Repository', key: 'documentRepository' },
  // { label: 'Onboarding Hub', key: 'onboardingHub' },
  // { label: 'Communication Tab', key: 'communicationTab' },
];

const StartupHomeView = () => {
  const { startup_id } = useParams();

  const [selectedTab, setSelectedTab] = useState('');
  const [basicDetails, setBasicDetails] = useState('PENDING');
  const [startupInfo, setStartupInfo] = useState({});
  const navigate = useNavigate();

  const handleTabClick = (tabName) => {
    setSelectedTab(tabName);

    //navigate("/")
  };

  const handleStatusChange = (status) => {};

  const handleReject = () => {
    //TODO : Show the modal, and confirm reject there, with text
    // handleStatusChange('REJECTED')
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const statusResponse = await makeRequest.get(
          `startup/startup-status?startup_id=${startup_id}`
        );

        const status = statusResponse?.data?.status;

        setBasicDetails(statusResponse?.data);

        if (!_.includes(['PENDING', 'REJECTED'], status)) {
          const response = await makeRequest.get(
            `startup/startup-details?startup_id=${startup_id}`
          );

          if (response.status === 200) {
            const data = response.data;

            setStartupInfo(data);
          } else {
            console.error('Error fetching data:', response.statusText);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (startup_id) {
      fetchData();
    }
  }, [startup_id]);

  const PendingComponent = () => {
    return (
      <div className={classes.waitingContainer}>
        {`You have initiated the onboarding for ${_.get(
          basicDetails,
          'name',
          ''
        )} but the founders haven't registered yet`}
        <Button shouldRedirect={true} redirectUrl={`/`} name={'Go Home'} />
      </div>
    );
  };

  const RejectedComponent = () => {
    return (
      <div className={classes.rejectBox}>
        <span className={classes.text}>
          {`You have rejected the startup onboarding with the following message: ${_.get(
            basicDetails,
            'reject_message',
            ''
          )}`}
        </span>
        <Button shouldRedirect={true} redirectUrl={`/`} name={'Go Home'} />
      </div>
    );
  };

  const handleDownload = (documentData) => {
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

  const DocumentsContainer = ({ documents, skipDetails = false }) => {
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
            {!skipDetails && (
              <div className={classes.cardDetails}>
                <div>
                  <strong>Name:</strong> {document?.name}
                </div>
                <div>
                  <strong>Size:</strong> {document?.size}
                </div>
                <div>
                  <strong>Signature Required:</strong>{' '}
                  {document?.isSignatureRequired ? 'Yes' : 'No'}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderAnswerBox = (question, metaData) => {
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

  const renderQuestionBox = (question, metaData) => {
    if (_.isEmpty(question) || _.isEmpty(question?.question)) return;

    return (
      <div className={classes.questionContainer}>
        <div className={classes.questionText}>{`${question.question} :`}</div>
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
            _.find(startupInfo?.questionnaire, {
              uid: question.uid,
            }),
            question?.meta_data
          )}
          {question.subQuestions &&
            _.map(question.subQuestions, (item) => {
              return (
                <>
                  {renderQuestionBox(
                    _.find(startupInfo?.questionnaire, {
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

  const ReviewStartup = () => {
    return (
      <div className={classes.reviewContainer}>
        <div className={classes.reviewBox}>
          <div className={classes.reviewText}>
            {`${_.get(
              basicDetails,
              'name',
              ''
            )} has submitted onboarding details. Please review and approve for incubatee list`}
          </div>
          <div className={classes.buttonContainer}>
            <Button shouldRedirect={true} redirectUrl={`/`} name={'Go Home'} />
            <Button
              onClick={handleReject}
              name={'Reject'}
              customStyles={{ backgroundColor: '#ff6d6d' }}
            />
            <Button
              onClick={() => handleStatusChange('APPROVED')}
              name={'Approve'}
            />
          </div>
        </div>
        <div className={classes.innerContainer}>
          <h2>Details Submitted</h2>
          <div className={classes.basicDetails}>
            <div className={classes.detailsContainer}>
              <div className={classes.info}>
                <label>Startup Name:</label>
                <span className={classes.answer}>
                  {_.get(startupInfo, 'basicDetails.name', '')}
                </span>
              </div>
              <div className={classes.info}>
                <label>Dpiit Number:</label>
                <span className={classes.answer}>
                  {_.get(startupInfo, 'basicDetails.dpiitNumber', '')}
                </span>
              </div>
              <div className={classes.info}>
                <label>Industry Segment:</label>
                <span className={classes.answer}>
                  {_.get(startupInfo, 'basicDetails.industrySegment', '')}
                </span>
              </div>
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
                  <h3>{section.section}</h3>
                  {renderQuestions(section)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const RightComponent = () => {};

  const getContainer = () => {
    switch (basicDetails?.status) {
      case 'PENDING':
        return <PendingComponent />;
      case 'REJECTED':
        return <RejectedComponent />;
      default:
      case 'SUBMITTED':
        return <ReviewStartup />;
      case 'APPROVED':
        return <RightComponent />;
    }
  };

  return <div className={classes.container}>{getContainer()}</div>;
};

export default StartupHomeView;
