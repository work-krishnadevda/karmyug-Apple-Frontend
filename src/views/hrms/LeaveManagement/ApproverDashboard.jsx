import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CForm,
  CFormLabel,
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
  CCol,
  CRow,
  CFormSelect,
  CAlert,
  CProgress,
} from '@coreui/react'
import { cilCheck, cilX, cilMagnifyingGlass, cilFilter } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

// Dummy data for pending leave requests
const dummyPendingRequests = [
  {
    id: 1,
    employeeName: 'John Doe',
    employeeId: 'EMP001',
    leaveType: 'CL',
    startDate: '2025-01-15',
    endDate: '2025-01-16',
    days: 2,
    reason: 'Personal work - need to attend to urgent family matter',
    status: 'pending',
         appliedDate: '2025-01-10',
     appliedTime: '10:30:45 AM',
    currentApprover: 'HR',
    approvals: [
      { approver: 'Admin', status: 'approved', date: '2025-01-11', comments: 'Approved as per policy' },
      { approver: 'HR', status: 'pending', date: null, comments: '' },
    ],
    employeeBalance: { CL: 9, UL: 14 },
  },
  {
    id: 2,
    employeeName: 'Jane Smith',
    employeeId: 'EMP002',
    leaveType: 'UL',
    startDate: '2025-01-20',
    endDate: '2025-01-22',
    days: 3,
    reason: 'Medical emergency - need to visit specialist',
    status: 'pending',
         appliedDate: '2025-01-08',
     appliedTime: '02:15:30 PM',
    currentApprover: 'Branch Manager',
    approvals: [
      { approver: 'Admin', status: 'approved', date: '2025-01-09', comments: 'Medical leave approved' },
      { approver: 'HR', status: 'approved', date: '2025-01-10', comments: 'Approved with medical documents' },
      { approver: 'Branch Manager', status: 'pending', date: null, comments: '' },
    ],
    employeeBalance: { CL: 8, UL: 11 },
  },
  {
    id: 3,
    employeeName: 'Mike Johnson',
    employeeId: 'EMP003',
    leaveType: 'CL',
    startDate: '2025-01-25',
    endDate: '2025-01-27',
    days: 3,
    reason: 'Family function - brother\'s wedding',
    status: 'pending',
         appliedDate: '2025-01-12',
     appliedTime: '09:45:20 AM',
    currentApprover: 'Admin',
    approvals: [
      { approver: 'Admin', status: 'pending', date: null, comments: '' },
    ],
    employeeBalance: { CL: 6, UL: 16 },
  },
]

const leaveStatuses = {
  pending: { color: 'warning', text: 'Pending' },
  partially_approved: { color: 'info', text: 'Partially Approved' },
  approved: { color: 'success', text: 'Approved' },
  rejected: { color: 'danger', text: 'Rejected' },
  cancelled: { color: 'secondary', text: 'Cancelled' },
}

const approvalChain = ['Admin', 'HR', 'Branch Manager', 'RC', 'SFO', 'LCTO']

const ApproverDashboard = () => {
  const [pendingRequests, setPendingRequests] = useState(dummyPendingRequests)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showActionModal, setShowActionModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [actionType, setActionType] = useState('')
  const [comments, setComments] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [currentUserRole, setCurrentUserRole] = useState('HR') // This would come from auth context

  const filteredRequests = pendingRequests.filter(request => {
    if (filterStatus === 'all') return true
    return request.status === filterStatus
  })

  const handleViewDetails = (request) => {
    setSelectedRequest(request)
    setShowDetailsModal(true)
  }

  const handleAction = (request, type) => {
    setSelectedRequest(request)
    setActionType(type)
    setComments('')
    setShowActionModal(true)
  }

  const submitAction = () => {
    if (!comments.trim()) {
      alert('Please provide comments for your decision')
      return
    }

    const updatedRequests = pendingRequests.map(request => {
      if (request.id === selectedRequest.id) {
        const updatedApprovals = request.approvals.map(approval => {
          if (approval.approver === currentUserRole) {
            return {
              ...approval,
              status: actionType === 'approve' ? 'approved' : 'rejected',
              date: new Date().toISOString().slice(0, 10),
              comments: comments
            }
          }
          return approval
        })

        // Determine final status based on approvals
        const approvedCount = updatedApprovals.filter(a => a.status === 'approved').length
        const rejectedCount = updatedApprovals.filter(a => a.status === 'rejected').length
        const totalApprovals = updatedApprovals.length

        let finalStatus = 'pending'
        if (approvedCount >= 2) {
          finalStatus = 'approved'
        } else if (rejectedCount >= 2) {
          finalStatus = 'rejected'
        } else if (approvedCount > 0 || rejectedCount > 0) {
          finalStatus = 'partially_approved'
        }

        return {
          ...request,
          status: finalStatus,
          approvals: updatedApprovals
        }
      }
      return request
    })

    setPendingRequests(updatedRequests)
    setShowActionModal(false)
    setSelectedRequest(null)
    setComments('')
  }

  const getApprovalStatus = (request) => {
    const userApproval = request.approvals.find(a => a.approver === currentUserRole)
    if (!userApproval) return 'not_assigned'
    return userApproval.status
  }

  const canTakeAction = (request) => {
    const approvalStatus = getApprovalStatus(request)
    return approvalStatus === 'pending' && request.currentApprover === currentUserRole
  }

  return (
    <div style={{ width: '95%', margin: 'auto' }}>
      {/* Header */}
      <CCard className="mb-4">
        <CCardBody>
          <h4>Leave Approval Dashboard</h4>
          <p className="text-muted">Current Role: {currentUserRole}</p>
        </CCardBody>
      </CCard>

      {/* Statistics Cards */}
      <CRow className="mb-4">
        <CCol md={3}>
          <CCard>
            <CCardBody className="text-center">
              <h3 className="text-warning">{pendingRequests.filter(r => r.status === 'pending').length}</h3>
              <p className="mb-0">Pending Requests</p>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={3}>
          <CCard>
            <CCardBody className="text-center">
              <h3 className="text-info">{pendingRequests.filter(r => r.status === 'partially_approved').length}</h3>
              <p className="mb-0">Partially Approved</p>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={3}>
          <CCard>
            <CCardBody className="text-center">
              <h3 className="text-success">{pendingRequests.filter(r => r.status === 'approved').length}</h3>
              <p className="mb-0">Approved</p>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={3}>
          <CCard>
            <CCardBody className="text-center">
              <h3 className="text-danger">{pendingRequests.filter(r => r.status === 'rejected').length}</h3>
              <p className="mb-0">Rejected</p>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Filters */}
      <CCard className="mb-4">
        <CCardHeader>
          <div className="d-flex justify-content-between align-items-center">
            <CCardTitle className="mb-0">
              <CIcon icon={cilFilter} className="me-2" />
              Filters
            </CCardTitle>
            <CFormSelect
              style={{ width: '200px' }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Requests</option>
              <option value="pending">Pending</option>
              <option value="partially_approved">Partially Approved</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </CFormSelect>
          </div>
        </CCardHeader>
      </CCard>

      {/* Pending Requests Table */}
      <CCard>
        <CCardHeader>
          <CCardTitle className="mb-0">Leave Requests for Approval</CCardTitle>
        </CCardHeader>
        <CCardBody>
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Employee</CTableHeaderCell>
                <CTableHeaderCell>Leave Type</CTableHeaderCell>
                <CTableHeaderCell>From</CTableHeaderCell>
                <CTableHeaderCell>To</CTableHeaderCell>
                <CTableHeaderCell>Days</CTableHeaderCell>
                <CTableHeaderCell>Reason</CTableHeaderCell>
                <CTableHeaderCell>Status</CTableHeaderCell>
                <CTableHeaderCell>Applied Date & Time</CTableHeaderCell>
                <CTableHeaderCell>Current Approver</CTableHeaderCell>
                <CTableHeaderCell>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {filteredRequests.map((request) => (
                <CTableRow key={request.id}>
                  <CTableDataCell>
                    <div>
                      <strong>{request.employeeName}</strong>
                      <br />
                      <small className="text-muted">{request.employeeId}</small>
                    </div>
                  </CTableDataCell>
                  <CTableDataCell>
                    <CBadge color={request.leaveType === 'CL' ? 'primary' : 'warning'}>
                      {request.leaveType}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell>{request.startDate}</CTableDataCell>
                  <CTableDataCell>{request.endDate}</CTableDataCell>
                  <CTableDataCell>{request.days}</CTableDataCell>
                  <CTableDataCell>
                    <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {request.reason}
                    </div>
                  </CTableDataCell>
                  <CTableDataCell>
                    <CBadge color={leaveStatuses[request.status].color}>
                      {leaveStatuses[request.status].text}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell>
                    <div>
                      <div>{request.appliedDate}</div>
                      <small className="text-muted">{request.appliedTime || 'N/A'}</small>
                    </div>
                  </CTableDataCell>
                  <CTableDataCell>
                    <CBadge color={request.currentApprover === currentUserRole ? 'info' : 'light'}>
                      {request.currentApprover}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell>
                    <div className="d-flex gap-2">
                      <CButton
                        size="sm"
                        color="info"
                        onClick={() => handleViewDetails(request)}
                      >
                        <CIcon icon={cilMagnifyingGlass} />
                      </CButton>
                      {canTakeAction(request) && (
                        <>
                          <CButton
                            size="sm"
                            color="success"
                            onClick={() => handleAction(request, 'approve')}
                          >
                            <CIcon icon={cilCheck} />
                          </CButton>
                          <CButton
                            size="sm"
                            color="danger"
                            onClick={() => handleAction(request, 'reject')}
                          >
                            <CIcon icon={cilX} />
                          </CButton>
                        </>
                      )}
                    </div>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>

      {/* Leave Details Modal */}
      <CModal visible={showDetailsModal} onClose={() => setShowDetailsModal(false)} size="lg">
        <CModalHeader>
          <CModalTitle>Leave Request Details</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedRequest && (
            <div>
              <CRow>
                <CCol md={6}>
                  <strong>Employee:</strong> {selectedRequest.employeeName} ({selectedRequest.employeeId})
                </CCol>
                <CCol md={6}>
                  <strong>Leave Type:</strong>
                  <CBadge color={selectedRequest.leaveType === 'CL' ? 'primary' : 'warning'} className="ms-2">
                    {selectedRequest.leaveType}
                  </CBadge>
                </CCol>
              </CRow>
              <CRow className="mt-3">
                <CCol md={6}>
                  <strong>From:</strong> {selectedRequest.startDate}
                </CCol>
                <CCol md={6}>
                  <strong>To:</strong> {selectedRequest.endDate}
                </CCol>
              </CRow>
              <CRow className="mt-3">
                <CCol md={6}>
                  <strong>Days:</strong> {selectedRequest.days}
                </CCol>
                                 <CCol md={6}>
                   <strong>Applied Date:</strong> {selectedRequest.appliedDate}
                   <br />
                   <strong>Applied Time:</strong> {selectedRequest.appliedTime || 'N/A'}
                 </CCol>
              </CRow>
              <CRow className="mt-3">
                <CCol>
                  <strong>Reason:</strong>
                  <p className="mt-2">{selectedRequest.reason}</p>
                </CCol>
              </CRow>
              
              <hr />
              <h6>Employee Leave Balance</h6>
              <CRow>
                <CCol md={6}>
                  <div className="mb-2">
                    <span>CL Balance: {selectedRequest.employeeBalance.CL} days</span>
                    <CProgress value={(selectedRequest.employeeBalance.CL / 12) * 100} className="mt-1" />
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-2">
                    <span>UL Balance: {selectedRequest.employeeBalance.UL} days</span>
                    <CProgress value={(selectedRequest.employeeBalance.UL / 16) * 100} className="mt-1" />
                  </div>
                </CCol>
              </CRow>
              
              <hr />
              <h6>Approval Status</h6>
              {approvalChain.map((approver) => {
                const approval = selectedRequest.approvals.find(a => a.approver === approver)
                return (
                  <div key={approver} className="d-flex justify-content-between align-items-center mb-2">
                    <span>{approver}</span>
                    {approval ? (
                      <div>
                        <CBadge color={approval.status === 'approved' ? 'success' : approval.status === 'rejected' ? 'danger' : 'warning'} className="me-2">
                          {approval.status}
                        </CBadge>
                        {approval.comments && (
                          <small className="text-muted">"{approval.comments}"</small>
                        )}
                      </div>
                    ) : (
                      <CBadge color="light">Pending</CBadge>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Action Modal */}
      <CModal visible={showActionModal} onClose={() => setShowActionModal(false)}>
        <CModalHeader>
          <CModalTitle>
            {actionType === 'approve' ? 'Approve' : 'Reject'} Leave Request
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedRequest && (
            <div>
              <p>
                <strong>Employee:</strong> {selectedRequest.employeeName}
              </p>
              <p>
                <strong>Leave Type:</strong> {selectedRequest.leaveType} ({selectedRequest.days} days)
              </p>
              <p>
                <strong>Period:</strong> {selectedRequest.startDate} to {selectedRequest.endDate}
              </p>
              <CFormLabel>Comments *</CFormLabel>
              <CFormTextarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
                placeholder={`Please provide comments for ${actionType === 'approve' ? 'approval' : 'rejection'}...`}
              />
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowActionModal(false)}>
            Cancel
          </CButton>
          <CButton 
            color={actionType === 'approve' ? 'success' : 'danger'} 
            onClick={submitAction}
          >
            {actionType === 'approve' ? 'Approve' : 'Reject'}
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default ApproverDashboard
