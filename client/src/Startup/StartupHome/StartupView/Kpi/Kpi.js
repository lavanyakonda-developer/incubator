import React, { useEffect, useState } from 'react';
import { makeRequest } from '../../../../axios';
import classes from './Kpi.module.css';
import _ from 'lodash';
import { useParams } from 'react-router-dom';
import { Button } from '../../../../CommonComponents';

const Kpi = () => {
  const [timePeriods, setTimePeriods] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState('');
  const [selectedMetric, setSelectedMetric] = useState('');
  const [months, setMonths] = useState([]);

  const [metricValues, setMetricValues] = useState([]);
  const { startup_id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const timePeriodsResponse = await makeRequest.post(
          `startup/get-time-periods`,
          {
            startup_id,
          }
        );
        const metricsResponse = await makeRequest.post(`startup/get-metrics`, {
          startup_id,
        });

        const metricValuesResponse = await makeRequest.post(
          `startup/get-metric-values`,
          {
            startup_id,
          }
        );

        const monthsResponse = await makeRequest.post(`startup/get-months`);

        if (
          timePeriodsResponse.status === 200 &&
          metricsResponse.status === 200 &&
          metricValuesResponse.status === 200
        ) {
          const timePeriodsData = timePeriodsResponse.data;
          setTimePeriods(_.get(timePeriodsData, 'timePeriods', []));

          const currentDate = new Date();
          const currentYear = currentDate.getFullYear();
          const currentMonth = currentDate.getMonth() + 1;

          const currentQuarter = _.find(
            _.get(timePeriodsData, 'timePeriods', []),
            (item) => {
              return (
                item.year === currentYear &&
                _.includes(item.months, currentMonth)
              );
            }
          );

          setSelectedTimePeriod(currentQuarter?.id);

          const metricsData = metricsResponse.data;

          setMetrics(_.get(metricsData, 'metrics', []));
          setSelectedMetric(_.first(metricsData?.metrics)?.uid);

          const metricValuesData = metricValuesResponse.data;

          setMetricValues(_.get(metricValuesData, 'metricValues', []));

          setMonths(_.get(monthsResponse, 'data.months'), []);
        } else {
          console.error(
            'Error fetching data:',
            timePeriodsResponse,
            metricsResponse
          );
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const onSave = () => {};

  console.log(
    'metrics, metricValues',
    metrics,
    metricValues,
    months,
    timePeriods
  );

  return (
    <div className={classes.container}>
      <div className={classes.topContainer}>
        <div className={classes.dropdowns}>
          <select
            style={{ margin: '8px 0px', width: '20%', height: 30 }}
            onChange={(e) => {
              setSelectedTimePeriod(
                _.find(timePeriods, { quarter: e.target.value })?.id
              );
            }}
            value={
              _.find(timePeriods, { id: selectedTimePeriod })?.quarter || ''
            }
          >
            <option value=''>Select</option>
            {_.map(timePeriods, (option) => (
              <option key={option.id} value={option.quarter}>
                {option.quarter}
              </option>
            ))}
          </select>
          <select
            style={{ margin: '8px 0px', width: '20%', height: 30 }}
            onChange={(e) => {
              setSelectedMetric(
                _.find(metrics, { label: e.target.value })?.uid
              );
            }}
            value={_.find(metrics, { uid: selectedMetric })?.label || ''}
          >
            <option value=''>Select</option>
            {_.map(metrics, (option) => (
              <option key={option.uid} value={option.label}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <Button name={'Save'} onClick={onSave} />
      </div>
    </div>
  );
};

export default Kpi;
