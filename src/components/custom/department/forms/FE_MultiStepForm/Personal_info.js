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

import AppFormSelect from 'src/components/form/AppFormSelect'
import React, { useEffect, useRef, useState } from 'react'
import Select from 'react-select'
import { MultiImageHelper } from 'src/helpers/imageHelper'
import GalleryPreview from 'src/components/custom/GalleryPreview'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useEffectFormData } from 'src/helpers/formHelpers'
import { useDispatch, useSelector } from 'react-redux'
import handleSubmitHelper from 'src/helpers/submitHelper'
import BasicProvider from 'src/constants/BasicProvider'
import { setAlertTimeout } from 'src/helpers/alertHelper'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { cilXCircle } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

const validationRules = {

}

const PersonalInfo = ({ currentStep, setCurrentStep, initialValues, setInitialValues, totalSteps,
  handlePreviousStep,
  handleNextStep

}) => {
  let loggedinUserRole = useSelector((state) => state?.userRole)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  var params = useParams()
  var caseId = params.id

  const [isCancle, setIsCancle] = useState(false)
  const [isPrevNextButton, setIsPrevNextButton] = useState(true)

  const id = params.id
  const isEditMode = !!id

  useEffect(() => {
    if (loggedinUserRole?.name == process.env.REACT_APP_SDM) setIsCancle(true)
    if (loggedinUserRole?.name == process.env.REACT_APP_DM) setIsCancle(true)

    if (loggedinUserRole?.name == process.env.REACT_APP_SDM) setIsPrevNextButton(false)
    if (loggedinUserRole?.name == process.env.REACT_APP_DM) setIsPrevNextButton(false)
  }, [loggedinUserRole])

  const handleOnChange = (e) => {
    const { name, value } = e.target

    const updatedValues = { ...initialValues }
    if (name === 'occupant' && value !== 'Occupied') {
      updatedValues['self_occupied'] = ''
    }
    updatedValues[name] = value
    setInitialValues(updatedValues)
  }

  // useEffect(() => {
  //   initialValues.full_common_address
  //     ? setInitialValues((prev) => ({ ...prev, full_common_address: '' }))
  //     : setInitialValues((prev) => ({ ...prev, full_common_address: initialValues.address }))
  // }, [initialValues.same_address])

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target
    if (checked === true) {
      setInitialValues({
        ...initialValues,
        [name]: checked,
        full_common_address: initialValues.address,
      })
    } else {
      setInitialValues({
        ...initialValues,
        [name]: checked,
        house_plot_no: '',
        ward_no: '',
        city: '',
        teh: '',
        dist: '',
      })
    }
  }

  const handleContactNumberChange = (value, contactNumberField) => {
    const sanitizedValue = value.replace(/\D/g, '')
    setInitialValues({ ...initialValues, [contactNumberField]: sanitizedValue })
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
      dispatch({ type: 'set', validations: [error.data] })
    }
  }

  const handleAddTenant = () => {
    setInitialValues((prevState) => ({
      ...prevState,
      tenant_details: [
        ...prevState.tenant_details,
        {
          tenant_name: '',
          exp_rent: '',
          tenant_relation: '',
          tenant_date: new Date(),
        },
      ],
    }))
  }

  const handleRemoveTenant = (index) => {
    setInitialValues((prevState) => ({
      ...prevState,
      tenant_details: prevState.tenant_details.filter((_, i) => i !== index),
    }))
  }

  const handleTenantDetailChange = (index, field, value) => {
    setInitialValues((prevState) => {
      const updatedTenantDetails = [...prevState.tenant_details]
      updatedTenantDetails[index][field] = value
      return {
        ...prevState,
        tenant_details: updatedTenantDetails,
      }
    })
  }

  return (
    <>
      <CForm className="g-3 needs-validation">
        <CRow>
          <CCol md={12}>
            <CInputGroup className="has-validation mt-1 required-photo justify-content-start justify-content-lg-end">
              <CFormCheck
                className="d-flex align-items-center ps-2 ps-lg-0"
                inline
                type="checkbox"
                id="selfieCheckbox"
                name="same_address"
                label="Check if address is same as above?"
                checked={initialValues?.same_address}
                onChange={handleCheckboxChange}
              />
            </CInputGroup>
          </CCol>
        </CRow>
        <CRow className="w-100 m-0 ">
          <CCol md={4}>
            <div className="py-2">
              <CFormLabel>
                Applicant Name<span className="text-danger ">*</span>
              </CFormLabel>
              <CFormInput
                type="text"
                value={initialValues.applicant_name}
                name="applicant_name"
                onChange={handleOnChange}
                placeholder="Enter Name"
                autoComplete="off"
              />
            </div>
          </CCol>

          <CCol md={4}>
            <div className="py-2">
              <CFormLabel>
                Applicant Mobile Number<span className="text-danger ">*</span>
              </CFormLabel>

              <CFormInput
                type="text"
                name="contact_number_1"
                value={initialValues.contact_number_1}
                onChange={(e) => {
                  const input = e.target.value
                  const regex = /^[0-9\b]+$/
                  if (input === '' || regex.test(input)) {
                    handleContactNumberChange(input.slice(0, 10), 'contact_number_1')
                  }
                }}
                maxLength={10}
                placeholder="Enter mobile number"
                autoComplete="off"
              />
            </div>
          </CCol>
          <CCol md={4}>
            <div className="py-2">
              <CFormLabel>
                Person Meet At Site Name<span className="text-danger ">*</span>
              </CFormLabel>

              <CFormInput
                type="text"
                value={initialValues.person_meet_at_site_name}
                name="person_meet_at_site_name"
                onChange={handleOnChange}
                placeholder="Enter Name"
                autoComplete="off"
              />
            </div>
          </CCol>
          <CCol md={4}>
            {/* mobile Number status  */}
            <div className="py-2">
              <CFormLabel>
                Mobile Number (Person Meet At Site)<span className="text-danger ">*</span>
              </CFormLabel>

              <CFormInput
                type="number"
                name="mobile"
                value={initialValues.person_meet_at_site_mobile}
                onChange={(e) => {
                  const input = e.target.value
                  const regex = /^[0-9\b]+$/
                  if (input === '' || regex.test(input)) {
                    handleContactNumberChange(input.slice(0, 10), 'person_meet_at_site_mobile')
                  }
                }}
                maxLength={10}
                placeholder="Enter mobile number"
                autoComplete="off"
              />
            </div>
          </CCol>

          <CCol md={4}>
            <div className="py-2">
              <CFormLabel>Relation (Person Meet At Site)</CFormLabel>
              <AppFormSelect
                custom
                name="person_meet_at_site_relation"
                value={initialValues.person_meet_at_site_relation}
                placeholder="Select"
                onChange={handleOnChange}
              >
                <option>Select Type Relation</option>
                <option value="self">Self</option>
                <option value="son">Son</option>
                <option value="daughter">Daughter</option>
                <option value="father">Father</option>
                <option value="mother">Mother</option>
                <option value="brother">Brother</option>
                <option value="sister">Sister</option>
                <option value="grandfather">Grandfather</option>
                <option value="grandmother">Grandmother</option>
                <option value="uncle">Uncle</option>
                <option value="aunt">Aunt</option>
                <option value="cousin">Cousin</option>
                <option value="director">Director</option>
                <option value="proprietor">Proprietor</option>
                <option value="employee">Employee</option>
                <option value="property care tacker">Property Care Tacker </option>
                <option value="manager">Manager</option>
                <option value="wife">Wife</option>
                <option value="neighbour">Neighbour</option>
                <option value="tenant">Tenant</option>

              </AppFormSelect>
            </div>
          </CCol>
          <CCol md={4}>
            <div className="py-2">
              <CFormLabel>
                Type of property<span className="text-danger ">*</span>
              </CFormLabel>

              <AppFormSelect
                custom
                name="type_of_property"
                value={initialValues.type_of_property}
                onChange={handleOnChange}
              >
                <option>Select Type of property</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="industrial">Industrial</option>
                <option value="mixed">Mixed</option>
              </AppFormSelect>
            </div>
          </CCol>
          <CCol md={4}>
            <div className="py-2">
              <CFormLabel>
                Current use of property<span className="text-danger ">*</span>
              </CFormLabel>

              <AppFormSelect
                custom
                name="current_use_property"
                value={initialValues.current_use_property}
                onChange={handleOnChange}
              >
                <option>Select current use of property</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="industrial">Industrial</option>
                <option value="mixed">Mixed</option>
                <option value="plot/open land">Plot/Open Land</option>
                <option value="under construction">Under Construction</option>


              </AppFormSelect>
            </div>
          </CCol>
          <CCol md={4}>
            <div className="py-2">
              <CFormLabel>Local Address Verification</CFormLabel>
              <AppFormSelect
                custom
                name="address_verification"
                value={initialValues.address_verification ?? ''}
                placeholder="Select Your Gender"
                onChange={handleOnChange}
              >
                <option>Select</option>
                <option value="layout">Layout</option>
                <option value="aadhar card">Aadhar Card</option>
                <option value="electricity bill">Electricity Bill</option>
                <option value="voter id">Voter ID</option>
                <option value="name plate">Name Plate</option>
              </AppFormSelect>
            </div>
          </CCol>
          <CCol md={4}>
            <div className="py-2">
              <CFormLabel>House Name/Building Name</CFormLabel>
              <CFormInput
                type="text"
                name="house_builing_name"
                value={initialValues.house_builing_name ?? ''}
                onChange={handleOnChange}
                placeholder="Enter Here"
                autoComplete="off"
              />
            </div>
          </CCol>

          <CCol md={4}>
            <div className="py-2">
              <CFormLabel>Wing or Block Name</CFormLabel>
              <CFormInput
                type="text"
                name="wing_block_name"
                value={initialValues.wing_block_name ?? ''}
                onChange={handleOnChange}
                placeholder="Enter Here"
                autoComplete="off"
              />
            </div>
          </CCol>

          <CCol md={4}>
            <div className="py-2">
              <CFormLabel>Street Name</CFormLabel>
              <CFormInput
                type="text"
                name="street_name"
                value={initialValues.street_name ?? ''}
                onChange={handleOnChange}
                placeholder="Enter Here"
                autoComplete="off"
              />
            </div>
          </CCol>

          {!initialValues.same_address && (
            <CCol md={4}>
              <div className="py-2">
                <CFormLabel>House./Plot No</CFormLabel>
                <CFormInput
                  type="text"
                  name="house_plot_no"
                  value={initialValues.house_plot_no ?? ''}
                  onChange={handleOnChange}
                  placeholder="Enter Here"
                  autoComplete="off"
                />
              </div>
            </CCol>
          )}

          <CCol md={4}>
            <div className="py-2">
              <CFormLabel>Village/Colony</CFormLabel>
              <CFormInput
                type="text"
                name="village_colony"
                value={initialValues.village_colony ?? ''}
                onChange={handleOnChange}
                placeholder="Enter Here"
                autoComplete="off"
              />
            </div>
          </CCol>

          {/* <CCol md={4}>
            <div className="py-2">
              <CFormLabel>Ward No.</CFormLabel>
              
              <CFormInput
                type="text"
                id="exampleDropdownFormEmail1"
                name="ward_no"
                value={initialValues.ward_no ?? ''}
                onChange={handleOnChange}
                placeholder="Enter Here"
                autoComplete="off"
              />
            
            </div>  
          </CCol> */}

          {!initialValues.same_address && (
            <CCol md={4}>
              <div className="py-2">
                <CFormLabel>Ward No.</CFormLabel>

                <CFormInput
                  type="number"
                  id="exampleDropdownFormEmail1"
                  name="ward_no"
                  value={initialValues.ward_no ?? ''}
                  onChange={handleOnChange}
                  placeholder="Enter Here"
                  autoComplete="off"
                />
              </div>
            </CCol>
          )}
          {!initialValues.same_address && (
            <CCol md={4}>
              <div className="py-2">
                <CFormLabel>Tehsil.</CFormLabel>
                <CFormInput
                  type="text"
                  name="teh"
                  value={initialValues.teh ?? ''}
                  onChange={handleOnChange}
                  placeholder="Enter Here"
                  autoComplete="off"
                />
              </div>
            </CCol>
          )}
          {!initialValues.same_address && (
            <CCol md={4}>
              <div className="py-2">
                <CFormLabel>City</CFormLabel>
                <CFormInput
                  type="text"
                  name="city"
                  value={initialValues.city ?? ''}
                  onChange={handleOnChange}
                  placeholder="Enter Here"
                  autoComplete="off"
                />
              </div>
            </CCol>
          )}
          {!initialValues.same_address && (
            <CCol md={4}>
              <div className="py-2">
                <CFormLabel>District.</CFormLabel>
                <CFormInput
                  type="text"
                  name="dist"
                  value={initialValues.dist ?? ''}
                  onChange={handleOnChange}
                  placeholder="Enter Here"
                  autoComplete="off"
                />
              </div>
            </CCol>
          )}
          <CCol md={4}>
            <div className="py-2">
              <CFormLabel>State</CFormLabel>
              <CFormInput
                type="text"
                name="state"
                value={initialValues.state ?? ''}
                onChange={handleOnChange}
                placeholder="Enter Here"
                autoComplete="off"
              />
            </div>
          </CCol>
          <CCol md={4}>
            <div className="py-2">
              <CFormLabel>Pin</CFormLabel>
              <CFormInput
                type="number"
                name="pin"
                value={initialValues.pin ?? ''}
                onChange={handleOnChange}
                placeholder="Enter Here"
                autoComplete="off"
              />
            </div>
          </CCol>

          {initialValues.same_address && (
            <CCol md={8}>
              <div className="py-2">
                <CFormLabel>Full Address</CFormLabel>
                <CFormInput
                  type="text"
                  value={initialValues.full_common_address}
                  name="full_common_address"
                  onChange={handleOnChange}
                  placeholder="Enter Full Adress"
                />
              </div>
            </CCol>
          )}

          <CCol md={4}>
            <div className="py-2">
              <CFormLabel>Landmark</CFormLabel>
              <CFormInput
                type="text"
                name="landmark"
                value={initialValues.landmark ?? ''}
                onChange={handleOnChange}
                placeholder="Enter Here"
                autoComplete="off"
              />
            </div>
          </CCol>

          <CCol md={4}>
            <div className="py-2">
              <CFormLabel>Occupant</CFormLabel>
              <AppFormSelect
                custom
                name="occupant"
                value={initialValues.occupant ?? ''}
                placeholder="Select Your"
                onChange={handleOnChange}
              >
                <option>Select</option>
                <option value="vacant">Vacant</option>
                <option value="Occupied">Occupied</option>
                <option value="tenant">Tenant</option>
              </AppFormSelect>
            </div>
          </CCol>

          {initialValues.occupant === 'Occupied' && (
            <CCol md={4}>
              <div className="py-2">
                <CFormLabel>If Self Occupied</CFormLabel>
                <AppFormSelect
                  custom
                  name="self_occupied"
                  value={initialValues.self_occupied ?? ''}
                  placeholder="Select"
                  onChange={handleOnChange}
                >
                  <option>Select</option>
                  <option value="self">Self</option>
                  <option value="seller">Seller</option>
                  <option value="buyer">Buyer</option>
                </AppFormSelect>
              </div>
            </CCol>
          )}

          {initialValues.occupant === 'Occupied' &&
            (initialValues.self_occupied === 'buyer' ||
              initialValues.self_occupied === 'self' ||
              initialValues.self_occupied === 'seller') && (
              <CCol md={4}>
                <div className="py-2">
                  <CFormLabel>Tenure (In Months)</CFormLabel>
                  <CFormInput
                    type="text"
                    name="tenure"
                    value={initialValues.tenure ?? ''}
                    onChange={handleOnChange}
                    placeholder="Enter Here"
                    autoComplete="off"
                  />
                </div>
              </CCol>
            )}

          {initialValues.occupant === 'vacant' && (
            <CCol md={4}>
              <div className="py-2">
                <CFormLabel>Property vacant from last month</CFormLabel>
                <CFormInput
                  type="text"
                  name="vacant_month"
                  value={initialValues.vacant_month ?? ''}
                  onChange={handleOnChange}
                  placeholder="Enter Here"
                  autoComplete="off"
                />
              </div>
            </CCol>
          )}

          {initialValues.occupant === 'tenant' && (
            <>

              <div className="py-2 mt-4">
                <CButton onClick={handleAddTenant}>Add Tenant</CButton>
              </div>

              <>
                {initialValues.occupant === 'tenant' &&
                  initialValues.tenant_details.map((tenant, index) => (
                    <React.Fragment key={index}>
                      <CCol md={3}>
                        <div className="py-2">
                          <CFormLabel>Tenant Name</CFormLabel>
                          <CFormInput
                            type="text"
                            name="tenant_name"
                            value={tenant.tenant_name}
                            onChange={(e) =>
                              handleTenantDetailChange(index, 'tenant_name', e.target.value)
                            }
                            placeholder="Enter Here"
                            autoComplete="off"
                          />
                        </div>
                      </CCol>
                      <CCol md={3}>
                        <div className="py-2">
                          <CFormLabel>Exp/Rent</CFormLabel>
                          <CFormInput
                            type="text"
                            name="exp_rent"
                            value={tenant.exp_rent}
                            onChange={(e) =>
                              handleTenantDetailChange(index, 'exp_rent', e.target.value)
                            }
                            placeholder="Enter Here"
                            autoComplete="off"
                          />
                        </div>
                      </CCol>
                      <CCol md={3}>
                        <div className="py-2">
                          <CFormLabel>Relation</CFormLabel>
                          <CFormInput
                            type="text"
                            name="tenant_relation"
                            value={tenant.tenant_relation}
                            onChange={(e) =>
                              handleTenantDetailChange(index, 'tenant_relation', e.target.value)
                            }
                            placeholder="Enter Here"
                            autoComplete="off"
                          />
                        </div>
                      </CCol>

                      <CCol md={2}>
                        <div className="py-2">
                          <CFormLabel>Tenant Date</CFormLabel>
                          <DatePicker
                            showMonthDropdown
                            showYearDropdown
                            selected={
                              tenant.tenant_date ? new Date(tenant.tenant_date) : new Date()
                            }
                            onChange={(date) =>
                              handleTenantDetailChange(index, 'tenant_date', date)
                            }
                            dateFormat="dd-MMM-yyyy"
                            className="form-control full mb-3"
                          />
                        </div>
                      </CCol>
                      <CCol md={1}>
                        <div
                          onClick={() => handleRemoveTenant(index)}
                          className="delet-question mt-4"
                        >
                          <CIcon icon={cilXCircle}></CIcon>
                        </div>
                      </CCol>
                    </React.Fragment>
                  ))}
              </>


            </>
          )}



          <div className="text-center mt-4">
            {isPrevNextButton && (
              <>
                {currentStep > 1 && currentStep != totalSteps && (
                  <CButton
                    className="btn btn-success me-2 mt-2 mFt-2 next w-50 w-sm-auto px-5 submit_btn"
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
                  navigate(`/case/${caseId}/update/show-details/by/${loggedinUserRole.name}`, {
                    state: { firstStepVisible: false, formStep: 1 },
                  })
                }
              }}
            >
              Save
            </CButton>

            {
              loggedinUserRole.name !== process.env.REACT_APP_FE && (
                <>
                  <CButton
                    className="text-white btn-danger letter-limit me-2 w-sm-auto w-lg-17 previous mx-3  my-4 "
                    type="button"
                    onClick={() =>
                      navigate(`/case/${caseId}/update/show-details/by/${loggedinUserRole.name}`, {
                        state: { firstStepVisible: false, formStep: 1 },
                      })
                    }
                  >
                    Cancel
                  </CButton>

                </>
              )
            }


          </div>
        </CRow>
      </CForm>
    </>
  )
}

export default PersonalInfo
