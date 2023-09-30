import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { makeRequest } from '../../axios';
import _ from 'lodash';
import { Button } from '../../CommonComponents';
import classes from './StartupHomeView.module.css';

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

  const ReviewStartup = () => {};

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
