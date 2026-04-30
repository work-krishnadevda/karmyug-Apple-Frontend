import React, { useEffect, useState } from 'react'
import { CCard, CCardHeader, CCardBody } from '@coreui/react'
import { Pie, Bar, Line } from 'react-chartjs-2'
import BasicProvider from 'src/constants/BasicProvider'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement)

const LeaveAnalytics = () => {
  const [clVsUl, setClVsUl] = useState({ cl: 0, ul: 0 })
  const [departmentUsage, setDepartmentUsage] = useState([])
  const [monthlyTrend, setMonthlyTrend] = useState([])

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      // CL vs UL
      const clUlRes = await new BasicProvider('leaves/analytics/cl-ul').getRequest()
      setClVsUl(clUlRes.data)

      // Department-wise usage
      const deptRes = await new BasicProvider('leaves/analytics/department').getRequest()
      setDepartmentUsage(deptRes.data)

      // Monthly trend
      const monthRes = await new BasicProvider('leaves/analytics/monthly-trend').getRequest()
      setMonthlyTrend(monthRes.data)
    } catch (err) {
      console.error('Error fetching analytics', err)
    }
  }

  // CL vs UL Pie Chart
  const pieData = {
    labels: ['CL Taken', 'UL Taken'],
    datasets: [
      {
        data: [clVsUl.cl, clVsUl.ul],
        backgroundColor: ['#0d6efd', '#dc3545'],
      },
    ],
  }

  // Department Bar Chart
  const barData = {
    labels: departmentUsage.map((d) => d.department),
    datasets: [
      {
        label: 'CL Taken',
        data: departmentUsage.map((d) => d.cl),
        backgroundColor: '#0d6efd',
      },
      {
        label: 'UL Taken',
        data: departmentUsage.map((d) => d.ul),
        backgroundColor: '#dc3545',
      },
    ],
  }

  // Monthly Line Chart
  const lineData = {
    labels: monthlyTrend.map((m) => m.month),
    datasets: [
      {
        label: 'CL Taken',
        data: monthlyTrend.map((m) => m.cl),
        borderColor: '#0d6efd',
        backgroundColor: 'rgba(13,110,253,0.2)',
        tension: 0.3,
      },
      {
        label: 'UL Taken',
        data: monthlyTrend.map((m) => m.ul),
        borderColor: '#dc3545',
        backgroundColor: 'rgba(220,53,69,0.2)',
        tension: 0.3,
      },
    ],
  }

  return (
    <>
      <CCard className="m-3">
        <CCardHeader>CL vs UL Taken (Overall)</CCardHeader>
        <CCardBody>
          <Pie data={pieData} />
        </CCardBody>
      </CCard>

      <CCard className="m-3">
        <CCardHeader>Department-wise Leave Usage</CCardHeader>
        <CCardBody>
          <Bar data={barData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
        </CCardBody>
      </CCard>

      <CCard className="m-3">
        <CCardHeader>Monthly Leave Trend (Last 6 Months)</CCardHeader>
        <CCardBody>
          <Line data={lineData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
        </CCardBody>
      </CCard>
    </>
  )
}

export default LeaveAnalytics
