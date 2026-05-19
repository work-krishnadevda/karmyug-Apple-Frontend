import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import moment from 'moment'

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


import AppFormSelect from 'src/components/form/AppFormSelect'
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
  cilBell,
  cilWallet,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useDispatch, useSelector } from 'react-redux'
import BasicProvider from 'src/constants/BasicProvider'
import { checkRole } from 'src/constants/common'
import { label } from 'yet-another-react-lightbox'
import { useLocation } from 'src/hooks/useLocation'
import AttendanceTable from 'src/components/hrms/attendance/AttendancePanel'
import AttendanceCalendar from 'src/components/hrms/attendance/AttendanceCalendar2'
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
  const { id } = useParams()
  const navigate = useNavigate()

  // const [expandedRow, setExpandedRow] = useState(null)
  const [expandedSessions, setExpandedSessions] = useState(null)
  const [expandedLogs, setExpandedLogs] = useState(null)
  const dispatch = useDispatch()
  const admin = useSelector((state) => state.userData)
  const [loading, setLoading] = useState(true)
  const [attendanceData, setAttendanceData] = useState([])
  const [employeeData, setEmployeeData] = useState(null)
  const [filteredData, setFilteredData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1, // Current month (1-12)
    year: new Date().getFullYear(), // Current year
    status: '', // optional status filter (present, absent, leave, half_day, etc.)
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

  // Log Modal States
  const [showLogModal, setShowLogModal] = useState(false)
  const [selectedLogAttendance, setSelectedLogAttendance] = useState(null)
  const [templateHolidays, setTemplateHolidays] = useState([])
  // View Modal States
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedViewAttendance, setSelectedViewAttendance] = useState(null)
  const [imageMap, setImageMap] = useState({}) // store fileId -> URL
  const [lightbox, setLightbox] = useState({ visible: false, src: '' }) // for full-size image
  
  // Attendance Correction Modal States
  const [showCorrectionModal, setShowCorrectionModal] = useState(false)
  const [correctionForm, setCorrectionForm] = useState({
    attendanceId: '', // Store attendance ID to ensure we always have it
    date: '', // User can edit this
    leaveType: 'CL', // CL, UL, or Emergency
    leaveDuration: 'Full', // Full or Half
    reason: '',
    balanceAction: 'deduct', // Always deduct (Credit) - disabled
    deductBalance: true, // Always true - always deduct/minus balance
  })
  const [isSubmittingCorrection, setIsSubmittingCorrection] = useState(false)
  const [correctionError, setCorrectionError] = useState('')
  const [leaveBalance, setLeaveBalance] = useState({ clBalance: 0, ulBalance: 0 })
  const [loadingBalance, setLoadingBalance] = useState(false)
  
  // Role checking
  let isHR = checkRole(process.env.REACT_APP_HR, admin)
  let isADMIN = checkRole(process.env.REACT_APP_ADMIN, admin)
  const canEditAttendance = isHR || isADMIN
  
  // Get current user role name
  const getUserRoleName = () => {
    if (isADMIN) return 'Admin'
    if (isHR) return 'HR'
    return 'Staff'
  }
  
  // Get approved by name with role
  const getApprovedByName = () => {
    const userName = admin?.name || 'System'
    const userRole = getUserRoleName()
    return `${userName} (${userRole})`
  }

  // useEffect(() => {
  //   fetchAttendanceData()
  // }, [filters])

  useEffect(() => {
    applyFilters()
  }, [attendanceData, filters])

  useEffect(() => {
    fetchEmployeeData()
    // fetchTemplateHolidays()
    fetchAttendanceData()
    fetchLeaveBalance()
  }, [id, filters, mode])

  // Separate effect to handle template holidays when employeeData changes
  useEffect(() => {
    fetchTemplateHolidays()
  }, [employeeData])

  const fetchEmployeeData = async () => {
    try {
      const response = await new BasicProvider(`profiles/${id}`, dispatch).getRequest()
      setEmployeeData(response.data)
    } catch (error) {
      console.error('Error fetching employee data:', error)
    }
  }

  const fetchLeaveBalance = async () => {
    if (!id) return
    try {
      setLoadingBalance(true)
      const response = await new BasicProvider(`leaves/balance/${id}`, dispatch).getRequest()
      setLeaveBalance({
        clBalance: response.data?.clBalance || response.data?.cl_balance || 0,
        ulBalance: response.data?.ulBalance || response.data?.ul_balance || 0,
      })
    } catch (error) {
      console.error('Error fetching leave balance:', error)
      setLeaveBalance({ clBalance: 0, ulBalance: 0 })
    } finally {
      setLoadingBalance(false)
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

      console.log('Fetching holidays for templates:', templateIds)

      const res = await new BasicProvider(`holidays/template/${templateIds}`, dispatch).getRequest()

      console.log('Template holidays response:', res.data)
      // Only set holidays if response has data, otherwise set empty array
      setTemplateHolidays(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error('Error fetching template holidays:', err)
      // Reset to empty array on error
      setTemplateHolidays([])
    }
  }

  const fetchAttendanceData = async () => {
    try {
      setLoading(true)
      const response = await new BasicProvider(
        `attendances/user/${id}?month=${filters.month}&year=${filters.year}`,
        dispatch,
      ).getRequest()
      setAttendanceData(response.data || [])
    } catch (error) {
      console.error('Error fetching staff attendance data:', error)
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
    const m = moment(dateString)
    return m.isValid() ? m.format('DD-MM-YYYY') : '-'
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

  // Handler functions for Edit and Log buttons
  // Helper function to check if status is weekly off related
  const isWeeklyOffStatus = (status, date, totalMinutes = 0) => {
    const normalized = normalizeStatus(status, date, totalMinutes)
    return normalized === 'weekly_off' || normalized === 'weekly_off_present' || normalized === 'weekly_off_half'
  }

  const handleEditAttendance = (attendanceItem) => {
    // Check if status is "Leave" - if yes, open correction modal instead
    const normalizedStatus = normalizeStatus(
      attendanceItem.status,
      attendanceItem.date,
      attendanceItem.total_duration_minutes || 0
    )
    
    if (normalizedStatus === 'leave') {
      // Open Attendance Correction Modal
      setSelectedAttendance(attendanceItem)
      
      // Format date for the form
      const attendanceDate = attendanceItem.date 
        ? new Date(attendanceItem.date).toISOString().split('T')[0]
        : ''
      
      setCorrectionForm({
        attendanceId: attendanceItem._id, // Store attendance ID
        date: attendanceDate, // Set date from selected attendance
        leaveType: 'CL',
        leaveDuration: 'Full',
        reason: '',
        balanceAction: 'deduct', // Always deduct
        deductBalance: true, // Always deduct/minus balance
      })
      // Fetch leave balance when opening correction modal
      fetchLeaveBalance()
      setShowCorrectionModal(true)
      return
    }
    
    // Get the most recent session for editing
    const session = attendanceItem.sessions?.[attendanceItem.sessions.length - 1]

    const attendanceDate = new Date(attendanceItem.date)
    const attendanceYear = attendanceDate.getFullYear()
    const attendanceMonth = String(attendanceDate.getMonth() + 1).padStart(2, '0')
    const attendanceDay = String(attendanceDate.getDate()).padStart(2, '0')

    // Format punch times for the form - use attendance date as base
    const formatForForm = (isoString) => {
      // Always use attendance date, but get time from punch if available
      if (isoString) {
        const punchDate = new Date(isoString)
        const hours = String(punchDate.getHours()).padStart(2, '0')
        const minutes = String(punchDate.getMinutes()).padStart(2, '0')
        return `${attendanceYear}-${attendanceMonth}-${attendanceDay}T${hours}:${minutes}`
      } else {
        // If no punch time, use attendance date with default time 00:00
        return `${attendanceYear}-${attendanceMonth}-${attendanceDay}T00:00`
      }
    }

    setSelectedAttendance(attendanceItem)
    setEditForm({
      status: attendanceItem.status || '',
      punchIn: formatForForm(session?.punch_in),
      punchOut: formatForForm(session?.punch_out),
      message: '',
    })
    setShowEditModal(true)
  }

  const handleViewAttendanceLog = (attendanceItem) => {
    setSelectedLogAttendance(attendanceItem)
    setShowLogModal(true)
  }

  const handleViewAttendance = async (attendanceItem) => {
    setSelectedViewAttendance(attendanceItem)
    setShowViewModal(true)

    // Fetch images for this attendance record
    await fetchImagesForAttendance(attendanceItem)
  }

  // Modal handlers
  const handleCloseModal = (preserveAttendance = false) => {
    setShowEditModal(false)
    // Only clear selectedAttendance if we're not preserving it (e.g., switching to correction modal)
    if (!preserveAttendance) {
      setSelectedAttendance(null)
    }
    setEditForm({
      status: '',
      punchIn: '',
      punchOut: '',
      message: '',
    })
    setSubmitError('')
  }

  const handleCloseLogModal = () => {
    setShowLogModal(false)
    setSelectedLogAttendance(null)
  }

  const handleCloseViewModal = () => {
    setShowViewModal(false)
    setSelectedViewAttendance(null)
  }

  const handleCloseCorrectionModal = () => {
    setShowCorrectionModal(false)
    setSelectedAttendance(null)
    setCorrectionForm({
      attendanceId: '',
      date: '',
      leaveType: 'CL',
      leaveDuration: 'Full',
      reason: '',
      balanceAction: 'deduct', // Always deduct
      deductBalance: true, // Always deduct/minus balance
    })
    setCorrectionError('')
  }

  const handleCorrectionFormChange = (field, value) => {
    setCorrectionForm((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      }
      
      // Auto-update deductBalance based on balanceAction
      // Credit (deduct) = true (minus), Debit (add) = false (plus)
      if (field === 'balanceAction') {
        updated.deductBalance = value === 'deduct' // Credit = deduct (true), Debit = add (false)
      }
      
      return updated
    })
  }

  const handleAttendanceCorrectionSubmit = async () => {
    try {
      setIsSubmittingCorrection(true)
      setCorrectionError('')

      // Validation
      if (!correctionForm.date) {
        setCorrectionError('Date is mandatory')
        setIsSubmittingCorrection(false)
        return
      }

      if (!correctionForm.reason || !correctionForm.reason.trim()) {
        setCorrectionError('Reason is mandatory')
        setIsSubmittingCorrection(false)
        return
      }

      // Get attendance ID from form (more reliable than selectedAttendance)
      const attendanceId = correctionForm.attendanceId || selectedAttendance?._id

      if (!attendanceId) {
        setCorrectionError('No attendance record selected')
        setIsSubmittingCorrection(false)
        return
      }

      // Use date from form
      const dateString = correctionForm.date // Already in YYYY-MM-DD format

      // Get admin/user info for approvedBy
      const approvedBy = {
        id: admin?._id || admin?.id || null,
        name: admin?.name || 'System',
        role: getUserRoleName() || 'Admin',
      }

      // Prepare payload for convert-to-leave API
      const payload = {
        leaveType: correctionForm.leaveType, // CL, UL, or Emergency
        start_date: dateString,
        end_date: dateString, // Same as start_date (full day)
        reason: correctionForm.reason.trim(),
        deductBalance: true, // Always deduct balance
        balanceAction: 'deduct', // Always deduct
        approvedBy: approvedBy, // Include id, name, and role
      }

      // Call the convert-to-leave API
      try {
        const response = await new BasicProvider(
          `attendances/${attendanceId}/convert-to-leave`,
          dispatch,
        ).postRequest(payload)

        // Refresh attendance data
        await fetchAttendanceData()

        // Close modal and show success
        handleCloseCorrectionModal()
        toast.success('Attendance converted to leave successfully!')
      } catch (apiError) {
        console.error('Error converting attendance to leave:', apiError)
        setCorrectionError(
          apiError?.message || 
          apiError?.response?.data?.message || 
          'Failed to convert attendance to leave. Please try again.'
        )
        setIsSubmittingCorrection(false)
      }
    } catch (error) {
      console.error('Error in attendance correction:', error)
      setCorrectionError(error?.message || 'An error occurred. Please try again.')
      setIsSubmittingCorrection(false)
    }
  }

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
            const res = await new BasicProvider(
              `cms/files/show-file-with-signed-url/${imageId}`,
              dispatch,
            ).getRequest()

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
    } catch (error) {
      console.error('Error fetching images for attendance:', error)
    }
  }

  // Lightbox functions
  const openLightbox = (src) => setLightbox({ visible: true, src })
  const closeLightbox = () => setLightbox({ visible: false, src: '' })

  const handleEditFormChange = (field, value) => {
    // If status is changed to "Leave", open correction modal instead
    if (field === 'status' && value === 'Leave') {
      // Get current selectedAttendance - it should be set from handleEditAttendance
      const currentAttendance = selectedAttendance
      
      if (!currentAttendance) {
        console.error('selectedAttendance is null when trying to open correction modal')
        toast.error('Please select an attendance record first')
        return
      }
      
      // IMPORTANT: Set selectedAttendance FIRST before closing edit modal
      // This ensures it's available when correction modal opens
      setSelectedAttendance(currentAttendance)
      
      // Format date for the form
      const attendanceDate = currentAttendance.date 
        ? new Date(currentAttendance.date).toISOString().split('T')[0]
        : ''
      
      // Set correction form with default values
      setCorrectionForm({
        attendanceId: currentAttendance._id, // Store attendance ID
        date: attendanceDate, // Set date from selected attendance
        leaveType: 'CL',
        leaveDuration: 'Full',
        reason: '',
        balanceAction: 'deduct', // Always deduct
        deductBalance: true, // Always deduct/minus balance
      })
      
      // Fetch leave balance when opening correction modal
      fetchLeaveBalance()
      
      // Close edit modal WITHOUT clearing selectedAttendance (preserveAttendance = true)
      // But we already set it above, so this is just for safety
      setShowEditModal(false)
      
      // Open correction modal - selectedAttendance is already set
      setShowCorrectionModal(true)
      
      return
    }
    
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  const handleAttendanceUpdate = async () => {
    try {
      setIsSubmitting(true)
      setSubmitError('')

      // Check if the attendance date is a holiday and if status is being changed
      if (selectedAttendance?.date) {
        const attendanceDateString = selectedAttendance.date.split('T')[0] // YYYY-MM-DD format
        const dateIsHoliday = isHoliday(selectedAttendance.date)
        
        // Get old status for comparison
        const oldStatus = selectedAttendance?.status || ''
        const newStatus = editForm.status || ''
        
        // Only prevent update if it's a holiday AND status is being changed
        if (dateIsHoliday && oldStatus !== newStatus) {
          setSubmitError('Today is a holiday. You cannot update attendance status on holidays.')
          setIsSubmitting(false)
          return
        }
        // If it's a holiday but status is not changing (only time update), allow it
      }

      if (!editForm.status) {
        setSubmitError('Status is required.')
        setIsSubmitting(false)
        return
      }

      // Validate punch in/out time based on status
      // Present and Weekly Off Present require minimum 6 hours (360 minutes)
      // Half Day and Weekly Off Half Day require less than 6 hours
      if (editForm.punchIn && editForm.punchOut) {
        const punchInTime = new Date(editForm.punchIn).getTime()
        const punchOutTime = new Date(editForm.punchOut).getTime()
        const timeDifferenceMs = punchOutTime - punchInTime
        const timeDifferenceMinutes = Math.floor(timeDifferenceMs / (1000 * 60))
        const timeDifferenceHours = timeDifferenceMinutes / 60

        const status = editForm.status.toLowerCase()
        const isPresent = status === 'present' || status === 'weeklypresent'
        const isHalfDay = status === 'halfday' || status === 'weeklyhalfday'

        // Check for Present/Weekly Off Present: must be >= 6 hours
        if (isPresent && timeDifferenceHours < 6) {
          setSubmitError('Present or Weekly Off Present requires minimum 6 hours of work time. Current time: ' + 
            Math.floor(timeDifferenceHours) + 'h ' + (timeDifferenceMinutes % 60) + 'm')
          setIsSubmitting(false)
          return
        }

        // Check for Half Day/Weekly Off Half Day: must be < 6 hours
        if (isHalfDay && timeDifferenceHours >= 6) {
          setSubmitError('Half Day or Weekly Off Half Day requires less than 6 hours of work time. Current time: ' + 
            Math.floor(timeDifferenceHours) + 'h ' + (timeDifferenceMinutes % 60) + 'm')
          setIsSubmitting(false)
          return
        }
      } else if (editForm.punchIn || editForm.punchOut) {
        // If only one time is provided, show error
        const status = editForm.status.toLowerCase()
        const isPresent = status === 'present' || status === 'weeklypresent'
        const isHalfDay = status === 'halfday' || status === 'weeklyhalfday'

        if (isPresent || isHalfDay) {
          setSubmitError('Both Punch In and Punch Out times are required for ' + editForm.status)
          setIsSubmitting(false)
          return
        }
      }

      // Get old values for proper logging
      const oldPunchIn = selectedAttendance?.sessions?.[0]?.punch_in
      const oldPunchOut = selectedAttendance?.sessions?.[0]?.punch_out
      const oldStatus = selectedAttendance?.status

      const updateData = {
        status: editForm.status,
        message: editForm.message || '',
        punch_in: editForm.punchIn ? new Date(editForm.punchIn).toISOString() : null,
        punch_out: editForm.punchOut ? new Date(editForm.punchOut).toISOString() : null,
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

      // Create log entry for this edit
      const logEntry = {
        id: Date.now(),
        type: 'edit',
        changedBy: admin.name || 'HR/Admin',
        changedByRole: isHR ? 'HR' : isADMIN ? 'Admin' : 'Staff',
        timestamp: new Date().toISOString(),
        changes: {
          status: { from: oldStatus, to: editForm.status },
          punchIn: { from: oldPunchIn, to: editForm.punchIn },
          punchOut: { from: oldPunchOut, to: editForm.punchOut },
        },
        reason: editForm.message || 'No reason provided',
      }

      // Replace with backend response and add log entry
      const updatedData = attendanceData.map((item) => {
        if (item._id === selectedAttendance._id) {
          const existingLogs = item.logs || []
          return {
            ...item,
            ...response.data,
            hasEdits: true,
            logs: [...existingLogs, logEntry],
          }
        }
        return item
      })
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

  // Helper function to check if a date is a holiday
  const isHoliday = (date) => {
    if (!date || !templateHolidays || templateHolidays.length === 0) return false
    const dateStr = date.split('T')[0] // Get YYYY-MM-DD format
    // Only check against holidays array from backend - no automatic Sunday check
    return templateHolidays.some((holiday) => {
      const holidayDate = holiday.date ? holiday.date.split('T')[0] : null
      return holidayDate === dateStr
    })
  }

  // Official Leave = company-paid like calendar Holiday → same label in sheet
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

  // Helper function to get display status (Holiday & Official Leave both show as Holiday — paid day)
  const getDisplayStatus = (item) => {
    if (isOfficialLeaveStatus(item.status)) {
      return 'Holiday'
    }
    if (isHoliday(item.date)) {
      return 'Holiday'
    }
    return item.status
  }

  // Helper function to get CoreUI color for status badge
  const getStatusBadgeColor = (status) => {
    if (!status) return 'secondary'
    const statusStr = String(status).toLowerCase()
    
    // Map status to CoreUI color names
    if (statusStr.includes('holiday')) return 'secondary'
    if (statusStr.includes('present')) return 'success'
    if (statusStr.includes('absent')) return 'danger'
    if (statusStr.includes('leave')) return 'primary'
    if (statusStr.includes('half')) return 'warning'
    if (statusStr.includes('weekly')) return 'info'
    if (statusStr.includes('official')) return 'secondary'
    
    return 'secondary' // default
  }

  const normalizeStatus = (s, date, totalMinutes = 0) => {
    // ...existing code...
    if (!s) return 'absent'

    const raw = String(s).trim()
    const key = raw.toLowerCase().replace(/[\s\-_]/g, '')

    // explicit weekly-off variants first (API sometimes returns WeeklyOff / Weekend / WeeklyPresent)
    // Check for weekly off related statuses (including WeeklyPresent, WeeklyHalfDay)
    if (key.includes('weeklyoff') || key === 'weekend' || key.includes('weeklypresent') || key.includes('weeklyhalfday')) {
      // explicit present/half qualifiers in status string
      if (key.includes('present')) return 'weekly_off_present'
      if (key.includes('half')) return 'weekly_off_half'
      // fallback to using minutes or day
      if (totalMinutes >= 360) return 'weekly_off_present'
      if (totalMinutes > 0 && totalMinutes < 360) return 'weekly_off_half'
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
    
    // Check for half day AFTER checking weekly off half day (already checked above)
    if (key.includes('halfday') || key.includes('half')) return 'half_day'
    
    // Check for present AFTER checking weekly off present (already checked above)
    if (key.includes('present')) return 'present'
    
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

    // final fallback: convert readable key to snake_case-like key
    return raw.toLowerCase().replace(/\s+/g, '_')
  }

  const getAttendanceTotals = (data = []) => {
    // Get total days in the current month
    const daysInMonth = new Date(filters.year, filters.month, 0).getDate()

    const totals = {
      days: daysInMonth, // Total days in month
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
      not_marked: 0,
    }

    // Debug logging

    // Count actual attendance records
    data.forEach((item, index) => {
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

    // Calculate not_marked days (total days - days with attendance records)
    const daysWithRecords = data.length
    totals.not_marked = daysInMonth - daysWithRecords

    // Absent tile: raw absent + DD (Present→DD adds to DD and to this; DD→Present reverses both)
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
    
    let performanceRating = 'Very Poor'
    let performanceColor = 'danger'
    
    if (avgMinutesPerDay >= 571) {
      performanceRating = 'Excellence'
      performanceColor = 'success'
    } else if (avgMinutesPerDay >= 541) {
      performanceRating = 'Very Good'
      performanceColor = 'info'
    } else if (avgMinutesPerDay >= 511) {
      performanceRating = 'Good'
      performanceColor = 'warning'
    } else if (avgMinutesPerDay >= 451) {
      performanceRating = 'Poor'
      performanceColor = 'danger'
    } else {
      performanceRating = 'Very Poor'
      performanceColor = 'danger'
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
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <CSpinner size="lg" />
      </div>
    )
  }

  return (
    <>
      <CCard style={{ marginBottom: '20px', padding: '10px 0px', borderRadius: '0px' }}>
        <h5 style={{ marginLeft: '20px' }}>
          | Attendance Records {employeeData && `- ${employeeData?.user.name} `}
        </h5>
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
                  {/* here i want to add status filter like present absent halfday weekoff as like  */}
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
          <div>
            {filteredData.length === 0 ? (
              <div className="text-center p-4">
                <p className="text-muted">No attendance records found for the selected period.</p>
                <small className="text-muted">
                  ID: {id} | Month: {filters.month} | Year: {filters.year}
                </small>
              </div>
            ) : (
              <AttendanceTable
                attendanceData={filteredData}
                onEdit={handleEditAttendance}
                onViewLog={handleViewAttendanceLog}
                onView={handleViewAttendance}
                holidays={templateHolidays}
              />
            )}
          </div>
        ) : (
          <>
            <CCardBody>
              <AttendanceCalendar
                attendanceData={filteredData}
                currentMonth={filters.month}
                currentYear={filters.year}
                templateHolidays={templateHolidays}
                showAuditFeatures={isADMIN}
                staffDisplayName={
                  employeeData?.user?.name ||
                  employeeData?.name ||
                  employeeData?.profile?.name ||
                  ''
                }
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
                  background: 'linear-gradient(135deg, #1ABC9C 0%, #16A085 100%)',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(26, 188, 156, 0.2)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  borderRadius: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(26, 188, 156, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(26, 188, 156, 0.2)'
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
                        <div className="small mb-1" style={{ opacity: 0.9, color: 'white' }}>Weekly Off Present</div>
                        <h4 className="mb-0 fw-bold" style={{ color: 'white' }}>{totals.weekly_off_present}</h4>
                      </div>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>
              <CCol sm={6} md={3}>
                <CCard className="border-0 overflow-hidden" style={{ 
                  background: 'linear-gradient(135deg, #D35400 0%, #E67E22 100%)',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(211, 84, 0, 0.2)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  borderRadius: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(211, 84, 0, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(211, 84, 0, 0.2)'
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
          <CModalTitle>Edit Attendance</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedAttendance && (
            <CForm>
              <CRow className="mb-3">
                <CCol>
                  <CFormLabel>Status</CFormLabel>
                  {(() => {
                    const dateIsHoliday = selectedAttendance?.date ? isHoliday(selectedAttendance.date) : false
                    return (
                      <>
                        <AppFormSelect
                          value={editForm.status}
                          onChange={(e) => handleEditFormChange('status', e.target.value)}
                          disabled={dateIsHoliday}
                          style={dateIsHoliday ? { backgroundColor: '#f8f9fa', cursor: 'not-allowed' } : {}}
                        >
                    <option value="">Select status</option>
                    {(() => {
                      // Check if current status is weekly off related
                      const isWeeklyOff = selectedAttendance && isWeeklyOffStatus(
                        selectedAttendance.status,
                        selectedAttendance.date,
                        selectedAttendance.total_duration_minutes || 0
                      )

                      // Debug: Log status check (remove in production)
                      if (selectedAttendance) {
                        console.log('Selected Attendance Status:', selectedAttendance.status)
                        console.log('Normalized Status:', normalizeStatus(
                          selectedAttendance.status,
                          selectedAttendance.date,
                          selectedAttendance.total_duration_minutes || 0
                        ))
                        console.log('Is Weekly Off:', isWeeklyOff)
                      }

                      // If weekly off day, show ONLY weekly off related options
                      if (isWeeklyOff) {
                        return (
                          <>
                            <option value="WeeklyOff">Weekly Off</option>
                            <option value="WeeklyPresent">Weekly Off Present</option>
                            <option value="WeeklyHalfDay">Weekly Off Half Day</option>
                          </>
                        )
                      }

                      // For normal days (non-weekly off), show regular options
                      // Weekly Off options are NOT shown for normal days
                      return (
                        <>
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Leave">Leave</option>
                    <option value="HalfDay">Half Day</option>
                    <option value="DoubleDeduction">Double Deduction</option>
                    <option value="OfficialLeave">Official Leave</option>
                          {/* Weekly Off options are intentionally excluded for normal days */}
                        </>
                      )
                    })()}
                  </AppFormSelect>
                  {dateIsHoliday && (
                    <small className="text-danger d-block mt-1">
                      Today is a holiday. You cannot change attendance status on holidays. Time updates are allowed.
                    </small>
                  )}
                      </>
                    )
                  })()}
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol>
                  <CFormLabel>Punch In</CFormLabel>
                  <CFormInput
                    type="datetime-local"
                    value={editForm.punchIn}
                    onChange={(e) => handleEditFormChange('punchIn', e.target.value)}
                  />
                </CCol>
                <CCol>
                  <CFormLabel>Punch Out</CFormLabel>
                  <CFormInput
                    type="datetime-local"
                    value={editForm.punchOut}
                    onChange={(e) => handleEditFormChange('punchOut', e.target.value)}
                  />
                </CCol>
              </CRow>

              <CRow>
                <CCol>
                  <CFormLabel>Message</CFormLabel>
                  <CFormTextarea
                    value={editForm.message}
                    onChange={(e) => handleEditFormChange('message', e.target.value)}
                    placeholder="Enter reason"
                    rows={3}
                  />
                </CCol>
              </CRow>

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
          <CButton color="success" onClick={handleAttendanceUpdate} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Attendance Log Modal */}
      <CModal visible={showLogModal} onClose={handleCloseLogModal} size="lg" backdrop="static">
        <CModalHeader>
          <CModalTitle>Attendance Log History</CModalTitle>
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
                    {selectedViewAttendance?.user?.name || employeeData?.user?.name || 'Unknown'}
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
                  {selectedViewAttendance.user?.name || employeeData?.user?.name || 'Unknown'}{' '}
                  <br />
                  <strong>Email:</strong>{' '}
                  {selectedViewAttendance.user?.email || employeeData?.user?.email || 'N/A'} <br />
                  <strong>Date:</strong>{' '}
                  {formatDate(selectedViewAttendance.date)} <br />
                  <strong>Status:</strong>{' '}
                  <CBadge color={getStatusBadgeColor(getDisplayStatus(selectedViewAttendance))}>
                    {getDisplayStatus(selectedViewAttendance)}
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
                        <CTableHeaderCell>Draft Done</CTableHeaderCell>
                        <CTableHeaderCell>Remark</CTableHeaderCell>
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
                            {session.today_draft_done !== null && session.today_draft_done !== undefined 
                              ? <CBadge color="success">{session.today_draft_done}</CBadge>
                              : '-'}
                          </CTableDataCell>
                          <CTableDataCell>
                            {session.today_done_remark || '-'}
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
                              {log.oldPunchIn ? moment(log.oldPunchIn).format('DD-MM-YYYY hh:mm A') : '-'}
                            </CTableDataCell>
                            <CTableDataCell>
                              {log.newPunchIn ? moment(log.newPunchIn).format('DD-MM-YYYY hh:mm A') : '-'}
                            </CTableDataCell>
                            <CTableDataCell>
                              {log.oldPunchOut ? moment(log.oldPunchOut).format('DD-MM-YYYY hh:mm A') : '-'}
                            </CTableDataCell>
                            <CTableDataCell>
                              {log.newPunchOut ? moment(log.newPunchOut).format('DD-MM-YYYY hh:mm A') : '-'}
                            </CTableDataCell>
                            <CTableDataCell>
                              {log.timestamp ? moment(log.timestamp).format('DD-MM-YYYY hh:mm A') : '-'}
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

      {/* Attendance Correction Modal */}
      <CModal visible={showCorrectionModal} onClose={handleCloseCorrectionModal} size="lg" backdrop="static">
        <CModalHeader>
          <CModalTitle>Convert Absent to Leave</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            {/* Approved By - Auto */}
            <CRow className="mb-3">
              <CCol>
                <CFormLabel>Approved By</CFormLabel>
                <CFormInput
                  type="text"
                  value={getApprovedByName()}
                  disabled
                  readOnly
                  className="bg-light"
                />
                <small className="text-muted">Auto-filled from system</small>
              </CCol>
            </CRow>

            {/* Date - Read-only */}
            <CRow className="mb-3">
              <CCol>
                <CFormLabel>Date</CFormLabel>
                <CFormInput
                  type="date"
                  value={correctionForm.date}
                  disabled
                  readOnly
                  className="bg-light"
                />
                <small className="text-muted">Selected attendance date (read-only)</small>
              </CCol>
            </CRow>

            {/* Leave Type - CL / UL / Emergency */}
            <CRow className="mb-3">
              <CCol>
                <CFormLabel>
                  Leave Type <span className="text-danger">*</span>
                </CFormLabel>
                <AppFormSelect
                  value={correctionForm.leaveType}
                  onChange={(e) => handleCorrectionFormChange('leaveType', e.target.value)}
                >
                  <option value="CL">CL - Casual Leave</option>
                  <option value="UL">UL - Unpaid Leave</option>
                  <option value="Emergency">Emergency</option>
                </AppFormSelect>
                {/* Show available balance count */}
                {correctionForm.leaveType === 'CL' && (
                  <small className="text-info d-block mt-1">
                    Available CL Balance: <strong>{loadingBalance ? 'Loading...' : leaveBalance.clBalance}</strong>
                  </small>
                )}
                {correctionForm.leaveType === 'UL' && (
                  <small className="text-info d-block mt-1">
                    Available UL Balance: <strong>{loadingBalance ? 'Loading...' : leaveBalance.ulBalance}</strong>
                  </small>
                )}
              </CCol>
            </CRow>
 

            {/* Balance Action - Always Deduct (Disabled) */}
            <CRow className="mb-3">
              <CCol>
                <CFormLabel>Balance Action</CFormLabel>
                <AppFormSelect
                  value={correctionForm.balanceAction}
                  disabled
                  readOnly
                  className="bg-light"
                >
                  <option value="deduct">Credit(+) - Deduct Balance (Always)</option>
                </AppFormSelect>
                <small className="text-muted">
                  Leave balance will always be deducted (minus)
                </small>
              </CCol>
            </CRow>

          
            {/* Reason - Mandatory */}
            <CRow className="mb-3">
              <CCol>
                <CFormLabel>
                  Reason <span className="text-danger">*</span>
                </CFormLabel>
                <CFormTextarea
                  value={correctionForm.reason}
                  onChange={(e) => handleCorrectionFormChange('reason', e.target.value)}
                  placeholder="Enter reason for converting absent to leave"
                  rows={4}
                  required
                />
                <small className="text-muted">This field is mandatory</small>
              </CCol>
            </CRow>

            {/* Error Display */}
            {correctionError && (
              <CAlert color="danger" className="mb-3">
                {correctionError}
              </CAlert>
            )}
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={handleCloseCorrectionModal} disabled={isSubmittingCorrection}>
            Cancel
          </CButton>
          <CButton color="success" onClick={handleAttendanceCorrectionSubmit} disabled={isSubmittingCorrection}>
            {isSubmittingCorrection ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Processing...
              </>
            ) : (
              'Submit'
            )}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default Attendance
