import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import {
  cilChevronBottom,
  cilChevronCircleDownAlt,
  cilChevronCircleUpAlt,
  cilMinus,
  cilPencil,
  cilPlus,
  cilSpreadsheet,
  cilTrash,
  cilX,
} from '@coreui/icons'
import SubHeader from 'src/components/custom/SubHeader'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CInputGroup,
  CNav,
  CNavItem,
  CNavLink,
  CRow,
  CTabPane,
} from '@coreui/react'


import AppFormSelect from 'src/components/form/AppFormSelect'
import handleSubmitHelper from 'src/helpers/submitHelper'
import BasicProvider from 'src/constants/BasicProvider'
import { useEffectFormData } from 'src/helpers/formHelpers'
import { setAlertTimeout } from 'src/helpers/alertHelper'
import ImagePreview from 'src/components/custom/ImagePreview'
import { ImageHelper } from 'src/helpers/imageHelper'
import axios from 'axios'
import Draggable from 'react-draggable'
import PdfPreview from 'src/components/PdfPreview'
import AsyncSelect from 'react-select/async'
import SingleSubHeader from 'src/components/custom/SingleSubHeader'
import CIcon from '@coreui/icons-react'

import { data } from './data'

const commonJson = data[0].fields

const validationRules = {}

const Details = () => {
  const params = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const id = params.id
  const isEditMode = !!id

  const [upperFieldsVisible, setUpperFieldsVisible] = useState(true)
  const [formFields, setFormFields] = useState(commonJson.filter((item) => item.role == 'DM'))
  const [additionalFields, setAdditionalFields] = useState([])

  // useEffect(() => {
  //   setFormFields(commonJson.filter((item) => item.role === 'DM'))
  // }, [])

  const handleRemoveField = (indexToRemove) => {
    setFormFields((prevFields) => prevFields.filter((_, index) => index !== indexToRemove))
  }

  const handleChange = (index, key, value) => {
    setFormFields((prevFields) =>
      prevFields.map((field, i) => (i === index ? { ...field, [key]: value } : field)),
    )
  }

  const handleFieldChange = (index, key, value) => {
    const updatedFields = [...additionalFields]
    updatedFields[index] = { ...updatedFields[index], [key]: value }
    setAdditionalFields(updatedFields)
  }

  const handlenewRemoveField = (indexToRemove) => {
    setAdditionalFields((prevFields) => prevFields.filter((_, index) => index !== indexToRemove))
  }

  // const handleAddField = () => {
  //   setAdditionalFields((prevFields) => [...prevFields, {}])
  //   setUpperFieldsVisible(false)
  // }
  const handleAddField = () => {
    const newIndex = additionalFields.length + 1
    const newField = {
      field_index: Number(newIndex),
    }
    setAdditionalFields((prevFields) => [...prevFields, newField])
    setUpperFieldsVisible(false)
  }

  const handleExpandUpperFields = () => {
    setUpperFieldsVisible(!upperFieldsVisible)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    let dmFields = additionalFields.filter((item) => item.role == 'DM')

    let initialValues = {
      additionalFields,
      dm_keys: dmFields,
    }
    
    try {
      const data = await handleSubmitHelper(initialValues, validationRules, dispatch)
      if (data === false) return

      var response
      if (isEditMode) {
        response = await new BasicProvider(`banks/update/${id}`, dispatch).patchRequest(data)
      }
      setAlertTimeout(dispatch)
    } catch (error) {
      dispatch({ type: 'set', validations: [error.data] })
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      let response = await new BasicProvider(`banks/show/${id}`, dispatch).getRequest()
      if (response.data.dm_keys) {
        setFormFields(response.data.dm_keys)
      }
      if (response.data.additional_keys) {
        setAdditionalFields(response.data.additional_keys)
      }
    } catch (error) { }
  }

  return (
    <>
      <SingleSubHeader moduleName="Bank Detail" />
      <CContainer fluid>
        <CForm className="" onSubmit={handleSubmit}>
          <CCard>
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <div>Fields details</div>
              <div>
                <CButton
                  className="btn btn-secondary me-2 submit_btn"
                  name="buttonClicked"
                  onClick={handleAddField}
                >
                  <CIcon icon={cilPlus} /> Add Field
                </CButton>
                {!upperFieldsVisible && (
                  <button
                    className="btn btn-warning submit_btn me-2 "
                    onClick={handleExpandUpperFields}
                  >
                    {' '}
                    <CIcon className="me-1" icon={cilChevronCircleDownAlt} /> Expand Upper Fields
                  </button>
                )}
                {upperFieldsVisible && (
                  <button
                    className="btn btn-warning submit_btn me-2 "
                    onClick={handleExpandUpperFields}
                  >
                    {' '}
                    <CIcon className="me-1" icon={cilChevronCircleUpAlt} /> Hide Upper Fields
                  </button>
                )}
                {/* <button className="btn btn-secondary me-2 " onClick={handleExpandUpperFields}>{upperFieldsVisible ? "Hide Upper Fields" : "Expand Upper Fields"}</button> */}
              </div>
            </CCardHeader>

            <CCardBody>
              {/* {upperFieldsVisible && (
                <>
                  {formFields.map((field, index) => (
                    <>
                      {field.role === 'DM' && (
                        <CRow
                          className="form-input-block mt-2 fields_row d-flex align-items-center"
                          key={index}
                        >
                          <CCol md={4}>
                            <div className="mb-3">
                              <CFormLabel>Field Name</CFormLabel>
                              <CFormInput
                                placeholder="Enter"
                                value={field.key}
                                onChange={(e) => handleChange(index, 'key', e.target.value)}
                              />
                            </div>
                          </CCol>
                          <CCol md={4}>
                            <div className="mb-3">
                              <CFormLabel>Field Type</CFormLabel>

                              <AppFormSelect
                                value={field.type}
                                onChange={(e) => handleChange(index, 'type', e.target.value)}
                              >
                                <option value="text">Text</option>
                                <option value="select">Select</option>
                              </AppFormSelect>
                            </div>
                          </CCol>

                          {field.type === 'select' && (
                            <CCol md={3} className="">
                              <>
                                <CFormLabel>Options (Each option per line)</CFormLabel>
                                <div className="field_options">
                                  <>
                                    <CFormTextarea
                                      value={field.options && field.options.join('\n')}
                                      onChange={(e) =>
                                        handleChange(index, 'options', e.target.value.split('\n'))
                                      }
                                    />
                                  </>
                                </div>
                              </>
                            </CCol>
                          )}

                          <CCol md={1}>
                            <div className="text-end mt-2">
                              <CIcon
                                className="delet_faq"
                                icon={cilX}
                                onClick={() => handleRemoveField(index)}
                              />
                            </div>
                          </CCol>
                        </CRow>
                      )}
                    </>
                  ))}
                </>
              )} */}


              {additionalFields.length > 0 && (
                <div>
                  <h5 className="mt-3">Additional Fields</h5>
                  {additionalFields.map((field, index) => (
                    <CRow
                      className="form-input-block mt-2 fields_row d-flex align-items-center"
                      key={index}
                    >
                      <CCol md={1}>
                        <div className="mb-3">
                          <CFormLabel>Field No.</CFormLabel>
                          <CFormInput
                            placeholder="Enter"
                            value={field.field_index || ''}
                            onChange={(e) => {
                              const newValue = e.target.value.replace(/\D/, '')
                              handleFieldChange(index, 'field_index', newValue)
                            }}
                          />
                        </div>
                      </CCol>
                      <CCol md={1}>
                        <div className="mb-3">
                          <CFormLabel>Col Size</CFormLabel>
                          <CFormInput
                            placeholder="Enter"
                            value={field.col_size || ''}
                            onChange={(e) => {
                              const newValue = e.target.value.replace(/\D/, '')
                              handleFieldChange(index, 'col_size', newValue)
                            }}
                          />
                        </div>
                      </CCol>
                      <CCol md={2}>
                        <div className="mb-3">
                          <CFormLabel>Field Name</CFormLabel>
                          <CFormInput
                            placeholder="Enter"
                            value={field.key || ''}
                            onChange={(e) => handleFieldChange(index, 'key', e.target.value)}
                          />
                        </div>
                      </CCol>
                      <CCol md={2}>
                        <div className="mb-3">
                          <CFormLabel>Field Type</CFormLabel>
                          <AppFormSelect
                            value={field.type}
                            onChange={(e) => handleFieldChange(index, 'type', e.target.value)}
                          >
                            <option value="">Select Type</option>
                            <option value="text">Text</option>
                            <option value="select">Select</option>
                          </AppFormSelect>
                        </div>
                      </CCol>
                      <CCol md={2}>
                        <div className="mb-3">
                          <CFormLabel>Select Role</CFormLabel>
                          <AppFormSelect
                            value={field.role}
                            onChange={(e) => handleFieldChange(index, 'role', e.target.value)}
                          >
                            <option value="">Select Role</option>
                            <option value="COO">COO</option>
                            <option value="FE">FE</option>
                            <option value="DM">DM</option>
                          </AppFormSelect>
                        </div>
                      </CCol>
                      {field.type === 'select' && (
                        <CCol md={3} className="">
                          <>
                            <CFormLabel>Options (Each option per line)</CFormLabel>
                            <div className="field_options">
                              <>
                                <CFormTextarea
                                  value={field.options && field.options.join('\n')}
                                  onChange={(e) =>
                                    handleFieldChange(index, 'options', e.target.value.split('\n'))
                                  }
                                />
                              </>
                            </div>
                          </>
                        </CCol>
                      )}
                      <CCol md={1}>
                        <div className="text-end mt-2">
                          <CIcon
                            className="delet_faq"
                            icon={cilX}
                            onClick={() => handlenewRemoveField(index)}
                          />
                        </div>
                      </CCol>
                    </CRow>
                  ))}
                </div>
              )}
            </CCardBody>
          </CCard>
          <CCard className="mt-3">
            <CRow>
              <CCol md={12}>
                <CCardBody className="text-center">
                  <CButton
                    className="btn btn-primary me-2  submit_btn"
                    type="submit"
                    name="buttonClicked"
                    value="submit"
                  >
                    Submit
                  </CButton>
                  <CButton
                    onClick={() => navigate('/bank/all')}
                    color="danger"
                    className="text-light"
                  >
                    Cancel
                  </CButton>
                </CCardBody>
              </CCol>
            </CRow>
          </CCard>
        </CForm>
      </CContainer>
    </>
  )
}

export default Details
