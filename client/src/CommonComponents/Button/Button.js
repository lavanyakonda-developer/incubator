import React from 'react';
import { Link } from 'react-router-dom';
import classes from './Button.module.css';

const Button = (props) => {
  const {
    shouldRedirect = false,
    redirectUrl,
    name,
    customStyles = {},
    onClick,
    disabled,
  } = props;

  if (shouldRedirect) {
    return (
      <button
        className={`${classes.button} ${disabled ? classes.disabled : ''}`}
        style={customStyles}
        title={disabled ? 'HI' : null}
      >
        <Link to={`${redirectUrl}`} className={classes.text}>
          {name}
        </Link>
      </button>
    );
  } else {
    return (
      <button
        className={`${classes.button} ${disabled ? classes.disabled : ''}`}
        style={customStyles}
        onClick={onClick}
        disabled={disabled}
        title={disabled ? 'HI' : null}
      >
        {name}
      </button>
    );
  }
};

export default Button;
