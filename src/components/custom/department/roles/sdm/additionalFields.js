import React, { useState } from 'react'
import { CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'

import { cilChevronCircleDownAlt, cilChevronCircleUpAlt, cilPencil } from '@coreui/icons'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'

const AdditionalFields = ({ showCaseData, role }) => {
  let loggedinUserRole = useSelector((state) => state?.userRole)
  var params = useParams()
  const id = params.id
  const [show, setShow] = useState(false)
  const navigate = useNavigate()

  return (
    <>
      <CCard className="applicant-details mt-3">
        <CCardHeader className="d-flex justify-content-between align-items-center c-card-headerSdm rounded">
          Additional Fields
          <div className="action-btn">
            <div className="edit-btn">
              {loggedinUserRole.name === process.env.REACT_APP_SDM && (
                <CIcon
                  icon={cilPencil}
                  onClick={() =>
                    navigate(`/case/${id}/update/additional-fields/by/${loggedinUserRole.name}`, {
                      state: { additionalFieldsFormVisible: true },
                    })
                  }
                />
              )}
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
            {showCaseData &&
              showCaseData?.additional_fields &&
              showCaseData?.additional_fields.filter((item) => item.role === role).length > 0 && (
                <>
                  {showCaseData &&
                    showCaseData.additional_fields &&
                    showCaseData.additional_fields
                      .filter((item) => item.role === role)
                      .map((field, index) => (
                        <CRow key={index} >
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
    </>
  )
}

export default AdditionalFields
