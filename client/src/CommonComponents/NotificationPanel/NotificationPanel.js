import React, { useState, useEffect } from "react";
import classes from "./NotificationPanel.module.css";
import { FaTimesCircle } from "react-icons/fa";
import _ from "lodash";
import { API, makeRequest } from "../../axios";
import moment from "moment";

const NotificationPanel = (props) => {
  const {
    isOpen,
    onClose,
    notifications,
    email,
    fetchNotifications,
    onClickStartup,
  } = props;

  const [searchTerm, setSearchTerm] = useState("");

  const addLastTime = async () => {
    try {
      const response = await makeRequest.post(
        "notification/add-notification-time",
        {
          email,
          time: moment().format("YYYY-MM-DD HH:mm:ss"),
        }
      );

      if (response.status === 200) {
        const data = response.data;
      } else {
        console.error("Error fetching data:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    return async () => {
      await addLastTime();
      if (fetchNotifications) {
        fetchNotifications();
      }
    };
  }, []);

  const onNotificationClick = ({ redirect_type, startup_id }) => {
    switch (redirect_type) {
      case "GO_TO_STARTUP": {
        onClose();
        onClickStartup({ startup_id });
        break;
      }

      case "GO_TO_SUPPLEMENTARY_DOCS": {
        onClose();
        onClickStartup({ startup_id, tab: "supplementary" });
        break;
      }
      default:
        return null;
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredNotifications = _.filter(notifications, (notification) =>
    !_.isEmpty(searchTerm)
      ? _.includes(_.lowerCase(notification.text), _.lowerCase(searchTerm)) ||
        _.includes(_.lowerCase(notification.name), _.lowerCase(searchTerm))
      : true
  );

  return (
    <div className={classes.notificationPanelOpen}>
      <div className={classes.notificationContent}>
        <div className={classes.notificationContentHeader}>
          <h2 className={classes.activityHeading}>Activity Log</h2>
        </div>
        <div className={classes.searchBarContainer}>
          {" "}
          <input
            type="text"
            className={classes.searchBar}
            placeholder="Search"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        {_.map(filteredNotifications, (notification) => {
          const logoName = _.last(_.split(notification.logo, "/"));
          const logo = !_.isEmpty(logoName) ? `${API}/uploads/${logoName}` : "";

          return (
            <div
              className={classes.notificationBox}
              style={notification.isRead ? {} : { backgroundColor: "beige" }}
              onClick={() =>
                onNotificationClick({
                  redirect_type: notification.redirect_type,
                  startup_id: notification.startup_id,
                })
              }
            >
              <div className={classes.imageContainer}>
                <img className={classes.logo} src={logo} />
              </div>
              <div className={classes.text}>
                <strong>{notification.name}</strong>
                <span>{`   ${notification.text}`}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationPanel;
