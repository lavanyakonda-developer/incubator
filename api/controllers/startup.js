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
      'SELECT * FROM startup_documents WHERE startup_id = ? AND is_requested = false AND is_deleted = false';
    const requestedDocumentsQuery =
      'SELECT document_name FROM startup_documents WHERE startup_id = ? AND is_requested = true AND is_deleted = false';
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
    const questionnaire = _.map(questionnaireData, (question) => ({
      uid: question?.question_uid,
      question: question?.question,
      answer_type: question?.answer_type,
      metaData: question?.meta_data,
    }));

    const founderName = _.get(coFounders, '0.name', '');
    const founderEmail = _.get(coFounders, '0.email', '');
    const founderMobile = _.get(coFounders, '0.phone_number', '');
    const founderRole = _.get(coFounders, '0.designation', '');

    const startupDetails = {
      basicDetails: {
        id: startup.id,
        name: startup.name || '',
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
      },
      questionnaire: questionnaire,
    };

    return res.json(startupDetails);
  });
};
