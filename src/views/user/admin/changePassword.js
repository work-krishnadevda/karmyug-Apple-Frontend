import {
  CButton,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CFormLabel,
  CRow,
} from '@coreui/react'
import { useEffect, useState } from 'react'
import 'react-datepicker/dist/react-datepicker.css'
import { useNavigate, useParams } from 'react-router-dom'
import HelperFunction from '../../../helpers/HelperFunctions'

import SingleSubHeader from 'src/components/custom/SingleSubHeader'
import BasicProvider from 'src/constants/BasicProvider'
import CustomerSidebar from 'src/components/CustomerSidebar'

export default function ChangePassword() {
  var params = useParams()
  const [Shops, setShops] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [verifiedPassword, setVerifiedPassword] = useState('')
  const [alert, setAlert] = useState(null)

  const fetchUserInfo = async (id) => {
    try {
      const response = await HelperFunction.getData(`shops/show/${id}`)
      setShops(response.data)
    } catch (error) {
      console.error('Error fetching user information:', error)
    }
  }
  useEffect(() => {
    fetchUserInfo(params.id)
  }, [])

  const handleAlertTimeout = () => {
    // Set a timeout to clear the alert after 5 seconds (5000 milliseconds)
    setTimeout(() => {
      setAlert(null) // Clear the alert after 5 seconds
    }, 2000)
  }
  const checkPasswordStrength = (password) => {
    // Define your password strength criteria using regular expressions
    const regexLowercase = /[a-z]/
    const regexUppercase = /[A-Z]/
    const regexNumber = /[0-9]/
    const regexSpecialChar = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/

    // Check if the password meets your criteria
    const hasLowercase = regexLowercase.test(password)
    const hasUppercase = regexUppercase.test(password)
    const hasNumber = regexNumber.test(password)
    const hasSpecialChar = regexSpecialChar.test(password)

    // Calculate the password strength based on the criteria
    let passwordStrength = 0

    if (hasLowercase) passwordStrength++
    if (hasUppercase) passwordStrength++
    if (hasNumber) passwordStrength++
    if (hasSpecialChar) passwordStrength++

    // You can define your own criteria for a strong password based on the passwordStrength value
    // For example, you can require a minimum of 3 out of 4 criteria to be met
    if (passwordStrength >= 3) {
      return 'strong'
    } else if (passwordStrength === 2) {
      return 'moderate'
    } else {
      return 'weak'
    }
  }

  const handlePasswordChange = async () => {
    // 1. Implement form validation.
    if (newPassword.length < 8) {
      setAlert({ type: 'danger', message: 'Password must be at least 8 characters long.' })
      handleAlertTimeout()
      return
    }

    if (newPassword !== verifiedPassword) {
      setAlert({ type: 'danger', message: 'Passwords do not match.' })
      handleAlertTimeout()

      return
    }

    // 2. Check password strength.
    const passwordStrength = checkPasswordStrength(newPassword)

    if (passwordStrength === 'weak') {
      setAlert({ type: 'danger', message: 'Password is too weak. Please use a stronger password.' })
      handleAlertTimeout()

      return
    }

    try {
      const data = { newPassword, verifiedPassword }

      const response = await new BasicProvider(`shops/change/password/${params.id}`).patchRequest(
        data,
      )

      if (response) {
        setAlert({ type: 'success', message: 'Password updated successfully.' })
        handleAlertTimeout()
      }

      setNewPassword('')
      setVerifiedPassword('')
    } catch (error) {
      setAlert({ type: 'danger', message: 'Failed to update password. Please try again later.' })
      handleAlertTimeout()

      console.error('Error updating password:', error)
    }
  }

  const handleCancel = () => {
    setNewPassword('')
    setVerifiedPassword('')
  }
  return (
    <>
      <CCard>
        <CCardHeader className="d-flex justify-content-between align-item-center">
          Change Password
        </CCardHeader>

        <CCardBody>
          <CContainer>
            <CRow className="mt-3 justify-content-end align-items-center">
              <CCol sm={3}>
                <CFormLabel htmlFor="newPassword">
                  New Password
                  <span style={{ color: '#2d9dd9' }} className="ms-1">
                    *
                  </span>
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  type="password"
                  id="newPassword"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  inputMode="verbatim"
                />
              </CCol>
            </CRow>
            <CRow className="mt-3 justify-content-end align-items-center">
              <CCol sm={3}>
                <CFormLabel htmlFor="verifiedPassword">
                  Verified Password
                  <span style={{ color: '#2d9dd9' }} className="ms-1">
                    *
                  </span>
                </CFormLabel>
              </CCol>

              <CCol sm={9}>
                <CFormInput
                  type="password"
                  id="verifiedPassword"
                  placeholder="verify Password"
                  value={verifiedPassword}
                  onChange={(e) => setVerifiedPassword(e.target.value)}
                  inputMode="verbatim"
                />
              </CCol>
            </CRow>
          </CContainer>
        </CCardBody>

        <CCardFooter>
          <CRow className="d-flex justify-content-center align-items-center py-3">
            <CCol xs={4} className="d-flex align-items-center justify-content-end">
              <CButton className=" btn-info submit_btn" onClick={handlePasswordChange}>
                Change Password
              </CButton>
            </CCol>

            <CCol xs={3} className="d-flex align-items-center  justify-content-start">
              <CButton className="btn btn-danger text-light" onClick={handleCancel}>
                Cancel
              </CButton>
            </CCol>
          </CRow>
        </CCardFooter>
      </CCard>
    </>
  )
}
