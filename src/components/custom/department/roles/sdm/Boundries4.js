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

const Boundries4 = ({ showCaseData }) => {
  const [show, setShow] = useState(false)
  const navigate = useNavigate()
  const params = useParams()
  var { id } = useParams()

  let loggedinUserRole = useSelector((state) => state?.userRole)


  Font.register({ family: 'Roboto', src: 'https://fonts.googleapis.com/css2?family=Roboto&display=swap' });

  const generatePDF = (showCaseData) => {
    const styles = StyleSheet.create({
      page: {
        padding: 20,
        fontSize: 12,
      },
      section: {
        marginBottom: 10,
      },
      header: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#73B43C',
      },
      content: {
        fontSize: 11,
        marginBottom: 5,
      },
      table: {
        display: 'table',
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        marginVertical: 10,
      },
      tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
      },
      tableHeader: {
        backgroundColor: '#f0f0f0',
        fontWeight: 'bold',
      },
      tableCell: {
        padding: 5,
        borderRightWidth: 1,
        flex: 1,
      },
      label: {
        color: '#73B43C',
        fontSize: 11,
        marginBottom: 2,
      },
      value: {
        fontSize: 11,
        marginBottom: 5,
      },
    });

    const DataRow = ({ label, value }) => (
      <View style={{ marginBottom: 5, flexDirection: 'row', alignItems: 'center', }}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value || ' - '}</Text>
      </View>
    );

    return (
      <Document>
        <Page style={styles.page}>
          <Text style={{ ...styles.header, fontSize: 16, textAlign: 'center', marginBottom: 15 }}>
            4 Boundries Information
          </Text>

          {/* Display General Information */}
          <DataRow label="Property Hold Type" value={showCaseData?.type_of_property} />
          <DataRow label="Proximity" value={showCaseData?.proximity} />
          <DataRow label="East" value={showCaseData?.east} />
          <DataRow label="West" value={showCaseData?.west} />
          <DataRow label="North" value={showCaseData?.north} />
          <DataRow label="South" value={showCaseData?.south} />
          <DataRow label="If Not Matching Reason" value={showCaseData?.not_match_reason} />

          {/* Self-Occupied or Vacant Plot handling */}
          {showCaseData?.occupant === 'Occupied' && (
            <>
              <DataRow label="Occupant" value={showCaseData?.occupant} />
              <DataRow label="Self Occupied" value={showCaseData?.self_occupied} />
              <DataRow label="Tenure" value={showCaseData?.tenure} />
            </>
          )}

          {showCaseData?.occupant === 'Vacant' && (
            <DataRow label="Property Vacant From Last Month" value={showCaseData?.self_occupied} />
          )}

          {/* Vacant Plot / Land Section */}
          {showCaseData?.location_type === 'vacant plot/land' && (
            <View style={styles.section}>
              <DataRow label="Construction Stage" value={showCaseData?.construction_stage} />
              <DataRow label="Dimensions" value={`${showCaseData?.dimension?.length} x ${showCaseData?.dimension?.width}`} />
              <DataRow label="Land Area" value={showCaseData?.land_area} />
              <DataRow label="Remark" value={showCaseData?.floors_and_dimentions_remarks} />
              {showCaseData?.is_under_renovation === '1' && (
                <>
                  <DataRow label="Under Renovation" value="Yes" />
                  <DataRow label="Construction At Site" value={showCaseData?.construction_at_site?.map(item => item.name).join(', ')} />
                </>
              )}
            </View>
          )}

          {/* Tenant Details */}
          {showCaseData?.occupant === 'tenant' && showCaseData?.tenant_details.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.header}>Tenant Details</Text>
              {showCaseData.tenant_details.map((tenant, index) => (
                <View key={index}>
                  <DataRow label="Tenant Name" value={tenant.tenant_name} />
                  <DataRow label="Relation" value={tenant.tenant_relation} />
                  <DataRow label="Tenant Date" value={moment(tenant.tenant_date).format('DD MMM YYYY')} />
                  <DataRow label="Exp/Rent" value={tenant.exp_rent} />
                </View>
              ))}
            </View>
          )}
        </Page>
      </Document>
    );
  };



  return (
    <>

      <CRow className="mt-4">
        <CCol md={12}>
          <CCard className="applicant-details">
            <CCardHeader className="d-flex justify-content-between align-items-center c-card-headerSdm">
              4 Boundries
              <div className="action-btn">
                {params.type !== 'show-case-details' && (
                  <div className="edit-btn">
                    <CIcon
                      icon={cilPencil}
                      onClick={() =>
                        navigate(`/case/${id}/update/boundries/by/${loggedinUserRole.name}`, {
                          state: { secondStepVisible: true, formStep: 2 },
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
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>Proximity</span>
                    {/* <h6>{showCaseData.contact_number_1 ?? '-'}</h6> */}
                    <h6>{showCaseData.proximity ?? ' - '} </h6>
                  </CCol>
                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>East</span>
                    {/* <h6>{showCaseData.person_meet_at_site_name ?? '-'}</h6> */}
                    <h6>{showCaseData.east ?? ' - '}</h6>
                  </CCol>
                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>West</span>
                    {/* <h6>{showCaseData.person_meet_at_site_mobile ?? '-'}</h6> */}
                    <h6>{showCaseData.west ?? ' - '}</h6>
                  </CCol>
                </CRow>
                <CRow className="mt-3">
                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>North</span>
                    {/* <h6>{showCaseData.person_meet_at_site_relation ?? '-'}</h6> */}
                    <h6>{showCaseData.north ?? ' - '}</h6>
                  </CCol>
                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>South</span>
                    {/* <h6> {showCaseData.type_of_property ?? '-'}</h6> */}
                    <h6>{showCaseData.south ?? ' - '}</h6>
                  </CCol>
                  <CCol md={6}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                      If Not Matching Reason
                    </span>
                    {/* <h6> {showCaseData.type_of_property ?? '-'}</h6> */}
                    <h6>{showCaseData.not_match_reason ?? ' - '}</h6>
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
export default Boundries4
