import { CButton, CCol, CForm, CFormInput, CFormLabel, CRow } from '@coreui/react'

import AppFormSelect from 'src/components/form/AppFormSelect'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import BasicProvider from 'src/constants/BasicProvider'
import { setAlertTimeout } from 'src/helpers/alertHelper'
import { useEffectFormData } from 'src/helpers/formHelpers'
import handleSubmitHelper from 'src/helpers/submitHelper'

import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const validationRules = {
  // person_meet_at_site_name: {
  //   required: true,
  // },
}

const DistanceFrom = ({ currentStep, setCurrentStep, initialValues, setInitialValues, totalSteps,
  handlePreviousStep,
  handleNextStep }) => {

  let loggedinUserRole = useSelector((state) => state?.userRole)

  var params = useParams()
  const id = params.id
  const navigate = useNavigate()
  var dispatch = useDispatch()
  const isEditMode = !!id

  const [isCancle, setIsCancle] = useState(false)

  const [isPrevNextButton, setIsPrevNextButton] = useState(true)

  useEffect(() => {
    if (loggedinUserRole?.name == process.env.REACT_APP_SDM) setIsCancle(true)
    if (loggedinUserRole?.name == process.env.REACT_APP_DM) setIsCancle(true)

    if (loggedinUserRole?.name == process.env.REACT_APP_DM) setIsPrevNextButton(false)
  }, [loggedinUserRole])

  const handleOnChange = (e) => {
    const { name, value } = e.target
    setInitialValues({ ...initialValues, [name]: value })
  }

  const handleSubmit = async (e) => {
    // e.preventDefault()
    try {
      const data = await handleSubmitHelper(initialValues, validationRules, dispatch)
      if (data === false) return

      let response = await new BasicProvider(`cases/update/${id}`, dispatch).patchRequest(data)

      setAlertTimeout(dispatch)
    } catch (error) {
      console.log(error)
      // dispatch({ type: 'set', catcherror: error.data })
      dispatch({ type: 'set', validations: [error.data] })
    }
  }

  return (
    <div>
      <CForm className="g-3 needs-validation">
        <CRow className="w-100 m-0">
          <CCol md={4}>
            <div className="py-2">
              <CFormLabel>Road Type</CFormLabel>
              <AppFormSelect
                custom
                name="road_type"
                value={initialValues.road_type}
                placeholder="Select"
                onChange={handleOnChange}
              >
                <option>Select Road Type</option>
                <option value="rcc">RCC</option>
                <option value="mud">MUD</option>
                <option value="bitumin">BITUMIN</option>
              </AppFormSelect>
            </div>
          </CCol>
          <CCol md={4}>
            <div className="py-2">
              <CFormLabel>Wall to Wall Road Width(In Feet)</CFormLabel>
              <CFormInput
                type="text"
                name="wall_to_wall_road_width"
                value={initialValues.wall_to_wall_road_width ?? ''}
                onChange={handleOnChange}
                placeholder="Enter wall to wall road width"
                autoComplete="off"
              />
            </div>
          </CCol>
          <CCol md={4}>
            <div className="py-2">
              <CFormLabel>Road Center to Wall Width(In Feet)</CFormLabel>
              <CFormInput
                type="text"
                name="road_center_to_wall_width"
                value={initialValues.road_center_to_wall_width ?? ''}
                onChange={handleOnChange}
                placeholder="Enter wall to wall road width"
                autoComplete="off"
              />
            </div>
          </CCol>

          <CCol md={4}>
            <div className="py-2">
              <CFormLabel>Highway Name & No. and Dist.</CFormLabel>
              <CFormInput
                type="text"
                name="highway_name_and_no_dist"
                value={initialValues.highway_name_and_no_dist}
                onChange={handleOnChange}
                placeholder="Enter highway name & no. and dist."
                autoComplete="off"
              />
            </div>
          </CCol>

          <CCol md={4}>
            <div className="py-2">
              <CFormLabel>City Centre KM</CFormLabel>
              <CFormInput
                type="text"
                name="city_centre_km"
                value={initialValues.city_centre_km}
                onChange={handleOnChange}
                placeholder="Enter city centre KM"
                autoComplete="off"
              />
            </div>
          </CCol>
          <CCol md={4}>
            <div className="py-2">
              <CFormLabel>Hospital KM</CFormLabel>
              <CFormInput
                type="text"
                name="hospital_km"
                value={initialValues.hospital_km}
                onChange={handleOnChange}
                placeholder="Enter hospital KM"
                autoComplete="off"
              />
            </div>
          </CCol>
          <CCol md={4}>
            <div className="py-2">
              <CFormLabel>Railway Station KM</CFormLabel>
              <CFormInput
                type="text"
                name="railway_station_km"
                value={initialValues.railway_station_km}
                onChange={handleOnChange}
                placeholder="Enter Railway Station KM"
                autoComplete="off"
              />
            </div>
          </CCol>

          <CCol md={4}>
            <div className="py-2">
              <CFormLabel>Bus stand KM</CFormLabel>
              <CFormInput
                type="text"
                name="bus_stand_km"
                value={initialValues.bus_stand_km}
                onChange={handleOnChange}
                placeholder="Enter Bus Station KM"
                autoComplete="off"
              />
            </div>
          </CCol>

          <CCol md={4}>
            <div className="py-2">
              <CFormLabel>Any Govt. Office</CFormLabel>
              <CFormInput
                type="text"
                name="any_govt_office"
                value={initialValues.any_govt_office}
                onChange={handleOnChange}
                placeholder="Enter Gov. Office KM"
                autoComplete="off"
              />
            </div>
          </CCol>

          <CCol md={4}>
            <div className="py-2">
              <CFormLabel>Other</CFormLabel>
              <CFormInput
                type="text"
                name="other"
                value={initialValues.other}
                onChange={handleOnChange}
                autoComplete="off"
                placeholder="Enter other"
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
                await handleSubmit()
                if (loggedinUserRole.name !== process.env.REACT_APP_FE) {
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

export default DistanceFrom
