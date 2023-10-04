// RegisterStartup.js

import React, { useState, useEffect } from 'react';
import classes from './RegisterStartup..module.css'; // Import your CSS file
import BasicDetails from './BasicDetails';
import ReferralCode from './ReferralCode';
import DocumentUpload from './DocumentUpload';
import DetailedQuestionnaire from './DetailedQuestionnaire';
import { useNavigate, useParams } from 'react-router-dom';
import _ from 'lodash';
import { questions } from './helper';
import { makeRequest } from '../../axios';
import { Button } from '../../CommonComponents';

const tabs = [
  { label: 'Basic Info', key: 'basicDetails' },
  { label: 'Referral Link', key: 'referralLink' },
  { label: 'Document Upload', key: 'documentUpload' },
  { label: 'Detailed Questionnaire', key: 'questionnaire' },
];

const generateRandomCode = (length) => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    code += charset.charAt(randomIndex);
  }

  return code;
};

const RegisterStartup = (props) => {
  const { incubatorId } = props;

  const [draftStartup, setDraftStartup] = useState(null);

  const getStartupInfo = (data) => {
    const startup = draftStartup ? draftStartup : data;

    if (!_.isEmpty(startup)) {
      const existingQuestions = startup.questionnaire;
      return {
        basicDetails: {
          ...startup.basicDetails,
        },
        documentUpload: {
          uploadedDocuments: startup.documentUpload.uploadedDocuments,
          requestedDocuments: startup.documentUpload.requestedDocuments.concat(
            Array(5 - startup.documentUpload.requestedDocuments.length).fill('')
          ),
        },
        questionnaire: _.map(questions, (section) => {
          const updatedSection = {
            ...section,
            questions: _.map(section.questions, (item) => {
              if (item.subQuestions) {
                const updatedSubQuestions = _.map(
                  item.subQuestions,
                  (subItem) => {
                    return {
                      ...subItem,
                      question: _.get(
                        _.find(existingQuestions, { uid: subItem.uid }),
                        'question',
                        subItem.question
                      ),
                    };
                  }
                );
                return {
                  ...item,
                  subQuestions: updatedSubQuestions,
                };
              } else {
                return {
                  ...item,
                  question: _.get(
                    _.find(existingQuestions, { uid: item.uid }),
                    'question',
                    item.question
                  ),
                };
              }
            }),
          };
          return updatedSection;
        }),
      };
    } else {
      return {
        basicDetails: {
          id: '',
          name: '',
          dpiitNumber: '',
          industrySegment: '',
          founderName: '',
          founderRole: '',
          founderEmail: '',
          founderMobile: '',
          coFounders: [],
          referralCode: generateRandomCode(10),
        },
        documentUpload: {
          uploadedDocuments: [],
          requestedDocuments: ['', '', '', '', ''],
        },
        questionnaire: questions,
      };
    }
  };

  const [startupInfo, setStartupInfo] = useState(getStartupInfo());

  const { startup_id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await makeRequest.get(
          `startup/startup-details?startup_id=${startup_id}`
        );

        if (response.status === 200) {
          const data = response.data;

          setDraftStartup(data);

          setStartupInfo(getStartupInfo(data));
        } else {
          console.error('Error fetching data:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (startup_id) {
      fetchData();
    }
  }, []);

  const [selectedTab, setSelectedTab] = useState('basicDetails'); // Set the initial selected tab

  const navigate = useNavigate();

  // Function to switch tabs
  const handleTabClick = (tabKey) => {
    setSelectedTab(tabKey);
  };

  const getModifiedData = (isDraft = false) => {
    const coFounders = _.filter(
      startupInfo.basicDetails.coFounders,
      (founder) => {
        return (
          !_.isEmpty(founder.name) &&
          !_.isEmpty(founder.designation) &&
          !_.isEmpty(founder.phone_number) &&
          !_.isEmpty(founder.email)
        );
      }
    );

    const startupDetails = {
      id: startupInfo.basicDetails.id,
      name: startupInfo.basicDetails.name || '',
      dpiit_number: startupInfo.basicDetails.dpiitNumber || '',
      industry: startupInfo.basicDetails.industrySegment || '',
      referral_code:
        startupInfo.basicDetails.referralCode || generateRandomCode(10),
      incubator_id: incubatorId,
      is_draft: isDraft,
      founders: _.concat(
        [
          {
            name: startupInfo.basicDetails.founderName,
            email: startupInfo.basicDetails.founderEmail,
            phone_number: startupInfo.basicDetails.founderMobile,
            designation: startupInfo.basicDetails.founderRole,
          },
        ],
        coFounders
      ),
      uploadedDocuments: startupInfo.documentUpload.uploadedDocuments,
      requestedDocuments: _.filter(
        startupInfo.documentUpload.requestedDocuments,
        (item) => !_.isEmpty(item)
      ),
      questionnaire: startupInfo.questionnaire,
    };

    return startupDetails;
  };

  // Function to handle saving the data in the current tab
  const handleSave = async () => {
    const data = getModifiedData(false);

   
    try {
      const response = await makeRequest.post('api/auth/startup-register', {
        ...data,
      });

      if (response.status === 200) {
        const data = response.data;
      } else {
        console.error('Error fetching data:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }

    navigate('/');
  };

  // Function to handle "Draft and Exit" button click
  const handleDraftExit = async () => {
    const data = getModifiedData(true);

    try {
      const response = await makeRequest.post(`api/auth/startup-register`, {
        ...data,
      });

      if (response.status === 200) {
        const data = response.data;
      } else {
        console.error('Error fetching data:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }

    navigate('/');
  };

  // Function to handle "Cancel" button click
  const handleCancel = () => {
    navigate('/');
  };

  // Function to handle "Next" button click
  const handleNext = () => {
    const index = _.findIndex(tabs, { key: selectedTab });

    if (index > -1 && index < _.size(tabs) - 1) {
      handleTabClick(tabs[index + 1]?.key);
    }
  };

  const handleBack = () => {
    const index = _.findIndex(tabs, { key: selectedTab });

    if (index - 1 > -1 && index - 1 < _.size(tabs)) {
      handleTabClick(tabs[index - 1]?.key);
    }
  };

  const disableSave =
    _.isEmpty(startupInfo.basicDetails.name) ||
    !startupInfo.basicDetails.dpiitNumber ||
    _.isEmpty(startupInfo.basicDetails.founderName) ||
    _.isEmpty(startupInfo.basicDetails.founderRole) ||
    _.isEmpty(startupInfo.basicDetails.founderEmail) ||
    _.isEmpty(startupInfo.basicDetails.founderMobile) ||
    (!_.isEmpty(startupInfo.basicDetails.coFounders) &&
      _.some(startupInfo.basicDetails.coFounders, (item) => {
        return (
          _.isEmpty(item.name) ||
          _.isEmpty(item.designation) ||
          _.isEmpty(item.phone_number) ||
          _.isEmpty(item.email)
        );
      }));

  // Conditionally render the selected tab
  const renderTabContent = () => {
    switch (selectedTab) {
      case 'basicDetails':
        return (
          <BasicDetails
            startupInfo={startupInfo}
            onDraftExit={handleDraftExit}
            onCancel={handleCancel}
            onNext={handleNext}
            setStartupInfo={setStartupInfo}
            disableDraft={disableSave}
          />
        );
      case 'referralLink':
        return (
          <ReferralCode
            startupInfo={startupInfo}
            onDraftExit={handleDraftExit}
            onCancel={handleCancel}
            onNext={handleNext}
            onBack={handleBack}
            disableDraft={disableSave}
          />
        );
      case 'documentUpload':
        return (
          <DocumentUpload
            uploadedDocuments={startupInfo.documentUpload.uploadedDocuments}
            requestedDocuments={startupInfo.documentUpload.requestedDocuments}
            setStartupInfo={setStartupInfo}
            startupInfo={startupInfo}
            onDraftExit={handleDraftExit}
            onCancel={handleCancel}
            onNext={handleNext}
            onBack={handleBack}
            disableDraft={disableSave}
          />
        );
      case 'questionnaire':
        return (
          <DetailedQuestionnaire
            questionnaireData={startupInfo.questionnaire}
            onDraftExit={handleDraftExit}
            onCancel={handleCancel}
            onNext={handleNext}
            onSave={handleSave}
            setStartupInfo={setStartupInfo}
            startupInfo={startupInfo}
            disableSave={disableSave}
            disableDraft={disableSave}
          />
        );
    }
  };

  return (
    <div className={classes.startupRegistrationTabs}>
      <div className={classes.tabContainer}>
        <Button
          name={'< Back'}
          onClick={() => {
            navigate('/');
          }}
          customStyles={{
            width: 100,
            fontSize: 16,
            color: 'black',
            justifyContent: 'left',
            backgroundColor: '#f0f0f0',
          }}
        />
        <div className={classes.tabMenu}>
          {tabs.map((tab) => (
            <div
              key={tab.key}
              className={`${classes.tab} ${
                selectedTab === tab.key ? classes.activeTab : ''
              }`}
              onClick={() => handleTabClick(tab.key)}
            >
              {tab.label}
            </div>
          ))}
        </div>
      </div>

      <div className={classes.rightContainer}>{renderTabContent()}</div>
    </div>
  );
};

export default RegisterStartup;
