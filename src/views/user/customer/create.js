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
  CInputGroup,
  CRow,
} from '@coreui/react'

import AppFormSelect from 'src/components/form/AppFormSelect'
import { useEffect, useRef, useState } from 'react'
import 'react-datepicker/dist/react-datepicker.css'
import DatePicker from 'react-datepicker'
import { useNavigate, useParams } from 'react-router-dom'
import ImagePreview from 'src/components/custom/ImagePreview'
import BasicProvider from 'src/constants/BasicProvider'
import { setAlertTimeout } from 'src/helpers/alertHelper'
import { ImageHelper } from 'src/helpers/imageHelper'
import { cilPencil, cilSpreadsheet, cilTrash } from '@coreui/icons'
import { useDispatch } from 'react-redux'
import SubHeader from 'src/components/custom/SubHeader'
import handleSubmitHelper from 'src/helpers/submitHelper'
import { useEffectFormData } from 'src/helpers/formHelpers'

var subHeaderItems = [
  {
    name: 'Create Customer',
    link: '/customers/create',
    icon: cilPencil,
  },
  {
    name: 'All Customers',
    link: '/customers/all',
    icon: cilSpreadsheet,
  },
  {
    name: 'Trash Customers',
    link: '/customers/trash',
    icon: cilTrash,
  },
]

const validationRules = {
  name: {
    required: true,
    minLength: 3,
  },
  email: {
    required: true,
    isEmail: true,
  },
  password: {
    required: true,
    isStrongPassword: true,
  },
  mobile: {
    required: true,
    isNumeric: true,
    minLength: 10,
    maxLength: 12,
  },
  country_id: {
    required: true,
  },
  state_id: {
    required: true,
  },
  city_id: {
    required: true,
  },
}

export default function CreateCustomer() {
  const [data, setData] = useState([])
  const [selectedCounty, setSelectedCounty] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  var params = useParams()
  var dispatch = useDispatch()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const id = params.id
  const isEditMode = !!id

  // console.log(id);
  const [initialValues, setInitialValues] = useState({
    name: '',
    company_name: '',
    email: '',
    mobile: '',
    alt_mobile: '',
    featured_image: '',
    password: '',
    status: 'active',
    address: '',
    postal_code: '',
    gst: '',
    gender: '',
    dob: '',
    state_id: '',
    city_id: '',
    country_id: '',
  })

  useEffect(() => {
    setInitialValues({
      name: '',
      company_name: '',
      email: '',
      mobile: '',
      alt_mobile: '',
      featured_image: '',
      password: '',
      status: 'active',
      address: '',
      postal_code: '',
      gst: '',
      gender: '',
      dob: '',
      state_id: '',
      city_id: '',
      country_id: '',
    })
    setSelectedCounty('')
    setSelectedCity('')
    setSelectedCountry('')
  }, [navigate, id])

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const data = await useEffectFormData(`customers/show/${id}`, initialValues, isEditMode)
        setInitialValues({ ...data })
        setSelectedCounty(data.state_id._id)
        setSelectedCity(data.city_id._id)
        setSelectedCountry(data.country_id._id)
      } catch (error) {
        console.error(error)
      }
    }

    if (isEditMode) {
      fetchInitialData()
    }
  }, [isEditMode, id])

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await new BasicProvider('cms/region/tree/all').getRequest()
        const data = response.data
        setData(data)
      } catch (error) {
        // setError(error)
      }
    }
    fetchRegions()
  }, [])

  const handleOnChange = (e) => {
    const { name, value } = e.target
    if (name === 'mobile' || name === 'alt_mobile') {
      const numericValue = value.replace(/\D/g, '') // Remove non-numeric characters
      const truncatedValue = numericValue.slice(0, 12) // Truncate to 12 digits if necessary
      setInitialValues({ ...initialValues, [name]: truncatedValue })
    } else {
      setInitialValues({ ...initialValues, [name]: value })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (isEditMode) {
        delete validationRules.password
      }
      var data = await handleSubmitHelper(initialValues, validationRules, dispatch)
      if (data === false) return
      var response
      if (isEditMode) {
        response = await new BasicProvider(`customers/update/${id}`).patchRequest(data)
        //console.log(response)
      } else {
        // //console.log(data)
        response = await new BasicProvider(`customers/create`).postRequest(data)
        // //console.log(response)
        navigate(`/customers/${response.data._id}/edit`)
      }
      setAlertTimeout(dispatch)
    } catch (error) {
      console.log(error)
      dispatch({ type: 'set', validations: [error.data] })
      return false
    }
  }

  //dropdown code
  const handleCountryChange = (event) => {
    const selectedCountry = event.target.value
    // //console.log(selectedCountry)
    setSelectedCountry(selectedCountry)
    setInitialValues({ ...initialValues, country_id: selectedCountry })
    setSelectedCounty('')
  }

  const handleCountyChange = (event) => {
    const selectedCounty = event.target.value
    setSelectedCounty(selectedCounty)
    setSelectedCity('')
    setInitialValues({ ...initialValues, state_id: selectedCounty })
  }

  const handleCityChange = (event) => {
    const selectedCity = event.target.value
    setSelectedCity(selectedCity)
    setInitialValues({ ...initialValues, city_id: selectedCity })
  }

  const getCountryOption = () => {
    return data.map((state) => (
      <option key={state._id} value={state._id} disabled={state.type !== 'country'}>
        {state.name}
      </option>
    ))
  }

  const getCountyOption = () => {
    const selectedState = data.find((state) => state._id === selectedCountry)
    // //console.log(selectedState)
    if (selectedState) {
      return selectedState.children.map((state_id) => (
        <option key={state_id._id} value={state_id._id} disabled={state_id.type !== 'state'}>
          {state_id.name}
        </option>
      ))
    }
    return null
  }

  const getCityOptions = () => {
    const selectedState = data.find((state) => state._id === selectedCountry)
    if (selectedState) {
      const selectedCityData = selectedState.children.find((city) => city._id === selectedCounty)
      if (selectedCityData) {
        return selectedCityData.children.map((city) => (
          <option key={city._id} value={city._id} disabled={city.type !== 'city'}>
            {city.name}
          </option>
        ))
      }
    }
    return null
  }

  return (
    <>
      <SubHeader subHeaderItems={subHeaderItems} />
      <CContainer fluid className="">
        <CForm className="g-3 needs-validation" onSubmit={handleSubmit}>
          <CRow>
            <CCol md={6}>
              <CCard>
                <CCardHeader>Basic Information</CCardHeader>
                <CCardBody>
                  <div className="mb-2">
                    <CFormLabel>
                      Name<span className="text-danger">*</span>
                    </CFormLabel>
                    <CInputGroup className="has-validation">
                      <input
                        type="text"
                        name="name"
                        value={initialValues.name ?? ''}
                        className="form-control"
                        placeholder="Enter name"
                        onChange={handleOnChange}
                      />
                    </CInputGroup>
                  </div>

                  <div className="mb-2  ">
                    <CFormLabel>Company Name</CFormLabel>
                    <CInputGroup className="has-validation">
                      <input
                        type="text"
                        name="company_name"
                        value={initialValues.company_name ?? ''}
                        className="form-control"
                        placeholder="Enter name"
                        onChange={handleOnChange}
                      />
                    </CInputGroup>
                  </div>
                  <div className="mb-2">
                    <CFormLabel>
                      Mobile<span className="text-danger">*</span>
                    </CFormLabel>
                    <CInputGroup className="has-validation">
                      <input
                        type="text"
                        name="mobile"
                        value={initialValues.mobile ?? ''}
                        className="form-control"
                        placeholder="Enter mobile number"
                        onChange={handleOnChange}
                      />
                    </CInputGroup>
                  </div>
                  <div className="mb-2">
                    <CFormLabel>Alternative Mobile</CFormLabel>
                    <input
                      type="text"
                      name="alt_mobile"
                      value={initialValues.alt_mobile ?? ''}
                      className="form-control"
                      placeholder="Enter alternative mobile number"
                      onChange={handleOnChange}
                    />
                  </div>
                  <div className="mb-2">
                    <CFormLabel>
                      Email<span className="text-danger">*</span>
                    </CFormLabel>
                    <CInputGroup className="has-validation">
                      <input
                        type="text"
                        name="email"
                        value={initialValues.email ?? ''}
                        className="form-control"
                        placeholder="Enter email address"
                        onChange={handleOnChange}
                      />
                    </CInputGroup>
                  </div>
                  <div className="mb-2">
                    {/* Conditionally render the label for the password field */}
                    {!isEditMode && (
                      <CFormLabel>
                        Password<span className="text-danger">*</span>
                      </CFormLabel>
                    )}
                    {/* Show the password field only when not in edit mode */}
                    {!isEditMode && (
                      <CInputGroup className="has-validation">
                        <input
                          type="password"
                          name="password"
                          value={initialValues.password ?? ''}
                          className="form-control"
                          placeholder="Enter your password here"
                          onChange={handleOnChange}
                        />
                      </CInputGroup>
                    )}
                  </div>
                  <div className="mb-2">
                    {!isEditMode && (
                      <CFormLabel>
                        Reconfirm Password<span className="text-danger">*</span>
                      </CFormLabel>
                    )}
                    {!isEditMode && (
                      <>
                        <input
                          type="password"
                          name="reconfirm_password"
                          value={initialValues.reconfirm_password ?? ''}
                          className="form-control"
                          placeholder="Reconfirm your password here"
                          onChange={handleOnChange}
                        />
                        {/* {reconfirmPasswordError && (
                          <div className="text-danger">{reconfirmPasswordError}</div>
                        )} */}
                      </>
                    )}
                  </div>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol md={6}>
              <CCard>
                <CCardHeader>Profile Details</CCardHeader>
                <CCardBody>
                  <div className="mb-3">
                    <CFormLabel>Profile</CFormLabel>
                    <CFormInput
                      id="image"
                      name="featured_image"
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={(e) => {
                        const file = ImageHelper(e, 'previewImage')
                        setInitialValues({ ...initialValues, featured_image: file[0] })
                      }}
                    />

                    <ImagePreview
                      file={
                        initialValues.featured_image?.filepath
                          ? initialValues.featured_image.filepath
                          : initialValues.featured_image
                      }
                      onDelete={() => {
                        fileInputRef.current.value = ''
                        setInitialValues({ ...initialValues, featured_image: null })
                      }}
                    />
                  </div>

                  <div className="mb-3">
                    <CFormLabel>GST</CFormLabel>
                    <input
                      type="text"
                      name="gst"
                      value={initialValues.gst ?? ''}
                      className="form-control"
                      placeholder="GST"
                      onChange={handleOnChange}
                    />
                  </div>

                  <div className="mb-3 d-flex align-items-center">
                    <CFormLabel className="me-3">Gender</CFormLabel>
                    <div className="form-check form-check-inline maleBtn">
                      <label className="form-check-label">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="gender"
                          value="male"
                          checked={initialValues.gender === 'male'}
                          defaultChecked
                          onChange={(e) =>
                            setInitialValues({ ...initialValues, gender: e.target.value })
                          }
                        />
                        <span className="radioBtn_name"> Male</span>

                        {/* <label className="form-check-label radioBtn_name">Male</label> */}
                      </label>
                    </div>

                    <div className="form-check form-check-inline femaleBtn">
                      <label className="form-check-label">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="gender"
                          value="female"
                          checked={initialValues.gender === 'female'}
                          onChange={(e) =>
                            setInitialValues({ ...initialValues, gender: e.target.value })
                          }
                        />
                        <span className="radioBtn_name">Female</span>

                        {/* <label className="form-check-label radioBtn_name">Female</label> */}
                      </label>
                    </div>
                  </div>

                  <div className="mb-3">
                    <CFormLabel>
                      <span className="me-3">Date Of Birth</span>
                    </CFormLabel>
                    <DatePicker
                      value={initialValues.dob ? new Date(initialValues.dob) : null}
                      selected={initialValues.dob ? new Date(initialValues.dob) : null}
                      dateFormat="yyyy-MM-dd"
                      className="form-control full py-2"
                      size="sm"
                      aria-label="Small select example"
                      placeholderText="Select dob"
                      onChange={(date) => {
                        setInitialValues((prevValue) => ({
                          ...prevValue,
                          dob: date,
                        }))
                      }}
                    />
                  </div>

                  <div className="mb-3 d-flex align-items-center">
                    <CFormLabel className="me-3">Status</CFormLabel>
                    <div className="form-check form-check-inline activeBtn">
                      <label className="form-check-label">
                        <input
                          className="form-check-input radioBtn_input"
                          type="radio"
                          name="status"
                          value="active"
                          checked={initialValues.status === 'active'}
                          onChange={(e) =>
                            setInitialValues({ ...initialValues, status: e.target.value })
                          }
                        />
                        <span className="radioBtn_name">Active</span>
                      </label>
                    </div>
                    <div className="form-check form-check-inline inactiveBtn">
                      <label className="form-check-label">
                        <input
                          className="form-check-input radioBtn_input"
                          type="radio"
                          name="status"
                          value="inactive"
                          checked={initialValues.status === 'inactive'}
                          onChange={(e) =>
                            setInitialValues({ ...initialValues, status: e.target.value })
                          }
                        />
                        <span className="radioBtn_name">Inactive</span>
                      </label>
                    </div>
                    <div className="form-check form-check-inline blacklistBtn">
                      <label className="form-check-label">
                        <input
                          className="form-check-input radioBtn_input"
                          type="radio"
                          name="status"
                          value="blacklist"
                          checked={initialValues.status === 'blacklist'}
                          onChange={(e) =>
                            setInitialValues({ ...initialValues, status: e.target.value })
                          }
                        />
                        <span className="radioBtn_name">Blacklist</span>
                      </label>
                    </div>
                  </div>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
          <CRow className="mt-3">
            <CCol md={12}>
              <CCard>
                <CCardHeader>Address Detail</CCardHeader>
                <CCardBody>
                  <CRow></CRow>
                  <CRow>
                    <CCol md={6}>
                      <div className="mb-3">
                        <CFormLabel>
                          Country:<span className="text-danger">*</span>
                        </CFormLabel>
                        <AppFormSelect
                          id="country"
                          value={selectedCountry}
                          onChange={handleCountryChange}
                        >
                          <option value="">Select Country</option>
                          {getCountryOption()}
                        </AppFormSelect>
                      </div>
                    </CCol>
                    <CCol md={6}>
                      <CFormLabel>
                        State:<span className="text-danger">*</span>
                      </CFormLabel>
                      <AppFormSelect
                        id="county"
                        value={selectedCounty}
                        onChange={handleCountyChange}
                        disabled={!selectedCountry}
                      >
                        <option value="">Select County</option>
                        {getCountyOption()}
                      </AppFormSelect>
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol md={6}>
                      <CFormLabel>
                        City:<span className="text-danger">*</span>
                      </CFormLabel>
                      <AppFormSelect
                        id="city"
                        value={selectedCity}
                        onChange={handleCityChange}
                        disabled={!selectedCounty}
                      >
                        <option value="">Select City</option>
                        {getCityOptions()}
                      </AppFormSelect>
                    </CCol>

                    <CCol md={6}>
                      <CFormLabel>
                        Address<span className="text-danger">*</span>
                      </CFormLabel>
                      <CInputGroup className="has-validation">
                        <input
                          type="text"
                          name="address"
                          value={initialValues.address ?? ''}
                          className="form-control"
                          placeholder="Enter address"
                          onChange={handleOnChange}
                        />
                      </CInputGroup>
                    </CCol>
                  </CRow>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
          <CCard className="card-footer1">
            <CCardBody>
              {!isEditMode && (
                <CButton
                  className="btn btn-primary me-2 mt-2 submit_btn"
                  type="submit"
                  name="buttonClicked"
                  value="submit"
                >
                  Submit
                </CButton>
              )}

              {isEditMode && (
                <CButton
                  className="btn btn-secondary me-2 mt-2 "
                  type="submit"
                  name="buttonClicked"
                  value="update"
                >
                  Update
                </CButton>
              )}
              <CButton
                color="danger"
                className="mt-2 text-light"
                onClick={() => {
                  navigate('/customers/all')
                }}
              >
                Cancel
              </CButton>
            </CCardBody>
          </CCard>
        </CForm>
      </CContainer>
    </>
  )
}
