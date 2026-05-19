import React, { useState, useEffect } from 'react'
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
  CFormLabel,
  CInputGroup,
  CButtonGroup,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
} from '@coreui/react'

import AppFormSelect from 'src/components/form/AppFormSelect'
import AppContentSkeleton from 'src/components/custom/AppContentSkeleton'
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
  cilArrowUp,
  cilArrowDown,
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
  cilTrendingUp,
  cilTrendingDown,
  cilPulse,
  cilShield,
  cilTask,
  cilFileText,
  cilGraph,
  cilSpeedometer,
  cilBell,
  cilMenu,
  cilOptions,
  cilPuzzle,
  cilLockLocked,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'

import BasicProvider from 'src/constants/BasicProvider'
import { toast } from 'react-toastify'
import Cookies from 'js-cookie'

import moment from 'moment'
import { CChartBar, CChartLine, CChartDoughnut } from '@coreui/react-chartjs'
import logoimg from '../../assets/images/avtar.jpg'

const EmployeeDashboard = () => {
  const navigate = useNavigate()
  const userData = useSelector((state) => state.userData)

  // Early return if userData is not available - BEFORE all hooks
  if (!userData) {
    return (
      <div className="container py-4">
        <AppContentSkeleton ariaLabel="Loading employee dashboard" cards={4} rows={5} />
      </div>
    )
  }

  // State management - all hooks must be at the top level
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [profileData, setProfileData] = useState(null)
  const [attendanceData, setAttendanceData] = useState([])
  const [leaveData, setLeaveData] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [leaveStaffData, setStaffLeaveData] = useState([])
  const dispatch = useDispatch()

  const [stats, setStats] = useState({
    totalWorkingDays: 0,
    presentDays: 0,
    absentDays: 0,
    leaveDays: 0,
    overtimeHours: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0,
  })
  const [recentActivities, setRecentActivities] = useState([])
  const [showProfileModal, setShowProfileModal] = useState(false)
  const id = Cookies.get(`primery_user_id`)
  const employeeId = id
  const [profilePicture, setProfilePicture] = useState(null)

  // Role checking - same logic as HRMSDashboard
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
  useEffect(() => {
    const loadProfileImage = async () => {
      try {
        const response = await new BasicProvider(`profiles`).getRequest()
        const image = response?.data?.profileImage
        if (!image) {
          setProfilePicture(null)
          return
        }

        let imageUrl = null
        if (image?.filepath) {
          const signedRes = await new BasicProvider(
            `cms/files/signed-url?key=${image.filepath}`,
            dispatch,
          ).getRequest()

          imageUrl = signedRes?.data?.url
        }

        if (!imageUrl) {
          imageUrl = `${process.env.REACT_APP_NODE_URL}/files/${image._id}`
          console.log('⚙️ Fallback URL used:', imageUrl)
        }

        setProfilePicture(imageUrl)
        dispatch({ type: 'setProfilePicture', profilePicture: imageUrl })
      } catch (error) {
        console.error('❌ Error fetching profile image:', error)
      }
    }

    loadProfileImage()

    // Refresh before expiry
    const interval = setInterval(loadProfileImage, 4.5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [employeeId, dispatch])
 

  // Fetch employee profile data
  const fetchProfileData = async () => {
    try {
      const userId = userData?._id
      if (!userId) return

      const response = await new BasicProvider(`profiles`).getRequest()
      setProfileData(response.data)
    } catch (error) {
      console.error('Error fetching profile data:', error)
      toast.error('Failed to fetch profile data')
    }
  }

  const fetchAttendanceData = async () => {
    try {
      const userId = userData?._id
      if (!userId) return

      const month = moment().month() + 1
      const year = moment().year()

      const response = await new BasicProvider(
        `attendances/calendar?month=${month}&year=${year}`,
      ).getRequest()

      const records = response.data || []

      const presentDays = records.filter((r) => r.status === 'Present').length
      const absentDays = records.filter((r) => r.status === 'Absent').length
      const leaveDays = records.filter((r) => r.status === 'Leave').length

      const totalDays = records.length
      const percentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(0) : 0

      setAttendanceData({
        present: presentDays,
        absent: absentDays,
        leave: leaveDays,
        total: totalDays,
        percentage,
      })
    } catch (error) {
      console.error('Error fetching attendance data:', error)
    }
  }
 
  // Fetch leave data
  const fetchLeaveData = async () => {
    try {
      const userId = userData?._id
      if (!userId) return

      const response = await new BasicProvider(`leaves?page=1&count=10&user=${userId}`).getRequest()

      const records = response.data || []

      // Match exactly what API sends (no toLowerCase)
      const pending = records.filter((r) => r.status === 'Pending').length
      const approved = records.filter((r) => r.status === 'Approved').length
      const rejected = records.filter((r) => r.status === 'Rejected').length

      setLeaveData((prev) => ({
        ...prev,
        pendingLeaves: pending,
        approvedLeaves: approved,
        rejectedLeaves: rejected,
        leaveDays: records.length,
      }))
    } catch (error) {
      console.error('Error fetching leave data:', error)
      toast.error('Failed to fetch leave data')
    }
  }

  const fetchStaffLeaveData = async () => {
    try {
      const response = await new BasicProvider('leaves?page=1&count=1000000').getRequest()
      const leaves = response.data || []

      const today = new Date()
      const todayDate = new Date(today.toDateString())
      console.log('Today (raw):', today, 'TodayDate (stripped):', todayDate)

      const onLeaveUsers = leaves.filter((leave) => {
        const start = new Date(new Date(leave.start_date).toDateString())
        const end = new Date(new Date(leave.end_date).toDateString())

        const isToday = todayDate >= start && todayDate <= end
        console.log('Is today in range?', isToday)

        const hasApproved =
          leave.status?.toLowerCase() === 'approved' ||
          leave.approvals?.some((a) => a.status?.toLowerCase() === 'approved')
        console.log('Has approved?', hasApproved)

        return isToday && hasApproved
      })

      const staffOnLeave = onLeaveUsers.map((leave) => ({
        name: leave.user.name,
        email: leave.user.email,
        role: leave.user.role?.map((r) => r.display_name || r.name).join(', ') || 'N/A',
      }))

      setStaffLeaveData(staffOnLeave)
    } catch (err) {
      console.error('Error fetching leaves', err)
    }
  }

  // Fetch announcements
  const fetchAnnouncements = async () => {
    try {
      const userRole = userData?.role?.[0]?.name || 'Employee'
      const response = await new BasicProvider(`announcements/published/${userRole}`).getRequest()
      setAnnouncements(response.data || [])
    } catch (error) {
      console.error('Error fetching announcements:', error)
    }
  }

  // Fetch recent activities
  const fetchRecentActivities = async () => {
    try {
      // Mock recent activities - replace with actual API call
      const mockActivities = [
        {
          id: 1,
          type: 'attendance',
          message: 'Punched in at 9:15 AM',
          time: '2 hours ago',
          icon: cilClock,
          color: 'success',
        },
        {
          id: 2,
          type: 'leave',
          message: 'Leave application approved',
          time: '1 day ago',
          icon: cilCalendarCheck,
          color: 'success',
        },
        {
          id: 3,
          type: 'profile',
          message: 'Profile updated successfully',
          time: '3 days ago',
          icon: cilPencil,
          color: 'info',
        },
        {
          id: 4,
          type: 'announcement',
          message: 'New company policy announced',
          time: '1 week ago',
          icon: cilBell,
          color: 'primary',
        },
        {
          id: 5,
          type: 'overtime',
          message: 'Overtime hours recorded',
          time: '1 week ago',
          icon: cilClock,
          color: 'warning',
        },
      ]
      setRecentActivities(mockActivities)
    } catch (error) {
      console.error('Error fetching recent activities:', error)
    }
  }

  // Load all data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        fetchProfileData(),
        fetchAttendanceData(),
        fetchLeaveData(),
        fetchAnnouncements(),
        fetchStaffLeaveData(),
        fetchRecentActivities(),
      ])
      setLoading(false)
    }
    loadData()
  }, [])

  // Calculate attendance percentage
  const attendancePercentage =
    stats.totalWorkingDays > 0 ? Math.round((stats.presentDays / stats.totalWorkingDays) * 100) : 0

  // Chart data
  const attendanceChartData = {
    labels: ['Present', 'Absent', 'On Leave'],
    datasets: [
      {
        data: [attendanceData.present, attendanceData.absent, attendanceData.leave],
        backgroundColor: ['#28a745', '#dc3545', '#ffc107'],
        borderWidth: 0,
      },
    ],
  }

  const leaveChartData = {
    labels: ['Pending', 'Approved', 'Rejected'],
    datasets: [
      {
        data: [leaveData.pendingLeaves, leaveData.approvedLeaves, leaveData.rejectedLeaves],
        backgroundColor: ['#ffc107', '#28a745', '#dc3545'],
        borderWidth: 0,
      },
    ],
  }

  // If user is Admin or HR, redirect to main dashboard
  if (isAdminOrHR) {
    // Redirect to main HRMS dashboard
    window.location.href = '/hrms'
    return null
  }

  if (loading) {
    return (
      <div className="container py-4">
        <AppContentSkeleton ariaLabel="Loading employee dashboard" cards={4} rows={5} />
      </div>
    )
  }

  return (
    <div className="employee-dashboard">
   
      <CContainer fluid>
        {/* Header */}
        <div className="dashboard-header mb-4 pt-4">
          <CRow className="align-items-center">
            <CCol>
              <h1 className="mb-2 fw-bold text-dark">My HRMS Dashboard</h1>
              <p className="mb-0 text-muted">
                Welcome back,{' '}
                {profileData?.user?.name || profileData?.name || userData?.name || 'Employee'}!
                Here's your personal HR overview.
              </p>
            </CCol>
            <CCol xs="auto">
              <CButtonGroup>
                <CButton
                  color={activeTab === 'overview' ? 'primary' : 'outline-primary'}
                  onClick={() => setActiveTab('overview')}
                >
                  <CIcon icon={cilSpeedometer} className="me-1" />
                  Overview
                </CButton>
                <CButton
                  color={activeTab === 'attendance' ? 'primary' : 'outline-primary'}
                  onClick={() => setActiveTab('attendance')}
                >
                  <CIcon icon={cilClock} className="me-1" />
                  Attendance
                </CButton>
                <CButton
                  color={activeTab === 'leaves' ? 'primary' : 'outline-primary'}
                  onClick={() => setActiveTab('leaves')}
                >
                  <CIcon icon={cilCalendarCheck} className="me-1" />
                  Leaves
                </CButton>
              </CButtonGroup>
            </CCol>
          </CRow>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Personal Info Card */}
            {profileData && (
              <CCard className="border-0 shadow-sm mb-4">
                <CCardBody className="p-4">
                  <CRow className="align-items-center">
                    <CCol md={8}>
                      <div className="d-flex align-items-center">
                        <div className="profile-avatar me-4">
                          <img
                            src={profilePicture ? profilePicture : ''}
                            alt="Profile"
                            width={50}
                            height={50}
                            style={{ borderRadius: '50%', objectFit: 'cover' }}
                            onError={(e) => (e.target.src = logoimg)}
                          />
                        </div>
                        <div>
                          <h4 className="mb-2 fw-bold">
                            {profileData?.user?.name || profileData?.name || 'Employee Name'}
                          </h4>
                          <p className="mb-1 text-muted">
                            <CIcon icon={cilBuilding} className="me-2" />
                            {profileData?.user?.role?.[0]?.display_name ||
                              profileData?.role?.[0]?.display_name ||
                              'Employee'}
                          </p>
                          <p className="mb-1 text-muted">
                            <CIcon icon={cilLocationPin} className="me-2" />
                            {profileData?.location || 'Location not specified'}
                          </p>
                          <p className="mb-0 text-muted">
                            <CIcon icon={cilEnvelopeClosed} className="me-2" />
                            {profileData?.user?.email || profileData?.email || 'email@company.com'}
                          </p>
                        </div>
                      </div>
                    </CCol>
                    <CCol md={4} className="text-end">
                      <CButton
                        color="primary"
                        onClick={() => navigate('/hrms/profile')}
                        className="me-2"
                      >
                        <CIcon icon={cilPencil} className="me-1" />
                        Edit Profile
                      </CButton>
                      
                    </CCol>
                  </CRow>
                </CCardBody>
              </CCard>
            )}

            {/* Stats Cards */}
            <CRow className="g-4 mb-4">
              <CCol sm={6} lg={3}>
                <CCard className="stat-card border-0 shadow-sm">
                  <CCardBody className="p-4">
                    <div className="d-flex align-items-center">
                      <div className="stat-icon bg-success">
                        <CIcon icon={cilCheckCircle} className="text-white" size="xl" />
                      </div>
                      <div className="ms-3">
                        <h3 className="mb-1 fw-bold text-success">{attendanceData.present}</h3>
                        <p className="mb-0 text-muted small">Present Days</p>
                        <small className="text-success">
                          {attendanceData.percentage}% attendance
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
                        <h3 className="mb-1 fw-bold text-warning">{leaveData.pendingLeaves}</h3>
                        <p className="mb-0 text-muted small">Pending Leaves</p>
                        <small className="text-muted">
                          {leaveData.approvedLeaves} approved this month
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
                        <CIcon icon={cilClock} className="text-white" size="xl" />
                      </div>
                      <div className="ms-3">
                        <h3 className="mb-1 fw-bold text-info">{stats.overtimeHours}h</h3>
                        <p className="mb-0 text-muted small">Overtime Hours</p>
                        <small className="text-muted">This month</small>
                      </div>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>

              <CCol sm={6} lg={3}>
                <CCard className="stat-card border-0 shadow-sm">
                  <CCardBody className="p-4">
                    <div className="d-flex align-items-center">
                      <div className="stat-icon bg-primary">
                        <CIcon icon={cilBell} className="text-white" size="xl" />
                      </div>
                      <div className="ms-3">
                        <h3 className="mb-1 fw-bold text-primary">{announcements.length}</h3>
                        <p className="mb-0 text-muted small">Announcements</p>
                        <small className="text-muted">Latest updates</small>
                      </div>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
            <CRow className="g-4 mb-4">
              <CCol lg={6}>
                <CCard className="border-0 shadow-sm">
                  <CCardHeader className="bg-light">
                    <h6 className="mb-0 fw-bold">My Attendance</h6>
                  </CCardHeader>
                  <CCardBody className="p-4 d-flex justify-content-center">
                    <div style={{ width: '350px', height: '350px' }}>
                      <CChartDoughnut data={attendanceChartData} />
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>

              <CCol lg={6}>
                <CCard className="border-0 shadow-sm">
                  <CCardHeader className="bg-light">
                    <h6 className="mb-0 fw-bold">My Leave Status</h6>
                  </CCardHeader>
                  <CCardBody className="p-4 d-flex justify-content-center">
                    <div style={{ width: '350px', height: '350px' }}>
                      <CChartDoughnut data={leaveChartData} />
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
          </>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <>
            <CCard className="border-0 shadow-sm mb-4">
              <CCardHeader className="bg-light">
                <h6 className="mb-0 fw-bold">Attendance Summary</h6>
              </CCardHeader>
              <CCardBody className="p-4">
                <CRow className="g-4">
                  <CCol md={3}>
                    <div className="text-center">
                      <h3 className="fw-bold text-success">{attendanceData.present}</h3>
                      <p className="text-muted mb-0">Present Days</p>
                    </div>
                  </CCol>
                  <CCol md={3}>
                    <div className="text-center">
                      <h3 className="fw-bold text-danger">{attendanceData.absent}</h3>
                      <p className="text-muted mb-0">Absent Days</p>
                    </div>
                  </CCol>
                  <CCol md={3}>
                    <div className="text-center">
                      <h3 className="fw-bold text-warning">{attendanceData.leave}</h3>
                      <p className="text-muted mb-0">Leave Days</p>
                    </div>
                  </CCol>
                  <CCol md={3}>
                    <div className="text-center">
                      <h3 className="fw-bold text-info">{attendanceData.percentage}%</h3>
                      <p className="text-muted mb-0">Attendance Rate</p>
                    </div>
                  </CCol>
                </CRow>
                <div className="mt-4">
                  <CProgress
                    value={attendanceData.percentage}
                    color="success"
                    className="mb-2"
                    style={{ height: '10px' }}
                  />
                  <small className="text-muted">Overall attendance performance</small>
                </div>
              </CCardBody>
            </CCard>

            <CCard className="border-0 shadow-sm">
              <CCardHeader className="bg-light">
                <h6 className="mb-0 fw-bold">Quick Actions</h6>
              </CCardHeader>
              <CCardBody className="p-4">
                <CRow className="g-3">
                  <CCol md={4}>
                    <CButton
                      color="success"
                      className="w-100 py-3"
                      onClick={() => navigate('/hrms/attendance')}
                    >
                      <CIcon icon={cilClock} className="me-2" />
                      Punch In/Out
                    </CButton>
                  </CCol>
                  <CCol md={4}>
                    <CButton
                      color="info"
                      className="w-100 py-3"
                      onClick={() => navigate('/hrms/muster-roll')}
                    >
                      <CIcon icon={cilChartLine} className="me-2" />
                      View Reports
                    </CButton>
                  </CCol>
                  <CCol md={4}>
                    <CButton
                      color="warning"
                      className="w-100 py-3"
                      onClick={() => setActiveTab('leaves')}
                    >
                      <CIcon icon={cilCalendarCheck} className="me-2" />
                      Apply Leave
                    </CButton>
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
          </>
        )}

        {/* Leaves Tab */}
        {activeTab === 'leaves' && (
          <>
            <CCard className="border-0 shadow-sm mb-4">
              <CCardHeader className="bg-light">
                <h6 className="mb-0 fw-bold">Leave Summary</h6>
              </CCardHeader>
              <CCardBody className="p-4">
                <CRow className="g-4">
                  <CCol md={3}>
                    <div className="text-center">
                      <h3 className="fw-bold text-warning">{leaveData.pendingLeaves}</h3>
                      <p className="text-muted mb-0">Pending</p>
                    </div>
                  </CCol>
                  <CCol md={3}>
                    <div className="text-center">
                      <h3 className="fw-bold text-success">{leaveData.approvedLeaves}</h3>
                      <p className="text-muted mb-0">Approved</p>
                    </div>
                  </CCol>
                  <CCol md={3}>
                    <div className="text-center">
                      <h3 className="fw-bold text-danger">{leaveData.rejectedLeaves}</h3>
                      <p className="text-muted mb-0">Rejected</p>
                    </div>
                  </CCol>
                  <CCol md={3}>
                    <div className="text-center">
                      <h3 className="fw-bold text-info">{leaveData.leaveDays}</h3>
                      <p className="text-muted mb-0">Total Taken</p>
                    </div>
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>

            <CCard className="border-0 shadow-sm">
              <CCardHeader className="bg-light">
                <h6 className="mb-0 fw-bold">Quick Actions</h6>
              </CCardHeader>
              <CCardBody className="p-4">
                <CRow className="g-3">
                  <CCol md={4}>
                    <CButton
                      color="primary"
                      className="w-100 py-3"
                      onClick={() => navigate('/hrms/leave/employee')}
                    >
                      <CIcon icon={cilPlus} className="me-2" />
                      Apply for Leave
                    </CButton>
                  </CCol>
                  <CCol md={4}>
                    <CButton
                      color="info"
                      className="w-100 py-3"
                      onClick={() => navigate('/hrms/leave/employee')}
                    >
                      <CIcon icon={cilMagnifyingGlass} className="me-2" />
                      View Leave History
                    </CButton>
                  </CCol>
                  <CCol md={4}>
                    <CButton
                      color="success"
                      className="w-100 py-3"
                      onClick={() => navigate('/hrms/leave/employee')}
                    >
                      <CIcon icon={cilCalendarCheck} className="me-2" />
                      Leave Balance
                    </CButton>
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
          </>
        )}

        {/* Profile Details Modal */}
        <CModal show={showProfileModal} onClose={() => setShowProfileModal(false)} size="lg">
          <CModalHeader closeButton>
            <CModalTitle>Profile Details</CModalTitle>
          </CModalHeader>
          <CModalBody>
            {profileData && (
              <CRow className="g-3">
                <CCol md={6}>
                  <h6>Personal Information</h6>
                  <p>
                    <strong>Name:</strong> {profileData.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {profileData.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {profileData.mobile}
                  </p>
                  <p>
                    <strong>Gender:</strong> {profileData.gender}
                  </p>
                  <p>
                    <strong>Address:</strong> {profileData.address}
                  </p>
                </CCol>
                <CCol md={6}>
                  <h6>Work Information</h6>
                  <p>
                    <strong>Role:</strong> {profileData.role?.map((r) => r.display_name).join(', ')}
                  </p>
                  <p>
                    <strong>Department:</strong> {profileData.department || 'N/A'}
                  </p>
                  <p>
                    <strong>Status:</strong>
                    <CBadge
                      color={profileData.status === 'active' ? 'success' : 'secondary'}
                      className="ms-2"
                    >
                      {profileData.status}
                    </CBadge>
                  </p>
                  <p>
                    <strong>Join Date:</strong>{' '}
                    {moment(profileData.created_at).format('MMM DD, YYYY')}
                  </p>
                </CCol>
              </CRow>
            )}
          </CModalBody>
          <CModalFooter>
            <CButton
              color="primary"
              onClick={() => {
                navigate('/hrms/profile')
                setShowProfileModal(false)
              }}
            >
              Edit Profile
            </CButton>
            <CButton color="secondary" onClick={() => setShowProfileModal(false)}>
              Close
            </CButton>
          </CModalFooter>
        </CModal>
      </CContainer>

      <style jsx>{`
        .employee-dashboard {
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

        .profile-avatar img {
          object-fit: cover;
          border: 3px solid #e9ecef;
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

export default EmployeeDashboard
