import React from 'react'
import { CFormInput, CFormLabel, CFormSelect, CCol, CRow } from '@coreui/react'
import PropTypes from 'prop-types'
import { REPORT_PERIODS, REPORT_PERIOD_LABELS } from '../../../constants/musterRollConstants'

const DateRangePicker = ({
  period,
  startDate,
  endDate,
  onPeriodChange,
  onStartDateChange,
  onEndDateChange,
  disabled = false,
  className = ''
}) => {
  const handlePeriodChange = (e) => {
    const selectedPeriod = e.target.value
    onPeriodChange(selectedPeriod)
    
    // Auto-set date range based on period
    if (selectedPeriod !== REPORT_PERIODS.CUSTOM) {
      const today = new Date()
      let start, end
      
      switch (selectedPeriod) {
        case REPORT_PERIODS.DAILY:
          start = end = today
          break
        case REPORT_PERIODS.WEEKLY:
          start = new Date(today.setDate(today.getDate() - today.getDay()))
          end = new Date(today.setDate(today.getDate() - today.getDay() + 6))
          break
        case REPORT_PERIODS.MONTHLY:
          start = new Date(today.getFullYear(), today.getMonth(), 1)
          end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
          break
        case REPORT_PERIODS.QUARTERLY:
          const quarter = Math.floor(today.getMonth() / 3)
          start = new Date(today.getFullYear(), quarter * 3, 1)
          end = new Date(today.getFullYear(), quarter * 3 + 3, 0)
          break
        case REPORT_PERIODS.YEARLY:
          start = new Date(today.getFullYear(), 0, 1)
          end = new Date(today.getFullYear(), 11, 31)
          break
        default:
          return
      }
      
      onStartDateChange(start.toISOString().split('T')[0])
      onEndDateChange(end.toISOString().split('T')[0])
    }
  }

  return (
    <div className={`date-range-picker ${className}`}>
      <CRow className="g-3">
        <CCol md={3}>
          <CFormLabel>Report Period</CFormLabel>
          <CFormSelect
            value={period}
            onChange={handlePeriodChange}
            disabled={disabled}
          >
            {Object.entries(REPORT_PERIOD_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </CFormSelect>
        </CCol>
        
        <CCol md={4}>
          <CFormLabel>Start Date</CFormLabel>
          <CFormInput
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            disabled={disabled || period !== REPORT_PERIODS.CUSTOM}
            max={endDate}
          />
        </CCol>
        
        <CCol md={4}>
          <CFormLabel>End Date</CFormLabel>
          <CFormInput
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            disabled={disabled || period !== REPORT_PERIODS.CUSTOM}
            min={startDate}
          />
        </CCol>
        
        <CCol md={1} className="d-flex align-items-end">
          <div className="text-muted small">
            {period === REPORT_PERIODS.CUSTOM && startDate && endDate && (
              <span>
                {Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1} days
              </span>
            )}
          </div>
        </CCol>
      </CRow>
    </div>
  )
}

DateRangePicker.propTypes = {
  period: PropTypes.string.isRequired,
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
  onPeriodChange: PropTypes.func.isRequired,
  onStartDateChange: PropTypes.func.isRequired,
  onEndDateChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  className: PropTypes.string
}

export default DateRangePicker
