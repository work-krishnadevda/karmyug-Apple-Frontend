import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CButton,
  CRow,
  CBadge,
  CSpinner,
  CAlert,
  CProgress,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormSelect,
  CFormLabel,
  CInputGroup,
  CButtonGroup,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
} from '@coreui/react'
import EmployeeDashboard from './EmployeeDashboard'
import {
  cilPeople,
  cilClock,
  cilCalendarCheck,
  cilChartLine,
  cilUserPlus,
  cilSettings,
  cilSearch,
  cilFilter,
  cilRefresh,
  cilMagnifyingGlass,
  cilPencil,
  cilTrash,
  cilPlus,
  cilArrowTop,
  cilArrowBottom,
  cilCheckCircle,
  cilXCircle,
  cilWarning,
  cilInfo,
  cilCalendar,
  cilLocationPin,
  cilBuilding,
  cilUser,
  cilEnvelopeClosed,
  cilPhone,
  cilStar,
  cilPulse,
  cilShield,
  cilTask,
  cilFileText,
  cilGraph,
  cilSpeedometer,
  cilBell,
  cilMenu,
  cilOptions,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import BasicProvider from 'src/constants/BasicProvider'
import { toast } from 'react-toastify'
import moment from 'moment'
import { CChartBar, CChartLine, CChartDoughnut } from '@coreui/react-chartjs'
import avtart from '../../assets/images/avtar.jpg'
import SwitchingHeader from 'src/components/SwitchingHeader'
const HRMSDashboard = () => {
  const navigate = useNavigate()
  const userData = useSelector((state) => state.userData)

  // State management
  const [loading, setLoading] = useState(true) 
  const [activeTab, setActiveTab] = useState('overview')
  const [staffData, setStaffData] = useState([]) 
  const [leaveData, setLeaveData] = useState([])
  const [announcements, setAnnouncements] = useState([]) 
  const [stats, setStats] = useState({
    totalStaff: 0,
    activeStaff: 0,
    presentToday: 0,
    absentToday: 0,
    onLeave: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0,
    newHires: 0,
    departures: 0,
  })
  const [recentActivities, setRecentActivities] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showStaffModal, setShowStaffModal] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState(null)
  // Role checking - improved logic
  const isAdmin = userData?.role?.some((role) => {
    const roleName = role?.name?.toLowerCase()
    const displayName = role?.display_name?.toLowerCase()
    return (
      roleName === 'admin' ||
      roleName === process.env.REACT_APP_ADMIN?.toLowerCase() ||
      displayName === 'admin' ||
      displayName === 'administrator'
    )
  })

  const isHR = userData?.role?.some((role) => {
    const roleName = role?.name?.toLowerCase()
    const displayName = role?.display_name?.toLowerCase()
    return (
      roleName === 'hr' ||
      roleName === process.env.REACT_APP_HR?.toLowerCase() ||
      displayName === 'hr' ||
      displayName === 'human resources'
    )
  })

  const isAdminOrHR = isAdmin || isHR
 
  const fetchRecentActivities = useCallback(async () => {
    try {
      // Mock recent activities - replace with actual API call
      const mockActivities = [
        {
          id: 1,
          type: 'hire',
          message: 'New employee John Doe joined',
          time: '2 hours ago',
          icon: cilUserPlus,
          color: 'success',
        },
        {
          id: 2,
          type: 'leave',
          message: 'Sarah Wilson applied for leave',
          time: '4 hours ago',
          icon: cilCalendarCheck,
          color: 'warning',
        },
        {
          id: 3,
          type: 'attendance',
          message: 'Mike Johnson marked absent',
          time: '6 hours ago',
          icon: cilClock,
          color: 'danger',
        },
        {
          id: 4,
          type: 'update',
          message: 'Profile updated by HR',
          time: '1 day ago',
          icon: cilPencil,
          color: 'info',
        },
        {
          id: 5,
          type: 'announcement',
          message: 'New company policy announced',
          time: '2 days ago',
          icon: cilBell,
          color: 'primary',
        },
      ]
      setRecentActivities(mockActivities)
    } catch (error) {
      console.error('Error fetching recent activities:', error)
    }
  }, [])
  const fetchDashboardSummary = useCallback(async () => {
    try {
      setLoading(true)
      const response = await new BasicProvider('dashboard/summary').getRequest()
      const data = response.data || {}
      const attendance = data.attendance || {}
      const staff = data.staff || {}
      const leaves = data.leaves || {}
      const announcementsData = data.announcements || []

      setStats({
        totalStaff: staff.total || 0,
        activeStaff: staff.active || 0,
        newHires: staff.newHires || 0,

        onLeave: attendance.onLeave || 0,
        pendingLeaves: leaves.summary?.pending || 0,
        approvedLeaves: leaves.summary?.approved || 0,
        rejectedLeaves: leaves.summary?.rejected || 0,
        presentToday: attendance.presentCount || 0,
        absentToday: attendance.absentCount || 0,
      })

      setStaffData(staff.data || [])
      setLeaveData({
        pending: leaves.summary?.pending || 0,
        approved: leaves.summary?.approved || 0,
        rejected: leaves.summary?.rejected || 0,
      }) 
      setAnnouncements(announcementsData || [])
    } catch (error) {
      console.error('Error fetching dashboard summary:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const loadDashboard = async () => {
      await fetchDashboardSummary()
      await fetchRecentActivities()
      // await fetchAttendanceData()
    }

    loadDashboard()
  }, [fetchDashboardSummary, fetchRecentActivities])

  // Filter staff data - memoized for performance
  const filteredStaff = useMemo(() => {
    return staffData.filter((staff) => {
      const matchesSearch =
        !searchTerm ||
        staff.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.mobile?.includes(searchTerm)

      const matchesRole =
        !filterRole ||
        staff.role?.some((role) => role.name === filterRole || role.display_name === filterRole)

      const matchesStatus = !filterStatus || staff.status === filterStatus

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [staffData, searchTerm, filterRole, filterStatus])

  // Get unique roles for filter - memoized for performance
  const uniqueRoles = useMemo(() => {
    return [
      ...new Set(
        staffData.flatMap(
          (staff) => staff.role?.map((role) => role.display_name || role.name) || [],
        ),
      ),
    ]
  }, [staffData])

  // Chart data - memoized for performance
  const attendanceChartData = useMemo(
    () => ({
      labels: ['Present', 'Absent', 'On Leave'],
      datasets: [
        {
          data: [stats.presentToday, stats.absentToday, stats.onLeave],
          backgroundColor: ['#28a745', '#dc3545', '#ffc107'],
          borderWidth: 0,
        },
      ],
    }),
    [stats.presentToday, stats.absentToday, stats.onLeave],
  )

  const leaveChartData = useMemo(
    () => ({
      labels: ['Pending', 'Approved', 'Rejected'],
      datasets: [
        {
          data: [leaveData.pending, leaveData.approved, leaveData.rejected],
          backgroundColor: ['#ffc107', '#28a745', '#dc3545'],
          borderWidth: 0,
        },
      ],
    }),
    [leaveData.pending, leaveData.approved, leaveData.rejected],
  )

  const roleDistributionData = useMemo(
    () => ({
      labels: uniqueRoles,
      datasets: [
        {
          data: uniqueRoles.map(
            (role) =>
              staffData.filter((staff) =>
                staff.role?.some((r) => r.display_name === role || r.name === role),
              ).length,
          ),
          backgroundColor: [
            '#007bff',
            '#28a745',
            '#ffc107',
            '#dc3545',
            '#6f42c1',
            '#fd7e14',
            '#20c997',
            '#e83e8c',
            '#6c757d',
            '#17a2b8',
          ],
          borderWidth: 0,
        },
      ],
    }),
    [uniqueRoles, staffData],
  )

  // If user is not Admin or HR, show Employee Dashboard
  if (!isAdminOrHR) {
    return <EmployeeDashboard />
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <CSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="hrms-dashboard" style={{ paddingTop: '20px' }}>
      <CContainer fluid>
        <div className="dashboard-toolbar__switcher mb-3">
          <SwitchingHeader />
        </div>

        {/* Header */}
        <div className="dashboard-header mb-4 pt-4">
          <CRow className="align-items-center">
            <CCol>
              <h1 className="mb-4 fw-bold text-dark">
                {isAdminOrHR ? 'HRMS Management Dashboard' : 'My HRMS Dashboard'}
              </h1>
              <p className="mb-0 text-muted">
                {isAdminOrHR
                  ? 'Comprehensive view of all staff and HR operations'
                  : 'Your personal HR information and activities'}
              </p>
            </CCol>
            <CCol xs="auto">
              <div className="d-flex align-items-center gap-2">
                <CButtonGroup>
                  <CButton
                    color={activeTab === 'overview' ? 'primary' : 'outline-primary'}
                    onClick={() => setActiveTab('overview')}
                  >
                    <CIcon icon={cilSpeedometer} className="me-1" />
                    Overview
                  </CButton>
                  {isAdminOrHR && (
                    <>
                      <CButton
                        color={activeTab === 'staff' ? 'primary' : 'outline-primary'}
                        onClick={() => setActiveTab('staff')}
                      >
                        <CIcon icon={cilPeople} className="me-1" />
                        Staff
                      </CButton>
                    </>
                  )}
                </CButtonGroup>
              </div>
            </CCol>
          </CRow>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <CRow className="g-4 mb-4">
              <CCol sm={6} lg={3}>
                <CCard className="stat-card border-0 shadow-sm">
                  <CCardBody className="p-4">
                    <div className="d-flex align-items-center">
                      <div className="stat-icon bg-primary">
                        <CIcon icon={cilPeople} className="text-white" size="xl" />
                      </div>
                      <div className="ms-3">
                        <h3 className="mb-1 fw-bold text-primary">{stats.activeStaff}</h3>
                        <p className="mb-0 text-muted small">Total Staff</p>
                        <small className="text-success">
                          <CIcon icon={cilArrowTop} className="me-1" />+{stats.newHires} this month
                        </small>
                      </div>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>

              <CCol sm={6} lg={3}>
                <CCard className="stat-card border-0 shadow-sm">
                  <CCardBody className="p-4">
                    <div className="d-flex align-items-center">
                      <div className="stat-icon bg-success">
                        <CIcon icon={cilCheckCircle} className="text-white" size="xl" />
                      </div>
                      <div className="ms-3">
                        <h3 className="mb-1 fw-bold text-success"> 
                          {stats.presentToday}
                        </h3>

                        <p className="mb-0 text-muted small">Present Today</p>
                        <small className="text-muted">
                          {stats.activeStaff > 0
                            ? Math.round((stats.presentToday / stats.activeStaff) * 100)
                            : 0}
                          % attendance
                        </small>
                      </div>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>

              <CCol sm={6} lg={3}>
                <CCard className="stat-card border-0 shadow-sm">
                  <CCardBody className="p-4">
                    <div className="d-flex align-items-center">
                      <div className="stat-icon bg-warning">
                        <CIcon icon={cilCalendarCheck} className="text-white" size="xl" />
                      </div>
                      <div className="ms-3">
                        <h3 className="mb-1 fw-bold text-warning">{leaveData.pending || 0}</h3>
                        <p className="mb-0 text-muted small">Pending Leaves</p>
                        <small className="text-muted">
                          {leaveData.approved || 0} approved this month
                        </small>
                      </div>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>

              <CCol sm={6} lg={3}>
                <CCard className="stat-card border-0 shadow-sm">
                  <CCardBody className="p-4">
                    <div className="d-flex align-items-center">
                      <div className="stat-icon bg-info">
                        <CIcon icon={cilBell} className="text-white" size="xl" />
                      </div>
                      <div className="ms-3">
                        <h3 className="mb-1 fw-bold text-info">{announcements.length}</h3>
                        <p className="mb-0 text-muted small">Announcements</p>
                        <small className="text-muted">Latest updates</small>
                      </div>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>

            {/* Charts Row */}
            <CRow className="g-4 mb-4">
              <CCol lg={4}>
                <CCard className="border-0 shadow-sm">
                  <CCardHeader className="bg-light">
                    <h6 className="mb-0 fw-bold">Today's Attendance</h6>
                  </CCardHeader>
                  <CCardBody className="p-4">
                    <CChartDoughnut data={attendanceChartData} />
                  </CCardBody>
                </CCard>
              </CCol>

              <CCol lg={4}>
                <CCard className="border-0 shadow-sm">
                  <CCardHeader className="bg-light">
                    <h6 className="mb-0 fw-bold">Leave Status</h6>
                  </CCardHeader>
                  <CCardBody className="p-4">
                    <CChartDoughnut data={leaveChartData} />
                  </CCardBody>
                </CCard>
              </CCol>

              <CCol lg={4}>
                <CCard className="border-0 shadow-sm">
                  <CCardHeader className="bg-light">
                    <h6 className="mb-0 fw-bold">Role Distribution</h6>
                  </CCardHeader>
                  <CCardBody className="p-18">
                    <CChartDoughnut data={roleDistributionData} />
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
          </>
        )}

        {/* Staff Tab - Admin/HR Only */}
        {activeTab === 'staff' && isAdminOrHR && (
          <>
            {/* Staff Management Header */}
            <CCard className="border-0 shadow-sm mb-4">
              <CCardBody className="p-4">
                <CRow className="align-items-center">
                  <CCol>
                    <h5 className="mb-2 fw-bold">Staff Management</h5>
                    <p className="mb-0 text-muted">Manage all employees and their information</p>
                  </CCol>
                  <CCol xs="auto">
                    <CButton
                      color="primary"
                      onClick={() => navigate('/hrms/addstaff')}
                      className="me-2"
                    >
                      <CIcon icon={cilPlus} className="me-1" />
                      Add Staff
                    </CButton>
                    <CButton color="outline-primary" onClick={() => navigate('/hrms/staff')}>
                      <CIcon icon={cilMagnifyingGlass} className="me-1" />
                      View All
                    </CButton>
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>

            {/* Filters */}
            <CCard className="border-0 shadow-sm mb-4">
              <CCardBody className="p-4">
                <CRow className="g-3">
                  <CCol md={4}>
                    <CFormLabel>Search Staff</CFormLabel>
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
                    <CFormLabel>Filter by Role</CFormLabel>
                    <CFormSelect value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                      <option value="">All Roles</option>
                      {uniqueRoles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                  <CCol md={4}>
                    <CFormLabel>Filter by Status</CFormLabel>
                    <CFormSelect
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </CFormSelect>
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>

            {/* Staff Table */}
            <CCard className="border-0 shadow-sm">
              <CCardHeader className="bg-light">
                <h6 className="mb-0 fw-bold">
                  Staff List ({filteredStaff.length} of {staffData.length})
                </h6>
              </CCardHeader>
              <CCardBody className="p-0">
                <div className="table-responsive">
                  <CTable hover>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Employee</CTableHeaderCell>
                        <CTableHeaderCell>Role</CTableHeaderCell>
                        {/* <CTableHeaderCell>Department</CTableHeaderCell> */}
                        <CTableHeaderCell>Status</CTableHeaderCell>
                        <CTableHeaderCell>Join Date</CTableHeaderCell>
                        <CTableHeaderCell>Actions</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {filteredStaff.slice(0, 10).map((staff) => (
                        <CTableRow key={staff._id}>
                          <CTableDataCell>
                            <div className="d-flex align-items-center">
                              <div className="staff-avatar me-3">
                                <img
                                  // src={staff.featured_image?.filepath || avtart}
                                  src={avtart}
                                  alt={staff.name}
                                  className="rounded-circle"
                                  width="40"
                                  height="40"
                                />
                              </div>
                              <div>
                                <h6 className="mb-1 fw-semibold">{staff.name}</h6>
                                <small className="text-muted">{staff.email}</small>
                              </div>
                            </div>
                          </CTableDataCell>
                          <CTableDataCell>
                            {staff.role?.map((role, index) => (
                              <CBadge key={index} color="primary" className="me-1">
                                {role.display_name || role.name}
                              </CBadge>
                            ))}
                          </CTableDataCell>
                          {/* <CTableDataCell>
                            <span className="text-muted">{staff.location || 'N/A'}</span>
                          </CTableDataCell> */}
                          <CTableDataCell>
                            <CBadge color={staff.status === 'active' ? 'success' : 'secondary'}>
                              {staff.status}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell>
                            <small className="text-muted">
                              {moment(staff.created_at).format('MMM DD, YYYY')}
                            </small>
                          </CTableDataCell>
                          <CTableDataCell>
                            <CButtonGroup size="sm">
                              {/* <CButton
                                color="outline-primary"
                                size="sm"
                                onClick={() => {
                                  setSelectedStaff(staff)
                                  setShowStaffModal(true)
                                }}
                              >
                                <CIcon icon={cilMagnifyingGlass} />
                              </CButton> */}
                              <CButton
                                color="outline-success"
                                size="sm"
                                onClick={() => navigate(`/hrms/staff/profile/${staff._id}`)}
                              >
                                <CIcon icon={cilPencil} />
                              </CButton>
                            </CButtonGroup>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </div>
              </CCardBody>
            </CCard>
          </>
        )}

        {/* Analytics Tab - Admin/HR Only */}
        {activeTab === 'analytics' && isAdminOrHR && (
          <>
            <CRow className="g-4">
              <CCol lg={6}>
                <CCard className="border-0 shadow-sm">
                  <CCardHeader className="bg-light">
                    <h6 className="mb-0 fw-bold">Attendance Trends</h6>
                  </CCardHeader>
                  <CCardBody className="p-4">
                    <CChartLine
                      data={{
                        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                        datasets: [
                          {
                            label: 'Present',
                            data: [45, 42, 48, 46, 44, 20, 15],
                            borderColor: '#28a745',
                            backgroundColor: 'rgba(40, 167, 69, 0.1)',
                            tension: 0.4,
                          },
                          {
                            label: 'Absent',
                            data: [5, 8, 2, 4, 6, 25, 30],
                            borderColor: '#dc3545',
                            backgroundColor: 'rgba(220, 53, 69, 0.1)',
                            tension: 0.4,
                          },
                        ],
                      }}
                    />
                  </CCardBody>
                </CCard>
              </CCol>

              <CCol lg={6}>
                <CCard className="border-0 shadow-sm">
                  <CCardHeader className="bg-light">
                    <h6 className="mb-0 fw-bold">Department Distribution</h6>
                  </CCardHeader>
                  <CCardBody className="p-4">
                    <CChartBar
                      data={{
                        labels: ['IT', 'HR', 'Finance', 'Operations', 'Sales'],
                        datasets: [
                          {
                            label: 'Employees',
                            data: [25, 15, 10, 30, 20],
                            backgroundColor: [
                              '#007bff',
                              '#28a745',
                              '#ffc107',
                              '#dc3545',
                              '#6f42c1',
                            ],
                          },
                        ],
                      }}
                    />
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
          </>
        )}

        {/* Staff Details Modal */}
        <CModal show={showStaffModal} onClose={() => setShowStaffModal(false)} size="lg">
          <CModalHeader closeButton>
            <CModalTitle>Staff Details</CModalTitle>
          </CModalHeader>
          <CModalBody>
            {selectedStaff && (
              <CRow className="g-3">
                <CCol md={6}>
                  <h6>Personal Information</h6>
                  <p>
                    <strong>Name:</strong> {selectedStaff.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedStaff.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {selectedStaff.mobile}
                  </p>
                  <p>
                    <strong>Gender:</strong> {selectedStaff.gender}
                  </p>
                </CCol>
                <CCol md={6}>
                  <h6>Work Information</h6>
                  <p>
                    <strong>Role:</strong>{' '}
                    {selectedStaff.role?.map((r) => r.display_name).join(', ')}
                  </p>
                  <p>
                    <strong>Department:</strong> {selectedStaff.department || 'N/A'}
                  </p>
                  <p>
                    <strong>Status:</strong>
                    <CBadge
                      color={selectedStaff.status === 'active' ? 'success' : 'secondary'}
                      className="ms-2"
                    >
                      {selectedStaff.status}
                    </CBadge>
                  </p>
                  <p>
                    <strong>Join Date:</strong>{' '}
                    {moment(selectedStaff.created_at).format('MMM DD, YYYY')}
                  </p>
                </CCol>
              </CRow>
            )}
          </CModalBody>
          <CModalFooter>
            <CButton
              color="primary"
              onClick={() => {
                navigate(`/hrms/staff/profile/${selectedStaff?._id}`)
                setShowStaffModal(false)
              }}
            >
              View Full Profile
            </CButton>
            <CButton color="secondary" onClick={() => setShowStaffModal(false)}>
              Close
            </CButton>
          </CModalFooter>
        </CModal>
      </CContainer>

      <style jsx>{`
        .hrms-dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }

        .dashboard-header {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
        }

        .stat-card {
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .activity-item {
          transition: all 0.2s ease;
        }

        .activity-item:hover {
          background-color: #f8f9fa;
        }

        .activity-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .announcement-item {
          transition: all 0.2s ease;
        }

        .announcement-item:hover {
          background-color: #f8f9fa;
        }

        .announcement-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .staff-avatar img {
          object-fit: cover;
        }

        @media (max-width: 768px) {
          .dashboard-header {
            padding: 1rem;
          }

          .stat-icon {
            width: 50px;
            height: 50px;
          }
        }
      `}</style>
    </div>
  )
}

export default HRMSDashboard
