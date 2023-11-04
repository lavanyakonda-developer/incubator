import React, { useEffect, useState } from 'react';
import { makeRequest } from '../../../../axios';
import classes from './BusinessUpdates.module.css';
import _ from 'lodash';
import { useParams } from 'react-router-dom';
import { businessUpdateQuestions } from './helper';
import { Button } from '../../../../CommonComponents';

const BusinessUpdates = () => {
  const [timePeriods, setTimePeriods] = useState([]);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState('');
  const [businessUpdateAnswers, setBusinessUpdateAnswers] = useState([]);
  const { startup_id, incubator_id: incubatorId } = useParams();
  const isIncubatorFounder = !_.isEmpty(incubatorId);

  const handleAnswerChange = (uid, value) => {
    // Check if an answer with the same UID exists in the array
    const existingAnswerIndex = businessUpdateAnswers.findIndex(
      (answer) => answer.uid === uid
    );

    if (existingAnswerIndex !== -1) {
      // If an answer with the same UID exists, update its value
      const updatedAnswers = [...businessUpdateAnswers];
      updatedAnswers[existingAnswerIndex].answer = value;

      // Update the state with the new array
      setBusinessUpdateAnswers(updatedAnswers);
    } else {
      // If no answer with the same UID exists, add a new answer to the array
      const newAnswer = {
        startup_id,
        time_period: selectedTimePeriod,
        uid,
        answer: value,
      };

      const updatedAnswers = [...businessUpdateAnswers, newAnswer];
      setBusinessUpdateAnswers(updatedAnswers);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await makeRequest.post(`startup/get-time-periods`, {
          startup_id,
        });

        if (response.status === 200) {
          const data = response.data;
          setTimePeriods(data?.timePeriods);

          const currentDate = new Date();
          const currentYear = currentDate.getFullYear();
          const currentMonth = currentDate.getMonth() + 1;

          const currentQuarter = _.find(data?.timePeriods, (item) => {
            return (
              item.year === currentYear && _.includes(item.months, currentMonth)
            );
          });

          setSelectedTimePeriod(currentQuarter?.id);
        } else {
          console.error('Error fetching data:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await makeRequest.post(
          `startup/get-business-update-answers`,
          {
            startup_id,
            time_period: selectedTimePeriod,
          }
        );

        if (response.status === 200) {
          const data = response.data;
          setBusinessUpdateAnswers(data?.answers);
        } else {
          console.error('Error fetching data:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (selectedTimePeriod) {
      fetchData();
    }
  }, [selectedTimePeriod]);

  const onSave = async () => {
    try {
      await makeRequest.post(`startup/update-business-update-answers`, {
        startup_id,
        time_period: selectedTimePeriod,
        answers: businessUpdateAnswers,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={classes.container}>
      <div className={classes.topContainer}>
        <select
          style={{ margin: '8px 0px', width: '20%', height: 30 }}
          onChange={(e) => {
            setSelectedTimePeriod(
              _.find(timePeriods, { quarter: e.target.value })?.id
            );
          }}
          value={_.find(timePeriods, { id: selectedTimePeriod })?.quarter || ''}
        >
          {_.map(timePeriods, (option) => (
            <option key={option.id} value={option.quarter}>
              {option.quarter}
            </option>
          ))}
        </select>
        {!isIncubatorFounder && <Button name={'Save'} onClick={onSave} />}
      </div>
      <div className={classes.bottomContainer}>
        {_.map(businessUpdateQuestions, (question) => {
          return (
            <>
              <h4>{question?.question}</h4>
              <textarea
                style={{ width: '90%', color: 'black', padding: 12 }}
                onChange={(e) =>
                  handleAnswerChange(question.uid, e.target.value)
                }
                value={
                  _.find(businessUpdateAnswers, {
                    uid: question.uid,
                  })?.answer || ''
                }
                disabled={isIncubatorFounder}
              />
            </>
          );
        })}
      </div>
    </div>
  );
};

export default BusinessUpdates;
