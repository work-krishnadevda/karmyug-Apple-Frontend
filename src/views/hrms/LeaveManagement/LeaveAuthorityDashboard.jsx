import React, { useEffect, useState } from 'react'
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
} from '@coreui/react'

import AppFormSelect from 'src/components/form/AppFormSelect'
import AppTableSkeleton from 'src/components/custom/table/AppTableSkeleton'
import { useDispatch, useSelector } from 'react-redux'
import BasicProvider from 'src/constants/BasicProvider'
import './HRLeaveDashboard.css'
import { toast } from 'react-toastify'
import MonthlyLeaveSummary from './MonthlyLeaveSummary'
import LeavePolicyDashboard from './LeavePolicyDashboard'
import LeaveBalanceDashboard from './LeaveBalanceDashboard'

const getCurrentMonthRange = () => {
  const now = new Date()

  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const formatLocalDate = (date) => {
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  return {
    from: formatLocalDate(firstDay),
    to: formatLocalDate(lastDay),
  }
}


const LeaveAuthorityDashboard = () => {
  const dispatch = useDispatch()
  const userData = useSelector((state) => state.userData)
  const [leaveRequests, setLeaveRequests] = useState([])
  const [loading, setLoading] = useState(true)
const [attachmentUrls, setAttachmentUrls] = useState({})
  // Filters
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [searchFilter, setSearchFilter] = useState('')
const { from, to } = getCurrentMonthRange()

const [fromDate, setFromDate] = useState(from)
const [toDate, setToDate] = useState(to)

  // Collapsible
  const [showFilters, setShowFilters] = useState(true)

  // Pagination
  const [page, setPage] = useState(1)
  const [perPage] = useState(10)
  const [lastPage, setLastPage] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)

  // Modal
  const [showDetails, setShowDetails] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)

  const [balanceModal, setBalanceModal] = useState(false)
  const [userBalance, setUserBalance] = useState(null)
  const [summary, setSummary] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  })

  // Penalty edit state
  const [showPenaltyModal, setShowPenaltyModal] = useState(false)
  const [penaltyMultiplierInput, setPenaltyMultiplierInput] = useState(1)
  const [penaltyLeaveId, setPenaltyLeaveId] = useState(null)

  const [confirmModalVisible, setConfirmModalVisible] = useState(false)
  const [confirmActionType, setConfirmActionType] = useState(null) // 'Approved' or 'Rejected'
  const [confirmLeaveId, setConfirmLeaveId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    fetchLeaveRequests()
    fetchLeaveSummary()
  }, [statusFilter, typeFilter, searchFilter, fromDate, toDate, page])

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

  const fetchLeaveSummary = async () => {
    try {
      const response = await new BasicProvider('leaves/summary', dispatch).getRequest()
      const summaryData = response.data || {}

      setSummary({
        pending: summaryData.pending || 0,
        approved: summaryData.approved || 0,
        rejected: summaryData.rejected || 0,
      })
    } catch (err) {
      console.error('Error fetching leave summary', err)
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
      queryParams.push(`page=${page}`)
      queryParams.push(`count=${perPage}`)

      const queryString = queryParams.join('&')
      const response = await new BasicProvider(`leaves/reporting?${queryString}`, dispatch).getRequest()

      setLeaveRequests(response.data)
      setPage(response.current_page)
      setLastPage(response.last_page)
      setTotalRecords(response.total)
    } catch (err) {
      console.error('Error fetching leave requests', err)
    }
    setLoading(false)
  }


  const fetchAttachmentSignedUrl = async (fileId) => {
  try {
    const response = await new BasicProvider(
      `cms/files/show-file-with-signed-url/${fileId}`,
      dispatch
    ).getRequest()

    return response.data || null
  } catch (error) {
    console.error("Error fetching signed URL:", error)
    toast.error("Failed to load attachment")
    return null
  }
}

  const handleApproval = async (id, action, reason = '') => {
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
        fetchLeaveSummary() // refresh summary
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

  const openDetails = (req) => {
    setSelectedRequest(req)
     setAttachmentUrls({}) // reset URLs
    if (req.attachments && req.attachments.length > 0) {
      loadAttachmentUrls(req.attachments)
    }
    setShowDetails(true)
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
  const { from, to } = getCurrentMonthRange()
  setStatusFilter('')
  setTypeFilter('')
  setSearchFilter('')
  setFromDate(from)
  setToDate(to)
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
        <h5 className="mb-2 mb-md-0">Leave Authority Management</h5>
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

          <CFormInput type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          <CFormInput type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </div>
      </CCardBody>
      <CCardBody>
        {loading ? (
          <AppTableSkeleton ariaLabel="Loading leave authority requests" rows={8} />
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
                          disabled={
                            req.status !== 'Pending' ||
                            (req.approvals &&
                              req.approvals.some(
                                (a) =>
                                  a.status === 'Approved' &&
                                  (a.approver?._id === userData?._id ||
                                    a.approver?.email === userData?.email ||
                                    a.approver?.name === userData?.name),
                              ))
                          }
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
                          disabled={req.status !== 'Pending'}
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

                        {req.leaveType === 'Penalty' && req.status !== 'Approved' && (
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
                      </CTableDataCell>
                    </CTableRow>
                  ))
                )}
              </CTableBody>
            </CTable>

            {/* Pagination */}
            <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
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
            </div>
          </>
        )}
      </CCardBody>
      {/* Details Modal */}
      {/* <CModal size="lg" visible={showDetails} onClose={() => setShowDetails(false)}>
        <CModalHeader>
          <CModalTitle>Leave Request Details</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedRequest && (
            <>
              <h6>Employee Info</h6>
              <p>
                <b>Name:</b> {selectedRequest.user?.name}
              </p>
              <p>
                <b>Email:</b> {selectedRequest.user?.email}
              </p>

              <hr />

              <h6>Leave Info</h6>
              <p>
                <b>Type:</b> {selectedRequest.leaveType}
              </p>
              <p>
                <b>From:</b> {new Date(selectedRequest.start_date).toLocaleDateString()}
              </p>
              <p>
                <b>To:</b> {new Date(selectedRequest.end_date).toLocaleDateString()}
              </p>
              <p>
                <b>Days:</b>{' '}
                {Math.ceil(
                  (new Date(selectedRequest.end_date).getTime() -
                    new Date(selectedRequest.start_date).getTime()) /
                    (1000 * 60 * 60 * 24),
                ) + 1}
              </p>
              <p>
                <b>Reason:</b> {selectedRequest.reason}
              </p>

              {selectedRequest.attachments?.length > 0 && (
                <>
                  <h6>Attachments</h6>
                  {selectedRequest.attachments.map((file, i) => (
                    <div key={i}>
                      <a href={file} target="_blank" rel="noreferrer">
                        Attachment {i + 1}
                      </a>
                    </div>
                  ))}
                </>
              )}

              <hr />

              <h6>Approval History</h6>
              {selectedRequest.approvals?.length > 0 ? (
                selectedRequest.approvals.map((ap, i) => (
                  <div key={i} className="d-flex justify-content-between flex-wrap gap-2">
                    <span>{ap.approver?.name || 'Unknown'}</span>
                    <CBadge color={getStatusBadge(ap.status)}>{ap.status}</CBadge>
                    <span>{new Date(ap.date).toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <p>No approvals yet.</p>
              )}
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowDetails(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal> */}
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
      {/* // Balance Modal */}
      {/* <CModal visible={balanceModal} onClose={() => setBalanceModal(false)} size="md">
        <CModalHeader>
          <CModalTitle>Leave Balance</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {userBalance && (
            <>
              <p>
                <strong>CL Balance:</strong> {userBalance.clBalance}
              </p>
              <p>
                <strong>Used Leaves (UL):</strong> {userBalance.ulBalance}
              </p>
              <p>
                <strong>Penalty:</strong> {userBalance.penaltyBucket}
              </p>
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setBalanceModal(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal> */}
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
                <strong>UL Balance:</strong> {userBalance.ulBalance}
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

      {/* <LeaveBalanceDashboard /> */}
      {/* <LeavePolicyDashboard /> */}
    </CCard>
  )
}

export default LeaveAuthorityDashboard
