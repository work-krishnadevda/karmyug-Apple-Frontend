import React, { useEffect, useMemo, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import moment from 'moment'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CBadge,
  CAlert,
  CRow,
  CCol,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil } from '@coreui/icons'

const statusColors = {
  NotMarked: 'gray',
  Present: 'green',
  Absent: 'red',
  Leave: 'blue',
  WeeklyOff: 'orange',
  Holiday: 'purple',
}

/** Local calendar YYYY-MM-DD — matches grid day (avoids UTC shift). */
const toLocalYmd = (d) => {
  if (!d) return ''
  const x = new Date(d)
  if (Number.isNaN(x.getTime())) return ''
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
}

const isManualHrAdminEditLog = (log) => {
  if (!log || typeof log !== 'object') return false
  const role = String(log.role || log.updatedByRole || log.changedByRole || '')
    .toLowerCase()
    .trim()
  const byName = String(log.updatedByName || log.changedByName || '').toLowerCase().trim()
  const src = String(log.source || log.origin || '').toLowerCase().trim()
  const isHrAdmin = role.includes('hr') || role.includes('admin')
  const isSystemActor =
    byName.includes('system') ||
    role.includes('system') ||
    src.includes('system') ||
    log.isSystem === true ||
    log.isAutomated === true
  return isHrAdmin && !isSystemActor
}

const getManualHrAdminLogs = (record) => {
  const logs = Array.isArray(record?.logs) ? record.logs : []
  return logs.filter(isManualHrAdminEditLog)
}

const hasEditLogs = (record) => getManualHrAdminLogs(record).length > 0

const titleCaseStatus = (status) => {
  if (!status) return '—'
  const s = String(status)
  if (s.includes('_')) {
    return s
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ')
  }
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

const resolveBarColor = (status) => {
  const key = titleCaseStatus(status)
  return statusColors[key] || statusColors[status] || 'gray'
}

/** Map calendar bar color name → CoreUI CBadge color */
const barToBadgeColor = (bar) => {
  const m = { green: 'success', red: 'danger', blue: 'info', orange: 'warning', purple: 'primary', gray: 'secondary' }
  return m[bar] || 'secondary'
}

const AttendanceCalendar = ({
  attendanceData = [],
  currentYear,
  currentMonth,
  templateHolidays = [],
  showAuditFeatures = false,
  staffDisplayName = '',
}) => {
  const [events, setEvents] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const monthlyEditCount = useMemo(() => {
    if (!attendanceData?.length) return 0
    return attendanceData.reduce((sum, r) => sum + getManualHrAdminLogs(r).length, 0)
  }, [attendanceData])

  useEffect(() => {
    if (!currentMonth || !currentYear) return

    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()
    const allDates = []

    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`

      const holiday = templateHolidays.find((h) => {
        if (!h?.date) return false
        return toLocalYmd(h.date) === dateString
      })

      const attendanceRecord = attendanceData.find((record) => toLocalYmd(record.date) === dateString)

      const manualLogs = getManualHrAdminLogs(attendanceRecord)
      const edited = manualLogs.length > 0

      if (String(attendanceRecord?.status || '').toLowerCase() === 'present' && holiday) {
        allDates.push({
          title: `Present + Holiday`,
          date: dateString,
          backgroundColor: '#6f42c1',
          textColor: '#fff',
          extendedProps: {
            ...attendanceRecord,
            type: 'PresentHoliday',
            holidayName: holiday.name,
            description: holiday.description || 'Full Day Holiday',
            edited,
            logs: manualLogs,
          },
        })
      } else if (holiday) {
        allDates.push({
          title: `Holiday`,
          date: dateString,
          backgroundColor: statusColors.Holiday,
          textColor: '#fff',
          extendedProps: {
            date: dateString,
            type: 'Holiday',
            holidayName: holiday.name,
            description: holiday.description || 'Full Day Holiday',
            edited: false,
          },
        })
      } else if (attendanceRecord) {
        allDates.push({
          title: titleCaseStatus(attendanceRecord.status),
          date: dateString,
          backgroundColor: resolveBarColor(attendanceRecord.status),
          textColor: '#fff',
          extendedProps: {
            ...attendanceRecord,
            type: 'Attendance',
            edited,
            logs: manualLogs,
          },
        })
      } else {
        allDates.push({
          title: 'Not Marked',
          date: dateString,
          backgroundColor: statusColors.NotMarked,
          textColor: '#fff',
          extendedProps: { date: dateString, status: 'NotMarked', type: 'Attendance', edited: false },
        })
      }
    }

    setEvents(allDates)
  }, [attendanceData, templateHolidays, currentMonth, currentYear])

  const handleDateClick = (info) => {
    const event = events.find((e) => e.date === info.dateStr)
    if (event) {
      setSelectedDate(event.extendedProps)
      setShowModal(true)
    }
  }

  const renderEditHistory = (logs) => {
    const visibleLogs = Array.isArray(logs) ? logs.filter(isManualHrAdminEditLog) : []
    if (!visibleLogs.length) return null
    return (
      <div className="mt-4 border-top pt-3">
        <h6 className="text-success mb-3">
          <CIcon icon={cilPencil} className="me-2" />
          Edit history ({visibleLogs.length} update{visibleLogs.length === 1 ? '' : 's'})
        </h6>
        <div className="timeline">
          {visibleLogs.map((log, index) => (
            <div key={log._id || index} className="mb-3 p-3 border rounded bg-light">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                <div>
                  <div className="mb-2">
                    <strong className="text-warning">Status</strong>
                    <p className="mb-1 text-muted small mb-0">
                      from <strong>{log.oldStatus || 'N/A'}</strong> to <strong>{log.newStatus || 'N/A'}</strong>
                    </p>
                  </div>
                  <div className="mb-2 small">
                    <strong className="text-primary">Punch in</strong>{' '}
                    <span className="text-muted">
                      {log.oldPunchIn
                        ? new Date(log.oldPunchIn).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'N/A'}{' '}
                      →{' '}
                      {log.newPunchIn
                        ? new Date(log.newPunchIn).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="mb-2 small">
                    <strong className="text-info">Punch out</strong>{' '}
                    <span className="text-muted">
                      {log.oldPunchOut
                        ? new Date(log.oldPunchOut).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'N/A'}{' '}
                      →{' '}
                      {log.newPunchOut
                        ? new Date(log.newPunchOut).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'N/A'}
                    </span>
                  </div>
                  <small className="text-muted">
                    <strong>Reason:</strong> {log.message || '—'}
                  </small>
                </div>
                <div className="text-end small">
                  <CBadge color="dark" className="me-1">
                    {log.role || '—'}
                  </CBadge>
                  <div className="text-muted mt-1">
                    <strong>{log.updatedByName || 'Unknown'}</strong>
                  </div>
                  <div className="text-muted">
                    {log.timestamp
                      ? new Date(log.timestamp).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })
                      : '—'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      {showAuditFeatures && (
        <CAlert color="info" className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
          <div>
            <strong>Attendance updates this month</strong>
            {staffDisplayName ? (
              <span className="text-body-secondary">
                {' '}
                — <span className="text-dark fw-semibold">{staffDisplayName}</span>
              </span>
            ) : null}
          </div>
          <CBadge color="primary" className="fs-6 px-3 py-2">
            Total edits logged: {monthlyEditCount}
          </CBadge>
        </CAlert>
      )}

      <CCard className="p-3" style={{ width: '100%', minHeight: '80vh' }}>
        <CCardHeader className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <span>Employee Attendance</span>
          {showAuditFeatures && monthlyEditCount > 0 && (
            <small className="text-muted">Days with edits show an &quot;Edited&quot; tag on the calendar.</small>
          )}
        </CCardHeader>
        <CCardBody style={{ padding: 0 }}>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            dateClick={handleDateClick}
            height="auto"
            aspectRatio={1.2}
            contentHeight="auto"
            headerToolbar={false}
            initialDate={`${currentYear}-${String(currentMonth).padStart(2, '0')}-01`}
            eventContent={(arg) => {
              const edited = Boolean(arg.event.extendedProps?.edited)
              return (
                <div style={{ padding: '2px 4px', overflow: 'hidden', width: '100%' }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: '0.72rem',
                      lineHeight: 1.25,
                      wordBreak: 'break-word',
                      color: '#fff',
                    }}
                  >
                    {arg.event.title}
                  </div>
                  {edited && showAuditFeatures && (
                    <div
                      style={{
                        fontSize: '0.58rem',
                        fontWeight: 800,
                        color: '#fff3cd',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        marginTop: 2,
                        textShadow: '0 0 2px rgba(0,0,0,0.5)',
                      }}
                    >
                      Edited
                    </div>
                  )}
                </div>
              )
            }}
          />
        </CCardBody>
      </CCard>

      <CModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        alignment="center"
        size="lg"
        scrollable
      >
        <CModalHeader>
          <CModalTitle>
            Details —{' '}
            {selectedDate?.date
              ? moment(selectedDate.date).format('DD MMM YYYY')
              : selectedDate?.type === 'Holiday'
                ? moment(selectedDate.date).format('DD MMM YYYY')
                : '—'}
          </CModalTitle>
        </CModalHeader>
        <CModalBody style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {selectedDate?.edited && showAuditFeatures && (
            <CAlert color="warning" className="d-flex align-items-center gap-2 py-2">
              <CIcon icon={cilPencil} />
              This day&apos;s attendance was updated by HR/Admin. See edit history below.
            </CAlert>
          )}

          {selectedDate?.type === 'PresentHoliday' ? (
            <>
              <h5>
                <CBadge color="success" className="me-2">
                  Present
                </CBadge>
                <CBadge color="info">Holiday</CBadge>
              </h5>
              <p className="mt-3">
                <strong>Holiday Name:</strong> {selectedDate.holidayName}
                <br />
                <strong>Description:</strong> {selectedDate.description}
              </p>
              {selectedDate?.sessions && selectedDate.sessions.length > 0 && (
                <>
                  <h6 className="mt-3">Sessions:</h6>
                  <ul style={{ paddingLeft: '1rem' }}>
                    {selectedDate.sessions.map((s, idx) => (
                      <li key={idx} style={{ marginBottom: '0.5rem' }}>
                        In: {new Date(s.punch_in).toLocaleTimeString()} | Out:{' '}
                        {s.punch_out ? new Date(s.punch_out).toLocaleTimeString() : '-'} | Duration:{' '}
                        {s.duration_minutes?.toFixed(2)} mins
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {showAuditFeatures && renderEditHistory(selectedDate.logs)}
            </>
          ) : selectedDate?.type === 'Holiday' ? (
            <>
              <h5>
                <CBadge color="info">Holiday</CBadge>
              </h5>
              <p className="mt-3">
                <strong>Holiday Of {selectedDate.holidayName}</strong>
                <br />
                <strong>Description</strong> {selectedDate.description}
              </p>
            </>
          ) : (
            <>
              <CRow className="mb-3">
                <CCol md={6}>
                  <strong>Status:</strong>{' '}
                  <CBadge
                    color={barToBadgeColor(
                      resolveBarColor(selectedDate?.status) || 'gray',
                    )}
                  >
                    {titleCaseStatus(selectedDate?.status)}
                  </CBadge>
                </CCol>
                <CCol md={6}>
                  <strong>Date:</strong>{' '}
                  {selectedDate?.date ? moment(selectedDate.date).format('DD-MM-YYYY') : '—'}
                </CCol>
              </CRow>
              {selectedDate?.sessions && selectedDate.sessions.length > 0 && (
                <>
                  <h6>Sessions:</h6>
                  <ul style={{ paddingLeft: '1rem' }}>
                    {selectedDate.sessions.map((s, idx) => (
                      <li key={idx} style={{ marginBottom: '0.5rem' }}>
                        In: {new Date(s.punch_in).toLocaleTimeString()} | Out:{' '}
                        {s.punch_out ? new Date(s.punch_out).toLocaleTimeString() : '-'} | Duration:{' '}
                        {s.duration_minutes?.toFixed(2)} mins
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {showAuditFeatures &&
                selectedDate?.status !== 'NotMarked' &&
                (!selectedDate?.logs || selectedDate.logs.length === 0) && (
                  <p className="text-muted small mt-2 mb-0">No edit history for this day.</p>
                )}
              {showAuditFeatures && renderEditHistory(selectedDate?.logs)}
            </>
          )}
        </CModalBody>
      </CModal>
    </>
  )
}

export default AttendanceCalendar
