import React, { useState } from 'react'
import { CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'

import {
  cilChevronCircleDownAlt,
  cilChevronCircleUpAlt,
  cilCloudDownload,
  cilPencil,
} from '@coreui/icons'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'


import { Document, Page, Text, View, StyleSheet, Font, pdf } from '@react-pdf/renderer';
const RateDimesionDetails = ({ showCaseData }) => {
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
              Rate and Lat Long
              <div className="action-btn">
                {params.type !== 'show-case-details' && (
                  <div className="edit-btn">
                    <CIcon
                      icon={cilPencil}
                      onClick={() =>
                        navigate(`/case/${id}/update/rate-latlong/by/${loggedinUserRole.name}`, {
                          state: { sixthStepVisible: true, formStep: 6 },
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
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>Verified Market Rate (In Sqft)</span>
                    {/* <h6>{showCaseData.contact_number_1 ?? '-'}</h6> */}
                    <h6>{showCaseData.market_rate ?? ' - '}</h6>
                  </CCol>
                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>Whole Rented Amount</span>
                    {/* <h6>{showCaseData.person_meet_at_site_name ?? '-'}</h6> */}
                    <h6>{showCaseData.rental_rate ?? ' - '}</h6>
                  </CCol>
                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                      Person Name Verified Through
                    </span>
                    {/* <h6>{showCaseData.person_meet_at_site_mobile ?? '-'}</h6> */}
                    <h6>{showCaseData.verified_thru_name ?? ' - '}</h6>
                  </CCol>
                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>Latitude , Longitude</span>
                    {/* <h6>{showCaseData.person_meet_at_site_mobile ?? '-'}</h6> */}
                    <h6>
                      {showCaseData?.latitude_by_fe ?? ' - '} , {showCaseData?.longitude_by_fe ?? ' - '}{' '}
                    </h6>
                  </CCol>
                </CRow>
                <CRow className="mt-3">
                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                      Contact Verified Through
                    </span>
                    {/* <h6>{showCaseData.person_meet_at_site_relation ?? '-'}</h6> */}
                    <h6>{showCaseData.verified_thru_contact ?? ' - '}</h6>
                  </CCol>

                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>Remark</span>
                    {/* <h6> {showCaseData.type_of_property ?? '-'}</h6> */}
                    <h6>{showCaseData.rate_and_lat_long_remarks ?? ' - '}</h6>
                  </CCol>

                  <CCol md={6}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                      Required Photo Check
                    </span>
                    {/* <h6> {showCaseData.type_of_property ?? '-'}</h6> */}
                    <h6 className="floor_header">
                      {showCaseData.required_photos_check.selfie && 'Selfie, '}
                      {showCaseData.required_photos_check.e_bill && 'E-Bill, '}
                      {showCaseData.required_photos_check.map && 'Map, '}
                      {showCaseData.required_photos_check.applicant_selfie && 'Applicant Selfie, '}
                      {showCaseData.required_photos_check.property_selfie && 'Prop, '}
                      {showCaseData.required_photos_check.drow && 'Selfie, '}
                      {Object.values(showCaseData.required_photos_check).every((val) => !val) &&
                        '-'}
                    </h6>
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

export default RateDimesionDetails
