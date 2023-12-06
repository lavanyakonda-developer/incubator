import { db } from "../connect.js";
import _ from "lodash";

import util from "util";

const query = util.promisify(db.query).bind(db);

export const startUpDetails = (req, res) => {
  const { startup_id } = req.query;

  // Find the startup
  const findStartupQuery = "SELECT * FROM startups WHERE id = ?";
  db.query(findStartupQuery, [startup_id], async (err, startupData) => {
    if (err) return res.status(500).json(err);

    if (startupData.length === 0) {
      return res.status(404).json("Startup not found");
    }

    const startup = startupData[0];

    const founderQuery = "SELECT * FROM startup_founders WHERE startup_id = ?";
    const uploadedDocumentsQuery =
      "SELECT * FROM startup_documents WHERE startup_id = ? AND is_requested = false AND is_deleted = false AND is_onboarding = true";
    const requestedDocumentsQuery =
      "SELECT * FROM startup_documents WHERE startup_id = ? AND is_requested = true AND is_deleted = false AND is_onboarding = true";
    const questionnaireQuery =
      "SELECT * FROM questionnaire WHERE startup_id = ?";

    const [
      founderData,
      uploadedDocumentsData,
      requestedDocumentsData,
      questionnaireData,
    ] = await Promise.all([
      query(founderQuery, [startup.id]),
      query(uploadedDocumentsQuery, [startup.id]),
      query(requestedDocumentsQuery, [startup.id]),
      query(questionnaireQuery, [startup.id]),
    ]);

    const coFounders = _.map(founderData, (founder) => ({
      name: founder?.name || "",
      designation: founder?.designation || "",
      phone_number: founder?.phone_number || "",
      email: founder?.email || "",
    }));

    const uploadedDocuments = _.map(uploadedDocumentsData, (document) => ({
      name: document?.document_name,
      size: document?.document_size,
      format: document?.document_format,
      isSignatureRequired: document?.is_signature_required,
      url: document?.document_url,
    }));
    const requestedDocuments = _.map(
      requestedDocumentsData,
      (document) => document?.document_name || ""
    );

    const requestedDocumentsList = _.map(
      requestedDocumentsData,
      (document) => ({
        name: document?.document_name,
        size: document?.document_size,
        format: document?.document_format,
        isSignatureRequired: document?.is_signature_required,
        url: document?.document_url,
      })
    );

    const questionnaire = _.map(questionnaireData, (question) => ({
      uid: question?.question_uid,
      question: question?.question,
      answer_type: question?.answer_type,
      metaData: question?.meta_data,
      answer: JSON.parse(question?.answer),
    }));

    const founderName = _.get(coFounders, "0.name", "");
    const founderEmail = _.get(coFounders, "0.email", "");
    const founderMobile = _.get(coFounders, "0.phone_number", "");
    const founderRole = _.get(coFounders, "0.designation", "");

    const startupDetails = {
      basicDetails: {
        id: startup.id,
        name: startup.name || "",
        logo: startup.logo || "",
        status: startup.status || "PENDING",
        reject_message: startup.reject_message || "",
        dpiitNumber: startup.dpiit_number || "",
        industrySegment: startup.industry || "",
        referralCode: startup.referral_code || "",
        founderName: founderName || "",
        founderRole: founderRole || "",
        founderEmail: founderEmail || "",
        founderMobile: founderMobile || "",
        coFounders: coFounders.slice(1) || [],
      },
      documentUpload: {
        uploadedDocuments: uploadedDocuments,
        requestedDocuments: requestedDocuments,
        requestedDocumentsList,
      },
      questionnaire: questionnaire,
    };

    return res.json(startupDetails);
  });
};

export const startUpStatus = (req, res) => {
  const { startup_id } = req.query;

  // Find the startup
  const findStartupQuery = "SELECT * FROM startups WHERE id = ?";
  db.query(findStartupQuery, [startup_id], async (err, startupData) => {
    if (err) return res.status(500).json(err);

    if (startupData.length === 0) {
      return res.status(404).json("Startup not found");
    }

    const startup = startupData[0];

    const startupDetails = {
      id: startup.id,
      name: startup.name || "",
      logo: startup.logo || "",
      status: startup.status || "PENDING",
      reject_message: startup.reject_message || "",
    };

    return res.json(startupDetails);
  });
};

export const updateStartup = async (req, res) => {
  const {
    startup_id: startupId,
    name,
    logo,
    status,
    dpiit_number,
    industry,
    requestedDocuments,
    questionnaire,
  } = req.body;

  try {
    // Update basic startup details
    const updateStartupQuery =
      "UPDATE startups SET name = ?, dpiit_number = ?, industry = ? , logo = ? , status = ? WHERE id = ?";

    await query(updateStartupQuery, [
      name,
      dpiit_number,
      industry,
      logo,
      status,
      startupId,
    ]);

    // Update requested documents
    const updateDocumentsPromises = _.map(
      requestedDocuments,
      async (document) => {
        const { document_name, document_url, document_size, document_format } =
          document;

        const updateDocumentQuery =
          "UPDATE startup_documents SET document_url = ?, document_size = ?, document_format = ? WHERE startup_id = ? AND document_name = ?";

        await query(updateDocumentQuery, [
          document_url,
          document_size,
          document_format,
          startupId,
          document_name,
        ]);
      }
    );

    // Update questionnaire responses
    const updateQuestionnairePromises = questionnaire.map((question) => {
      const { uid, answer } = question;

      const updateQuestionQuery =
        "UPDATE questionnaire SET answer = ? WHERE startup_id = ? AND question_uid = ?";

      return query(updateQuestionQuery, [
        JSON.stringify(answer),
        startupId,
        uid,
      ]);
    });

    // Combine all promises and execute them
    await Promise.all([
      ...updateDocumentsPromises,
      ...updateQuestionnairePromises.flat(),
    ]);

    // Send success response
    return res.json({
      message: "Startup and associated data have been updated.",
    });
  } catch (error) {
    console.error("Error:", error);
    throw error; // You can handle the error as needed
  }
};

export const updateStartupStatus = async (req, res) => {
  const { startup_id: startupId, status, reject_message } = req.body;
  try {
    // Update basic startup details
    const updateStartupQuery =
      "UPDATE startups SET status = ?, reject_message = ? WHERE id = ?";

    await query(updateStartupQuery, [status, reject_message, startupId]);
    return res.json({
      message: "Startup and associated data have been updated.",
    });
  } catch (error) {
    console.error("Error:", error);
    throw error; // You can handle the error as needed
  }
};

export const getStartupSuppDocs = async (req, res) => {
  const { startup_id: startupId } = req.body;
  // Fetch existing requested documents
  const fetchPendingDocuments =
    "SELECT * FROM startup_documents WHERE startup_id = ? AND is_onboarding = false AND status = ?";

  const fetchApprovedDocuments =
    "SELECT * FROM startup_documents WHERE startup_id = ? AND is_onboarding = false AND status = ?";

  const fetchRejectedDocuments =
    "SELECT * FROM startup_documents WHERE startup_id = ? AND is_onboarding = false AND status = ?";

  const [pendingDocumentsData, approvedDocumentsData, rejectedDocumentsData] =
    await Promise.all([
      query(fetchPendingDocuments, [startupId, "PENDING"]),
      query(fetchApprovedDocuments, [startupId, "APPROVED"]),
      query(fetchRejectedDocuments, [startupId, "REJECTED"]),
    ]);

  const pendingDocuments = _.map(pendingDocumentsData, (document) => ({
    id: document?.id,
    name: document?.document_name,
    size: document?.document_size,
    format: document?.document_format,
    isSignatureRequired: document?.is_signature_required,
    url: document?.document_url,
  }));

  const approvedDocuments = _.map(approvedDocumentsData, (document) => ({
    id: document?.id,
    name: document?.document_name,
    size: document?.document_size,
    format: document?.document_format,
    isSignatureRequired: document?.is_signature_required,
    url: document?.document_url,
  }));

  const rejectedDocuments = _.map(rejectedDocumentsData, (document) => ({
    id: document?.id,
    name: document?.document_name,
    size: document?.document_size,
    format: document?.document_format,
    isSignatureRequired: document?.is_signature_required,
    url: document?.document_url,
  }));

  return res.json({
    pendingDocuments,
    approvedDocuments,
    rejectedDocuments,
  });
};

export const updateDocumentApproval = async (req, res) => {
  const { documentId, startup_id: startupId, status = "APPROVED" } = req.body;

  try {
    const updateStartupQuery =
      "UPDATE startup_documents SET status = ? WHERE id = ?";

    await query(updateStartupQuery, [status, documentId]);

    const fetchPendingDocuments =
      "SELECT * FROM startup_documents WHERE startup_id = ? AND is_onboarding = false AND status = ?";

    const fetchApprovedDocuments =
      "SELECT * FROM startup_documents WHERE startup_id = ? AND is_onboarding = false AND status = ?";

    const fetchRejectedDocuments =
      "SELECT * FROM startup_documents WHERE startup_id = ? AND is_onboarding = false AND status = ?";

    const [pendingDocumentsData, approvedDocumentsData, rejectedDocumentsData] =
      await Promise.all([
        query(fetchPendingDocuments, [startupId, "PENDING"]),
        query(fetchApprovedDocuments, [startupId, "APPROVED"]),
        query(fetchRejectedDocuments, [startupId, "REJECTED"]),
      ]);

    const pendingDocuments = _.map(pendingDocumentsData, (document) => ({
      id: document?.id,
      name: document?.document_name,
      size: document?.document_size,
      format: document?.document_format,
      isSignatureRequired: document?.is_signature_required,
      url: document?.document_url,
    }));

    const approvedDocuments = _.map(approvedDocumentsData, (document) => ({
      id: document?.id,
      name: document?.document_name,
      size: document?.document_size,
      format: document?.document_format,
      isSignatureRequired: document?.is_signature_required,
      url: document?.document_url,
    }));

    const rejectedDocuments = _.map(rejectedDocumentsData, (document) => ({
      id: document?.id,
      name: document?.document_name,
      size: document?.document_size,
      format: document?.document_format,
      isSignatureRequired: document?.is_signature_required,
      url: document?.document_url,
    }));

    return res.json({
      pendingDocuments,
      approvedDocuments,
      rejectedDocuments,
    });
  } catch (error) {
    return res.send({ message: error });
  }
};

export const addSupplementaryDocument = async (req, res) => {
  const { document, startup_id } = req.body;

  try {
    const { document_name, document_url, document_size, document_format } =
      document;

    const createDocumentQuery =
      "INSERT INTO startup_documents (`startup_id`, `document_name`, `document_size`, `document_format`, `is_signature_required`, `document_url`, `is_deleted`, `is_approved`, `is_requested`, `is_onboarding`, `status`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [
      startup_id,
      document_name,
      document_size,
      document_format,
      false,
      document_url,
      false,
      false,
      false,
      false,
      "PENDING",
    ];

    await query(createDocumentQuery, values);

    return res.send({ message: "Added Successfully" });
  } catch (error) {
    return res.send({ message: error });
  }
};

export const timePeriods = async (req, res) => {
  try {
    const { startup_id } = req.body;
    const fetchStartupCreatedAt =
      "SELECT created_at FROM startups WHERE id = ?";

    const startupCreatedAtData = await query(fetchStartupCreatedAt, [
      startup_id,
    ]);

    const startupCreatedAt = startupCreatedAtData[0]["created_at"];

    // Assuming startupCreatedAt is a Date object representing the startup's creation date
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // Adding 1 because months are 0-indexed in JavaScript Date

    const fetchTimePeriods = `
    SELECT *
    FROM time_periods
    WHERE
      (year > ? AND year < ? )
      OR (year = ? AND ? >= JSON_UNQUOTE(JSON_EXTRACT(months, '$[0]')))
      OR (year = ? AND ? <= JSON_UNQUOTE(JSON_EXTRACT(months, '$[0]')))
  `;

    const timePeriods = await query(fetchTimePeriods, [
      startupCreatedAt.getFullYear(),
      currentYear,
      currentYear,
      currentMonth,
      startupCreatedAt.getFullYear(),
      startupCreatedAt.getMonth(),
    ]);

    const sortedTimePeriods = _.orderBy(
      timePeriods,
      [
        (period) => parseInt(period.fyear),
        (period) => {
          const monthsArray = JSON.parse(period.months);
          return _.max(monthsArray); // Get the maximum month value
        },
      ],
      ["desc", "desc"]
    );

    const updatedTimePeriods = _.map(sortedTimePeriods, (period) => {
      return {
        ...period,
        quarter: `${period.quarter} - (FY ${period.fyear})`,
        months: JSON.parse(period.months),
      };
    });

    return res.send({ timePeriods: updatedTimePeriods });
  } catch (error) {
    return res.send({ message: error });
  }
};

//TODO : Make it dynamic according to current time

export const QuarterDetails = async (req, res) => {
  try {
    const fetchTimePeriodMonths =
      "SELECT months FROM time_periods WHERE id = 4";

    const timePeriods = await query(fetchTimePeriodMonths);
    const months = timePeriods[0]["months"];

    const placeholders = _.map(JSON.parse(months), () => "?").join(", ");

    const fetchMonthsDetails = `SELECT * FROM months WHERE id IN (${placeholders})`;

    const quarterMonths = await query(fetchMonthsDetails, JSON.parse(months));
    return res.send({ months: quarterMonths });
  } catch (error) {
    return res.send({ message: error });
  }
};

export const getMonths = async (req, res) => {
  try {
    const fetchMonths = "SELECT * FROM months";

    const months = await query(fetchMonths);

    return res.send({ months });
  } catch (error) {
    return res.send({ message: error });
  }
};

export const getBusinessUpdatesAnswers = async (req, res) => {
  const { startup_id, time_period } = req.body;

  try {
    const answersQuery =
      "SELECT * from business_updates_answers WHERE startup_id = ? AND time_period = ?";

    const answers = await query(answersQuery, [startup_id, time_period]);

    return res.send({ answers });
  } catch (error) {
    return res.send({ message: error });
  }
};

export const updateBusinessUpdatesAnswers = async (req, res) => {
  const { startup_id, time_period, answers } = req.body;

  try {
    await Promise.all(
      answers.map(async (answer) => {
        const { uid, answer: business_update_answer } = answer;

        // Check if a business update answer for the startup, time_period, and uid already exists
        const existingAnswerQuery =
          "SELECT id FROM business_updates_answers WHERE startup_id = ? AND time_period = ? AND uid = ?";
        const [existingAnswer] = await query(existingAnswerQuery, [
          startup_id,
          time_period,
          uid,
        ]);

        if (existingAnswer) {
          // Business update answer for the startup, time_period, and uid already exists, update details
          const updateAnswerQuery =
            "UPDATE business_updates_answers SET answer = ? WHERE id = ?";
          await query(updateAnswerQuery, [
            business_update_answer,
            existingAnswer.id,
          ]);
        } else {
          // Business update answer does not exist, create a new business update answer
          const insertAnswerQuery =
            "INSERT INTO business_updates_answers (`startup_id`, `time_period`, `uid`, `answer`) VALUES (?, ?, ?, ?)";
          await query(insertAnswerQuery, [
            startup_id,
            time_period,
            uid,
            business_update_answer,
          ]);
        }
      })
    );

    return res.send({ message: "Successfully added/updated" });
  } catch (error) {
    return res.status(500).send({ message: "Error: " + error.message });
  }
};

export const getMetrics = async (req, res) => {
  const { startup_id } = req.body;
  try {
    const metricsQuery =
      'SELECT * FROM questionnaire WHERE startup_id = ? AND question_uid IN ("metric1", "metric2", "metric3", "metric4")';

    const metricsData = await query(metricsQuery, [startup_id]);

    const metrics = _.map(metricsData, (item) => {
      return {
        uid: item?.question_uid,
        label: JSON.parse(item?.answer),
      };
    });

    return res.send({ metrics });
  } catch (error) {
    return res.send({ message: error });
  }
};

export const updateMetricValues = async (req, res) => {
  const { startup_id, values, user } = req.body;

  try {
    await Promise.all(
      _.map(values, async (value) => {
        const {
          time_period,
          month_id,
          value: metric_value,
          metric_uid,
        } = value;

        // Check if a metric value for the startup and metric_uid already exists
        const existingMetricQuery =
          "SELECT id, value FROM metric_values WHERE startup_id = ? AND metric_uid = ? AND month_id = ? AND time_period = ?";

        const [existingMetric] = await query(existingMetricQuery, [
          startup_id,
          metric_uid,
          month_id,
          time_period,
        ]);

        if (existingMetric) {
          // Metric value for the startup and metric_uid already exists, update details
          const updateMetricQuery =
            "UPDATE metric_values SET value = ? WHERE id = ?";
          await query(updateMetricQuery, [metric_value, existingMetric.id]);

          // Insert a record into the metric_value_changes table to log the change
          const insertChangeLogQuery =
            "INSERT INTO metric_value_changes (`metric_value_id`, `old_value`, `new_value`, `change_date`, `changed_by`) VALUES (?, ?, ?, ?, ?)";
          await query(insertChangeLogQuery, [
            existingMetric.id,
            existingMetric.value, // Store the old value
            metric_value, // Store the new value
            new Date(), // Current date and time
            user.email,
          ]);
        } else {
          // Metric value does not exist, create a new metric value
          const insertMetricQuery =
            "INSERT INTO metric_values (`startup_id`, `time_period`, `month_id`, `value`, `metric_uid`) VALUES (?, ?, ?, ?, ?)";
          const { insertId } = await query(insertMetricQuery, [
            startup_id,
            time_period,
            month_id,
            metric_value,
            metric_uid,
          ]);

          // Insert a record into the metric_value_changes table to log the change
          const insertChangeLogQuery =
            "INSERT INTO metric_value_changes (`metric_value_id`, `old_value`, `new_value`, `change_date`, `changed_by`) VALUES (?, ?, ?, ?, ?)";
          await query(insertChangeLogQuery, [
            insertId,
            0,
            metric_value, // Store the new value
            new Date(), // Current date and time
            user.email,
          ]);
        }
      })
    );

    return res.send({ message: "Successfully added/updated" });
  } catch (error) {
    return res.status(500).send({ message: "Error: " + error.message });
  }
};

export const getMetricValues = async (req, res) => {
  const { startup_id } = req.body;

  try {
    const getMetricValuesQuery =
      "SELECT mv.*, mvc.old_value, mvc.new_value, mvc.change_date, mvc.changed_by " +
      "FROM metric_values mv " +
      "LEFT JOIN metric_value_changes mvc ON mv.id = mvc.metric_value_id " +
      "WHERE mv.startup_id = ?";

    const metricValuesWithLogs = await query(getMetricValuesQuery, [
      startup_id,
    ]);

    // Group metric values by their unique identifiers
    const metricValuesGrouped = _.reduce(
      metricValuesWithLogs,
      (result, row) => {
        const { id, ...metricValueData } = row;
        if (!result[id]) {
          result[id] = {
            ...metricValueData,
            logs: [], // Initialize logs array
          };
        }
        // Append change log to logs array
        if (row.old_value !== null && row.new_value !== null) {
          result[id].logs.push({
            old_value: row.old_value,
            new_value: row.new_value,
            change_date: row.change_date,
            changed_by: row.changed_by,
          });
        }
        return result;
      },
      {}
    );

    // Convert the object of grouped metric values back to an array
    const metricValues = Object.values(metricValuesGrouped);

    return res.send({ metricValues });
  } catch (error) {
    return res.send({ message: error });
  }
};

export const getMie = async (req, res) => {
  const { startup_id } = req.body;
  try {
    const getMieQuery =
      "SELECT * from mandatory_info_exchange WHERE startup_id = ?";

    const mie = await query(getMieQuery, [startup_id]);

    return res.send({ mie: _.get(mie, "0.mie", "") });
  } catch (error) {
    return res.send({ message: error });
  }
};

export const updateMie = async (req, res) => {
  const { startup_id, mie } = req.body;

  try {
    // Check if MIE for the startup already exists
    const existingMIEQuery =
      "SELECT id FROM mandatory_info_exchange WHERE startup_id = ?";
    const [existingMIE] = await query(existingMIEQuery, [startup_id]);

    if (existingMIE) {
      // MIE for the startup already exists, update details
      const updateMIEQuery =
        "UPDATE mandatory_info_exchange SET mie = ? WHERE startup_id = ?";
      await query(updateMIEQuery, [mie, startup_id]);
    } else {
      // MIE does not exist, create a new MIE
      const insertMIEQuery =
        "INSERT INTO mandatory_info_exchange (startup_id, mie) VALUES (?, ?)";
      await query(insertMIEQuery, [startup_id, mie]);
    }
    return res.send({ message: "Inserted/Updated successfully" });
  } catch (error) {
    return res.status(500).send({ message: "Error: " + error.message });
  }
};
