import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CForm,
  CFormLabel,
  CFormInput,
  CFormTextarea,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CProgress,
  CCol,
  CRow,
  CAlert,
  CSpinner,
  CListGroup,
  CListGroupItem,
} from '@coreui/react'

import AppFormSelect from 'src/components/form/AppFormSelect'
import AppContentSkeleton from 'src/components/custom/AppContentSkeleton'
import AppTableSkeleton from 'src/components/custom/table/AppTableSkeleton'
import { cilCalendar, cilPlus, cilMagnifyingGlass } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useDispatch, useSelector } from 'react-redux'
import BasicProvider from 'src/constants/BasicProvider'
import { calculateInclusiveLeaveDays as calculateDays, getLeaveRequestDisplayDays } from './utils'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import { end } from '@popperjs/core'
import { Manager } from 'socket.io-client'

// Status definitions aligned with backend
const leaveStatuses = {
  pending: { color: 'warning', text: 'Pending' },
  partially_approved: { color: 'info', text: 'Partially Approved' },
  approved: { color: 'success', text: 'Approved' },
  rejected: { color: 'danger', text: 'Rejected' },
  cancelled: { color: 'secondary', text: 'Cancelled' },
}

const EmployeeDashboard = () => {
  const dispatch = useDispatch()
  const userData = useSelector((state) => state.userData)
  const [employeeData, setEmployeeData] = useState(null)
  // Ledger
  const [ledgerData, setLedgerData] = useState([])
  const [ledgerLoading, setLedgerLoading] = useState(true)
  const [ledgerCurrentPage, setLedgerCurrentPage] = useState(1)
  const [ledgerLastPage, setLedgerLastPage] = useState(1)
  const [ledgerTotalRecords, setLedgerTotalRecords] = useState(0)
  const ledgerPerPage = 10

  // Modals & Form
  const [showModal, setShowModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [leaveForm, setLeaveForm] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    leaveAcknowledgement: '',
    attachments: [],
    taskAssign: '',
    acknowledgement_By: '',
    reporting_manager: '',
    leaveAuthority_one: '',
    leaveAuthority_two: '',
  })

  // Leave Balance
  const [leaveBalance, setLeaveBalance] = useState(null)
  const [loadingBalance, setLoadingBalance] = useState(true)
  // Frontend balance tracking (decreases when leave is applied, increases when cancelled/rejected)
  const [frontendBalance, setFrontendBalance] = useState({
    clBalance: 0,
    ulBalance: 0,
  })

  // Leave Requests
  const [leaveRequests, setLeaveRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const perPage = 10

  const [showFilters, setShowFilters] = useState(false)
  const [typeFilter, setTypeFilter] = useState('')
  const [searchFilter, setSearchFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [cancelModalVisible, setCancelModalVisible] = useState(false)
  const [selectedLeaveId, setSelectedLeaveId] = useState(null)
  const [expandedReasons, setExpandedReasons] = useState({})
  const [managers, setManagers] = useState([])
  const [attachmentUrls, setAttachmentUrls] = useState({})
  const [emergencyLeaveEnabled, setEmergencyLeaveEnabled] = useState(true)

  const resetFilters = () => {
    setStatusFilter('')
    setTypeFilter('')
    setSearchFilter('')
    setFromDate('')
    setToDate('')
  }

  const toggleReason = (id) => {
    if (!id) return
    setExpandedReasons((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const renderReasonCell = (req) => {
    const id = req?._id
    const reason = (req?.reason || '').trim()
    if (!reason) return <span className="text-muted">-</span>
    const expanded = Boolean(expandedReasons[id])
    const limit = 48
    const shouldTruncate = reason.length > limit
    const shown = expanded || !shouldTruncate ? reason : `${reason.slice(0, limit)}...`

    return (
      <div style={{ maxWidth: 240 }}>
        <div style={{ fontSize: '0.85rem', lineHeight: 1.25, whiteSpace: 'normal' }}>{shown}</div>
        {shouldTruncate && (
          <button
            type="button"
            onClick={() => toggleReason(id)}
            className="btn btn-link p-0 mt-1"
            style={{ fontSize: '0.78rem', textDecoration: 'none' }}
          >
            {expanded ? 'Read less' : 'Read more'}
          </button>
        )}
      </div>
    )
  }


  
  const fetchManagers = async () => {
    try {
      const slugs = [
        process.env.REACT_APP_ADMIN,
        process.env.REACT_APP_COO,
        process.env.REACT_APP_FE,
        process.env.REACT_APP_RA,
        process.env.REACT_APP_SFO,
        process.env.REACT_APP_SDM,
        process.env.REACT_APP_DM,
        process.env.REACT_APP_RC,
        process.env.REACT_APP_LCTO,
        process.env.REACT_APP_CTO,
      ]

      const queryString = slugs.join(',')
      // const response = await new BasicProvider(
      //   `admins/get-multiple?slugs=${encodeURIComponent(queryString)}&page=1&count=500`,
      // ).getRequest()
      const response = await new BasicProvider('admins?page=1&count=1000').getRequest()

      const staff = response.data.data || []
      const managerOptions = staff.map((manager) => ({
        _id: manager._id,
        name: manager.name,
        email: manager.email,
      })) 
      setManagers(managerOptions)
    } catch (error) {
      console.error('Error fetching managers:', error)
      setManagers([{ value: '', label: 'Select Reporting Manager' }])
    }
  }

const fetchProfile = async (userId) => {
  try {
    let response

    try {
      response = await new BasicProvider(`profiles`, dispatch).getRequest({
        withCredentials: true,
      })
    } catch {
      response = await new BasicProvider(`profiles/${userId}`, dispatch).getRequest({
        withCredentials: true,
      })
    }

    if (!response?.data) return
 
    if (!managers || managers.length === 0) {
      console.warn('Managers not loaded yet, skipping profile mapping')
      return
    }

    const profile = response.data
    // Prefer latest reporting_manager field. Some records still carry stale reporting_manager_id.
    const reportingManagerId =
      profile.reporting_manager?._id ||
      profile.reporting_manager?.id ||
      profile.reporting_manager ||
      profile.reporting_manager_id ||
      ''
    const reportingManagerNameFromProfile =
      profile.reporting_manager?.name ||
      profile.reporting_manager_name ||
      profile.reportingManagerName ||
      ''

    setEmployeeData({
      ...profile,
      reporting_manager_id: reportingManagerId,

      reporting_manager_name:
        managersMap[reportingManagerId] || reportingManagerNameFromProfile || 'N/A',

      leaveAuthorityOne_Name:
        managersMap[profile.leaveAuthorityOne] ?? 'N/A',

      leaveAuthorityTwo_Name:
        managersMap[profile.leaveAuthorityTwo] ?? 'N/A',
    })

  } catch (error) {
    console.error('Failed to fetch profile:', error)
    toast.error('Failed to load user profile')
  }
}

const managersMap = React.useMemo(() => {
  const map = {}
  managers.forEach((m) => {
    map[m._id] = m.name
  })
  return map
}, [managers])


 

  const fetchLedgerData = async (page = 1) => {
    try {
      setLedgerLoading(true)

      const queryParams = [`page=${page}`, `count=${ledgerPerPage}`]
      if (userData) queryParams.push(`user=${userData?._id}`)
      const queryString = queryParams.join('&')

      const response = await new BasicProvider(
        `leaves/ledger?${queryString}`,
        dispatch,
      ).getRequest()

      setLedgerData(response.data)
      setLedgerCurrentPage(response.current_page)
      setLedgerLastPage(response.last_page)
      setLedgerTotalRecords(response.total)
    } catch (error) {
      toast.error('Failed to fetch ledger data')
    } finally {
      setLedgerLoading(false)
    }
  }

  // Check for pending leaves count of a specific type
  const getPendingLeavesCount = async (leaveType) => {
    try {
      const queryParams = [`status=Pending`, `leaveType=${leaveType}`, `page=1`, `count=1000`]
      if (userData) queryParams.push(`user=${userData?._id}`)
      const queryString = queryParams.join('&')
      const response = await new BasicProvider(
        `leaves/my-leave?${queryString}`,
        dispatch,
      ).getRequest()
      const leaves = response.data || []
      // Filter to ensure we only count actual pending leaves (handle case variations)
      return leaves.filter(
        (leave) =>
          leave.leaveType === leaveType &&
          (leave.status?.toLowerCase() === 'pending' || leave.status === 'Pending')
      ).length
    } catch (error) {
      console.error('Error checking pending leaves:', error)
      return 0
    }
  }

  // Fetch leave settings (emergency option toggle)
  const fetchLeaveSettings = async () => {
    try {
      const res = await new BasicProvider('attendances/leave-settings', dispatch).getRequest()
      if (res.status === 'success' && res.data) {
        setEmergencyLeaveEnabled(res.data.emergencyLeaveEnabled !== false)
      }
    } catch {
      setEmergencyLeaveEnabled(true)
    }
  }

  // Fetch Leave Balance
  const fetchLeaveBalance = async () => {
    try {
      setLoadingBalance(true)
      const response = await new BasicProvider(`leaves/balance`, dispatch).getRequest()
      const balanceData = response.data // { clBalance, ulBalance, penaltyBucket }
      setLeaveBalance(balanceData)
      
      // Calculate frontend balance: Backend balance - pending leaves count
      const clPendingCount = await getPendingLeavesCount('CL')
      const ulPendingCount = await getPendingLeavesCount('UL')
      
      setFrontendBalance({
        clBalance: Math.max(0, Number(balanceData?.clBalance || 0) - clPendingCount),
        ulBalance: Math.max(0, Number(balanceData?.ulBalance || 0) - ulPendingCount),
      })
    } catch (error) {
      toast.error('Failed to fetch leave balance')
    } finally {
      setLoadingBalance(false)
    }
  }

  // Fetch Leave Requests
  const fetchLeaveData = async (page = 1) => {
    try {
      setLoading(true)
      const queryParams = []
      if (statusFilter) queryParams.push(`status=${statusFilter}`)
      if (typeFilter) queryParams.push(`leaveType=${typeFilter}`)
      if (fromDate) queryParams.push(`fromDate=${fromDate}`)
      if (toDate) queryParams.push(`toDate=${toDate}`)
      queryParams.push(`page=${page}`, `count=${perPage}`)
      if (userData) queryParams.push(`user=${userData?._id}`)

      const queryString = queryParams.join('&')

      const response = await new BasicProvider(
        `leaves/my-leave?${queryString}`,
        dispatch,
      ).getRequest()
      setLeaveRequests(response.data)
      setCurrentPage(response.current_page)
      setLastPage(response.last_page)
      setTotalRecords(response.total)
    } catch (error) {
      toast.error('Failed to fetch leave requests')
    } finally {
      setLoading(false)
    }
  }

// useEffect(() => { 
//     if (!userData?._id) return

//      fetchManagers();                   
//      fetchProfile(userData._id);        

//     fetchLeaveBalance();
//     fetchLeaveData(currentPage);
//     fetchLedgerData(ledgerCurrentPage);
   
// }, [userData, currentPage, statusFilter, typeFilter, fromDate, toDate]);

useEffect(() => {
  if (!userData?._id) return
  fetchManagers()
  fetchLeaveBalance()
  fetchLeaveSettings()
}, [userData?._id])

useEffect(() => {
  if (!userData?._id) return
  if (managers.length === 0) return
  if (employeeData) return

  fetchProfile(userData._id)
}, [managers, userData?._id])

useEffect(() => {
  if (!userData?._id) return

  fetchLeaveData(currentPage)
  fetchLedgerData(ledgerCurrentPage)
}, [currentPage, statusFilter, typeFilter, fromDate, toDate])

  const openDetailsModal = (request) => {
    setSelectedRequest(request)
    setAttachmentUrls({}) // reset URLs
    if (request.attachments && request.attachments.length > 0) {
      loadAttachmentUrls(request.attachments)
    }
    setShowDetailsModal(true)
  }

  const goToPage = (page) => {
    if (page < 1 || page > lastPage) return
    setCurrentPage(page)
  }

  // Apply Leave
  const handleSubmit = async () => {
    const { leaveType, startDate, endDate, reason } = leaveForm
    if (!leaveType || !startDate || !endDate || !reason.trim()) {
      toast.error('Please fill all required fields')
      return
    }

    // Check CL/UL frontend balance validation
    if (leaveType === 'CL' || leaveType === 'UL') {
      const currentFrontendBalance =
        leaveType === 'CL' ? frontendBalance.clBalance : frontendBalance.ulBalance
      const leaveTypeName = leaveType === 'CL' ? 'CL' : 'UL'

      // Check if frontend balance is 0 or less
      if (currentFrontendBalance <= 0) {
        // Check if there are pending leaves
        const pendingCount = await getPendingLeavesCount(leaveType)
        if (pendingCount > 0) {
          toast.error(
            `Your ${leaveTypeName} balance has been exhausted and all your leaves are pending. Please wait for them to be approved first.`,
            { autoClose: 5000 }
          )
          return
        }
      }
    }

    try {
      const toArray = (v) => {
        if (v === undefined || v === null) return []
        if (Array.isArray(v)) return v.map(String)
        return [String(v)]
      }
      const payload = {
        leaveType,
        // start_date: new Date(startDate).toISOString(),
        // end_date: new Date(endDate).toISOString(),
        start_date: startDate,
        end_date: endDate,
        reason,
        acknowledgement_By: leaveForm.acknowledgement_By || leaveForm.acknowledgement || '',
        taskAssign: leaveForm.taskAssign || '',
        reporting_manager: employeeData.reporting_manager_id || employeeData.reporting_manager || '',
        leaveAuthority_one: employeeData.leaveAuthorityOne,
        leaveAuthority_two: employeeData.leaveAuthorityTwo,
      }
      // const response = await new BasicProvider(`leaves/apply`, dispatch).postRequest(payload)
      // If Emergency and files present, send multipart/form-data with attachments[] array
      let response
      if (leaveForm.attachments?.length > 0) {
        const fd = new FormData()
        Object.entries(payload).forEach(([k, v]) => {
          if (v === undefined || v === null) return
          if (Array.isArray(v)) {
            v.forEach((item) => fd.append(k, item))
          } else {
            fd.append(k, v)
          }
        })
        // append files as attachments[] (array)
        leaveForm.attachments.forEach((file) => fd.append('attachments', file))

        // Ensure BasicProvider sends FormData raw (no JSON content-type override)
        response = await new BasicProvider(`leaves/apply`, dispatch).postRequest(fd)
      } else {
        response = await new BasicProvider(`leaves/apply`, dispatch).postRequest(payload)
      }
 
      if (response.status === 'success') {
        // Decrement frontend balance for CL/UL when leave is successfully applied
        if (leaveType === 'CL' || leaveType === 'UL') {
          setFrontendBalance((prev) => ({
            ...prev,
            [leaveType === 'CL' ? 'clBalance' : 'ulBalance']: Math.max(
              0,
              (leaveType === 'CL' ? prev.clBalance : prev.ulBalance) - 1
            ),
          }))
        }

        toast.success('Leave applied successfully')
        setLeaveForm({
          leaveType: '',
          startDate: '',
          endDate: '',
          reason: '',
          leaveAcknowledgement: '',
          attachments: [],
          acknowledgement_By: '',
          taskAssign: '',
        })
        setShowModal(false)
        fetchLeaveData()
        fetchLeaveBalance()
      } else {
        throw new Error(response.message || 'Failed to apply leave')
      }
    } catch (error) {
      toast.error(error?.message || error.response?.data?.message || 'Error applying leave')
    }
  }

  const goToLedgerPage = (page) => {
    if (page < 1 || page > ledgerLastPage) return
    setLedgerCurrentPage(page)
  }

  const getPenaltyLabel = (multiplier) => {
    switch (multiplier) {
      case 2:
        return 'Double Deduction'
      case 3:
        return 'Triple Deduction'
      case 4:
        return 'Quadruple Deduction'
      default:
        return multiplier > 4 ? `${multiplier} Times Deduction` : ''
    }
  }

  const handleCancelLeave = async () => {
    if (!selectedLeaveId) return
    try {
      // Find the leave request to get its type
      const leaveToCancel = leaveRequests.find((req) => req._id === selectedLeaveId)
      const leaveType = leaveToCancel?.leaveType

      const response = await new BasicProvider(
        `leaves/${selectedLeaveId}/cancel`,
        dispatch,
      ).patchRequest()

      if (response.status === 'success') {
        // Increment frontend balance for CL/UL when leave is cancelled
        if (leaveType === 'CL' || leaveType === 'UL') {
          setFrontendBalance((prev) => ({
            ...prev,
            [leaveType === 'CL' ? 'clBalance' : 'ulBalance']:
              (leaveType === 'CL' ? prev.clBalance : prev.ulBalance) + 1,
          }))
        }

        toast.success('Leave cancelled successfully')
        setCancelModalVisible(false)
        setSelectedLeaveId(null)
        fetchLeaveData() // refresh the table
        fetchLeaveBalance() // refresh balance to sync
      } else {
        throw new Error(response.message || 'Failed to cancel leave')
      }
    } catch (err) {
      toast.error(err?.message || 'Error cancelling leave')
      setCancelModalVisible(false)
    }
  }

  const fetchAttachmentSignedUrl = async (fileId) => {
    try {
      const response = await new BasicProvider(
        `cms/files/show-file-with-signed-url/${fileId}`,
        dispatch,
      ).getRequest()
      return response.data || null
    } catch (error) {
      console.error('Error fetching signed URL:', error)
      toast.error('Failed to load attachment')
      return null
    }
  }

  const loadAttachmentUrls = async (attachments) => {
    if (!attachments || attachments.length === 0) return

    const urls = {}
    for (const fileId of attachments) {
      const id = typeof fileId === 'string' ? fileId : fileId._id || ''
      if (id && !urls[id]) {
        const data = await fetchAttachmentSignedUrl(id)
        if (data) {
          urls[id] = {
            url: data.url || data,
            filename: data.filename || data.originalName || `Attachment-${id}`,
          }
        }
      }
    }
    setAttachmentUrls(urls)
  }

  return (
    <div style={{ width: '95%', margin: 'auto', padding: '20px' }}>
      {/* <div className="d-flex bg-light p-3 bg-white shadow-lg mb-4 rounded ">
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
          Technical
        </button>

        <button className="btn btn-success ms-3" onClick={() => navigate('/hrms')}>
          Management
        </button>
      </div> */}
      {/* Leave Balance */}
      <CRow className="mb-4 g-3">
        {loadingBalance ? (
          <CCol xs={12}>
            <AppContentSkeleton
              variant="cards"
              cards={3}
              ariaLabel="Loading leave balance"
            />
          </CCol>
        ) : leaveBalance ? (
          <>
            {(() => {
              return (
                <>
                  <CCol md={4} className="mb-1 mb-md-0">
                    <CCard>
                      <CCardHeader>
                        <CCardTitle>Casual Leave (CL)</CCardTitle>
                      </CCardHeader>
                      <CCardBody>
                        <div className="d-flex align-items-center mb-2 gap-2 flex-wrap">
                          <span>Available: {Number(leaveBalance?.clBalance)}</span>
                          <span
                            className="d-inline-block"
                            style={{ width: '2px', height: '18px', background: '#e0e0e0' }}
                          ></span>
                          <span>Used: {Number(leaveBalance?.clUsed)}</span>
                          {/* <span
                            className="d-inline-block ms-2"
                            style={{ width: '2px', height: '18px', background: '#e0e0e0' }}
                          ></span> */}
                          {/* <span>Accupted: {0}</span> */}
                        </div>
                      </CCardBody>
                    </CCard>
                  </CCol>

                  <CCol md={4} className="mb-3 mb-md-0">
                    <CCard>
                      <CCardHeader>
                        <CCardTitle>Unpaid Leave (UL)</CCardTitle>
                      </CCardHeader>
                      <CCardBody>
                        <div className="d-flex align-items-center mb-2 gap-2 flex-wrap">
                          <span>Available: {leaveBalance?.ulBalance}</span>
                          <span
                            className="d-inline-block"
                            style={{ width: '2px', height: '18px', background: '#e0e0e0' }}
                          ></span>
                          <span>Used: {leaveBalance?.ulUsed}</span>
                          {/* <span
                            className="d-inline-block"
                            style={{ width: '2px', height: '18px', background: '#e0e0e0' }}
                          ></span> */}
                          {/* <span>Accupted: {0}</span> */}
                        </div>
                      </CCardBody>
                    </CCard>
                  </CCol>

                  <CCol md={4} className="mb-3 mb-md-0">
                    <CCard>
                      <CCardHeader>
                        <CCardTitle>Penalty Bucket</CCardTitle>
                      </CCardHeader>
                      <CCardBody>
                        <div className="d-flex justify-content-between align-items-center mb-2 gap-3 flex-wrap">
                          <span>Penalty Days: {leaveBalance.penaltyBucket}</span>
                        </div>
                      </CCardBody>
                    </CCard>
                  </CCol>
                </>
              )
            })()}
          </>
        ) : (
          <CAlert color="info">No leave balance found.</CAlert>
        )}
      </CRow>

      {/* Apply Leave Button */}
      <CRow className="mb-4">
        <CCol>
          <CButton color="primary" onClick={() => setShowModal(true)}>
            <CIcon icon={cilPlus} className="me-2" /> Apply Leave
          </CButton>
        </CCol>
      </CRow>
      <CCard className={`${showFilters ? 'mb-3' : 'mb-0'}`}>
        <CCardHeader className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-2">
          <h5 className="mb-2 mb-md-0">My Leave Requests</h5>
          <div className="d-flex gap-2 flex-wrap">
            <CButton size="sm" color="primary" onClick={() => setShowFilters(!showFilters)}>
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </CButton>
            <CButton size="sm" color="secondary" onClick={resetFilters}>
              Reset Filters
            </CButton>
          </div>
        </CCardHeader>

        <AnimatePresence initial={false}>
          {showFilters && (
            <motion.div
              key="filters"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CCardBody className="filter-container">
                <div className="filter-grid sticky-filters d-flex flex-wrap gap-2">
                  <AppFormSelect
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </AppFormSelect>

                  <AppFormSelect value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                    <option value="">All Types</option>
                    <option value="CL">Casual Leave</option>
                    <option value="UL">Unpaid Leave</option>
                    <option value="Penalty">Penalty Leave</option>
                    <option value="Emergency">Emergency Leave</option>
                  </AppFormSelect>

                  <CFormInput
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                  <CFormInput
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>
              </CCardBody>
            </motion.div>
          )}
        </AnimatePresence>
      </CCard>

      {/* Leave Requests Table */}
      <CCard>
        {/* <CCardHeader>
          <CCardTitle className="mb-0">My Leave Requests</CCardTitle>
        </CCardHeader> */}
        <CCardBody>
          {loading ? (
            <AppTableSkeleton ariaLabel="Loading leave requests" rows={7} />
          ) : leaveRequests.length === 0 ? (
            <CAlert color="info">No leave requests found.</CAlert>
          ) : (
            <>
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Leave Type</CTableHeaderCell>
                    <CTableHeaderCell>From</CTableHeaderCell>
                    <CTableHeaderCell>To</CTableHeaderCell>
                    <CTableHeaderCell>Days</CTableHeaderCell>
                    <CTableHeaderCell>Reason</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {leaveRequests.map((req) => (
                    <CTableRow key={req._id} className="align-middle">
                      <CTableDataCell>
                        {' '}
                        {req.leaveType}
                        {req.leaveType === 'Penalty' && req.penaltyMultiplier > 1 && (
                          <div style={{ fontSize: '12px', color: 'red' }}>
                            Penalty × {req.penaltyMultiplier} (
                            {getPenaltyLabel(req.penaltyMultiplier)})
                          </div>
                        )}
                      </CTableDataCell>
                      <CTableDataCell>
                        {new Date(req.start_date).toLocaleDateString()}
                      </CTableDataCell>
                      <CTableDataCell>{new Date(req.end_date).toLocaleDateString()}</CTableDataCell>
                      <CTableDataCell>{getLeaveRequestDisplayDays(req)}</CTableDataCell>
                      <CTableDataCell style={{ minWidth: 220 }}>{renderReasonCell(req)}</CTableDataCell>
                      <CTableDataCell>
                        <CBadge
                          color={leaveStatuses[req.status?.toLowerCase()]?.color || 'secondary'}
                        >
                          {leaveStatuses[req.status?.toLowerCase()]?.text || req.status}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CButton size="sm" color="info" onClick={() => openDetailsModal(req)}>
                          <CIcon icon={cilMagnifyingGlass} />
                        </CButton>

                        {req.status === 'Pending' && (
                          <CButton
                            size="sm"
                            color="danger"
                            variant="outline"
                            onClick={() => {
                              setSelectedLeaveId(req._id)
                              setCancelModalVisible(true)
                            }}
                          >
                            Cancel
                          </CButton>
                        )}
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>

              {/* Pagination */}
              <div className="d-flex justify-content-between align-items-center mt-3">
                <span>
                  Total: {totalRecords} | Page {currentPage} of {lastPage}
                </span>
                <div>
                  <CButton
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => goToPage(currentPage - 1)}
                  >
                    Prev
                  </CButton>
                  <CButton
                    size="sm"
                    disabled={currentPage === lastPage}
                    onClick={() => goToPage(currentPage + 1)}
                    className="ms-2"
                  >
                    Next
                  </CButton>
                </div>
              </div>
            </>
          )}
        </CCardBody>
      </CCard>

      {/* Leave Details Modal */}
      <CModal visible={showDetailsModal} onClose={() => setShowDetailsModal(false)} size="lg">
        <CModalHeader>
          <CModalTitle>Leave Details</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedRequest && (
            <>
              <p>
                <strong>Employee:</strong> {selectedRequest.user?.name} (
                {selectedRequest.user?.email})
              </p>
              <p>
                <strong>Leave Type:</strong> {selectedRequest.leaveType}
                {selectedRequest.leaveType === 'Penalty' &&
                  selectedRequest.penaltyMultiplier > 1 && (
                    <span style={{ color: 'red', marginLeft: '8px' }}>
                      (Penalty × {selectedRequest.penaltyMultiplier} —{' '}
                      {getPenaltyLabel(selectedRequest.penaltyMultiplier)})
                    </span>
                  )}
              </p>
              <p>
                <strong>Task Assign To: </strong>
                {selectedRequest.taskAssign || ' N/A'}
              </p>
              <p>
                {selectedRequest.leaveType === 'Emergency' && (
                  <>
                    <strong>Acknowledged By: </strong>
                    {selectedRequest.acknowledgement_By || ' N/A'}
                  </>
                )}
              </p>
              <p>
                <strong>From:</strong> {new Date(selectedRequest.start_date).toLocaleDateString()}
              </p>
              <p>
                <strong>To:</strong> {new Date(selectedRequest.end_date).toLocaleDateString()}
              </p>
              <p>
                <strong>Days:</strong>{' '}
                {getLeaveRequestDisplayDays(selectedRequest)}
              </p>
              <p>
                <strong>Applied Date:</strong>{' '}
                {new Date(selectedRequest.createdAt).toLocaleString()}
              </p>
              <p>
                <strong>Reason:</strong> {selectedRequest.reason}
              </p>
              <p>
                <strong>Status:</strong> {selectedRequest.status}
              </p>

              <h6 className="mt-3">Approval Status</h6>
              {selectedRequest.approvals?.length ? (
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
                    {selectedRequest.approvals.map((a, idx) => (
                      <CTableRow key={idx}>
                        <CTableDataCell>
                          {a.approver?.name || 'Unknown'} <br />
                          <small>{a.approver?.email}</small>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge
                            color={
                              a.status === 'Approved'
                                ? 'success'
                                : a.status === 'Rejected'
                                ? 'danger'
                                : 'warning'
                            }
                          >
                            {a.status}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          {a.date ? new Date(a.date).toLocaleString() : '-'}
                        </CTableDataCell>
                        <CTableDataCell>{a.rejectReason || '-'}</CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              ) : (
                <p>No approvals yet.</p>
              )}
              <h6 className="mt-4">Refund History</h6>

              {selectedRequest.refundHistory?.length ? (
                <CTable hover responsive bordered>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Date</CTableHeaderCell>
                      <CTableHeaderCell>Refunded By</CTableHeaderCell>
                      <CTableHeaderCell>Remarks</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>

                  <CTableBody>
                    {selectedRequest.refundHistory.map((r, idx) => (
                      <CTableRow key={idx}>
                        {/* Date */}
                        <CTableDataCell>
                          {r.date ? new Date(r.date).toLocaleString() : 'N/A'}
                        </CTableDataCell>

                        {/* Refunded By (Name + Email) */}
                        <CTableDataCell>
                          {r.by?.name || 'Unknown'} <br />
                          <small>{r.by?.email || ''}</small>
                        </CTableDataCell>

                        {/* Remarks */}
                        <CTableDataCell>{r.remarks || '-'}</CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              ) : (
                <p>No refund history available.</p>
              )}

              <h6 className="mt-4">Attachments</h6>
              {selectedRequest.attachments && selectedRequest.attachments.length ? (
                <div className="d-flex flex-column gap-2">
                  {selectedRequest.attachments.map((fileId, idx) => {
                    const id = typeof fileId === 'string' ? fileId : fileId._id || ''
                    const data = attachmentUrls[id]
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
          <CButton color="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Apply Leave Modal */}

      <CModal visible={showModal} onClose={() => setShowModal(false)} size="lg">
        <CModalHeader>
          <CModalTitle>Apply Leave</CModalTitle>
        </CModalHeader>

        <CModalBody>
          <CForm>
            {(() => {
              const isSameDay =
                leaveForm.startDate &&
                leaveForm.endDate &&
                leaveForm.startDate === leaveForm.endDate

              const today = new Date().toISOString().split('T')[0]
              const isTodaySelected = isSameDay && leaveForm.startDate === today

              return (
                <>
                  {/* Reporting + Authorities Section */}
                  <CRow className="mb-4">
                    <CCol md={4}>
                      <CFormLabel>Reporting Manager</CFormLabel>
                      <CFormInput type="text" value={employeeData?.reporting_manager_name} disabled />

                    </CCol>

                    <CCol md={4}>
                      <CFormLabel>Leave Authority 1</CFormLabel>
                      <CFormInput
                        type="text"
                        value={employeeData?.leaveAuthorityOne_Name}
                        disabled
                      />
                    </CCol>

                    <CCol md={4}>
                      <CFormLabel>Leave Authority 2</CFormLabel>
                      <CFormInput
                        type="text"
                        value={employeeData?.leaveAuthorityTwo_Name}
                        disabled
                      />
                    </CCol>
                  </CRow>

                  {/* Leave details */}
                  <CRow>
                    <CCol md={6}>
                      <CFormLabel>Start Date *</CFormLabel>
                      <CFormInput
                        type="date"
                        value={leaveForm.startDate}
                        onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                      />
                    </CCol>
                    <CCol md={6}>
                      <CFormLabel>End Date *</CFormLabel>
                      <CFormInput
                        type="date"
                        value={leaveForm.endDate}
                        onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                      />
                    </CCol>
                  </CRow>

                  <CRow className="mt-3">
                    <CCol md={6}>
                      <CFormLabel>Leave Type *</CFormLabel>
                      <AppFormSelect
                        value={leaveForm.leaveType}
                        onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                      >
                        <option value="">Select</option>
                        <option value="CL" disabled={isTodaySelected}>
                          Casual Leave - {frontendBalance.clBalance}
                        </option>
                        <option value="UL" disabled={isTodaySelected}>
                          Unpaid Leave - {frontendBalance.ulBalance}
                        </option>
                        <option value="Penalty">Penalty Leave</option>
                        {isTodaySelected && emergencyLeaveEnabled && (
                          <option value="Emergency">Emergency Leave</option>
                        )}
                      </AppFormSelect>
                    </CCol>
                    <CCol md={6}>
                      <CFormLabel>Days</CFormLabel>
                      <CFormInput
                        type="text"
                        value={calculateDays(leaveForm.startDate, leaveForm.endDate)}
                        readOnly
                      />
                    </CCol>
                  </CRow>

                  <CRow className="mt-3">
                    <CCol>
                      <CFormLabel>Reason *</CFormLabel>
                      <CFormTextarea
                        rows={3}
                        value={leaveForm.reason}
                        onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                      />
                    </CCol>
                  </CRow>

                  <CRow className="mt-3">
                    <CCol>
                      <CFormLabel>Task Assign To</CFormLabel>
                      <CFormInput
                        type="text"
                        value={leaveForm.taskAssign}
                        onChange={(e) => setLeaveForm({ ...leaveForm, taskAssign: e.target.value })}
                      />
                    </CCol>
                  </CRow>

                  {leaveForm.leaveType === 'Emergency' && (
                    <CRow className="mt-3">
                      <CCol>
                        <CFormLabel>Acknowledgement By</CFormLabel>
                        <CFormInput
                          type="text"
                          value={leaveForm.acknowledgement}
                          onChange={(e) =>
                            setLeaveForm({ ...leaveForm, acknowledgement: e.target.value })
                          }
                        />
                      </CCol>
                    </CRow>
                  )}
                  {/* {leaveForm.leaveType === 'Emergency' && ( */}
                    <CRow className="mt-3">
                      <CCol>
                        <CFormLabel>Attachments</CFormLabel>
                        <CFormInput
                          type="file"
                          multiple
                          accept="*/*"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || [])
                            setLeaveForm((prev) => ({
                              ...prev,
                              attachments: [...(prev.attachments || []), ...files],
                            }))
                          }}
                        />
                        <div className="form-text">Upload one or more files (optional)</div>
                      </CCol>
                    </CRow>
                  {/* )} */}
                </>
              )
            })()}
          </CForm>
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleSubmit}>
            Submit
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Leave Ledger Section */}
      <CCard className="mt-4">
        <CCardHeader>
          <CCardTitle>Leave Ledger</CCardTitle>
        </CCardHeader>
        <CCardBody>
          {ledgerLoading ? (
            <AppTableSkeleton ariaLabel="Loading leave ledger" rows={6} />
          ) : ledgerData.length === 0 ? (
            <CAlert color="info">No ledger records found.</CAlert>
          ) : (
            <>
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Leave Type</CTableHeaderCell>
                    <CTableHeaderCell>Days</CTableHeaderCell>
                    <CTableHeaderCell>Transaction Type</CTableHeaderCell>
                    <CTableHeaderCell>Remarks</CTableHeaderCell>
                    <CTableHeaderCell>Date</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {ledgerData.map((record) => (
                    <CTableRow key={record._id}>
                      <CTableDataCell>{record.leaveType}</CTableDataCell>
                      <CTableDataCell>{record.days}</CTableDataCell>
                      <CTableDataCell>{record.transactionType}</CTableDataCell>
                      <CTableDataCell>{record.remarks}</CTableDataCell>
                      <CTableDataCell>
                        {new Date(record.createdAt).toLocaleDateString()}
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>

              {/* Ledger Pagination */}
              <div className="d-flex justify-content-between align-items-center mt-3">
                <span>
                  Total: {ledgerTotalRecords} | Page {ledgerCurrentPage} of {ledgerLastPage}
                </span>
                <div>
                  <CButton
                    size="sm"
                    disabled={ledgerCurrentPage === 1}
                    onClick={() => goToLedgerPage(ledgerCurrentPage - 1)}
                  >
                    Prev
                  </CButton>
                  <CButton
                    size="sm"
                    disabled={ledgerCurrentPage === ledgerLastPage}
                    onClick={() => goToLedgerPage(ledgerCurrentPage + 1)}
                    className="ms-2"
                  >
                    Next
                  </CButton>
                </div>
              </div>
            </>
          )}
        </CCardBody>
      </CCard>
      {/* Cancel Leave Confirmation Modal */}
      <CModal
        visible={cancelModalVisible}
        onClose={() => setCancelModalVisible(false)}
        alignment="center"
        size="sm"
      >
        <CModalHeader>
          <CModalTitle>Cancel Leave</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>Are you sure you want to cancel this leave request?</p>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setCancelModalVisible(false)}>
            No
          </CButton>
          <CButton color="danger" onClick={handleCancelLeave}>
            Yes, Cancel
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default EmployeeDashboard

// {leaveForm.leaveType === 'Emergency' && (
//                   <CRow className="mt-3">
//                     <CCol>
//                       <CFormLabel>Attachments</CFormLabel>
//                       <CFormInput
//                         type="file"
//                         multiple
//                         accept="*/*"
//                         onChange={(e) => {
//                           const files = Array.from(e.target.files || [])
//                           setLeaveForm((prev) => ({
//                             ...prev,
//                             attachments: [...(prev.attachments || []), ...files],
//                           }))
//                         }}
//                       />
//                       <div className="form-text">Upload one or more files (optional)</div>
//                     </CCol>
//                   </CRow>
//                 )}
