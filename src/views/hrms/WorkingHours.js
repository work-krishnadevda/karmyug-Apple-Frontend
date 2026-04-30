import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
  CSpinner,
  CProgress,
  CFormSelect,
  CWidgetStatsF,
} from '@coreui/react'
import { cilClock, cilCalendar, cilChartLine, cilArrowTop } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useDispatch } from 'react-redux'
import BasicProvider from 'src/constants/BasicProvider'

const WorkingHours = () => {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(true)
  const [workingHoursData, setWorkingHoursData] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState('week')

  useEffect(() => {
    fetchWorkingHoursData()
  }, [selectedPeriod])

  const fetchWorkingHoursData = async () => {
    try {
      setLoading(true)
      const response = await new BasicProvider(
        `hrms/working-hours/analysis?period=${selectedPeriod}`,
        dispatch
      ).getRequest()
      setWorkingHoursData(response.data)
    } catch (error) {
      console.error('Error fetching working hours data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (minutes) => {
    if (!minutes) return '0h 0m'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const getEfficiencyColor = (percentage) => {
    if (percentage >= 100) return 'success'
    if (percentage >= 80) return 'warning'
    return 'danger'
  }

  const getEfficiencyText = (percentage) => {
    if (percentage >= 100) return 'Excellent'
    if (percentage >= 80) return 'Good'
    if (percentage >= 60) return 'Average'
    return 'Below Average'
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <CSpinner size="lg" />
      </div>
    )
  }

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Working Hours Analysis</h2>
            <CFormSelect
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              style={{ width: '200px' }}
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </CFormSelect>
          </div>
        </CCol>
      </CRow>

      {/* Summary Stats */}
      <CRow className="mb-4">
        <CCol sm={6} lg={3}>
          <CWidgetStatsF
            className="mb-4"
            icon={<CIcon icon={cilClock} height={24} />}
            title="Total Hours"
            value={formatDuration(workingHoursData?.summary?.totalHours || 0)}
            color="primary"
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <CWidgetStatsF
            className="mb-4"
            icon={<CIcon icon={cilCalendar} height={24} />}
            title="Working Days"
            value={workingHoursData?.summary?.workingDays || 0}
            color="info"
          />
        </CCol>
        <CCol sm={6} lg={3}>
                     <CWidgetStatsF
             className="mb-4"
             icon={<CIcon icon={cilArrowTop} height={24} />}
             title="Average/Day"
             value={formatDuration(workingHoursData?.summary?.averagePerDay || 0)}
             color="success"
           />
        </CCol>
        <CCol sm={6} lg={3}>
          <CWidgetStatsF
            className="mb-4"
            icon={<CIcon icon={cilChartLine} height={24} />}
            title="Efficiency"
            value={`${workingHoursData?.summary?.efficiency || 0}%`}
            color="warning"
          />
        </CCol>
      </CRow>

      {/* Efficiency Overview */}
      <CRow className="mb-4">
        <CCol md={6}>
          <CCard>
            <CCardHeader>
              <h5 className="mb-0">Efficiency Overview</h5>
            </CCardHeader>
            <CCardBody>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Target Hours</span>
                  <span>{formatDuration(workingHoursData?.summary?.targetHours || 0)}</span>
                </div>
                <CProgress 
                  value={100} 
                  color="info" 
                  className="mb-3"
                />
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Actual Hours</span>
                  <span>{formatDuration(workingHoursData?.summary?.totalHours || 0)}</span>
                </div>
                <CProgress 
                  value={workingHoursData?.summary?.efficiency || 0} 
                  color={getEfficiencyColor(workingHoursData?.summary?.efficiency || 0)}
                  className="mb-3"
                />
              </div>
              <div className="text-center">
                <CBadge 
                  color={getEfficiencyColor(workingHoursData?.summary?.efficiency || 0)}
                  className="fs-6 px-3 py-2"
                >
                  {getEfficiencyText(workingHoursData?.summary?.efficiency || 0)} Performance
                </CBadge>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        
        <CCol md={6}>
          <CCard>
            <CCardHeader>
              <h5 className="mb-0">Weekly Breakdown</h5>
            </CCardHeader>
            <CCardBody>
              {workingHoursData?.weeklyBreakdown?.map((day, index) => (
                <div key={index} className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span>{day.day}</span>
                    <span>{formatDuration(day.hours)}</span>
                  </div>
                  <CProgress 
                    value={(day.hours / 480) * 100} // 8 hours = 480 minutes
                    color={day.hours >= 480 ? 'success' : day.hours >= 360 ? 'warning' : 'danger'}
                    className="mb-2"
                  />
                </div>
              ))}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Detailed Working Hours Table */}
      <CRow>
        <CCol xs={12}>
          <CCard>
            <CCardHeader>
              <h5 className="mb-0">
                <CIcon icon={cilClock} className="me-2" />
                Detailed Working Hours
              </h5>
            </CCardHeader>
            <CCardBody>
              {workingHoursData?.details?.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">No working hours data found for the selected period.</p>
                </div>
              ) : (
                <CTable hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Date</CTableHeaderCell>
                      <CTableHeaderCell>Day</CTableHeaderCell>
                      <CTableHeaderCell>Punch In</CTableHeaderCell>
                      <CTableHeaderCell>Punch Out</CTableHeaderCell>
                      <CTableHeaderCell>Working Hours</CTableHeaderCell>
                      <CTableHeaderCell>Break Time</CTableHeaderCell>
                      <CTableHeaderCell>Net Hours</CTableHeaderCell>
                      <CTableHeaderCell>Efficiency</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {workingHoursData?.details?.map((record, index) => (
                      <CTableRow key={index}>
                        <CTableDataCell>
                          {formatDate(record.date)}
                        </CTableDataCell>
                        <CTableDataCell>
                          {new Date(record.date).toLocaleDateString('en-IN', { weekday: 'short' })}
                        </CTableDataCell>
                        <CTableDataCell>
                          {record.punchInTime ? new Date(record.punchInTime).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : '--'}
                        </CTableDataCell>
                        <CTableDataCell>
                          {record.punchOutTime ? new Date(record.punchOutTime).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : '--'}
                        </CTableDataCell>
                        <CTableDataCell>
                          {formatDuration(record.workingMinutes)}
                        </CTableDataCell>
                        <CTableDataCell>
                          {formatDuration(record.breakMinutes)}
                        </CTableDataCell>
                        <CTableDataCell>
                          {formatDuration(record.netMinutes)}
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={getEfficiencyColor(record.efficiency)}>
                            {record.efficiency}%
                          </CBadge>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Insights */}
      {workingHoursData?.insights && (
        <CRow className="mt-4">
          <CCol xs={12}>
            <CCard>
              <CCardHeader>
                <h5 className="mb-0">Performance Insights</h5>
              </CCardHeader>
              <CCardBody>
                <CRow>
                  {workingHoursData.insights.map((insight, index) => (
                    <CCol md={6} key={index} className="mb-3">
                      <div className="d-flex align-items-center">
                        <div className="me-3">
                          <CBadge color={insight.type === 'positive' ? 'success' : 'warning'}>
                            {insight.type === 'positive' ? '✓' : '⚠'}
                          </CBadge>
                        </div>
                        <div>
                          <h6 className="mb-1">{insight.title}</h6>
                          <p className="text-muted mb-0">{insight.description}</p>
                        </div>
                      </div>
                    </CCol>
                  ))}
                </CRow>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      )}
    </>
  )
}

export default WorkingHours
