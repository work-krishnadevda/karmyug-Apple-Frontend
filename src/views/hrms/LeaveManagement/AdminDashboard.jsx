import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CForm,
  CFormLabel,
  CFormInput,
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
  CWidgetStatsF,
} from '@coreui/react'

import AppFormSelect from 'src/components/form/AppFormSelect'
import { cilCalendar, cilPeople, cilChart, cilFilter, cilCloudDownload } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

// Dummy data for admin dashboard
const leaveStatistics = {
  totalEmployees: 150,
  totalLeaveRequests: 45,
  pendingRequests: 12,
  approvedRequests: 28,
  rejectedRequests: 5,
  leaveTypes: {
    CL: { total: 25, approved: 20, pending: 3, rejected: 2 },
    UL: { total: 20, approved: 8, pending: 9, rejected: 3 },
  },
  monthlyData: [
    { month: 'Jan', CL: 8, UL: 5 },
    { month: 'Feb', CL: 6, UL: 7 },
    { month: 'Mar', CL: 9, UL: 4 },
    { month: 'Apr', CL: 7, UL: 6 },
    { month: 'May', CL: 10, UL: 8 },
    { month: 'Jun', CL: 5, UL: 3 },
  ],
  departmentStats: [
    { department: 'IT', totalEmployees: 25, leaveRequests: 8, avgLeaveDays: 3.2 },
    { department: 'HR', totalEmployees: 15, leaveRequests: 5, avgLeaveDays: 2.8 },
    { department: 'Finance', totalEmployees: 20, leaveRequests: 6, avgLeaveDays: 2.5 },
    { department: 'Marketing', totalEmployees: 18, leaveRequests: 7, avgLeaveDays: 3.5 },
    { department: 'Operations', totalEmployees: 30, leaveRequests: 12, avgLeaveDays: 4.1 },
  ],
  penaltyBucket: {
    totalPenalties: 8,
    totalAmount: 24000,
    refundedAmount: 16000,
    pendingAmount: 8000,
  },
}

const dummyLeaveRequests = [
  {
    id: 1,
    employeeName: 'John Doe',
    employeeId: 'EMP001',
    department: 'IT',
    leaveType: 'CL',
    startDate: '2025-01-15',
    endDate: '2025-01-16',
    days: 2,
    reason: 'Personal work',
    status: 'pending',
    appliedDate: '2025-01-10',
    appliedTime: '10:30:45 AM',
    currentApprover: 'HR',
  },
  {
    id: 2,
    employeeName: 'Jane Smith',
    employeeId: 'EMP002',
    department: 'HR',
    leaveType: 'UL',
    startDate: '2025-01-20',
    endDate: '2025-01-22',
    days: 3,
    reason: 'Medical emergency',
    status: 'approved',
    appliedDate: '2025-01-08',
    appliedTime: '02:15:30 PM',
    currentApprover: 'Branch Manager',
  },
  {
    id: 3,
    employeeName: 'Mike Johnson',
    employeeId: 'EMP003',
    department: 'Finance',
    leaveType: 'CL',
    startDate: '2025-01-25',
    endDate: '2025-01-27',
    days: 3,
    reason: 'Family function',
    status: 'rejected',
    appliedDate: '2025-01-12',
    appliedTime: '09:45:20 AM',
    currentApprover: 'Admin',
  },
]

const leaveStatuses = {
  pending: { color: 'warning', text: 'Pending' },
  partially_approved: { color: 'info', text: 'Partially Approved' },
  approved: { color: 'success', text: 'Approved' },
  rejected: { color: 'danger', text: 'Rejected' },
  cancelled: { color: 'secondary', text: 'Cancelled' },
}

const AdminDashboard = () => {
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    department: 'all',
    leaveType: 'all',
    status: 'all',
    dateRange: 'all',
    checkDate: new Date().toISOString().slice(0, 10),
  })
  const [leaveRequests, setLeaveRequests] = useState(dummyLeaveRequests)

  const filteredRequests = leaveRequests.filter(request => {
    if (filters.department !== 'all' && request.department !== filters.department) return false
    if (filters.leaveType !== 'all' && request.leaveType !== filters.leaveType) return false
    if (filters.status !== 'all' && request.status !== filters.status) return false
    
    // Date filter - check if the selected date falls within the leave period
    if (filters.checkDate) {
      const checkDate = new Date(filters.checkDate)
      const startDate = new Date(request.startDate)
      const endDate = new Date(request.endDate)
      
      // Check if the selected date is within the leave period
      if (checkDate >= startDate && checkDate <= endDate) {
        return true
      } else {
        return false
      }
    }
    
    return true
  })

  const chartData = {
    line: {
      labels: leaveStatistics.monthlyData.map(item => item.month),
      datasets: [
        {
          label: 'Casual Leave',
          backgroundColor: 'rgba(220, 220, 220, 0.2)',
          borderColor: 'rgba(220, 220, 220, 1)',
          pointBackgroundColor: 'rgba(220, 220, 220, 1)',
          pointBorderColor: '#fff',
          data: leaveStatistics.monthlyData.map(item => item.CL),
        },
        {
          label: 'Unpaid Leave',
          backgroundColor: 'rgba(151, 187, 205, 0.2)',
          borderColor: 'rgba(151, 187, 205, 1)',
          pointBackgroundColor: 'rgba(151, 187, 205, 1)',
          pointBorderColor: '#fff',
          data: leaveStatistics.monthlyData.map(item => item.UL),
        },
      ],
    },
    doughnut: {
      labels: ['Approved', 'Pending', 'Rejected'],
      datasets: [
        {
          backgroundColor: ['#2eb85c', '#f9b115', '#e55353'],
          data: [
            leaveStatistics.approvedRequests,
            leaveStatistics.pendingRequests,
            leaveStatistics.rejectedRequests,
          ],
        },
      ],
    },
  }

  const handleExport = () => {
    // Placeholder for export functionality
    alert('Export functionality would be implemented here')
  }

  return (
    <div style={{ width: '95%', margin: 'auto' }}>
      {/* Header */}
      <CCard className="mb-4">
        <CCardBody>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h4>Leave Management Dashboard</h4>
              <p className="text-muted">Comprehensive overview of leave statistics and management</p>
            </div>
                          <CButton color="primary" onClick={handleExport}>
                <CIcon icon={cilCloudDownload} className="me-2" />
                Export Report
              </CButton>
          </div>
        </CCardBody>
      </CCard>


      {/* Key Statistics Cards */}
      <CRow className="mb-4 overview_dashboard Query">
        <CCol sm={6} md={3}>
          <CWidgetStatsF
            className="mb-3"
            icon={<CIcon width={24} icon={cilPeople} size="xl" />}
            padding={false}
            title="Total Employees"
            value={leaveStatistics.totalEmployees.toString()}
            color="primary"
          />
        </CCol>
        <CCol sm={6} md={3}>
          <CWidgetStatsF
            className="mb-3"
            icon={<CIcon width={24} icon={cilCalendar} size="xl" />}
            padding={false}
            title="Total Requests"
            value={leaveStatistics.totalLeaveRequests.toString()}
            color="info"
          />
        </CCol>
        <CCol sm={6} md={3}>
          <CWidgetStatsF
            className="mb-3"
            icon={<CIcon width={24} icon={cilChart} size="xl" />}
            padding={false}
            title="Pending"
            value={leaveStatistics.pendingRequests.toString()}
            color="warning"
          />
        </CCol>
        <CCol sm={6} md={3}>
          <CWidgetStatsF
            className="mb-3"
            icon={<CIcon width={24} icon={cilChart} size="xl" />}
            padding={false}
            title="Approved"
            value={leaveStatistics.approvedRequests.toString()}
            color="success"
          />
        </CCol>
      </CRow>

      {/* Charts Row */}
      <CRow className="mb-4">
        <CCol md={8}>
          <CCard>
            <CCardHeader>
              <CCardTitle>Monthly Leave Trends</CCardTitle>
            </CCardHeader>
                         <CCardBody>
               <div className="text-center p-4">
                 <h5>Monthly Leave Trends</h5>
                 <p className="text-muted">Chart visualization would be implemented here</p>
                 <div className="mt-3">
                   {leaveStatistics.monthlyData.map((item, index) => (
                     <div key={index} className="d-flex justify-content-between mb-2">
                       <span>{item.month}:</span>
                       <span>CL: {item.CL}, UL: {item.UL}</span>
                     </div>
                   ))}
                 </div>
               </div>
             </CCardBody>
          </CCard>
        </CCol>
        <CCol md={4}>
          <CCard>
            <CCardHeader>
              <CCardTitle>Request Status Distribution</CCardTitle>
            </CCardHeader>
                         <CCardBody>
               <div className="text-center p-4">
                 <h5>Request Status Distribution</h5>
                 <p className="text-muted">Chart visualization would be implemented here</p>
                 <div className="mt-3">
                   <div className="d-flex justify-content-between mb-2">
                     <span>Approved:</span>
                     <span className="text-success">{leaveStatistics.approvedRequests}</span>
                   </div>
                   <div className="d-flex justify-content-between mb-2">
                     <span>Pending:</span>
                     <span className="text-warning">{leaveStatistics.pendingRequests}</span>
                   </div>
                   <div className="d-flex justify-content-between mb-2">
                     <span>Rejected:</span>
                     <span className="text-danger">{leaveStatistics.rejectedRequests}</span>
                   </div>
                 </div>
               </div>
             </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Leave Type Statistics */}
      <CRow className="mb-4">
        <CCol md={6}>
          <CCard>
            <CCardHeader>
              <CCardTitle>Casual Leave (CL) Statistics</CCardTitle>
            </CCardHeader>
            <CCardBody>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Total Requests</span>
                  <span>{leaveStatistics.leaveTypes.CL.total}</span>
                </div>
                <CProgress value={100} color="primary" />
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Approved</span>
                  <span>{leaveStatistics.leaveTypes.CL.approved}</span>
                </div>
                <CProgress 
                  value={(leaveStatistics.leaveTypes.CL.approved / leaveStatistics.leaveTypes.CL.total) * 100} 
                  color="success" 
                />
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Pending</span>
                  <span>{leaveStatistics.leaveTypes.CL.pending}</span>
                </div>
                <CProgress 
                  value={(leaveStatistics.leaveTypes.CL.pending / leaveStatistics.leaveTypes.CL.total) * 100} 
                  color="warning" 
                />
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Rejected</span>
                  <span>{leaveStatistics.leaveTypes.CL.rejected}</span>
                </div>
                <CProgress 
                  value={(leaveStatistics.leaveTypes.CL.rejected / leaveStatistics.leaveTypes.CL.total) * 100} 
                  color="danger" 
                />
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={6}>
          <CCard>
            <CCardHeader>
              <CCardTitle>Unpaid Leave (UL) Statistics</CCardTitle>
            </CCardHeader>
            <CCardBody>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Total Requests</span>
                  <span>{leaveStatistics.leaveTypes.UL.total}</span>
                </div>
                <CProgress value={100} color="warning" />
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Approved</span>
                  <span>{leaveStatistics.leaveTypes.UL.approved}</span>
                </div>
                <CProgress 
                  value={(leaveStatistics.leaveTypes.UL.approved / leaveStatistics.leaveTypes.UL.total) * 100} 
                  color="success" 
                />
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Pending</span>
                  <span>{leaveStatistics.leaveTypes.UL.pending}</span>
                </div>
                <CProgress 
                  value={(leaveStatistics.leaveTypes.UL.pending / leaveStatistics.leaveTypes.UL.total) * 100} 
                  color="warning" 
                />
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Rejected</span>
                  <span>{leaveStatistics.leaveTypes.UL.rejected}</span>
                </div>
                <CProgress 
                  value={(leaveStatistics.leaveTypes.UL.rejected / leaveStatistics.leaveTypes.UL.total) * 100} 
                  color="danger" 
                />
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Penalty Bucket */}
      <CCard className="mb-4">
        <CCardHeader>
          <CCardTitle>Penalty Bucket (UL Double Deduction)</CCardTitle>
        </CCardHeader>
        <CCardBody>
          <CRow>
            <CCol md={3}>
              <div className="text-center">
                <h4 className="text-danger">₹{leaveStatistics.penaltyBucket.totalAmount.toLocaleString()}</h4>
                <p className="text-muted">Total Penalties</p>
              </div>
            </CCol>
            <CCol md={3}>
              <div className="text-center">
                <h4 className="text-success">₹{leaveStatistics.penaltyBucket.refundedAmount.toLocaleString()}</h4>
                <p className="text-muted">Refunded Amount</p>
              </div>
            </CCol>
            <CCol md={3}>
              <div className="text-center">
                <h4 className="text-warning">₹{leaveStatistics.penaltyBucket.pendingAmount.toLocaleString()}</h4>
                <p className="text-muted">Pending Amount</p>
              </div>
            </CCol>
            <CCol md={3}>
              <div className="text-center">
                <h4>{leaveStatistics.penaltyBucket.totalPenalties}</h4>
                <p className="text-muted">Total Cases</p>
              </div>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {/* Department Statistics */}
      <CCard className="mb-4">
        <CCardHeader>
          <CCardTitle>Department-wise Leave Statistics</CCardTitle>
        </CCardHeader>
        <CCardBody>
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Department</CTableHeaderCell>
                <CTableHeaderCell>Total Employees</CTableHeaderCell>
                <CTableHeaderCell>Leave Requests</CTableHeaderCell>
                <CTableHeaderCell>Avg Leave Days</CTableHeaderCell>
                <CTableHeaderCell>Utilization Rate</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {leaveStatistics.departmentStats.map((dept) => (
                <CTableRow key={dept.department}>
                  <CTableDataCell>
                    <strong>{dept.department}</strong>
                  </CTableDataCell>
                  <CTableDataCell>{dept.totalEmployees}</CTableDataCell>
                  <CTableDataCell>{dept.leaveRequests}</CTableDataCell>
                  <CTableDataCell>{dept.avgLeaveDays}</CTableDataCell>
                  <CTableDataCell>
                    <CProgress 
                      value={(dept.leaveRequests / dept.totalEmployees) * 100} 
                      color={dept.leaveRequests / dept.totalEmployees > 0.3 ? 'warning' : 'success'}
                    />
                    <small>{((dept.leaveRequests / dept.totalEmployees) * 100).toFixed(1)}%</small>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>

      {/* Filters */}
      <CCard className="mb-4">
        <CCardHeader>
          <div className="d-flex justify-content-between align-items-center">
            <CCardTitle className="mb-0">
              <CIcon icon={cilFilter} className="me-2" />
              Filters
            </CCardTitle>
                         <div className="d-flex gap-2">
               <CButton
                 color="secondary"
                 size="sm"
                 onClick={() => setShowFilters(!showFilters)}
               >
                 {showFilters ? 'Hide' : 'Show'} Filters
               </CButton>
               {filters.checkDate && (
                 <CButton
                   color="warning"
                   size="sm"
                   onClick={() => setFilters({ ...filters, checkDate: '' })}
                 >
                   Clear Date Filter
                 </CButton>
               )}
             </div>
          </div>
        </CCardHeader>
        {showFilters && (
          <CCardBody>
            <CRow>
              <CCol md={3}>
                <CFormLabel>Department</CFormLabel>
                <AppFormSelect
                  value={filters.department}
                  onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                >
                  <option value="all">All Departments</option>
                  <option value="IT">IT</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Operations">Operations</option>
                </AppFormSelect>
              </CCol>
              <CCol md={3}>
                <CFormLabel>Leave Type</CFormLabel>
                <AppFormSelect
                  value={filters.leaveType}
                  onChange={(e) => setFilters({ ...filters, leaveType: e.target.value })}
                >
                  <option value="all">All Types</option>
                  <option value="CL">Casual Leave</option>
                  <option value="UL">Unpaid Leave</option>
                </AppFormSelect>
              </CCol>
              <CCol md={3}>
                <CFormLabel>Status</CFormLabel>
                <AppFormSelect
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </AppFormSelect>
              </CCol>
                             <CCol md={3}>
                 <CFormLabel>Date Range</CFormLabel>
                 <AppFormSelect
                   value={filters.dateRange}
                   onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                 >
                   <option value="all">All Time</option>
                   <option value="this_month">This Month</option>
                   <option value="last_month">Last Month</option>
                   <option value="this_quarter">This Quarter</option>
                 </AppFormSelect>
               </CCol>
               <CCol md={3}>
                 <CFormLabel>Check Date (Who is on Leave)</CFormLabel>
                 <CFormInput
                   type="date"
                   value={filters.checkDate}
                   onChange={(e) => setFilters({ ...filters, checkDate: e.target.value })}
                   placeholder="Select date to check who is on leave"
                 />
               </CCol>
            </CRow>
          </CCardBody>
        )}
      </CCard>

             {/* Leave Requests Table */}
       <CCard>
         <CCardHeader>
           <div className="d-flex justify-content-between align-items-center">
             <CCardTitle className="mb-0">
               {filters.checkDate ? `Leave Requests for ${filters.checkDate}` : 'Recent Leave Requests'}
             </CCardTitle>
             {filters.checkDate && (
               <CBadge color="info">
                 Showing employees on leave for {filters.checkDate}
               </CBadge>
             )}
           </div>
         </CCardHeader>
        <CCardBody>
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Employee</CTableHeaderCell>
                <CTableHeaderCell>Department</CTableHeaderCell>
                <CTableHeaderCell>Leave Type</CTableHeaderCell>
                <CTableHeaderCell>From</CTableHeaderCell>
                <CTableHeaderCell>To</CTableHeaderCell>
                <CTableHeaderCell>Days</CTableHeaderCell>
                <CTableHeaderCell>Status</CTableHeaderCell>
                <CTableHeaderCell>Applied Date & Time</CTableHeaderCell>
                <CTableHeaderCell>Current Approver</CTableHeaderCell>
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
                  <CTableDataCell>{request.department}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color={request.leaveType === 'CL' ? 'primary' : 'warning'}>
                      {request.leaveType}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell>{request.startDate}</CTableDataCell>
                  <CTableDataCell>{request.endDate}</CTableDataCell>
                  <CTableDataCell>{request.days}</CTableDataCell>
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
                    <CBadge color="light">
                      {request.currentApprover}
                    </CBadge>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </div>
  )
}

export default AdminDashboard
