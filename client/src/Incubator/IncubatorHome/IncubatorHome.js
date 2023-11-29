import React, { useState, useEffect } from "react";
import classes from "./IncubatorHome.module.css"; // Import your CSS file
import _ from "lodash";
import { makeRequest, API } from "../../axios";
import { Button } from "../../CommonComponents";
import { logout } from "../../auth/helper";
import { useNavigate, useParams } from "react-router-dom";
import { updateStartupIdsOfIncubator } from "../../auth/helper.js";
import moment from "moment";

const tabs = [
  { label: "Home Dashboard", key: "homeDashboard" },
  // { label: 'Document Repository', key: 'documentRepository' },
  // { label: 'Onboarding Hub', key: 'onboardingHub' },
  // { label: 'Communication Tab', key: 'communicationTab' },
];

const buttonStyle = {
  height: 40,
  fontSize: 16,
};

const IncubatorHome = (props) => {
  const { incubator_id: incubatorId } = useParams();
  const [selectedTab, setSelectedTab] = useState("homeDashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [startups, setStartups] = useState([]);

  const [incubatorDetails, setIncubatorDetails] = useState({
    id: incubatorId,
    name: "",
    logo: "",
  });

  const navigate = useNavigate();

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

          const startupIds = _.map(data.startups, (item) => item.id);
          updateStartupIdsOfIncubator({ startupIds });
        } else {
          console.error("Error fetching data:", response.statusText);
        }
      } catch (error) {
        navigate("/");
        console.error("Error fetching data:", error);
      }
    };

    if (incubatorId) {
      fetchData();
    }
  }, [incubatorId]);

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

  const getStatus = ({ status, isDraft }) => {
    if (isDraft) {
      return "Drafted by you";
    } else {
      switch (status) {
        case "PENDING":
          return "Pending from startup";
        case "SUBMITTED":
          return "Waiting for Approval";
        case "APPROVED":
          return "Approved";
        case "REJECTED":
          return "Rejected by you";
      }
    }
  };

  const handleStartupClick = ({ status, isDraft, id }) => {
    if (isDraft) {
      navigate(`/incubator/${incubatorId}/home/register-startup/${id}`);
      return;
    } else {
      switch (status) {
        case "PENDING":
        case "SUBMITTED":
        case "APPROVED":
        case "REJECTED":
          navigate(`/incubator/${incubatorId}/home/startup-home/${id}`);

        default:
          return;
      }
    }
  };

  const getRightComponent = () => {
    switch (selectedTab) {
      case "homeDashboard":
        return (
          <div className={classes.rightColumn}>
            <div className={classes.tableContainer}>
              <div className={classes.tableHeader}>
                <input
                  type="text"
                  className={classes.searchBar}
                  placeholder="Search startups"
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <Button
                  shouldRedirect={true}
                  redirectUrl={`/incubator/${incubatorId}/home/register-startup`}
                  name={"Add Startup"}
                  customStyles={buttonStyle}
                />
              </div>
              <div className={classes.startupsCount}>{`${_.size(
                startups
              )} Startups`}</div>
              <div className={classes.startupTableContainer}>
                <table className={classes.startupTable}>
                  <thead>
                    <tr key={"header"}>
                      <th>Startup Name</th>
                      <th>Sector</th>
                      <th style={{ width: 200 }}>Stage</th>
                      <th>Status</th>
                      <th>Date of joining</th>
                    </tr>
                  </thead>
                  <tbody>
                    {_.map(filteredStartups, (startup) => {
                      const startupLogoName = _.last(
                        _.split(startup.logo, "/")
                      );
                      // Set the href attribute to the document's URL
                      const startupLogo = !_.isEmpty(startupLogoName)
                        ? `${API}/uploads/${startupLogoName}`
                        : "";
                      return (
                        <tr key={startup.id}>
                          <td>
                            <div className={classes.startupNameLogo}>
                              <div className={classes.imageContainer}>
                                <img
                                  className={classes.startupLogo}
                                  src={startupLogo}
                                />
                              </div>
                              <div
                                className={classes.startupName}
                                onClick={() =>
                                  handleStartupClick({
                                    status: startup.status,
                                    isDraft: startup.is_draft,
                                    id: startup.id,
                                  })
                                }
                              >
                                {startup.name}
                              </div>
                            </div>
                          </td>
                          <td>{startup.industry}</td>
                          <td>{startup.stateOfStartup}</td>
                          <td>
                            {getStatus({
                              status: startup.status,
                              isDraft: startup.is_draft,
                            })}
                          </td>
                          <td>
                            {moment(startup.created_at).format("Do MMM YYYY")}
                          </td>
                        </tr>
                      );
                    })}
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

  const userLogout = () => {
    logout();
    navigate("/home-page");
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
                  selectedTab === tab.key ? classes.activeTab : ""
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
            name={"Logout"}
            onClick={userLogout}
            customStyles={{
              width: 100,
              fontSize: 16,
              color: "black",
              justifyContent: "left",
              backgroundColor: "#f0f0f0",
            }}
          />
        </div>
      </div>
      {getRightComponent()}
    </div>
  );
};

export default IncubatorHome;
