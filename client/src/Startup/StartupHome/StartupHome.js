import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import _ from 'lodash';
import { Button } from '../../CommonComponents';
import classes from './StartupHome.module.css';
import { makeRequest, API } from '../../axios';
import { FaCheckCircle } from 'react-icons/fa';

import StartupView from './StartupView';

const StartupHome = () => {
  const { startup_id } = useParams();

  const [basicDetails, setBasicDetails] = useState('PENDING');
  const navigate = useNavigate();

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
        <span className={classes.text}>
          {
            'Hello Team You have successfully submitted the details to the Incubator, We are waiting for their approval.'
          }
        </span>
      </div>
    );
  };

  const RejectedBox = () => {
    return (
      <div className={classes.rejectBox}>
        <span className={classes.text}>
          {`Hello Team Your details have been rejected by the Incubator with the following message: ${_.get(
            basicDetails,
            'reject_message',
            ''
          )}`}
        </span>
        <Button
          shouldRedirect={true}
          redirectUrl={`/startup/${startup_id}/startup-onboarding`}
          name={'Re-Submit'}
        />
      </div>
    );
  };

  const getContainer = () => {
    switch (basicDetails?.status) {
      case 'SUBMITTED':
        return <WaitingForApprovalComponent />;
      case 'REJECTED':
        return <RejectedBox />;
      default:
        return <StartupView />;
    }
  };

  return <div className={classes.container}>{getContainer()}</div>;
};

export default StartupHome;
