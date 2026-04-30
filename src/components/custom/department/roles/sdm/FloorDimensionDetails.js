import React, { useState } from 'react'

import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'
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


const FloorDimensionDetails = ({ showCaseData }) => {
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
              Floors and Dimensions
              <div className="action-btn">
                {params.type !== 'show-case-details' && (
                  <div className="edit-btn">
                    <CIcon
                      icon={cilPencil}
                      onClick={() =>
                        navigate(
                          `/case/${id}/update/floor-dimensions/by/${loggedinUserRole.name}`,
                          {
                            state: { thirdStepVisible: true, formStep: 3 },
                          },
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
                      Type of Property
                    </span>

                    <h6>{showCaseData.location_type ?? ' - '}</h6>
                  </CCol>
                  <CCol md={3}>
                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                      Sub Type Property
                    </span>

                    <h6>{showCaseData.sub_location_type ?? ' - '}</h6>
                  </CCol>

                  {/* ------------------------------  Vacant Plot Land ----------------------------- */}

                  {showCaseData.location_type === 'vacant plot/land' && (
                    <>
                      <CCol md={3}>
                        <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                          Construction Stage
                        </span>

                        <h6>{showCaseData?.construction_stage ?? ' - '}</h6>
                      </CCol>
                      <CCol md={3}>
                        <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                          Construction at site
                        </span>

                        <h6 className="floor_header">
                          {showCaseData?.construction_at_site.length > 0
                            ? showCaseData.construction_at_site.map((item) => (
                              <span key={item._id}>{item.name},</span>
                            ))
                            : ' - '}
                        </h6>
                      </CCol>
                      <CCol md={3}>
                        <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                          Dimensions
                        </span>

                        <h6>
                          {showCaseData.dimension.length || showCaseData.dimension.length
                            ? `${showCaseData.dimension.length ?? ' - '} X
                      ${showCaseData.dimension.width ?? ' - '}`
                            : ' - '}
                        </h6>
                      </CCol>
                      <CCol md={3}>
                        <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                          Land Area
                        </span>

                        <h6>{showCaseData.land_area ?? ' - '}</h6>
                      </CCol>

                      <CCol md={6}>
                        <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>Remark</span>

                        <h6>{showCaseData.floors_and_dimentions_remarks ?? ' - '}</h6>

                      </CCol>

                      {
                        showCaseData.is_under_renovation == '1' && (

                          <>
                            <CCol md={3}>
                              <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                                Under Renovation
                              </span>
                              <h6>{showCaseData.is_under_renovation === '1' ? 'Yes' : 'Not'}</h6>
                            </CCol>

                            <CCol md={3}>
                              <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                                Construction At Site
                              </span>
                              <div>
                                {showCaseData.construction_at_site.length > 0 ? (
                                  <>
                                    {showCaseData?.construction_at_site.map((construction_at_site, index) => (
                                      <span key={index} className="floor_header">
                                        {construction_at_site?.name},
                                      </span>
                                    ))}
                                  </>
                                ) : (
                                  <span> - </span>
                                )}
                              </div>
                            </CCol>




                          </>





                        )
                      }
                    </>
                  )}

                  {/* ------------------------------<<<<<<<<<<  Commercial and educational and 2 More >>>>>>----------------------------- */}

                  {['residential', 'commercial', 'eductaional', 'industrial'].includes(
                    showCaseData?.location_type,
                  ) && (
                      <>
                        {/* ------------------------------ <<<<<<<<<< Land & Building Condition >>>>>>>>>>>> ----------------------------- */}
                        {showCaseData?.sub_location_type === 'land and building' && (
                          <>
                            <CCol md={3}>
                              <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                                Number of Wings Available
                              </span>
                              <h6>{showCaseData?.number_of_wings_available ?? '-'}</h6>
                            </CCol>
                            <CCol md={3}>
                              <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                                Shape Type
                              </span>
                              <h6>{showCaseData?.shape_type ?? '-'}</h6>
                            </CCol>
                            <CCol md={3}>
                              <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                                Property Dimensions
                              </span>
                              <h6>
                                {showCaseData?.dimension.length ?? '-'} X{' '}
                                {showCaseData.dimension.width ?? '-'}{' '}
                              </h6>
                            </CCol>
                            <CCol md={3}>
                              <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                                Land area (in sqft)
                              </span>
                              <h6>{showCaseData?.land_area ?? '-'}</h6>
                            </CCol>
                            <CCol md={3}>
                              <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                                BUA Rate
                              </span>
                              <h6>{showCaseData?.bua_rate ?? '-'}</h6>
                            </CCol>
                            <CCol md={3}>
                              <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                                Land Rate
                              </span>
                              <h6>{showCaseData?.land_rate ?? '-'}</h6>
                            </CCol>
                            <CCol md={3}>
                              <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                                Exteriors
                              </span>
                              <h6 className="floor_header">
                                {showCaseData?.exteriors.map((item) => {
                                  return <span>{item?.name}, </span>
                                })}
                              </h6>
                            </CCol>
                            <CCol md={3}>
                              <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                                No. Of Floors
                              </span>
                              <h6>{showCaseData?.no_of_floors == 0 ? 'Groud' : `G+${showCaseData?.no_of_floors}` ?? '-'}</h6>
                            </CCol>
                            <CCol md={3}>
                              <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                                Com/Basement/Other
                              </span>
                              <h6>{showCaseData?.is_basement ?? '-'}</h6>
                            </CCol>
                            {showCaseData?.no_of_floors >= 0 && (
                              <CCol color="dark" md={12}>
                                <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                                  Floor Details
                                </span>
                                <CCard className="border border-white shadow-none">
                                  <div
                                    style={{
                                      overflowY: 'scroll',
                                      overflowX: 'scroll',
                                      maxHeight: '200px',
                                      maxWidth: '90vw',
                                    }}
                                  >
                                    <CTable>
                                      <CTableHead>
                                        <CTableRow>
                                          <CTableHeaderCell
                                            scope="col"
                                            className=" floor_header w-20"
                                          >
                                            Floor Name
                                          </CTableHeaderCell>
                                          <CTableHeaderCell
                                            scope="col"
                                            className=" floor_header w-20"
                                          >
                                            Built-Up Dimension
                                          </CTableHeaderCell>
                                          <CTableHeaderCell
                                            scope="col"
                                            className=" floor_header w-20"
                                          >
                                            Land Area (IN Sqft)
                                          </CTableHeaderCell>
                                          <CTableHeaderCell
                                            scope="col"
                                            className=" floor_header w-20"
                                          >
                                            Interiors
                                          </CTableHeaderCell>
                                          <CTableHeaderCell
                                            scope="col"
                                            className="   floor_header w-20"
                                          >
                                            Details Of Floor
                                          </CTableHeaderCell>
                                        </CTableRow>
                                      </CTableHead>
                                      <CTableBody>
                                        {showCaseData?.floor_wise_details.map((item, i) => (
                                          <>
                                            <CTableRow key={item.id}>
                                              <CTableDataCell className="   floor_header">
                                                {i === 0 ? 'Ground' : `G+${i}`}
                                              </CTableDataCell>
                                              <CTableDataCell className="   floor_header">
                                                {item.builtuplength > 0 || item.builtupwidth > 0
                                                  ? `${item.builtupwidth}X${item.builtuplength}`
                                                  : ' - '}
                                              </CTableDataCell>
                                              <CTableDataCell className=" floor_header">
                                                {item.bua ?? ' - '}
                                              </CTableDataCell>
                                              <CTableDataCell className="   floor_header">
                                                <div>
                                                  {item?.interiors.length > 0 ? (
                                                    <>
                                                      {item?.interiors.map((interior, index) => (
                                                        <span key={index} className="floor_header">
                                                          {interior?.name},
                                                        </span>
                                                      ))}
                                                    </>
                                                  ) : (
                                                    <span> - </span>
                                                  )}
                                                </div>
                                              </CTableDataCell>
                                              <CTableDataCell className=" floor_header">
                                                {item.noofrooms || ' - '}
                                              </CTableDataCell>
                                            </CTableRow>
                                          </>
                                        ))}
                                      </CTableBody>
                                    </CTable>
                                  </div>
                                </CCard>
                              </CCol>
                            )}

                            {showCaseData?.no_of_basement > 0 && (
                              <CCol color="dark" md={12} className="mt-2">
                                <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                                  Basement Details
                                </span>
                                <CCard className="border border-white shadow-none">
                                  <div
                                    style={{
                                      overflowY: 'scroll',
                                      overflowX: 'scroll',
                                      maxHeight: '200px',
                                    }}
                                  >
                                    <CTable hover>
                                      <CTableHead>
                                        <CTableRow>
                                          <CTableHeaderCell scope="col" className="floor_header">
                                            Details Of Basement
                                          </CTableHeaderCell>
                                          <CTableHeaderCell scope="col" className="floor_header">
                                            Built-Up Dimension
                                          </CTableHeaderCell>
                                          <CTableHeaderCell scope="col" className="floor_header">
                                            Land Area (IN Sqft)
                                          </CTableHeaderCell>
                                        </CTableRow>
                                      </CTableHead>
                                      <CTableBody>
                                        {showCaseData?.basement_wise_details.map((item) => (
                                          <CTableRow key={item.id}>
                                            <CTableDataCell className="floor_header">
                                              {item.basementdetails}
                                            </CTableDataCell>
                                            <CTableDataCell className="floor_header">
                                              {item?.builtupwidth ?? ' - '} X
                                              {item?.builtuplength ?? ' - '}
                                            </CTableDataCell>
                                            <CTableDataCell className="floor_header">
                                              {item.bua}
                                            </CTableDataCell>
                                          </CTableRow>
                                        ))}
                                      </CTableBody>
                                    </CTable>
                                  </div>
                                </CCard>
                              </CCol>
                            )}

                            {showCaseData?.is_stilt > 0 && (
                              <CCol md={3}>
                                <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                                  Stilt
                                </span>
                                <h6>{showCaseData?.stilt ?? '-'}</h6>
                              </CCol>
                            )}
                            {showCaseData?.is_mezzanine > 0 && (
                              <CCol md={3}>
                                <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                                  Mezzanine
                                </span>
                                <h6>{showCaseData?.mezzanine ?? '-'}</h6>
                              </CCol>
                            )}

                            {
                              showCaseData.is_property_under_construction == '1' && (

                                <>
                                  <CCol md={3}>
                                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                                      Under Construction At Site
                                    </span>
                                    <h6>{showCaseData.is_property_under_construction === '1' ? 'Yes' : 'Not'}</h6>
                                  </CCol>

                                  <CCol md={3}>
                                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                                      Under Construction At Site
                                    </span>
                                    <div>
                                      {showCaseData?.under_construction_at_site.length > 0 ? (
                                        <>
                                          {showCaseData?.under_construction_at_site.map((construction_at_site, index) => (
                                            <span key={index} className="floor_header">
                                              {construction_at_site?.name},
                                            </span>
                                          ))}
                                        </>
                                      ) : (
                                        <span> - </span>
                                      )}
                                    </div>
                                  </CCol>

                                </>
                              )
                            }

                            <CCol md={3}>
                              <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                                Carpet Area (in sqft)
                              </span>
                              <h6>{showCaseData?.carpet_rate ?? '-'}</h6>
                            </CCol>

                            <CCol md={3}>
                              <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>Lift</span>
                              <h6>{showCaseData?.lift ?? '-'}</h6>
                            </CCol>
                            {showCaseData.lift === 'yes' && (
                              <CCol md={3}>
                                <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                                  No of Lift
                                </span>
                                <h6>{showCaseData?.no_of_lifts ?? '-'}</h6>
                              </CCol>
                            )}

                            <CCol md={6}>
                              <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>Remark</span>

                              <h6>{showCaseData.floors_and_dimentions_remarks ?? ' - '}</h6>

                            </CCol>

                          </>
                        )}

                        {/* ------------------------------ <<<<<<< Flat & Multistory Building  >>>>>> ----------------------------- */}

                        {showCaseData?.sub_location_type === 'flat/multistory building' && (
                          <>
                            <CCol md={3}>
                              <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                                Name of wing
                              </span>
                              <h6>{showCaseData?.name_of_wing ?? '-'}</h6>
                            </CCol>
                            <CCol md={3}>
                              <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                                No. Of Wing/Building
                              </span>
                              <h6>{showCaseData?.no_of_wing_or_building ?? '-'}</h6>
                            </CCol>
                            <CCol md={3}>
                              <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                                Unit/ Flat Situated On Wing
                              </span>
                              <h6>{showCaseData?.flat_situated_on_wing ?? '-'}</h6>
                            </CCol>

                            <CCol md={3}>
                              <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                                No. Of Floors In Wing
                              </span>

                              <div>
                                {showCaseData?.multistory_no_of_floors.length > 0 ? (
                                  <>
                                    {showCaseData?.multistory_no_of_floors.map((interior, index) => (
                                      <span key={index} className="floor_header">
                                        {interior?.name},
                                      </span>
                                    ))}
                                  </>
                                ) : (
                                  <span> - </span>
                                )}
                              </div>
                            </CCol>
                            <CCol md={3}>
                              <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                                Unit/ Flat Situated On Floor
                              </span>
                              <h6>{showCaseData?.located_on_floor[0]?.name ?? '-'}</h6>
                            </CCol>
                            <CCol md={3}>
                              <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                                No. Of Unit/ Flat Are Available On Visited Floor
                              </span>
                              <h6>{showCaseData?.other_flats_on_visited_floor ?? '-'}</h6>
                            </CCol>
                            <CCol md={3}>
                              <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                                Built-Up Dimension
                              </span>
                              <h6>
                                {showCaseData?.builup_with_dimention.length ?? '-'} X{' '}
                                {showCaseData?.builup_with_dimention.width ?? ' - '}
                              </h6>
                            </CCol>
                            <CCol md={3}>
                              <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                                Bulid Land Area (IN Sqft)
                              </span>
                              <h6>{showCaseData?.builup_with_dimention?.dimension ?? '-'}</h6>
                            </CCol>

                            <CCol md={3}>
                              <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                                Super Build Area (IN Sqft)
                              </span>
                              <h6>{showCaseData?.multistory_land_rate ?? '-'}</h6>
                            </CCol>

                            <CCol md={3}>
                              <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                                Carpet Area (in sqft)
                              </span>
                              <h6>{showCaseData?.carpet_rate ?? '-'}</h6>
                            </CCol>



                            <CCol md={3}>
                              <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>Lift</span>
                              <h6>{showCaseData?.lift ?? '-'}</h6>
                            </CCol>

                            {showCaseData.lift === 'yes' && (
                              <CCol md={3}>
                                <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                                  No of Lift
                                </span>
                                <h6>{showCaseData?.no_of_lifts ?? '-'}</h6>
                              </CCol>
                            )}
                            <CCol md={3}>
                              <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                                Details Of Flat
                              </span>
                              <h6>{showCaseData?.details_of_flat ?? '-'}</h6>
                            </CCol>
                            <CCol md={3}>
                              <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                                Interiors
                              </span>
                              <div>
                                {showCaseData.interior.length > 0 ? (
                                  <>
                                    {showCaseData?.interior.map((interior, index) => (
                                      <span key={index} className="floor_header">
                                        {interior?.name},
                                      </span>
                                    ))}
                                  </>
                                ) : (
                                  <span> - </span>
                                )}
                              </div>
                            </CCol>



                            {
                              showCaseData.is_under_renovation == '1' && (

                                <>
                                  <CCol md={3}>
                                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                                      Under Renovation
                                    </span>
                                    <h6>{showCaseData.is_under_renovation === '1' ? 'Yes' : 'Not'}</h6>
                                  </CCol>

                                  {/* <CCol md={3}>
                                    <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                                      Under Construction At Site
                                    </span>
                                    <div>
                                      {showCaseData?.construction_at_site.length > 0 ? (
                                        <>
                                          {showCaseData?.under_construction_at_site.map((construction_at_site, index) => (
                                            <span key={index} className="floor_header">
                                              {construction_at_site?.name},
                                            </span>
                                          ))}
                                        </>
                                      ) : (
                                        <span> - </span>
                                      )}
                                    </div>
                                  </CCol> */}
                                </>

                              )
                            }

                            <CCol md={3}>
                              <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                                No of Basement
                              </span>
                              <h6>{showCaseData?.no_of_basement ?? '-'}</h6>
                            </CCol>

                            {showCaseData?.no_of_basement > 0 && (
                              <CCol color="dark" md={12} className="mt-2">
                                <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                                  Basement Details
                                </span>
                                <CCard className="border border-white shadow-none">
                                  <div
                                    style={{
                                      overflowX: 'scroll',
                                      maxHeight: '200px',
                                      overflowY: 'scroll',
                                      maxwidth: '50vw',
                                    }}
                                  >
                                    <CTable hover>
                                      <CTableHead>
                                        <CTableRow>
                                          <CTableHeaderCell scope="col" className="floor_header w-30">
                                            Details Of Basement
                                          </CTableHeaderCell>
                                          <CTableHeaderCell scope="col" className="floor_header w-30">
                                            Built-Up Dimension
                                          </CTableHeaderCell>
                                          <CTableHeaderCell scope="col" className="floor_header w-30">
                                            Land Area (IN Sqft)
                                          </CTableHeaderCell>
                                        </CTableRow>
                                      </CTableHead>
                                      <CTableBody>
                                        {showCaseData?.basement_wise_details.map((item) => (
                                          <CTableRow key={item.id}>
                                            <CTableDataCell className="floor_header">
                                              {item.basementdetails}
                                            </CTableDataCell>
                                            <CTableDataCell className="floor_header">
                                              {item?.builtupwidth ?? ' - '} X
                                              {item?.builtuplength ?? ' - '}
                                            </CTableDataCell>
                                            <CTableDataCell className="floor_header">
                                              {item.bua}
                                            </CTableDataCell>
                                          </CTableRow>
                                        ))}
                                      </CTableBody>
                                    </CTable>
                                  </div>
                                </CCard>
                              </CCol>
                            )}
                            {showCaseData?.is_stilt > 0 && (
                              <CCol md={3}>
                                <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                                  Stilt
                                </span>
                                <h6>{showCaseData?.stilt ?? '-'}</h6>
                              </CCol>
                            )}
                            {showCaseData?.is_mezzanine > 0 && (
                              <CCol md={3}>
                                <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                                  Mezzanine
                                </span>
                                <h6>{showCaseData?.mezzanine ?? '-'}</h6>
                              </CCol>
                            )}

                            <CCol md={3}>
                              <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                                Loading %
                              </span>
                              <h6>{showCaseData?.loding_in_percentage ?? '-'}</h6>
                            </CCol>
                            <CCol md={3}>
                              <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                                BUA Rate (Per Sqft)
                              </span>
                              <h6>{showCaseData?.flat_per_sqrt_rate_bua ?? '-'}</h6>
                            </CCol>
                            <CCol md={3}>
                              <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                                SBUA Rate (Per Sqft)
                              </span>
                              <h6>{showCaseData?.flat_per_sqrt_rate_sbua ?? '-'}</h6>
                            </CCol>
                            <CCol md={3}>
                              <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>
                                Unit Rate
                              </span>
                              <h6>{showCaseData?.flat_multistory_building_unit_rate ?? '-'}</h6>
                            </CCol>
                            <CCol md={6}>
                              <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>Remark</span>

                              <h6>{showCaseData.floors_and_dimentions_remarks ?? ' - '}</h6>

                            </CCol>
                          </>
                        )}
                      </>
                    )}
                </CRow>

              </CCardBody>
            )}
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}
export default FloorDimensionDetails
