import React, { useState, useEffect } from 'react'
import { CButton } from '@coreui/react'
import { useNavigate, useLocation } from 'react-router-dom'

const SwitchingHeader = ({ className = '' }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedButton, setSelectedButton] = useState('')

  useEffect(() => {
    if (location.pathname.startsWith('/hrms')) {
      setSelectedButton('management')
    } else {
      setSelectedButton('technical')
    }
  }, [location.pathname])

  const handleTechnicalClick = () => {
    setSelectedButton('technical')
    navigate('/dashboard')
  }

  const handleManagementClick = () => {
    setSelectedButton('management')
    navigate('/hrms')
  }

  return (
    <div className={`switching-header-bar ${className}`.trim()}>
      <div
        role="group"
        aria-label="Basic radio toggle button group"
        className="switching-header-bar__group"
      >
        <CButton
          onClick={handleTechnicalClick}
          className={`switching-header-bar__button ${
            selectedButton === 'technical' ? 'is-active' : ''
          }`}
        >
          Technical
        </CButton>

        <CButton
          onClick={handleManagementClick}
          className={`switching-header-bar__button ${
            selectedButton === 'management' ? 'is-active' : ''
          }`}
        >
          HRMS
        </CButton>
      </div>
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
