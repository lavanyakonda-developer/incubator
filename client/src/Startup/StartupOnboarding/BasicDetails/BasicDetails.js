import React from "react";
import classes from "./BasicDetails.module.css";
import { Button } from "../../../CommonComponents";
import _ from "lodash";
import { industryOptions } from "../../../Incubator/RegisterStartup/helper.js";

const BasicDetails = ({ startupInfo, onNext, setStartupInfo }) => {
  const startupDetails = startupInfo?.basicDetails;

  // Function to handle input changes in the basic details section
  const handleBasicDetailsChange = (field, value) => {
    setStartupInfo({
      ...startupInfo,
      basicDetails: {
        ...startupInfo.basicDetails,
        [field]: value,
      },
    });
  };

  return (
    <div className={classes.basicDetails}>
      <div className={classes.basicInfoCard}>
        <div className={classes.inputContainer}>
          <label>Name of the incubatee startup</label>
          <input
            type="text"
            value={startupDetails?.name}
            onChange={(e) => handleBasicDetailsChange("name", e.target.value)}
            placeholder="Enter startup name"
          />
        </div>
        <div className={classes.inputContainer}>
          <label>DPIIT Number</label>
          <input
            type="text"
            value={startupDetails?.dpiitNumber}
            onChange={(e) =>
              handleBasicDetailsChange("dpiitNumber", e.target.value)
            }
            placeholder="Enter DPIIT number"
          />
        </div>
        <div className={classes.inputContainer}>
          <label>Industry Segment</label>
          <select
            value={startupDetails?.industrySegment}
            onChange={(e) =>
              handleBasicDetailsChange("industrySegment", e.target.value)
            }
            style={{ height: 32 }}
          >
            <option value="">Select industry segment</option>
            {_.map(industryOptions, (option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className={classes.buttonContainer}>
          <Button name={"Next"} onClick={onNext} />
        </div>
      </div>
    </div>
  );
};

export default BasicDetails;
