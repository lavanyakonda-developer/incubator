import React, { useState, useEffect } from 'react';
import { logout } from '../../../auth/helper';
import classes from './StartupView.module.css';
import { makeRequest, API } from '../../../axios';
import _ from 'lodash';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../CommonComponents';

const tabs = [
  //{ label: 'Home', key: 'homeDashboard' },
  {
    label: 'Startup Profile',
    key: 'startupProfile',
    subTabs: [
      { key: 'companyDetails', label: 'Company Details' },
      { key: 'founderDetails', label: 'Founder Details' },
      { key: 'pitchAndDigital', label: 'Elevator Pitch and Digital Presence' },
      { key: 'characteristics', label: 'Characteristics' },
      { key: 'funding', label: 'Funding' },
      { key: 'others', label: 'Others' },
    ],
  },
  {
    label: 'Documents',
    key: 'documentRepository',
    subTabs: [
      { key: 'onboarding', label: 'Onboarding documents' },
      { key: 'supplementary', label: 'Supplementary documents' },
    ],
  },
  {
    label: 'Reporting Tab',
    key: 'reportingTab',
    subTabs: [
      { key: 'businessUpdates ', label: 'Business updates ' },
      { key: 'kpi', label: 'Key performance indicators' },
      { key: 'mie', label: 'Mandatory Information exchange' },
    ],
  },
  //   { label: 'Communication Tab', key: 'communicationTab' },
];

const StartupView = () => {
  const { startup_id } = useParams();
  const [selectedTab, setSelectedTab] = useState('companyDetails');
  const [startupInfo, setStartupInfo] = useState({});
  const navigate = useNavigate();

  const { basicDetails } = startupInfo || {};

  const handleTabClick = (tabName) => {
    const tab = _.find(tabs, { key: tabName });
    if (!_.isEmpty(tab?.subTabs)) {
      if (_.some(tab?.subTabs, { key: selectedTab })) {
        return;
      }
      setSelectedTab(_.first(tab?.subTabs)?.key);
    } else {
      setSelectedTab(tabName);
    }
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

  const getRightComponent = () => {
    switch (selectedTab) {
      case 'startupProfile':
      case 'documentRepository':
      case 'reportingTab':
      default:
        return null;
    }
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
            if (
              (!_.isEmpty(tab.subTabs) && selectedTab === tab.key) ||
              _.some(tab.subTabs, { key: selectedTab })
            ) {
              return (
                <>
                  <div
                    className={`${classes.tab} ${
                      selectedTab === tab.key ? classes.activeTab : ''
                    }`}
                    onClick={() => handleTabClick(tab.key)}
                    key={tab.key}
                  >
                    {tab.label}
                  </div>
                  {_.map(tab.subTabs, (task) => {
                    return (
                      <div
                        className={`${classes.tab} ${
                          selectedTab === task.key ? classes.activeTab : ''
                        }`}
                        style={{ paddingLeft: 24 }}
                        onClick={() => handleTabClick(task.key)}
                        key={task.key}
                      >
                        {task.label}
                      </div>
                    );
                  })}
                </>
              );
            }
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
      <div className={classes.rightContainer}>{getRightComponent()}</div>
    </div>
  );
};

export default StartupView;
