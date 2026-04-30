import React from 'react'
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
  CCollapse,
  CButton,
} from '@coreui/react'

// Status colors mapping
const statusColors = {
  Present: { color: 'success' },
  Absent: { color: 'danger' },
  Leave: { color: 'primary' },
  HalfDay: { color: 'warning' },
  // DoubleDeduction: { color: 'dark' },
  OfficialLeave: { color: 'secondary' },
  WeeklyOff: { color: 'info' },
  WeeklyPresent: { color: 'dark' },
  WeeklyOffHalf: { color: 'warning' },
  Holiday: { color: 'secondary' }, // Add Holiday status color
}

const formatTime = (isoString) => {
  if (!isoString) return '-'
  const date = new Date(isoString)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const AttendanceTable = ({ attendanceData, onEdit, onViewLog, onView, showEditButton = true, holidays = [] }) => {
  const [expandedRows, setExpandedRows] = React.useState({})

  // Helper function to check if a date is a holiday
  // NOTE: Only checks holidays from backend (holidays prop), does NOT automatically treat Sunday as holiday
  const isHoliday = (date) => {
    if (!date || !holidays || holidays.length === 0) return false
    const dateStr = date.split('T')[0] // Get YYYY-MM-DD format
    // Only check against holidays array from backend - no automatic Sunday check
    return holidays.some((holiday) => {
      const holidayDate = holiday.date ? holiday.date.split('T')[0] : null
      return holidayDate === dateStr
    })
  }

  const isOfficialLeaveStatus = (status) => {
    const k = String(status || '')
      .toLowerCase()
      .replace(/[\s_\-]/g, '')
    return (
      k.includes('officialleave') ||
      k === 'ol' ||
      (k.includes('official') && k.includes('leave'))
    )
  }

  // Calendar Holiday & Official Leave — same sheet label (company-paid day), like "H"/Holiday
  const getDisplayStatus = (item) => {
    if (isOfficialLeaveStatus(item.status)) {
      return 'Holiday'
    }
    if (isHoliday(item.date)) {
      return 'Holiday'
    }
    return item.status
  }

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleEdit = (item) => {
    if (onEdit) {
      onEdit(item)
    }
  }

  const handleViewLog = (item) => {
    if (onViewLog) {
      onViewLog(item)
    }
  }

  const handleView = (item) => {
    if (onView) {
      onView(item)
    }
  }

  return (
    <CTable hover responsive bordered>
      <CTableHead color="dark">
        <CTableRow>
          <CTableHeaderCell>Date</CTableHeaderCell>
          <CTableHeaderCell>Status</CTableHeaderCell>
          <CTableHeaderCell>First In</CTableHeaderCell>
          <CTableHeaderCell>Last Out</CTableHeaderCell>
          <CTableHeaderCell>Total Work (hrs)</CTableHeaderCell>
          <CTableHeaderCell>Overtime (hrs)</CTableHeaderCell>
          <CTableHeaderCell>Draft Done</CTableHeaderCell>
          <CTableHeaderCell>Approved</CTableHeaderCell>
          <CTableHeaderCell>Actions</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        {attendanceData.map((item) => {
          const firstPunch = item.sessions?.[0]?.punch_in
          const lastPunch = item.sessions?.[item.sessions.length - 1]?.punch_out
          const lastSession = item.sessions?.[item.sessions.length - 1]
          
          const totalMinutes = item.total_duration_minutes

          const totalHoursFormatted = totalMinutes
            ? `${Math.floor(totalMinutes / 60)}h ${Math.floor(totalMinutes % 60)}m`
            : '-'
          const totalHours = totalHoursFormatted
          const backendOvertime = item.overtime_minutes || 0

          const overtimeMinutes =
            backendOvertime > 0 ? backendOvertime : Math.max(0, totalMinutes - 9 * 60) // 9h = 540 min

          let overtimeHours = '-'

          if (overtimeMinutes > 0) {
            const h = Math.floor(overtimeMinutes / 60)
            const m = Math.floor(overtimeMinutes % 60)
            overtimeHours = `${h}h ${m}m`
          }

          // Get display status (priority to Holiday)
          const displayStatus = getDisplayStatus(item)
 
          return (
            <React.Fragment key={item._id}>
              <CTableRow>
                <CTableDataCell>{item.date}</CTableDataCell>
                <CTableDataCell>
                  <CBadge color={statusColors[displayStatus]?.color || statusColors['Holiday']?.color || 'secondary'}>
                    {displayStatus}
                  </CBadge>
                </CTableDataCell>
                <CTableDataCell>{formatTime(firstPunch)}</CTableDataCell>
                <CTableDataCell>{formatTime(lastPunch)}</CTableDataCell>
                <CTableDataCell>{totalHours}</CTableDataCell>
                <CTableDataCell>{overtimeHours}</CTableDataCell>
                <CTableDataCell>
                  {lastSession?.today_draft_done != null ? (
                    <span style={{
                      backgroundColor: '#28a745',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: 'bold'
                    }}>
                      {lastSession.today_draft_done}
                    </span>
                  ) : '-'}
                </CTableDataCell>
                <CTableDataCell>
                  {item.approved ? (
                    <CBadge color="success">Approved</CBadge>
                  ) : (
                    <CBadge color="secondary">Pending</CBadge>
                  )}
                </CTableDataCell>
                <CTableDataCell>
                  <div className="d-flex gap-1 flex-wrap">
                    <CButton color="primary" size="sm" onClick={() => handleView(item)}>
                      View
                    </CButton>
                    {item.sessions?.length > 0 && (
                      <CButton color="info" size="sm" onClick={() => toggleRow(item._id)}>
                        {expandedRows[item._id] ? 'Hide Sessions' : 'View Sessions'}
                      </CButton>
                    )}
                    {showEditButton && (
                      <CButton color="warning" size="sm" onClick={() => handleEdit(item)}>
                        Edit
                      </CButton>
                    )}
                    {item.logs?.length > 0 && (
                      <CButton color="secondary" size="sm" onClick={() => handleViewLog(item)}>
                        Log
                      </CButton>
                    )}
                  </div>
                </CTableDataCell>
              </CTableRow>

              {/* Expandable row for session details */}
              {item.sessions?.length > 0 && (
                <CTableRow>
                  <CTableDataCell colSpan={9} style={{ padding: 0, border: 0 }}>
                    <CCollapse visible={expandedRows[item._id]}>
                      <CTable hover responsive bordered>
                        <CTableHead color="light">
                          <CTableRow>
                            <CTableHeaderCell>Session #</CTableHeaderCell>
                            <CTableHeaderCell>Punch In</CTableHeaderCell>
                            <CTableHeaderCell>Punch Out</CTableHeaderCell>
                            <CTableHeaderCell>Duration (mins)</CTableHeaderCell>
                            <CTableHeaderCell>Location</CTableHeaderCell>
                            <CTableHeaderCell>Draft Done</CTableHeaderCell>
                            <CTableHeaderCell>Remark</CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {item.sessions.map((s, idx) => (
                            <CTableRow key={s._id}>
                              <CTableDataCell>{idx + 1}</CTableDataCell>
                              <CTableDataCell>{formatTime(s.punch_in)}</CTableDataCell>
                              <CTableDataCell>{formatTime(s.punch_out)}</CTableDataCell>
                              <CTableDataCell>
                                {s.duration_minutes ? s.duration_minutes.toFixed(2) : '-'}
                              </CTableDataCell>
                              <CTableDataCell>
                                {s.punch_in_location?.location || '-'}
                              </CTableDataCell>
                              <CTableDataCell>
                                {s.today_draft_done != null ? (
                                  <span style={{
                                    backgroundColor: '#28a745',
                                    color: 'white',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontWeight: 'bold'
                                  }}>
                                    {s.today_draft_done}
                                  </span>
                                ) : '-'}
                              </CTableDataCell>
                              <CTableDataCell>
                                {s.today_done_remark || '-'}
                              </CTableDataCell>
                            </CTableRow>
                          ))}
                        </CTableBody>
                      </CTable>
                    </CCollapse>
                  </CTableDataCell>
                </CTableRow>
              )}
            </React.Fragment>
          )
        })}
      </CTableBody>
    </CTable>
  )
}

export default AttendanceTable
