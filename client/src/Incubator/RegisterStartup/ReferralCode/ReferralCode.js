// ReferralCode.js

import React from "react";
import classes from "./ReferralCode.module.css"; // Import your CSS file
import { Button } from "../../../CommonComponents";
import _ from "lodash";

const isValidEmail = (email) => {
  // Regular expression for validating email addresses
  const emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;

  if (!emailRegex.test(email)) {
    return false;
  }

  return true;
};

const ReferralCode = ({
  startupInfo,
  onDraftExit,
  onCancel,
  onNext,
  onBack,
  disableDraft,
}) => {
  const { basicDetails } = startupInfo;

  return (
    <div className={classes.referralCode}>
      <div className={classes.referralCodeCard}>
        <div className={classes.referralCodeView}>
          <div className={classes.info}>
            <label>Founder Name:</label>
            <p>{basicDetails.founderName}</p>
          </div>
          <div className={classes.info}>
            <label>Founder Role:</label>
            <p>{basicDetails.founderRole}</p>
          </div>
          <div className={classes.info}>
            <label>Founder Email:</label>
            <p>{basicDetails.founderEmail}</p>
          </div>
          <div className={classes.info}>
            <label>Founder Mobile:</label>
            <p>{basicDetails.founderMobile}</p>
          </div>
          {!_.isEmpty(basicDetails?.coFounders) && (
            <div className={classes.coFoundersList}>
              {_.some(basicDetails?.coFounders, (coFounder, index) => {
                return (
                  !_.isEmpty(coFounder.name) ||
                  !_.isEmpty(coFounder.designation) ||
                  isValidEmail(coFounder.email) ||
                  !_.isEmpty(coFounder.phone_number)
                );
              }) && <label>Co-Founders:</label>}
              {_.map(basicDetails?.coFounders, (coFounder, index) => {
                return !_.isEmpty(coFounder.name) ||
                  !_.isEmpty(coFounder.designation) ||
                  isValidEmail(coFounder.email) ||
                  !_.isEmpty(coFounder.phone_number) ? (
                  <>
                    <div className={classes.info}>
                      <label>Co-Founder Name:</label>
                      <p>{coFounder.name}</p>
                    </div>
                    <div className={classes.info}>
                      <label>Co-Founder Role:</label>
                      <p>{coFounder.designation}</p>
                    </div>
                    <div className={classes.info}>
                      <label>Co-Founder Email:</label>
                      <p>{coFounder.email}</p>
                    </div>
                    <div className={classes.info}>
                      <label>Co-Founder Mobile:</label>
                      <p>{coFounder.phone_number}</p>
                    </div>
                  </>
                ) : null;
              })}
            </div>
          )}
          <div className={classes.info}>
            <label>Referral Code:</label>
            <p>{basicDetails.referralCode}</p>
          </div>
        </div>
        <div className={classes.buttonContainer}>
          <Button
            name={"Save as Draft"}
            onClick={onDraftExit}
            disabled={disableDraft}
            customStyles={{ backgroundColor: "#ccc" }}
          />
          <Button
            name={"Cancel"}
            onClick={onCancel}
            customStyles={{ backgroundColor: "#ff6d6d" }}
          />
          <Button
            name={"Back"}
            onClick={onBack}
            customStyles={{ backgroundColor: "#ff6d6d" }}
          />

          <Button name={"Next"} onClick={onNext} />
        </div>
      </div>
    </div>
  );
};

export default ReferralCode;
