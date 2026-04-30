import React, { useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'

import { cilChevronCircleDownAlt, cilChevronCircleUpAlt, cilPencil } from '@coreui/icons'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'

const AdditionalFieldsForm = ({
  additionalFields,
  setAdditionalFields,
  additionalJson,
  setAdditionalJson,
}) => {
  let loggedinUserRole = useSelector((state) => state?.userRole)
  var params = useParams()
  const id = params.id
  const [show, setShow] = useState(false)
  const navigate = useNavigate()

  const renderField = (field) => {
    const fieldName = field.key
    const role = field?.role

    const additionalJsonArray = Array.isArray(additionalJson) ? additionalJson : []
    const objectIndex = additionalJsonArray.findIndex((obj) => obj.role === role)
    const fieldValue = objectIndex >= 0 ? additionalJsonArray[objectIndex][fieldName] : ''

    const updateFieldValue = (key, value) => {
      setAdditionalJson((prevFormData) => {
        const prevFormDataArray = Array.isArray(prevFormData) ? prevFormData : []

        const newFormData = [...prevFormDataArray]

        if (objectIndex >= 0) {
          newFormData[objectIndex] = {
            ...newFormData[objectIndex],
            [key]: value,
          }
        } else {
          newFormData.push({
            role: role,
            [key]: value,
          })
        }

        return newFormData
      })
    }

    switch (field.type) {
      case 'text':
        return (
          <CFormInput
            type="text"
            name={fieldName}
            autoComplete="off"
            value={fieldValue}
            onChange={(e) => updateFieldValue(fieldName, e.target.value)}
          />
        )
      case 'select':
        return (
          <CFormSelect
            name={fieldName}
            value={fieldValue}
            onChange={(e) => updateFieldValue(fieldName, e.target.value)}
          >
            {field?.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </CFormSelect>
        )
      default:
        return null
    }
  }

  return (
    <>
      <CRow className="mt-4">
        <CCol md={12}>
          <CForm className="g-3 needs-validation mb-3 mb-4 coo-form ">
            {additionalFields &&
              additionalFields.filter((item) => item.role === 'FE').length > 0 && (
                <>
                  <hr />
                  <CRow className="p-2">
                    <CCol>
                      <h5 className="mt-3">Additional Fields</h5>

                      <CRow className="mt-4">
                        {additionalFields &&
                          additionalFields
                            .filter((item) => item.role === 'FE')
                            .map((field, index) => (
                              <CCol md={3} key={index}>
                                <div className="mb-3">
                                  <CFormLabel>{field.key}</CFormLabel>
                                  {renderField(field)}
                                </div>
                              </CCol>
                            ))}
                      </CRow>
                    </CCol>
                  </CRow>
                  <hr />
                </>
              )}
          </CForm>
        </CCol>
      </CRow>
    </>
  )
}

export default AdditionalFieldsForm
