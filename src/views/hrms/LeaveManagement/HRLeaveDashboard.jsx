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
  CFormInput,
  CBadge,
  CSpinner,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CRow,
  CCol,
  CFormTextarea,
} from '@coreui/react'

import AppFormSelect from 'src/components/form/AppFormSelect'
import AppTableSkeleton from 'src/components/custom/table/AppTableSkeleton'
import { useDispatch } from 'react-redux'
import BasicProvider from 'src/constants/BasicProvider'
import './HRLeaveDashboard.css'
import { toast } from 'react-toastify'
import MonthlyLeaveSummary from './MonthlyLeaveSummary'
import LeavePolicyDashboard from './LeavePolicyDashboard'
import LeaveBalanceDashboard from './LeaveBalanceDashboard'

const HRLeaveDashboard = () => {
  const dispatch = useDispatch()
  const [leaveRequests, setLeaveRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [raBranchMap, setRaBranchMap] = useState({})
  const [actionTaken, setActionTaken] = useState(() => {
    const saved = localStorage.getItem('actionTaken')
    return saved ? JSON.parse(saved) : {}
  })
  // Refund Leave Modal
  const [refundModal, setRefundModal] = useState(false)
  const [refundLeaveId, setRefundLeaveId] = useState(null)
  const [selectedDates, setSelectedDates] = useState([])
  const [pastDateModalVisible, setPastDateModalVisible] = useState(false)
  const [pastDateModalText, setPastDateModalText] = useState('')
  const fromRef = useRef(null)
  const toRef = useRef(null)

  const [refundConfirm, setRefundConfirm] = useState(false)
  const [refundData, setRefundData] = useState([])
  
  // Helper function to get current month's first and last date
  const getCurrentMonthRange = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const formatDate = (date) => {
      const yyyy = date.getFullYear()
      const mm = String(date.getMonth() + 1).padStart(2, '0')
      const dd = String(date.getDate()).padStart(2, '0')
      return `${yyyy}-${mm}-${dd}`
    }
    
    return {
      firstDay: formatDate(firstDay),
      lastDay: formatDate(lastDay)
    }
  }
  
  const currentMonthRange = getCurrentMonthRange()
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [searchFilter, setSearchFilter] = useState('')
  const [raBranchFilter, setRaBranchFilter] = useState('')
  const [fromDate, setFromDate] = useState(currentMonthRange.firstDay)
  const [toDate, setToDate] = useState(currentMonthRange.lastDay)
  const [expandedReasons, setExpandedReasons] = useState({})

  // Collapsible
  const [showFilters, setShowFilters] = useState(true)

  // Modal
  const [showDetails, setShowDetails] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [attachmentUrls, setAttachmentUrls] = useState({})

  const [balanceModal, setBalanceModal] = useState(false)
  const [userBalance, setUserBalance] = useState(null)
  const [allLeaveRequests, setAllLeaveRequests] = useState([]) // Store all leaves for accurate counts

  // Penalty edit state
  const [showPenaltyModal, setShowPenaltyModal] = useState(false)
  const [penaltyMultiplierInput, setPenaltyMultiplierInput] = useState(1)
  const [penaltyLeaveId, setPenaltyLeaveId] = useState(null)

  const [confirmModalVisible, setConfirmModalVisible] = useState(false)
  const [confirmActionType, setConfirmActionType] = useState(null) // 'Approved' or 'Rejected'
  const [confirmLeaveId, setConfirmLeaveId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  // Swap Leave Modal state
  const [editLeaveModal, setEditLeaveModal] = useState(false)
  const [editLeaveId, setEditLeaveId] = useState(null)
  const [editLeaveType, setEditLeaveType] = useState('')
  const [editRemarks, setEditRemarks] = useState('')
  const [editPenaltyMultiplier, setEditPenaltyMultiplier] = useState(2)

  useEffect(() => {
    fetchLeaveRequests()
    fetchAllLeavesForCount() // Fetch all leaves without filters for accurate counts
  }, [statusFilter, typeFilter, searchFilter, fromDate, toDate])

  useEffect(() => {
    const fetchRaBranches = async () => {
      try {
        const response = await new BasicProvider('ra_branch?count=1000', dispatch).getRequest()
        const branches = Array.isArray(response?.data?.data)
          ? response.data.data
          : Array.isArray(response?.data)
            ? response.data
            : []
        const map = {}
        branches.forEach((b) => {
          if (b?._id) map[b._id] = b?.name || b?.label || b?._id
        })
        setRaBranchMap(map)
      } catch (err) {
        console.error('Error fetching MA Branch list', err)
      }
    }
    fetchRaBranches()
  }, [dispatch])

  // Calculate summary counts from allLeaveRequests array
  const summary = useMemo(() => {
    const counts = {
      pending: 0,
      approved: 0,
      rejected: 0,
    }

    allLeaveRequests.forEach((req) => {
      if (req.status === 'Pending') {
        counts.pending++
      } else if (req.status === 'Approved') {
        counts.approved++
      } else if (req.status === 'Rejected') {
        counts.rejected++
      }
    })

    return counts
  }, [allLeaveRequests])

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

  const handleCheckBalance = async (userId) => {
    try {
      const response = await new BasicProvider(`leaves/balance/${userId}`, dispatch).getRequest()
      if (response.status === 'success') {
        setUserBalance(response.data)
        setBalanceModal(true)
      } else {
        toast.error('Failed to fetch balance')
      }
    } catch (err) {
      toast.error(err?.message || 'Error fetching balance')
    }
  }

  // Fetch all leaves without filters for accurate count calculation
  const fetchAllLeavesForCount = async () => {
    try {
      // First try with high per_page limit to get all data in one call
      const response = await new BasicProvider('leaves?per_page=10000', dispatch).getRequest()

      if (response.data && Array.isArray(response.data)) {
        // If we got all data (total matches data length) or if last_page is 1, use it
        if (
          !response.last_page ||
          response.last_page === 1 ||
          response.data.length >= (response.total || 0)
        ) {
          setAllLeaveRequests(response.data)
        } else {
          // Need to fetch more pages
          let allData = [...response.data]
          for (let page = 2; page <= response.last_page; page++) {
            try {
              const pageResponse = await new BasicProvider(
                `leaves?per_page=10000&page=${page}`,
                dispatch,
              ).getRequest()
              if (pageResponse.data && Array.isArray(pageResponse.data)) {
                allData = [...allData, ...pageResponse.data]
              }
            } catch (err) {
              console.error(`Error fetching page ${page}`, err)
              break
            }
          }
          setAllLeaveRequests(allData)
        }
      }
    } catch (err) {
      console.error('Error fetching all leaves for count', err)
      // Fallback: try without pagination params
      try {
        const fallbackResponse = await new BasicProvider('leaves', dispatch).getRequest()
        if (fallbackResponse.data && Array.isArray(fallbackResponse.data)) {
          setAllLeaveRequests(fallbackResponse.data)
        }
      } catch (fallbackErr) {
        console.error('Error in fallback fetch', fallbackErr)
      }
    }
  }

  const fetchLeaveRequests = async () => {
    setLoading(true)
    try {
      const queryParams = []
      if (statusFilter) queryParams.push(`status=${statusFilter}`)
      if (typeFilter) queryParams.push(`leaveType=${typeFilter}`)
      if (searchFilter) queryParams.push(`search=${searchFilter}`)
      if (fromDate) queryParams.push(`from=${fromDate}`)
      if (toDate) queryParams.push(`to=${toDate}`)

      // Add high per_page limit to get all data without pagination
      queryParams.push(`per_page=10000`)

      const queryString = queryParams.join('&')

      // Fetch first page with high limit
      const response = await new BasicProvider(`leaves?${queryString}`, dispatch).getRequest()

      if (response.data && Array.isArray(response.data)) {
        // If we got all data (total matches data length) or if last_page is 1, use it
        if (
          !response.last_page ||
          response.last_page === 1 ||
          response.data.length >= (response.total || 0)
        ) {
          setLeaveRequests(response.data)
        } else {
          // Need to fetch more pages
          let allData = [...response.data]
          for (let page = 2; page <= response.last_page; page++) {
            try {
              const pageQueryParams = [...queryParams, `page=${page}`]
              const pageQueryString = pageQueryParams.join('&')
              const pageResponse = await new BasicProvider(
                `leaves?${pageQueryString}`,
                dispatch,
              ).getRequest()
              if (pageResponse.data && Array.isArray(pageResponse.data)) {
                allData = [...allData, ...pageResponse.data]
              }
            } catch (err) {
              console.error(`Error fetching page ${page}`, err)
              break
            }
          }
          setLeaveRequests(allData)
        }
      } else {
        setLeaveRequests([])
      }
    } catch (err) {
      console.error('Error fetching leave requests', err)
      setLeaveRequests([])
    }
    setLoading(false)
  }
  useEffect(() => {
    localStorage.setItem('actionTaken', JSON.stringify(actionTaken))
  }, [actionTaken])
  const handleApproval = async (id, action, reason = '') => {
    setActionTaken((prev) => ({ ...prev, [id]: action }))
    if (action === 'Rejected' && !rejectReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }

    try {
      const response = await new BasicProvider(`leaves/${id}/approve`, dispatch).patchRequest({
        action,
        reason: action === 'Rejected' ? reason : undefined,
      })

      if (response.status === 'success') {
        toast.success(`Leave ${action.toLowerCase()} successfully`)
        fetchLeaveRequests()
        fetchAllLeavesForCount() // refresh summary counts
      } else {
        throw new Error(response.message || `Failed to ${action.toLowerCase()} leave`)
      }
    } catch (err) {
      toast.error(
        err?.message || err.response?.data?.message || `Error while ${action.toLowerCase()} leave`,
      )
    }
  }

  const handleUpdatePenalty = async () => {
    if (!penaltyLeaveId) return
    try {
      const response = await new BasicProvider(
        `leaves/${penaltyLeaveId}/penalty`,
        dispatch,
      ).patchRequest({ penaltyMultiplier: Number(penaltyMultiplierInput) })

      if (response.status === 'success') {
        toast.success('Penalty multiplier updated successfully')
        setShowPenaltyModal(false)
        setPenaltyLeaveId(null)
        fetchLeaveRequests() // refresh list
      } else {
        throw new Error(response.message || 'Failed to update penalty')
      }
    } catch (err) {
      toast.error(err?.message || 'Error updating penalty')
    }
  }

  const handleEditLeave = async () => {
    if (!editLeaveId || !editLeaveType) {
      toast.error('Please select a leave type')
      return
    }

    try {
      const payload = {
        newType: editLeaveType,
        remarks: editRemarks,
      }

      // Add penalty multiplier only if Penalty is selected
      if (editLeaveType === 'Penalty') {
        payload.penaltyMultiplier = Number(editPenaltyMultiplier)
      }

      const response = await new BasicProvider(
        `leaves/${editLeaveId}/override`,
        dispatch,
      ).patchRequest(payload)

      if (response.status === 'success') {
        toast.success('Leave overridden successfully')
        setEditLeaveModal(false)
        setEditLeaveId(null)
        setEditLeaveType('')
        setEditRemarks('')
        setEditPenaltyMultiplier(2)
        fetchLeaveRequests()
        fetchAllLeavesForCount()
      } else {
        throw new Error(response.message || 'Failed to override leave')
      }
    } catch (err) {
      toast.error(err?.message || 'Error overriding leave')
    }
  }

  const openDetails = (req) => {
    setSelectedRequest(req)
    setAttachmentUrls({})
    if (req?.attachments && req.attachments.length > 0) {
      loadAttachmentUrls(req.attachments)
    }
    setShowDetails(true)
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

  const getStatusBadge = (status) => {
    if (status === 'Approved') return 'success'
    if (status === 'Rejected') return 'danger'
    return 'warning'
  }

  const resetFilters = () => {
    setStatusFilter('')
    setTypeFilter('')
    setSearchFilter('')
    setRaBranchFilter('')
    const monthRange = getCurrentMonthRange()
    setFromDate(monthRange.firstDay)
    setToDate(monthRange.lastDay)
  }

  const getRaBranchLabel = (req) => {
    const branch = req?.user?.ra_branch ?? req?.user?.profile?.ra_branch ?? req?.ra_branch
    if (Array.isArray(branch)) {
      return branch
        .map((b) => {
          if (typeof b === 'object') return b?.name || b?.label || b?.value || b?._id
          return raBranchMap[b] || b
        })
        .filter(Boolean)
        .join(', ')
    }
    if (branch && typeof branch === 'object') {
      return branch?.name || branch?.label || branch?.value || raBranchMap[branch?._id] || '-'
    }
    return raBranchMap[branch] || branch || '-'
  }

  const raBranchOptions = Array.from(
    new Set(
      leaveRequests
        .map((req) => getRaBranchLabel(req))
        .filter((b) => b && b !== '-'),
    ),
  ).sort((a, b) => a.localeCompare(b))

  const filteredLeaveRequests = leaveRequests.filter((req) => {
    if (!raBranchFilter) return true
    return getRaBranchLabel(req) === raBranchFilter
  })

  const getLeaveDates = (req) => {
    const start = new Date(req.start_date)
    const end = new Date(req.end_date)

    const dates = []
    while (start <= end) {
      dates.push(new Date(start).toISOString().split('T')[0])
      start.setDate(start.getDate() + 1)
    }
    return dates
  }

  const isPastISODate = (iso) => {
    if (!iso) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const d = new Date(`${iso}T00:00:00`)
    return d < today
  }

  const handleRefundLeave = async () => {
    try {
      const response = await new BasicProvider(
        `leaves/${refundLeaveId}/mark-present`,
        dispatch,
      ).patchRequest({
        dates: selectedDates,
      })

      if (response.status === 'success') {
        toast.success('Leave adjusted successfully')
        setRefundData(response)
        setRefundModal(false)
        setRefundConfirm(false)
        setSelectedDates([])
        setPastDateModalVisible(false)
        setPastDateModalText('')
        fetchLeaveRequests()
        fetchAllLeavesForCount()
      } else {
        toast.error(response.message || 'Refund failed')
      }
    } catch (err) {
      toast.error(err?.message || 'Error adjusting leave')
    } finally {
      setPastDateModalVisible(false)
      setPastDateModalText('')
    }
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

  return (
    <CCard className="m-3 ">
      <CCardBody className="p-3">
        <div className="leave-summary d-flex flex-wrap gap-3 mb-3">
          <div
            style={{ cursor: 'pointer' }}
            onClick={() => setStatusFilter('Pending')}
            className="summary-card bg-warning text-white"
          >
            <h6>Pending</h6>
            <h3>{summary.pending}</h3>
          </div>
          <div
            style={{ cursor: 'pointer' }}
            onClick={() => setStatusFilter('Approved')}
            className="summary-card bg-success text-white"
          >
            <h6>Approved</h6>
            <h3>{summary.approved}</h3>
          </div>
          <div
            style={{ cursor: 'pointer' }}
            onClick={() => setStatusFilter('Rejected')}
            className="summary-card bg-danger text-white"
          >
            <h6>Rejected</h6>
            <h3>{summary.rejected}</h3>
          </div>
        </div>
      </CCardBody>
      <CCardHeader className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-2">
        <h5 className="mb-2 mb-md-0">Leave Management (HR / Admin)</h5>
        <div className="d-flex gap-2 flex-wrap">
          <CButton size="sm" color="primary" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </CButton>
          <CButton size="sm" color="secondary" onClick={resetFilters}>
            Reset Filters
          </CButton>
        </div>
      </CCardHeader>
      <CCardBody className={`filter-container ${showFilters ? 'expanded' : 'collapsed'}`}>
        <div className="filter-grid sticky-filters">
          <AppFormSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </AppFormSelect>

          <AppFormSelect value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            <option value="CL">Casual Leave</option>
            <option value="UL">Unpaid Leave</option>
            <option value="Emergency">Emergency Leave</option>
            <option value="Penalty">Penalty Leave</option>
          </AppFormSelect>

          <CFormInput
            placeholder="Search employee..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />

          <AppFormSelect value={raBranchFilter} onChange={(e) => setRaBranchFilter(e.target.value)}>
            <option value="">All MA Branch</option>
            {raBranchOptions.map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </AppFormSelect>
 
          <div onClick={() => fromRef.current.showPicker()}>
            <CFormInput
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              ref={fromRef}
            />
          </div>

          <div onClick={() => toRef.current.showPicker()}>
            <CFormInput
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              ref={toRef}
            />
          </div>
        </div>
      </CCardBody>
      <CCardBody>
        {loading ? (
          <AppTableSkeleton ariaLabel="Loading HR leave dashboard" rows={8} />
        ) : (
          <>
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Employee</CTableHeaderCell>
                  <CTableHeaderCell>MA Branch</CTableHeaderCell>
                  <CTableHeaderCell>Leave Type</CTableHeaderCell>
                  <CTableHeaderCell>Dates</CTableHeaderCell>
                  <CTableHeaderCell>Reason</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredLeaveRequests.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan={7} className="text-center">
                      No leave requests found
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  filteredLeaveRequests.map((req) => (
                    <CTableRow key={req._id} className="align-middle">
                      <CTableDataCell>{req.user?.name}</CTableDataCell>
                      <CTableDataCell>{getRaBranchLabel(req)}</CTableDataCell>
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
                        {new Date(req.start_date).toLocaleDateString()} -{' '}
                        {new Date(req.end_date).toLocaleDateString()}
                      </CTableDataCell>
                      <CTableDataCell style={{ minWidth: 220 }}>{renderReasonCell(req)}</CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={getStatusBadge(req.status)}>{req.status}</CBadge>
                      </CTableDataCell>
                      <CTableDataCell className="d-flex gap-2 flex-wrap">
                        <CButton size="sm" color="info" onClick={() => openDetails(req)}>
                          View
                        </CButton>

                        <CButton
                          size="sm"
                          color="info"
                          onClick={() => handleCheckBalance(req.user?._id)}
                        >
                          Check Balance
                        </CButton>

                        {req.status === 'Approved' && (
                          <CButton
                            size="sm"
                            color="secondary"
                            onClick={() => {
                              setEditLeaveId(req._id)
                              setEditLeaveType(req.leaveType || '')
                              setEditRemarks('')
                              setEditPenaltyMultiplier(req.penaltyMultiplier || 2)
                              setEditLeaveModal(true)
                            }}
                          >
                            Swap Leave
                          </CButton>
                        )}

                        {req.leaveType === 'Penalty' && req.status !== 'Approved' && req.status !== 'Rejected' && (
                          <CButton
                            size="sm"
                            color="warning"
                            onClick={() => {
                              setPenaltyLeaveId(req._id)
                              setPenaltyMultiplierInput(req.penaltyMultiplier || 1)
                              setShowPenaltyModal(true)
                            }}
                          >
                            Edit Penalty
                          </CButton>
                        )}

                        {/* {req.status === 'Approved' && (
                          <CButton
                            size="sm"
                            color="warning"
                            onClick={() => {
                              setRefundLeaveId(req._id)
                              setSelectedDates([])
                              setRefundModal(true)
                              setSelectedRequest(req) // so we know the leave date range
                            }}
                          >
                            Refund / Adjust
                          </CButton>
                        )} */}
                        {['Approved', 'PartiallyAdjusted'].includes(req.status) && (
                          <CButton
                            size="sm"
                            color="warning"
                            onClick={() => {
                              setRefundLeaveId(req._id)
                              // Pre-select already refunded dates if they exist
                              setSelectedDates(req.refundedDates && Array.isArray(req.refundedDates) ? [...req.refundedDates] : [])
                              setRefundModal(true)
                              setSelectedRequest(req)
                            }}
                          >
                            Refund / Adjust
                          </CButton>
                        )}
                      </CTableDataCell>
                    </CTableRow>
                  ))
                )}
              </CTableBody>
            </CTable>

            {/* Pagination */}
            {/* <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
              <small>
                Showing page {page} of {lastPage} ({totalRecords} records)
              </small>
              <CPagination align="end">
                {[...Array(lastPage)].map((_, i) => (
                  <CPaginationItem
                    key={i + 1}
                    active={i + 1 === page}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </CPaginationItem>
                ))}
              </CPagination>
            </div> */}
          </>
        )}
      </CCardBody>

      {/* Leave Details Modal */}
      <CModal visible={showDetails} onClose={() => setShowDetails(false)} size="lg">
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
                <strong>Total Days:</strong> {selectedRequest.totalDays}
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
                      <CTableHeaderCell>Updated By</CTableHeaderCell>
                      <CTableHeaderCell>Date</CTableHeaderCell>
                      <CTableHeaderCell>Remarks</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {selectedRequest.refundHistory.map((h, idx) => {
                      const user = h.by

                      return (
                        <CTableRow key={idx}>
                          <CTableDataCell>
                            {user?.name || 'Unknown'} <br />
                            <small>{user?.email || 'N/A'}</small>
                          </CTableDataCell>

                          <CTableDataCell>{new Date(h.date).toLocaleString()}</CTableDataCell>

                          <CTableDataCell>{h.remarks}</CTableDataCell>
                        </CTableRow>
                      )
                    })}
                  </CTableBody>
                </CTable>
              ) : (
                <p>No refund history.</p>
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
          <CButton color="secondary" onClick={() => setShowDetails(false)}>
            Close
          </CButton>
          {selectedRequest && (
            <>
              <CButton
                color="success"
                size="sm"
                disabled={actionTaken[selectedRequest._id] === 'Approved'}
                onClick={() => {
                  setConfirmModalVisible(true)
                  setConfirmActionType('Approved')
                  setConfirmLeaveId(selectedRequest._id)
                  setShowDetails(false)
                }}
              >
                Approve
              </CButton>
              <CButton
                color="danger"
                size="sm"
                disabled={actionTaken[selectedRequest._id] === 'Rejected'}
                onClick={() => {
                  setConfirmModalVisible(true)
                  setConfirmActionType('Rejected')
                  setConfirmLeaveId(selectedRequest._id)
                  setShowDetails(false)
                }}
              >
                Reject
              </CButton>
            </>
          )}
        </CModalFooter>
      </CModal>

      {/* User Balance Modal */}
      <CModal visible={balanceModal} onClose={() => setBalanceModal(false)} size="md">
        <CModalHeader>
          <CModalTitle>Leave Balance</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {userBalance ? (
            <CRow className="gap-2">
              <CCol xs={12}>
                <strong>CL Balance:</strong> {userBalance.clBalance}
              </CCol>
              <CCol xs={12}>
                <strong>CL Used:</strong> {userBalance.clUsed}
              </CCol>
              <CCol xs={12}>
                <strong>UL Balance:</strong> {userBalance.ulBalance}
              </CCol>
              <CCol xs={12}>
                <strong>UL Used:</strong> {userBalance.ulUsed}
              </CCol>
              <CCol xs={12}>
                <strong>Penalty:</strong> {userBalance.penaltyBucket}
              </CCol>
            </CRow>
          ) : (
            <p>No balance data found.</p>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setBalanceModal(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Penalty Edit Modal */}
      <CModal visible={showPenaltyModal} onClose={() => setShowPenaltyModal(false)} size="sm">
        <CModalHeader>
          <CModalTitle>Edit Penalty Multiplier</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormInput
            type="number"
            min="1"
            value={penaltyMultiplierInput}
            onChange={(e) => setPenaltyMultiplierInput(e.target.value)}
          />
          <small className="text-muted">
            Tip: 1 = normal | 2 = Double | 3 = Triple | 4+ = Multiple times deduction
          </small>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowPenaltyModal(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleUpdatePenalty}>
            Save
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Confirm Approve/Reject Modal */}
      <CModal
        visible={confirmModalVisible}
        onClose={() => setConfirmModalVisible(false)}
        alignment="center"
        size="sm"
      >
        <CModalHeader>
          <CModalTitle>
            {confirmActionType === 'Approved' ? 'Confirm Approval' : 'Confirm Rejection'}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {confirmActionType === 'Rejected' ? (
            <>
              <p>
                Please provide a reason for <strong>rejection</strong>:
              </p>
              <CFormTextarea
                rows={3}
                placeholder="Enter rejection reason..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </>
          ) : (
            <p>
              Are you sure you want to <strong>approve</strong> this leave request?
            </p>
          )}
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" onClick={() => setConfirmModalVisible(false)}>
            Cancel
          </CButton>
          <CButton
            color={confirmActionType === 'Approved' ? 'success' : 'danger'}
            disabled={confirmActionType === 'Rejected' && !rejectReason.trim()}
            onClick={() => {
              handleApproval(confirmLeaveId, confirmActionType, rejectReason)
              setConfirmModalVisible(false)
              setRejectReason('') // clear after submit
            }}
          >
            Yes, {confirmActionType}
          </CButton>
        </CModalFooter>
      </CModal>
      <CModal visible={refundModal} onClose={() => setRefundModal(false)} size="md">
        <CModalHeader>
          <CModalTitle>Adjust / Refund Leave</CModalTitle>
        </CModalHeader>

        <CModalBody>
          {selectedRequest && (
            <>
              <p>
                <strong>Leave Range:</strong>
                {new Date(selectedRequest.start_date).toLocaleDateString()} -{' '}
                {new Date(selectedRequest.end_date).toLocaleDateString()}
              </p>

              <h6>Select dates to refund:</h6>
              {/* Calendar-like date grid */}
              <div className="d-flex flex-wrap gap-2">
                {getLeaveDates(selectedRequest).map((date) => {
                  const isSelected = selectedDates.includes(date)
                  const isPast = isPastISODate(date)
                  const pastMsg =
                    "This date has already passed, so it can't be adjusted or refunded."

                  const chip = (
                    <div
                      key={date}
                      onMouseEnter={() => {
                        if (!isPast) return
                        setPastDateModalText(pastMsg)
                        setPastDateModalVisible((prev) => prev || true)
                      }}
                      onMouseLeave={() => {
                        // Do not auto-close modal on hover leave.
                        // Modal closes only via OK / close button to avoid flicker.
                      }}
                      onClick={() => {
                        if (isPast) return
                        if (isSelected) {
                          setSelectedDates(selectedDates.filter((d) => d !== date))
                        } else {
                          setSelectedDates([...selectedDates, date])
                        }
                      }}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        cursor: isPast ? 'not-allowed' : 'pointer',
                        background: isSelected ? '#0d6efd' : isPast ? '#f1f3f5' : '#f8f9fa',
                        color: isSelected ? '#fff' : isPast ? '#6c757d' : '#212529',
                        border: isSelected ? '1px solid #0d6efd' : '1px solid #dee2e6',
                        opacity: isPast ? 0.8 : 1,
                        boxShadow: isSelected ? '0 2px 10px rgba(13,110,253,0.25)' : 'none',
                        userSelect: 'none',
                      }}
                    >
                      {date}
                    </div>
                  )

                  return chip
                })}
              </div>

              {selectedDates.length > 0 && (
                <p className="mt-3">
                  <strong>Selected:</strong> {selectedDates.join(', ')}
                </p>
              )}
            </>
          )}
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" onClick={() => setRefundModal(false)}>
            Cancel
          </CButton>

          <CButton
            color="primary"
            disabled={selectedDates.length === 0}
            onClick={() => {
              setRefundModal(false)
              setRefundConfirm(true)
              setPastDateModalVisible(false)
              setPastDateModalText('')
            }}
          >
            Submit
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Past Date Info Modal */}
      <CModal
        alignment="center"
        visible={pastDateModalVisible}
        onClose={() => {
          setPastDateModalVisible(false)
          setPastDateModalText('')
        }}
        size="sm"
      >
        <CModalHeader>
          <CModalTitle>Not allowed</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div
            style={{
              background: '#f8f9fa',
              border: '1px solid #e9ecef',
              padding: '12px 14px',
              borderRadius: '12px',
              color: '#212529',
              lineHeight: 1.4,
            }}
          >
            {pastDateModalText || "This date has already passed, so it can't be adjusted or refunded."}
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            variant="outline"
            onClick={() => {
              setPastDateModalVisible(false)
              setPastDateModalText('')
            }}
          >
            OK
          </CButton>
        </CModalFooter>
      </CModal>
      <CModal visible={refundConfirm} onClose={() => setRefundConfirm(false)} alignment="center">
        <CModalHeader>
          <CModalTitle>Confirm Refund</CModalTitle>
        </CModalHeader>

        <CModalBody>
          <p>Are you sure you want to refund these dates?</p>

          <p>
            <strong>{selectedDates.join(', ')}</strong>
          </p>
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" onClick={() => setRefundConfirm(false)}>
            Cancel
          </CButton>
          <CButton color="success" onClick={() => handleRefundLeave()}>
            Yes, Confirm
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Swap Leave Modal */}
      <CModal visible={editLeaveModal} onClose={() => setEditLeaveModal(false)} size="md">
        <CModalHeader>
          <CModalTitle>Swap Leave</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CRow className="mb-3">
            <CCol>
              <label className="form-label">Leave Type *</label>
              <AppFormSelect value={editLeaveType} onChange={(e) => setEditLeaveType(e.target.value)}>
                <option value="">Select Leave Type</option>
                <option value="CL">Casual Leave (CL)</option>
                <option value="UL">Unpaid Leave (UL)</option>
                <option value="Penalty">Penalty Leave</option>
                <option value="Emergency">Emergency Leave</option>
              </AppFormSelect>
            </CCol>
          </CRow>

          {editLeaveType === 'Penalty' && (
            <CRow className="mb-3">
              <CCol>
                <label className="form-label">Penalty Multiplier *</label>
                <CFormInput
                  type="number"
                  min="1"
                  value={editPenaltyMultiplier}
                  onChange={(e) => setEditPenaltyMultiplier(e.target.value)}
                  placeholder="Enter penalty multiplier (e.g., 2 for double deduction)"
                />
                <small className="text-muted">
                  Tip: 1 = normal | 2 = Double | 3 = Triple | 4+ = Multiple times deduction
                </small>
              </CCol>
            </CRow>
          )}

          <CRow className="mb-3">
            <CCol>
              <label className="form-label">Remarks</label>
              <CFormTextarea
                rows={4}
                value={editRemarks}
                onChange={(e) => setEditRemarks(e.target.value)}
                placeholder="Enter remarks (optional)"
              />
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setEditLeaveModal(false)}>
            Cancel
          </CButton>
          <CButton
            color="primary"
            onClick={handleEditLeave}
            disabled={!editLeaveType || (editLeaveType === 'Penalty' && !editPenaltyMultiplier)}
          >
            Approve and Submit
          </CButton>
        </CModalFooter>
      </CModal>

      <LeaveBalanceDashboard />
      <LeavePolicyDashboard />
    </CCard>
  )
}

export default HRLeaveDashboard
