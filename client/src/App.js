import React from "react";
import { Button } from "./CommonComponents";
import classes from "./App.module.css";

const HomePage = () => {
  return (
    <div className={classes.container}>
      <div className={classes.content}>
        <h1>Hello! Greetings from Incubator Saas!!</h1>
        <div className={classes.buttonContainer}>
          <Button
            shouldRedirect={true}
            redirectUrl={"/incubator-login"}
            name={"Incubator Login"}
            size={"3"}
            variant={"solid"}
            customStyles={{
              backgroundColor: "#1C2024",
              width: 300,
            }}
            textStyle={{
              color: "white",
            }}
          />
          <Button
            shouldRedirect={true}
            redirectUrl={"/startup-login"}
            name={"Startup Login"}
            size={"3"}
            variant={"solid"}
            customStyles={{
              backgroundColor: "#1C2024",
              width: 300,
            }}
            textStyle={{
              color: "white",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
