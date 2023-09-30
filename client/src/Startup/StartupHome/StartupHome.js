import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import _ from 'lodash';
import { Button } from '../../CommonComponents';
import classes from './StartupHome.module.css';
import { makeRequest } from '../../axios';
import { FaCheckCircle } from 'react-icons/fa';

const tabs = [
  //{ label: 'Home Dashboard', key: 'homeDashboard' },
  // { label: 'Document Repository', key: 'documentRepository' },
  // { label: 'Onboarding Hub', key: 'onboardingHub' },
  // { label: 'Communication Tab', key: 'communicationTab' },
];

const StartupHome = () => {
  const { startup_id } = useParams();

  const [selectedTab, setSelectedTab] = useState('');
  const [basicDetails, setBasicDetails] = useState('PENDING');
  const [startupInfo, setStartupInfo] = useState({});
  const navigate = useNavigate();

  const handleTabClick = (tabName) => {
    setSelectedTab(tabName);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statusResponse = await makeRequest.get(
          `startup/startup-status?startup_id=${startup_id}`
        );

        const status = statusResponse?.data?.status;

        setBasicDetails(statusResponse?.data);

        if (status == 'PENDING') {
          navigate(`/startup/${startup_id}/startup-onboarding`);
        }

        if (!_.includes(['SUBMITTED', 'PENDING', 'REJECTED'], status)) {
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

  const WaitingForApprovalComponent = () => {
    return (
      <div className={classes.waitingContainer}>
        <FaCheckCircle style={{ height: 50, width: 50, color: 'green' }} />

        {
          'Hello Team You have successfully submitted the details to the Incubator, We are waiting for their approval.'
        }
      </div>
    );
  };

  const RejectedBox = () => {
    return (
      <div className={classes.rejectBox}>
        {`Hello Team Your details have been rejected by the Incubator with the following message: ${_.get(
          basicDetails,
          'reject_message',
          ''
        )}`}
        <Button
          shouldRedirect={true}
          redirectUrl={`/startup/${startup_id}/startup-onboarding`}
          name={'Re-Submit'}
        />
      </div>
    );
  };

  const RightComponent = () => {};

  const getRightContainer = () => {
    switch (basicDetails?.status) {
      case 'SUBMITTED':
        return <WaitingForApprovalComponent />;
      case 'REJECTED':
        return <RejectedBox />;
      default:
        return <RightComponent />;
    }
  };

  const showTabs = !_.includes(['SUBMITTED', 'REJECTED'], basicDetails?.status);

  return (
    <div className={classes.container}>
      {showTabs && (
        <div className={classes.leftContainer}>
          <div className={classes.startupDetails}>
            <img
              className={classes.logo}
              src={_.get(basicDetails, 'logo', '')}
            />
            <div className={classes.name}>
              {_.get(basicDetails, 'name', '')}
            </div>
          </div>

          <div className={classes.tabMenu}>
            {_.map(tabs, (tab) => {
              return (
                <div
                  className={`${classes.tab} ${
                    selectedTab === tab.key ? classes.activeTab : ''
                  }`}
                  onClick={() => handleTabClick(tab.key)}
                  key={tab.key}
                >
                  {tab.label}
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className={classes.rightContainer}>{getRightContainer()}</div>
    </div>
  );
};

export default StartupHome;
