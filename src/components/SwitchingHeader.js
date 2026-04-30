import React, { useState, useEffect } from 'react'
import { CButtonGroup, CButton, CBadge } from '@coreui/react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import BasicProvider from 'src/constants/BasicProvider'

const SwitchingHeader = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedButton, setSelectedButton] = useState('')
  const [pendingCount, setPendingCount] = useState(0)
  const [canSeeApprovals, setCanSeeApprovals] = useState(false)

  const admin = useSelector((state) => state.userData)
  const employeeData = useSelector((state) => state.employeeData)

  useEffect(() => {
    if (location.pathname === '/dashboard') {
      setSelectedButton('technical')
    } else if (location.pathname.startsWith('/hrms')) {
      setSelectedButton('management')
    }
    // Note: pending-approvals is not a switching button, it's a separate action button
  }, [location.pathname])

  function getCookie(name) {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop().split(';').shift()
    return null
  }

  const id = getCookie('primery_user_id')
  useEffect(() => {
    if (!admin) return

    const userRoles = admin?.role?.map((r) => r.name.toLowerCase()) || []
    const isHrOrAdmin = userRoles.includes('hr') || userRoles.includes('admin')

    let isLeaveAuthority = false
    if (employeeData) {
      const userName = admin?.name?.toLowerCase()
      const authorityOne = employeeData?.leave_authority_one?.toLowerCase()
      const authorityTwo = employeeData?.leave_authority_two?.toLowerCase()
      if (userName && (userName === authorityOne || userName === authorityTwo)) {
        isLeaveAuthority = true
      }
    }

    setCanSeeApprovals(isHrOrAdmin || isLeaveAuthority)
  }, [admin, employeeData])

  const fetchPendingLeaves = async () => {
    if (!canSeeApprovals) return
    try {
      const response = await new BasicProvider(`leaves/pending-authority/user/${id}`).getRequest()

      console.log(response)
      if (response.status === 'success') {
        setPendingCount(response.data.length)
      }
    } catch (error) {
      console.error('Failed to fetch pending leaves:', error)
    }
  }
  // useEffect(() => {

  // }, [canSeeApprovals])

  const handleTechnicalClick = () => {
    setSelectedButton('technical')
    navigate('/dashboard')
  }

  const handleManagementClick = () => {
    setSelectedButton('management')
    navigate('/hrms')
  }

  const handleApprovalsClick = () => {
    // Don't set selectedButton as this is not a switching button
    fetchPendingLeaves()
    navigate('/hrms/staff/pendingLeaveApprove')
  }

  return (
    <div className="d-flex justify-content-between bg-light p-3 bg-white shadow-lg rounded">
      <CButtonGroup role="group" aria-label="Basic radio toggle button group">
        <CButton
          color={selectedButton === 'technical' ? 'primary' : 'outline-primary'}
          variant={selectedButton === 'technical' ? 'solid' : 'outline'}
          onClick={handleTechnicalClick}
          style={{
            backgroundColor: selectedButton === 'technical' ? '#0d6efd' : 'transparent',
            color: selectedButton === 'technical' ? 'white' : '#0d6efd',
            borderColor: '#0d6efd',
            fontWeight: selectedButton === 'technical' ? 'bold' : 'normal',
          }}
        >
          Technical
        </CButton>

        <CButton
          color={selectedButton === 'management' ? 'primary' : 'outline-primary'}
          variant={selectedButton === 'management' ? 'solid' : 'outline'}
          onClick={handleManagementClick}
          style={{
            backgroundColor: selectedButton === 'management' ? '#0d6efd' : 'transparent',
            color: selectedButton === 'management' ? 'white' : '#0d6efd',
            borderColor: '#0d6efd',
            fontWeight: selectedButton === 'management' ? 'bold' : 'normal',
          }}
        >
          HRMS
        </CButton>
      </CButtonGroup>

      {/* {canSeeApprovals && (
        <CButton
          color="outline-primary"
          variant="outline"
          onClick={handleApprovalsClick}
          style={{
            position: 'relative',
            backgroundColor: 'transparent',
            color: '#0d6efd',
            borderColor: '#0d6efd',
            fontWeight: 'normal',
          }}
        >
          Pending Approvals
          {pendingCount > 0 && (
            <CBadge
              color="danger"
              style={{
                position: 'absolute',
                top: '-5px',
                right: '-10px',
                borderRadius: '50%',
              }}
            >
              {pendingCount}
            </CBadge>
          )}
        </CButton>
      )} */}
    </div>
  )
}

export default SwitchingHeader

// import React, { useState, useEffect } from 'react'
// import { CButtonGroup, CButton } from '@coreui/react'
// import { useNavigate, useLocation } from 'react-router-dom'

// const SwitchingHeader = () => {
//   let navigate = useNavigate()
//   const location = useLocation()
//   const [selectedButton, setSelectedButton] = useState(() => {
//     // Initialize based on current pathname
//     if (typeof window !== 'undefined') {
//       const pathname = window.location.pathname
//       if (pathname.startsWith('/dashboard')) {
//         return 'technical'
//       } else if (pathname.startsWith('/hrms')) {
//         return 'hrms'
//       }
//     }
//     return 'technical' // default
//   })

//   // Set initial selected button based on current route
//   useEffect(() => {
//     // console.log('SwitchingHeader: Current pathname:', location.pathname) // Debug log - removed for production
//     if (location.pathname.startsWith('/dashboard')) {
//       // console.log('SwitchingHeader: Setting technical as selected') // Debug log - removed for production
//       setSelectedButton('technical')
//     } else if (location.pathname.startsWith('/hrms')) {
//       // console.log('SwitchingHeader: Setting hrms as selected') // Debug log - removed for production
//       setSelectedButton('hrms')
//     } else {
//       // Default to technical if no specific route match
//       // console.log('SwitchingHeader: Defaulting to technical') // Debug log - removed for production
//       setSelectedButton('technical')
//     }
//   }, [location.pathname])

//   const handleTechnicalClick = () => {
//     setSelectedButton('technical')
//     navigate('/dashboard')
//   }

//   const handlehrmsClick = () => {
//     setSelectedButton('hrms')
//     navigate('/hrms')
//   }

//   return (
//     <div className="d-flex bg-light p-3 bg-white shadow-lg rounded">
//       <CButtonGroup role="group" aria-label="Basic radio toggle button group">
//         <CButton
//           color={selectedButton === 'technical' ? 'primary' : 'outline-primary'}
//           variant={selectedButton === 'technical' ? 'solid' : 'outline'}
//           onClick={handleTechnicalClick}
//           className={selectedButton === 'technical' ? 'active' : ''}
//           style={{
//             backgroundColor: selectedButton === 'technical' ? '#0d6efd' : 'white',
//             color: selectedButton === 'technical' ? 'white' : '#0d6efd',
//             borderColor: '#0d6efd',
//             fontWeight: selectedButton === 'technical' ? 'bold' : 'normal',
//             border: '2px solid #0d6efd',
//             borderRadius: selectedButton === 'technical' ? '0.375rem 0 0 0.375rem' : '0.375rem 0 0 0.375rem',
//           }}
//         >
//           Technical
//         </CButton>
//         <CButton
//           color={selectedButton === 'hrms' ? 'primary' : 'outline-primary'}
//           variant={selectedButton === 'hrms' ? 'solid' : 'outline'}
//           onClick={handlehrmsClick}
//           className={selectedButton === 'hrms' ? 'active' : ''}
//           style={{
//             backgroundColor: selectedButton === 'hrms' ? '#0d6efd' : 'white',
//             color: selectedButton === 'hrms' ? 'white' : '#0d6efd',
//             borderColor: '#0d6efd',
//             fontWeight: selectedButton === 'hrms' ? 'bold' : 'normal',
//             border: '2px solid #0d6efd',
//             borderRadius: selectedButton === 'hrms' ? '0 0.375rem 0.375rem 0' : '0 0.375rem 0.375rem 0',
//           }}
//         >
//          HRMS
//         </CButton>

//       </CButtonGroup>
//     </div>
//   )
// }

// export default SwitchingHeader
