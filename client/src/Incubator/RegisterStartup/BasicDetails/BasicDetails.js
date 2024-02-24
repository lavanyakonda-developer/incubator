import React, { useEffect, useState } from "react";
import classes from "./BasicDetails.module.css";
import _ from "lodash";
import { Button } from "../../../CommonComponents";
import { industryOptions } from "../helper.js";

const isValidEmail = (email) => {
  // Regular expression for validating email addresses
  const emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;

  if (!emailRegex.test(email)) {
    return false;
  }

  return true;
};

const dippRegex = /^DIPP\d{1,10}$/;

const disabledStyle = {
  background: "var(--Neutral-color-Neutral-Alpha-3, rgba(0, 0, 59, 0.05))",
};

const BasicDetails = ({
  startupInfo,
  onDraftExit,
  disableDraft,
  onCancel,
  onNext,
  setStartupInfo,
  disabled,
}) => {
  const startupDetails = startupInfo?.basicDetails;

  const [coFounders, setCoFounders] = useState(startupDetails?.coFounders);

  const handleAddCoFounder = () => {
    setCoFounders(
      _.concat(coFounders, [
        { name: "", designation: "", phone_number: "", email: "" },
      ])
    );

    setStartupInfo({
      ...startupInfo,
      basicDetails: {
        ...startupInfo.basicDetails,
        coFounders: _.concat(coFounders, [
          { name: "", designation: "", phone_number: "", email: "" },
        ]),
      },
    });
  };

  // Function to handle input changes in the basic details section
  const handleBasicDetailsChange = (field, value) => {
    if (field === "founderMobile" && !/^\d+$/.test(value)) {
      return;
    }

    if (field === "dpiitNumber" && value.length > 10) {
      return;
    }

    setStartupInfo({
      ...startupInfo,
      basicDetails: {
        ...startupInfo.basicDetails,
        [field]: value,
      },
    });
  };

  // Function to handle input changes in the co-founder section
  const handleCoFounderChange = (index, field, value) => {
    const updatedCoFounders = [...coFounders];

    if (field === "phone_number" && !/^\d+$/.test(value)) {
      return;
    }

    updatedCoFounders[index] = {
      ...updatedCoFounders[index],
      [field]: value,
    };

    setCoFounders(updatedCoFounders);
    setStartupInfo({
      ...startupInfo,
      basicDetails: {
        ...startupInfo.basicDetails,
        coFounders: updatedCoFounders,
      },
    });
  };

  const onClickNext = () => {
    setStartupInfo({
      ...startupInfo,
      basicDetails: {
        ...startupInfo.basicDetails,
        coFounders,
      },
    });

    onNext();
  };

  const disableCofounders = () => {
    return (
      _.isEmpty(startupDetails.founderName) ||
      !isValidEmail(startupDetails.founderEmail) ||
      _.isEmpty(startupDetails.founderMobile) ||
      _.isEmpty(startupDetails.founderRole) ||
      _.size(coFounders) === 2
    );
  };

  return (
    <div className={classes.basicDetails}>
      <div className={classes.heading}>
        <div className={classes.title}>Add new startup</div>
        <div className={classes.subTitle}>
          Let’s enter some basic details to initiate the onboarding process of
          the startup{" "}
        </div>
      </div>
      <div className={classes.basicInfoCard}>
        <div className={classes.basicInfoContainer}>
          <div className={classes.basicDetailsHeading}>Basic details</div>
          <div className={classes.inputContainerNew}>
            <label className={classes.inputTitle}>Name of the startup*</label>
            <input
              type="text"
              value={startupDetails.name}
              onChange={(e) => handleBasicDetailsChange("name", e.target.value)}
              placeholder="Enter startup name"
              className={classes.inputField}
              style={disabled ? disabledStyle : {}}
              disabled={disabled}
            />
          </div>
          <div className={classes.miniContainer}>
            <div className={classes.inputContainerNew}>
              <label className={classes.inputTitle}>DPIIT Number*</label>
              <input
                type="text"
                value={startupDetails.dpiitNumber}
                onChange={(e) =>
                  handleBasicDetailsChange("dpiitNumber", e.target.value)
                }
                placeholder="Enter DPIIT number"
                className={classes.inputField}
                style={disabled ? disabledStyle : {}}
                disabled={disabled}
              />
              {!_.isEmpty(startupDetails.dpiitNumber) &&
                (!dippRegex.test(startupDetails.dpiitNumber) ||
                  _.size(startupDetails.dpiitNumber) != 10) && (
                  <p
                    style={{
                      color: "red",
                      margin: "0",
                      fontSize: "14",
                      fontFamily: "Inter",
                    }}
                  >
                    {" "}
                    Invalid Number
                  </p>
                )}
            </div>
            <div className={classes.inputContainerNew}>
              <label className={classes.inputTitle}>Industry Segment*</label>

              <select
                value={startupDetails.industrySegment}
                onChange={(e) =>
                  handleBasicDetailsChange("industrySegment", e.target.value)
                }
                className={classes.industryDropdown}
                style={disabled ? disabledStyle : {}}
                disabled={disabled}
              >
                <option value="">Select industry segment</option>
                {_.map(industryOptions, (option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className={classes.basicInfoContainer}>
          <div className={classes.basicDetailsHeading}>Founder details</div>
          <div className={classes.founderNumber}>
            <div className={classes.founderNumberInt}>1</div>
            <div className={classes.founderNumberLabel}> Founder </div>
          </div>
          <div className={classes.miniContainer}>
            <div className={classes.inputContainerNew}>
              <label className={classes.inputTitle}>Name of Founder*</label>
              <input
                type="text"
                value={startupDetails.founderName}
                onChange={(e) =>
                  handleBasicDetailsChange("founderName", e.target.value)
                }
                placeholder="Enter founder's name"
                className={classes.inputField}
                style={disabled ? disabledStyle : {}}
                disabled={disabled}
              />
            </div>
            <div className={classes.inputContainerNew}>
              {" "}
              <label className={classes.inputTitle}>Role of Founder*</label>
              <input
                type="text"
                value={startupDetails.founderRole}
                onChange={(e) =>
                  handleBasicDetailsChange("founderRole", e.target.value)
                }
                placeholder="Enter founder's role"
                className={classes.inputField}
                style={disabled ? disabledStyle : {}}
                disabled={disabled}
              />
            </div>
          </div>
          <div className={classes.miniContainer}>
            <div className={classes.inputContainerNew}>
              <label className={classes.inputTitle}>Email of Founder*</label>
              <input
                type="email"
                value={startupDetails.founderEmail}
                onChange={(e) =>
                  handleBasicDetailsChange("founderEmail", e.target.value)
                }
                placeholder="Enter founder's email"
                className={classes.inputField}
                style={disabled ? disabledStyle : {}}
                disabled={disabled}
              />
            </div>
            <div className={classes.inputContainerNew}>
              <label className={classes.inputTitle}>
                Mobile Number of Founder*
              </label>
              <input
                type="tel"
                value={startupDetails.founderMobile}
                onChange={(e) =>
                  handleBasicDetailsChange("founderMobile", e.target.value)
                }
                placeholder="Enter founder's phone number"
                className={classes.inputField}
                style={disabled ? disabledStyle : {}}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
        <div className={classes.coFounderContainer}>
          {_.map(coFounders, (coFounder, index) => (
            <div key={index} className={classes.basicInfoContainer}>
              <div className={classes.founderNumber}>
                <div className={classes.founderNumberInt}>{index + 2}</div>
                <div className={classes.founderNumberLabel}> Founder </div>
              </div>
              <div className={classes.miniContainer}>
                <div className={classes.inputContainerNew}>
                  <label className={classes.inputTitle}>
                    Name of Co-Founder
                  </label>
                  <input
                    type="text"
                    value={coFounder.name}
                    onChange={(e) =>
                      handleCoFounderChange(index, "name", e.target.value)
                    }
                    placeholder="Enter Co-Founder's phone number"
                    className={classes.inputField}
                    style={disabled ? disabledStyle : {}}
                    disabled={disabled}
                  />
                </div>
                <div className={classes.inputContainerNew}>
                  <label className={classes.inputTitle}>
                    Role of Co-Founder
                  </label>
                  <input
                    type="text"
                    value={coFounder.designation}
                    onChange={(e) =>
                      handleCoFounderChange(
                        index,
                        "designation",
                        e.target.value
                      )
                    }
                    placeholder="Enter Co-Founder's role"
                    className={classes.inputField}
                    style={disabled ? disabledStyle : {}}
                    disabled={disabled}
                  />
                </div>
              </div>
              <div className={classes.miniContainer}>
                <div className={classes.inputContainerNew}>
                  <label className={classes.inputTitle}>
                    Email of Co-Founder
                  </label>
                  <input
                    type="email"
                    value={coFounder.email}
                    onChange={(e) =>
                      handleCoFounderChange(index, "email", e.target.value)
                    }
                    placeholder="Enter Co-Founder's email"
                    className={classes.inputField}
                    style={disabled ? disabledStyle : {}}
                    disabled={disabled}
                  />
                </div>
                <div className={classes.inputContainerNew}>
                  <label className={classes.inputTitle}>
                    Mobile Number of Co-Founder
                  </label>
                  <input
                    type="tel"
                    value={coFounder.phone_number}
                    onChange={(e) =>
                      handleCoFounderChange(
                        index,
                        "phone_number",
                        e.target.value
                      )
                    }
                    placeholder="Enter Co-Founder's phone number"
                    className={classes.inputField}
                    style={disabled ? disabledStyle : {}}
                    disabled={disabled}
                  />
                </div>
              </div>
            </div>
          ))}
          <div className={classes.addCoFounderContainer}>
            <Button
              name={"Add Co-Founder"}
              onClick={handleAddCoFounder}
              disabled={disableCofounders() || disabled}
              size={"2"}
              variant={"solid"}
              customStyles={
                disableCofounders() || disabled
                  ? { width: 300 }
                  : { backgroundColor: "#1C2024", width: 300 }
              }
            />
          </div>
        </div>
      </div>
      <div className={classes.buttonContainer}>
        <Button
          name={"Back"}
          onClick={onCancel}
          variant={"outline"}
          highContrast={true}
          color={"gray"}
        />

        <div className={classes.buttonContainerRight}>
          <Button
            name={"Save as Draft"}
            onClick={onDraftExit}
            variant={"outline"}
            disabled={disableDraft}
            highContrast={true}
          />
          <Button
            name={"Next"}
            onClick={onClickNext}
            variant={"solid"}
            customStyles={{ backgroundColor: "#1C2024", width: 68 }}
          />
        </div>
      </div>
    </div>
  );
};

export default BasicDetails;
