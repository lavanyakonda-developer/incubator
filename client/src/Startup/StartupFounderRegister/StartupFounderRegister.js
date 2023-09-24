import React, { useState } from 'react';
import { makeRequest } from '../../axios';
import { Button } from '../../CommonComponents';
import classes from './StartupFounderRegister.module.css';
import { useNavigate } from 'react-router-dom';
import { authenticate } from '../../auth/helper';
import _ from 'lodash';

const StartupFounderRegister = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic email validation
    if (!email.includes('@')) {
      setMessage('Invalid email format');
      return;
    }

    if (_.isEmpty(referralCode)) {
      setMessage('Referral code is required');
      return;
    }

    if (password != confirmPassword) {
      setMessage(`Passwords doesn't match!`);
      return;
    }

    try {
      const response = await makeRequest.post(
        'api/auth/startup-founder-register',
        {
          email,
          password,
          referral_code: referralCode,
        }
      );

      console.log(response);

      if (response.status === 200) {
        setMessage('Logged in');
        authenticate(response.data);

        navigate(
          `/startup/${response.data.user.startup_id}/startup-onboarding`
        );
      } else {
        setMessage('Unknown response from server');
      }
    } catch (error) {
      setMessage(error.response.data);
    }
  };

  return (
    <div className={classes.container}>
      <div className={classes.loginBox}>
        <h2>Startup founder registration</h2>
        <p className={classes.message}>{message}</p>
        <form className={classes.form}>
          <div className={classes.formGroup}>
            <input
              type='text'
              placeholder='Email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className={classes.formGroup}>
            <input
              type='password'
              placeholder='Password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className={classes.formGroup}>
            <input
              type='password'
              placeholder='Confirm Password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <div className={classes.formGroup}>
            <input
              type='text'
              placeholder='Referral Code'
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
            />
          </div>
          <Button name={'Login'} onClick={handleSubmit} />
        </form>
      </div>
    </div>
  );
};

export default StartupFounderRegister;
