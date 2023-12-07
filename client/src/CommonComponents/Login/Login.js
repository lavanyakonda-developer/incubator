import React, { useState } from "react";
import { makeRequest } from "../../axios";
import { Button } from "../../CommonComponents";
import classes from "./Login.module.css";
import { useNavigate } from "react-router-dom";
import { authenticate } from "../../auth/helper";

const Login = (props) => {
  const { isIncubator = false } = props;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic email validation
    if (!email.includes("@")) {
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
      setMessage(error.response.data);
    }
  };

  return (
    <div className={classes.container}>
      <div className={classes.loginBox}>
        <h2>{isIncubator ? "Incubator Login" : "Startup Login"}</h2>
        <p className={classes.message}>{message}</p>
        <form className={classes.form}>
          <div className={classes.formGroup}>
            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
          <Button name={"Login"} onClick={handleSubmit} />
        </form>
      </div>
    </div>
  );
};

export default Login;
