import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
} from "react-router-dom";
import App from "./App";
import {
  IncubatorLogin,
  IncubatorHome,
  RegisterStartup,
  StartupHomeView,
} from "./Incubator";
import {
  StartupLogin,
  StartupFounderRegister,
  StartupOnboarding,
  StartupHome,
} from "./Startup";
import { isAuthenticated } from "./auth/helper";
import AccessControlWrapper from "./AccessControlWrapper";
import _ from "lodash";

const AppRoutes = () => {
  const { user, token } = isAuthenticated();

  const isIncubatorFounder = _.isEqual(user?.role, "incubator_founder");
  const isStartupFounder = _.isEqual(user?.role, "startup_founder");

  return (
    <BrowserRouter>
      <Routes>
        {/* Incubator Routes */}
        <Route
          path="/incubator/:incubator_id/home"
          element={
            <AccessControlWrapper>
              <IncubatorHome incubatorId={user?.incubator_id} />
            </AccessControlWrapper>
          }
        />

        <Route
          path="/incubator-login"
          element={
            token &&
            ((user?.incubator_id && isIncubatorFounder) ||
              (user?.startup_id && isStartupFounder)) ? (
              <Navigate
                replace={true}
                to={
                  isIncubatorFounder
                    ? `/incubator/${user?.incubator_id}/home`
                    : `/startup/${user?.startup_id}/home`
                }
              />
            ) : (
              <IncubatorLogin />
            )
          }
        />

        <Route
          path={`/incubator/:incubator_id/home/register-startup`}
          element={<RegisterStartup incubatorId={user?.incubator_id} />}
        />
        <Route
          path={`/incubator/:incubator_id/home/register-startup/:startup_id`}
          element={<RegisterStartup incubatorId={user?.incubator_id} />}
        />

        <Route
          path={`/incubator/:incubator_id/home/startup-home/:startup_id`}
          element={
            <AccessControlWrapper>
              <StartupHomeView incubatorId={user?.incubator_id} />
            </AccessControlWrapper>
          }
        />

        {/* Startup Routes */}

        <Route
          path="/startup-login"
          element={
            token &&
            ((user?.incubator_id && isIncubatorFounder) ||
              (user?.startup_id && isStartupFounder)) ? (
              <Navigate
                replace={true}
                to={
                  isIncubatorFounder
                    ? `/incubator/${user?.incubator_id}/home`
                    : `/startup/${user?.startup_id}/home`
                }
              />
            ) : (
              <StartupLogin />
            )
          }
        />

        <Route
          path="/startup-founder-registration"
          element={
            token &&
            ((user?.incubator_id && isIncubatorFounder) ||
              (user?.startup_id && isStartupFounder)) ? (
              <Navigate
                replace={true}
                to={
                  isIncubatorFounder
                    ? `/incubator/${user?.incubator_id}/home`
                    : `/startup/${user?.startup_id}/home`
                }
              />
            ) : (
              <StartupFounderRegister />
            )
          }
        />

        <Route
          path="/startup/:startup_id/startup-onboarding"
          element={
            <AccessControlWrapper>
              <StartupOnboarding />
            </AccessControlWrapper>
          }
        />
        <Route
          path="/startup/:startup_id/home"
          element={
            <AccessControlWrapper>
              <StartupHome />
            </AccessControlWrapper>
          }
        />

        {/* Home page */}
        {/* <Route path="/home-page" element={<App />} /> */}

        <Route
          path="/home-page"
          element={
            token &&
            ((user?.incubator_id && isIncubatorFounder) ||
              (user?.startup_id && isStartupFounder)) ? (
              <Navigate
                replace={true}
                to={
                  isIncubatorFounder
                    ? `/incubator/${user?.incubator_id}/home`
                    : `/startup/${user?.startup_id}/home`
                }
              />
            ) : (
              <App />
            )
          }
        />

        <Route
          path="/"
          element={
            <Navigate
              replace={true}
              to={
                token && user?.incubator_id && isIncubatorFounder
                  ? `/incubator/${user?.incubator_id}/home`
                  : token && user?.startup_id && isStartupFounder
                  ? `/startup/${user?.startup_id}/home`
                  : "/home-page"
              }
            />
          }
        />
        <Route path="/*" element={<Navigate to="/" replace={true} />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
