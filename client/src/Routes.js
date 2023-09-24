import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import { IncubatorLogin, IncubatorHome, RegisterStartup } from './Incubator';
import { StartupLogin } from './Startup';
import { isAuthenticated } from './auth/helper';

const AppRoutes = () => {
  const { user, token } = isAuthenticated();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path='/incubator/:incubator_id/home'
          element={<IncubatorHome incubatorId={user?.incubator_id} />}
        />
        <Route path='/incubator-login' element={<IncubatorLogin />} />
        <Route
          path={`/incubator/${user?.incubator_id}/home/register-startup`}
          element={<RegisterStartup incubatorId={user?.incubator_id} />}
        />
        <Route
          path={`/incubator/${user?.incubator_id}/home/register-startup/:startup_id`}
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
        <Route path='/startup-login' element={<StartupLogin />} />
        <Route path='/home-page' element={<App />} />
        <Route
          path='/'
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
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
