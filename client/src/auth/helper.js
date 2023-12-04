import { makeRequest } from "../axios";
import _ from "lodash";

export const isAuthenticated = () => {
  if (typeof window == "undefined") {
    return false;
  }

  if (localStorage.getItem("jwt")) {
    return JSON.parse(localStorage.getItem("jwt"));
  } else {
    return false;
  }
};

export const authenticate = (data, next) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("jwt", JSON.stringify(data));
  }
};

export const updateStartupIdsOfIncubator = ({ startupIds }) => {
  const { user, token } = isAuthenticated();
  if (user?.role !== "incubator_founder") return;
  let existingStartups = _.cloneDeep(user?.startups);

  _.forEach(startupIds, (id) => {
    if (!_.includes(existingStartups, id)) {
      existingStartups.push(id);
    }
  });
  authenticate({
    token,
    user: {
      ...user,
      startups: existingStartups,
    },
  });
};

export const signout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("jwt");
  }
};

export const logout = async () => {
  try {
    await makeRequest.post("api/auth/logout");
    signout();
  } catch (error) {
    console.log("Errorrr", error);
  }
};
