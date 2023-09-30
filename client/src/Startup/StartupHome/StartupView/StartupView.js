import React, { useState, useEffect } from 'react';
import { logout } from '../../../auth/helper';
import classes from './StartupView.module.css';
import { makeRequest, API } from '../../../axios';
import _ from 'lodash';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../CommonComponents';

const tabs = [
  //{ label: 'Home Dashboard', key: 'homeDashboard' },
  // { label: 'Document Repository', key: 'documentRepository' },
  // { label: 'Onboarding Hub', key: 'onboardingHub' },
  // { label: 'Communication Tab', key: 'communicationTab' },
];

const StartupView = () => {
  const { startup_id } = useParams();
  const [selectedTab, setSelectedTab] = useState('');
  const [startupInfo, setStartupInfo] = useState({});
  const navigate = useNavigate();

  const { basicDetails } = startupInfo || {};

  const handleTabClick = (tabName) => {
    setSelectedTab(tabName);
  };

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

  const startupLogoName = _.last(_.split(_.get(basicDetails, 'logo', ''), '/'));
  // Set the href attribute to the document's URL
  const startupLogo = !_.isEmpty(startupLogoName)
    ? `${API}/uploads/${startupLogoName}`
    : '';

  const userLogout = () => {
    logout();
    navigate('/home-page');
  };

  return (
    <div className={classes.container}>
      <div className={classes.leftContainer}>
        <div className={classes.startupDetails}>
          <img className={classes.logo} src={startupLogo} />
          <div className={classes.name}>{_.get(basicDetails, 'name', '')}</div>
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
        <div className={classes.logout}>
          <Button
            name={'Logout'}
            onClick={userLogout}
            customStyles={{
              width: 100,
              fontSize: 16,
              color: 'black',
              justifyContent: 'left',
              backgroundColor: '#f0f0f0',
            }}
          />
        </div>
      </div>
      <div className={classes.rightContainer}>{}</div>
    </div>
  );
};

export default StartupView;
