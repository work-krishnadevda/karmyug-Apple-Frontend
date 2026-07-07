import React, { useEffect, useState, useRef, useMemo } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CBadge,
  CFormInput,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CSpinner,
  CRow,
  CCol,
  CFormLabel,
  CInputGroup,
} from '@coreui/react'
import AppTableSkeleton from 'src/components/custom/table/AppTableSkeleton'

import AppFormSelect from 'src/components/form/AppFormSelect'
import { toast } from 'react-toastify'
import BasicProvider from 'src/constants/BasicProvider'
import { cilSearch } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
const statusColors = {
  Present: { color: 'success' },
  Absent: { color: 'danger' },
  Leave: { color: 'primary' },
  HalfDay: { color: 'warning' },
  // DoubleDeduction: { color: 'dark' },
  OfficialLeave: { color: 'secondary' },
  WeeklyOff: { color: 'info' },
  WeeklyPresent: { color: 'success' },
  WeeklyHalfDay: { color: 'warning' },
  NotMarked: { color: 'secondary' },
  Holiday: { color: 'info' },
  // IdleTimeout: { color: 'danger' },
}

const AdminUnapprovedAttendance = () => {
  const [attendances, setAttendances] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDetails, setShowDetails] = useState(false)
  const [selectedAttendance, setSelectedAttendance] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [locations, setLocations] = useState([])

  const [sortField, setSortField] = useState(null)
  const [sortDirection, setSortDirection] = useState('asc')

  // Filters
  const [locationFilter, setLocationFilter] = useState('')
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  const [dateFilter, setDateFilter] = useState(today)
  const [monthFilter, setMonthFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [imageMap, setImageMap] = useState({}) // store fileId -> URL
  const [lightbox, setLightbox] = useState({ visible: false, src: '' }) // for full-size image
  const dateInputRef = useRef(null)

  // Multi-select
  const [selectedIds, setSelectedIds] = useState([])

  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    attendanceId: null,
    multiple: false, // true if approving selected multiple
  })
  // New state for edit modal
  const [editModal, setEditModal] = useState({
    visible: false,
    attendance: null,
    sessionIndex: null,
    form: { status: '', punch_in: '', punch_out: '', message: '' },
  })
  const [refreshTrigger, setRefreshTrigger] = useState(0) // Add refresh trigger

  // Today Leaves states
  const [showTodayLeavesView, setShowTodayLeavesView] = useState(false) // Toggle between attendance and today leaves view
  const [todayLeaves, setTodayLeaves] = useState([])
  const [loadingTodayLeaves, setLoadingTodayLeaves] = useState(false)
  const [selectedLeave, setSelectedLeave] = useState(null)
  const [showLeaveDetails, setShowLeaveDetails] = useState(false)
  const [leaveAttachmentUrls, setLeaveAttachmentUrls] = useState({})
  const [leaveSearchTerm, setLeaveSearchTerm] = useState('')
  const [leaveStatusFilter, setLeaveStatusFilter] = useState('')
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('')

  useEffect(() => {
    fetchUnapprovedAttendances()
  }, [dateFilter, monthFilter, yearFilter, locationFilter])

  useEffect(() => {
    fetchLocations()
  }, [])

  const openCalendar = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker()
    }
  }
  const fetchUnapprovedAttendances = async () => {
    setLoading(true)
    try {
      // const queryParams = [`page=${page}`, `count=${limit}`]
      const queryParams = []

      if (dateFilter) {
        queryParams.push(`date=${dateFilter}`)
      } else if (monthFilter && yearFilter) {
        queryParams.push(`month=${monthFilter}`, `year=${yearFilter}`)
      }

      if (locationFilter) {
        queryParams.push(`location=${locationFilter}`)
      }

      setSelectedIds([])
      const queryString = queryParams.join('&')
      const response = await new BasicProvider(
        `attendances/admin/unapproved?${queryString}`,
      ).getRequest()

      if (response.status === 'success') {
        //  EXCLUDE specific statuses
        const excludedStatuses = ['Absent', 'NotMarked', 'Leave', 'OfficialLeave', 'WeeklyOff']

        //  Filter data before displaying in table
        const filteredData = (response.data || []).filter(
          (att) =>
            !excludedStatuses.includes(att.status) &&
            att.user?.name &&
            att.user?._id,
        )

        //  Update state with filtered data only
        setAttendances(filteredData)

        //  Fetch only required images for filtered records
        const allFileIds = []
        filteredData.forEach((att) => {
          att.sessions?.forEach((session) => {
            if (session.punch_in_image) allFileIds.push(session.punch_in_image)
            if (session.punch_out_image) allFileIds.push(session.punch_out_image)
          })
        })
        if (allFileIds.length > 0) fetchImages(allFileIds)
      }
    } catch (err) {}
    setLoading(false)
  }

  const fetchLocations = async () => {
    try {
      const response = await new BasicProvider('ra_branch?count=100').getRequest()
      if (response?.data?.data && Array.isArray(response.data.data)) {
        const locationOptions = response.data.data.map((location) => ({
          value: location?._id || '',
          label: location?.name || '',
          id: location?._id || '',
          name: location?.name || '',
        }))
        setLocations([{ value: '', label: 'All Locations', id: '', name: '' }, ...locationOptions])
      } else {
        throw new Error('Invalid response structure')
      }
    } catch (error) {
      console.error('Error fetching locations:', error)
      setLocations([
        { value: '', label: 'All Locations', id: '', name: '' },
        { value: 'indore', label: 'Indore', id: 'indore', name: 'Indore' },
        { value: 'ratlam', label: 'Ratlam', id: 'ratlam', name: 'Ratlam' },
        { value: 'dhar', label: 'Dhar', id: 'dhar', name: 'Dhar' },
        { value: 'mandsour', label: 'Mandsour', id: 'mandsour', name: 'Mandsour' },
        { value: 'bhopal', label: 'Bhopal', id: 'bhopal', name: 'Bhopal' },
        { value: 'neemach', label: 'Neemach', id: 'neemach', name: 'Neemach' },
      ])
    }
  }

  // Fetch today's leaves
  const fetchTodayLeaves = async () => {
    setLoadingTodayLeaves(true)
    try {
      const todayDate = new Date().toISOString().split('T')[0] // YYYY-MM-DD
      const response = await new BasicProvider(`leaves?from=${todayDate}&to=${todayDate}&count=10000`).getRequest()
      
      // Filter leaves where today's date falls between start_date and end_date
      const today = new Date(todayDate)
      today.setHours(0, 0, 0, 0)
      
      const filteredLeaves = (response.data || []).filter((leave) => {
        if (!leave.start_date || !leave.end_date) return false
        const startDate = new Date(leave.start_date)
        const endDate = new Date(leave.end_date)
        startDate.setHours(0, 0, 0, 0)
        endDate.setHours(0, 0, 0, 0)
        
        // Check if today falls within the leave date range
        return today >= startDate && today <= endDate && (leave.status === 'Approved' || leave.status === 'Pending')
      })
      
      setTodayLeaves(filteredLeaves)
    } catch (error) {
      console.error('Error fetching today leaves:', error)
      toast.error('Failed to fetch today leaves')
      setTodayLeaves([])
    } finally {
      setLoadingTodayLeaves(false)
    }
  }

  // Toggle today leaves view
  const handleTodayLeaves = () => {
    if (!showTodayLeavesView) {
      // Switching to today leaves view
      setShowTodayLeavesView(true)
      fetchTodayLeaves()
    } else {
      // Switching back to attendance view
      setShowTodayLeavesView(false)
    }
  }

  // Fetch attachment signed URLs for leave
  const fetchLeaveAttachmentUrl = async (fileId) => {
    try {
      const response = await new BasicProvider(
        `cms/files/show-file-with-signed-url/${fileId}`,
      ).getRequest()
      return response.data || null
    } catch (error) {
      console.error('Error fetching signed URL:', error)
      return null
    }
  }

  // Load attachment URLs for leave
  const loadLeaveAttachmentUrls = async (attachments) => {
    if (!attachments || attachments.length === 0) return

    const urls = {}
    for (const fileId of attachments) {
      const id = typeof fileId === 'string' ? fileId : fileId._id || ''
      if (id && !urls[id]) {
        const data = await fetchLeaveAttachmentUrl(id)
        if (data) {
          urls[id] = {
            url: data.url || data,
            filename: data.filename || data.originalName || `Attachment-${id}`,
          }
        }
      }
    }
    setLeaveAttachmentUrls(urls)
  }

  // Open leave details
  const openLeaveDetails = (leave) => {
    setSelectedLeave(leave)
    setShowLeaveDetails(true)
    if (leave.attachments && leave.attachments.length > 0) {
      loadLeaveAttachmentUrls(leave.attachments)
    }
  }

  const fetchImages = async (fileIds) => {
    const uniqueIds = [...new Set(fileIds)]
    const map = {}

    await Promise.all(
      uniqueIds.map(async (id) => {
        try {
          const res = await new BasicProvider(
            `cms/files/show-file-with-signed-url/${id}`,
          ).getRequest()
          if (res.status === 'success' && res.data) {
            map[id] = res.data
          }
        } catch (err) {
          map[id] = null
        }
      }),
    )
    setImageMap(map)
  }

  // ेApprove a single attendance
  const approveAttendance = async (id) => {
    try {
      const response = await new BasicProvider(`attendances/admin/${id}/approve`).patchRequest()
      if (response.status === 'success') {
        toast.success('Attendance approved successfully')
        fetchUnapprovedAttendances()
        setSelectedIds((prev) => prev.filter((i) => i !== id))
      }
    } catch (err) {
      toast.error(err?.message || 'Error approving attendance')
    }
  }

  //  Approve multiple selected attendances
  const approveSelected = async () => {
    if (selectedIds.length === 0) {
      toast.info('Please select at least one attendance')
      return
    }

    try {
      const response = await new BasicProvider(`attendances/admin/approve-multiple`).patchRequest({
        attendanceIds: selectedIds,
      }) // make sure your BasicProvider can handle raw request

      if (response.status === 'success') {
        toast.success('Selected attendances approved successfully')
        setSelectedIds([]) // reset selection
        fetchUnapprovedAttendances()
      } else {
        toast.error(response.message || 'Error approving selected attendances')
      }
    } catch (err) {
      toast.error(err?.message || 'Error approving selected attendances')
    }
  }

  const openDetails = (attendance) => {
    setSelectedAttendance(attendance)
    setShowDetails(true)
  }

  const formatTime = (isoString) => {
    if (!isoString) return '-'
    const date = new Date(isoString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const resetFilters = () => {
    setDateFilter(today) // reset to today instead of empty
    setMonthFilter('')
    setYearFilter('')
    fetchUnapprovedAttendances()
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedAttendances = React.useMemo(() => {
    if (!sortField) return attendances

    return [...attendances].sort((a, b) => {
      let aTime, bTime

      if (sortField === 'punchIn') {
        aTime = a.sessions?.[0]?.punch_in
        bTime = b.sessions?.[0]?.punch_in
      }

      if (sortField === 'punchOut') {
        aTime = a.sessions?.[a.sessions.length - 1]?.punch_out
        bTime = b.sessions?.[b.sessions.length - 1]?.punch_out
      }

      if (!aTime && !bTime) return 0
      if (!aTime) return 1
      if (!bTime) return -1

      const diff = new Date(aTime).getTime() - new Date(bTime).getTime()
      return sortDirection === 'asc' ? diff : -diff
    })
  }, [attendances, sortField, sortDirection])

  // Calculate total overtime from filtered attendances
  const totalOvertimeMinutes = useMemo(() => {
    return sortedAttendances
      .filter((att) => {
        const q = searchTerm.trim().toLowerCase()
        const raLocationText =
          typeof att.profile?.ra_location === 'string'
            ? att.profile?.ra_location
            : att.profile?.ra_location?.label || ''
        const matchesSearch = q
          ? (
              (att.user?.name || '') +
              ' ' +
              (att.user?.email || '') +
              ' ' +
              (att.user?.mobile || '') +
              ' ' +
              raLocationText +
              ' ' +
              (att.profile?.location || '')
            )
              .toLowerCase()
              .includes(q)
          : true
        const matchesStatus = statusFilter ? att.status === statusFilter : true
        const profileLocationValue =
          typeof att.profile?.ra_location === 'object'
            ? att.profile?.ra_location?.value || att.profile?.ra_location?.id || ''
            : att.profile?.ra_location || ''
        const matchesLocation = locationFilter
          ? String(profileLocationValue) === String(locationFilter)
          : true
        return matchesSearch && matchesStatus && matchesLocation
      })
      .reduce((total, att) => {
        const totalMinutes = att.total_duration_minutes || 0
        const backendOvertime = att.overtime_minutes || 0
        
        // Use backend overtime if available and > 0, otherwise calculate it
        const overtimeMinutes =
          backendOvertime > 0
            ? backendOvertime
            : Math.max(0, totalMinutes - 9 * 60) // 9 hours = 540 minutes
        
        return total + overtimeMinutes
      }, 0)
  }, [sortedAttendances, searchTerm, statusFilter, locationFilter])

  // Format total overtime
  const formatTotalOvertime = (minutes) => {
    if (minutes <= 0) return '0m'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const openLightbox = (src) => setLightbox({ visible: true, src })
  const closeLightbox = () => setLightbox({ visible: false, src: '' })

  const handleSelect = (id, checked) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id])
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id))
    }
  }

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(attendances.map((att) => att._id))
    } else {
      setSelectedIds([])
    }
  }
  const openConfirmModal = (id = null, multiple = false) => {
    setConfirmModal({ visible: true, attendanceId: id, multiple })
  }

  const handleConfirmApprove = () => {
    if (confirmModal.multiple) {
      approveSelected()
    } else if (confirmModal.attendanceId) {
      approveAttendance(confirmModal.attendanceId)
    }
    setConfirmModal({ visible: false, attendanceId: null, multiple: false })
  }

  // Open edit modal
  const openEditModal = (attendance, sessionIndex = null) => {
    const session =
      sessionIndex !== null && attendance.sessions?.[sessionIndex]
        ? attendance.sessions[sessionIndex]
        : attendance.sessions?.[attendance.sessions.length - 1]

    // Get the most recent log entry for accurate punch times
    const latestLog =
      attendance.logs && attendance.logs.length > 0
        ? attendance.logs[attendance.logs.length - 1]
        : null

    // Find the most recent punch times from all logs
    let mostRecentPunchIn = session?.punch_in
    let mostRecentPunchOut = session?.punch_out

    if (attendance.logs && attendance.logs.length > 0) {
      // Look through all logs to find the most recent punch times
      for (let i = attendance.logs.length - 1; i >= 0; i--) {
        const log = attendance.logs[i]
        if (log.newPunchIn && !mostRecentPunchIn) {
          mostRecentPunchIn = log.newPunchIn
        }
        if (log.newPunchOut && !mostRecentPunchOut) {
          mostRecentPunchOut = log.newPunchOut
        }
        if (log.oldPunchIn && !mostRecentPunchIn) {
          mostRecentPunchIn = log.oldPunchIn
        }
        if (log.oldPunchOut && !mostRecentPunchOut) {
          mostRecentPunchOut = log.oldPunchOut
        }
      }
    }

    const punchInTime = mostRecentPunchIn
    const punchOutTime = mostRecentPunchOut

    // Convert to local timezone for form input
    const formatForForm = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      // Convert to local timezone and format for datetime-local input
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day}T${hours}:${minutes}`
    }

    const originalValues = {
      status: attendance.status,
      punch_in: session?.punch_in,
      punch_out: session?.punch_out,
      sessionIndex,
    }

    setEditModal({
      visible: true,
      attendance: {
        ...attendance,
        originalValues,
      },
      sessionIndex,
      form: {
        status: attendance.status || '',
        punch_in: formatForForm(punchInTime),
        punch_out: formatForForm(punchOutTime),
        message: '',
      },
    })
  }

  // Handle input changes
  const handleEditChange = (field, value) => {
    setEditModal((prev) => ({
      ...prev,
      form: { ...prev.form, [field]: value },
    }))
  }

  const saveEdit = async () => {
    const { attendance, form, sessionIndex } = editModal
    if (!attendance?._id) return

    if (form.punch_in && form.punch_out && form.punch_in >= form.punch_out) {
      toast.error('Punch out must be after punch in')
      return
    }

    try {
      // Use the original values stored when opening the modal
      const originalValues = attendance.originalValues

      // Note: We'll proceed even if originalValues are not available
      // We'll use the current attendance data as fallback

      // Get old values from the original data or use current data as fallback
      const oldPunchIn = originalValues?.punch_in
        ? new Date(originalValues.punch_in)
        : attendance.sessions?.[sessionIndex]?.punch_in
        ? new Date(attendance.sessions[sessionIndex].punch_in)
        : null
      const oldPunchOut = originalValues?.punch_out
        ? new Date(originalValues.punch_out)
        : attendance.sessions?.[sessionIndex]?.punch_out
        ? new Date(attendance.sessions[sessionIndex].punch_out)
        : null
      const oldStatus = originalValues?.status || attendance.status

      // Note: We'll proceed even if old values are not available
      // The backend will handle the case where old values are null

      // Prepare new values
      const newPunchIn = form.punch_in ? new Date(form.punch_in) : oldPunchIn
      const newPunchOut = form.punch_out ? new Date(form.punch_out) : oldPunchOut
      const newStatus = form.status || oldStatus

      // Validate that we actually have different values
      const punchInChanged =
        oldPunchIn && newPunchIn && oldPunchIn.getTime() !== newPunchIn.getTime()
      const punchOutChanged =
        oldPunchOut && newPunchOut && oldPunchOut.getTime() !== newPunchOut.getTime()
      const statusChanged = oldStatus !== newStatus

      // Note: We'll proceed even if old values are not available
      // The backend will handle the case where old values are null

      if (!punchInChanged && !punchOutChanged && !statusChanged) {
        toast.warning('No changes detected. Please modify the values before saving.')
        return
      }

      // Create clean payload for the backend
      const editPayload = {
        status: newStatus,
        message: form.message,
        punch_in: newPunchIn ? newPunchIn.toISOString() : undefined,
        punch_out: newPunchOut ? newPunchOut.toISOString() : undefined,
        sessionIndex,
        // Send old values in the format backend expects (only if available)
        ...(oldPunchIn && { oldPunchIn: oldPunchIn.toISOString() }),
        ...(oldPunchOut && { oldPunchOut: oldPunchOut.toISOString() }),
        ...(oldStatus && { oldStatus: oldStatus }),
        // Also send in alternative format for compatibility
        ...(oldPunchIn && { old_punch_in: oldPunchIn.toISOString() }),
        ...(oldPunchOut && { old_punch_out: oldPunchOut.toISOString() }),
        ...(oldStatus && { old_status: oldStatus }),
      }

      const response = await new BasicProvider(`attendances/${attendance._id}/edit`).patchRequest(
        editPayload,
      )

      if (response.status === 'success') {
        // Update local state immediately for instant UI update
        setAttendances((prevAttendances) =>
          prevAttendances.map((att) =>
            att._id === attendance._id
              ? {
                  ...att,
                  ...response.data,
                  // Update the specific session with new values
                  sessions: att.sessions?.map((session, idx) =>
                    idx === sessionIndex
                      ? {
                          ...session,
                          punch_in: newPunchIn,
                          punch_out: newPunchOut,
                          // Recalculate duration if both punch in/out exist
                          duration_minutes:
                            newPunchIn && newPunchOut
                              ? Math.floor(
                                  (newPunchOut.getTime() - newPunchIn.getTime()) / (1000 * 60),
                                )
                              : session.duration_minutes,
                        }
                      : session,
                  ),
                  // Update total duration from response
                  total_duration_minutes:
                    response.data.total_duration_minutes || att.total_duration_minutes,
                  // Update status from response
                  status: response.data.status || newStatus,
                }
              : att,
          ),
        )

        const changes = []
        if (punchInChanged)
          changes.push(
            `Punch In: ${oldPunchIn?.toLocaleTimeString()} → ${newPunchIn?.toLocaleTimeString()}`,
          )
        if (punchOutChanged)
          changes.push(
            `Punch Out: ${oldPunchOut?.toLocaleTimeString()} → ${newPunchOut?.toLocaleTimeString()}`,
          )
        if (statusChanged) changes.push(`Status: ${oldStatus} → ${newStatus}`)

        toast.success(`Attendance updated successfully! ${changes.join(', ')}`)
        setEditModal({ visible: false, attendance: null, sessionIndex: null, form: {} })

        // Force refresh data from server to ensure complete consistency
        setTimeout(() => {
          fetchUnapprovedAttendances()
        }, 1000) // 1 second delay to ensure backend has processed the update

        // Also trigger immediate re-render
        setRefreshTrigger((prev) => prev + 1)
      } else {
        toast.error(response.message || 'Failed to update attendance')
      }
    } catch (err) {
      toast.error(err?.message || 'Error updating attendance')
    }
  }

  return (
    <CCard className="m-3">
      <CCardHeader className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
        <h5 className="mb-0">
          {showTodayLeavesView 
            ? `Today Leaves - ${new Date().toLocaleDateString()} (${todayLeaves.length})`
            : `Unapproved Attendances (${attendances.length})`
          }
        </h5>

        {/* Active Filters as Tags - Hide when showing Today Leaves */}
        {!showTodayLeavesView && (
          <div className="d-flex flex-wrap gap-2 align-items-center">
          {dateFilter && (
            <CBadge
              color="primary"
              className="d-flex align-items-center gap-1 px-2 py-1"
              style={{ cursor: 'pointer' }}
              onClick={() => setDateFilter('')}
            >
              Date: {new Date(dateFilter).toLocaleDateString()} ✕
            </CBadge>
          )}

          {monthFilter && yearFilter && (
            <CBadge
              color="info"
              className="d-flex align-items-center gap-1 px-2 py-1"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setMonthFilter('')
                setYearFilter('')
              }}
            >
              Month:{' '}
              {new Date(yearFilter, monthFilter - 1).toLocaleString('default', {
                month: 'long',
                year: 'numeric',
              })}{' '}
              ✕
            </CBadge>
          )}

          {/* Total Overtime Badge */}
          {totalOvertimeMinutes > 0 && (
            <CBadge
              color="success"
              className="d-flex align-items-center gap-1 px-2 py-1"
            >
              Total Overtime: {formatTotalOvertime(totalOvertimeMinutes)}
            </CBadge>
          )}
          </div>
        )}
      </CCardHeader>

      {/* Filters - Show different filters based on view */}
      <CCardBody className="filter-container mb-3">
        <CRow className="g-2">
          {showTodayLeavesView ? (
            // Today Leaves Filters
            <>
              <CCol md={4}>
                <CFormLabel>Search Employee</CFormLabel>
                <CInputGroup>
                  <CFormInput
                    placeholder="Search by name, email..."
                    value={leaveSearchTerm}
                    onChange={(e) => setLeaveSearchTerm(e.target.value)}
                  />
                  <CButton color="outline-secondary">
                    <CIcon icon={cilSearch} />
                  </CButton>
                </CInputGroup>
              </CCol>
              <CCol md={4}>
                <CFormLabel>Status Filter</CFormLabel>
                <AppFormSelect value={leaveStatusFilter} onChange={(e) => setLeaveStatusFilter(e.target.value)}>
                  <option value="">All Status</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                </AppFormSelect>
              </CCol>
              <CCol md={4}>
                <CFormLabel>Leave Type Filter</CFormLabel>
                <AppFormSelect value={leaveTypeFilter} onChange={(e) => setLeaveTypeFilter(e.target.value)}>
                  <option value="">All Types</option>
                  <option value="CL">Casual Leave (CL)</option>
                  <option value="UL">Unpaid Leave (UL)</option>
                  <option value="Emergency">Emergency Leave</option>
                  <option value="Penalty">Penalty Leave</option>
                </AppFormSelect>
              </CCol>
            </>
          ) : (
            // Attendance Filters
            <>
              <CCol md={4}>
                <CFormLabel>Search Employee</CFormLabel>
                <CInputGroup>
                  <CFormInput
                    placeholder="Search by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <CButton color="outline-secondary">
                    <CIcon icon={cilSearch} />
                  </CButton>
                </CInputGroup>
              </CCol>
              <CCol md={4}>
                <CFormLabel>Status Filter</CFormLabel>
                <AppFormSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">All Status</option>
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Leave">Leave</option>
                  <option value="HalfDay">Half Day</option>
                  <option value="OfficialLeave">Official Leave</option>
                  <option value="WeeklyOff">Weekly Off</option>
                  <option value="WeeklyPresent">Weekly Present</option>
                  <option value="WeeklyHalfDay">Weekly Half Day</option>
                  <option value="NotMarked">Not Marked</option>
                  <option value="Holiday">Holiday</option>
                </AppFormSelect>
              </CCol>
              <CCol xs={12} md={4}>
                <CFormLabel>Select Date</CFormLabel>
                <CFormInput
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  onClick={openCalendar}
                  style={{ cursor: 'pointer' }}
                  ref={dateInputRef}
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>MA Location Filter</CFormLabel>
                <AppFormSelect value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
                  {locations.map((loc) => (
                    <option key={loc.value} value={loc.value}>
                      {loc.label}
                    </option>
                  ))}
                </AppFormSelect>
              </CCol>
            </>
          )}
        </CRow>
      </CCardBody>

      {/* Multi-approve button and Today Leaves button */}
      <CCardBody className="d-flex justify-content-between align-items-center mb-2">
        <CButton
          color={showTodayLeavesView ? "secondary" : "primary"}
          size="sm"
          onClick={handleTodayLeaves}
        >
          {showTodayLeavesView ? "Show Attendance" : "Today Leaves"}
        </CButton>
        {!showTodayLeavesView && (
          <CButton
            color="success"
            size="sm"
            disabled={selectedIds.length === 0}
            onClick={() => openConfirmModal(null, true)}
          >
            Approve Selected ({selectedIds.length})
          </CButton>
        )}
      </CCardBody>

      {/* Table - Show Attendance or Today Leaves based on view */}
      <CCardBody>
        {showTodayLeavesView ? (
          // Today Leaves Table
          <>
            {loadingTodayLeaves ? (
              <AppTableSkeleton ariaLabel="Loading today leaves" rows={6} />
            ) : todayLeaves.length === 0 ? (
              <div className="text-center p-4">
                <p>No employees on leave today</p>
              </div>
            ) : (
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Employee</CTableHeaderCell>
                    <CTableHeaderCell>Leave Type</CTableHeaderCell>
                    <CTableHeaderCell>Start Date</CTableHeaderCell>
                    <CTableHeaderCell>End Date</CTableHeaderCell>
                    <CTableHeaderCell>Days</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {todayLeaves
                    .filter((leave) => {
                      const q = leaveSearchTerm.trim().toLowerCase()
                      const matchesSearch = q
                        ? (
                            (leave.user?.name || '') +
                            ' ' +
                            (leave.user?.email || '')
                          )
                            .toLowerCase()
                            .includes(q)
                        : true

                      const matchesStatus = leaveStatusFilter
                        ? leave.status === leaveStatusFilter
                        : true

                      const matchesLeaveType = leaveTypeFilter
                        ? leave.leaveType === leaveTypeFilter
                        : true

                      return matchesSearch && matchesStatus && matchesLeaveType
                    })
                    .map((leave) => (
                      <CTableRow key={leave._id}>
                        <CTableDataCell>{leave.user?.name || '-'}</CTableDataCell>
                        <CTableDataCell>
                          {leave.leaveType}
                          {leave.leaveType === 'Penalty' && leave.penaltyMultiplier > 1 && (
                            <div style={{ fontSize: '12px', color: 'red' }}>
                              Penalty × {leave.penaltyMultiplier}
                            </div>
                          )}
                        </CTableDataCell>
                        <CTableDataCell>
                          {new Date(leave.start_date).toLocaleDateString()}
                        </CTableDataCell>
                        <CTableDataCell>
                          {new Date(leave.end_date).toLocaleDateString()}
                        </CTableDataCell>
                        <CTableDataCell>{leave.totalDays || '-'}</CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={leave.status === 'Approved' ? 'success' : leave.status === 'Rejected' ? 'danger' : 'warning'}>
                            {leave.status}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CButton size="sm" color="info" onClick={() => openLeaveDetails(leave)}>
                            View
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                </CTableBody>
              </CTable>
            )}
          </>
        ) : (
          // Attendance Table
          <>
            {loading ? (
              <AppTableSkeleton ariaLabel="Loading unapproved attendance" rows={8} />
            ) : (
              <>
                <CTable hover responsive key={`attendance-table-${refreshTrigger}`}>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>
                    <input
                      type="checkbox"
                      checked={attendances.length > 0 && selectedIds.length === attendances.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      style={{ width: '16px', height: '16px' }}
                    />
                  </CTableHeaderCell>
                  <CTableHeaderCell>Employee</CTableHeaderCell>
                  <CTableHeaderCell>Date</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Today Done</CTableHeaderCell>

                  <CTableHeaderCell>MA Location</CTableHeaderCell>

                  <CTableHeaderCell
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('punchIn')}
                  >
                    First Punch{' '}
                    {sortField === 'punchIn' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                  </CTableHeaderCell>

                  <CTableHeaderCell
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('punchOut')}
                  >
                    Last Punch{' '}
                    {sortField === 'punchOut' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                  </CTableHeaderCell>

                  <CTableHeaderCell>Total Work</CTableHeaderCell>
                  <CTableHeaderCell>Overtime</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>

              <CTableBody>
                {sortedAttendances
                  .filter((att) => {
                    const q = searchTerm.trim().toLowerCase()

                    const raLocationText =
                      typeof att.profile?.ra_location === 'string'
                        ? att.profile?.ra_location
                        : att.profile?.ra_location?.label || ''

                    const matchesSearch = q
                      ? (
                          (att.user?.name || '') +
                          ' ' +
                          (att.user?.email || '') +
                          ' ' +
                          (att.user?.mobile || '') +
                          ' ' +
                          raLocationText +
                          ' ' +
                          (att.profile?.location || '')
                        )
                          .toLowerCase()
                          .includes(q)
                      : true

                    const matchesStatus = statusFilter ? att.status === statusFilter : true

                    // Get location value (ID) from ra_location object or string
                    const profileLocationValue =
                      typeof att.profile?.ra_location === 'object'
                        ? att.profile?.ra_location?.value || att.profile?.ra_location?.id || ''
                        : att.profile?.ra_location || ''

                    const matchesLocation = locationFilter
                      ? String(profileLocationValue) === String(locationFilter)
                      : true

                    return matchesSearch && matchesStatus && matchesLocation
                  })
                  .map((att) => {
                    const firstPunch = att.sessions?.[0]?.punch_in
                    const lastPunch = att.sessions?.[att.sessions?.length - 1]?.punch_out
                    const sessions = Array.isArray(att.sessions) ? att.sessions : []
                    const lastSession = sessions.length > 0 ? sessions[sessions.length - 1] : null
                    const draftDone =
                      lastSession?.today_draft_done ??
                      lastSession?.todayDraftDone ??
                      att.today_draft_done ??
                      att.todayDraftDone ??
                      null
                    return (
                      <CTableRow key={att._id}>
                        <CTableDataCell>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(att._id)}
                            onChange={(e) => handleSelect(att._id, e.target.checked)}
                            style={{ width: '16px', height: '16px' }}
                          />
                        </CTableDataCell>

                        <CTableDataCell>{att.user?.name || '-'}</CTableDataCell>
                        <CTableDataCell>{new Date(att.date).toLocaleDateString()}</CTableDataCell>

                        <CTableDataCell>
                          <CBadge color={statusColors[att.status]?.color || 'secondary'}>
                            {att.status}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          {draftDone !== null && draftDone !== undefined ? (
                            <CBadge color="success">{draftDone}</CBadge>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </CTableDataCell>

                        <CTableDataCell>
                          {typeof att.profile?.ra_location === 'object'
                            ? att.profile?.ra_location?.label
                            : att.profile?.ra_location || att.profile?.location || '-'}
                        </CTableDataCell>

                        <CTableDataCell>{formatTime(firstPunch)}</CTableDataCell>
                        <CTableDataCell>{formatTime(lastPunch)}</CTableDataCell>

                        <CTableDataCell>
                          {att.total_duration_minutes ? (
                            <>
                              {Math.floor(att.total_duration_minutes / 60)}h{' '}
                              {Math.floor(att.total_duration_minutes % 60)}m
                            </>
                          ) : (
                            '-'
                          )}
                        </CTableDataCell>

                        <CTableDataCell>
                          {(() => {
                            // Calculate overtime on the frontend as fallback
                            const totalMinutes = att.total_duration_minutes || 0
                            const backendOvertime = att.overtime_minutes || 0

                            // Use backend overtime if available and > 0, otherwise calculate it
                            const overtimeMinutes =
                              backendOvertime > 0
                                ? backendOvertime
                                : Math.max(0, totalMinutes - 9 * 60) // 9 hours = 540 minutes

                            return overtimeMinutes > 0
                              ? `${Math.floor(overtimeMinutes / 60)}h ${Math.floor(
                                  overtimeMinutes % 60,
                                )}m`
                              : '-'
                          })()}
                        </CTableDataCell>

                        <CTableDataCell className="d-flex gap-2 flex-wrap">
                          <CButton size="sm" color="info" onClick={() => openDetails(att)}>
                            View
                          </CButton>
                          <CButton size="sm" color="warning" onClick={() => openEditModal(att)}>
                            Edit
                          </CButton>
                          <CButton
                            size="sm"
                            color="success"
                            onClick={() => openConfirmModal(att._id)}
                          >
                            Approve
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    )
                  })}
              </CTableBody>
            </CTable>

                {/* Pagination */}
                {/* <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-3">
                  <div className="d-flex align-items-center gap-2">
                    <span>Rows per page:</span>
                    <AppFormSelect
                      size="sm"
                      value={limit}
                      onChange={(e) => {
                        setLimit(Number(e.target.value))
                        setPage(1)
                      }}
                      style={{ width: '80px' }}
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </AppFormSelect>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <CButton
                      size="sm"
                      color="secondary"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    >
                      ← Prev
                    </CButton>
                    <span>
                      Page <b>{page}</b> of <b>{lastPage}</b> | Total: <b>{totalRecords}</b>
                    </span>
                    <CButton
                      size="sm"
                      color="secondary"
                      disabled={page >= lastPage}
                      onClick={() => setPage((p) => Math.min(p + 1, lastPage))}
                    >
                      Next →
                    </CButton>
                  </div>
                </div> */}
              </>
            )}
          </>
        )}
      </CCardBody>

      {/* Details Modal */}
      <CModal visible={showDetails} onClose={() => setShowDetails(false)} size="lg" scrollable>
        <CModalHeader>
          <CModalTitle>Attendance Details</CModalTitle>
        </CModalHeader>
        <CModalBody style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {selectedAttendance && (
            <>
              <div className="mb-3">
                <h6 className="mb-2">Employee Info</h6>
                {(() => {
                  const sessions = Array.isArray(selectedAttendance.sessions)
                    ? selectedAttendance.sessions
                    : []
                  let latestDraftDone = null
                  let latestTodayDoneRemark = null

                  for (let i = sessions.length - 1; i >= 0; i--) {
                    const s = sessions[i]
                    if (latestDraftDone === null || latestDraftDone === undefined) {
                      latestDraftDone =
                        s?.today_draft_done ?? s?.todayDraftDone ?? s?.draftDone ?? null
                    }
                    if (!latestTodayDoneRemark) {
                      latestTodayDoneRemark = s?.today_done_remark ?? s?.todayDoneRemark ?? null
                    }
                    if (
                      latestDraftDone !== null &&
                      latestDraftDone !== undefined &&
                      latestTodayDoneRemark
                    ) {
                      break
                    }
                  }

                  const attendanceLevelDraftDone =
                    selectedAttendance.today_draft_done ??
                    selectedAttendance.todayDraftDone ??
                    selectedAttendance.draftDone ??
                    null
                  const attendanceLevelRemark =
                    selectedAttendance.today_done_remark ??
                    selectedAttendance.todayDoneRemark ??
                    null

                  const finalDraftDone =
                    latestDraftDone !== null && latestDraftDone !== undefined
                      ? latestDraftDone
                      : attendanceLevelDraftDone
                  const finalRemark = latestTodayDoneRemark || attendanceLevelRemark || '-'

                  return (
                    <p className="mb-2">
                      <strong>Today Done:</strong>{' '}
                      {finalDraftDone !== null && finalDraftDone !== undefined ? finalDraftDone : '-'}
                      <br />
                      <strong>Today Done Remark:</strong> {finalRemark}
                    </p>
                  )
                })()}
                <p>
                  <strong>Name:</strong> {selectedAttendance.user?.name} <br />
                  <strong>Email:</strong> {selectedAttendance.user?.email} <br />
                  <strong>Date:</strong> {new Date(selectedAttendance.date).toLocaleDateString()}{' '}
                  <br />
                  <strong>Status:</strong>{' '}
                  <CBadge color={statusColors[selectedAttendance.status]?.color || 'secondary'}>
                    {selectedAttendance.status}
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
                      {selectedAttendance.sessions?.map((session, index) => (
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
                            {session.punch_in_image && imageMap[session.punch_in_image] && (
                              <img
                                src={imageMap[session.punch_in_image]}
                                alt="Punch In"
                                width="80"
                                style={{ borderRadius: '5px' }}
                                onClick={() => openLightbox(imageMap[session.punch_in_image])}
                              />
                            )}
                          </CTableDataCell>
                          <CTableDataCell>
                            {session.punch_out_image && imageMap[session.punch_out_image] && (
                              <img
                                src={imageMap[session.punch_out_image]}
                                alt="Punch Out"
                                width="80"
                                style={{ borderRadius: '5px' }}
                                onClick={() => openLightbox(imageMap[session.punch_out_image])}
                              />
                            )}
                          </CTableDataCell>

                          <CTableDataCell>
                            <CButton
                              size="sm"
                              color="warning"
                              onClick={() => openEditModal(selectedAttendance, index)}
                            >
                              Edit
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </div>
              </div>

              {/* Logs Section */}
              {selectedAttendance.logs?.length > 0 && (
                <div className="mb-3">
                  <h6 className="mb-2">Logs</h6>
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
                        {selectedAttendance.logs.map((log) => (
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
          {selectedAttendance?.status !== 'approved' && (
            <CButton
              color="success"
              onClick={() => {
                approveAttendance(selectedAttendance._id)
                setShowDetails(false)
              }}
            >
              Approve
            </CButton>
          )}
          <CButton color="secondary" onClick={() => setShowDetails(false)}>
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
              background: '#000', // optional black background behind image
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

      <CModal
        visible={confirmModal.visible}
        onClose={() => setConfirmModal({ visible: false, attendanceId: null, multiple: false })}
        alignment="center"
      >
        <CModalHeader>
          <CModalTitle>Confirm Approval</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Are you sure you want to approve{' '}
          {confirmModal.multiple ? 'selected attendances' : 'this attendance'}?
        </CModalBody>
        <CModalFooter>
          <CButton color="success" onClick={handleConfirmApprove}>
            Yes, Approve
          </CButton>
          <CButton
            color="secondary"
            onClick={() => setConfirmModal({ visible: false, attendanceId: null, multiple: false })}
          >
            Cancel
          </CButton>
        </CModalFooter>
      </CModal>
      {/* edit model */}
      <CModal
        visible={editModal.visible}
        onClose={() =>
          setEditModal({ visible: false, attendance: null, sessionIndex: null, form: {} })
        }
        size="lg"
      >
        <CModalHeader>
          <CModalTitle>Edit Attendance</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CRow className="mb-3">
            <CCol>
              <label>Status</label>
              <AppFormSelect
                value={editModal.form.status}
                onChange={(e) =>
                  setEditModal((prev) => ({
                    ...prev,
                    form: { ...prev.form, status: e.target.value },
                  }))
                }
              >
                <option value="">Select status</option>
                {(() => {
                  // Check if the attendance date is Sunday (weekend)
                  const attendanceDate = editModal.attendance?.date
                  const isSunday = attendanceDate
                    ? new Date(attendanceDate).getDay() === 0
                    : false

                  // Weekly statuses
                  const weeklyStatuses = ['WeeklyOff', 'WeeklyHalfDay', 'WeeklyPresent']
                  
                  // Filter statuses based on day
                  const availableStatuses = Object.keys(statusColors).filter((s) => {
                    if (isSunday) {
                      // On Sunday, only show weekly statuses
                      return weeklyStatuses.includes(s)
                    } else {
                      // On normal days, exclude weekly statuses
                      return !weeklyStatuses.includes(s)
                    }
                  })

                  return availableStatuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))
                })()}
              </AppFormSelect>
            </CCol>
          </CRow>

          <CRow className="mb-3">
            <CCol>
              <label>Punch In</label>
              <CFormInput
                type="datetime-local"
                value={editModal.form.punch_in}
                onChange={(e) =>
                  setEditModal((prev) => ({
                    ...prev,
                    form: { ...prev.form, punch_in: e.target.value },
                  }))
                }
              />
            </CCol>
            <CCol>
              <label>Punch Out</label>
              <CFormInput
                type="datetime-local"
                value={editModal.form.punch_out}
                onChange={(e) =>
                  setEditModal((prev) => ({
                    ...prev,
                    form: { ...prev.form, punch_out: e.target.value },
                  }))
                }
              />
            </CCol>
          </CRow>

          <CRow>
            <CCol>
              <label>Message</label>
              <CFormInput
                type="text"
                value={editModal.form.message}
                placeholder="Enter reason"
                onChange={(e) =>
                  setEditModal((prev) => ({
                    ...prev,
                    form: { ...prev.form, message: e.target.value },
                  }))
                }
              />
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton color="success" onClick={saveEdit}>
            Save
          </CButton>
          <CButton
            color="secondary"
            onClick={() =>
              setEditModal({ visible: false, attendance: null, sessionIndex: null, form: {} })
            }
          >
            Cancel
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Leave Details Modal */}
      <CModal 
        visible={showLeaveDetails} 
        onClose={() => {
          setShowLeaveDetails(false)
          setSelectedLeave(null)
          setLeaveAttachmentUrls({})
        }} 
        size="lg"
        scrollable
      >
        <CModalHeader>
          <CModalTitle>Leave Details</CModalTitle>
        </CModalHeader>
        <CModalBody style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {selectedLeave && (
            <>
              <p>
                <strong>Employee:</strong> {selectedLeave.user?.name || '-'} ({selectedLeave.user?.email || '-'})
              </p>
              
              <p>
                <strong>Leave Type:</strong> {selectedLeave.leaveType}
                {selectedLeave.leaveType === 'Penalty' && selectedLeave.penaltyMultiplier > 1 && (
                  <span style={{ color: 'red', marginLeft: '8px' }}>
                    (Penalty × {selectedLeave.penaltyMultiplier})
                  </span>
                )}
              </p>

              <p>
                <strong>Task Assign To:</strong> {selectedLeave.taskAssign || 'N/A'}
              </p>

              {selectedLeave.leaveType === 'Emergency' && selectedLeave.acknowledgement_By && (
                <p>
                  <strong>Acknowledged By:</strong> {selectedLeave.acknowledgement_By}
                </p>
              )}

              <p>
                <strong>From:</strong> {new Date(selectedLeave.start_date).toLocaleDateString()}
              </p>

              <p>
                <strong>To:</strong> {new Date(selectedLeave.end_date).toLocaleDateString()}
              </p>

              <p>
                <strong>Total Days:</strong> {selectedLeave.totalDays || '-'}
              </p>

              <p>
                <strong>Applied Date:</strong> {new Date(selectedLeave.createdAt).toLocaleString()}
              </p>

              <p>
                <strong>Reason:</strong> {selectedLeave.reason || '-'}
              </p>

              <p>
                <strong>Status:</strong>{' '}
                <CBadge color={selectedLeave.status === 'Approved' ? 'success' : selectedLeave.status === 'Rejected' ? 'danger' : 'warning'}>
                  {selectedLeave.status}
                </CBadge>
              </p>

              <h6 className="mt-3">Approval Status</h6>
              {selectedLeave.approvals && selectedLeave.approvals.length > 0 ? (
                <CTable hover responsive bordered>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Approver</CTableHeaderCell>
                      <CTableHeaderCell>Status</CTableHeaderCell>
                      <CTableHeaderCell>Date</CTableHeaderCell>
                      <CTableHeaderCell>Reject Reason</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {selectedLeave.approvals.map((approval, idx) => (
                      <CTableRow key={idx}>
                        <CTableDataCell>
                          {approval.approver?.name || 'Unknown'} <br />
                          <small>{approval.approver?.email || ''}</small>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge
                            color={
                              approval.status === 'Approved'
                                ? 'success'
                                : approval.status === 'Rejected'
                                ? 'danger'
                                : 'warning'
                            }
                          >
                            {approval.status}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          {approval.date ? new Date(approval.date).toLocaleString() : '-'}
                        </CTableDataCell>
                        <CTableDataCell>{approval.rejectReason || '-'}</CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              ) : (
                <p>No approvals yet.</p>
              )}

              <h6 className="mt-4">Refund History</h6>
              {selectedLeave.refundHistory && selectedLeave.refundHistory.length > 0 ? (
                <CTable hover responsive bordered>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Date</CTableHeaderCell>
                      <CTableHeaderCell>Refunded By</CTableHeaderCell>
                      <CTableHeaderCell>Remarks</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {selectedLeave.refundHistory.map((r, idx) => (
                      <CTableRow key={idx}>
                        <CTableDataCell>
                          {r.date ? new Date(r.date).toLocaleString() : 'N/A'}
                        </CTableDataCell>
                        <CTableDataCell>
                          {r.by?.name || 'Unknown'} <br />
                          <small>{r.by?.email || ''}</small>
                        </CTableDataCell>
                        <CTableDataCell>{r.remarks || '-'}</CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              ) : (
                <p>No refund history.</p>
              )}

              <h6 className="mt-4">Attachments</h6>
              {selectedLeave.attachments && selectedLeave.attachments.length > 0 ? (
                <div className="d-flex flex-column gap-2">
                  {selectedLeave.attachments.map((fileId, idx) => {
                    const id = typeof fileId === 'string' ? fileId : fileId._id || ''
                    const data = leaveAttachmentUrls[id]
                    const filename = data?.filename || `Attachment ${idx + 1}`
                    const url = data?.url

                    return (
                      <div key={idx} className="d-flex align-items-center gap-2 p-2 border rounded">
                        <span style={{ flex: 1, wordBreak: 'break-all' }}>
                          {url ? (
                            <a href={url} target="_blank" rel="noreferrer" className="text-primary">
                              📎 {filename}
                            </a>
                          ) : (
                            <>📎 {filename} (loading...)</>
                          )}
                        </span>
                        {url && (
                          <CButton
                            size="sm"
                            color="info"
                            onClick={() => {
                              const link = document.createElement('a')
                              link.href = url
                              link.download = filename
                              document.body.appendChild(link)
                              link.click()
                              document.body.removeChild(link)
                            }}
                          >
                            Download
                          </CButton>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p>No attachments available.</p>
              )}
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton 
            color="secondary" 
            onClick={() => {
              setShowLeaveDetails(false)
              setSelectedLeave(null)
              setLeaveAttachmentUrls({})
            }}
          >
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </CCard>
  )
}

export default AdminUnapprovedAttendance
