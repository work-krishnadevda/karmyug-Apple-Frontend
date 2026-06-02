import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../../../assets/images/logo/karmyug-apple.png'

import { Formik, Field, Form, ErrorMessage } from 'formik'
import * as Yup from 'yup'

import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CFormLabel,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import { useDispatch, useSelector } from 'react-redux'
import AuthHelpers from 'src/helpers/authHelper'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'

// import AuthHelpers from 'src/helpers/AuthHelpers'

import BasicProvider from 'src/constants/BasicProvider'

const validationSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().required('Password is required'),
})

const Login = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const isNotLoggin = useSelector((state) => state.isNotLoggin)
  const isBlock = useSelector((state) => state.isBlock)
  const [customError, setcustomError] = useState(null)
  const [timeoutId, setTimeoutId] = useState(null)

  const [blockError, setBlockError] = useState(null)
  const [blockTimeOut, setBlockTimeOut] = useState(null)

  const [showPassword, setShowPassword] = useState(false)

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState)
  }

  useEffect(() => {
    if (isNotLoggin) {
      setcustomError('This credentials do not match our records!')
      if (!timeoutId) {
        const newTimeoutId = setTimeout(() => {
          setcustomError(null)
          dispatch({ type: 'set', isNotLoggin: 'notLogin' })
        }, 2000)
        setTimeoutId(newTimeoutId)
      }
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
        setTimeoutId(null)
      }
    }
  }, [isNotLoggin, timeoutId])

  useEffect(() => {
    if (isBlock) {
      setBlockError(isBlock)
      if (!blockTimeOut) {
        const newTimeoutId = setTimeout(() => {
          setBlockError(null)
          dispatch({ type: 'set', isBlock: '' })
        }, 2000)
        setBlockTimeOut(newTimeoutId)
      }
    }

    return () => {
      if (blockTimeOut) {
        clearTimeout(blockTimeOut)
        setBlockTimeOut(null)
      }
    }
  }, [isBlock, blockTimeOut])

  return (
    <div
      className="min-vh-100 d-flex flex-row align-items-center "
  style={{
  backgroundImage: `
    linear-gradient(
      rgba(0, 0, 0, 0.35),
      rgba(0, 0, 0, 0.35)
    ),
    url('/login-bg-image.png')
  `,
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  backgroundSize: "cover",
}}
    >
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={5}>
            <CCardGroup>
              <CCard className="p-4 login_card">
                <CCardBody>
                  <Formik
                    initialValues={{
                      email: '',
                      password: '',
                    }}
                    validationSchema={validationSchema}
                    onSubmit={async (values, { setSubmitting, isSubmitting }) => {
                      AuthHelpers.login(values, navigate, dispatch).finally(() => {
                        setSubmitting(false)
                      })
                    }}
                  >
                    {({ isSubmitting }) => (
                      <Form className="admin-login-page">
                        <div className="text-center">
                          <div className="login-logo">
                            <img src="/logo.png" alt="logo" width={100} />
                            <span className="login-logo-text">ValuXpert</span>
                          </div>
                          <p
                            className="text-medium-emphasis mb-3"
                            style={{ fontSize: '1.1rem', fontWeight: 'bold' }}
                          >
                            Welcome Back! <span role="img" aria-label="key"></span>Please Sign In
                          </p>
                        </div>

                        {customError && <CAlert color="danger">{customError}</CAlert>}
                        {blockError && <CAlert color="danger">{blockError}</CAlert>}

                        <CRow className="mb-2">
                          <CFormLabel htmlFor="exampleInputEmail1" className="label-text">
                            Email
                          </CFormLabel>
                          <CInputGroup>
                            <Field
                              type="text"
                              name="email"
                              placeholder="Enter your email"
                              autoComplete="email"
                              className="form-control"
                            />
                          </CInputGroup>
                          <ErrorMessage
                            name="email"
                            component="div"
                            className="text-danger text-start"
                          />
                        </CRow>
                        <CRow className="mb-4">
                          <CFormLabel htmlFor="exampleInputEmail1" className="label-text">
                            Password
                          </CFormLabel>
                          <CInputGroup className="from_pass">
                            <Field
                              type={showPassword ? 'text' : 'password'}
                              name="password"
                              placeholder="Enter your password"
                              autoComplete="current-password"
                              className="form-control"
                            />
                            <CInputGroupText
                              onClick={togglePasswordVisibility}
                              className="cursor-pointer"
                            >
                              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                            </CInputGroupText>
                          </CInputGroup>
                          <ErrorMessage
                            name="password"
                            component="div"
                            className="text-danger text-start"
                          />
                        </CRow>

                        <CRow>
                          <CCol xs={12} className="m-auto">
                            <CButton className="px-4 sign-up" type="submit" disabled={isSubmitting}>
                              {isSubmitting ? (
                                <div class="spinner-border" role="status"></div>
                              ) : (
                                'Login'
                              )}
                            </CButton>
                          </CCol>
                        </CRow>
                      </Form>
                    )}
                  </Formik>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
