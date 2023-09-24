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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await makeRequest.get(
          `startup/startup-details?startup_id=${startup_id}`
        );

        if (response.status === 200) {
          const data = response.data;

          setStartupInfo(data);
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

  // Function to handle saving the data in the current tab
  const handleSave = async () => {
    console.log('Here clicked handleSave');
    // const data = getModifiedData(false);

    // try {
    //   const response = await makeRequest.post('api/auth/startup-register', {
    //     ...data,
    //   });

    //   if (response.status === 200) {
    //     const data = response.data;
    //   } else {
    //     console.error('Error fetching data:', response.statusText);
    //   }
    // } catch (error) {
    //   console.error('Error fetching data:', error);
    // }

    // navigate('/');
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
    !startupInfo?.basicDetails?.dpiitNumber;

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
