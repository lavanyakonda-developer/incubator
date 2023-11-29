import { db } from "../connect.js";
import _ from "lodash";

import util from "util";

const query = util.promisify(db.query).bind(db);

// Function to process questionnaire data and extract values based on answers
const processQuestionnaireData = (questionnaireData) => {
  let enhancedData = "NA";

  for (const row of questionnaireData) {
    const key = JSON.parse(row?.answer);
    const meta_data = JSON.parse(row?.meta_data);

    if (meta_data && key) {
      enhancedData = _.get(
        _.find(meta_data, (item) => {
          const trimmedItemKey = String(item.key).trim().toLowerCase(); // Trim and lowercase item.key
          const trimmedKey = String(key).trim().toLowerCase(); // Trim and lowercase key

          return trimmedItemKey == trimmedKey;
        }),
        "label",
        "NA"
      );
    }
  }

  return enhancedData;
};

// Function to enhance startups with questionnaire data
const enhanceStartupsWithQuestionnaireData = (startups, callback) => {
  const enhancedStartups = [];

  _.forEach(startups, (startup, index) => {
    // Fetch questionnaire data for the startup
    const questionnaireQuery = `
      SELECT answer, meta_data
      FROM questionnaire
      WHERE startup_id = ? AND question_uid = 'stageOfStartup'
    `;

    db.query(questionnaireQuery, [startup.id], (err, questionnaireData) => {
      if (err) {
        enhancedStartups.push(startup);
      } else {
        const enhancedData = processQuestionnaireData(questionnaireData);

        enhancedStartups.push({
          ...startup,
          stateOfStartup: enhancedData,
        });
      }

      // Check if this is the last startup
      if (index === startups.length - 1) {
        callback(null, enhancedStartups);
      }
    });
  });
};

// Controller function to fetch incubator home details
export const incubatorHomeDetails = (req, res) => {
  const { incubator_id } = req.query;

  // Find the incubator and retrieve its data
  const findIncubatorQuery = "SELECT * FROM incubators WHERE id = ?";
  db.query(findIncubatorQuery, [incubator_id], (err, incubatorData) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (incubatorData.length === 0) {
      return res.status(404).json("Incubator not found");
    }

    const incubator = incubatorData[0];

    // Get all non-draft startups associated with the incubator
    const allStartupsQuery = `
      SELECT s.*
      FROM startups s
      INNER JOIN incubator_startup isu ON s.id = isu.startup_id
      WHERE isu.incubator_id = ?
    `;

    db.query(allStartupsQuery, [incubator_id], (err, startups) => {
      if (err) {
        return res.status(500).json(err);
      }

      // Enhance startups with questionnaire data
      enhanceStartupsWithQuestionnaireData(
        startups,
        (err, enhancedStartups) => {
          if (err) {
            return res.status(500).json(err);
          }

          // Prepare and send the response
          const response = {
            incubator: {
              id: incubator.id,
              name: incubator.name,
              logo: incubator.logo,
            },
            startups: enhancedStartups,
          };

          return res.json(response);
        }
      );
    });
  });
};
