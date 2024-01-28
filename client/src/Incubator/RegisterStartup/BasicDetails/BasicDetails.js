import React, { useState } from "react";
import classes from "./BasicDetails.module.css";
import _ from "lodash";
import { Button } from "../../../CommonComponents";

const isValidEmail = (email) => {
  // Regular expression for validating email addresses
  const emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;

  if (!emailRegex.test(email)) {
    return false;
  }

  return true;
};

const BasicDetails = ({
  startupInfo,
  onDraftExit,
  disableDraft,
  onCancel,
  onNext,
  setStartupInfo,
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
      <div className={classes.basicInfoCard}>
        <div className={classes.inputContainer}>
          <label>Name of the incubatee startup*</label>
          <input
            type="text"
            value={startupDetails.name}
            onChange={(e) => handleBasicDetailsChange("name", e.target.value)}
            placeholder="Enter startup name"
          />
        </div>
        <div className={classes.inputContainer}>
          <label>DPIIT Number*</label>
          <input
            type="text"
            value={startupDetails.dpiitNumber}
            onChange={(e) =>
              handleBasicDetailsChange("dpiitNumber", e.target.value)
            }
            placeholder="Enter DPIIT number"
          />
        </div>
        <div className={classes.inputContainer}>
          <label>Industry Segment*</label>
          <input
            type="text"
            value={startupDetails.industrySegment}
            onChange={(e) =>
              handleBasicDetailsChange("industrySegment", e.target.value)
            }
            placeholder="Enter industry segment"
          />
        </div>
        <div className={classes.inputContainer}>
          <label>Name of Founder*</label>
          <input
            type="text"
            value={startupDetails.founderName}
            onChange={(e) =>
              handleBasicDetailsChange("founderName", e.target.value)
            }
            placeholder="Enter founder's name"
          />
        </div>
        <div className={classes.inputContainer}>
          <label>Role of Founder*</label>
          <input
            type="text"
            value={startupDetails.founderRole}
            onChange={(e) =>
              handleBasicDetailsChange("founderRole", e.target.value)
            }
            placeholder="Enter founder's role"
          />
        </div>
        <div className={classes.inputContainer}>
          <label>Email of Founder*</label>
          <input
            type="email"
            value={startupDetails.founderEmail}
            onChange={(e) =>
              handleBasicDetailsChange("founderEmail", e.target.value)
            }
            placeholder="Enter founder's email"
          />
        </div>
        <div className={classes.inputContainer}>
          <label>Mobile Number of Founder*</label>
          <input
            type="tel"
            value={startupDetails.founderMobile}
            onChange={(e) =>
              handleBasicDetailsChange("founderMobile", e.target.value)
            }
            placeholder="Enter founder's phone number"
          />
        </div>
        <div className={classes.coFounderContainer}>
          {_.map(coFounders, (coFounder, index) => (
            <div key={index} className="co-founder">
              <div className={classes.inputContainer}>
                <label>Name of Co-Founder</label>
                <input
                  type="text"
                  value={coFounder.name}
                  onChange={(e) =>
                    handleCoFounderChange(index, "name", e.target.value)
                  }
                  placeholder="Enter Co-Founder's phone number"
                />
              </div>
              <div className={classes.inputContainer}>
                <label>Role of Co-Founder</label>
                <input
                  type="text"
                  value={coFounder.designation}
                  onChange={(e) =>
                    handleCoFounderChange(index, "designation", e.target.value)
                  }
                  placeholder="Enter Co-Founder's role"
                />
              </div>
              <div className={classes.inputContainer}>
                <label>Email of Co-Founder</label>
                <input
                  type="email"
                  value={coFounder.email}
                  onChange={(e) =>
                    handleCoFounderChange(index, "email", e.target.value)
                  }
                  placeholder="Enter Co-Founder's email"
                />
              </div>
              <div className={classes.inputContainer}>
                <label>Mobile Number of Co-Founder</label>
                <input
                  type="tel"
                  value={coFounder.phone_number}
                  onChange={(e) =>
                    handleCoFounderChange(index, "phone_number", e.target.value)
                  }
                  placeholder="Enter Co-Founder's phone number"
                />
              </div>
            </div>
          ))}
          <div className={classes.addCoFounderContainer}>
            <Button
              name={"Add Another Co-Founder"}
              onClick={handleAddCoFounder}
              disabled={disableCofounders()}
            />
          </div>
        </div>
        <div className={classes.buttonContainer}>
          <Button
            name={"Draft and Exit"}
            onClick={onDraftExit}
            customStyles={{ backgroundColor: "#ccc" }}
            disabled={disableDraft}
          />
          <Button
            name={"Cancel"}
            onClick={onCancel}
            customStyles={{ backgroundColor: "#ff6d6d" }}
          />
          <Button name={"Next"} onClick={onClickNext} />
        </div>
      </div>
    </div>
  );
};

export default BasicDetails;
