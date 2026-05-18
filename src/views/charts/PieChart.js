import React from 'react'
import ChartBase from './ChartBase'

const themePalette = [
  '#066054',
  '#0a7467',
  '#159887',
  '#2bb3a1',
  '#58c7b8',
  '#85d9cf',
  '#b1ebe5',
  '#d6f6f2',
]

const applyThemePalette = (datasets = []) =>
  datasets.map((dataset) => {
    const pointCount = Array.isArray(dataset?.data) ? dataset.data.length : themePalette.length
    const palette = Array.from(
      { length: pointCount },
      (_, index) => themePalette[index % themePalette.length],
    )

    return {
      ...dataset,
      backgroundColor: palette,
      hoverBackgroundColor: palette,
      hoverOffset: dataset?.hoverOffset ?? 0,
    }
  })

const PieChart = ({ data, options, className = '' }) => {
  const themedData = {
    ...data,
    datasets: applyThemePalette(data?.datasets),
  }

  return (
    <div className={`app-themed-pie-chart ${className}`.trim()}>
      <div className="app-themed-pie-chart__canvas">
        <ChartBase type="pie" data={themedData} options={options} />
      </div>
    </div>
  )
}

export default PieChart
