import { db } from "../connect.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import util from "util";
import _ from "lodash";
import nodemailer from "nodemailer";

const query = util.promisify(db.query).bind(db);

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "incubatorsass@gmail.com",
    pass: "ggfp swvb zofl nytb",
  },
});

export const passwordChange = (req, res) => {
  const { userId, role, password } = req.body;
  const tableName =
    role === "incubator_founder" ? "incubator_founders" : "startup_founders";

  const q = `SELECT * FROM ${tableName} WHERE id = ?`;

  db.query(q, [userId], async (err, data) => {
    if (err) return res.status(500).json(err);

    const checkPassword = bcrypt.compareSync(
      req.body.currentPassword,
      data[0].password
    );

    if (!checkPassword)
      return res.status(400).json("You have entered wrong password!");

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const updatePasswordQuery = `UPDATE ${tableName} SET password = ? WHERE id = ?`;
    db.query(updatePasswordQuery, [hashedPassword, userId], (err, result) => {
      if (err) return res.status(500).json(err);
      return res.json("Updated Successfully");
    });
  });
};

export const incubatorRegister = (req, res) => {
  // Checking if incubator already exists
  const email = req.body.email;
  const phone_number = req.body.phone_number;

  const checkExistingUserQuery =
    "SELECT * FROM incubator_founders WHERE email = ? OR phone_number = ?";

  db.query(
    checkExistingUserQuery,
    [email, phone_number],
    (err, existingUser) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (existingUser.length) {
        return res.status(409).json("User already exists!");
      }

      // Hash the password
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(req.body.password, salt);

      const incubator_name = req.body.incubator_name;
      const incubator_logo = req.body.incubator_logo;

      const checkExistingIncubatorQuery =
        "SELECT * FROM incubators WHERE name = ?";

      db.query(
        checkExistingIncubatorQuery,
        [incubator_name],
        (err, existingIncubator) => {
          if (err) {
            return res.status(500).json(err);
          }

          if (!existingIncubator.length) {
            // Incubator doesn't exist, so insert it
            const insertIncubatorQuery =
              "INSERT INTO incubators (name, logo) VALUES (?, ?)";

            db.query(
              insertIncubatorQuery,
              [incubator_name, incubator_logo],
              (err, incubatorData) => {
                if (err) {
                  return res.status(500).json(err);
                }

                // Incubator inserted, now create the founder
                const incubator_id = incubatorData.insertId;

                const newUserQuery = `
              INSERT INTO incubator_founders (incubator_id, email, password, phone_number, name, role)
              VALUES (?, ?, ?, ?, ?, 'incubator_founder')
            `;

                const values = [
                  incubator_id,
                  email,
                  hashedPassword,
                  phone_number,
                  req.body.name,
                ];

                db.query(newUserQuery, values, (err, data) => {
                  if (err) {
                    return res.status(500).json(err);
                  }

                  const newUser = {
                    id: data.insertId,
                    incubator_id,
                    email,
                    phone_number,
                    name: req.body.name,
                    role: "incubator_founder",
                  };

                  return res.status(200).json(newUser);
                });
              }
            );
          } else {
            // Incubator already exists, create the founder
            const incubator_id = existingIncubator[0].id;

            const newUserQuery = `
            INSERT INTO incubator_founders (incubator_id, email, password, phone_number, name, role)
            VALUES (?, ?, ?, ?, ?, 'incubator_founder')
          `;

            const values = [
              incubator_id,
              email,
              hashedPassword,
              phone_number,
              req.body.name,
            ];

            db.query(newUserQuery, values, (err, data) => {
              if (err) {
                return res.status(500).json(err);
              }

              const newUser = {
                id: data.insertId,
                incubator_id,
                email,
                phone_number,
                name: req.body.name,
                role: "incubator_founder",
              };

              return res.status(200).json(newUser);
            });
          }
        }
      );
    }
  );
};

export const incubatorLogin = (req, res) => {
  const q = "SELECT * FROM incubator_founders WHERE email = ?";

  db.query(q, [req.body.email], async (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0)
      return res
        .status(404)
        .json(
          "No Incubator founder is found with the email you have provided. Please reach out to our team"
        );

    const checkPassword = bcrypt.compareSync(
      req.body.password,
      data[0].password
    );

    if (!checkPassword)
      return res.status(400).json("Wrong password or username!");

    // Fetch the list of startups associated with the incubator
    const startupQuery =
      "SELECT startup_id FROM incubator_startup WHERE incubator_id = ?";
    db.query(startupQuery, [data[0].incubator_id], (err, startupData) => {
      if (err) return res.status(500).json(err);

      const startupIds = startupData.map((startup) => startup.startup_id);

      const token = jwt.sign(
        {
          id: data[0].id,
          role: data[0].role,
          incubator_id: data[0].incubator_id,
          startups: startupIds, // Include the list of startup IDs
        },
        process.env.SECRET
      );

      const { password, ...others } = data[0];

      res.cookie("accessToken", token, {
        httpOnly: true,
        expire: new Date() + 9999,
      });

      return res.json({ token, user: { ...others, startups: startupIds } });
    });
  });
};

export const startupLogin = (req, res) => {
  const q = "SELECT * FROM startup_founders WHERE email = ?";

  db.query(q, [req.body.email], async (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0)
      return res
        .status(404)
        .json(
          "No Startup founder is found with the email you have provided. Please reach out to our team"
        );

    const checkPassword = bcrypt.compareSync(
      req.body.password,
      data[0].password
    );

    if (!checkPassword)
      return res.status(400).json("Wrong password or username!");

    // Fetch incubator_id based on startup_id
    const fetchIncubatorQuery =
      "SELECT incubator_id FROM incubator_startup WHERE startup_id = ?";
    db.query(
      fetchIncubatorQuery,
      [data[0].startup_id],
      (err, incubatorData) => {
        if (err) return res.status(500).json(err);

        const token = jwt.sign(
          {
            id: data[0].id,
            role: data[0].role,
            startup_id: data[0].startup_id,
            incubator_id:
              incubatorData.length > 0 ? incubatorData[0].incubator_id : null, // Get incubator_id or null
          },
          process.env.SECRET
        );

        const { password, ...others } = data[0];

        res.cookie("accessToken", token, {
          httpOnly: true,
          expire: new Date() + 9999,
        });

        return res.json({
          token,
          user: {
            ...others,
            incubator_id:
              incubatorData.length > 0 ? incubatorData[0].incubator_id : null,
          },
        });
      }
    );
  });
};

export const logout = (req, res) => {
  res.clearCookie("accessToken", {
    secure: true,
    sameSite: "none",
  });
  res.json({
    message: "User logged out successfully",
  });
};

export const startupRegister = async (req, res) => {
  const {
    id: startupId,
    incubator_id,
    name: startup_name,
    dpiit_number,
    founders,
    industry,
    referral_code,
    is_draft = false,
    uploadedDocuments,
    requestedDocuments,
    questionnaire,
  } = req.body;

  const link = "http://localhost:3000/startup-founder-registration";

  const emailContent = {
    from: "incubatorsass@gmail.com", // sender email address
    subject: "Referral Code", // email subject
    text: `Your code to register is: ${referral_code}. Please use this link to register - ${link}`, // email body with the code
  };

  try {
    // Checking if the startup already exists
    const checkStartupQuery = "SELECT * FROM startups WHERE id = ?";

    const [startupData] = await query(checkStartupQuery, [startupId]);

    if (!_.isEmpty(startupData)) {
      // If the startup already exists, update its details
      //No need to change any status here
      const updateStartupQuery =
        "UPDATE startups SET dpiit_number = ?, industry = ?, referral_code = ?, name = ? WHERE id = ?";

      await query(updateStartupQuery, [
        dpiit_number,
        industry,
        referral_code,
        startup_name,
        startupId,
      ]);

      const startup_id = _.get(startupData, "id", startupId);

      // Fetch existing founders
      const fetchFoundersQuery =
        "SELECT * FROM startup_founders WHERE startup_id = ?";

      const results = await query(fetchFoundersQuery, [startup_id]);

      const existingFounders = Array.isArray(results) ? results : [results];

      // Update or create founders based on the provided data
      const founderInsertPromises = _.map(founders, async (founder) => {
        const existingFounder = _.find(existingFounders, (ef) => {
          return (
            ef.email == founder.email || ef.phone_number == founder.phone_number
          );
        });

        if (existingFounder) {
          // Founder with matching email or phone number exists, update details
          const { name, email, phone_number, designation } = founder;

          const updateFounderQuery =
            "UPDATE startup_founders SET name = ?,email = ? , phone_number = ?, designation = ? WHERE id = ?";

          await query(updateFounderQuery, [
            name,
            email,
            phone_number,
            designation,
            existingFounder.id,
          ]);
        } else {
          // Founder does not exist, create a new founder
          const { name, email, phone_number, designation } = founder;
          const role = "startup_founder";

          const salt = bcrypt.genSaltSync(10);
          const hashedPassword = bcrypt.hashSync("default_password", salt); // You can set a default password

          const createFounderQuery =
            "INSERT INTO startup_founders (`email`, `password`, `phone_number`, `role`, `designation`, `startup_id`, `name`) VALUES (?, ?, ?, ?, ?, ?, ?)";
          const values = [
            email,
            hashedPassword,
            phone_number,
            role,
            designation,
            startup_id,
            name,
          ];

          await query(createFounderQuery, values);
        }
      });

      // Delete founders that are not in the updated founders list
      const foundersToDelete = _.filter(
        existingFounders,
        (ef) =>
          !founders.some(
            (founder) =>
              ef.email === founder.email ||
              ef.phone_number === founder.phone_number
          )
      );

      for (const founderToDelete of foundersToDelete) {
        const deleteFounderQuery = "DELETE FROM startup_founders WHERE id = ?";
        await query(deleteFounderQuery, [founderToDelete.id]);
      }

      //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.......................................>>>>>>>>>>>>>>>>>>>>>>>>>.
      // Fetch existing documents
      const fetchDocumentsQuery =
        "SELECT * FROM startup_documents WHERE startup_id = ? AND is_requested = ? AND is_onboarding = ?";

      const existingDocumentsResults = await query(fetchDocumentsQuery, [
        startup_id,
        false,
        true,
      ]);

      const existingDocuments = Array.isArray(existingDocumentsResults)
        ? existingDocumentsResults
        : [existingDocumentsResults];

      // Update or create documents based on the provided data
      const documentInsertPromises = _.map(
        uploadedDocuments,
        async (document) => {
          const existingDocument = _.find(
            existingDocuments,
            (ed) => ed.document_name === document.name
          );

          if (existingDocument) {
            // Document with the same name exists, update details
            const {
              name: document_name,
              size: document_size,
              format: document_format,
              isSignatureRequired: is_signature_required,
              url: document_url,
            } = document;

            const updateDocumentQuery =
              "UPDATE startup_documents SET document_size = ?, document_format = ?, is_signature_required = ?, document_url = ? WHERE id = ?";

            await query(updateDocumentQuery, [
              document_size,
              document_format,
              is_signature_required,
              document_url,
              existingDocument.id,
            ]);
          } else {
            // Document does not exist, create a new document
            const {
              name: document_name,
              size: document_size,
              format: document_format,
              isSignatureRequired: is_signature_required,
              url: document_url,
            } = document;

            const createDocumentQuery =
              "INSERT INTO startup_documents (`startup_id`, `document_name`, `document_size`, `document_format`, `is_signature_required`, `document_url`, `is_deleted`, `is_approved`, `is_requested`, `is_onboarding`, `status`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            const values = [
              startup_id,
              document_name,
              document_size,
              document_format,
              is_signature_required,
              document_url,
              false,
              false, // Set is_deleted to false by default
              false, // Set is_approved to false by default
              true,
              "PENDING",
            ];

            await query(createDocumentQuery, values);
          }

          // Soft delete documents not included in the uploadedDocuments array
          _.forEach(existingDocuments, async (existingDoc) => {
            const docExistsInUploads = uploadedDocuments.some(
              (doc) => doc.name === existingDoc.document_name
            );

            if (!docExistsInUploads) {
              // Soft delete the document by updating is_deleted
              const softDeleteDocumentQuery =
                "UPDATE startup_documents SET is_deleted = ? WHERE id = ?";

              await query(softDeleteDocumentQuery, [true, existingDoc.id]);
            }
          });
        }
      );

      // Fetch existing requested documents
      const fetchRequestedDocumentsQuery =
        "SELECT * FROM startup_documents WHERE startup_id = ? AND is_requested = ? AND is_onboarding = ?";

      const existingRequestedDocumentsResults = await query(
        fetchRequestedDocumentsQuery,
        [startup_id, true, true]
      );

      const existingRequestedDocuments = Array.isArray(
        existingRequestedDocumentsResults
      )
        ? existingRequestedDocumentsResults
        : [existingRequestedDocumentsResults];

      // Create or update requested documents based on the provided data
      const requestedDocumentInsertPromises = _.map(
        requestedDocuments,
        async (documentName) => {
          if (documentName) {
            // Only insert non-empty document names
            const existingRequestedDocument = _.find(
              existingRequestedDocuments,
              (rd) => rd.document_name === documentName
            );

            if (!existingRequestedDocument) {
              // Requested document does not exist, create a new requested document
              const createRequestedDocumentQuery =
                "INSERT INTO startup_documents (`startup_id`, `document_name`,`document_size`,`document_url`, `document_format`, `is_signature_required`, `is_requested`, `is_deleted`, `is_approved`, `is_onboarding`, `status`) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?,?, ?)";
              const values = [
                startup_id,
                documentName,
                "",
                "",
                "",
                false,
                true,
                false,
                false,
                true,
                "PENDING",
              ];

              await query(createRequestedDocumentQuery, values);
            }

            // Soft delete documents not included in the uploadedDocuments array
            _.forEach(existingRequestedDocuments, async (existingDoc) => {
              const docExistsInUploads = _.some(
                requestedDocuments,
                (doc) => doc == existingDoc.document_name
              );

              if (!docExistsInUploads) {
                // Soft delete the document by updating is_deleted
                const softDeleteDocumentQuery =
                  "UPDATE startup_documents SET is_deleted = ? WHERE id = ?";

                await query(softDeleteDocumentQuery, [true, existingDoc.id]);
              }
            });
          }
        }
      );

      //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.......................................>>>>>>>>>>>>>>>>>>>>>>>>>.

      // Fetch existing questionnaire responses
      const fetchQuestionnaireQuery =
        "SELECT * FROM questionnaire WHERE startup_id = ?";

      const existingQuestionsResults = await query(fetchQuestionnaireQuery, [
        startup_id,
      ]);

      const existingQuestions = Array.isArray(existingQuestionsResults)
        ? existingQuestionsResults
        : [existingQuestionsResults];

      // Update or create questionnaire responses based on the provided data
      const questionnaireInsertPromises = _.map(
        questionnaire,
        async (section) => {
          const { uid: section_uid, questions } = section;

          const sectionPromises = _.map(questions, async (question) => {
            const {
              question: question_text,
              answer_type,
              uid: question_uid,
              meta_data,
              subQuestions, // Use subQuestions here
            } = question;

            const existingQuestion = _.find(
              existingQuestions,
              (eq) => eq.question_uid === question_uid
            );

            if (existingQuestion) {
              // Question with the same UID exists, update details
              const updateQuestionQuery =
                "UPDATE questionnaire SET question = ?, answer_type = ?, meta_data = ? WHERE id = ?";

              await query(updateQuestionQuery, [
                question_text,
                answer_type,
                JSON.stringify(meta_data || null),
                existingQuestion.id,
              ]);

              // Handle subQuestions here, similar to main questions
              if (subQuestions && subQuestions.length > 0) {
                const subQuestionPromises = _.map(
                  subQuestions,
                  async (subQuestion) => {
                    const {
                      question: sub_question_text,
                      answer_type: sub_answer_type,
                      uid: sub_question_uid,
                      meta_data: sub_meta_data,
                    } = subQuestion;

                    const existingSubQuestion = _.find(
                      existingQuestions,
                      (esq) => esq.question_uid === sub_question_uid
                    );

                    if (existingSubQuestion) {
                      // Subquestion with the same UID exists, update details
                      const updateSubQuestionQuery =
                        "UPDATE questionnaire SET question = ?, answer_type = ?, meta_data = ? WHERE id = ?";

                      await query(updateSubQuestionQuery, [
                        sub_question_text,
                        sub_answer_type,
                        JSON.stringify(sub_meta_data || null),
                        existingSubQuestion.id,
                      ]);
                    } else {
                      // Subquestion does not exist, create a new subquestion
                      const createSubQuestionQuery =
                        "INSERT INTO questionnaire (`startup_id`, `question`, `answer_type`, `question_uid`, `meta_data`, `answer`) VALUES (?, ?, ?, ?, ?, ?)";
                      const subQuestionValues = [
                        startup_id,
                        sub_question_text,
                        sub_answer_type,
                        sub_question_uid,
                        JSON.stringify(sub_meta_data || null),
                        JSON.stringify(null), // You can set the answer as an empty string by default
                      ];

                      await query(createSubQuestionQuery, subQuestionValues);
                    }
                  }
                );

                await Promise.all(subQuestionPromises);
              }
            } else {
              // Question does not exist, create a new question
              const createQuestionQuery =
                "INSERT INTO questionnaire (`startup_id`, `question`, `answer_type`, `question_uid`, `meta_data`, `answer`) VALUES (?, ?, ?, ?, ?, ?)";
              const values = [
                startup_id,
                question_text,
                answer_type,
                question_uid,
                JSON.stringify(meta_data || null),
                JSON.stringify(null), // You can set the answer as an empty string by default
              ];

              await query(createQuestionQuery, values);

              // Handle subQuestions here if they exist
              if (subQuestions && subQuestions.length > 0) {
                const subQuestionPromises = _.map(
                  subQuestions,
                  async (subQuestion) => {
                    const {
                      question: sub_question_text,
                      answer_type: sub_answer_type,
                      uid: sub_question_uid,
                      meta_data: sub_meta_data,
                    } = subQuestion;

                    // Create a new subquestion
                    const createSubQuestionQuery =
                      "INSERT INTO questionnaire (`startup_id`, `question`, `answer_type`, `question_uid`, `meta_data`, `answer`) VALUES (?, ?, ?, ?, ?, ?)";
                    const subQuestionValues = [
                      startup_id,
                      sub_question_text,
                      sub_answer_type,
                      sub_question_uid,
                      JSON.stringify(sub_meta_data || null),
                      JSON.stringify(null), // You can set the answer as an empty string by default
                    ];

                    await query(createSubQuestionQuery, subQuestionValues);
                  }
                );

                await Promise.all(subQuestionPromises);
              }
            }
          });
        }
      );

      // Combine all promises and execute them
      await Promise.all([
        ...founderInsertPromises,
        ...documentInsertPromises,
        ...requestedDocumentInsertPromises,
        ...questionnaireInsertPromises.flat(),
      ]);

      // Update is_draft for existing mapping in incubator_startup
      const updateMappingQuery = `
                UPDATE incubator_startup SET is_draft = ? WHERE incubator_id = ? AND startup_id = ?`;

      const updateValues = [is_draft, incubator_id, startup_id];

      await query(updateMappingQuery, updateValues);

      if (!is_draft) {
        const emailAddresses = _.map(founders, (founder) => founder.email);

        _.forEach(emailAddresses, (recipient) => {
          emailContent.to = recipient; // set the recipient's email address
          transporter.sendMail(emailContent, (error, info) => {
            if (error) {
              console.error(`Error sending email to ${recipient}: ${error}`);
            } else {
              console.log(`Email sent to ${recipient}: ${info.response}`);
            }
          });
        });
      }

      // Send success response
      return res
        .status(200)
        .json("Startup and associated data have been updated.");
    } else {
      // If the startup doesn't exist, create it
      const createStartupQuery =
        "INSERT INTO startups (`name`, `dpiit_number`, `industry`, `referral_code`, `status`) VALUES (?, ?, ?, ?, ?)";

      const result = await query(createStartupQuery, [
        startup_name,
        dpiit_number,
        industry,
        referral_code,
        "PENDING",
      ]);

      const startup_id = result.insertId;

      // Create founders for the startup
      const founderInsertPromises = _.map(founders, async (founder) => {
        const { name, email, phone_number, designation } = founder;
        const role = "startup_founder";

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync("default_password", salt); // You can set a default password

        const createFounderQuery =
          "INSERT INTO startup_founders (`email`, `password`, `phone_number`, `role`, `designation`, `startup_id`, `name`) VALUES (?, ?, ?, ?, ?, ?, ?)";
        const values = [
          email,
          hashedPassword,
          phone_number,
          role,
          designation,
          startup_id,
          name,
        ];

        await query(createFounderQuery, values);
      });

      // Create uploaded documents
      const documentInsertPromises = _.map(
        uploadedDocuments,
        async (document) => {
          const {
            name: document_name,
            size: document_size,
            format: document_format,
            isSignatureRequired: is_signature_required,
            url: document_url,
          } = document;

          const createDocumentQuery =
            "INSERT INTO startup_documents (`startup_id`, `document_name`, `document_size`, `document_format`, `is_signature_required`, `document_url`, `is_deleted`, `is_approved`, `is_requested`, `is_onboarding`, `status`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
          const values = [
            startup_id,
            document_name,
            document_size,
            document_format,
            is_signature_required,
            document_url,
            false,
            false, // Set is_deleted to false by default
            false, // Set is_approved to false by default'
            true,
            "PENDING",
          ];

          await query(createDocumentQuery, values);
        }
      );

      //
      // Create requested documents
      const requestedDocumentInsertPromises = _.map(
        requestedDocuments,
        async (documentName) => {
          if (documentName) {
            // Only insert non-empty document names
            const createRequestedDocumentQuery =
              "INSERT INTO startup_documents (`startup_id`, `document_name`,`document_size`,`document_url`, `document_format`,`is_signature_required`, `is_requested`, `is_deleted`, `is_approved`, `is_onboarding`, `status`) VALUES (?, ?, ?,?, ?, ?, ?, ?, ?,?, ?)";
            const values = [
              startup_id,
              documentName,
              "",
              "",
              "",
              false,
              true,
              false,
              false,
              true,
              "PENDING",
            ];

            await query(createRequestedDocumentQuery, values);
          }
        }
      );

      // Create questionnaire responses
      const questionnaireInsertPromises = _.map(questionnaire, (section) => {
        const { uid: section_uid, questions } = section;
        return questions.map(async (question) => {
          const {
            question: question_text,
            answer_type,
            uid: question_uid,
            meta_data,
            subQuestions,
          } = question;

          const createQuestionQuery =
            "INSERT INTO questionnaire (`startup_id`, `question`, `answer_type`, `question_uid`, `meta_data`, `answer`) VALUES (?, ?, ?, ?, ?, ?)";
          const values = [
            startup_id,
            question_text,
            answer_type,
            question_uid,
            JSON.stringify(meta_data || null),
            JSON.stringify(null), // You can set the answer as an empty string by default
          ];

          const result = await query(createQuestionQuery, values);

          if (subQuestions && subQuestions.length) {
            // If there are subquestions, recursively insert them
            const subQuestionInsertPromises = subQuestions.map(
              async (subQuestion) => {
                const {
                  question: sub_question_text,
                  answer_type: sub_answer_type,
                  uid: sub_question_uid,
                  meta_data: sub_meta_data,
                } = subQuestion;

                const createSubQuestionQuery =
                  "INSERT INTO questionnaire (`startup_id`, `question`, `answer_type`, `question_uid`, `meta_data`, `answer`) VALUES (?, ?, ?, ?, ?, ?)";
                const subValues = [
                  startup_id,
                  sub_question_text,
                  sub_answer_type,
                  sub_question_uid,
                  JSON.stringify(sub_meta_data || null),
                  JSON.stringify(null), // You can set the answer as an empty string by default
                ];

                return query(createSubQuestionQuery, subValues);
              }
            );

            // Wait for all subquestion insertions to complete
            await Promise.all(subQuestionInsertPromises);
          }
        });
      });

      // Combine all promises and execute them
      await Promise.all([
        ...founderInsertPromises,
        ...documentInsertPromises,
        ...requestedDocumentInsertPromises,
        ...questionnaireInsertPromises.flat(),
      ]);

      // Add mapping for incubator_id and startup_id in incubator_startup
      const createMappingQuery =
        "INSERT INTO incubator_startup (`incubator_id`, `startup_id`, `is_draft`) VALUES (?, ?, ?)";
      const mappingValues = [incubator_id, startup_id, is_draft];

      await query(createMappingQuery, mappingValues);

      // Send success response

      if (!is_draft) {
        const emailAddresses = _.map(founders, (founder) => founder.email);

        _.forEach(emailAddresses, (recipient) => {
          emailContent.to = recipient; // set the recipient's email address
          transporter.sendMail(emailContent, (error, info) => {
            if (error) {
              console.error(`Error sending email to ${recipient}: ${error}`);
            } else {
              console.log(`Email sent to ${recipient}: ${info.response}`);
            }
          });
        });
      }

      return res
        .status(200)
        .json("Startup and associated data have been created.");
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json(error);
  }
};

export const startupFounderRegister = (req, res) => {
  const { name, email, password, referral_code } = req.body;

  // Check if a startup with the provided name and referral_code exists
  const findStartupQuery =
    "SELECT sf.id, sf.role, s.id as startup_id, s.referral_code, sf.password FROM startups s INNER JOIN startup_founders sf ON s.id = sf.startup_id WHERE sf.email = ? AND s.referral_code = ?";
  db.query(findStartupQuery, [email, referral_code], (err, startupData) => {
    if (err) return res.status(500).json(err);

    // If no startup found, return an error
    if (startupData.length === 0) {
      return res.status(404).json("Invalid user");
    }

    const startup = startupData[0];

    //To eliminate duplicate updating! once it's not default, that means it user already updated
    const checkPassword = bcrypt.compareSync(
      "default_password",
      startup.password
    );
    if (!checkPassword) {
      return res.status(400).json("Founder has been registered already!");
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const updatePasswordQuery =
      "UPDATE startup_founders SET password = ? WHERE id = ?";
    db.query(
      updatePasswordQuery,
      [hashedPassword, startup.id],
      (err, result) => {
        if (err) return res.status(500).json(err);
      }
    );

    const token = jwt.sign(
      {
        id: startup.id,
        role: startup.role,
        startup_id: startup.startup_id,
      },
      process.env.SECRET
    );

    res.cookie("accessToken", token, {
      httpOnly: true,
      expire: new Date() + 9999,
    });

    return res.json({
      token,
      user: { ...startup },
    });
  });
};
