import React, { useState, useMemo } from 'react'
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
  CButton,
  CSpinner,
  CCard,
  CCardBody,
  CCardHeader,
} from '@coreui/react'
import { cilArrowThickTop, cilArrowThickBottom, cilInfo } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import PropTypes from 'prop-types'

const MusterRollTable = ({
  data = [],
  loading = false,
  onEdit,
  onView,
  onDelete,
  sortable = true,
  className = '',
}) => {
  const [sortField, setSortField] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')

  const columns = [
    // { key: 'employeeId', label: 'Employee ID', sortable: true, width: '120px' },
    { key: 'name', label: 'Name', sortable: true, width: '180px' },
    { key: 'designation', label: 'Designation', sortable: true, width: '120px' },
    { key: 'raLocation', label: 'RA Location', sortable: true, width: '120px' },
    { key: 'status', label: 'Status', sortable: true, width: '100px' },
    { key: 'Day Status', label: 'Day Status', sortable: true, width: '150px' },
    { key: 'punchIn', label: 'Punch In', sortable: true, width: '90px' },
    { key: 'punchOut', label: 'Punch Out', sortable: true, width: '90px' },
    { key: 'workingHours', label: 'Working Hours', sortable: true, width: '100px' },
    { key: 'draftDone', label: 'Draft Done', sortable: true, width: '90px' },
    { key: 'overtimeMinutes', label: 'Overtime', sortable: true, width: '100px' },
  ]

  const handleSort = (field) => {
    if (!sortable) return

    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Helper function to check if punch in time is late (10:31 or later)
  const isLatePunchIn = (punchIn) => {
    if (!punchIn || punchIn === '-') return false
    try {
      const [hours, minutes] = punchIn.split(':').map(Number)
      const totalMinutes = hours * 60 + minutes
      // 10:31 = 10 * 60 + 31 = 631 minutes
      return totalMinutes >= 631 // 10:31 AM
    } catch (e) {
      return false
    }
  }

  const getDayStatusFromWorkingHours = (workingHours, overtimeMinutes, status, punchIn) => {
    // First check: If overtime >= 30 minutes, show OT
    if (overtimeMinutes && overtimeMinutes >= 30) {
      return { color: 'info', label: 'OT' }
    }

    if (!workingHours || workingHours === '-') {
      return { color: 'danger', label: 'Absent' }
    }

    // "5h 40m" → hours extract
    let hours = 0

    if (typeof workingHours === 'string') {
      const hMatch = workingHours.match(/(\d+)h/i)
      const mMatch = workingHours.match(/(\d+)m/i)

      const h = hMatch ? Number(hMatch[1]) : 0
      const m = mMatch ? Number(mMatch[1]) : 0

      hours = h + m / 60
    } else if (typeof workingHours === 'number') {
      hours = workingHours
    }

    // Check if late (punch in >= 10:31)
    const isLate = isLatePunchIn(punchIn)
    const isPresent = status === 'Present' || status === 'P'

    // If working hours < 6, show Half Day
    if (hours > 0 && hours < 6) {
      if (isPresent && isLate) {
        return { color: 'warning', label: 'Half Day + Late' }
      }
      return { color: 'warning', label: 'Half Day' }
    }

    // If working hours = 8 (or around 8 hours), show Short Day
    if (hours >= 7.5 && hours < 9) {
      if (isPresent && isLate) {
        return { color: 'info', label: 'Short Day + Late' }
      }
      return { color: 'info', label: 'Short Day' }
    }

    // If working hours >= 9, show Full Day
    if (hours >= 9) {
      if (isPresent && isLate) {
        return { color: 'success', label: 'Full Day + Late' }
      }
      return { color: 'success', label: 'Full Day' }
    }

    // If working hours >= 6 but < 7.5, still show Half Day
    if (hours >= 6 && hours < 7.5) {
      if (isPresent && isLate) {
        return { color: 'warning', label: 'Half Day + Late' }
      }
      return { color: 'warning', label: 'Half Day' }
    }

    return { color: 'danger', label: 'Absent' }
  }

  /**
   * Single field value → pending | approved | rejected (or null).
   * Covers common API strings (English) and short codes.
   */
  const mapApprovalToCanonical = (value) => {
    if (value === undefined || value === null || value === '') return null
    const s = String(value).toLowerCase().trim()
    if (
      s.includes('pending') ||
      s.includes('await') ||
      s === 'submitted' ||
      s.includes('under_review') ||
      s.includes('under review')
    ) {
      return 'pending'
    }
    if (
      s.includes('approved') ||
      s.includes('accept') ||
      s.includes('sanction') ||
      s === 'authorised' ||
      s === 'authorized'
    ) {
      return 'approved'
    }
    if (s.includes('reject') || s.includes('denied') || s.includes('declin') || s.includes('cancel')) {
      return 'rejected'
    }
    if (s.includes('partial')) {
      return 'approved'
    }
    return null
  }

  /** Parse combined status text e.g. "Leave (Pending)", "leave - approved" */
  const parseLeaveApprovalFromText = (text) => {
    if (!text || typeof text !== 'string') return null
    const t = text.toLowerCase()
    if (!t.includes('leave')) return null
    return mapApprovalToCanonical(t)
  }

  /** Best-effort: all known API paths for leave approval on this row */
  const resolveLeaveApprovalState = (row) => {
    const sources = [
      row.leaveApprovalStatus,
      row.leave_approval_status,
      row.leaveApplicationStatus,
      row.leave_application_status,
      row.leaveStatus,
      row.leave_status,
      row.approvalStatus,
      row.approval_status,
      row.leave?.approvalStatus,
      row.leave?.applicationStatus,
      row.leave?.status,
      row.leave?.state,
    ]
    for (const v of sources) {
      const c = mapApprovalToCanonical(v)
      if (c) return c
    }
    const combined = `${row.status || ''} ${row.dayStatus || ''}`
    return (
      parseLeaveApprovalFromText(combined) ||
      parseLeaveApprovalFromText(row.status || '') ||
      parseLeaveApprovalFromText(row.dayStatus || '')
    )
  }

  const isLeaveDayRow = (row) => {
    const a = `${row.status || ''} ${row.dayStatus || ''}`.toLowerCase()
    if (a.includes('leave')) return true
    if (
      row.leaveApprovalStatus ||
      row.leave_approval_status ||
      row.leaveApplicationStatus ||
      row.leave_application_status
    ) {
      return true
    }
    if (row.leave && typeof row.leave === 'object' && Object.keys(row.leave).length > 0) return true
    return false
  }

  /**
   * Day Status column: leave (pending / approved / rejected), not marked, half day, present, absent.
   */
  const getDayStatusDisplay = (row) => {
    if (isLeaveDayRow(row)) {
      const state = resolveLeaveApprovalState(row)
      if (state === 'pending') {
        return { color: 'warning', label: 'Leave — Pending' }
      }
      if (state === 'approved') {
        return { color: 'success', label: 'Leave — Approved' }
      }
      if (state === 'rejected') {
        return { color: 'danger', label: 'Leave — Rejected' }
      }
      return { color: 'info', label: 'Leave' }
    }

    const st = (row.status || row.dayStatus || '').toString().trim()
    const stLower = st.toLowerCase().replace(/\s+/g, '_')

    if (
      stLower === 'notmarked' ||
      stLower === 'not_marked' ||
      stLower.includes('not_mark') ||
      st === 'Not Marked' ||
      st === '-'
    ) {
      return { color: 'secondary', label: 'Not Marked' }
    }

    if (
      stLower.includes('half') ||
      stLower === 'h' ||
      stLower === 'halfday' ||
      stLower === 'half_day'
    ) {
      return { color: 'warning', label: 'Half Day' }
    }

    if (stLower.includes('absent') || stLower === 'a') {
      return { color: 'danger', label: 'Absent' }
    }

    return getDayStatusFromWorkingHours(
      row.workingHours,
      row.overtimeMinutes,
      row.status,
      row.punchIn,
    )
  }

  const sortedData = useMemo(() => {
    if (!sortable || data.length === 0) return data

    return [...data].sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]

      // Handle punchIn and punchOut time sorting
      if (sortField === 'punchIn' || sortField === 'punchOut') {
        const toMinutes = (time) => {
          if (!time || time === '-') return -1
          try {
            const [hours, minutes] = time.split(':').map(Number)
            return hours * 60 + (minutes || 0)
          } catch {
            return -1
          }
        }
        aValue = toMinutes(aValue)
        bValue = toMinutes(bValue)
      }
      // Handle workingHours sorting (format: "12h 45m")
      else if (sortField === 'workingHours') {
        const toMinutes = (wh) => {
          if (!wh || wh === '-') return -1
          if (typeof wh === 'number') return wh * 60
          const hMatch = wh.toString().match(/(\d+)h/i)
          const mMatch = wh.toString().match(/(\d+)m/i)
          const h = hMatch ? Number(hMatch[1]) : 0
          const m = mMatch ? Number(mMatch[1]) : 0
          return h * 60 + m
        }
        aValue = toMinutes(aValue)
        bValue = toMinutes(bValue)
      }
      // Handle overtimeMinutes sorting (numeric value)
      else if (sortField === 'overtimeMinutes') {
        aValue = Number(aValue) || 0
        bValue = Number(bValue) || 0
      }
      // Handle raLocation sorting (can be object or string)
      else if (sortField === 'raLocation') {
        const getLocationLabel = (loc) => {
          if (!loc) return ''
          if (typeof loc === 'object') {
            return (loc.label || loc.name || loc.value || '').toString().toLowerCase()
          }
          return loc.toString().toLowerCase()
        }
        aValue = getLocationLabel(aValue)
        bValue = getLocationLabel(bValue)
      }
      // Handle Day Status sorting (need to compute from working hours)
      else if (sortField === 'Day Status') {
        const getDayStatusValue = (row) => {
          const ds = getDayStatusDisplay(row)
          const statusOrder = {
            Absent: 0,
            'Leave — Rejected': 0.5,
            'Leave — Pending': 1,
            Leave: 1.2,
            'Leave — Approved': 1.5,
            'Not Marked': 2,
            'Half Day': 3,
            'Half Day + Late': 3.2,
            'Short Day': 3.5,
            'Short Day + Late': 3.6,
            'Full Day': 4,
            'Full Day + Late': 4.2,
            OT: 5,
          }
          return statusOrder[ds.label] ?? 2.5
        }
        aValue = getDayStatusValue(a)
        bValue = getDayStatusValue(b)
      }
      // Handle string to number conversion for numeric strings
      else {
        if (typeof aValue === 'string' && !isNaN(aValue) && aValue !== '') {
          aValue = Number(aValue)
        }
        if (typeof bValue === 'string' && !isNaN(bValue) && bValue !== '') {
          bValue = Number(bValue)
        }
        // Convert to lowercase for string comparison
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase()
        }
        if (typeof bValue === 'string') {
          bValue = bValue.toLowerCase()
        }
      }

      // Handle null/undefined values
      if (aValue === null || aValue === undefined || aValue === '') {
        aValue = sortDirection === 'asc' ? Infinity : -Infinity
      }
      if (bValue === null || bValue === undefined || bValue === '') {
        bValue = sortDirection === 'asc' ? Infinity : -Infinity
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [data, sortField, sortDirection, sortable])

  const getStatusBadge = (status) => {
    const s = status === undefined || status === null ? '' : String(status)
    const statusMap = {
      Present: { color: 'success', label: 'Present' },
      P: { color: 'success', label: 'Present' },
      Absent: { color: 'danger', label: 'Absent' },
      A: { color: 'danger', label: 'Absent' },
      NotMarked: { color: 'warning', label: 'Not Marked' },
      Leave: { color: 'info', label: 'Leave' },
      L: { color: 'info', label: 'Leave' },
      HalfDay: { color: 'secondary', label: 'Half Day' },
      H: { color: 'secondary', label: 'Half Day' },
    }
    const lower = s.toLowerCase()
    if (lower.includes('leave') && (lower.includes('pending') || lower.includes('await'))) {
      return <CBadge color="warning">Leave (Pending)</CBadge>
    }
    if (
      lower.includes('leave') &&
      (lower.includes('approved') || lower.includes('accept') || lower.includes('sanction'))
    ) {
      return <CBadge color="success">Leave (Approved)</CBadge>
    }
    if (
      lower.includes('leave') &&
      (lower.includes('reject') || lower.includes('denied') || lower.includes('declin'))
    ) {
      return <CBadge color="danger">Leave (Rejected)</CBadge>
    }
    const config = statusMap[status] || { color: 'light', label: s || '—' }
    return <CBadge color={config.color}>{config.label}</CBadge>
  }

  if (loading) {
    return (
      <CCard className={className}>
        <CCardBody className="text-center py-5">
          <CSpinner size="lg" />
          <div className="mt-3">Loading attendance data...</div>
        </CCardBody>
      </CCard>
    )
  }

  if (data.length === 0) {
    return (
      <CCard className={className}>
        <CCardBody className="text-center py-5">
          <div className="text-muted">
            <CIcon icon={cilInfo} size="3xl" className="mb-3" />
            <h5>No attendance data found</h5>
            <p>Try selecting a different date</p>
          </div>
        </CCardBody>
      </CCard>
    )
  }

  // Helper function to format overtime minutes as "12h 32m" or "-12h 32m"
  const formatOvertime = (minutes) => {
    if (minutes === null || minutes === undefined || minutes === 0) return '0h 0m'
    const isNegative = minutes < 0
    const absMinutes = Math.abs(minutes)
    // Round to nearest minute to avoid decimal values
    const roundedMinutes = Math.round(absMinutes)
    const hours = Math.floor(roundedMinutes / 60)
    const mins = roundedMinutes % 60
    const sign = isNegative ? '-' : ''
    // Format with leading zeros: "00h 01m" format
    return `${sign}${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m`
  }

  return (
    <CCard className={className}>
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <h6 className="mb-0">Muster Roll Report</h6>
        <small className="text-muted">Total: {sortedData.length} employees</small>
      </CCardHeader>

      <CCardBody className="p-0">
        <div className="table-responsive">
          <CTable hover striped size="sm">
            <CTableHead>
              <CTableRow>
                {columns.map((column) => (
                  <CTableHeaderCell
                    key={column.key}
                    className={column.sortable ? 'cursor-pointer' : ''}
                    onClick={() => column.sortable && handleSort(column.key)}
                    style={{ width: column.width, minWidth: column.width }}
                  >
                    <div className="d-flex align-items-center">
                      {column.label}
                      {column.sortable && (
                        <CIcon
                          icon={
                            sortField === column.key
                              ? sortDirection === 'asc'
                                ? cilArrowThickTop
                                : cilArrowThickBottom
                              : cilArrowThickTop
                          }
                          className="ms-1"
                          size="sm"
                        />
                      )}
                    </div>
                  </CTableHeaderCell>
                ))}
              </CTableRow>
            </CTableHead>

            <CTableBody>
              {sortedData.map((row, index) => (
                <CTableRow key={row._id || index}>
                  {/* <CTableDataCell style={{ width: '120px' }} className="fw-semibold">{row.employeeId}</CTableDataCell> */}
                  <CTableDataCell style={{ width: '180px' }}>{row.name}</CTableDataCell>
                  <CTableDataCell style={{ width: '120px' }}>{row.designation}</CTableDataCell>
                  <CTableDataCell style={{ width: '120px' }}>
                    {row.raLocationLabel || 
                     (row.raLocation && typeof row.raLocation === 'object' 
                       ? (row.raLocation.label || row.raLocation.name || '-')
                       : (row.raLocation || '-'))}
                  </CTableDataCell>

                  <CTableDataCell style={{ width: '100px' }}>
                    {getStatusBadge(row.status)}
                  </CTableDataCell>
                  <CTableDataCell style={{ width: '150px' }}>
                    {(() => {
                      const ds = getDayStatusDisplay(row)
                      return (
                        <CBadge color={ds.color} className="text-wrap text-start" style={{ whiteSpace: 'normal' }}>
                          {ds.label}
                        </CBadge>
                      )
                    })()}
                  </CTableDataCell>
                  <CTableDataCell style={{ width: '90px' }}>{row.punchIn}</CTableDataCell>
                  <CTableDataCell style={{ width: '90px' }}>{row.punchOut}</CTableDataCell>
                  <CTableDataCell style={{ width: '100px' }}>{row.workingHours}</CTableDataCell>
                  <CTableDataCell style={{ width: '90px', textAlign: 'center' }}>
                    {row.draftDone !== null && row.draftDone !== undefined 
                      ? <CBadge color="success">{row.draftDone}</CBadge>
                      : '-'}
                  </CTableDataCell>
                  <CTableDataCell style={{ width: '100px', textAlign: 'center' }}>
                    {formatOvertime(row.overtimeMinutes)}
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </div>

        {data.length > 0 && (
          <div className="p-3 border-top text-muted small">
            Showing <strong>{sortedData.length}</strong> employees
          </div>
        )}
      </CCardBody>
    </CCard>
  )
}

MusterRollTable.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      sn: PropTypes.number,
      employeeId: PropTypes.string,
      name: PropTypes.string,
      designation: PropTypes.string,
      raLocation: PropTypes.string,
      status: PropTypes.string,
      punchIn: PropTypes.string,
      punchOut: PropTypes.string,
      workingHours: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      draftDone: PropTypes.number,
      overtimeMinutes: PropTypes.number,
    }),
  ),
  loading: PropTypes.bool,
  onEdit: PropTypes.func,
  onView: PropTypes.func,
  onDelete: PropTypes.func,
  sortable: PropTypes.bool,
  className: PropTypes.string,
}

export default MusterRollTable
