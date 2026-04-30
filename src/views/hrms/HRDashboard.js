import React, { useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CButton,
  CRow,
  CSidebar,
  CSidebarNav,
  CNavItem,
  CNavLink,
  CSidebarBrand,
  CBadge
} from '@coreui/react'
import {
  cilSpeedometer,
  cilPeople,
  cilClock,
  cilCalendarCheck,
  cilChartLine,
  cilSettings,
  cilDescription,
  cilUserPlus,
  cilFile,
  cilArrowRight
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useNavigate } from 'react-router-dom'

const HRDashboard = () => {
  const [sidebarShow, setSidebarShow] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const navigate = useNavigate()

  const menuItems = [
    { name: 'Dashboard', icon: cilSpeedometer, key: 'dashboard' },
    { name: 'Onboarding', icon: cilPeople, key: 'onboarding', path: '/hrms/onboarding' },
    { name: 'Documents', icon: cilDescription, key: 'documents', path: '/hrms/documents' },
    { name: 'Attendance', icon: cilClock, key: 'attendance' },
    { name: 'Leave', icon: cilCalendarCheck, key: 'leave' },
    { name: 'Reports', icon: cilChartLine, key: 'reports' },
    { name: 'Settings', icon: cilSettings, key: 'settings' }
  ]

  const quickActions = [
    {
      title: 'Employee Onboarding',
      description: 'Streamline your employee onboarding process with our comprehensive form',
      icon: cilUserPlus,
      color: 'primary',
      path: '/hrms/onboarding',
      features: [
        'Personal & Professional Information',
        'Document Upload (Resume, ID, Certificates)',
        'Department & Designation Selection',
        'Active/Inactive Status Toggle',
        'Onboard & Re-Onboard Actions'
      ]
    },
    {
      title: 'Document Generation',
      description: 'Generate and manage employee documents with ease',
      icon: cilFile,
      color: 'success',
      path: '/hrms/documents',
      features: [
        'Welcome Letter Generation',
        'Offer Letter Creation',
        'Salary Certificate',
        'Whomsoever It May Concern Letters',
        'PDF & Word Export Options'
      ]
    }
  ]

  const handleNavigation = (path) => {
    if (path) {
      navigate(path)
    }
  }

  return (
    <div className="hr-dashboard">
      {/* Sidebar */}
      <CSidebar
        show={sidebarShow}
        onShowChange={setSidebarShow}
        className="hr-sidebar sidebar-fixed"
        colorScheme="light"
      >
        <CSidebarBrand className="d-flex align-items-center justify-content-center py-4">
          <div className="hr-logo">
            <h4 className="mb-0 fw-bold text-primary">HR Portal</h4>
            <small className="text-muted">Management Dashboard</small>
          </div>
        </CSidebarBrand>
        
        <CSidebarNav>
          {menuItems.map((item) => (
            <CNavItem key={item.key}>
              <CNavLink
                className={`hr-nav-link ${activeTab === item.key ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.key)
                  handleNavigation(item.path)
                }}
                style={{ cursor: 'pointer' }}
              >
                <CIcon icon={item.icon} className="nav-icon" />
                {item.name}
              </CNavLink>
            </CNavItem>
          ))}
        </CSidebarNav>
      </CSidebar>

      {/* Main Content */}
      <div className="wrapper d-flex flex-column min-vh-100 bg-light">
        <div className="body flex-grow-1 px-3">
          <CContainer className="h-auto">
            
            {/* Header */}
            <div className="hr-header mb-4 mt-3">
              <div className="text-center">
                <h1 className="mb-2 fw-bold text-dark">HR Management System</h1>
                <p className="mb-4 text-muted lead">Modern, Professional & Easy-to-Use HR Solutions</p>
                <CBadge color="primary" className="px-3 py-2 rounded-pill">
                  Corporate • Futuristic • User-Friendly
                </CBadge>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <CRow className="g-4">
              {quickActions.map((action, index) => (
                <CCol lg={6} key={index}>
                  <CCard className="hr-feature-card h-100 shadow-sm">
                    <CCardHeader className="hr-card-header">
                      <div className="d-flex align-items-center">
                        <div className={`feature-icon bg-${action.color}`}>
                          <CIcon icon={action.icon} className="text-white" size="xl" />
                        </div>
                        <div className="ms-3">
                          <h5 className="mb-1 fw-bold">{action.title}</h5>
                          <p className="mb-0 text-muted">{action.description}</p>
                        </div>
                      </div>
                    </CCardHeader>
                    
                    <CCardBody className="p-4">
                      <div className="features-list mb-4">
                        <h6 className="fw-semibold mb-3 text-primary">Key Features:</h6>
                        <ul className="feature-list">
                          {action.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="feature-item">
                              <CIcon icon={cilArrowRight} className="text-success me-2" size="sm" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="text-center">
                        <CButton
                          color={action.color}
                          size="lg"
                          className="action-btn w-100"
                          onClick={() => handleNavigation(action.path)}
                        >
                          Launch {action.title}
                          <CIcon icon={cilArrowRight} className="ms-2" />
                        </CButton>
                      </div>
                    </CCardBody>
                  </CCard>
                </CCol>
              ))}
            </CRow>

            {/* Features Overview */}
            <CCard className="hr-card shadow-sm mt-4">
              <CCardHeader className="hr-card-header text-center">
                <h5 className="mb-0 fw-bold">System Overview</h5>
              </CCardHeader>
              
              <CCardBody className="p-4">
                <CRow className="text-center">
                  <CCol md={3}>
                    <div className="overview-stat">
                      <div className="stat-icon bg-primary mb-3">
                        <CIcon icon={cilUserPlus} className="text-white" size="xl" />
                      </div>
                      <h4 className="fw-bold text-primary mb-1">Onboarding</h4>
                      <p className="text-muted small">Streamlined employee setup</p>
                    </div>
                  </CCol>
                  
                  <CCol md={3}>
                    <div className="overview-stat">
                      <div className="stat-icon bg-success mb-3">
                        <CIcon icon={cilDescription} className="text-white" size="xl" />
                      </div>
                      <h4 className="fw-bold text-success mb-1">Documents</h4>
                      <p className="text-muted small">Automated document generation</p>
                    </div>
                  </CCol>
                  
                  <CCol md={3}>
                    <div className="overview-stat">
                      <div className="stat-icon bg-warning mb-3">
                        <CIcon icon={cilClock} className="text-white" size="xl" />
                      </div>
                      <h4 className="fw-bold text-warning mb-1">Attendance</h4>
                      <p className="text-muted small">Time tracking & management</p>
                    </div>
                  </CCol>
                  
                  <CCol md={3}>
                    <div className="overview-stat">
                      <div className="stat-icon bg-info mb-3">
                        <CIcon icon={cilChartLine} className="text-white" size="xl" />
                      </div>
                      <h4 className="fw-bold text-info mb-1">Reports</h4>
                      <p className="text-muted small">Analytics & insights</p>
                    </div>
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
          </CContainer>
        </div>
      </div>

      <style jsx>{`
        .hr-dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8f9fb 0%, #e9ecef 100%);
        }

        .hr-sidebar {
          background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
          border-right: 1px solid #e9ecef;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .hr-logo h4 {
          color: #2563eb;
          font-weight: 700;
        }

        .hr-nav-link {
          padding: 12px 24px;
          margin: 4px 12px;
          border-radius: 8px;
          transition: all 0.2s ease;
          color: #64748b;
        }

        .hr-nav-link:hover {
          background: linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%);
          color: #2563eb;
          transform: translateX(4px);
        }

        .hr-nav-link.active {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }

        .hr-header {
          padding: 40px 0;
          border-bottom: 2px solid #e5e7eb;
        }

        .hr-feature-card {
          border: none;
          border-radius: 16px;
          background: white;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .hr-feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .hr-card {
          border: none;
          border-radius: 16px;
          background: white;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }

        .hr-card-header {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-bottom: 2px solid #e5e7eb;
          padding: 20px 24px;
        }

        .feature-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .feature-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .feature-item {
          padding: 6px 0;
          display: flex;
          align-items: center;
          color: #4b5563;
          font-size: 14px;
        }

        .action-btn {
          border-radius: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          transition: all 0.2s ease;
          padding: 12px 24px;
        }

        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }

        .overview-stat {
          padding: 20px;
        }

        .stat-icon {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        @media (max-width: 768px) {
          .hr-sidebar {
            position: fixed;
            z-index: 1040;
          }
          
          .action-btn {
            font-size: 14px;
            padding: 10px 20px;
          }
          
          .feature-icon {
            width: 50px;
            height: 50px;
          }
          
          .stat-icon {
            width: 60px;
            height: 60px;
          }
        }
      `}</style>
    </div>
  )
}

export default HRDashboard
