import React, { useEffect, useState, useRef } from 'react'
import { useSelector } from 'react-redux'

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
  CFormSelect,
  CFormInput,
  CBadge,
  CPagination,
  CPaginationItem,
  CSpinner,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CRow,
  CCol,
  CFormTextarea,
  CImage,
} from '@coreui/react'
import { useDispatch } from 'react-redux'
import BasicProvider from 'src/constants/BasicProvider'
import './HRLeaveDashboard.css'
import { toast } from 'react-toastify'
import MonthlyLeaveSummary from './MonthlyLeaveSummary'
import LeavePolicyDashboard from './LeavePolicyDashboard'
import LeaveBalanceDashboard from './LeaveBalanceDashboard'

const LeaveAcknowledgment = () => {
  const dispatch = useDispatch()
  const [leaveRequests, setLeaveRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionTaken, setActionTaken] = useState(() => {
    const saved = localStorage.getItem('actionTaken')
    return saved ? JSON.parse(saved) : {}
  })
  const loggedInUser = useSelector((state) => state?.auth?.user || state?.auth?.data || null)
  const loggedInUserId = loggedInUser?._id

  // Filters
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [searchFilter, setSearchFilter] = useState('')

  // Collapsible
  const [showFilters, setShowFilters] = useState(true)

  const fromDateRef = useRef(null)
  const toDateRef = useRef(null)

  // Modal
  const [showDetails, setShowDetails] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [attachmentUrls, setAttachmentUrls] = useState({})

  const [balanceModal, setBalanceModal] = useState(false)
  const [userBalance, setUserBalance] = useState(null)
  const [summary, setSummary] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  })

  const [confirmModalVisible, setConfirmModalVisible] = useState(false)
  const [confirmActionType, setConfirmActionType] = useState(null) // 'Approved' or 'Rejected'
  const [confirmLeaveId, setConfirmLeaveId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  // Edit Leave Modal state
  const [editLeaveModal, setEditLeaveModal] = useState(false)
  const [editLeaveId, setEditLeaveId] = useState(null)
  const [editLeaveType, setEditLeaveType] = useState('')
  const [editRemarks, setEditRemarks] = useState('')
  const [editPenaltyMultiplier, setEditPenaltyMultiplier] = useState(2)

  // Helper: get first & last day of current month
  const getDefaultDates = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()

    const first = new Date(year, month, 1)
    const last = new Date(year, month + 1, 0)

    return {
      start: formatDate(first),
      end: formatDate(last),
    }
  }

  const formatDate = (d) => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const { start, end } = getDefaultDates()

  const [fromDate, setFromDate] = useState(start)
  const [toDate, setToDate] = useState(end)

  useEffect(() => {
    fetchLeaveRequests()
  }, [statusFilter, typeFilter, searchFilter, fromDate, toDate])

  const handleCheckBalance = async (userId) => {
    try {
      const response = await new BasicProvider(`leaves/balance/${userId}`, dispatch).getRequest()
      // console.log(response.data,"response data ----------")
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

  const fetchLeaveRequests = async () => {
    setLoading(true)
    try {
      const queryParams = []
      if (statusFilter) queryParams.push(`status=${statusFilter}`)
      if (typeFilter) queryParams.push(`leaveType=${typeFilter}`)
      if (searchFilter) queryParams.push(`search=${searchFilter}`)
      if (fromDate) queryParams.push(`from=${fromDate}`)
      if (toDate) queryParams.push(`to=${toDate}`)

      const queryString = queryParams.join('&')
      const response = await new BasicProvider(`leaves?${queryString}`, dispatch).getRequest()

      const allowedTypes = ['Penalty', 'Emergency']

      const filtered = response.data.filter((req) => {
        if (!allowedTypes.includes(req.leaveType)) return false

        const actedByUser = req.approvals?.some(
          (a) =>
            a.approver?._id === loggedInUserId &&
            (a.status === 'Approved' || a.status === 'Rejected'),
        )

        return !actedByUser
      })

      setLeaveRequests(filtered)
    } catch (err) {
      console.error('Error fetching leave requests', err)
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
      setLeaveRequests((prev) => prev.filter((leave) => leave._id !== id))

      const response = await new BasicProvider(`leaves/${id}/approve`, dispatch).patchRequest({
        action,
        reason: action === 'Rejected' ? reason : undefined,
      })

      if (response.status === 'success') {
        toast.success(`Leave ${action.toLowerCase()} successfully`)
      } else {
        throw new Error(response.message || `Failed to ${action.toLowerCase()} leave`)
      }
    } catch (err) {
      toast.error(
        err?.message || err.response?.data?.message || `Error while ${action.toLowerCase()} leave`,
      )
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
    setFromDate('')
    setToDate('')
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
      <CCardHeader className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-2">
        <div className="d-flex align-items-center gap-3">
          <h5 className="mb-0">Leave Acknowledgment (HR / Admin)</h5>
        </div>
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
          <CFormSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </CFormSelect>

          <CFormInput
            placeholder="Search employee..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />

          <CFormInput
            type="date"
            ref={fromDateRef}
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            onClick={() => fromDateRef.current?.showPicker?.()}
          />
          <CFormInput
            type="date"
            ref={toDateRef}
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            onClick={() => toDateRef.current?.showPicker?.()}
          />
        </div>
      </CCardBody>
      <CCardBody>
        {loading ? (
          <div className="text-center p-4">
            <CSpinner />
          </div>
        ) : (
          <>
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Employee</CTableHeaderCell>
                  <CTableHeaderCell>Leave Type</CTableHeaderCell>
                  <CTableHeaderCell>Dates</CTableHeaderCell>
                  <CTableHeaderCell>Reason</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {leaveRequests.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan={6} className="text-center">
                      No leave requests found
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  leaveRequests.map((req) => (
                    <CTableRow key={req._id}>
                      <CTableDataCell>{req.user?.name}</CTableDataCell>
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
                      <CTableDataCell>{req.reason}</CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={getStatusBadge(req.status)}>{req.status}</CBadge>
                      </CTableDataCell>
                      <CTableDataCell className="d-flex gap-2 flex-wrap">
                        <CButton size="sm" color="info" onClick={() => openDetails(req)}>
                          View
                        </CButton>

                        <CButton
                          color="success"
                          size="sm"
                          disabled={actionTaken[req._id] === 'Approved'}
                          onClick={() => {
                            setConfirmModalVisible(true)
                            setConfirmActionType('Approved')
                            setConfirmLeaveId(req._id)
                          }}
                        >
                          Approve
                        </CButton>

                        <CButton
                          color="danger"
                          size="sm"
                          disabled={actionTaken[req._id] === 'Rejected'}
                          onClick={() => {
                            setConfirmModalVisible(true)
                            setConfirmActionType('Rejected')
                            setConfirmLeaveId(req._id)
                          }}
                        >
                          Reject
                        </CButton>

                        <CButton
                          size="sm"
                          color="info"
                          onClick={() => handleCheckBalance(req.user?._id)}
                        >
                          Check Balance
                        </CButton>

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
                          Edit Leave
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))
                )}
              </CTableBody>
            </CTable>
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
                <strong>Days:</strong> {selectedRequest.totalDays}
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

      {/* Edit Leave Modal */}
      <CModal visible={editLeaveModal} onClose={() => setEditLeaveModal(false)} size="md">
        <CModalHeader>
          <CModalTitle>Edit Leave</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CRow className="mb-3">
            <CCol>
              <label className="form-label">Leave Type *</label>
              <CFormSelect
                value={editLeaveType}
                onChange={(e) => setEditLeaveType(e.target.value)}
              >
                <option value="">Select Leave Type</option>
                <option value="CL">Casual Leave (CL)</option>
                <option value="UL">Unpaid Leave (UL)</option>
                <option value="Penalty">Penalty Leave</option>
                <option value="Emergency">Emergency Leave</option>
              </CFormSelect>
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
            Submit
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
    </CCard>
  )
}

export default LeaveAcknowledgment
