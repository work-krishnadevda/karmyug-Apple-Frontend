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
import EditFeOldVisit from 'src/components/custom/popup/edit_old_visit_reason'


const FE_OLD_VISIT_REASON = ({ showCaseData }) => {

    let loggedinUserRole = useSelector((state) => state?.userRole)
    var params = useParams()
    const id = params.id
    const [show, setShow] = useState(false)
    const navigate = useNavigate()

    const [visible, setVisible] = useState(false)

    return (
        <>
            <CRow className="mt-4">
                <CCol md={12}>
                    <CCard className="applicant-details">
                        <CCardHeader className="d-flex justify-content-between align-items-center c-card-headerSdm rounded">
                            Old Visit Details
                            <div className="action-btn">
                                <div className="edit-btn">
                                    <CIcon
                                        icon={cilPencil}
                                        onClick={() => setVisible(!visible)}
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
                                    <CCol md={12}>
                                        <div>
                                            {showCaseData?.visit_region_fe ? showCaseData?.visit_region_fe : '-'}
                                        </div>
                                    </CCol>
                                </CRow>
                            </CCardBody>
                        )}
                    </CCard>
                </CCol>
            </CRow>

            <EditFeOldVisit visible={visible} close={() => setVisible(false)} />

        </>
    )
}




export default FE_OLD_VISIT_REASON
