import React, { useState, useEffect } from 'react';
import classes from './IncubatorHome.module.css'; // Import your CSS file
import _ from 'lodash';
import { makeRequest } from '../../axios';
import { Button } from '../../CommonComponents';

const tabs = [
  { label: 'Home Dashboard', key: 'homeDashboard' },
  { label: 'Document Repository', key: 'documentRepository' },
  { label: 'Onboarding Hub', key: 'onboardingHub' },
  { label: 'Communication Tab', key: 'communicationTab' },
];

const buttonStyle = {
  height: 40,
  fontSize: 16,
};

const IncubatorHome = (props) => {
  const { incubatorId } = props;
  const [selectedTab, setSelectedTab] = useState('homeDashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [startups, setStartups] = useState([]);
  const [draftedStartups, setDraftStartups] = useState(null);

  const [incubatorDetails, setIncubatorDetails] = useState({
    id: incubatorId,
    name: '',
    logo: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await makeRequest.get(
          `incubator/incubator-home?incubator_id=${incubatorId}`
        );

        if (response.status === 200) {
          const data = response.data;

          setIncubatorDetails(data.incubator);
          setStartups(data.startups);
          setDraftStartups(data.draftedStartups);
        } else {
          console.error('Error fetching data:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleTabClick = (tabName) => {
    setSelectedTab(tabName);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredStartups = _.filter(startups, (item) =>
    !_.isEmpty(searchTerm)
      ? _.includes(_.lowerCase(item.name), _.lowerCase(searchTerm))
      : true
  );

  const getRightComponent = () => {
    switch (selectedTab) {
      case 'homeDashboard':
        return (
          <div className={classes.rightColumn}>
            <div className={classes.tableContainer}>
              <div className={classes.tableHeader}>
                <input
                  type='text'
                  className={classes.searchBar}
                  placeholder='Search startups'
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <Button
                  shouldRedirect={true}
                  redirectUrl={
                    _.isEmpty(draftedStartups)
                      ? `/incubator/${incubatorId}/home/register-startup`
                      : `/incubator/${incubatorId}/home/register-startup/${_.get(
                          draftedStartups,
                          '0.basicDetails.id'
                        )}`
                  }
                  name={
                    _.isEmpty(draftedStartups)
                      ? 'Add Startup'
                      : 'Resume startup'
                  }
                  customStyles={buttonStyle}
                />
              </div>
              <div className={classes.startupsCount}>{`${_.size(
                startups
              )} Startups`}</div>
              <div className={classes.startupTableContainer}>
                <table className={classes.startupTable}>
                  <thead>
                    <tr key={'header'}>
                      <th>Startup Name</th>
                      <th>Sector</th>
                    </tr>
                  </thead>
                  <tbody>
                    {_.map(filteredStartups, (startup) => (
                      <tr key={startup.id}>
                        <td>
                          <div className={classes.startupNameLogo}>
                            <img
                              className={classes.startupLogo}
                              src={startup.logo}
                            />
                            <div>{startup.name}</div>
                          </div>
                        </td>
                        <td>{startup.industry}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      default:
        return <div className={classes.rightColumn} />;
    }
  };

  return (
    <div className={classes.incubatorHome}>
      <div className={classes.leftColumn}>
        <div className={classes.incubatorDetails}>
          <img className={classes.incubatorLogo} src={incubatorDetails.logo} />
          <div className={classes.incubatorName}>{incubatorDetails.name}</div>
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
      {getRightComponent()}
    </div>
  );
};

export default IncubatorHome;
