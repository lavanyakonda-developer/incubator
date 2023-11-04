import React, { useEffect, useState } from 'react';
import { makeRequest } from '../../../../axios';
import classes from './Mie.module.css';
import _ from 'lodash';
import { useParams } from 'react-router-dom';
import { Button } from '../../../../CommonComponents';

const Mie = () => {
  const { startup_id, incubator_id: incubatorId } = useParams();
  const isIncubatorFounder = !_.isEmpty(incubatorId);
  const [mie, setMie] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await makeRequest.post(`startup/get-mie`, {
          startup_id,
        });
        if (response.status === 200) {
          const data = response.data;
          setMie(data?.mie);
        } else {
          console.error('Error fetching data:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const onSave = async () => {
    try {
      await makeRequest.post(`startup/update-mie`, {
        startup_id,
        mie,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className={classes.header}>
        <h4>{'Mandatory Information Exchange'}</h4>
        {!isIncubatorFounder && <Button name={'Save'} onClick={onSave} />}
      </div>
      <textarea
        style={{ width: '90%', marginTop: 60, color: 'black', padding: 16 }}
        onChange={(e) => setMie(e.target.value)}
        value={mie}
        rows={10}
        disabled={isIncubatorFounder}
      />
    </>
  );
};

export default Mie;
