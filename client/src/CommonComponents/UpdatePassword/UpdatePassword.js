import React, { useState, useEffect } from "react";
import { makeRequest } from "../../axios";
import Button from "../Button";
import classes from "./UpdatePassword.module.css";
import { useNavigate } from "react-router-dom";
import { logout } from "../../auth/helper";
import _ from "lodash";
import "@radix-ui/themes/styles.css";
import * as Label from "@radix-ui/react-label";

const inputStyle = {
  color: "#1C2024",
  fontFamily: "Inter",
  fontSize: 16,
  fontStyle: "normal",
  fontWeight: 500,
};

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
        <div className={classes.loginHeaders}>
          <span className={classes.title}>{"Change Password"}</span>
          <span className={classes.subTitle}>
            Note: Please note that you will be logged out on changing <br /> the
            password, and you will have to re-login with updated <br />
            password.
          </span>
        </div>
        <p className={classes.message}>{message}</p>
        <form className={classes.form}>
          <div className={classes.formGroup}>
            <Label.Root
              className="LabelRoot"
              htmlFor="currentPassword"
              style={inputStyle}
            >
              Current Password
            </Label.Root>
            <input
              className={classes.inputField}
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={{ width: 378, marginTop: 8 }}
            />
          </div>

          <div className={classes.formGroup}>
            <Label.Root
              className="LabelRoot"
              htmlFor="password"
              style={inputStyle}
            >
              Password
            </Label.Root>
            <input
              className={classes.inputField}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: 378, marginTop: 8 }}
            />
          </div>

          <div className={classes.formGroup}>
            <Label.Root
              className="LabelRoot"
              htmlFor="confirmPassword"
              style={inputStyle}
            >
              Confirm Password
            </Label.Root>
            <input
              className={classes.inputField}
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ width: 378, marginTop: 8 }}
            />
          </div>

          <Button
            size={"3"}
            variant={"solid"}
            customStyles={{
              backgroundColor: "#1C2024",
              width: 400,
              color: "#ffffff",
            }}
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
