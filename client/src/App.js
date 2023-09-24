import React from 'react';
import { Button } from './CommonComponents';
import classes from './App.module.css';

const HomePage = () => {
  return (
    <div className={classes.container}>
      <div className={classes.content}>
        <h1>Hello! Greetings from Incubator Saas!!</h1>
        <div className={classes.buttonContainer}>
          <Button
            shouldRedirect={true}
            redirectUrl={'/incubator-login'}
            name={'Incubator Login'}
          />
          <Button
            shouldRedirect={true}
            redirectUrl={'/startup-login'}
            name={'Startup Login'}
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
