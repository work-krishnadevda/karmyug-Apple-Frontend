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
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import handleSubmitHelper from 'src/helpers/submitHelper'
import { setAlertTimeout } from 'src/helpers/alertHelper'
import BasicProvider from 'src/constants/BasicProvider'

const validationRules = {}

const AdditionalFieldsFormSDM = ({
  initialValues,
  setInitialValues,
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
  const dispatch = useDispatch()

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

  const handleSave = async (e) => {
    e.preventDefault()

    initialValues.additional_fields = additionalJson
    // console.log('ENTERERE',initialValues.additional_fields)

    try {
      const data = await handleSubmitHelper(initialValues, validationRules, dispatch)
      if (data === false) return

      let response = await new BasicProvider(`cases/update/${id}`, dispatch).patchRequest(data)

      setAlertTimeout(dispatch)
      navigate(`/case/${id}/update/show-additional-fields/by/${loggedinUserRole.name}`, {
        state: { additionalFieldsFormVisible: false },
      })
    } catch (error) {
      console.log(error)
      // dispatch({ type: 'set', catcherror: error.data })
      dispatch({ type: 'set', validations: [error.data] })
    }
  }

  return (
    <>
      <CCard className="mt-3">
        <CCardHeader>Additional Fields</CCardHeader>
        <CCardBody>
          <CRow className="mt-4">
            <CCol md={12}>
              <CForm className="g-3 needs-validation mb-3 mb-4 coo-form" onSubmit={handleSave}>
                {additionalFields &&
                  additionalFields.filter((item) => item.role === 'FE').length > 0 && (
                    <>
                      <CRow className="">
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
                    </>
                  )}


                <div className="text-center mt-4">
                  <CButton type="submit" className="btn-warning btn me-2 mx-3 w-lg-17 w-sm-auto">
                    Save
                  </CButton>
                  <CButton
                    onClick={() =>
                      navigate(
                        `/case/${id}/update/show-additional-fields/by/${loggedinUserRole.name}`,
                        {
                          state: { additionalFieldsFormVisible: false },
                        },
                      )
                    }
                    className="btn-danger btn me-2 mx-3 w-lg-17 w-sm-auto text-white"
                  >
                    Cancle
                  </CButton>
                </div>
              </CForm>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
    </>
  )
}

export default AdditionalFieldsFormSDM
