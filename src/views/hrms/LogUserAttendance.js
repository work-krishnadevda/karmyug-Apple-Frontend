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
import { toast } from 'react-toastify'

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
  cilWarning,
  cilSpeedometer,
  cilStar,
  cilCheckCircle,
  cilXCircle,
  cilCalendarCheck,
  cilBan,
  cilFlagAlt,
  cilHeart,
  cilBell,
  cilWallet,
} from '@coreui/icons'

import CIcon from '@coreui/icons-react'
import { useDispatch, useSelector } from 'react-redux'
import BasicProvider from 'src/constants/BasicProvider'
import { checkRole } from 'src/constants/common'
import AppContentSkeleton from 'src/components/custom/AppContentSkeleton'
import { label } from 'yet-another-react-lightbox'
import { useLocation } from 'src/hooks/useLocation'
import AttendanceTable from 'src/components/hrms/attendance/AttendancePanel'
import AttendanceCalendar from 'src/components/hrms/attendance/AttendanceCalendar2'
import Cookies from 'js-cookie'
import { computeNetPayableDays } from 'src/helpers/attendanceNetPayable'
// 🎨 Colors for statuses
const statusColors = {
  present: { bg: '#2ECC71', text: '#fff' },
  absent: { bg: '#E74C3C', text: '#fff' },
  leave: { bg: '#3498DB', text: '#fff' },
  half_day: { bg: '#F39C12', text: '#fff' },
  double_deduction: { bg: '#34495E', text: '#fff' },
  official_leave: { bg: '#9B59B6', text: '#fff' },
  weekly_off: { bg: '#95A5A6', text: '#fff' },
  weekly_off_present: { bg: '#1ABC9C', text: '#fff' },
  weekly_off_half: { bg: '#D35400', text: '#fff' },
}

// 📝 Button list
const buttonsList = [
  { key: 'present', label: 'P | Present' },
  { key: 'absent', label: 'A | Absent' },
  { key: 'leave', label: 'L | Leave' },
  { key: 'half_day', label: 'HD | Half Day' },
  { key: 'double_deduction', label: 'DD | Double Deduction' },
  { key: 'official_leave', label: 'OL | Official Leave' },
  { key: 'weekly_off', label: 'WO | Weekly Off' },
  { key: 'weekly_off_present', label: 'WOP | Weekly Off Present' },
  { key: 'weekly_off_half', label: 'WOH | Weekly Off Half Day' },
]

const Attendance = () => {
  // const [expandedRow, setExpandedRow] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedViewAttendance, setSelectedViewAttendance] = useState(null)
  const [loggedUserId, setLoggedUserId] = useState(null)

  const [showLogModal, setShowLogModal] = useState(false)
  const [showdetails, setShowDetails] = useState(false)
  const [selectedLogAttendance, setSelectedLogAttendance] = useState(null)
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
    status: '',
  })
  const [mode, setMode] = useState('month')
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
  const [employeeData, setEmployeeData] = useState(null)
  const [imageMap, setImageMap] = useState({}) // store fileId -> URL
  const [lightbox, setLightbox] = useState({ visible: false, src: '' }) // for full-size image
  const id = Cookies.get(`primery_user_id`)
  const [templateHolidays, setTemplateHolidays] = useState([])

  // Role checking
  let isHR = checkRole(process.env.REACT_APP_HR, admin)
  let isADMIN = checkRole(process.env.REACT_APP_ADMIN, admin)
  const canEditAttendance = isHR || isADMIN

  // useEffect(() => {
  //   fetchAttendanceData()
  // }, [filters])
  const getCookie = (name) => {
    if (typeof document === 'undefined') return null
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
    return match ? decodeURIComponent(match[2]) : null
  }

  useEffect(() => {
    const id = getCookie('primery_user_id')
    if (id) {
      setLoggedUserId(id)
    } else {
      console.warn('primery_user_id cookie not found')
      toast.error('User identifier missing. Please login.')
    }
  }, [])

  useEffect(() => {
    fetchEmployeeData()
    // fetchTemplateHolidays()
  }, [loggedUserId, filters, mode])

  // Separate effect to handle template holidays when employeeData changes
  useEffect(() => {
    fetchTemplateHolidays()
  }, [employeeData])

  const fetchEmployeeData = async () => {
    try {
      const response = await new BasicProvider(`profiles`, dispatch).getRequest()
      setEmployeeData(response.data)
    } catch (error) {
      console.error('Error fetching employee data:', error)
    }
  }

//  const fetchTemplateHolidays = async () => {
//     try {
//       if (!employeeData?.template || employeeData.template.length === 0) return

//       const templateIds = Array.isArray(employeeData.template)
//         ? employeeData.template.join(',')
//         : employeeData.template

//       console.log('Fetching holidays for templates:', templateIds)

//       const res = await new BasicProvider(`holidays/template/${templateIds}`, dispatch).getRequest()

//       console.log('Template holidays response:', res.data)
//       setTemplateHolidays(res.data || [])
//     } catch (err) {
//       console.error('Error fetching template holidays:', err)
//     }
//   }

  const fetchTemplateHolidays = async () => {
    try {
      // Reset holidays if no employee data or no templates assigned
      if (!employeeData || !employeeData.template) {
        setTemplateHolidays([])
        return
      }

      // Check if template is array and has valid IDs
      const templates = Array.isArray(employeeData.template) 
        ? employeeData.template.filter(id => id && id.trim() !== '')
        : employeeData.template 
          ? [employeeData.template].filter(id => id && id.trim() !== '')
          : []

      // If no valid templates, reset and return
      if (templates.length === 0) {
        setTemplateHolidays([])
        return
      }

      const templateIds = templates.join(',')

      // Ensure templateIds is not empty before making API call
      if (!templateIds || templateIds.trim() === '') {
        setTemplateHolidays([])
        return
      }

      const res = await new BasicProvider(`holidays/template/${templateIds}`, dispatch).getRequest()

      // Only set holidays if response has data, otherwise set empty array
      setTemplateHolidays(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error('Error fetching template holidays:', err)
      // Reset to empty array on error
      setTemplateHolidays([])
    }
  }

  useEffect(() => {
    applyFilters()
  }, [attendanceData, filters])

  useEffect(() => {
    fetchAttendanceData()
  }, [filters, mode])

  const fetchAttendanceData = async () => {
    try {
      setLoading(true)
      const response = await new BasicProvider(
        `attendances/staff/${id}?month=${filters.month}&year=${filters.year}`,
        dispatch,
      ).getRequest()
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

    // Filter to only show dates up to today (like LogUserAttendance.js)
    const today = new Date().toISOString().split('T')[0]
    filtered = filtered.filter((item) => {
      const itemDate = new Date(item.date).toISOString().split('T')[0]
      return itemDate <= today
    })

    // If a status filter is selected, further filter using normalizeStatus
    if (filters.status) {
      filtered = filtered.filter(
        (item) =>
          normalizeStatus(item.status, item.date, item.total_duration_minutes) === filters.status,
      )
    }

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
    if (!minutes || isNaN(minutes)) return '--'

    const totalMinutes = Math.round(minutes)
    const hours = Math.floor(totalMinutes / 60)
    const mins = totalMinutes % 60

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
  const openDetails = (attendance) => {
    setSelectedViewAttendance(attendance)
    setShowViewModal(true)
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

  // Handler functions for Edit and Log buttons
  const handleEditAttendance = (attendanceItem) => {
    toast.info('Edit functionality will be implemented')
  }

  const handleViewAttendanceLog = (attendanceItem) => {
    console.log('View attendance log:', attendanceItem)
    setSelectedLogAttendance(attendanceItem)
    setShowLogModal(true)
    setSelectedViewAttendance(attendanceItem)
  }

  const handleCloseLogModal = () => {
    setShowLogModal(false)
    setSelectedLogAttendance(null)
  }

  const handleCloseViewModal = () => {
    setShowViewModal(false)
    setSelectedViewAttendance(null)
  }
  // Lightbox functions
  const openLightbox = (src) => setLightbox({ visible: true, src })
  const closeLightbox = () => setLightbox({ visible: false, src: '' })

  // Image fetching function
  const fetchImagesForAttendance = async (attendance) => {
    try {
      const imageIds = []

      // Collect all image IDs from sessions
      if (attendance.sessions) {
        attendance.sessions.forEach((session) => {
          if (session.punch_in_image) imageIds.push(session.punch_in_image)
          if (session.punch_out_image) imageIds.push(session.punch_out_image)
        })
      }

      console.log('Image IDs found:', imageIds)
      console.log('Current imageMap:', imageMap)

      // Deduplicate IDs
      const uniqueIds = [...new Set(imageIds)]
      if (uniqueIds.length === 0) return

      // Build map for fetched urls
      const map = {}
      await Promise.all(
        uniqueIds.map(async (imageId) => {
          if (imageMap[imageId]) {
            // already present
            map[imageId] = imageMap[imageId]
            return
          }
          try {
            console.log(`Fetching signed URL for image ID: ${imageId}`)
            const res = await new BasicProvider(
              `cms/files/show-file-with-signed-url/${imageId}`,
              dispatch,
            ).getRequest()
            console.log(`Signed URL response for ${imageId}:`, res)

            // Normalize different possible response shapes to a URL string
            let url = null
            if (!res) {
              url = null
            } else if (typeof res === 'string') {
              url = res
            } else if (res.data && typeof res.data === 'string') {
              url = res.data
            } else if (res.data && res.data.data && typeof res.data.data === 'string') {
              url = res.data.data
            } else if (res.data && typeof res.data === 'object') {
              // common fields
              url = res.data.url || res.data.signedUrl || res.data.signed_url || null
            } else if (res.url && typeof res.url === 'string') {
              url = res.url
            }

            map[imageId] = url
          } catch (err) {
            console.error(`Error fetching signed URL for ${imageId}:`, err)
            map[imageId] = null
          }
        }),
      )

      // Merge into existing imageMap
      setImageMap((prev) => ({ ...prev, ...map }))
      console.log('All images fetched, updated imageMap keys:', Object.keys(map))
    } catch (error) {
      console.error('Error fetching images for attendance:', error)
    }
  }

  useEffect(() => {
    if (selectedViewAttendance) {
      fetchImagesForAttendance(selectedViewAttendance)
    }
  }, [selectedViewAttendance])

  const handleAttendanceUpdate = async () => {
    try {
      setIsSubmitting(true)
      setSubmitError('')

      if (!editForm.justification.trim()) {
        setSubmitError('Justification is required for attendance changes.')
        return
      }

      const today = new Date().toISOString().split('T')[0]

      const punchInDate = new Date(`${today}T${editForm.checkIn}:00`)
      const punchOutDate = new Date(`${today}T${editForm.checkOut}:00`)

      // Get old values for proper logging
      const oldPunchIn = selectedAttendance?.sessions?.[0]?.punch_in
      const oldPunchOut = selectedAttendance?.sessions?.[0]?.punch_out
      const oldStatus = selectedAttendance?.status

      const updateData = {
        status: editForm.status,
        message: editForm.justification,
        punch_in: punchInDate,
        punch_out: punchOutDate,
        remarks: editForm.remarks || null,
        // Send old values for proper logging
        oldPunchIn: oldPunchIn ? new Date(oldPunchIn).toISOString() : null,
        oldPunchOut: oldPunchOut ? new Date(oldPunchOut).toISOString() : null,
        oldStatus: oldStatus,
        // Alternative format for compatibility
        old_punch_in: oldPunchIn ? new Date(oldPunchIn).toISOString() : null,
        old_punch_out: oldPunchOut ? new Date(oldPunchOut).toISOString() : null,
        old_status: oldStatus,
      }

      // Call backend API
      const response = await new BasicProvider(
        `attendances/${selectedAttendance?._id}/edit`,
        dispatch,
      ).patchRequest(updateData)

      // console.log('API response after update', response)

      // Replace with backend response instead of local merge
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

  // const normalizeStatus = (s, date, totalMinutes = 0) => {
  //   if (!s) return 'absent'
  //   const status = s.toLowerCase()

  //   // Sunday (weekly off handling)
  //   const day = date ? new Date(date).getDay() : null
  //   if (day === 0) {
  //     if (totalMinutes >= 360) return 'weekly_off_present'
  //     if (totalMinutes > 0 && totalMinutes < 360) return 'weekly_off_half'
  //     return 'weekly_off'
  //   }

  //   switch (status) {
  //     case 'present':
  //       return 'present'
  //     case 'absent':
  //       return 'absent'
  //     case 'leave':
  //       return 'leave'
  //     case 'half_day':
  //       return 'half_day'
  //     case 'double_deduction':
  //       return 'double_deduction'
  //     case 'officialleave':
  //       return 'official_leave'
  //     case 'weekly_off':
  //       return 'weekly_off'
  //     case 'weekly_off_present':
  //       return 'weekly_off_present'
  //     case 'weekly_off_half':
  //       return 'weekly_off_half'
  //     case 'idle_timeout':
  //       return 'idle_timeout'
  //     default:
  //       return status.replace(' ', '_')
  //   }
  // }

  const normalizeStatus = (s, date, totalMinutes = 0) => {
    // ...existing code...
    if (!s) return 'absent'

    const raw = String(s).trim()
    const key = raw.toLowerCase().replace(/[\s\-_]/g, '')

    // explicit weekly-off variants first (API sometimes returns WeeklyOff / Weekend / WeeklyPresent / WeeklyHalfDay)
    if (key.includes('weeklyoff') || key === 'weekend' || key.includes('weeklypresent') || key.includes('weeklyhalfday')) {
      // explicit present/half qualifiers in status string
      if (key.includes('present')) return 'weekly_off_present'
      if (key.includes('half')) return 'weekly_off_half'
      // fallback to using minutes or day
      const day = date ? new Date(date).getDay() : null
      if (day === 0) {
        if (totalMinutes >= 360) return 'weekly_off_present'
        if (totalMinutes > 0 && totalMinutes < 360) return 'weekly_off_half'
        return 'weekly_off'
      }
      return 'weekly_off'
    }

    // Check for specific leave types (must be before generic 'leave' check)
    if (key.includes('lcl') || key === 'cl' || (key.includes('leave') && key.includes('cl'))) return 'leave_cl'
    if (key.includes('lul') || key === 'ul' || (key.includes('leave') && key.includes('ul'))) return 'leave_ul'
    if (key.includes('leme') || key.includes('eme') || (key.includes('leave') && (key.includes('emergency') || key.includes('eme')))) return 'leave_emergency'
    
    // Holiday check
    if (key.includes('holiday')) return 'holiday'
    
    // Official leave
    if (key.includes('official')) return 'official_leave'

    // Double deduction before generic present/half (Present→DD must not match "present")
    if (key.includes('doublededuction') || key === 'dd') return 'double_deduction'

    // Sunday rule: Present/Half on Sunday should count in weekly-off buckets
    const day = date ? new Date(date).getDay() : null
    if (day === 0) {
      if (key.includes('present') || totalMinutes >= 360) return 'weekly_off_present'
      if (key.includes('half') || (totalMinutes > 0 && totalMinutes < 360)) return 'weekly_off_half'
      if (key.includes('absent') || key.includes('notmarked') || totalMinutes <= 0) return 'weekly_off'
    }
    
    // Half day (but not weekly off half - already checked above)
    if ((key.includes('halfday') || key.includes('half')) && !key.includes('weekly')) return 'half_day'
    
    // Present (but not weekly off present - already checked above)
    if (key.includes('present') && !key.includes('weekly')) return 'present'
    
    // Absent
    if (key.includes('absent')) return 'absent'
    
    // Generic leave (after specific leave types)
    if (key.includes('leave')) return 'leave'
    
    // Other statuses
    if (key.includes('idletimeout')) return 'idle_timeout'
    if (key.includes('notmarked')) return 'not_marked'

    // if status not recognized, fallback to day-based weekly off logic
    if (day === 0) {
      if (totalMinutes >= 360) return 'weekly_off_present'
      if (totalMinutes > 0 && totalMinutes < 360) return 'weekly_off_half'
      return 'weekly_off'
    }

    return raw.toLowerCase().replace(/\s+/g, '_')
  }

  const getAttendanceTotals = (data = []) => {
    const totals = {
      days: data.length, // Total days in month (API response array length)
      present: 0,
      absent: 0,
      leave: 0,
      leave_cl: 0,
      leave_ul: 0,
      leave_emergency: 0,
      half_day: 0,
      double_deduction: 0,
      official_leave: 0,
      holiday: 0,
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

    // Keep "weekly off only" (no work) for net payable calculation
    totals.weekly_off_only = totals.weekly_off
    // Include weekly_off_present and weekly_off_half in weekly_off count
    totals.weekly_off = totals.weekly_off + totals.weekly_off_present + totals.weekly_off_half

    totals.absent_for_display = (totals.absent || 0) + (totals.double_deduction || 0)

    return totals
  }

  // Calculate summary statistics
  const calculateSummaryStats = (data = []) => {
    let totalWorkingMinutes = 0
    let lateDays = 0
    let overtimeDays = 0
    let totalOvertimeMinutes = 0

    data.forEach((item) => {
      const workingMinutes = item.total_duration_minutes || 0
      totalWorkingMinutes += workingMinutes

      // Check for late (punch in >= 10:31)
      if (item.sessions && item.sessions.length > 0) {
        const firstSession = item.sessions[0]
        if (firstSession.punch_in) {
          const punchInTime = new Date(firstSession.punch_in)
          const hours = punchInTime.getHours()
          const minutes = punchInTime.getMinutes()
          const totalMinutes = hours * 60 + minutes
          // 10:31 = 10 * 60 + 31 = 631 minutes
          if (totalMinutes >= 631) {
            lateDays++
          }
        }
      }

      // Calculate overtime - count all overtime minutes, even small amounts
      const backendOvertime = item.overtime_minutes || 0
      const totalMinutes = workingMinutes || 0
      
      // Use backend overtime if available and > 0, otherwise calculate it
      const overtimeMins =
        backendOvertime > 0
          ? backendOvertime
          : Math.max(0, totalMinutes - 9 * 60) // 9 hours = 540 minutes
      
      // Count all overtime minutes, even if less than 30 minutes
      if (overtimeMins > 0) {
        totalOvertimeMinutes += overtimeMins
        // Count as overtime day if >= 30 minutes (for display purposes)
        if (overtimeMins >= 30) {
          overtimeDays++
        }
      }
    })

    // Calculate performance rating based on average minutes per day
    // Very Poor: upto 450 minutes per day
    // Poor: 451 to 510 minutes per day
    // Good: 511 to 540 minutes per day
    // Very Good: 541 to 570 minutes per day
    // Excellence: 571 & above minutes per day
    
    const totalDays = data.length
    const avgMinutesPerDay = totalDays > 0 ? totalWorkingMinutes / totalDays : 0
    const avgWorkingHours = totalDays > 0 ? totalWorkingMinutes / (totalDays * 60) : 0
    
    let performanceRating = 'Poor'
    let performanceColor = 'danger'
    
    if (avgWorkingHours >= 8.5) {
      performanceRating = 'Excellent'
      performanceColor = 'success'
    } else if (avgWorkingHours >= 8) {
      performanceRating = 'Very Good'
      performanceColor = 'info'
    } else if (avgWorkingHours >= 7) {
      performanceRating = 'Good'
      performanceColor = 'warning'
    }

    return {
      totalWorkingHours: formatDuration(totalWorkingMinutes),
      totalWorkingMinutes,
      lateDays,
      overtimeDays,
      totalOvertime: formatDuration(totalOvertimeMinutes),
      performanceRating,
      performanceColor,
      avgWorkingHours: avgWorkingHours.toFixed(2),
    }
  }

  // inside Attendance component render
  const totals = getAttendanceTotals(filteredData)
  const summaryStats = calculateSummaryStats(filteredData)
  
  if (loading) {
    return (
      <div className="container py-4">
        <AppContentSkeleton ariaLabel="Loading attendance logs" cards={3} rows={6} />
      </div>
    )
  }

  return (
    <>
      <CCard style={{ marginBottom: '20px', padding: '10px 0px', borderRadius: '0px' }}>
        <h5 style={{ marginLeft: '20px' }}>| Attendance Records</h5>
      </CCard>
      <div style={{ width: '95%', margin: 'auto' }}>
        {/* Summary Cards */}
        <CRow className="mb-4">
          <CCol md={3}>
            <CCard className="text-center" style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
            }}>
              <CCardBody>
                <CIcon icon={cilClock} size="2xl" className="mb-2" />
                <h6 className="mb-1" style={{ opacity: 0.9 }}>Total Working Hours</h6>
                <h3 className="mb-0 fw-bold">{summaryStats.totalWorkingHours}</h3>
                <small style={{ opacity: 0.8 }}>This Month</small>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol md={3}>
            <CCard className="text-center" style={{ 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              border: 'none',
              boxShadow: '0 4px 15px rgba(245, 87, 108, 0.3)'
            }}>
              <CCardBody>
                <CIcon icon={cilWarning} size="2xl" className="mb-2" />
                <h6 className="mb-1" style={{ opacity: 0.9 }}>Late Days</h6>
                <h3 className="mb-0 fw-bold">{summaryStats.lateDays}</h3>
                <small style={{ opacity: 0.8 }}>Punch In ≥ 10:31 AM</small>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol md={3}>
            <CCard className="text-center" style={{ 
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              border: 'none',
              boxShadow: '0 4px 15px rgba(79, 172, 254, 0.3)'
            }}>
              <CCardBody>
                <CIcon icon={cilSpeedometer} size="2xl" className="mb-2" />
                <h6 className="mb-1" style={{ opacity: 0.9 }}>Overtime</h6>
                <h3 className="mb-0 fw-bold">{summaryStats.totalOvertime}</h3>
                <small style={{ opacity: 0.8 }}>{summaryStats.overtimeDays} Days</small>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol md={3}>
            <CCard className="text-center" style={{ 
              background: `linear-gradient(135deg, ${
                summaryStats.performanceColor === 'success' ? '#11998e 0%, #38ef7d 100%' :
                summaryStats.performanceColor === 'info' ? '#667eea 0%, #764ba2 100%' :
                summaryStats.performanceColor === 'warning' ? '#f093fb 0%, #f5576c 100%' :
                '#fa709a 0%, #fee140 100%'
              })`,
              color: 'white',
              border: 'none',
              boxShadow: `0 4px 15px rgba(${
                summaryStats.performanceColor === 'success' ? '17, 153, 142' :
                summaryStats.performanceColor === 'info' ? '102, 126, 234' :
                summaryStats.performanceColor === 'warning' ? '245, 87, 108' :
                '250, 112, 154'
              }, 0.3)`
            }}>
              <CCardBody>
                <CIcon icon={cilStar} size="2xl" className="mb-2" />
                <h6 className="mb-1" style={{ opacity: 0.9 }}>Performance</h6>
                <h3 className="mb-0 fw-bold">{summaryStats.performanceRating}</h3>
                <small style={{ opacity: 0.8 }}>Avg: {summaryStats.avgWorkingHours}h/day</small>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>

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
                  <CCol md={3}>
                    <label className="form-label fw-semibold">Status</label>
                    <AppFormSelect
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    >
                      <option value="">All</option>
                      {buttonsList
                        .filter((b) => b.key !== 'double_deduction')
                        .map((b) => (
                          <option key={b.key} value={b.key}>
                            {b.label}
                          </option>
                        ))}
                    </AppFormSelect>
                  </CCol>
                  <CCol md={3} className="d-flex align-items-end">
                    <CButton
                      color="primary"
                      onClick={() => {
                        const currentDate = new Date()
                        setFilters((prev) => ({
                          ...prev,
                          month: currentDate.getMonth() + 1,
                          year: currentDate.getFullYear(),
                        }))
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

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
          {mode === 'month' ? (
            <CButton
              color={mode === 'calendar' ? 'primary' : 'secondary'}
              onClick={() => setMode('calendar')}
            >
              Calendar View
            </CButton>
          ) : (
            <CButton
              color={mode === 'month' ? 'primary' : 'secondary'}
              className="me-2"
              onClick={() => setMode('month')}
            >
              Table View
            </CButton>
          )}
        </div>
        {/* Attendance Table */}
        {mode === 'month' ? (
          <CCardBody>
            <AttendanceTable
              attendanceData={filteredData}
              onEdit={handleEditAttendance}
              onViewLog={handleViewAttendanceLog}
              onView={openDetails}
              holidays={templateHolidays}
              showEditButton={false}
            />
          </CCardBody>
        ) : (
          <>
            <CCardBody>
              <AttendanceCalendar
                attendanceData={filteredData}
                currentMonth={filters.month}
                currentYear={filters.year}
                templateHolidays={templateHolidays}
                showAuditFeatures={isADMIN}
              />
            </CCardBody>

            <CRow className="mt-3 g-3">
              {/* Net Payable: P + HD/2 + Weekly Off (card) + WOP + WOH/2 + H + OL + CL − Double Deduction */}
              <CCol xs={12} className="mb-3">
                {(() => {
                  const netPayableDays = computeNetPayableDays(totals)
                  const displayValue = Number.isInteger(netPayableDays) ? netPayableDays : Number(netPayableDays.toFixed(2))
                  return (
                    <CCard
                      className="border-0 overflow-hidden"
                      style={{
                        background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 14%, #14b8a6 40%, #2dd4bf 70%, #5eead4 100%)',
                        color: 'white',
                        boxShadow: '0 8px 24px rgba(13, 148, 136, 0.4), 0 0 0 3px rgba(255,255,255,0.15)',
                        transition: 'all 0.3s ease',
                        cursor: 'default',
                        borderRadius: '16px',
                        border: '2px solid rgba(255, 255, 255, 0.25)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)'
                        e.currentTarget.style.boxShadow = '0 12px 32px rgba(13, 148, 136, 0.5), 0 0 0 3px rgba(255,255,255,0.2)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(13, 148, 136, 0.4), 0 0 0 3px rgba(255,255,255,0.15)'
                      }}
                    >
                      <CCardBody className="p-4">
                        <div className="d-flex align-items-center flex-wrap">
                          <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '16px',
                            background: 'rgba(255, 255, 255, 0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '20px',
                            flexShrink: 0,
                          }}>
                            <CIcon icon={cilWallet} size="2xl" />
                          </div>
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-baseline flex-wrap gap-2">
                              <h3 className="mb-0 fw-bold me-2" style={{ color: 'white', fontSize: '1.75rem' }}>Net Payable Days</h3>
                            </div>
                          </div>
                          <div className="text-end" style={{ minWidth: '100px' }}>
                            <div className="display-4 fw-bold" style={{ color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>{displayValue}</div>
                            <div className="small" style={{ opacity: 0.9 }}>days</div>
                          </div>
                        </div>
                      </CCardBody>
                    </CCard>
                  )
                })()}
              </CCol>
              <CCol sm={6} md={3}>
                <CCard className="border-0 overflow-hidden" style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.2)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  borderRadius: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.2)'
                }}
                >
                  <CCardBody className="p-3">
                    <div className="d-flex align-items-center">
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '12px'
                      }}>
                        <CIcon icon={cilCalendar} size="xl" />
                      </div>
                      <div className="flex-grow-1">
                        <div className="small mb-1" style={{ opacity: 0.9, color: 'white' }}>Total Days</div>
                        <h4 className="mb-0 fw-bold" style={{ color: 'white' }}>{totals.days}</h4>
                      </div>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>
              <CCol sm={6} md={3}>
                <CCard className="border-0 overflow-hidden" style={{ 
                  background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(17, 153, 142, 0.2)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  borderRadius: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(17, 153, 142, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(17, 153, 142, 0.2)'
                }}
                >
                  <CCardBody className="p-3">
                    <div className="d-flex align-items-center">
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '12px'
                      }}>
                        <CIcon icon={cilCheckCircle} size="xl" />
                      </div>
                      <div className="flex-grow-1">
                        <div className="small mb-1" style={{ opacity: 0.9, color: 'white' }}>Present</div>
                        <h4 className="mb-0 fw-bold" style={{ color: 'white' }}>{totals.present}</h4>
                      </div>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>
              <CCol sm={6} md={3}>
                <CCard className="border-0 overflow-hidden" style={{ 
                  background: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(235, 51, 73, 0.2)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  borderRadius: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(235, 51, 73, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(235, 51, 73, 0.2)'
                }}
                >
                  <CCardBody className="p-3">
                    <div className="d-flex align-items-center">
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '12px'
                      }}>
                        <CIcon icon={cilXCircle} size="xl" />
                      </div>
                      <div className="flex-grow-1">
                        <div className="small mb-1" style={{ opacity: 0.9, color: 'white' }}>Absent</div>
                        <h4 className="mb-0 fw-bold" style={{ color: 'white' }}>{totals.absent_for_display}</h4>
                      </div>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>
              <CCol sm={6} md={3}>
                <CCard className="border-0 overflow-hidden" style={{ 
                  background: 'linear-gradient(135deg, #f09819 0%, #edde5d 100%)',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(240, 152, 25, 0.2)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  borderRadius: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(240, 152, 25, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(240, 152, 25, 0.2)'
                }}
                >
                  <CCardBody className="p-3">
                    <div className="d-flex align-items-center">
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '12px'
                      }}>
                        <CIcon icon={cilClock} size="xl" />
                      </div>
                      <div className="flex-grow-1">
                        <div className="small mb-1" style={{ opacity: 0.9, color: 'white' }}>Half Day</div>
                        <h4 className="mb-0 fw-bold" style={{ color: 'white' }}>{totals.half_day}</h4>
                      </div>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>
              <CCol sm={6} md={3}>
                <CCard className="border-0 overflow-hidden" style={{ 
                  background: 'linear-gradient(135deg, #8360c3 0%, #2ebf91 100%)',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(131, 96, 195, 0.2)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  borderRadius: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(131, 96, 195, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(131, 96, 195, 0.2)'
                }}
                >
                  <CCardBody className="p-3">
                    <div className="d-flex align-items-center">
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '12px'
                      }}>
                        <CIcon icon={cilBan} size="xl" />
                      </div>
                      <div className="flex-grow-1">
                        <div className="small mb-1" style={{ opacity: 0.9, color: 'white' }}>Weekly Off</div>
                        <h4 className="mb-0 fw-bold" style={{ color: 'white' }}>{totals.weekly_off}</h4>
                      </div>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>
              <CCol sm={6} md={3}>
                <CCard className="border-0 overflow-hidden" style={{ 
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(79, 172, 254, 0.2)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  borderRadius: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(79, 172, 254, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(79, 172, 254, 0.2)'
                }}
                >
                  <CCardBody className="p-3">
                    <div className="d-flex align-items-center">
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '12px'
                      }}>
                        <CIcon icon={cilCalendarCheck} size="xl" />
                      </div>
                      <div className="flex-grow-1">
                        <div className="small mb-1" style={{ opacity: 0.9, color: 'white' }}>Leave</div>
                        <h4 className="mb-0 fw-bold" style={{ color: 'white' }}>{totals.leave}</h4>
                      </div>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>
              <CCol sm={6} md={3}>
                <CCard className="border-0 overflow-hidden" style={{ 
                  background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(250, 112, 154, 0.2)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  borderRadius: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(250, 112, 154, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(250, 112, 154, 0.2)'
                }}
                >
                  <CCardBody className="p-3">
                    <div className="d-flex align-items-center">
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '12px'
                      }}>
                        <CIcon icon={cilStar} size="xl" />
                      </div>
                      <div className="flex-grow-1">
                        <div className="small mb-1" style={{ opacity: 0.9, color: 'white' }}>Official Leave</div>
                        <h4 className="mb-0 fw-bold" style={{ color: 'white' }}>{totals.official_leave}</h4>
                      </div>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>
              <CCol sm={6} md={3}>
                <CCard className="border-0 overflow-hidden" style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.2)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  borderRadius: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.2)'
                }}
                >
                  <CCardBody className="p-3">
                    <div className="d-flex align-items-center">
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '12px'
                      }}>
                        <CIcon icon={cilCheckCircle} size="xl" />
                      </div>
                      <div className="flex-grow-1">
                        <div className="small mb-1" style={{ opacity: 0.9, color: 'white' }}>Weekly Off Present</div>
                        <h4 className="mb-0 fw-bold" style={{ color: 'white' }}>{totals.weekly_off_present}</h4>
                      </div>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>
              <CCol sm={6} md={3}>
                <CCard className="border-0 overflow-hidden" style={{ 
                  background: 'linear-gradient(135deg, #f09819 0%, #edde5d 100%)',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(240, 152, 25, 0.2)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  borderRadius: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(240, 152, 25, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(240, 152, 25, 0.2)'
                }}
                >
                  <CCardBody className="p-3">
                    <div className="d-flex align-items-center">
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '12px'
                      }}>
                        <CIcon icon={cilClock} size="xl" />
                      </div>
                      <div className="flex-grow-1">
                        <div className="small mb-1" style={{ opacity: 0.9, color: 'white' }}>Weekly Off Half Day</div>
                        <h4 className="mb-0 fw-bold" style={{ color: 'white' }}>{totals.weekly_off_half}</h4>
                      </div>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>
              {/* New Status Cards */}
              <CCol sm={6} md={3}>
                <CCard className="border-0 overflow-hidden" style={{ 
                  background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(52, 152, 219, 0.2)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  borderRadius: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(52, 152, 219, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(52, 152, 219, 0.2)'
                }}
                >
                  <CCardBody className="p-3">
                    <div className="d-flex align-items-center">
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '12px'
                      }}>
                        <CIcon icon={cilCalendarCheck} size="xl" />
                      </div>
                      <div className="flex-grow-1">
                        <div className="small mb-1" style={{ opacity: 0.9, color: 'white' }}>CL (L-CL)</div>
                        <h4 className="mb-0 fw-bold" style={{ color: 'white' }}>{totals.leave_cl}</h4>
                      </div>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>
              <CCol sm={6} md={3}>
                <CCard className="border-0 overflow-hidden" style={{ 
                  background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(155, 89, 182, 0.2)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  borderRadius: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(155, 89, 182, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(155, 89, 182, 0.2)'
                }}
                >
                  <CCardBody className="p-3">
                    <div className="d-flex align-items-center">
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '12px'
                      }}>
                        <CIcon icon={cilUser} size="xl" />
                      </div>
                      <div className="flex-grow-1">
                        <div className="small mb-1" style={{ opacity: 0.9, color: 'white' }}>UL (L-UL)</div>
                        <h4 className="mb-0 fw-bold" style={{ color: 'white' }}>{totals.leave_ul}</h4>
                      </div>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>
              <CCol sm={6} md={3}>
                <CCard className="border-0 overflow-hidden" style={{ 
                  background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(231, 76, 60, 0.2)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  borderRadius: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(231, 76, 60, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(231, 76, 60, 0.2)'
                }}
                >
                  <CCardBody className="p-3">
                    <div className="d-flex align-items-center">
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '12px'
                      }}>
                        <CIcon icon={cilBell} size="xl" />
                      </div>
                      <div className="flex-grow-1">
                        <div className="small mb-1" style={{ opacity: 0.9, color: 'white' }}>Emergency (L-EME)</div>
                        <h4 className="mb-0 fw-bold" style={{ color: 'white' }}>{totals.leave_emergency}</h4>
                      </div>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>
              <CCol sm={6} md={3}>
                <CCard className="border-0 overflow-hidden" style={{ 
                  background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(243, 156, 18, 0.2)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  borderRadius: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(243, 156, 18, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(243, 156, 18, 0.2)'
                }}
                >
                  <CCardBody className="p-3">
                    <div className="d-flex align-items-center">
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '12px'
                      }}>
                        <CIcon icon={cilFlagAlt} size="xl" />
                      </div>
                      <div className="flex-grow-1">
                        <div className="small mb-1" style={{ opacity: 0.9, color: 'white' }}>Holiday</div>
                        <h4 className="mb-0 fw-bold" style={{ color: 'white' }}>{totals.holiday}</h4>
                      </div>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>
              <CCol sm={6} md={3}>
                <CCard className="border-0 overflow-hidden" style={{ 
                  background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(52, 73, 94, 0.2)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  borderRadius: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(52, 73, 94, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(52, 73, 94, 0.2)'
                }}
                >
                  <CCardBody className="p-3">
                    <div className="d-flex align-items-center">
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '12px'
                      }}>
                        <CIcon icon={cilX} size="xl" />
                      </div>
                      <div className="flex-grow-1">
                        <div className="small mb-1" style={{ opacity: 0.9, color: 'white' }}>Double Deduction</div>
                        <h4 className="mb-0 fw-bold" style={{ color: 'white' }}>{totals.double_deduction}</h4>
                      </div>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
          </>
        )}
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
                  {/* <option value="double_deduction">Double Deduction</option> */}
                  <option value="official_leave">Official Leave</option>
                  <option value="weekly_off">Weekly Off</option>
                  {/* <option value="weekly_off_present">Weekly Off Present</option> */}
                  {/* <option value="weekly_off_half">Weekly Off Half Day</option> */}
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
      {/* Attendance Log Modal */}
      <CModal visible={showLogModal} onClose={handleCloseLogModal} size="lg" backdrop="static">
        <CModalHeader className="bg-light">
          <CModalTitle className="fw-bold text-primary">
            <CIcon icon={cilClock} className="me-2" />
            Attendance Log History
          </CModalTitle>
        </CModalHeader>

        <CModalBody>
          {selectedLogAttendance ? (
            <>
              {/* Employee and Date Info */}
              <div className="mb-4 p-3 bg-light rounded border">
                <h6 className="text-primary mb-3">
                  <CIcon icon={cilUser} className="me-2" />
                  Employee Information
                </h6>
                <CRow>
                  <CCol md={6}>
                    <strong>Employee:</strong>{' '}
                    {selectedViewAttendance.user?.name || employeeData?.user.name || 'Unknown'}
                  </CCol>
                  <CCol md={6}>
                    <strong>Date:</strong> {selectedLogAttendance.date}
                  </CCol>
                </CRow>
              </div>

              {/* Log Entries */}
              <div>
                <h6 className="text-success mb-3">
                  <CIcon icon={cilPencil} className="me-2" />
                  Edit History
                </h6>

                {selectedLogAttendance.logs && selectedLogAttendance.logs.length > 0 ? (
                  <div className="timeline">
                    {selectedLogAttendance.logs.map((log, index) => (
                      <div
                        key={log._id || index}
                        className="timeline-item mb-3 p-3 border rounded bg-white"
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          {/* LEFT SECTION */}
                          <div>
                            <div className="mb-2">
                              <strong className="text-warning">Status Changed</strong>
                              <p className="mb-1 text-muted">
                                from <strong>{log.oldStatus || 'N/A'}</strong> to{' '}
                                <strong>{log.newStatus || 'N/A'}</strong>
                              </p>
                            </div>

                            <div className="mb-2">
                              <strong className="text-primary">Punch In</strong>
                              <p className="mb-1 text-muted">
                                from{' '}
                                <strong>
                                  {log.oldPunchIn
                                    ? new Date(log.oldPunchIn).toLocaleTimeString('en-IN', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })
                                    : 'N/A'}
                                </strong>{' '}
                                to{' '}
                                <strong>
                                  {log.newPunchIn
                                    ? new Date(log.newPunchIn).toLocaleTimeString('en-IN', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })
                                    : 'N/A'}
                                </strong>
                              </p>
                            </div>

                            <div className="mb-2">
                              <strong className="text-info">Punch Out</strong>
                              <p className="mb-1 text-muted">
                                from{' '}
                                <strong>
                                  {log.oldPunchOut
                                    ? new Date(log.oldPunchOut).toLocaleTimeString('en-IN', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })
                                    : 'N/A'}
                                </strong>{' '}
                                to{' '}
                                <strong>
                                  {log.newPunchOut
                                    ? new Date(log.newPunchOut).toLocaleTimeString('en-IN', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })
                                    : 'N/A'}
                                </strong>
                              </p>
                            </div>

                            <small className="text-muted d-block">
                              <strong>Reason:</strong> {log.message || 'N/A'}
                            </small>
                          </div>

                          {/* RIGHT SECTION */}
                          <div className="text-end">
                            <small className="text-muted d-block">
                              by{' '}
                              <strong>
                                {log.role || 'N/A'} - {log.updatedByName || 'Unknown'}
                              </strong>
                            </small>
                            <small className="text-muted">
                              {log.timestamp
                                ? new Date(log.timestamp).toLocaleString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true,
                                  })
                                : 'N/A'}
                            </small>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-4 text-muted">
                    <CIcon icon={cilClock} size="xl" className="mb-2" />
                    <p>No edit history available for this attendance record.</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center p-4 text-muted">
              <CSpinner size="sm" className="me-2" /> Loading log details...
            </div>
          )}
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" onClick={handleCloseLogModal}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>

      {/* View Details Modal */}
      <CModal visible={showViewModal} onClose={handleCloseViewModal} size="lg" scrollable>
        <CModalHeader>
          <CModalTitle>Attendance Details</CModalTitle>
        </CModalHeader>
        <CModalBody style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {selectedViewAttendance && (
            <>
              <div className="mb-3">
                <h6 className="mb-2">Employee Info</h6>
                <p>
                  <strong>Name:</strong>{' '}
                  {selectedViewAttendance.user?.name || employeeData?.user.name || 'Unknown'} <br />
                  <strong>Email:</strong>{' '}
                  {selectedViewAttendance.user?.email || employeeData?.user.email || 'N'} <br />
                  <strong>Date:</strong>{' '}
                  {new Date(selectedViewAttendance.date).toLocaleDateString()} <br />
                  <strong>Status:</strong>{' '}
                  <CBadge color={statusColors[selectedViewAttendance.status]?.color || 'secondary'}>
                    {selectedViewAttendance.status}
                  </CBadge>
                </p>
              </div>

              {/* Sessions Table */}
              <div className="mb-3">
                <h6 className="mb-2">Sessions</h6>
                <div style={{ overflowX: 'auto' }}>
                  <CTable striped bordered hover responsive>
                    <CTableHead color="light">
                      <CTableRow>
                        <CTableHeaderCell>Punch In</CTableHeaderCell>
                        <CTableHeaderCell>Punch Out</CTableHeaderCell>
                        <CTableHeaderCell>Duration</CTableHeaderCell>
                        <CTableHeaderCell>Location</CTableHeaderCell>
                        <CTableHeaderCell>Punch In Image</CTableHeaderCell>
                        <CTableHeaderCell>Punch Out Image</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {selectedViewAttendance.sessions?.map((session, index) => (
                        <CTableRow key={session._id}>
                          <CTableDataCell>{formatTime(session.punch_in)}</CTableDataCell>
                          <CTableDataCell>{formatTime(session.punch_out)}</CTableDataCell>
                          <CTableDataCell>
                            {Math.floor(session.duration_minutes / 60)}h{' '}
                            {Math.floor(session.duration_minutes % 60)}m
                          </CTableDataCell>
                          <CTableDataCell>
                            {session.punch_in_location?.location || '-'}
                          </CTableDataCell>
                          <CTableDataCell>
                            {(() => {
                              return session.punch_in_image && imageMap[session.punch_in_image] ? (
                                <img
                                  src={imageMap[session.punch_in_image]}
                                  alt="Punch In"
                                  width="80"
                                  style={{ borderRadius: '5px', cursor: 'pointer' }}
                                  onClick={() => openLightbox(imageMap[session.punch_in_image])}
                                />
                              ) : (
                                <span className="text-muted">
                                  {session.punch_in_image ? 'Loading...' : 'No Image'}
                                </span>
                              )
                            })()}
                          </CTableDataCell>
                          <CTableDataCell>
                            {(() => {
                              return session.punch_out_image &&
                                imageMap[session.punch_out_image] ? (
                                <img
                                  src={imageMap[session.punch_out_image]}
                                  alt="Punch Out"
                                  width="80"
                                  style={{ borderRadius: '5px', cursor: 'pointer' }}
                                  onClick={() => openLightbox(imageMap[session.punch_out_image])}
                                />
                              ) : (
                                <span className="text-muted">
                                  {session.punch_out_image ? 'Loading...' : 'No Image'}
                                </span>
                              )
                            })()}
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </div>
              </div>

              {/* Logs Section */}
              {selectedViewAttendance.logs?.length > 0 && (
                <div className="mb-3">
                  <h6 className="mb-2">Edit History</h6>
                  <div style={{ overflowX: 'auto' }}>
                    <CTable striped bordered hover responsive size="sm">
                      <CTableHead color="light">
                        <CTableRow>
                          <CTableHeaderCell>Role</CTableHeaderCell>
                          <CTableHeaderCell>Message</CTableHeaderCell>
                          <CTableHeaderCell>Old Status</CTableHeaderCell>
                          <CTableHeaderCell>New Status</CTableHeaderCell>
                          <CTableHeaderCell>Old Punch In</CTableHeaderCell>
                          <CTableHeaderCell>New Punch In</CTableHeaderCell>
                          <CTableHeaderCell>Old Punch Out</CTableHeaderCell>
                          <CTableHeaderCell>New Punch Out</CTableHeaderCell>
                          <CTableHeaderCell>Timestamp</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {selectedViewAttendance.logs.map((log) => (
                          <CTableRow key={log._id}>
                            <CTableDataCell>
                              <CBadge color="info">{log.role}</CBadge>
                              <CBadge color="secondary">{log.updatedByName}</CBadge>
                            </CTableDataCell>
                            <CTableDataCell>{log.message || '-'}</CTableDataCell>
                            <CTableDataCell>
                              {log.oldStatus ? (
                                <CBadge color={statusColors[log.oldStatus]?.color || 'secondary'}>
                                  {log.oldStatus}
                                </CBadge>
                              ) : (
                                '-'
                              )}
                            </CTableDataCell>
                            <CTableDataCell>
                              {log.newStatus ? (
                                <CBadge color={statusColors[log.newStatus]?.color || 'secondary'}>
                                  {log.newStatus}
                                </CBadge>
                              ) : (
                                '-'
                              )}
                            </CTableDataCell>
                            <CTableDataCell>
                              {log.oldPunchIn ? new Date(log.oldPunchIn).toLocaleString() : '-'}
                            </CTableDataCell>
                            <CTableDataCell>
                              {log.newPunchIn ? new Date(log.newPunchIn).toLocaleString() : '-'}
                            </CTableDataCell>
                            <CTableDataCell>
                              {log.oldPunchOut ? new Date(log.oldPunchOut).toLocaleString() : '-'}
                            </CTableDataCell>
                            <CTableDataCell>
                              {log.newPunchOut ? new Date(log.newPunchOut).toLocaleString() : '-'}
                            </CTableDataCell>
                            <CTableDataCell>
                              {new Date(log.timestamp).toLocaleString()}
                            </CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                  </div>
                </div>
              )}
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={handleCloseViewModal}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Lightbox Modal */}
      <CModal
        visible={lightbox.visible}
        onClose={closeLightbox}
        size="lg"
        alignment="center"
        backdrop="static"
      >
        <CModalBody
          className="d-flex justify-content-center align-items-center position-relative p-0"
          style={{ minHeight: '60vh' }}
        >
          {/* Close Button */}
          <CButton
            color="danger"
            size="sm"
            onClick={closeLightbox}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              zIndex: 10,
            }}
          >
            X
          </CButton>

          {/* Image Container */}
          <div
            style={{
              width: '60vw',
              height: '50vh',
              background: '#000',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            <img
              src={lightbox.src}
              alt="Full Size"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          </div>
        </CModalBody>
      </CModal>
    </>
  )
}

export default Attendance
