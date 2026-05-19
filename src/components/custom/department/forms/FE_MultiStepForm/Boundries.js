import {
  CButton,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CRow,
} from '@coreui/react'

import AppFormSelect from 'src/components/form/AppFormSelect'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import Select from 'react-select'
import BasicProvider from 'src/constants/BasicProvider'
import { setAlertTimeout } from 'src/helpers/alertHelper'
import { useEffectFormData } from 'src/helpers/formHelpers'
import handleSubmitHelper from 'src/helpers/submitHelper'

const validationRules = {}

const Boundries = ({
  currentStep,
  setCurrentStep,
  initialValues,
  setInitialValues,
  totalSteps,
  handlePreviousStep,
  handleNextStep,
}) => {
  let loggedinUserRole = useSelector((state) => state?.userRole)
  const dispatch = useDispatch()
  var params = useParams()
  const id = params.id
  const isEditMode = !!id
  const navigate = useNavigate()

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
    if (e) e.preventDefault()

    try {
      const data = await handleSubmitHelper(initialValues, validationRules, dispatch)
      if (data === false) return data

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
        <CRow className="w-100 m-0 ">
          <CCol md={6}>
            <div className="py-2">
              <CFormLabel>
                Proximity<span className="text-danger ">*</span>
              </CFormLabel>
              <CFormInput
                type="text"
                name="proximity"
                value={initialValues.proximity}
                onChange={handleOnChange}
                placeholder="Well Connected to.."
                autoComplete="off"
              />
            </div>

            <div className="py-2">
              <CFormLabel>
                Reason(If Not Matching) <span className="text-danger ">*</span>
              </CFormLabel>
              <CFormTextarea
                type="text"
                name="not_match_reason"
                value={initialValues.not_match_reason}
                onChange={handleOnChange}
                placeholder="Enter Here.."
                rows={3}
                autoComplete="off"
              />
            </div>
          </CCol>
          <CCol md={6}>
            <CRow>
              <CCol md={6}>
                <div className="py-2">
                  <CFormLabel>
                    East Boundary<span className="text-danger ">*</span>
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    name="east"
                    value={initialValues.east ?? ''}
                    onChange={handleOnChange}
                    placeholder="Enter here"
                    autoComplete="off"
                  />
                </div>
              </CCol>
              <CCol md={6}>
                <div className="py-2">
                  <CFormLabel>
                    West Boundary<span className="text-danger ">*</span>
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    name="west"
                    value={initialValues.west ?? ''}
                    onChange={handleOnChange}
                    placeholder="Enter here"
                    autoComplete="off"
                  />
                </div>
              </CCol>
              <CCol md={6}>
                <div className="py-2">
                  <CFormLabel>
                    North Boundary<span className="text-danger ">*</span>
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    name="north"
                    value={initialValues.north ?? ''}
                    onChange={handleOnChange}
                    placeholder="Enter here"
                    autoComplete="off"
                  />
                </div>
              </CCol>
              <CCol md={6}>
                <div className="py-2">
                  <CFormLabel>South Boundary</CFormLabel>
                  <CFormInput
                    type="text"
                    name="south"
                    value={initialValues.south ?? ''}
                    onChange={handleOnChange}
                    placeholder="Enter here"
                    autoComplete="off"
                  />
                </div>
              </CCol>
            </CRow>
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

export default Boundries
