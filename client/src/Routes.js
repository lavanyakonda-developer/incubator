import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import { IncubatorLogin, IncubatorHome, RegisterStartup } from './Incubator';
import {
  StartupLogin,
  StartupFounderRegister,
  StartupOnboarding,
  StartupHome,
} from './Startup';
import { isAuthenticated } from './auth/helper';

const AppRoutes = () => {
  const { user, token } = isAuthenticated();

  console.log('token', user, token);

  return (
    <BrowserRouter>
      <Routes>
        {/* Incubator Routes */}
        <Route
          path='/incubator/:incubator_id/home'
          element={<IncubatorHome incubatorId={user?.incubator_id} />}
        />
        <Route path='/incubator-login' element={<IncubatorLogin />} />
        <Route
          path={`/incubator/:incubator_id/home/register-startup`}
          element={<RegisterStartup incubatorId={user?.incubator_id} />}
        />
        <Route
          path={`/incubator/:incubator_id/home/register-startup/:startup_id`}
          element={<RegisterStartup incubatorId={user?.incubator_id} />}
        />

        <Route
          path='/incubator-login'
          element={
            <Navigate
              replace={true}
              to={
                token && user?.incubator_id
                  ? `/incubator/${user?.incubator_id}/home`
                  : '/incubator-login'
              }
            />
          }
        />
        {/* Startup Routes */}
        <Route path='/startup-login' element={<StartupLogin />} />
        <Route
          path='/startup-founder-registration'
          element={<StartupFounderRegister />}
        />
        <Route
          path='/startup/:startup_id/startup-onboarding'
          element={<StartupOnboarding />}
        />
        <Route path='/startup/:startup_id/home' element={<StartupHome />} />

        {/* Home page */}
        <Route path='/home-page' element={<App />} />
        <Route
          path='/'
          element={
            <Navigate
              replace={true}
              to={
                token && user?.incubator_id
                  ? `/incubator/${user?.incubator_id}/home`
                  : token && user?.startup_id
                  ? `/startup/${user?.startup_id}/home`
                  : '/home-page'
              }
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
