import React from 'react';
import ChartBase from './ChartBase'; // Import the base chart component

const DonutChart = ({ data, options }) => (
  <div  style={{
    width: "250px",
    height: "250px",
    // backgroundColor: "#EEEEEE",
    // borderRadius: "10px", /* Adjust the radius as needed */
  }}>
  <ChartBase type="doughnut" data={data} options={options} />
  </div>
);

export default DonutChart;
