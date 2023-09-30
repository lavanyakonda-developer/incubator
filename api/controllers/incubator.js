import { db } from '../connect.js';
import _ from 'lodash';

import util from 'util';

const query = util.promisify(db.query).bind(db);

export const incubatorHomeDetails = (req, res) => {
  const { incubator_id } = req.query;

  // Find the incubator
  const findIncubatorQuery = 'SELECT * FROM incubators WHERE id = ?';
  db.query(findIncubatorQuery, [incubator_id], (err, incubatorData) => {
    if (err) return res.status(500).json(err);

    if (incubatorData.length === 0) {
      return res.status(404).json('Incubator not found');
    }

    const incubator = incubatorData[0];

    // Get all the non-draft startups associated with the incubator
    const allStartups = `
        SELECT s.*, isu.is_draft
        FROM startups s
        INNER JOIN incubator_startup isu ON s.id = isu.startup_id
        WHERE isu.incubator_id = ?        
      `;

    db.query(allStartups, [incubator_id], (err, nonDraftedStartupData) => {
      if (err) return res.status(500).json(err);

      // Format the response data for non-draft startups
      const nonDraftedStartups = nonDraftedStartupData;

      // Combine drafted and non-draft startups in the response
      const response = {
        incubator: {
          id: incubator.id,
          name: incubator.name,
          logo: incubator.logo,
        },
        startups: nonDraftedStartups,
      };

      return res.json(response);
    });
  });
};

export const startupDetails = (req, res) => {};
