import React, { useState } from 'react';
import { makeRequest } from '../../axios';
import { Button } from '../../CommonComponents';
import classes from './IncubatorLogin.module.css';
import { useNavigate } from 'react-router-dom';
import { authenticate } from '../../auth/helper';

const IncubatorLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic email validation
    if (!email.includes('@')) {
      setMessage('Invalid email format');
      return;
    }

    try {
      const response = await makeRequest.post('api/auth/incubator-login', {
        email,
        password,
      });

      if (response.status === 200) {
        setMessage('Logged in');
        authenticate(response.data);
        navigate(`/incubator/${response.data.user.incubator_id}/home`);
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
        <h2>Incubator Login</h2>
        <p className={classes.message}>{message}</p>
        <form>
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
          <Button name={'Login'} onClick={handleSubmit} />
        </form>
      </div>
    </div>
  );
};

export default IncubatorLogin;
