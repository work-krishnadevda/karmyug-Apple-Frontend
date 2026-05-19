import React, { useEffect, useState } from 'react'
import {
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CFormInput,
  CFormLabel,
  CCol,
  CRow,
  CFormText,
  } from '@coreui/react'

import AppFormSelect from 'src/components/form/AppFormSelect'
import AsyncSelect from 'react-select/async'
import BasicProvider from 'src/constants/BasicProvider'
import { useDispatch, useSelector } from 'react-redux'
import { customSuccessMSG, setAlertTimeout } from 'src/helpers/alertHelper'

const MapData = (props) => {
  const {
    visible,
    close,
    caseId,
    Fetchedmapdata,
    // fetchSHowCaseData,
    setInitialValues,
    setShowCaseData,
  } = props
  const dispatch = useDispatch()
  const [casedata, setCaseData] = useState({})
  const [validationError, setValidationError] = useState('')
  let loggedinUserRole = useSelector((state) => state?.userRole)
  const [showPropertyType, setShowPropertyType] = useState(false)
  const [defaultOptionsRaBranch, setDefaultOptionsRaBranch] = useState([])

  const loadOptionsRaBranch = async (inputValue, callback) => {
    try {
      const response = await new BasicProvider(
        `ra_branch/search?search=${inputValue}&count=20`,
      ).getRequest()
      const options = response.data.data.map((branch) => ({
        label: branch.name,
        value: branch._id,
      }))
      callback(options)
    } catch (error) {
      console.error(error)
    }
  }

  const handleMapChange = (e) => {
    const { name, value } = e.target
    const sanitizedValue = value.replace(/\s+/g, '').replace(/[^0-9.]/g, '')
    setCaseData((prevState) => ({
      ...prevState,
      map_data: {
        ...prevState.map_data,
        [name]: sanitizedValue,
      },
    }))
    setValidationError('')
  }

  const handleOnChange = (e) => {
    const { name, value } = e.target

    if (name === 'current_use_property' && value !== 'other') {
      setCaseData((prevState) => ({
        ...prevState,
        current_use_property_other: '',
      }))
    }

    setCaseData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
    setValidationError('')
  }

  useEffect(() => {
    setCaseData(Fetchedmapdata)
  }, [visible, caseId])

  useEffect(() => {
    dispatch({ type: 'set', validations: [] })
    return () => {
      dispatch({ type: 'set', validations: [] })
    }
  }, [])

  useEffect(() => {
    const fetchDefaultOptionsRaBranch = async () => {
      try {
        const response = await new BasicProvider('ra_branch?count=100').getRequest()
        const options = response.data.data.map((branch) => ({
          label: branch.name,
          value: branch._id,
        }))
        setDefaultOptionsRaBranch(options)
      } catch (error) {
        console.error(error)
      }
    }

    fetchDefaultOptionsRaBranch()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const validationMap = {
        land_area: 'Land Area is required.',
        landarea_rate: 'Land Area Rate is required.',
        builtup_area: 'Built-up Area is required.',
        builtup_rate: 'Built-up Rate is required.',
        flat_area: 'Flat Area is required.',
        flate_rate: 'Flat Rate is required.',
        los_number: 'Los is required',
        case_of_branch: 'Case Of Branch is required.',
        product_name: 'Product Name is required.',
        current_use_property: 'Current Use of Property is required.',
        case_type: 'Case Type is required.',
        ogl: 'OGL is required.',
        km: 'KM is required.',
      }

      if (casedata.case_type === 'Case Type') {
        return
      }
      if (casedata.current_use_property === 'Select current use of property') {
        setValidationError('Please select a valid Current Use of Property.')
        return
      }
      if (casedata.ogl === 'Select ogl') {
        setValidationError('Please select a valid OGL.')
        return
      }

      const validations = Object.entries(validationMap)
        .filter(([key]) => !casedata[key] && !casedata.map_data?.[key])
        .map(([, message]) => message)

      if (validations.length > 0) {
        dispatch({ type: 'set', validations })
        return
      }

      const filteredData = {}

      const formFields = [
        'land_area',
        'landarea_rate',
        'builtup_area',
        'builtup_rate',
        'flat_area',
        'flate_rate',
        'case_of_branch',
        'los_number',
        'product_name',
        'current_use_property',
        'case_type',
        'ogl',
        'km',
        'case_rating',
        'case_review',
        'current_use_property_other',
      ]

      formFields.forEach((field) => {
        if (casedata[field] || casedata.map_data?.[field]) {
          if (!filteredData.map_data) {
            filteredData.map_data = {}
          }
          if (casedata.map_data?.[field]) {
            filteredData.map_data[field] = casedata.map_data[field]
          } else {
            filteredData[field] = casedata[field]
          }
        }
      })

      // ra_branch is populated as an object in case details, but API expects only id.
      const stateUpdate = { ...filteredData }
      if (casedata?.ra_branch) {
        filteredData.ra_branch = casedata.ra_branch?._id || casedata.ra_branch
        stateUpdate.ra_branch = casedata.ra_branch
      }

      const response = await new BasicProvider(`cases/update/${caseId}`, dispatch).patchRequest(filteredData)
      // console.log('-=-=-=-===-filteredData-=-=-==-=', filteredData)

      setInitialValues((prev) => ({ ...prev, ...stateUpdate }))
      setShowCaseData((prev) => ({ ...prev, ...stateUpdate }))

      if (response) {
        close()
        dispatch({ type: 'set', validations: [] })
        customSuccessMSG(dispatch, 'Lat Long Tagged!')
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <CModal
        alignment="center"
        visible={visible}
        onClose={close}
        className="delete_item_box modal-lg "
      >
        <form onSubmit={handleSubmit}>
          <CModalHeader className="pb-0">
            <CModalTitle id="StaticBackdropExampleLabel">
              {/* Add Map Data */}
              FE lat/long
              <p className="text-danger " style={{ fontSize: 'large', fontWeight: 'bold' }}>
                {Fetchedmapdata?.latitude_by_fe ?? Fetchedmapdata?.longitude_by_fe ? (
                  `${Fetchedmapdata?.latitude_by_fe ?? ' - '}/${
                    Fetchedmapdata?.longitude_by_fe ?? ' - '
                  }`
                ) : (
                  <span style={{ color: 'red', fontSize: 'large', fontWeight: 'bold' }}>
                    Not available
                  </span>
                )}
              </p>
            </CModalTitle>
          </CModalHeader>

          <CModalBody>
            <CRow className="mt-4">
              <h6>Area (in sqft)</h6>
              <CCol md={3}>
                <CFormLabel>
                  Land Area <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="land_area"
                  autoComplete="off"
                  value={casedata.map_data?.land_area || ''}
                  onChange={handleMapChange}
                />
              </CCol>
              <CCol md={3}>
                <CFormLabel>
                  Land Rate <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="landarea_rate"
                  autoComplete="off"
                  value={casedata.map_data?.landarea_rate || ''}
                  onChange={handleMapChange}
                />
              </CCol>
              <CCol md={3}>
                <CFormLabel>
                  Builtup Area <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="builtup_area"
                  autoComplete="off"
                  value={casedata.map_data?.builtup_area || ''}
                  onChange={handleMapChange}
                />
              </CCol>
              <CCol md={3}>
                <CFormLabel>
                  Builtup Rate <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="builtup_rate"
                  autoComplete="off"
                  value={casedata.map_data?.builtup_rate || ''}
                  onChange={handleMapChange}
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol md={6}>
                <CFormLabel>
                  Flat/Unit <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="flat_area"
                  autoComplete="off"
                  value={casedata.map_data?.flat_area || ''}
                  onChange={handleMapChange}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>
                  Rate <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="flate_rate"
                  autoComplete="off"
                  value={casedata.map_data?.flate_rate || ''}
                  onChange={handleMapChange}
                />
              </CCol>
            </CRow>
            {validationError && (
              <CFormText color="danger">
                <small style={{ color: 'red' }}>{validationError}</small>
              </CFormText>
            )}
            <CRow>
              <CCol md={3}>
                <CFormLabel>
                  Ra branch <span className="text-danger">*</span>
                </CFormLabel>
                <AsyncSelect
                  name="ra_branch"
                  loadOptions={(inputValue, callback) => loadOptionsRaBranch(inputValue, callback)}
                  defaultOptions={defaultOptionsRaBranch}
                  value={
                    defaultOptionsRaBranch.find(
                      (option) =>
                        option.value ===
                        (casedata?.ra_branch?._id || casedata?.ra_branch || ''),
                    ) || null
                  }
                  getOptionLabel={(option) => option.label}
                  getOptionValue={(option) => option.value}
                  onChange={(selected) => {
                    if (!selected) {
                      setCaseData((prevState) => ({
                        ...prevState,
                        ra_branch: '',
                      }))
                      return
                    }
                    setCaseData((prevState) => ({
                      ...prevState,
                      ra_branch: {
                        _id: selected.value,
                        name: selected.label,
                      },
                    }))
                    setValidationError('')
                  }}
                />
              </CCol>
              <CCol md={3}>
                <CFormLabel>
                  Case Of Branch <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="case_of_branch"
                  autoComplete="off"
                  value={casedata?.case_of_branch || ''}
                  onChange={handleOnChange}
                />
              </CCol>
              <CCol md={3}>
                <CFormLabel>
                  Product Name <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="product_name"
                  autoComplete="off"
                  value={casedata?.product_name || ''}
                  onChange={handleOnChange}
                />
              </CCol>
              <CCol md={3}>
                <div className="mb-3">
                  <CFormLabel>
                    Case Type<span className="text-danger">*</span>
                  </CFormLabel>
                  <AppFormSelect
                    aria-label="Case Type"
                    name="case_type"
                    value={casedata?.case_type || 'Case Type'}
                    className="form-control"
                    onChange={handleOnChange}
                  >
                    <option value="Case Type" disabled>
                      Case Type
                    </option>
                    <option value="fresh">Fresh</option>
                    <option value="subsequent">Subsequent</option>
                  </AppFormSelect>
                </div>
              </CCol>
            </CRow>
            <CRow>
              <CCol md={4}>
                <div className="py-2">
                  <CFormLabel>
                    Type of Propery<span className="text-danger ">*</span>
                  </CFormLabel>
                  <AppFormSelect
                    custom
                    name="current_use_property"
                    value={casedata.current_use_property || 'Select current use of property'}
                    onChange={handleOnChange}
                  >
                    <option value="Select current use of property">
                      Select current use of property
                    </option>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="industrial">Industrial</option>
                    <option value="mixed">Mixed</option>
                    <option value="plot/open land">Plot/Open Land</option>
                    <option value="under construction">Under Construction</option>
                    <option value="other">Other</option>
                  </AppFormSelect>
                </div>
              </CCol>
              {casedata?.current_use_property === 'other' && (
                <CCol md={4}>
                  <div className="py-2">
                    <CFormLabel>
                      Other Property Type<span className="text-danger ">*</span>
                    </CFormLabel>
                    <CFormInput
                      type="text"
                      name="current_use_property_other"
                      autoComplete="off"
                      value={casedata?.current_use_property_other || ''}
                      onChange={handleOnChange}
                    />
                  </div>
                </CCol>
              )}
              <CCol md={4}>
                <div className="py-2">
                  <CFormLabel>
                    LOS Number<span className="text-danger ">*</span>
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    name="los_number"
                    autoComplete="off"
                    value={casedata?.los_number || ''}
                    onChange={handleOnChange}
                  />
                </div>
              </CCol>
              <CCol md={4}>
                <div className="py-2">
                  <CFormLabel>
                    OGL<span className="text-danger ">*</span>
                  </CFormLabel>
                  <AppFormSelect
                    custom
                    name="ogl"
                    value={casedata.ogl || 'Select ogl'}
                    onChange={handleOnChange}
                  >
                    <option value="Select ogl">Select ogl</option>
                    <option value="outer">Outer</option>
                    <option value="local">Local</option>
                  </AppFormSelect>
                </div>
              </CCol>
              <CCol md={4}>
                <div className="py-2">
                  <CFormLabel>
                    KM <span className="text-danger">*</span>
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    name="km"
                    autoComplete="off"
                    value={casedata?.km || ''}
                    onChange={handleOnChange}
                  />
                </div>
              </CCol>

              <CCol md={4}>
                <div className="py-2">
                  <CFormLabel>
                    Disbursed Status<span className="text-danger ">*</span>
                  </CFormLabel>
                  <AppFormSelect
                    custom
                    name="case_review"
                    value={casedata?.case_review || 'Select case_reivew'}
                    onChange={handleOnChange}
                  >
                    <option value="none">None</option>
                    <option value="negative">Negative</option>
                    <option value="positive">Positive</option>
                  </AppFormSelect>
                </div>
              </CCol>

              <CCol md={4}>
                <div className="py-2">
                  <CFormLabel>
                    Draft Quality Rating<span className="text-danger ">*</span>
                  </CFormLabel>
                  <AppFormSelect
                    custom
                    name="case_rating"
                    value={casedata?.case_rating || 'Select rating'}
                    onChange={handleOnChange}
                    disabled={loggedinUserRole.name === process.env.REACT_APP_DM}
                  >
                    <option value="">N/A</option>
                    <option value="A+ Grade">A+ Grade</option>
                    <option value="A Grade">A Grade</option>
                    <option value="B Grade">B Grade</option>
                    <option value="C Grade">C Grade</option>
                    <option value="D Grade">D Grade</option>
                    <option value="waste">Waste</option>
                  </AppFormSelect>
                </div>
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" className="text-white model_btn close_btn" type="submit">
              Submit
            </CButton>
            <CButton color="danger" className="text-white" onClick={close}>
              Close
            </CButton>
          </CModalFooter>
        </form>
      </CModal>
    </>
  )
}

export default MapData
