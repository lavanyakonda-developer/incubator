import React, { useState } from "react";
import { makeRequest } from "../../axios";
import { Button } from "../../CommonComponents";
import classes from "./Login.module.css";
import { useNavigate } from "react-router-dom";
import { authenticate } from "../../auth/helper";
import "@radix-ui/themes/styles.css";
import * as Label from "@radix-ui/react-label";

const inputStyle = {
  color: "#1C2024",
  fontFamily: "Inter",
  fontSize: 16,
  fontStyle: "normal",
  fontWeight: 500,
};

const isValidEmail = (email) => {
  // Regular expression for validating email addresses
  const emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;

  if (!emailRegex.test(email)) {
    return false;
  }

  return true;
};

const Login = (props) => {
  const { isIncubator = false } = props;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic email validation
    if (!isValidEmail(email)) {
      setMessage("Invalid email format");
      return;
    }

    try {
      const route = isIncubator
        ? "api/auth/incubator-login"
        : "api/auth/startup-login";
      const response = await makeRequest.post(route, {
        email,
        password,
      });

      if (response.status === 200) {
        authenticate(response.data);
        setMessage("Logged in");
        const navigationRoute = isIncubator
          ? `/incubator/${response.data.user.incubator_id}/home`
          : `/startup/${response.data.user.startup_id}/home`;
        navigate(navigationRoute);
      } else {
        setMessage("Unknown response from server");
      }
    } catch (error) {
      console.log(">>>>>>>", error);
      setMessage(error.message);
    }
  };

  return (
    <div className={classes.container}>
      <div className={classes.loginBox}>
        <div className={classes.loginHeaders}>
          <span className={classes.title}>
            {isIncubator ? "Login as Incubator" : "Login as Startup"}
          </span>
          <span className={classes.subTitle}>
            Welcome back to a organised, powerful, and better way to <br />{" "}
            track your startups.
          </span>
        </div>
        <p className={classes.message}>{message}</p>
        <form className={classes.form}>
          <div className={classes.formGroup}>
            <Label.Root
              className="LabelRoot"
              htmlFor="firstName"
              style={inputStyle}
            >
              Email
            </Label.Root>
            <input
              className={classes.inputField}
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: 378, marginTop: 8 }}
            />
          </div>
          <div className={classes.formGroup}>
            <Label.Root
              className="LabelRoot"
              htmlFor="firstName"
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

          <Button
            size={"3"}
            variant={"solid"}
            customStyles={{ backgroundColor: "#1C2024", width: 400 }}
            name={"Login"}
            onClick={handleSubmit}
          />
        </form>
      </div>
    </div>
  );
};

export default Login;
