import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { makeRequest } from '../../axios';
import classes from './StartupOnboarding.module.css';
import BasicDetails from './BasicDetails';
import DocumentsUpload from './DocumentsUpload';
import Questionnaire from './Questionnaire';
import _ from 'lodash';

const tabs = [
  { label: 'Basic Details', key: 'basicDetails' },
  { label: 'Document Submission', key: 'documentUpload' },
  { label: 'Complete Questionnaire', key: 'questionnaire' },
];

const StartupOnboarding = () => {
  const { startup_id } = useParams();
  const [selectedTab, setSelectedTab] = useState('basicDetails');
  const [startupInfo, setStartupInfo] = useState('');

  const navigate = useNavigate();

  const getUpdatedData = (data) => {
    const requestedDocuments = data?.documentUpload?.requestedDocuments;
    return {
      ...data,
      documentUpload: {
        ...data?.documentUpload,
        updatedRequestedDocuments: _.map(requestedDocuments, (item) => {
          const existingDoc = _.find(
            data?.documentUpload?.requestedDocumentsList,
            { name: item }
          );

          return existingDoc
            ? existingDoc
            : {
                format: '',
                name: item,
                size: '',
                url: '',
              };
        }),
      },
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await makeRequest.get(
          `startup/startup-details?startup_id=${startup_id}`
        );

        if (response.status === 200) {
          const data = response.data;

          setStartupInfo(getUpdatedData(data));
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
  }, [startup_id]);

  // Function to switch tabs
  const handleTabClick = (tabKey) => {
    setSelectedTab(tabKey);
  };

  const getModifiedData = () => {
    const startupDetails = {
      startup_id: startupInfo.basicDetails.id,
      name: startupInfo.basicDetails.name || '',
      logo: startupInfo.basicDetails.logo || '',
      dpiit_number: startupInfo.basicDetails.dpiitNumber || '',
      industry: startupInfo.basicDetails.industrySegment || '',
      status: 'SUBMITTED',
      requestedDocuments: _.map(
        startupInfo.documentUpload.updatedRequestedDocuments,
        (item) => {
          return {
            document_name: item.name,
            document_url: item.url,
            document_size: item.size,
            document_format: item.format,
          };
        }
      ),
      questionnaire: startupInfo.questionnaire,
    };

    return startupDetails;
  };

  // Function to handle saving the data in the current tab
  const handleSave = async () => {
    console.log('Here clicked handleSave');
    const data = getModifiedData(false);

    try {
      const response = await makeRequest.post('startup/update-startup', {
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

    //navigate('/');
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
    _.isEmpty(startupInfo?.basicDetails?.name) ||
    !startupInfo?.basicDetails?.dpiitNumber ||
    _.some(startupInfo?.documentUpload?.updatedRequestedDocuments, (item) =>
      _.isEmpty(item.url)
    );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'basicDetails':
        return (
          <BasicDetails
            setStartupInfo={setStartupInfo}
            onNext={handleNext}
            startupInfo={startupInfo}
          />
        );
      case 'documentUpload':
        return (
          <DocumentsUpload
            startupInfo={startupInfo}
            setStartupInfo={setStartupInfo}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 'questionnaire':
        return (
          <Questionnaire
            startupInfo={startupInfo}
            setStartupInfo={setStartupInfo}
            onBack={handleBack}
            onSave={handleSave}
            disableSave={disableSave}
          />
        );
    }
  };

  return (
    <div className={classes.container}>
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

      <div className={classes.rightContainer}>{renderTabContent()}</div>
    </div>
  );
};

export default StartupOnboarding;
