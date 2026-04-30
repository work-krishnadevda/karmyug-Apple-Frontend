import React, { useState } from 'react'
import { CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import moment from 'moment'

import {
  cilChevronCircleDownAlt,
  cilChevronCircleUpAlt,
  cilCloudDownload,
  cilPencil,
} from '@coreui/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import jsPDF from 'jspdf'
import { Document, Page, Text, View, StyleSheet, Font, pdf } from '@react-pdf/renderer';

function PersonalInfoSDM({ showCaseData }) {
  const [show, setShow] = useState(false)
  const navigate = useNavigate()
  const params = useParams()
  var { id } = useParams()

  let loggedinUserRole = useSelector((state) => state?.userRole)






  return (
    <>


      <CRow className="mt-4">
        <CCol md={12}>

          <CCard className="applicant-details">
            <CCardHeader className="d-flex justify-content-between align-items-center c-card-headerSdm rounded">
              Personal Information
              <div className="action-btn">
                {params.type !== 'show-case-details' && (
                  <div className="edit-btn">
                    <CIcon
                      icon={cilPencil}
                      onClick={() =>
                        navigate(
                          `/case/${id}/update/personal-information/by/${loggedinUserRole.name}`,
                          { state: { firstStepVisible: true, formStep: 1 } },
                        )
                      }
                    />
                  </div>
                )}

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
                      Applicant Name
                    </span>

                    <h6>{showCaseData.applicant_name ?? ' - '}</h6>
                  </CCol>
                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                      Applicant Mobile Number
                    </span>

                    <h6>{showCaseData.contact_number_1 ?? ' - '}</h6>
                  </CCol>
                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                      Person Meet At Site Name
                    </span>

                    <h6>{showCaseData.person_meet_at_site_name ?? ' - '}</h6>
                  </CCol>
                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                      Person Meet At Site Mobile Number
                    </span>

                    <h6>{showCaseData.person_meet_at_site_mobile ?? ' - '}</h6>
                  </CCol>
                </CRow>
                <CRow className="mt-3">
                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                      Person Meet At Site Relation
                    </span>

                    <h6>{showCaseData.person_meet_at_site_relation ?? ' - '}</h6>
                  </CCol>
                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                      Type Of Property
                    </span>

                    <h6>{showCaseData.type_of_property ?? ' - '}</h6>
                  </CCol>
                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                      Current use of property
                    </span>

                    <h6>{showCaseData.current_use_property ?? ' - '}</h6>
                  </CCol>
                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                      Local Address Verification
                    </span>

                    <h6>{showCaseData.address_verification ?? ' - '}</h6>
                  </CCol>

                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                      House Name/Building Name
                    </span>

                    <h6>{showCaseData.house_builing_name ?? ' - '}</h6>
                  </CCol>

                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                      Wing or Block Name
                    </span>

                    <h6>{showCaseData.wing_block_name ?? ' - '}</h6>
                  </CCol>

                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                      Street Name
                    </span>

                    <h6>{showCaseData.street_name ?? ' - '}</h6>
                  </CCol>
                </CRow>
                <CRow className="mt-3">

                  {/* -------------------------------------------<<<<<<<<< Self  Occupied >>>>>>>>>------------------------------------- */}

                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>Occupant</span>

                    <h6>{showCaseData.occupant ?? ' - '}</h6>
                  </CCol>
                  {showCaseData?.occupant === 'Occupied' && (
                    <>
                      <CCol md={3}>
                        <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                          Self Occupied
                        </span>
                        <h6>{showCaseData.self_occupied ?? ' - '}</h6>
                      </CCol>
                      <CCol md={3}>
                        <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>Tenure</span>

                        <h6>{showCaseData.tenure ?? ' - '}</h6>
                      </CCol>
                    </>
                  )}

                  {/* -------------------------------------------<<<<<<<<< Vacant >>>>>>>>>------------------------------------- */}

                  {showCaseData?.occupant === 'Vacant' && (
                    <CCol md={3}>
                      <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                        Property Vacant From Last Month
                      </span>

                      <h6>{showCaseData.self_occupied ?? ' - '}</h6>
                    </CCol>
                  )}

                  {/* -------------------------------------------<<<<<<<<< Tenant >>>>>>>>>------------------------------------- */}

                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>House./Plot No</span>

                    <h6>{showCaseData.house_plot_no ?? ' - '}</h6>
                  </CCol>


                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                      Village/Colony
                    </span>

                    <h6>{showCaseData.village_colony ?? ' - '}</h6>
                  </CCol>
                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>Ward Number</span>

                    <h6>{showCaseData.ward_no ?? ' - '}</h6>
                  </CCol>

                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>City</span>

                    <h6>{showCaseData.city ?? ' - '}</h6>
                  </CCol>
                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>Tehsil</span>

                    <h6>{showCaseData.teh ?? ' - '}</h6>
                  </CCol>
                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>District</span>

                    <h6>{showCaseData.dist ?? ' - '}</h6>
                  </CCol>
                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>State</span>

                    <h6>{showCaseData.state ?? ' - '}</h6>
                  </CCol>

                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>Pin</span>

                    <h6>{showCaseData.pin ?? ' - '}</h6>
                  </CCol>

                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>Landmark</span>

                    <h6>{showCaseData.landmark ?? ' - '}</h6>
                  </CCol>

                </CRow>

                {showCaseData && showCaseData?.occupant === 'tenant' && (
                  <>
                    <br />
                    <div className=''>Tenant Details</div>
                    {showCaseData.tenant_details.length > 0 &&
                      showCaseData.tenant_details.map((item, index) => (
                        <CRow key={index}>
                          <CCol md={3}>
                            <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                              Tenant Name
                            </span>
                            <h6>{item.tenant_name ?? ' - '}</h6>
                          </CCol>

                          <CCol md={3}>
                            <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                              Relation
                            </span>

                            <h6>{item.tenant_relation ?? ' - '}</h6>
                          </CCol>
                          <CCol md={3}>
                            <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                              Tenant Date
                            </span>

                            <h6>{moment(item.tenant_date).format('DD MMM YYYY') ?? ' - '}</h6>
                          </CCol>
                          <CCol md={3}>
                            <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                              Exp/Rent
                            </span>

                            <h6>{item.exp_rent ?? ' - '}</h6>
                          </CCol>
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

export default PersonalInfoSDM
