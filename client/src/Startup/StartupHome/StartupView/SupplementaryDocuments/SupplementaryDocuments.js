import React, { useState, useEffect } from 'react';
import { makeRequest } from '../../../../axios';
import classes from './SupplementaryDocuments.module.css';
import _ from 'lodash';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../../CommonComponents';
import { DocumentsContainer } from '../../../../Incubator/StartupHomeView/helper';

const SupplementaryDocuments = () => {
  const { incubator_id: incubatorId, startup_id: startupId } = useParams();
  const [pendingDocuments, setPendingDocuments] = useState([]);
  const [approvedDocuments, setApprovedDocuments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await makeRequest.post(
          `startup/startup-supplementary-documents`,
          {
            startup_id: startupId,
          }
        );

        if (response.status === 200) {
          const data = response.data;

          setPendingDocuments(data.pendingDocuments);
          setApprovedDocuments(data.approvedDocuments);
        } else {
          console.error('Error fetching data:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (startupId) {
      fetchData();
    }
  }, [startupId]);

  return (
    <div className={classes.container}>
      <div className={classes.documentsContainer}>
        <h3>Pending Documents</h3>
        <DocumentsContainer documents={pendingDocuments} />
      </div>
      <div className={classes.documentsContainer}>
        <h3>Approved Documents</h3>
        <DocumentsContainer documents={approvedDocuments} />
      </div>
    </div>
  );
};

export default SupplementaryDocuments;
