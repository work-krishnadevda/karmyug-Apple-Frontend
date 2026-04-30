import React, { useState } from 'react'
import { CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { cilChevronCircleDownAlt, cilChevronCircleUpAlt, cilPencil } from '@coreui/icons'

const DistanceDetails = ({ showCaseData }) => {

  // console.log(
  //   'showCaseData.additional_fields',
  //   showCaseData.additional_fields.filter((item) => item.role === 'DM'),
  // )

  let loggedinUserRole = useSelector((state) => state?.userRole)
  const params = useParams()
  const id = params.id
  const [show, setShow] = useState(false)
  const navigate = useNavigate()

  const renderKeyValuePairs = () => {
    const fieldData = showCaseData?.additional_fields?.find((obj) => obj.role === 'DM');
  
    if (!fieldData) return null;
  
    return Object.entries(fieldData).map(([key, value]) => {
      if (key === 'role') return null;
  
      return (
        <CCol md={3} key={key}>
          <span style={{ fontSize: '13px', color: 'rgb(115 180 60)' }}>{key}</span>
          <h6>{value}</h6>
        </CCol>
      );
    });
  };
  


  return (
    <>
      <CRow className="mt-4">
        <CCol md={12}>
          <CCard className="applicant-details">
            <CCardHeader className="d-flex justify-content-between align-items-center c-card-headerSdm rounded">
              Dm Details
              <div className="action-btn">
                <div className="edit-btn">
                  <CIcon
                    icon={cilPencil}
                    onClick={() =>
                      navigate(`/case/${id}/update/dm-details/by/${loggedinUserRole.name}`, {
                        state: { toggleDMForm: true },
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
                <CRow>{renderKeyValuePairs()}</CRow>
              </CCardBody>
            )}
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default DistanceDetails
