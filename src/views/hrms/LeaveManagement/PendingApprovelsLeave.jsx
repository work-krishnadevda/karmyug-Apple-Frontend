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
} from '@coreui/react'

import AppFormSelect from 'src/components/form/AppFormSelect'
import AppTableSkeleton from 'src/components/custom/table/AppTableSkeleton'
import { useDispatch } from 'react-redux'
import BasicProvider from 'src/constants/BasicProvider'
import './HRLeaveDashboard.css'
import { toast } from 'react-toastify'
import MonthlyLeaveSummary from './MonthlyLeaveSummary'
import moment from 'moment'

const PendinApprovelsLeave = () => {
  const dispatch = useDispatch()
  const [leaveRequests, setLeaveRequests] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [searchFilter, setSearchFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

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
  const [confirmRejectVisible, setConfirmRejectVisible] = useState(false)
  const [confirmRejectLeaveId, setConfirmRejectLeaveId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  const [balanceModal, setBalanceModal] = useState(false)
  const [userBalance, setUserBalance] = useState(null)
  const [summary, setSummary] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  })
  useEffect(() => {
    fetchLeaveRequests()
    fetchLeaveSummary()
  }, [statusFilter, typeFilter, searchFilter, fromDate, toDate, page])
  function getCookie(name) {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop().split(';').shift()
    return null
  }

  const authorityId = getCookie('primery_user_id')
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
    if (!authorityId) return

    try {
      const response = await new BasicProvider(
        `leaves/pending-authority/user/${authorityId}`,
        dispatch,
      ).getRequest()

      const leaves = response.data || []

      // Count summary based on status
      const summaryData = leaves.reduce(
        (acc, leave) => {
          const status = leave.status?.toLowerCase()
          if (status === 'pending') acc.pending += 1
          else if (status === 'approved') acc.approved += 1
          else if (status === 'rejected') acc.rejected += 1
          return acc
        },
        { pending: 0, approved: 0, rejected: 0 },
      )

      setSummary(summaryData)
    } catch (err) {
      console.error('Error fetching leave summary', err)
    }
  }

  const fetchLeaveRequests = async () => {
    if (!authorityId) return

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

      // const response = await new BasicProvider(
      //   `leaves/pending-authority/user/${authorityId}?${queryString}`,
      //   dispatch,
      // ).getRequest()
      const response = await new BasicProvider(
        `leaves/pending-authority?${queryString}`,
        dispatch,
      ).getRequest()

      setLeaveRequests(response.data)
      setPage(response.current_page)
      setLastPage(response.last_page)
      setTotalRecords(response.total)
    } catch (err) {
      console.error('Error fetching leave requests', err)
    }
    setLoading(false)
  }
  //   const fetchLeaveRequests = async () => {
  //     setLoading(true)
  //     try {
  //       const queryParams = []
  //       if (statusFilter) queryParams.push(`status=${statusFilter}`)
  //       if (typeFilter) queryParams.push(`leaveType=${typeFilter}`)
  //       if (searchFilter) queryParams.push(`search=${searchFilter}`)
  //       if (fromDate) queryParams.push(`from=${fromDate}`)
  //       if (toDate) queryParams.push(`to=${toDate}`)
  //       queryParams.push(`page=${page}`)
  //       queryParams.push(`count=${perPage}`)

  //       const queryString = queryParams.join('&')
  //       const response = await new BasicProvider(`leaves?${queryString}`, dispatch).getRequest()

  //       setLeaveRequests(response.data)
  //       setPage(response.current_page)
  //       setLastPage(response.last_page)
  //       setTotalRecords(response.total)
  //     } catch (err) {
  //       console.error('Error fetching leave requests', err)
  //     }
  //     setLoading(false)
  //   }

  const handleApproval = async (id, action) => {
    try {
      if (action === 'Rejected' && !rejectReason.trim()) {
        toast.error('Please provide a rejection reason')
        return
      }
      const response = await new BasicProvider(`leaves/${id}/approve`, dispatch).patchRequest({
        action,
        reason: action === 'Rejected' ? rejectReason.trim() : undefined,
      })

      if (response.status === 'success') {
        toast.success(`Leave ${action.toLowerCase()} successfully`)
        fetchLeaveRequests()
        fetchLeaveSummary() // refresh summary
        setConfirmRejectVisible(false)
        setConfirmRejectLeaveId(null)
        setRejectReason('')
      } else {
        throw new Error(response.message || `Failed to ${action.toLowerCase()} leave`)
      }
    } catch (err) {
      toast.error(
        err?.message || err.response?.data?.message || `Error while ${action.toLowerCase()} leave`,
      )
    }
  }

  const openRejectModal = (leaveId) => {
    setConfirmRejectLeaveId(leaveId)
    setRejectReason('')
    setConfirmRejectVisible(true)
  }

  const openDetails = (req) => {
    setSelectedRequest(req)
    setShowDetails(true)
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

  const formatDateDMY = (value) => {
    if (!value) return '-'
    const m = moment(value)
    return m.isValid() ? m.format('DD-MM-YYYY') : '-'
  }

  const formatDateTimeDMY = (value) => {
    if (!value) return '-'
    const m = moment(value)
    return m.isValid() ? m.format('DD-MM-YYYY hh:mm A') : '-'
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
        <h5 className="mb-2 mb-md-0">Leave Management for leave Authority</h5>
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
          <AppTableSkeleton ariaLabel="Loading pending leave approvals" rows={7} />
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
                      <CTableDataCell>{req.leaveType}</CTableDataCell>
                      <CTableDataCell>
                        {formatDateDMY(req.start_date)} - {formatDateDMY(req.end_date)}
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
                          onClick={() => handleApproval(req._id, 'Approved')}
                          disabled={req.status !== 'Pending'}
                        >
                          Approve
                        </CButton>
                        <CButton
                          color="danger"
                          size="sm"
                          onClick={() => openRejectModal(req._id)}
                          disabled={req.status !== 'Pending'}
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

      {/* Reject Reason Modal */}
      <CModal
        visible={confirmRejectVisible}
        onClose={() => setConfirmRejectVisible(false)}
        alignment="center"
        size="sm"
      >
        <CModalHeader>
          <CModalTitle>Reject Leave</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p className="mb-2">
            Please provide a reason for <strong>rejection</strong>:
          </p>
          <CFormInput
            type="text"
            placeholder="Enter rejection reason..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setConfirmRejectVisible(false)}>
            Cancel
          </CButton>
          <CButton
            color="danger"
            disabled={!rejectReason.trim() || !confirmRejectLeaveId}
            onClick={() => handleApproval(confirmRejectLeaveId, 'Rejected')}
          >
            Reject
          </CButton>
        </CModalFooter>
      </CModal>

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
              </p>
              <p>
                <strong>From:</strong> {formatDateDMY(selectedRequest.start_date)}
              </p>
              <p>
                <strong>To:</strong> {formatDateDMY(selectedRequest.end_date)}
              </p>
              <p>
                <strong>Days:</strong> {selectedRequest.totalDays}
              </p>
              <p>
                <strong>Applied Date:</strong>{' '}
                {formatDateTimeDMY(selectedRequest.createdAt)}
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
                          {a.date ? formatDateTimeDMY(a.date) : '-'}
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
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
                <strong>UL Used:</strong> {userBalance.ulBalance}
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
    </CCard>
  )
}

export default PendinApprovelsLeave
