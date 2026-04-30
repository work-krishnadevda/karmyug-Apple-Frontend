import React from 'react'
import { CCard, CCardBody, CCol, CRow } from '@coreui/react'
import { 
  cilPeople, 
  cilCheckCircle, 
  cilXCircle, 
  cilClock, 
  cilPlus, 
  cilChartLine,
  cilSpeedometer
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import PropTypes from 'prop-types'
import { SUMMARY_METRICS, SUMMARY_METRIC_LABELS } from '../../../constants/musterRollConstants'

const getGradeColor = (grade) => {
  switch (grade) {
    case 'Very Good':
      return 'success'
    case 'Good':
      return 'primary'
    case 'Need Improvement':
      return 'warning'
    case 'Very Poor':
      return 'danger'
    default:
      return 'secondary'
  }
}


const SummaryCards = ({
  summaryData,
  loading = false,
  className = ''
}) => {
  const cards = [
    {
      key: SUMMARY_METRICS.TOTAL_EMPLOYEES,
      label: SUMMARY_METRIC_LABELS[SUMMARY_METRICS.TOTAL_EMPLOYEES],
      value: summaryData.totalActiveStaff || summaryData.totalStaff || summaryData.totalEmployees || 0,
      icon: cilPeople,
      color: 'primary',
      bgColor: 'primary'
    },
    {
      key: SUMMARY_METRICS.PRESENT_COUNT,
      label: SUMMARY_METRIC_LABELS[SUMMARY_METRICS.PRESENT_COUNT],
      value: summaryData.totalTodayPresent || summaryData.presentCount || 0,
      icon: cilCheckCircle,
      color: 'success',
      bgColor: 'success'
    },
    {
      key: SUMMARY_METRICS.ABSENT_COUNT,
      label: SUMMARY_METRIC_LABELS[SUMMARY_METRICS.ABSENT_COUNT],
      value: summaryData.totalTodayAbsent || summaryData.absentCount || 0,
      icon: cilXCircle,
      color: 'danger',
      bgColor: 'danger'
    },
    {
      key: SUMMARY_METRICS.LATE_COUNT,
      label: SUMMARY_METRIC_LABELS[SUMMARY_METRICS.LATE_COUNT],
      value: summaryData.lateArrivals || summaryData.lateCount || 0,
      icon: cilClock,
      color: 'warning',
      bgColor: 'warning'
    },
    {
      key: SUMMARY_METRICS.OVERTIME_COUNT,
      label: SUMMARY_METRIC_LABELS[SUMMARY_METRICS.OVERTIME_COUNT],
      value: summaryData.overtimeHours || summaryData.overtimeCount || 0,
      icon: cilPlus,
      color: 'info',
      bgColor: 'info'
    },
    {
    key: SUMMARY_METRICS.TOTAL_WORKING_HOURS,
    label: SUMMARY_METRIC_LABELS[SUMMARY_METRICS.TOTAL_WORKING_HOURS],
    value: summaryData.totalWorkingHours || 0,
    icon: cilSpeedometer,
    color: 'info',
    suffix: ' hrs'
  },
  {
    key: SUMMARY_METRICS.ATTENDANCE_GRADE,
    label: SUMMARY_METRIC_LABELS.ATTENDANCE_GRADE,
    value: summaryData.attendanceGrade || 'N/A',
    icon: cilChartLine,
      color: getGradeColor(summaryData.attendanceGrade),
  bgColor: getGradeColor(summaryData.attendanceGrade)
  },
    {
      key: SUMMARY_METRICS.AVERAGE_HOURS,
      label: SUMMARY_METRIC_LABELS[SUMMARY_METRICS.AVERAGE_HOURS],
      value: summaryData.avgWorkingHours || summaryData.averageHours || 0,
      icon: cilSpeedometer,
      color: 'secondary',
      bgColor: 'secondary',
      suffix: 'hrs'
    }
  ]

  const getPercentageColor = (percentage) => {
    if (percentage >= 90) return 'success'
    if (percentage >= 70) return 'warning'
    return 'danger'
  }

  console.log("Summary Cards data ", cards)
const formatValue = (card) => {
  if (card.key === SUMMARY_METRICS.TOTAL_WORKING_HOURS) {
    return `${Number(card.value).toFixed(2)}${card.suffix || ''}`
  }
  return card.value
}

  if (loading) {
    return (
      <CRow className={`summary-cards ${className}`}>
        {cards.map((card) => (
          <CCol md={3} lg={2} key={card.key} className="mb-3">
            <CCard className="h-100">
              <CCardBody className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <div className="placeholder-glow">
                    <div className="placeholder col-6 mb-2"></div>
                    <div className="placeholder col-4"></div>
                  </div>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>
    )
  }

  return (
    <CRow className={`summary-cards ${className}`}>
      {cards.map((card) => (
        <CCol md={3} lg={2} key={card.key} className="mb-3">
          <CCard className={`h-100 border-${card.bgColor} border-2`}>
            <CCardBody className="d-flex align-items-center">
              <div className={`flex-shrink-0 me-3 text-${card.color}`}>
                <CIcon icon={card.icon} size="2xl" />
              </div>
              <div className="flex-grow-1">
                <div className="text-muted small mb-1">{card.label}</div>
                <div className={`h4 mb-0 text-${card.color} fw-bold`}>
                  {formatValue(card)}
                </div>
                {card.key === SUMMARY_METRICS.ATTENDANCE_PERCENTAGE && (
                  <div className="small">
                    <span className={`badge bg-${getPercentageColor(card.value)}`}>
                      {card.value >= 90 ? 'Excellent' : 
                       card.value >= 70 ? 'Good' : 'Needs Improvement'}
                    </span>
                  </div>
                )}
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      ))}
    </CRow>
  )
}

SummaryCards.propTypes = {
  summaryData: PropTypes.shape({
    totalEmployees: PropTypes.number,
    presentCount: PropTypes.number,
    absentCount: PropTypes.number,
    lateCount: PropTypes.number,
    overtimeCount: PropTypes.number,
    attendancePercentage: PropTypes.number,
    averageHours: PropTypes.number
  }),
  loading: PropTypes.bool,
  className: PropTypes.string
}

export default SummaryCards
