import { db } from '../connect.js';
import _ from 'lodash';

import util from 'util';

const query = util.promisify(db.query).bind(db);

export const startUpDetails = (req, res) => {
  const { startup_id } = req.query;

  // Find the startup
  const findStartupQuery = 'SELECT * FROM startups WHERE id = ?';
  db.query(findStartupQuery, [startup_id], async (err, startupData) => {
    if (err) return res.status(500).json(err);

    if (startupData.length === 0) {
      return res.status(404).json('Startup not found');
    }

    const startup = startupData[0];

    const founderQuery = 'SELECT * FROM startup_founders WHERE startup_id = ?';
    const uploadedDocumentsQuery =
      'SELECT * FROM startup_documents WHERE startup_id = ? AND is_requested = false AND is_deleted = false AND is_onboarding = true';
    const requestedDocumentsQuery =
      'SELECT * FROM startup_documents WHERE startup_id = ? AND is_requested = true AND is_deleted = false AND is_onboarding = true';
    const questionnaireQuery =
      'SELECT * FROM questionnaire WHERE startup_id = ?';

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
      name: founder?.name || '',
      designation: founder?.designation || '',
      phone_number: founder?.phone_number || '',
      email: founder?.email || '',
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
      (document) => document?.document_name || ''
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

    const founderName = _.get(coFounders, '0.name', '');
    const founderEmail = _.get(coFounders, '0.email', '');
    const founderMobile = _.get(coFounders, '0.phone_number', '');
    const founderRole = _.get(coFounders, '0.designation', '');

    const startupDetails = {
      basicDetails: {
        id: startup.id,
        name: startup.name || '',
        logo: startup.logo || '',
        status: startup.status || 'PENDING',
        reject_message: startup.reject_message || '',
        dpiitNumber: startup.dpiit_number || '',
        industrySegment: startup.industry || '',
        referralCode: startup.referral_code || '',
        founderName: founderName || '',
        founderRole: founderRole || '',
        founderEmail: founderEmail || '',
        founderMobile: founderMobile || '',
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
  const findStartupQuery = 'SELECT * FROM startups WHERE id = ?';
  db.query(findStartupQuery, [startup_id], async (err, startupData) => {
    if (err) return res.status(500).json(err);

    if (startupData.length === 0) {
      return res.status(404).json('Startup not found');
    }

    const startup = startupData[0];

    const startupDetails = {
      id: startup.id,
      name: startup.name || '',
      logo: startup.logo || '',
      status: startup.status || 'PENDING',
      reject_message: startup.reject_message || '',
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
      'UPDATE startups SET name = ?, dpiit_number = ?, industry = ? , logo = ? , status = ? WHERE id = ?';

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
          'UPDATE startup_documents SET document_url = ?, document_size = ?, document_format = ? WHERE startup_id = ? AND document_name = ?';

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
        'UPDATE questionnaire SET answer = ? WHERE startup_id = ? AND question_uid = ?';

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
      message: 'Startup and associated data have been updated.',
    });
  } catch (error) {
    console.error('Error:', error);
    throw error; // You can handle the error as needed
  }
};

export const updateStartupStatus = async (req, res) => {
  const { startup_id: startupId, status, reject_message } = req.body;
  try {
    // Update basic startup details
    const updateStartupQuery =
      'UPDATE startups SET status = ?, reject_message = ? WHERE id = ?';

    await query(updateStartupQuery, [status, reject_message, startupId]);
    return res.json({
      message: 'Startup and associated data have been updated.',
    });
  } catch (error) {
    console.error('Error:', error);
    throw error; // You can handle the error as needed
  }
};

export const getStartupSuppDocs = async (req, res) => {
  const { startup_id: startupId } = req.body;
  // Fetch existing requested documents
  const fetchPendingDocuments =
    'SELECT * FROM startup_documents WHERE startup_id = ? AND is_onboarding = false AND is_approved = false';

  const fetchApprovedDocuments =
    'SELECT * FROM startup_documents WHERE startup_id = ? AND  is_onboarding = false AND is_approved = true';

  const [pendingDocumentsData, approvedDocumentsData] = await Promise.all([
    query(fetchPendingDocuments, [startupId]),
    query(fetchApprovedDocuments, [startupId]),
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

  return res.json({
    pendingDocuments,
    approvedDocuments,
  });
};

export const updateDocumentApproval = async (req, res) => {
  const { documentId, startup_id } = req.body;

  try {
    const updateStartupQuery =
      'UPDATE startup_documents SET is_approved = true WHERE id = ?';

    await query(updateStartupQuery, [documentId]);

    const fetchPendingDocuments =
      'SELECT * FROM startup_documents WHERE startup_id = ? AND is_onboarding = false AND is_approved = false';

    const fetchApprovedDocuments =
      'SELECT * FROM startup_documents WHERE startup_id = ? AND  is_onboarding = false AND is_approved = true';

    const [pendingDocumentsData, approvedDocumentsData] = await Promise.all([
      query(fetchPendingDocuments, [startup_id]),
      query(fetchApprovedDocuments, [startup_id]),
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

    return res.json({
      pendingDocuments,
      approvedDocuments,
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
      'INSERT INTO startup_documents (`startup_id`, `document_name`, `document_size`, `document_format`, `is_signature_required`, `document_url`, `is_deleted`, `is_approved`, `is_requested`, `is_onboarding`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
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
    ];

    await query(createDocumentQuery, values);

    return res.send({ message: 'Added Successfully' });
  } catch {
    return res.send({ message: 'Error' });
  }
};
