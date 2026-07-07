import React, { useState } from 'react'
import { CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'

import { cilChevronCircleDownAlt, cilChevronCircleUpAlt, cilPencil } from '@coreui/icons'
import moment from 'moment'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'

const MainDetailsCase = ({ showCaseData, handleShowSubmit }) => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [show, setShow] = useState(false)
  const [showForm, setShowForm] = useState(false)

  let loggedinUserRole = useSelector((state) => state?.userRole)

  return (
    <>
      <CRow className="mt-4">
        <CCol md={12}>
          <CCard className="applicant-details">
            <CCardHeader className="d-flex justify-content-between align-items-center c-card-headerSdm rounded">
              COO Details
              <div className="action-btn">
                <div className="edit-btn ">
                  <CIcon
                    icon={cilPencil}
                    onClick={() =>
                      navigate(`/case/${id}/update/ceo-details/by/${loggedinUserRole.name}`, {
                        state: { isCOOVisible: true },
                      })
                    }
                  />
                </div>
                {show ? (
                  <CIcon icon={cilChevronCircleUpAlt} size="xl" onClick={() => setShow(!show)} />
                ) : (
                  <CIcon icon={cilChevronCircleDownAlt} size="xl" onClick={() => setShow(!show)} />
                )}
              </div>
            </CCardHeader>
            {show && (
              <CCardBody>
                <CRow>
                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                      Date of Initiation By Bank
                    </span>

                    <h6>
                      {moment(showCaseData?.date_initiation_bank).format(' Do MMM YY') ?? ' - '}
                    </h6>
                  </CCol>
                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                      Date Of Initiation By Real Apple
                    </span>
                    <h6>
                      {moment(showCaseData?.date_initiation_RA).format(' Do MMM YY') ?? ' - '}
                    </h6>
                  </CCol>
                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                      Finance Name (Parent)
                    </span>
                    {/* <h6>{showCaseData.person_meet_at_site_name ?? '-'}</h6> */}
                    <h6>{showCaseData?.finance_name_perent?.name ?? ' - '}</h6>
                  </CCol>
                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>Finance Name</span>
                    {/* <h6>{showCaseData.person_meet_at_site_mobile ?? '-'}</h6> */}
                    <h6>{showCaseData?.finance_name?.name}</h6>
                  </CCol>
                </CRow>
                <CRow className="mt-3">
                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                      Applicant Name
                    </span>
                    {/* <h6>{showCaseData.person_meet_at_site_relation ?? '-'}</h6> */}
                    <h6>{showCaseData?.applicant_name ?? ' - '}</h6>
                  </CCol>
                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>LOS NO.</span>
                    {/* <h6> {showCaseData.type_of_property ?? '-'}</h6> */}
                    <h6>{showCaseData?.los_number}</h6>
                  </CCol>
                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                      Contact Number 1
                    </span>
                    {/* <h6> {showCaseData.type_of_property ?? '-'}</h6> */}
                    <h6>{showCaseData?.contact_number_1}</h6>
                  </CCol>
                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                      Contact Number 2
                    </span>
                    {/* <h6> {showCaseData.type_of_property ?? '-'}</h6> */}
                    <h6>{showCaseData?.contact_number_2 ?? ' - '} </h6>
                  </CCol>
                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                      Contact Number 3
                    </span>
                    {/* <h6> {showCaseData.type_of_property ?? '-'}</h6> */}
                    <h6>{showCaseData?.contact_number_3 ?? ' - '}</h6>
                  </CCol>
                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                      Visit Address
                    </span>
                    {/* <h6> {showCaseData.type_of_property ?? '-'}</h6> */}
                    <h6> static Data</h6>
                  </CCol>
                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                      City Or Village Name(Near Location)
                    </span>
                    {/* <h6> {showCaseData.type_of_property ?? '-'}</h6> */}
                    <h6>{showCaseData?.address ?? ' - '}</h6>
                  </CCol>
                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>Product Name</span>
                    {/* <h6> {showCaseData.type_of_property ?? '-'}</h6> */}
                    <h6>{showCaseData?.product_name ?? ' - '}</h6>
                  </CCol>
                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>Case Type</span>
                    {/* <h6> {showCaseData.type_of_property ?? '-'}</h6> */}
                    <h6>{showCaseData?.case_type ?? ' - '}</h6>
                  </CCol>
                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>MA Branch</span>
                    {/* <h6> {showCaseData.type_of_property ?? '-'}</h6> */}
                    <h6>{showCaseData?.ra_branch?.name ?? ' - '}</h6>
                  </CCol>
                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                      Case Of Branch
                    </span>
                    {/* <h6> {showCaseData.type_of_property ?? '-'}</h6> */}
                    <h6>{showCaseData?.case_of_branch ?? ' - '}</h6>
                  </CCol>
                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>Latitude</span>
                    {/* <h6> {showCaseData.type_of_property ?? '-'}</h6> */}
                    <h6>{showCaseData?.latitude ?? ' - '}</h6>
                  </CCol>
                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>Longitude</span>
                    {/* <h6> {showCaseData.type_of_property ?? '-'}</h6> */}
                    <h6>{showCaseData?.longitude ?? ' - '}</h6>
                  </CCol>

                  {showCaseData && showCaseData?.group ? (
                    <CCol md={3}>
                      <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                        Select Group
                      </span>
                      <h6>{showCaseData?.group?.name ?? ' - '}</h6>
                    </CCol>
                  ) : showCaseData?.engineers ? (
                    <CCol md={3}>
                      <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                        Select Engineers
                      </span>
                      <h6>
                        {showCaseData?.engineers.map((engineer) => engineer.name).join(', ') ??
                          ' - '}
                      </h6>
                    </CCol>
                  ) : (
                    ''
                  )}
                </CRow>

                {showCaseData &&
                  showCaseData?.additional_fields &&
                  showCaseData?.additional_fields?.filter((item) => item.role === 'COO').length >
                  0 && (
                    <>
                      <hr />
                      <h6 className="mt-3">Additional Fields By COO</h6>
                      {showCaseData &&
                        showCaseData?.additional_fields &&
                        showCaseData?.additional_fields
                          .filter((item) => item.role === 'COO')
                          .map((field, index) => (
                            <CRow key={index} className="mt-3">
                              {Object.entries(field)
                                .filter(([key]) => key !== 'role')
                                .map(([key, value]) => (
                                  <CCol key={key} md={3}>
                                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                                      {key ? key : '-'}
                                    </span>
                                    <h6>{value ? value : '-'}</h6>
                                  </CCol>
                                ))}
                            </CRow>
                          ))}
                    </>
                  )}
              </CCardBody>
            )}

          </CCard>
        </CCol>
      </CRow>
    </>
  )
}
export default MainDetailsCase
