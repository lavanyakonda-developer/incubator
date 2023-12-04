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

// Function to enhance startups with questionnaire data and isKPIAdded flag
const enhanceStartupsWithQuestionnaireDataAndKPI = (startups, callback) => {
  const enhancedStartups = [];

  const getCurrentDate = new Date();
  const currentDay = getCurrentDate.getDate();
  const currentYear = getCurrentDate.getFullYear();
  const currentMonth =
    getCurrentDate.getMonth() == 0 ? 12 : getCurrentDate.getMonth(); // Previous month KPI is checked

  let timePeriodId = null;

  const findTimePeriodQuery = `
  SELECT id FROM time_periods
  WHERE year = ? AND JSON_CONTAINS(months, JSON_ARRAY(?)) LIMIT 1;
  `;

  db.query(
    findTimePeriodQuery,
    [currentYear, currentMonth],
    (err, timePeriodData) => {
      if (err) {
        return callback(err);
      }

      if (timePeriodData.length > 0) {
        timePeriodId = timePeriodData[0].id;
      }

      _.forEach(startups, (startup, index) => {
        const questionnaireQuery = `
        SELECT answer, meta_data
        FROM questionnaire
        WHERE startup_id = ? AND question_uid = 'stageOfStartup'
      `;

        db.query(questionnaireQuery, [startup.id], (err, questionnaireData) => {
          if (err) {
            return callback(err);
          }

          const enhancedData = processQuestionnaireData(questionnaireData);

          const findKPIQuery = `
          SELECT COUNT(*) as rowCount
          FROM metric_values
          WHERE
            startup_id = ? 
            AND time_period = ?
            AND month_id = ?
            AND metric_uid IN ('metric1', 'metric2', 'metric3', 'metric4')
        `;

          db.query(
            findKPIQuery,
            [startup.id, timePeriodId, currentMonth],
            (err, kpiData) => {
              if (err) {
                return callback(err);
              }

              const isKPIAdded = kpiData[0].rowCount == 4;

              enhancedStartups.push({
                ...startup,
                stateOfStartup: enhancedData,
                color: !isKPIAdded
                  ? currentDay < 16
                    ? "orange"
                    : "red"
                  : "green",
              });

              if (index === startups.length - 1) {
                callback(null, enhancedStartups);
              }
            }
          );
        });
      });
    }
  );
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
      SELECT s.*, isu.is_draft
      FROM startups s
      INNER JOIN incubator_startup isu ON s.id = isu.startup_id
      WHERE isu.incubator_id = ?
    `;

    db.query(allStartupsQuery, [incubator_id], (err, startups) => {
      if (err) {
        return res.status(500).json(err);
      }

      // Enhance startups with questionnaire data
      enhanceStartupsWithQuestionnaireDataAndKPI(
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
