// import React, { useState, useEffect } from 'react'
// import {
//   CButton,
//   CCol,
//   CRow,
//   CCard,
//   CCardBody,
//   CCardTitle,
//   CCardText,
//   CSpinner,
//   CBadge,
//   //   CCollapse,
// } from '@coreui/react'

import AppFormSelect from 'src/components/form/AppFormSelect'
// import CIcon from '@coreui/icons-react'
// import { cilCalendar } from '@coreui/icons'
// import { useDispatch } from 'react-redux'
// import BasicProvider from 'src/constants/BasicProvider'

// // Colors for statuses
// const statusColors = {
//   Present: 'success',
//   Absent: 'danger',
//   Leave: 'info',
//   Holiday: 'secondary',
//   Weekend: 'warning',
//   HalfDay: 'primary',
//   IdleTimeout: 'dark',
// }

// const Attendance = () => {
//   const dispatch = useDispatch()
//   const [loading, setLoading] = useState(true)
//   const [attendanceData, setAttendanceData] = useState([])
//   const [expandedRow, setExpandedRow] = useState(null)
//   const [filters, setFilters] = useState({
//     month: new Date().getMonth() + 1,
//     year: new Date().getFullYear(),
//   })

//   useEffect(() => {
//     fetchAttendanceData()
//   }, [filters])

//   const fetchAttendanceData = async () => {
//     try {
//       setLoading(true)
//       const response = await new BasicProvider(
//         `attendances/calendar?month=${filters.month}&year=${filters.year}`,
//         dispatch,
//       ).getRequest()
//       setAttendanceData(response.data || [])
//     } catch (error) {
//       console.error('Error fetching attendance data:', error)
//       setAttendanceData([])
//     } finally {
//       setLoading(false)
//     }
//   }

//   const formatDate = (dateString) =>
//     new Date(dateString).toLocaleDateString('en-IN', {
//       weekday: 'short',
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//     })

//   const formatDuration = (minutes) => {
//     if (!minutes) return '--'
//     const h = Math.floor(minutes / 60)
//     const m = Math.round(minutes % 60)
//     return `${h}h ${m}m`
//   }

//   const formatTime = (timeString) =>
//     new Date(timeString).toLocaleTimeString('en-IN', {
//       hour: '2-digit',
//       minute: '2-digit',
//     })

//   if (loading) {
//     return (
//       <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
//         <CSpinner size="lg" />
//       </div>
//     )
//   }

//   return (
//     <div style={{ width: '95%', margin: 'auto' }}>
//       {/* Filters */}
//       <CRow className="mb-4">
//         <CCol md={3}>
//           <label className="form-label fw-semibold">Month</label>
//           <AppFormSelect
//             value={filters.month}
//             onChange={(e) => setFilters({ ...filters, month: parseInt(e.target.value) })}
//           >
//             {Array.from({ length: 12 }, (_, i) => (
//               <option key={i + 1} value={i + 1}>
//                 {new Date(0, i).toLocaleString('en', { month: 'long' })}
//               </option>
//             ))}
//           </AppFormSelect>
//         </CCol>
//         <CCol md={3}>
//           <label className="form-label fw-semibold">Year</label>
//           <AppFormSelect
//             value={filters.year}
//             onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value) })}
//           >
//             {Array.from({ length: 10 }, (_, i) => {
//               const year = new Date().getFullYear() - 5 + i
//               return (
//                 <option key={year} value={year}>
//                   {year}
//                 </option>
//               )
//             })}
//           </AppFormSelect>
//         </CCol>
//         <CCol md={3} className="d-flex align-items-end">
//           <CButton
//             color="primary"
//             onClick={() => {
//               const now = new Date()
//               setFilters({ month: now.getMonth() + 1, year: now.getFullYear() })
//             }}
//           >
//             <CIcon icon={cilCalendar} className="me-1" />
//             Current Month
//           </CButton>
//         </CCol>
//       </CRow>

//       {/* Attendance Cards */}
//       {attendanceData.map((item, index) => (
//         <CCard key={index} className="mb-3">
//           <CCardBody>
//             <div className="d-flex justify-content-between align-items-center">
//               {/* Left: Date + Status */}
//               <div>
//                 <CCardTitle>{formatDate(item.date)}</CCardTitle>
//                 <CCardText>
//                   {item.total_duration_minutes ? formatDuration(item.total_duration_minutes) : '--'}
//                 </CCardText>
//                 <CBadge color={statusColors[item.status] || 'light'}>{item.status}</CBadge>
//                 {item.type === 'Holiday' && item.holidayName && (
//                   <span className="ms-2 text-muted">({item.holidayName})</span>
//                 )}
//               </div>

//               {/* Right: Toggle Sessions if present */}
//               {item.type === 'Attendance' && (
//                 <CButton
//                   size="sm"
//                   color="secondary"
//                   onClick={() => setExpandedRow(expandedRow === index ? null : index)}
//                 >
//                   {expandedRow === index ? 'Hide Sessions' : 'View Sessions'}
//                 </CButton>
//               )}
//             </div>

//             {/* Expandable Sessions */}
//             <CCollapse visible={expandedRow === index}>
//               <div className="mt-3">
//                 {item.sessions?.map((s, idx) => (
//                   <div key={idx} className="p-2 border rounded mb-2 d-flex justify-content-between">
//                     <div>
//                       <strong>Punch In:</strong> {formatTime(s.punch_in)} <br />
//                       <strong>Punch Out:</strong> {s.punch_out ? formatTime(s.punch_out) : '--'}
//                     </div>
//                     <div>
//                       <strong>Duration:</strong> {formatDuration(s.duration_minutes)} <br />
//                       <strong>Photo:</strong> {s.photo_url}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </CCollapse>
//           </CCardBody>
//         </CCard>
//       ))}
//     </div>
//   )
// }

// export default Attendance

import React, { useState, useEffect } from 'react'

import {
  CCollapse,
  CButton,
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
  CFormInput,
  CPagination,
  CPaginationItem,
  CCard,
  CCardBody,
  CCardHeader,
  CCardText,
  CCardTitle,
  CWidgetStatsF,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormLabel,
  CFormTextarea,
  CAlert,
} from '@coreui/react'

import {
  cilCalendar,
  cilFilter,
  cilPin,
  cilPencil,
  cilSave,
  cilX,
  cilUser,
  cilClock,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useDispatch, useSelector } from 'react-redux'
import BasicProvider from 'src/constants/BasicProvider'
import { checkRole } from 'src/constants/common'
import AppContentSkeleton from 'src/components/custom/AppContentSkeleton'
import { label } from 'yet-another-react-lightbox'
import { useLocation } from 'src/hooks/useLocation'

// 🎨 Colors for statuses
const statusColors = {
  Present: { bg: '#2ECC71', text: '#fff' },
  Absent: { bg: '#E74C3C', text: '#fff' },
  Leave: { bg: '#3498DB', text: '#fff' },
  Half_day: { bg: '#F39C12', text: '#fff' },
  Double_deduction: { bg: '#34495E', text: '#fff' },
  Official_leave: { bg: '#9B59B6', text: '#fff' },
  Weekly_off: { bg: '#95A5A6', text: '#fff' },
  Weekly_off_present: { bg: '#1ABC9C', text: '#fff' },
  Weekly_off_half: { bg: '#D35400', text: '#fff' },
}

// 📝 Button list
const buttonsList = [
  { key: 'present', label: 'P | Present' },
  { key: 'Absent', label: 'A | Absent' },
  { key: 'leave', label: 'L | Leave' },
  { key: 'half_day', label: 'HD | Half Day' },
  { key: 'double_deduction', label: 'DD | Double Deduction' },
  { key: 'official_leave', label: 'OL | Official Leave' },
  { key: 'weekly_off', label: 'WO | Weekly Off' },
  { key: 'weekly_off_present', label: 'WOP | Weekly Off Present' },
  { key: 'weekly_off_half', label: 'WOH | Weekly Off Half Day' },
  { key: 'Emergency ', label: 'E | Emergency Leave' },
]

const Attendance = () => {
  // const [expandedRow, setExpandedRow] = useState(null)
  const [expandedSessions, setExpandedSessions] = useState(null)
  const [expandedLogs, setExpandedLogs] = useState(null)
  const dispatch = useDispatch()
  const admin = useSelector((state) => state.userData)
  const [loading, setLoading] = useState(true)
  const [attendanceData, setAttendanceData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1, // Current month (1-12)
    year: new Date().getFullYear(), // Current year
  })

  // Attendance Edit Modal States
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedAttendance, setSelectedAttendance] = useState(null)
  // alert(selectedAttendance)
  const [editForm, setEditForm] = useState({
    status: '',
    checkIn: '',
    checkOut: '',
    workingHours: '',
    justification: '',
    remarks: '',
    approvedDate: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // Role checking
  let isHR = checkRole(process.env.REACT_APP_HR, admin)
  let isADMIN = checkRole(process.env.REACT_APP_ADMIN, admin)
  const canEditAttendance = isHR || isADMIN

  // useEffect(() => {
  //   fetchAttendanceData()
  // }, [filters])

  useEffect(() => {
    applyFilters()
  }, [attendanceData, filters])

  useEffect(() => {
    fetchAttendanceData()
  }, [filters])

  const fetchAttendanceData = async () => {
    try {
      setLoading(true)
      const response = await new BasicProvider(
        `attendances/calendar?month=${filters.month}&year=${filters.year}`,
        dispatch,
      ).getRequest()
      console.log('API response for attendance_________', response)
      setAttendanceData(response.data || [])
    } catch (error) {
      console.error('Error fetching attendance data:', error)
      setAttendanceData([])
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...attendanceData]

    setFilteredData(filtered)
    setCurrentPage(1)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (timeString) => {
    if (!timeString) return '--'
    return new Date(timeString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDuration = (minutes) => {
    if (!minutes) return '--'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      present: { color: 'success', text: 'Present' },
      absent: { color: 'danger', text: 'Absent' },
      late: { color: 'warning', text: 'Late' },
      half_day: { color: 'info', text: 'Half Day' },
      leave: { color: 'secondary', text: 'Leave' },
    }

    const config = statusConfig[status] || { color: 'light', text: status }
    return <CBadge color={config.color}>{config.text}</CBadge>
  }

  const getWorkingHoursColor = (hours) => {
    if (hours >= 480) return 'success' // 8 hours
    if (hours >= 360) return 'warning' // 6 hours
    return 'danger'
  }

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  // Handle attendance edit modal
  const handleAttendanceEdit = (attendance, newStatus) => {
    if (!canEditAttendance) {
      alert('Only HR and Admin can edit attendance records.')
      return
    }

    setSelectedAttendance(attendance)
    setEditForm({
      status: newStatus,
      checkIn: attendance.checkIn || '',
      checkOut: attendance.checkOut || '',
      workingHours: attendance.workingMinutes
        ? Math.floor(attendance.workingMinutes / 60) +
          ':' +
          (attendance.workingMinutes % 60).toString().padStart(2, '0')
        : '',
      justification: '',
      remarks: '',
      approvedBy: admin.name || 'HR/Admin',
      approvedDate: new Date().toISOString().slice(0, 10),
    })
    setShowEditModal(true)
    setSubmitError('')
  }

  const handleEditFormChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAttendanceUpdate = async () => {
    try {
      setIsSubmitting(true)
      setSubmitError('')

      // Validate required fields
      if (!editForm.justification.trim()) {
        setSubmitError('Justification is required for attendance changes.')
        return
      }

      const today = new Date().toISOString().split('T')[0] // "2025-09-20"

      const punchInDate = new Date(`${today}T${editForm.checkIn}:00`) // "2025-09-20T22:59:00Z"
      const punchOutDate = new Date(`${today}T${editForm.checkOut}:00`) // "2025-09-20T14:00:00Z"

      const updateData = {
        status: editForm.status.charAt(0).toUpperCase() + editForm.status.slice(1),
        message: editForm.justification,
        punch_in: punchInDate,
        punch_out: punchOutDate,
        remarks: editForm.remarks || null,
      }
    

      // Call your PATCH API
      const response = await new BasicProvider(
        `attendances/${selectedAttendance?._id}/edit`,
        dispatch,
      ).patchRequest(updateData)


      // Update state locally so UI feels instant
      const updatedData = attendanceData.map((item) =>
        item._id === selectedAttendance._id ? { ...item, ...response.data } : item,
      )
      setAttendanceData(updatedData)

      setShowEditModal(false)
      toast.success('Attendance updated successfully!')
    } catch (error) {
      console.error('Error updating attendance:', error)
      setSubmitError('Failed to update attendance. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseModal = () => {
    setShowEditModal(false)
    setSelectedAttendance(null)
    setEditForm({
      status: '',
      checkIn: '',
      checkOut: '',
      workingHours: '',
      justification: '',
      approvedDate: '',
    })
    setSubmitError('')
  }

  const normalizeStatus = (status, date, totalMinutes = 0) => {
    if (!date) return status?.toLowerCase()

    const day = new Date(date).getDay() // 0 = Sunday, 1 = Monday, ...

    if (day === 0) {
      if (totalMinutes >= 360) return 'weekly_off_present'
      if (totalMinutes > 0 && totalMinutes < 360) return 'weekly_off_half'
      return 'weekly_off' // punch-in nahi hua
    }

    switch (status?.toLowerCase()) {
      case 'present':
        return 'Present'
      case 'absent':
        return 'Absent'
      case 'leave':
        return 'Leave'
      case 'half day':
        return 'half_day'
      case 'double deduction':
        return 'double_deduction'
      case 'official leave':
        return 'official_leave'
      case 'holiday':
        return 'official_leave'
      case 'weekly off':
        return 'weekly_off'
      case 'weekly off present':
        return 'weekly_off_present'
      case 'weekly off half day':
        return 'weekly_off_half'
      //  case 'Emergency Leave':
      //   return 'Emergency'
      default:
        return status?.toLowerCase()
    }
  }

  // function inside Attendance component
  const getAttendanceTotals = (data = []) => {
    const totals = {
      days: data.length, // Total days in month (API response array length)
      present: 0,
      absent: 0,
      leave: 0,
      half_day: 0,
      double_deduction: 0,
      official_leave: 0,
      weekly_off: 0,
      weekly_off_present: 0,
      weekly_off_half: 0,
    }

    data.forEach((item) => {
      const totalMinutes = item.total_duration_minutes || 0
      const normalized = normalizeStatus(item.status, item.date, totalMinutes)
      if (totals[normalized] !== undefined) {
        totals[normalized] += 1
      }
    })

    // Include weekly_off_present and weekly_off_half in weekly_off count
    totals.weekly_off = totals.weekly_off + totals.weekly_off_present + totals.weekly_off_half

    return totals
  }

  // inside Attendance component render
  const totals = getAttendanceTotals(filteredData)

  if (loading) {
    return (
      <div className="container py-4">
        <AppContentSkeleton ariaLabel="Loading attendance records" cards={3} rows={6} />
      </div>
    )
  } 

  return (
    <>
      <CCard style={{ marginBottom: '20px', padding: '10px 0px', borderRadius: '0px' }}>
        <h5 style={{ marginLeft: '20px' }}>| Attendance Records</h5>
      </CCard>
      <div style={{ width: '95%', margin: 'auto' }}>
        {/* Filters (Month & Year) */}
        <CRow className="mb-4">
          <CCol>
            <CCard>
              <CCardHeader>
                <h5 className="mb-0">
                  <CIcon icon={cilFilter} className="me-2" />
                  Filters
                </h5>
              </CCardHeader>
              <CCardBody>
                <CRow>
                  <CCol md={3}>
                    <label className="form-label fw-semibold">Month</label>
                    <AppFormSelect
                      value={filters.month}
                      onChange={(e) => setFilters({ ...filters, month: parseInt(e.target.value) })}
                    >
                      <option value={1}>January</option>
                      <option value={2}>February</option>
                      <option value={3}>March</option>
                      <option value={4}>April</option>
                      <option value={5}>May</option>
                      <option value={6}>June</option>
                      <option value={7}>July</option>
                      <option value={8}>August</option>
                      <option value={9}>September</option>
                      <option value={10}>October</option>
                      <option value={11}>November</option>
                      <option value={12}>December</option>
                    </AppFormSelect>
                  </CCol>
                  <CCol md={3}>
                    <label className="form-label fw-semibold">Year</label>
                    <AppFormSelect
                      value={filters.year}
                      onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value) })}
                    >
                      {Array.from({ length: 68 }, (_, i) => {
                        const year = 2023 + i
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        )
                      })}
                    </AppFormSelect>
                  </CCol>
                  <CCol md={3} className="d-flex align-items-end">
                    <CButton
                      color="primary"
                      onClick={() => {
                        const currentDate = new Date()
                        setFilters({
                          month: currentDate.getMonth() + 1,
                          year: currentDate.getFullYear(),
                        })
                      }}
                      className="w-100"
                    >
                      <CIcon icon={cilCalendar} className="me-1" />
                      Current Month
                    </CButton>
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>

        {/* widget */}

        <CRow>
          <CCol sm={6} md={3}>
            <CWidgetStatsF
              className="mb-3 overview_dashboard Query"
              icon={<CIcon width={24} icon={cilPin} size="xl" />}
              padding={false}
              title="Days"
              value={totals.days}
              color="warning"
            />
          </CCol>
          <CCol sm={6} md={3}>
            <CWidgetStatsF
              className="mb-3 overview_dashboard Query"
              icon={<CIcon width={24} icon={cilPin} size="xl" />}
              padding={false}
              title="Present"
              value={totals.present}
              color="success"
            />
          </CCol>
          <CCol sm={6} md={3}>
            <CWidgetStatsF
              className="mb-3 overview_dashboard Query"
              icon={<CIcon width={24} icon={cilPin} size="xl" />}
              padding={false}
              title="Absent"
              value={totals.absent}
              color="danger"
            />
          </CCol>
          <CCol sm={6} md={3}>
            <CWidgetStatsF
              className="mb-3 overview_dashboard Query"
              icon={<CIcon width={24} icon={cilPin} size="xl" />}
              padding={false}
              title="Half Day"
              value={totals.half_day}
              color="warning"
            />
          </CCol>
          <CCol sm={6} md={3}>
            <CWidgetStatsF
              className="mb-3 overview_dashboard Query"
              icon={<CIcon width={24} icon={cilPin} size="xl" />}
              padding={false}
              title="Weekly Off"
              value={totals.weekly_off}
              color="secondary"
            />
          </CCol>
          <CCol sm={6} md={3}>
            <CWidgetStatsF
              className="mb-3 overview_dashboard Query"
              icon={<CIcon width={24} icon={cilPin} size="xl" />}
              padding={false}
              title="Leave"
              value={totals.leave}
              color="primary"
            />
          </CCol>
          {/* <CCol sm={6} md={3}>
            <CWidgetStatsF
              className="mb-3 overview_dashboard Query"
              icon={<CIcon width={24} icon={cilPin} size="xl" />}
              padding={false}
              title="Double Deduction"
              value={totals.double_deduction}
              color="dark"
            />
          </CCol> */}
          <CCol sm={6} md={3}>
            <CWidgetStatsF
              className="mb-3 overview_dashboard Query"
              icon={<CIcon width={24} icon={cilPin} size="xl" />}
              padding={false}
              title="Official Leave"
              value={totals.official_leave}
              color="info"
            />
          </CCol>
          <CCol sm={6} md={3}>
            <CWidgetStatsF
              className="mb-3 overview_dashboard Query"
              icon={<CIcon width={24} icon={cilPin} size="xl" />}
              padding={false}
              title="Weekly Off Present"
              value={totals.weekly_off_present}
              color="info"
            />
          </CCol>
          <CCol sm={6} md={3}>
            <CWidgetStatsF
              className="mb-3 overview_dashboard Query"
              icon={<CIcon width={24} icon={cilPin} size="xl" />}
              padding={false}
              title="Weekly Off Half Day"
              value={totals.weekly_off_half}
              color="info"
            />
          </CCol>
        </CRow>

        {/* Attendance Table */}
        {attendanceData.map((item, index) => {
          const normalizedStatus = normalizeStatus(
            item.status,
            item.date,
            item.total_duration_minutes,
          )
          const badgeColor = statusColors[normalizedStatus]?.bg || '#ececec'

          return (
            <CCard key={index} style={{ marginBottom: '20px' }}>
              <CCardBody className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                {/* Left Side */}
                <div>
                  <CCardTitle>{formatDate(item.date)}</CCardTitle>
                  <CCardText>
                    {item.total_duration_minutes
                      ? formatDuration(item.total_duration_minutes)
                      : '--'}
                  </CCardText>

                  {/* Toggle Sessions */}
                  {item.type === 'Attendance' && (
                    <div className="mb-1">
                      <CButton
                        size="sm"
                        color="secondary"
                        onClick={() =>
                          setExpandedSessions(expandedSessions === index ? null : index)
                        }
                      >
                        {expandedSessions === index ? 'Hide Sessions' : 'View Sessions'}
                      </CButton>
                    </div>
                  )}

                  {/* Toggle Logs */}
                  {item.type === 'Attendance' && (
                    <div>
                      <CButton
                        size="sm"
                        color="secondary"
                        onClick={() => setExpandedLogs(expandedLogs === index ? null : index)}
                      >
                        {expandedLogs === index ? 'Hide Logs' : 'View Logs'}
                      </CButton>
                    </div>
                  )}
                </div>

                {/* Right Side - Status Buttons */}
                <div className="d-flex flex-wrap gap-2 w-60">
                  {buttonsList.map((btn) => {
                    const totalMinutes = item.total_duration_minutes || 0
                    const normalizedStatus = normalizeStatus(item.status, item.date, totalMinutes)
                    const isActive = btn.key === normalizedStatus

                    return (
                      <CButton
                        key={btn.key}
                        size="sm"
                        className="flex-fill"
                        onClick={() => handleAttendanceEdit(item, btn.key)}
                        style={{
                          backgroundColor: isActive ? statusColors[btn.key]?.bg : '#ececec',
                          borderColor: isActive ? statusColors[btn.key]?.bg : '#ececec',
                          color: isActive ? statusColors[btn.key]?.text : 'black',
                          cursor: canEditAttendance ? 'pointer' : 'default',
                          opacity: canEditAttendance ? 1 : 0.7,
                        }}
                        title={
                          canEditAttendance
                            ? `Click to edit attendance to ${btn.label}`
                            : 'Only HR/Admin can edit attendance'
                        }
                      >
                        {btn.label}
                        {canEditAttendance && !isActive && (
                          <CIcon icon={cilPencil} className="ms-1" size="sm" />
                        )}
                      </CButton>
                    )
                  })}
                </div>

                {/* Expandable Sessions */}
                <CCollapse visible={expandedSessions === index}>
                  <div className="mt-3 d-flex gap-2 flex-wrap">
                    {item.sessions?.map((s, idx) => (
                      <div
                        key={idx}
                        className="p-2 border rounded mb-2 d-flex justify-content-between"
                      >
                        <div>
                          <strong>Punch In:</strong> {formatTime(s.punch_in)} <br />
                          <strong>Punch Out:</strong> {s.punch_out ? formatTime(s.punch_out) : '--'}
                        </div>
                        <div>
                          <strong>Duration:</strong> {formatDuration(s.duration_minutes)} <br />
                          <strong>Draft Done:</strong>{' '}
                          {s.today_draft_done !== null && s.today_draft_done !== undefined ? (
                            <CBadge color="success">{s.today_draft_done}</CBadge>
                          ) : (
                            '--'
                          )}
                          {s.today_done_remark && (
                            <>
                              <br />
                              <strong>Remark:</strong> {s.today_done_remark}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CCollapse>

                {/* Expandable Logs */}
                <CCollapse visible={expandedLogs === index}>
                  <div className="mt-3 d-flex flex-column gap-2">
                    {item.logs?.map((log) => (
                      <div key={log._id} className="p-2 border rounded">
                        <div>
                          <strong>Updated By:</strong> {log.updatedBy} ({log.role})
                        </div>
                        <div>
                          <strong>Message:</strong> {log.message}
                        </div>
                        <div>
                          <strong>Status Change:</strong> {log.oldStatus} → {log.newStatus}
                        </div>
                        <div>
                          <strong>Date:</strong> {formatDate(log.timestamp)}{' '}
                          {formatTime(log.timestamp)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CCollapse>
              </CCardBody>
            </CCard>
          )
        })}
      </div>

      {/* Attendance Edit Modal */}
      <CModal visible={showEditModal} onClose={handleCloseModal} size="lg" backdrop="static">
        <CModalHeader>
          <CModalTitle className="fw-bold text-primary">
            <CIcon icon={cilPencil} className="me-2" />
            Edit Attendance Record
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedAttendance && (
            <CForm>
              {/* Employee and Date Info */}
              <div className="mb-4 p-3 bg-light rounded">
                <h6 className="text-primary mb-2">
                  <CIcon icon={cilUser} className="me-2" />
                  Employee Information
                </h6>
                <CRow>
                  <CCol md={6}>
                    <strong>Date:</strong> {selectedAttendance.date} ({selectedAttendance.day})
                  </CCol>
                  <CCol md={6}>
                    <strong>Current Status:</strong>
                    <CBadge color="info" className="ms-2">
                      {selectedAttendance.status}
                    </CBadge>
                  </CCol>
                </CRow>
              </div>

              {/* Attendance Status */}
              <div className="mb-3">
                <CFormLabel className="fw-semibold">New Attendance Status *</CFormLabel>
                <AppFormSelect
                  value={editForm.status}
                  onChange={(e) => handleEditFormChange('status', e.target.value)}
                  required
                >
                  <option value="">Select Status</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="leave">Leave</option>
                  <option value="half_day">Half Day</option>
                  <option value="double_deduction">Double Deduction</option>
                  <option value="official_leave">Official Leave</option>
                  <option value="weekly_off">Weekly Off</option>
                  <option value="weekly_off_present">Weekly Off Present</option>
                  <option value="weekly_off_half">Weekly Off Half Day</option>
                  <option value="Emergency">Emergency Leave</option>
                </AppFormSelect>
              </div>

              {/* Time Details */}
              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel className="fw-semibold">Check In Time</CFormLabel>
                  <CFormInput
                    type="time"
                    value={editForm.checkIn}
                    onChange={(e) => handleEditFormChange('checkIn', e.target.value)}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel className="fw-semibold">Check Out Time</CFormLabel>
                  <CFormInput
                    type="time"
                    value={editForm.checkOut}
                    onChange={(e) => handleEditFormChange('checkOut', e.target.value)}
                  />
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel className="fw-semibold">Working Hours</CFormLabel>
                  <CFormInput
                    type="text"
                    placeholder="HH:MM (e.g., 08:30)"
                    value={editForm.workingHours}
                    onChange={(e) => handleEditFormChange('workingHours', e.target.value)}
                  />
                </CCol>
                {/* <CCol md={6}>
                  <CFormLabel className="fw-semibold">Overtime Hours</CFormLabel>
                  <CFormInput
                    type="text"
                    placeholder="HH:MM (e.g., 01:30)"
                    value={editForm.overtime}
                    onChange={(e) => handleEditFormChange('overtime', e.target.value)}
                  />
                </CCol> */}
              </CRow>

              {/* Justification */}
              <div className="mb-3">
                <CFormLabel className="fw-semibold">Justification for Change *</CFormLabel>
                <CFormTextarea
                  value={editForm.justification}
                  onChange={(e) => handleEditFormChange('justification', e.target.value)}
                  placeholder="Please provide a detailed justification for this attendance change..."
                  rows={3}
                  required
                />
              </div>

              {/* Additional Remarks */}
              {/* <div className="mb-3">
                <CFormLabel className="fw-semibold">Additional Remarks</CFormLabel>
                <CFormTextarea
                  value={editForm.remarks}
                  onChange={(e) => handleEditFormChange('remarks', e.target.value)}
                  placeholder="Any additional notes or remarks..."
                  rows={2}
                />
              </div> */}

              {/* Approval Details */}
              <div className="mb-3 p-3 bg-light rounded">
                <h6 className="text-success mb-2">
                  <CIcon icon={cilClock} className="me-2" />
                  Approval Details
                </h6>
                {/* <CRow>
                  <CCol md={6}>
                    <CFormLabel className="fw-semibold">Approved By</CFormLabel>
                    <CFormInput
                      type="text"
                      value={editForm.approvedBy}
                      onChange={(e) => handleEditFormChange('approvedBy', e.target.value)}
                      readOnly
                    />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel className="fw-semibold">Approval Date</CFormLabel>
                    <CFormInput
                      type="date"
                      value={editForm.approvedDate}
                      onChange={(e) => handleEditFormChange('approvedDate', e.target.value)}
                      readOnly
                    />
                  </CCol>
                </CRow> */}
              </div>

              {/* Error Display */}
              {submitError && (
                <CAlert color="danger" className="mb-3">
                  {submitError}
                </CAlert>
              )}
            </CForm>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={handleCloseModal} disabled={isSubmitting}>
            Cancel
          </CButton>
          <CButton
            color="primary"
            onClick={handleAttendanceUpdate}
            disabled={isSubmitting || !editForm.status || !editForm.justification.trim()}
          >
            {isSubmitting ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Updating...
              </>
            ) : (
              <>
                <CIcon icon={cilSave} className="me-1" />
                Update Attendance
              </>
            )}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default Attendance
