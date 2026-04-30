import React, { useState } from 'react'
import { CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'

import {
  cilChevronCircleDownAlt,
  cilChevronCircleUpAlt,
  cilCloudDownload,
  cilPencil,
} from '@coreui/icons'

import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { Document, Page, Text, View, StyleSheet, Font, pdf } from '@react-pdf/renderer';

const DistanceDetails = ({ showCaseData }) => {
  let loggedinUserRole = useSelector((state) => state?.userRole)
  var params = useParams()
  const id = params.id
  const [show, setShow] = useState(false)
  const navigate = useNavigate()

  return (
    <>

      <CRow className="mt-4">
        <CCol md={12}>
          <CCard className="applicant-details">
            <CCardHeader className="d-flex justify-content-between align-items-center c-card-headerSdm rounded">
              Distance From
              <div className="action-btn">
                {params.type !== 'show-case-details' && (
                  <div className="edit-btn">
                    <CIcon
                      icon={cilPencil}
                      onClick={() =>
                        navigate(`/case/${id}/update/distance-from/by/${loggedinUserRole.name}`, {
                          state: { fifthStepVisible: true, formStep: 5 },
                        })
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
                      Road Type
                    </span>
                    {/* <h6>{showCaseData.applicant_name ?? '-'}</h6> */}
                    <h6>{showCaseData.road_type ?? ' - '}</h6>
                  </CCol>
                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                      Wall To Wall Road Width
                    </span>
                    {/* <h6>{showCaseData.applicant_name ?? '-'}</h6> */}
                    <h6>{showCaseData.wall_to_wall_road_width ?? ' - '}</h6>
                  </CCol>
                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                      Road Center To Wall Width
                    </span>
                    {/* <h6>{showCaseData.contact_number_1 ?? '-'}</h6> */}
                    <h6>{showCaseData.road_center_to_wall_width ?? '- '}</h6>
                  </CCol>

                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                      Highway Name & No. And Dist.
                    </span>
                    {/* <h6>{showCaseData.contact_number_1 ?? '-'}</h6> */}
                    <h6>{showCaseData.highway_name_and_no_dist ?? ' - '}</h6>
                  </CCol>
                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                      City Center KM
                    </span>
                    {/* <h6>{showCaseData.contact_number_1 ?? '-'}</h6> */}
                    <h6>{showCaseData.city_centre_km ?? ' - '}</h6>
                  </CCol>
                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>Hospital KM</span>
                    {/* <h6>{showCaseData.person_meet_at_site_name ?? '-'}</h6> */}
                    <h6>{showCaseData.hospital_km ?? ' - '}</h6>
                  </CCol>
                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                      Railway Station KM
                    </span>
                    {/* <h6>{showCaseData.person_meet_at_site_mobile ?? '-'}</h6> */}
                    <h6>{showCaseData.railway_station_km ?? ' - '}</h6>
                  </CCol>
                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>Bus Stand KM</span>
                    {/* <h6>{showCaseData.person_meet_at_site_relation ?? '-'}</h6> */}
                    <h6>{showCaseData.bus_stand_km ?? ' - '}</h6>
                  </CCol>
                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                      Any Govt. Office
                    </span>
                    {/* <h6> {showCaseData.type_of_property ?? '-'}</h6> */}
                    <h6>{showCaseData.any_govt_office ?? ' - '}</h6>
                  </CCol>
                </CRow>
                <CRow className="mt-3">
                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>Other</span>
                    {/* <h6> {showCaseData.type_of_property ?? '-'}</h6> */}
                    <h6>{showCaseData.other ?? ' - '}</h6>
                  </CCol>
                </CRow>
              </CCardBody>
            )}
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default DistanceDetails
