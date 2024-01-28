import React, { useState, useEffect } from "react";
import { makeRequest } from "../../axios";
import Button from "../Button";
import classes from "./UpdatePassword.module.css";
import { useNavigate } from "react-router-dom";
import { logout } from "../../auth/helper";
import _ from "lodash";

const UpdatePassword = (props) => {
  const { userId, role } = props;
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    return () => setMessage("");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password != confirmPassword) {
      setMessage(`Passwords doesn't match!`);
      return;
    }

    if (currentPassword == password) {
      setMessage(`New password can't be the current password !`);
      return;
    }

    try {
      const response = await makeRequest.post("api/auth/password-change", {
        currentPassword,
        userId,
        role,
        password,
      });

      if (response.status === 200) {
        logout();
        navigate(`/home-page`);
      } else {
        setMessage("Unknown response from server");
      }
    } catch (error) {
      setMessage(error.response.data);
    }
  };

  return (
    <div className={classes.container}>
      <div className={classes.loginBox}>
        <h2>Change Password</h2>
        <h4>
          Note: Please note that you will be logged out on changing the
          password, and you will have to re-login with updated password.
        </h4>
        <p className={classes.message}>{message}</p>
        <form className={classes.form}>
          <div className={classes.formGroup}>
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className={classes.formGroup}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className={classes.formGroup}>
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <Button
            name={"Update Password"}
            onClick={handleSubmit}
            disabled={
              _.isEmpty(password) ||
              _.isEmpty(currentPassword) ||
              _.isEmpty(confirmPassword)
            }
          />
        </form>
      </div>
    </div>
  );
};

export default UpdatePassword;
