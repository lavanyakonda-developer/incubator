import React from "react";
import { Link } from "react-router-dom";
import classes from "./Button.module.css";
import { Button } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";

const UpdatedButton = (props) => {
  const {
    shouldRedirect = false,
    redirectUrl,
    name,
    customStyles = {},
    onClick,
    disabled,
    size = "3",
    variant = "classic",
    color = "indigo",
    state,
    highContrast = false,
    iconStart,
    icon,
    textStyle = {},
  } = props;

  const updatedStyles = disabled
    ? {
        ...customStyles,
        cursor: "not-allowed",
        borderRadius: 6,
      }
    : { ...customStyles, borderRadius: 6 };

  if (shouldRedirect) {
    return (
      <Button
        className={`${classes.button} ${disabled ? classes.disabled : ""}`}
        style={updatedStyles}
        title={disabled ? "HI" : null}
        // NEW PROPS
        size={size}
        variant={variant}
        color={color}
        state={state}
        highContrast={highContrast}
        iconStart={iconStart}
        onClick={onClick}
        disabled={disabled}
      >
        {icon ? icon : null}
        <Link to={`${redirectUrl}`} className={classes.text} style={textStyle}>
          {name}
        </Link>
      </Button>
    );
  } else {
    return (
      <Button
        className={`${classes.button} ${disabled ? classes.disabled : ""}`}
        style={updatedStyles}
        onClick={onClick}
        disabled={disabled}
        title={disabled ? "HI" : null}
        // NEW PROPS
        size={size}
        variant={variant}
        color={color}
        state={state}
        highContrast={highContrast}
        iconStart={iconStart}
      >
        {icon ? icon : null}

        {name}
      </Button>
    );
  }
};

export default UpdatedButton;
