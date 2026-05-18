import React, { useEffect, useState } from 'react'
import { CChartPie, CChartDoughnut } from '@coreui/react-chartjs'
import 'chart.js/auto'

const ChartBase = ({ type, data, options }) => {
  const ChartComponent = type === 'pie' ? CChartPie : CChartDoughnut
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200,
  )

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const handleResize = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isMobile = viewportWidth < 576
  const isTablet = viewportWidth >= 576 && viewportWidth < 992
  const legendOverrides = options?.plugins?.legend || {}
  const forcedLegendPosition = legendOverrides.position
  const legendPosition = forcedLegendPosition || (isTablet || isMobile ? 'bottom' : 'right')
  const legendPadding = isMobile ? 10 : isTablet ? 12 : 14
  const legendFontSize = isMobile ? 10 : 11
  const chartRadius = legendPosition === 'right' ? '62%' : isMobile ? '72%' : '70%'
  const chartPadding = isMobile ? 4 : isTablet ? 6 : 8
  const legendLabelOverrides = legendOverrides.labels || {}
  const tooltipOverrides = options?.plugins?.tooltip || {}
  const incomingPlugins = options?.plugins || {}
  const incomingElements = options?.elements || {}
  const resolvedRadius = options?.radius || chartRadius
  const showPercentages = options?.showPercentages !== false

  const percentageLabelsPlugin = {
    id: 'appPercentageLabels',
    afterDatasetsDraw(chart) {
      if (!showPercentages || type !== 'pie') return

      const dataset = chart.data?.datasets?.[0]
      const values = Array.isArray(dataset?.data) ? dataset.data : []
      const total = values.reduce((sum, value) => sum + Number(value || 0), 0)
      if (!total) return

      const { ctx } = chart
      ctx.save()

      chart.getDatasetMeta(0)?.data?.forEach((slice, index) => {
        const value = Number(values[index] || 0)
        if (!value) return

        const percentage = Math.round((value / total) * 100)
        if (percentage < 7) return

        const { x, y } = slice.tooltipPosition()
        ctx.fillStyle = '#ffffff'
        ctx.font = `600 ${isMobile ? 12 : 14}px DM Sans, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(`${percentage}%`, x, y)
      })

      ctx.restore()
    },
  }

  const themedOptions = {
    responsive: true,
    ...options,
    maintainAspectRatio: true,
    aspectRatio: 1,
    radius: resolvedRadius,
    layout: {
      padding: {
        top: chartPadding,
        right: legendPosition === 'right' ? chartPadding + 6 : chartPadding,
        bottom: chartPadding,
        left: chartPadding,
        ...(options?.layout?.padding || {}),
      },
    },
    plugins: {
      ...incomingPlugins,
      legend: {
        ...legendOverrides,
        position: legendPosition,
        align: legendPosition === 'right' ? 'center' : 'start',
        labels: {
          ...legendLabelOverrides,
          color: '#24423d',
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: isMobile ? 7 : 8,
          boxHeight: isMobile ? 7 : 8,
          padding: legendPadding,
          font: {
            size: legendFontSize,
            weight: '600',
          },
        },
      },
      tooltip: {
        ...tooltipOverrides,
        backgroundColor: 'rgba(6, 60, 54, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#ebfffb',
        borderColor: 'rgba(72, 181, 157, 0.32)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        usePointStyle: true,
        cornerRadius: 12,
      },
    },
    elements: {
      ...incomingElements,
      arc: {
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverBorderWidth: 2,
        hoverBorderColor: '#ffffff',
        borderRadius: 0,
        spacing: 0,
        ...(options?.elements?.arc || {}),
      },
    },
  }

  return <ChartComponent data={data} options={themedOptions} plugins={[percentageLabelsPlugin]} />
}

export default ChartBase
