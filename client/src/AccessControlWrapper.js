import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { isAuthenticated } from './auth/helper';
import _ from 'lodash';

const userIsAuthorized = ({ user, startup_id, incubator_id }) => {
  const numericRegex = /^[0-9]+$/; // Regular expression to match only numeric characters

  switch (user?.role) {
    case 'incubator_founder': {
      // Check if incubator_id is a valid numeric string
      if (
        !incubator_id ||
        !numericRegex.test(incubator_id) ||
        user?.incubator_id != incubator_id
      ) {
        return false;
      }

      // Check if startup_id is a valid numeric string and exists in the user's startups
      if (
        startup_id &&
        (!numericRegex.test(startup_id) ||
          !_.includes(user?.startups, parseInt(startup_id)))
      ) {
        return false;
      }

      return true;
    }

    case 'startup_founder': {
      // Check if startup_id is a valid numeric string and matches the user's startup_id
      if (
        !startup_id ||
        !numericRegex.test(startup_id) ||
        user.startup_id != startup_id
      ) {
        return false;
      }
      return true;
    }

    default:
      return false;
  }
};

const AccessControlWrapper = ({ children }) => {
  const { user } = isAuthenticated();
  const { startup_id, incubator_id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Perform access control checks based on user and route parameters
    // For example, you can check if the user has access to the specified startup or incubator
    const hasAccess = userIsAuthorized({ user, startup_id, incubator_id });

    if (!hasAccess) {
      // Redirect to an error page or a restricted access page
      navigate('/');
    }
  }, [user, startup_id, incubator_id, navigate]);

  return children; // Render the child components if access is granted
};

export default AccessControlWrapper;
