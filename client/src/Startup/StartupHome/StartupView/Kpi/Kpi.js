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

  const groupedYears = _.groupBy(updatedTimePeriods, 'fyear');

  const financialYears = _.map(groupedYears, (yearTimePeriods, fyear) => {
    const ids = _.orderBy(
      _.uniq(_.flatMap(yearTimePeriods, 'ids')),
      [
        (id) => {
          const timePeriod = _.find(timePeriods, (item) => item.id === id);

          return timePeriod.year;
        },
        (id) => {
          const timePeriod = _.find(timePeriods, (item) => item.id === id);
          const monthsArray = timePeriod.months;
          return _.max(monthsArray);
        },
      ],
      ['asc', 'asc']
    );

    const allMonths = _.uniq(_.flatMap(yearTimePeriods, 'months'));
    const id = timePeriods.length + parseInt(fyear); // Assign a unique ID for the fyear
    return {
      quarter: `FY - (${parseInt(fyear - 1)}-${parseInt(fyear)})`,
      id,
      ids,
      months: allMonths,
    };
  });

  return [
    ...updatedTimePeriods,
    ...financialYears,
    {
      ids: _.orderBy(
        _.map(timePeriods, (item) => item.id),
        [
          (id) => {
            const timePeriod = _.find(timePeriods, (item) => item.id === id);

            return timePeriod.year;
          },
          (id) => {
            const timePeriod = _.find(timePeriods, (item) => item.id === id);
            const monthsArray = timePeriod.months;
            return _.max(monthsArray);
          },
        ],
        ['asc', 'asc']
      ),
      id: 'ALL',
      quarter: 'All years',
      months: _.uniq(_.flatMap(timePeriods, 'months')),
    },
  ];
};

const getTableData = ({
  timePeriods,
  selectedTimePeriod,
  allQuarters,
  months,
  metricValues,
  selectedMetric,
}) => {
  const selectedTimePeriodData = _.find(
    timePeriods,
    (item) => item.id == selectedTimePeriod
  );
  const quarterIds = _.get(selectedTimePeriodData, 'ids', []);
  const tableHeaders = [];
  const tableValues = [];
  const tablePercentages = [];
  const logs = [];

  _.forEach(quarterIds, (quarterId) => {
    const quarter = _.find(allQuarters, (item) => item.id == quarterId);
    const monthIds = _.get(quarter, 'months', []);

    _.forEach(monthIds, (monthId) => {
      tableHeaders.push({
        id: `${quarterId}-${monthId}-header`,
        label: `${_.find(months, (month) => month.id == monthId)?.month}-${
          quarter?.year
        }`,
      });

      const metricValue = _.find(
        metricValues,
        (item) =>
          item.month_id == monthId &&
          item.time_period == quarterId &&
          item.metric_uid == selectedMetric
      );

      const currentValue = _.get(metricValue, 'value', 0);
      tableValues.push({
        id: `${quarterId}-${monthId}-value`,
        value: currentValue,
        time_period: quarterId,
        month_id: monthId,
        metric_uid: metricValue?.metric_uid,
      });

      const prevMonthId = monthId == 1 ? 12 : monthId - 1;

      const quarterData = _.find(allQuarters, (item) => item.id == quarterId);

      const prevQuarterId =
        monthId == 4
          ? _.find(
              allQuarters,
              (item) =>
                _.includes(item.months, prevMonthId) &&
                item.fyear == quarterData.fyear - 1
            )?.id
          : _.includes([7, 10, 1], monthId)
          ? _.find(
              allQuarters,
              (item) =>
                _.includes(item.months, prevMonthId) &&
                item.fyear == quarterData.fyear
            )?.id
          : quarterId;

      const prevMetricValue = _.find(
        metricValues,
        (item) =>
          item.month_id == prevMonthId &&
          item.time_period == prevQuarterId &&
          item.metric_uid == selectedMetric
      );

      const prevValue = _.get(prevMetricValue, 'value', 0);

      const percentageChange =
        ((currentValue - prevValue) /
          (prevValue !== 0
            ? prevValue
            : currentValue !== 0
            ? currentValue
            : 1)) *
        100;
      const formattedPercentageChange =
        percentageChange == 0
          ? '0%'
          : percentageChange < 0
          ? `${percentageChange.toFixed(2)}%`
          : `${percentageChange.toFixed(2)}%`;

      tablePercentages.push({
        id: `${prevQuarterId}-${prevMonthId}-percentage`,
        value: formattedPercentageChange,
      });

      console.log('>>>>>>>>>>>>>>>>>>>>metricValue', metricValue);
      logs.push({
        id: `${quarterId}-${monthId}-log`,
        label: `${_.find(months, (month) => month.id == monthId)?.month}-${
          quarter?.year
        }`,
        value: _.map(metricValue?.logs, (item) => {
          const changeDate = new Date(item.change_date);
          const formattedDate = changeDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
          return `${item?.changed_by} changed value from ${item.old_value} to ${item.new_value} on ${formattedDate}`;
        }),
      });
    });
  });

  return {
    tableHeaders,
    tableValues,
    tablePercentages,
    logs: _.filter(logs, (item) => !_.isEmpty(item.value)),
  };
};

const Kpi = () => {
  const [timePeriods, setTimePeriods] = useState([]);
  const [allQuarters, setAllQuarters] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState('');
  const [selectedMetric, setSelectedMetric] = useState('');
  const [months, setMonths] = useState([]);
  const [allValues, setAllValues] = useState([]);
  const [metricValues, setMetricValues] = useState([]);
  const [showLogsModal, setShowLogsModal] = useState(false);

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
          setAllQuarters(_.get(timePeriodsData, 'timePeriods', []));
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

  const onClickLogButton = () => {
    setShowLogsModal(true);
  };

  const closeModal = () => {
    setShowLogsModal(false);
  };

  const { tableHeaders, tableValues, tablePercentages, logs } = getTableData({
    timePeriods,
    selectedTimePeriod,
    selectedMetric,
    allQuarters,
    months,
    metricValues: allValues,
  });

  console.log('********metricValues*********', { logs });
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
            {_.map(metrics, (option) => (
              <option key={option.uid} value={option.label}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className={classes.buttonContainer}>
          <Button name={'View changed logs'} onClick={onClickLogButton} />
          <Button name={'Save'} onClick={onSave} />
        </div>
      </div>

      <div className={classes.bottomContainer}>
        <table className={classes.myTable}>
          <thead>
            <tr>
              <th className={classes.cellLabel}>
                {
                  _.find(timePeriods, (item) => item.id == selectedTimePeriod)
                    ?.quarter
                }
              </th>
              {_.map(tableHeaders, (header) => {
                return (
                  <th key={header.id} className={classes.cellLabel}>
                    {header.label}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={classes.cellLabel}>Values</td>
              {_.map(tableValues, (value) => {
                return (
                  <td key={value.id} className={classes.cellValue}>
                    {value?.value}
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className={classes.cellLabel}>Percentages</td>
              {_.map(tablePercentages, (value) => {
                return (
                  <td key={value.id} className={classes.cellValue}>
                    {value?.value}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
      {showLogsModal && (
        <div className={classes.modalBackground}>
          <div className={classes.modal}>
            <div className={classes.modalContent}>
              <div className={classes.modalTopContent}>{'Changed Logs'}</div>
              <div
                className={classes.signature}
                style={_.isEmpty(logs) ? { justifyContent: 'center' } : {}}
              >
                {_.isEmpty(logs) ? (
                  <div>{'No logs'} </div>
                ) : (
                  <div className={classes.logs}>
                    {_.map(logs, (item) => {
                      return (
                        <div className={classes.log}>
                          <h4>{item?.label}</h4>
                          <div className={classes.log}>
                            {_.map(item?.value, (i) => (
                              <span>{i}</span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className={classes.buttons}>
                <Button
                  name={'Close'}
                  onClick={closeModal}
                  customStyles={{ backgroundColor: '#ff6d6d' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Kpi;
