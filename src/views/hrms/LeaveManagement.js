import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
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
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormLabel,
  CFormInput,
  CFormTextarea,
  CAlert,
} from '@coreui/react'

import AppFormSelect from 'src/components/form/AppFormSelect'
import { cilCalendar, cilPlus, cilMagnifyingGlass } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useDispatch } from 'react-redux'
import BasicProvider from 'src/constants/BasicProvider'
import { calculateDays } from './LeaveManagement/utils'

const LeaveManagement = () => {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(true)
  const [leaveData, setLeaveData] = useState([])
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedLeave, setSelectedLeave] = useState(null)
  const [leaveForm, setLeaveForm] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    description: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchLeaveData()
  }, [])

  const fetchLeaveData = async () => {
    try {
      setLoading(true)
      const response = await new BasicProvider('hrms/leave/history', dispatch).getRequest()
      setLeaveData(response.data)
    } catch (error) {
      console.error('Error fetching leave data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitLeave = async () => {
    try {
      setSubmitting(true)
      await new BasicProvider('hrms/leave/request', dispatch).postRequest(leaveForm)
      setShowLeaveModal(false)
      setLeaveForm({
        leaveType: '',
        startDate: '',
        endDate: '',
        reason: '',
        description: ''
      })
      fetchLeaveData() // Refresh data
    } catch (error) {
      console.error('Error submitting leave request:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleViewLeave = (leave) => {
    setSelectedLeave(leave)
    setShowViewModal(true)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'warning', text: 'Pending' },
      approved: { color: 'success', text: 'Approved' },
      rejected: { color: 'danger', text: 'Rejected' },
      cancelled: { color: 'secondary', text: 'Cancelled' }
    }
    
    const config = statusConfig[status] || { color: 'light', text: status }
    return <CBadge color={config.color}>{config.text}</CBadge>
  }

  const getLeaveTypeBadge = (type) => {
    const typeConfig = {
      casual: { color: 'info', text: 'Casual Leave' },
      sick: { color: 'danger', text: 'Sick Leave' },
      annual: { color: 'success', text: 'Annual Leave' },
      personal: { color: 'warning', text: 'Personal Leave' },
      maternity: { color: 'primary', text: 'Maternity Leave' },
      paternity: { color: 'primary', text: 'Paternity Leave' }
    }
    
    const config = typeConfig[type] || { color: 'light', text: type }
    return <CBadge color={config.color}>{config.text}</CBadge>
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <CSpinner size="lg" />
      </div>
    )
  }

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Leave Management</h2>
            <CButton 
              color="primary" 
              onClick={() => setShowLeaveModal(true)}
            >
              <CIcon icon={cilPlus} className="me-2" />
              Request Leave
            </CButton>
          </div>
        </CCol>
      </CRow>

      {/* Leave Summary Cards */}
      <CRow className="mb-4">
        <CCol sm={6} lg={3}>
          <CCard className="text-center">
            <CCardBody>
              <h4 className="text-primary">{leaveData?.summary?.totalLeaves || 0}</h4>
              <p className="text-muted mb-0">Total Leaves</p>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={6} lg={3}>
          <CCard className="text-center">
            <CCardBody>
              <h4 className="text-success">{leaveData?.summary?.usedLeaves || 0}</h4>
              <p className="text-muted mb-0">Used Leaves</p>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={6} lg={3}>
          <CCard className="text-center">
            <CCardBody>
              <h4 className="text-warning">{leaveData?.summary?.availableLeaves || 0}</h4>
              <p className="text-muted mb-0">Available Leaves</p>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={6} lg={3}>
          <CCard className="text-center">
            <CCardBody>
              <h4 className="text-info">{leaveData?.summary?.pendingRequests || 0}</h4>
              <p className="text-muted mb-0">Pending Requests</p>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Leave History Table */}
      <CRow>
        <CCol xs={12}>
          <CCard>
            <CCardHeader>
              <h5 className="mb-0">
                <CIcon icon={cilCalendar} className="me-2" />
                Leave History
              </h5>
            </CCardHeader>
            <CCardBody>
              {leaveData?.history?.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">No leave records found.</p>
                </div>
              ) : (
                <CTable hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Leave Type</CTableHeaderCell>
                      <CTableHeaderCell>From</CTableHeaderCell>
                      <CTableHeaderCell>To</CTableHeaderCell>
                      <CTableHeaderCell>Days</CTableHeaderCell>
                      <CTableHeaderCell>Status</CTableHeaderCell>
                      <CTableHeaderCell>Applied On</CTableHeaderCell>
                      <CTableHeaderCell>Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {leaveData?.history?.map((leave, index) => (
                      <CTableRow key={index}>
                        <CTableDataCell>
                          {getLeaveTypeBadge(leave.leaveType)}
                        </CTableDataCell>
                        <CTableDataCell>
                          {formatDate(leave.startDate)}
                        </CTableDataCell>
                        <CTableDataCell>
                          {formatDate(leave.endDate)}
                        </CTableDataCell>
                        <CTableDataCell>
                          {calculateDays(leave.startDate, leave.endDate)} days
                        </CTableDataCell>
                        <CTableDataCell>
                          {getStatusBadge(leave.status)}
                        </CTableDataCell>
                        <CTableDataCell>
                          {formatDate(leave.appliedOn)}
                        </CTableDataCell>
                        <CTableDataCell>
                                                     <CButton
                             color="info"
                             size="sm"
                             onClick={() => handleViewLeave(leave)}
                           >
                             <CIcon icon={cilMagnifyingGlass} />
                           </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Request Leave Modal */}
      <CModal 
        visible={showLeaveModal} 
        onClose={() => setShowLeaveModal(false)}
        size="lg"
      >
        <CModalHeader>
          <CModalTitle>Request Leave</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CRow>
              <CCol md={6}>
                <CFormLabel>Leave Type</CFormLabel>
                <AppFormSelect
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                  required
                >
                  <option value="">Select Leave Type</option>
                  <option value="casual">Casual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="annual">Annual Leave</option>
                  <option value="personal">Personal Leave</option>
                  <option value="maternity">Maternity Leave</option>
                  <option value="paternity">Paternity Leave</option>
                </AppFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormLabel>Reason</CFormLabel>
                <CFormInput
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  placeholder="Brief reason for leave"
                  required
                />
              </CCol>
            </CRow>
            <CRow className="mt-3">
              <CCol md={6}>
                <CFormLabel>Start Date</CFormLabel>
                <CFormInput
                  type="date"
                  value={leaveForm.startDate}
                  onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>End Date</CFormLabel>
                <CFormInput
                  type="date"
                  value={leaveForm.endDate}
                  onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                  required
                />
              </CCol>
            </CRow>
            <CRow className="mt-3">
              <CCol md={12}>
                <CFormLabel>Description</CFormLabel>
                <CFormTextarea
                  value={leaveForm.description}
                  onChange={(e) => setLeaveForm({ ...leaveForm, description: e.target.value })}
                  placeholder="Detailed description of your leave request"
                  rows={4}
                />
              </CCol>
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton 
            color="secondary" 
            onClick={() => setShowLeaveModal(false)}
          >
            Cancel
          </CButton>
          <CButton 
            color="primary" 
            onClick={handleSubmitLeave}
            disabled={submitting}
          >
            {submitting ? <CSpinner size="sm" /> : 'Submit Request'}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* View Leave Details Modal */}
      <CModal 
        visible={showViewModal} 
        onClose={() => setShowViewModal(false)}
        size="lg"
      >
        <CModalHeader>
          <CModalTitle>Leave Details</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedLeave && (
            <CRow>
              <CCol md={6}>
                <p><strong>Leave Type:</strong></p>
                <p>{getLeaveTypeBadge(selectedLeave.leaveType)}</p>
              </CCol>
              <CCol md={6}>
                <p><strong>Status:</strong></p>
                <p>{getStatusBadge(selectedLeave.status)}</p>
              </CCol>
              <CCol md={6}>
                <p><strong>From:</strong></p>
                <p>{formatDate(selectedLeave.startDate)}</p>
              </CCol>
              <CCol md={6}>
                <p><strong>To:</strong></p>
                <p>{formatDate(selectedLeave.endDate)}</p>
              </CCol>
              <CCol md={6}>
                <p><strong>Days:</strong></p>
                <p>{calculateDays(selectedLeave.startDate, selectedLeave.endDate)} days</p>
              </CCol>
              <CCol md={6}>
                <p><strong>Applied On:</strong></p>
                <p>{formatDate(selectedLeave.appliedOn)}</p>
              </CCol>
              <CCol md={12}>
                <p><strong>Reason:</strong></p>
                <p>{selectedLeave.reason}</p>
              </CCol>
              {selectedLeave.description && (
                <CCol md={12}>
                  <p><strong>Description:</strong></p>
                  <p>{selectedLeave.description}</p>
                </CCol>
              )}
              {selectedLeave.remarks && (
                <CCol md={12}>
                  <p><strong>Manager Remarks:</strong></p>
                  <p>{selectedLeave.remarks}</p>
                </CCol>
              )}
            </CRow>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton 
            color="secondary" 
            onClick={() => setShowViewModal(false)}
          >
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default LeaveManagement
