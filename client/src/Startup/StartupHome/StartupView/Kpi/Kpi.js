import React, { useEffect, useState } from 'react';
import { makeRequest } from '../../../../axios';
import classes from './Kpi.module.css';
import _ from 'lodash';
import { useParams } from 'react-router-dom';
import { Button } from '../../../../CommonComponents';

const getUpdatedTimePeriods = ({ timePeriods }) => {
  const updatedTimePeriods = _.map(timePeriods, (period, index) => {
    return { ...period, id: index, ids: [period.id] };
  });

  const groupedYears = _.groupBy(timePeriods, 'year');

  const financialYears = _.map(groupedYears, (yearTimePeriods, year) => {
    const ids = _.flatMap(yearTimePeriods, 'id');
    const allMonths = _.uniq(_.flatMap(yearTimePeriods, 'months'));
    const id = timePeriods.length + parseInt(year); // Assign a unique ID for the year
    return { quarter: `FY - ${parseInt(year)}`, id, ids, months: allMonths };
  });

  return [
    ...updatedTimePeriods,
    ...financialYears,
    {
      ids: _.map(timePeriods, (item) => item.id),
      id: 'all',
      quarter: 'All years',
    },
  ];
};

const Kpi = () => {
  const [timePeriods, setTimePeriods] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState('');
  const [selectedMetric, setSelectedMetric] = useState('');
  const [months, setMonths] = useState([]);

  const [allValues, setAllValues] = useState([]);
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
          const updatedTimePeriods = getUpdatedTimePeriods({
            timePeriods: _.get(timePeriodsData, 'timePeriods', []),
          });
          setTimePeriods(updatedTimePeriods);

          const currentDate = new Date();
          const currentYear = currentDate.getFullYear();
          const currentMonth = currentDate.getMonth() + 1;

          const currentQuarter = _.find(updatedTimePeriods, (item) => {
            return (
              item.year === currentYear && _.includes(item.months, currentMonth)
            );
          });

          setSelectedTimePeriod(currentQuarter?.id);

          const metricsData = metricsResponse.data;

          setMetrics(_.get(metricsData, 'metrics', []));
          setSelectedMetric(_.first(metricsData?.metrics)?.uid);

          const metricValuesData = metricValuesResponse.data;

          setAllValues(_.get(metricValuesData, 'metricValues', []));

          setMonths(_.get(monthsResponse, 'data.months'), []);

          setMetricValues(
            _.filter(_.get(metricValuesData, 'metricValues', []), (value) => {
              const ids = _.get(
                _.find(timePeriods, (item) => item.id == selectedTimePeriod),
                'ids',
                []
              );
              return (
                _.includes(ids, value?.time_period) &&
                value?.metric_uid == selectedMetric
              );
            })
          );
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

  useEffect(() => {
    setMetricValues(
      _.filter(allValues, (value) => {
        const ids = _.get(
          _.find(timePeriods, (item) => item.id == selectedTimePeriod),
          'ids',
          []
        );
        return (
          _.includes(ids, value?.time_period) &&
          value?.metric_uid == selectedMetric
        );
      })
    );
  }, [selectedTimePeriod, selectedMetric]);

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
