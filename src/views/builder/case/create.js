import React, { useState, useRef, useCallback } from 'react'
import Draggable from 'react-draggable'
import {
  CButton,
  CCol,
  CForm,
  CFormInput,
  CRow,
  CCard,
  CCardHeader,
  CCardBody,
  CContainer,
} from '@coreui/react'
import AsyncSelect from 'react-select/async'

import PdfPreview from 'src/components/PdfPreview'

const CreateCase = () => {
  const [formdata, setformdata] = useState({
    name: '',
    ra_branch: '',
  })
  const [numPages, setNumPages] = useState(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [boxes, setBoxes] = useState({
    // 1: { top: 0, left: 0, title: 'Applicant Name' },
    // 2: { top: 3, left: 0, title: 'RA Branch' },
    // 3: { top: 6, left: 0, title: 'Test' },
  })

  const pdfContainerRef = useRef(null)

  const [defaultOptions, setDefaultOptions] = useState([
    { label: 'Applicant Name', value: 'Applicant_name' },
    { label: 'RA Branch', value: 'ra_branch' },
  ])

  const handleDrag = (e, data, id) => {
    // setBoxes((prevBoxes) => ({
    //   ...prevBoxes,
    //   [id]: {
    //     ...prevBoxes[id],
    //     left: data.x,
    //     top: data.y,
    //   },
    // }));
  }

  const handleStop = (e, data, id) => {
    setBoxes((prevBoxes) => ({
      ...prevBoxes,
      [id]: {
        ...prevBoxes[id],
        left: data.x,
        top: data.y,
      },
    }))
  }

  const handleInputChange = (event) => {
    setformdata((prevFormData) => ({
      ...prevFormData,
      [event.target.name]: event.target.value,
    }))
  }

  const getSelectedOption = () => {
    if (formdata.customer_id) {
      // Find the option corresponding to the customer_id in initialValues
      return defaultOptions.find((option) => option.value === formdata.customer_id)
    }
    return null // If customer_id is not set, return null
  }

  const handleAsyncSelectChange = (selectedOptions) => {
    if (selectedOptions && selectedOptions.length > 0) {
      selectedOptions.forEach((option) => {
        const newKey = Object.keys(boxes).length + 1 // Generate new key
        setBoxes((prevBoxes) => ({
          ...prevBoxes,
          [newKey]: {
            top: 0,
            left: 0,
            title: option.label,
          },
        }))
      })
    }
  }

  const styles = {
    width: '100%',
    height: 800,
    border: '1px solid black',
    position: 'relative',
    overflow: 'auto',
    zIndex: '999',
  }
  // console.log(boxes)
  return (
    <CContainer fluid>
      <CForm className="g-3 needs-validation" noValidate>
        <CCard className="mt-4 mb-4">
          <CCardBody>
            <CRow>
              <CCol md={5}>
                <label style={{ fontSize: '12px' }}>Enter Name</label>
                <CFormInput
                  type="text"
                  name="name"
                  onChange={handleInputChange}
                  value={formdata.name}
                  feedbackValid="Looks good!"
                  id="validationCustom01"
                  placeholder="Enter Name*"
                  required
                />
              </CCol>
              <CCol md={7}>
                <label style={{ fontSize: '12px' }}>Select Bank</label>
                <AsyncSelect
                  placeholder="Select Bank"
                  loadOptions={(inputValue, callback) => loadOptions(inputValue, callback)}
                  defaultOptions={defaultOptions}
                  isMulti={true}
                  isSearchable
                  getOptionLabel={(option) => option.label}
                  getOptionValue={(option) => option.value}
                  onChange={(selectedOption) => handleAsyncSelectChange(selectedOption)}
                // value={getSelectedOption()}
                />
              </CCol>

            </CRow>
            <CRow className="mb-4">
              <CCol md={11}>
                <label style={{ fontSize: '12px' }}>Select Fields</label>
                <AsyncSelect
                  placeholder="Select Fields"
                  loadOptions={(inputValue, callback) => loadOptions(inputValue, callback)}
                  defaultOptions={defaultOptions}
                  isMulti={true}
                  isSearchable
                  getOptionLabel={(option) => option.label}
                  getOptionValue={(option) => option.value}
                  onChange={(selectedOption) => handleAsyncSelectChange(selectedOption)}
                // value={getSelectedOption()}
                />
              </CCol>
              <CCol md={1} className="text-end ps-0 text-center pt-3">
                <CButton onClick="" color="warning" className="text-white ">
                  Submit
                </CButton>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>

        <CRow>
          <CCol md={12}>
            <CCard>
              <CCardHeader>
                <div className="d-flex justify-content-between">
                  <div className="d-flex align-items-center">Report Builder</div>
                  <p className="m-0">
                    {numPages > 0 && (
                      <div className='text-center '>
                        <button className='btn btn-secondary me-2' onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}>Prev</button>
                        <span>
                          {pageNumber} / {numPages}
                        </span>
                        <button className="btn btn-secondary ms-2" onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}>Next</button>
                      </div>
                    )}
                  </p>
                </div>
              </CCardHeader>
              <CCardBody>

                <CRow>
                  <CCol md={3} style={{ overflow: 'hidden', clear: 'both' }}></CCol>
                  <CCol md={12}>
                    <div ref={pdfContainerRef} style={styles}>
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          zIndex: '999',
                        }}
                      >
                        {Object.keys(boxes).map((key) => {
                          const { left, top, title } = boxes[key]
                          return (
                            <Draggable
                              key={key}
                              position={{ x: left, y: top }}
                              onDrag={(e, data) => handleDrag(e, data, key)}
                              onStop={(e, data) => handleStop(e, data, key)}
                            >
                              <div
                                style={{
                                  border: '1px dashed #fff',
                                  padding: 5,
                                  backgroundColor: '#0a1857',
                                  fontSize: '13px',
                                  color: '#fff',
                                  width: '12%',
                                  zIndex: '999',
                                }}
                              >
                                {title}
                              </div>
                            </Draggable>
                          )
                        })}
                      </div>

                      <PdfPreview  numPages = {numPages} pageNumber={pageNumber} setNumPages={setNumPages}/>
                    </div>
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CForm>
    </CContainer>
  )
}

export default CreateCase
