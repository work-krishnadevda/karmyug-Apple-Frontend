import {
  CButton,
  CCol,
  CForm,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CInputGroup,
  CRow,
} from '@coreui/react'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import Select from 'react-select'
import BasicProvider from 'src/constants/BasicProvider'
import { customSuccessMSG, setAlertTimeout } from 'src/helpers/alertHelper'
import { useEffectFormData } from 'src/helpers/formHelpers'
import handleSubmitHelper from 'src/helpers/submitHelper'

const validationRules = {
  // person_meet_at_site_name: {
  //   required: true,
  // },
}

const RateAndLatLong = ({
  currentStep,
  setCurrentStep,
  initialValues,
  setInitialValues,
  totalSteps,
  handlePreviousStep,
  handleNextStep,
}) => {
  let loggedinUserRole = useSelector((state) => state?.userRole)

  const [isCancle, setIsCancle] = useState(false)
  const [isPrevNextButton, setIsPrevNextButton] = useState(true)

  useEffect(() => {
    if (loggedinUserRole?.name == process.env.REACT_APP_SDM) setIsCancle(true)
    if (loggedinUserRole?.name == process.env.REACT_APP_DM) setIsCancle(true)

    if (loggedinUserRole?.name == process.env.REACT_APP_DM) setIsPrevNextButton(false)
  }, [loggedinUserRole])

  var params = useParams()
  const id = params.id
  const navigate = useNavigate()
  var dispatch = useDispatch()
  const isEditMode = !!id

  const [errors, setErrors] = useState({})

  const handleOnChange = (e) => {
    const { name, value } = e.target
    let newValue = value
    setInitialValues({
      ...initialValues,
      [name]: value,
    })
  }

  const handleOnChangeLatLng = (e) => {
    const { name, value } = e.target
    setInitialValues({ ...initialValues, [name]: value })
    validateField(name, value)
  }

  const validateField = (field, value) => {
    let error = ''
    if (field === 'latitude_by_fe') {
      if (!value) {
        error = 'Latitude is required.'
      } else if (!/^[-+]?\d{1,2}\.\d+$/.test(value)) {
        error = 'Invalid latitude format. Use a number between -90 and 90.'
      } else if (parseFloat(value) < -90 || parseFloat(value) > 90) {
        error = 'Latitude must be between -90 and 90.'
      }
    } else if (field === 'longitude_by_fe') {
      if (!value) {
        error = 'Longitude is required.'
      } else if (!/^[-+]?\d{1,3}\.\d+$/.test(value)) {
        error = 'Invalid longitude format. Use a number between -180 and 180.'
      } else if (parseFloat(value) < -180 || parseFloat(value) > 180) {
        error = 'Longitude must be between -180 and 180.'
      }
    }
    setErrors({ ...errors, [field]: error })
  }

  const handleContactNumberChange = (value, contactNumberField) => {
    const sanitizedValue = value.replace(/\D/g, '')
    setInitialValues({ ...initialValues, [contactNumberField]: sanitizedValue })
  }

  // const handleSubmit = async (e) => {
  //   // e.preventDefault()

  //   // Validate Latitude
  //   let errors = []

  //   if (initialValues.latitude_by_fe.trim() === '') {
  //     errors.push('Latitude is required!!')
  //   } else if (!.test(initialValues.latitude_by_fe)) {
  //     errors.push('Invalid latitude format. Use a number between -90 and 90.')
  //   } else if (
  //     parseFloat(initialValues.latitude_by_fe) < -90 ||
  //     parseFloat(initialValues.latitude_by_fe) > 90
  //   ) {
  //     errors.push('Latitude must be between -90 and 90.')
  //   }

  //   // Validate Longitude
  //   if (initialValues.longitude_by_fe.trim() === '') {
  //     errors.push('Longitude is required!!')
  //   } else if (!/^[-+]?\d{1,3}(\.\d+)?$/.test(initialValues.longitude_by_fe)) {
  //     errors.push('Invalid longitude format. Use a number between -180 and 180.')
  //   } else if (
  //     parseFloat(initialValues.longitude_by_fe) < -180 ||
  //     parseFloat(initialValues.longitude_by_fe) > 180
  //   ) {
  //     errors.push('Longitude must be between -180 and 180.')
  //   }

  //   // Dispatch errors if any
  //   if (errors.length > 0) {
  //     dispatch({ type: 'set', validations: errors })
  //     return false // Exit if there are validation errors
  //   }

  //   try {
  //     const data = await handleSubmitHelper(initialValues, validationRules, dispatch)
  //     if (data === false) return

  //     let response = await new BasicProvider(`cases/update/${id}`, dispatch).patchRequest(data)
  //     customSuccessMSG(dispatch, 'Updated Successfully')
  //     return true
  //   } catch (error) {
  //     console.log(error)
  //     // dispatch({ type: 'set', catcherror: error.data })
  //     dispatch({ type: 'set', validations: [error.data] })
  //     return false
  //   }
  // }

  const handleSubmit = async (e) => {
    // e.preventDefault()

    let errors = []

    if (initialValues.latitude_by_fe.trim() === '') {
      errors.push('Latitude is required!!')
    } else if (!/^[-+]?\d{1,2}\.\d+$/.test(initialValues.latitude_by_fe)) {
      errors.push(
        'Invalid latitude format. Use a number between -90 and 90, and if there is a decimal, ensure there are digits after it.',
      )
    } else if (
      parseFloat(initialValues.latitude_by_fe) < -90 ||
      parseFloat(initialValues.latitude_by_fe) > 90
    ) {
      errors.push('Latitude must be between -90 and 90.')
    }

    // Validate Longitude
    if (initialValues.longitude_by_fe.trim() === '') {
      errors.push('Longitude is required!!')
    } else if (!/^[-+]?\d{1,3}\.\d+$/.test(initialValues.longitude_by_fe)) {
      errors.push(
        'Invalid longitude format. Use a number between -180 and 180, with at least two digits after the decimal point if a decimal is present.',
      )
    } else if (
      parseFloat(initialValues.longitude_by_fe) < -180 ||
      parseFloat(initialValues.longitude_by_fe) > 180
    ) {
      errors.push('Longitude must be between -180 and 180.')
    }

    // Dispatch errors if any
    if (errors.length > 0) {
      dispatch({ type: 'set', validations: errors })
      return false // Exit if there are validation errors
    }

    try {
      const data = await handleSubmitHelper(initialValues, validationRules, dispatch)
      if (data === false) return

      let response = await new BasicProvider(`cases/update/${id}`, dispatch).patchRequest(data)
      customSuccessMSG(dispatch, 'Updated Successfully')
      return true
    } catch (error) {
      console.log(error)
      dispatch({ type: 'set', validations: [error.data] })
      return false
    }
  }

  const GetCoordinates = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setInitialValues((prev) => ({
            ...prev,
            latitude_by_fe: position.coords.latitude,
            longitude_by_fe: position.coords.longitude,
          }))
        },
        (error) => {
          console.error('Error getting coordinates:', error)
        },
      )
    } else {
      console.error('Geolocation is not supported by this browser.')
    }
  }

  return (
    <div>
      <CForm className="g-3 needs-validation">
        {/* <CRow>
          <CCol md={12}>
            <CInputGroup className="has-validation mt-1 required-photo justify-content-end">
              <CButton className="btn text-white btn-success" onClick={GetCoordinates}>
                Get Cordinates
              </CButton>
            </CInputGroup>
          </CCol>
        </CRow> */}
        <CRow className="w-100 m-0">
          <CCol md={4}>
            <div className="py-2">
              <CFormLabel>Verified Market Rate (In Sqft)</CFormLabel>
              <CFormInput
                type="text"
                name="market_rate"
                value={initialValues.market_rate ?? ''}
                onChange={handleOnChange}
                placeholder="Enter Here"
                autoComplete="off"
              />
            </div>
          </CCol>

          <CCol md={4}>
            <div className="py-2">
              <CFormLabel>Whole Rented Amount</CFormLabel>
              <CFormInput
                type="text"
                name="rental_rate"
                value={initialValues.rental_rate ?? ''}
                onChange={handleOnChange}
                placeholder="Enter Here"
                autoComplete="off"
              />
            </div>
          </CCol>

          <CCol md={4}>
            <div className="py-2">
              <CFormLabel>
                Person Name Verified Through<span className="text-danger">*</span>
              </CFormLabel>
              <CFormInput
                type="text"
                name="verified_thru_name"
                value={initialValues.verified_thru_name ?? ''}
                onChange={handleOnChange}
                placeholder="Enter Here"
                autoComplete="off"
              />
            </div>
          </CCol>

          <CCol md={4}>
            <div className="py-2">
              <CFormLabel>
                Contact Verified Through<span className="text-danger">*</span>
              </CFormLabel>

              <CFormInput
                type="number"
                name="verified_thru_contact"
                value={initialValues.verified_thru_contact}
                onChange={(e) => {
                  const input = e.target.value
                  const regex = /^[0-9\b]+$/
                  if (input === '' || regex.test(input)) {
                    handleContactNumberChange(input.slice(0, 10), 'verified_thru_contact')
                  }
                }}
                maxLength={10}
                placeholder="Enter mobile number"
                autoComplete="off"
              />
            </div>
          </CCol>

          <CCol md={4}>
            <CRow className="py-2">
              <CCol md={6}>
                <div className="mb-3">
                  <CFormLabel>Latitude</CFormLabel>
                  <CInputGroup className="has-validation">
                    <input
                      type="text"
                      name="latitude_by_fe"
                      value={initialValues.latitude_by_fe ?? ''}
                      className={`form-control ${errors.latitude_by_fe ? 'is-invalid' : ''}`}
                      placeholder="Enter latitude"
                      onChange={handleOnChangeLatLng}
                    />
                    {errors.latitude_by_fe && (
                      <div className="invalid-feedback">{errors.latitude_by_fe}</div>
                    )}
                  </CInputGroup>
                </div>
              </CCol>

              <CCol md={6}>
                <div className="mb-3">
                  <CFormLabel>Longitude</CFormLabel>
                  <CInputGroup className="has-validation">
                    <input
                      type="text"
                      name="longitude_by_fe"
                      value={initialValues.longitude_by_fe ?? ''}
                      className={`form-control ${errors.longitude_by_fe ? 'is-invalid' : ''}`}
                      placeholder="Enter longitude"
                      onChange={handleOnChangeLatLng}
                    />
                    {errors.longitude_by_fe && (
                      <div className="invalid-feedback">{errors.longitude_by_fe}</div>
                    )}
                  </CInputGroup>
                </div>
              </CCol>
            </CRow>
          </CCol>

          <CCol md={4}>
            <div className="py-2">
              <CFormLabel>Remark</CFormLabel>
              <CFormTextarea
                type="text"
                name="rate_and_lat_long_remarks"
                value={initialValues?.rate_and_lat_long_remarks ?? ''}
                onChange={handleOnChange}
                placeholder="Enter Remarks Here"
                rows={0}
                autoComplete="off"
              />
            </div>
          </CCol>

          <div className="text-center mt-4">
            {isPrevNextButton && loggedinUserRole.name === process.env.REACT_APP_FE && (
              <>
                {currentStep > 1 && currentStep !== totalSteps && (
                  <CButton
                    className="btn btn-success letter-limit me-2 mt-2 mFt-2 next w-20 w-sm-auto px-5 submit_btn"
                    type="button"
                    onClick={handlePreviousStep}
                  >
                    Prev
                  </CButton>
                )}
                {currentStep < totalSteps - 1 && (
                  <CButton
                    className="btn-success text-white btn me-2 mx-3 w-lg-17 w-sm-auto"
                    onClick={handleNextStep}
                  >
                    Next
                  </CButton>
                )}
              </>
            )}

            <CButton
              className="text-white btn-warning me-2  w-sm-auto w-lg-17 previous mx-3  my-4 "
              type="button"
              onClick={async () => {
                let isSubmitSuccessful = await handleSubmit()
                if (isSubmitSuccessful && loggedinUserRole.name !== process.env.REACT_APP_FE) {
                  navigate(`/case/${id}/update/show-details/by/${loggedinUserRole.name}`, {
                    state: { firstStepVisible: false, formStep: 1 },
                  })
                }
              }}
            >
              Save
            </CButton>
            {loggedinUserRole.name !== process.env.REACT_APP_FE && (
              <CButton
                className="text-white btn-danger letter-limit me-2 w-sm-auto w-lg-17 previous mx-3  my-4 "
                type="button"
                onClick={() =>
                  navigate(`/case/${id}/update/show-details/by/${loggedinUserRole.name}`, {
                    state: { firstStepVisible: false, formStep: 1 },
                  })
                }
              >
                Cancel
              </CButton>
            )}
          </div>
        </CRow>
      </CForm>
    </div>
  )
}

export default RateAndLatLong
