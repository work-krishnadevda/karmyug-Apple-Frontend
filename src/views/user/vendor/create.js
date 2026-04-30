import { cilPencil, cilSpreadsheet, cilTrash } from '@coreui/icons'
import {
  CButton,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CFormLabel,
  CInputGroup,
  CRow,
} from '@coreui/react'
import Cookies from 'js-cookie'
import { useEffect, useRef, useState } from 'react'
import 'react-datepicker/dist/react-datepicker.css'
import { useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import ImagePreview from 'src/components/custom/ImagePreview'
import SubHeader from 'src/components/custom/SubHeader'
import BasicProvider from 'src/constants/BasicProvider'
import { setAlertTimeout } from 'src/helpers/alertHelper'
import { useEffectFormData } from 'src/helpers/formHelpers'
import { ImageHelper } from 'src/helpers/imageHelper'
import handleSubmitHelper from 'src/helpers/submitHelper'
var subHeaderItems = [
  {
    name: 'All Vendors',
    link: '/vendors/all',
    icon: cilSpreadsheet,
  },
  {
    name: 'Create Vendor',
    link: '/vendors/create',
    icon: cilPencil,
  },
  {
    name: 'Trash Vendors',
    link: '/vendors/trash',
    icon: cilTrash,
  },
]

const validationRules = {
  // name: {
  //   required: true,
  //   minLength: 3,
  // },
  // email: {
  //   required: true,
  //   isEmail: true,
  // },
  // password: {
  //   required: true,
  //   isStrongPassword: true,
  // },
  // mobile: {
  //   required: true,
  //   isNumeric: true,
  //   minLength: 10,
  //   maxLength: 12,
  // },
  // address: {
  //   required: true,
  // },
  // role: {
  //   required: true,
  // },
}

export default function CreateUser() {
  var params = useParams()
  var dispatch = useDispatch()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const id = params.id
  const isEditMode = !!id
  const [dropDownData, setDropDownData] = useState([])
  const [selectedExecutive, setSelectedExecutive] = useState('')
  const showPasswordFields = !isEditMode
  const [reconfirmPasswordError, setReconfirmPasswordError] = useState('')

  const [initialValues, setInitialValues] = useState({
    name: '',
    email: '',
    mobile: '',
    moble_alt: '',
    reconfirm_password: '',
    company_name: '',
    featured_image: '',
    password: '',
    gender: 'male',
    description: '',
    email: '',
    role: '',
    status: 'active',
    address: '',
  })

  useEffect(() => {
    setInitialValues({
      name: '',
      email: '',
      mobile: '',
      moble_alt: '',
      company_name: '',
      reconfirm_password: '',
      featured_image: '',
      password: '',
      gender: 'male',
      description: '',
      email: '',
      role: '',
      status: 'active',
      address: '',
    })
    if (isEditMode) fetchData()
  }, [navigate, id])

  const fetchData = async () => {
    try {
      const data = await useEffectFormData(`vendors/${id}`, initialValues, isEditMode)
      if (isEditMode) {
        setInitialValues({ ...data })
      }
    } catch (error) {
      dispatch({ type: 'set', catcherror: error.data })
    }
  }

  const handleOnChange = (e) => {
    const { name, value } = e.target
    setInitialValues({ ...initialValues, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()   
    try {
      const data = await handleSubmitHelper(initialValues, validationRules, dispatch)
      for (var pair of data.entries()) {
        // console.log(pair[0] + ', ' + pair[1])
      }
      if (data === false) return
      var response
      if (isEditMode) {
        response = await new BasicProvider(`vendors/update/${id}`, dispatch).patchRequest(data)
        // const newdata = await new BasicProvider(`auth/resettoken`).getRequest()
        // // await Cookies.remove('auth')
        // await Cookies.set('auth', newdata.data)
      } else {
        response = await new BasicProvider(`vendors/create`, dispatch).postRequest(data)
        navigate(`/vendors/${response.data._id}/edit`)
      }
      setAlertTimeout(dispatch)
    } catch (error) {
      console.log(error)
      // dispatch({ type: 'set', catcherror: error.data })
      dispatch({ type: 'set', validations: [error.data] })
    }
  }

  const handleMobileChange = (value) => {
    const sanitizedValue = value.replace(/\D/g, '')
    setInitialValues({ ...initialValues, mobile: sanitizedValue })
  }

  const handleAlternativeMobileChange = (value) => {
    const sanitizedValue = value.replace(/\D/g, '')
    setInitialValues({ ...initialValues, moble_alt: sanitizedValue })
  }

  const handleNameChange = (value) => {
    const sanitizedValue = value.replace(/[^A-Za-z\s]/g, '')
    setInitialValues({ ...initialValues, name: sanitizedValue })
  }
  // console.log(initialValues)
  return (
    <>
      <SubHeader subHeaderItems={subHeaderItems} />
      <CContainer fluid >
        <CForm className="g-3 needs-validation" onSubmit={handleSubmit}>
          <CRow>
            <CCol md={6}>
              <CCard>
                <CCardHeader>Basic Information</CCardHeader>
                <CCardBody>
                  <CFormLabel>
                    Vandor Name<span className="text-danger">*</span>
                  </CFormLabel>
                  <CInputGroup className="has-validation">
                    <input
                      type="text"
                      name="name"
                      value={initialValues.name ?? ''}
                      className="form-control"
                      placeholder="Enter your name"
                      onChange={(e) => handleNameChange(e.target.value)}
                    />
                  </CInputGroup>

                  <div className="mb-3">
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
                        onChange={(e) => handleMobileChange(e.target.value)}
                        maxLength={10}
                      />
                    </CInputGroup>
                  </div>
                  <div className="mb-3">
                    <CFormLabel>Alternative Mobile</CFormLabel>

                    <input
                      type="text"
                      name="moble_alt"
                      value={initialValues.moble_alt ?? ''}
                      className="form-control"
                      placeholder="Enter alternative mobile number"
                      onChange={(e) => handleAlternativeMobileChange(e.target.value)}
                      maxLength={10}
                    />
                  </div>
                  <div className="mb-3">
                    <CFormLabel>
                      Email<span className="text-danger">*</span>
                    </CFormLabel>
                    <input
                      type="text"
                      name="email"
                      value={initialValues.email ?? ''}
                      className="form-control"
                      placeholder="Enter your email here"
                      onChange={handleOnChange}
                    />
                  </div>
                  <div className="mb-3">
                    {showPasswordFields && (
                      <CFormLabel>
                        Password<span className="text-danger">*</span>
                      </CFormLabel>
                    )}
                    {showPasswordFields && (
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
                  <div className="mb-3">
                    {/* Conditionally render the label for the reconfirm password field */}
                    {showPasswordFields && (
                      <CFormLabel>
                        Reconfirm Password<span className="text-danger">*</span>
                      </CFormLabel>
                    )}
                    {/* Show the reconfirm password field only when not in edit mode */}
                    {showPasswordFields && (
                      <>
                        <input
                          type="password"
                          name="reconfirm_password"
                          value={initialValues.reconfirm_password ?? ''}
                          className="form-control"
                          placeholder="Reconfirm your password here"
                          onChange={handleOnChange}
                        />
                        {reconfirmPasswordError && (
                          <div className="text-danger">{reconfirmPasswordError}</div>
                        )}
                      </>
                    )}
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
                        <label className="form-check-label radioBtn_name">Male</label>
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

                        <label className="form-check-label radioBtn_name">Female</label>
                      </label>
                    </div>
                  </div>

                  <div className="mb-3">
                    <CFormLabel>
                      Address<span className="text-danger">*</span>
                    </CFormLabel>
                    <textarea
                      type="text"
                      name="address"
                      value={initialValues.address ?? ''}
                      className="form-control"
                      placeholder="Enter your address here"
                      onChange={handleOnChange}
                    />
                  </div>
                  <div className="mb-3">
                    <CFormLabel>Description</CFormLabel>
                    <textarea
                      type="text"
                      name="description" // onClick={handleSubmitBtn}
                      value={initialValues.description ?? ''}
                      className="form-control"
                      placeholder="Enter your description here"
                      onChange={handleOnChange}
                    />
                  </div>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol md={6}>
              <CCard>
                <CCardHeader>Profile details</CCardHeader>
                <CCardBody>
                  <div className="mb-3">
                    <CFormLabel>Profile</CFormLabel>
                    <CFormInput
                      id="image"
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={(e) => {
                        const file = ImageHelper(e, 'previewImage')
                        setInitialValues({ ...initialValues, featured_image: file[0] })
                      }}
                    />

                    <ImagePreview
                      file={initialValues.featured_image}
                      isEdit={isEditMode}
                      onDelete={() => {
                        fileInputRef.current.value = ''
                        setInitialValues({ ...initialValues, featured_image: null })
                      }}
                    />
                  </div>
                  <div className="mb-3 d-flex align-items-center">
                    <CFormLabel className="me-3">Vendor Status</CFormLabel>
                    <div className="form-check form-check-inline activeBtn">
                      <label className="form-check-label">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="status"
                          value="active"
                          checked={initialValues.status === 'active'}
                          defaultChecked
                          onChange={(e) =>
                            setInitialValues({ ...initialValues, status: e.target.value })
                          }
                        />
                        <label className="form-check-label radioBtn_name">Active</label>
                      </label>
                    </div>
                    <div className="form-check form-check-inline inactiveBtn ">
                      <label className="form-check-label">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="status"
                          value="inactive"
                          checked={initialValues.status === 'inactive'}
                          onChange={(e) =>
                            setInitialValues({ ...initialValues, status: e.target.value })
                          }
                        />
                        <label className="form-check-label radioBtn_name">Inactive</label>
                      </label>
                    </div>
                    <div className="form-check form-check-inline blacklistBtn">
                      <label className="form-check-label">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="status"
                          value="blacklist"
                          checked={initialValues.status === 'blacklist'}
                          onChange={(e) =>
                            setInitialValues({ ...initialValues, status: e.target.value })
                          }
                        />

                        <label className="form-check-label radioBtn_name">Blacklist</label>
                      </label>
                    </div>
                  </div>
                </CCardBody>
                <CCardFooter>
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
                      className="btn btn-secondary me-2 mt-2"
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
                      setInitialValues({
                        name: '',
                        email: '',
                        mobile: '',
                        moble_alt: '',
                        company_name: '',
                        featured_image: '',
                        password: '',
                        gender: 'male',
                        description: '',
                        role: '',
                      })
                      navigate('/vendor/all')
                    }}
                  >
                    Cancel
                  </CButton>
                </CCardFooter>
              </CCard>
            </CCol>
          </CRow>
        </CForm>
      </CContainer>
    </>
  )
}
