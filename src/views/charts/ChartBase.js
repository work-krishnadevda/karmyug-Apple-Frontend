import React from 'react';
import { CChartPie, CChartDoughnut } from '@coreui/react-chartjs';
import 'chart.js/auto';

const ChartBase = ({ type, data, options }) => {
  const ChartComponent = type === 'pie' ? CChartPie : CChartDoughnut;
  return <ChartComponent data={data} options={options} />;
};

export default ChartBase;
