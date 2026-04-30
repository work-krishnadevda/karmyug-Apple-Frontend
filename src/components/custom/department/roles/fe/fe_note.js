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

const FE_Note_Comp = ({ showCaseData }) => {
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
                            FE Note
                            <div className="action-btn">
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
                                    <CCol md={12}>
                                        <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>Note:</span>
                                        <div dangerouslySetInnerHTML={{ __html: showCaseData.fe_note ? showCaseData.fe_note : '-' }} />
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

export default FE_Note_Comp
