import { CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import BasicProvider from 'src/constants/BasicProvider'
import { checkRole } from 'src/constants/common'
import { cilChevronCircleDownAlt, cilChevronCircleUpAlt } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

const CommonCaseDetails = ({ initialValues }) => {
  const [show, setShow] = useState(false)

  const admin = useSelector((state) => state.userData)
  let isSDM = checkRole(process.env.REACT_APP_SDM, admin)

  const getStepClass = (step) => {
    if (initialValues.status === 'pending for visit') {
      return step === 1 ? 'active' : step > 1 ? 'inactive' : ''
    } else if (initialValues.status === 'updated by coo') {
      return step <= 1 ? 'active' : step > 1 ? 'inactive' : ''
    } else if (initialValues.status === 'tied-up by fe') {
    } else if (initialValues.status === 'accepted by fe') {
      return step <= 2 ? 'active' : step > 2 ? 'inactive' : ''
    } else if (initialValues.status === 'concern by fe') {
      return step <= 2 ? 'active' : step > 2 ? 'inactive' : ''
    } else if (initialValues.status === 'visit done') {
      return step <= 3 ? 'active' : step > 3 ? 'inactive' : ''
    } else if (initialValues.status === 'updated by ra') {
      return step <= 3 ? 'active' : step > 3 ? 'inactive' : ''
    } else if (initialValues.status === 'pending for draft') {
      return step <= 4 ? 'active' : step > 4 ? 'inactive' : ''
    }

    return ''
  }

  return (
    <>
      <CCard className="applicant-details mt-4">
        <CCardHeader
          onClick={() => setShow(!show)}
          className="d-flex justify-content-between align-items-center c-card-headerSdm rounded "
        >
          Case Details
          {show ? (
            <CIcon
              icon={cilChevronCircleUpAlt}
              size="xl"
              style={{ position: 'static', right: '50px' }}
            />
          ) : (
            <CIcon
              icon={cilChevronCircleDownAlt}
              size="xl"
              style={{ position: 'static', right: '50px' }}
            />
          )}{' '}
        </CCardHeader>

        {show && (
          <CCardBody>
            <CRow>
              <CCol md={6}>
                <CRow>
                  <CCol md={6}>
                    <span className="custom-lebel my-1">Applicant Name</span>

                    <h6>{initialValues.applicant_name ?? '-'}</h6>

                    <CCol md={6}>
                      <span className="custom-lebel my-1">Finance Name</span>
                      <h6>{initialValues.finance_name ? initialValues.finance_name.name : '-'}</h6>
                    </CCol>
                  </CCol>
                  <CCol md={6}>
                    <CCol md={6}>
                      <span className="custom-lebel my-1">CIN Number</span>
                      <h6>{initialValues.cin_number ?? '-'}</h6>
                    </CCol>
                    <CCol md={6}>
                      <span className="custom-lebel my-1">IOS Number</span>
                      <h6>{initialValues.los_number ?? '-'}</h6>
                    </CCol>
                  </CCol>
                </CRow>
              </CCol>

              <CCol md={6}>
                <div className="custom_stepss bg-blue py-lg-3 py-5">
                  <div id="editmyaccount" className="pb-0">
                    <div id="msform">
                      <ul id="progressbar" className="mb-0">
                        <li className={getStepClass(1)} id="personaldetails">
                          <strong>COO</strong>
                          <p style={{ fontSize: '12px' }}>10 Apr 2024</p>
                        </li>

                        <li className={getStepClass(2)} id="fe">
                          <strong>FE</strong>
                          <p style={{ fontSize: '12px' }}>-</p>
                        </li>
                        <li className={getStepClass(3)} id="sdm">
                          <strong>SDM</strong>
                          <p style={{ fontSize: '12px' }}>-</p>
                        </li>
                        <li className={getStepClass(4)} id="dm">
                          <strong>DM</strong>
                          <p style={{ fontSize: '12px' }}>-</p>
                        </li>
                        <li className={getStepClass(5)} id="rc">
                          <strong>RC</strong>
                          <p style={{ fontSize: '12px' }}>-</p>
                        </li>
                        <li className={getStepClass(5)} id="lcto">
                          <strong>LCTO</strong>
                          <p style={{ fontSize: '12px' }}>-</p>
                        </li>
                        <li className={getStepClass(6)} id="cto">
                          <strong>CTO</strong>
                          <p style={{ fontSize: '12px' }}>-</p>
                        </li>
                        <li className={getStepClass(6)} id="bank">
                          <strong>Bank</strong>
                          <p style={{ fontSize: '12px' }}>-</p>
                        </li>
                      </ul>

                      <br />
                    </div>
                  </div>
                </div>
              </CCol>
            </CRow>
          </CCardBody>
        )}
      </CCard>
    </>
  )
}
export default CommonCaseDetails
