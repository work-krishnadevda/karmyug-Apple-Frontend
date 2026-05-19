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
  CInputGroupAppend,
} from '@coreui/react'


import AppFormSelect from 'src/components/form/AppFormSelect'
import Cookies from 'js-cookie'
import AsyncSelect from 'react-select/async'
import Select from 'react-select'

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

import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const FE = process.env.REACT_APP_FE
const SDM = process.env.REACT_APP_SDM
const RA_BRANCH = process.env.REACT_APP_RA
const SFO = process.env.REACT_APP_SFO
const AC = process.env.REACT_APP_AC

var subHeaderItems = [
  {
    name: 'All admins',
    link: '/admins/all',
    icon: cilSpreadsheet,
  },
  {
    name: 'Create admins',
    link: '/admin/create',
    icon: cilPencil,
  },
  {
    name: 'Trash admins',
    link: '/admins/trash',
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
  address: {
    required: true,
  },
  role: {
    required: true,
  },
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

  const [showFields, setShowFields] = useState({
    group: false,
    ra_branch: false,
  })

  const [handleIsMultiRA, setHandleIsMultiRA] = useState(false)

  const [initialValues, setInitialValues] = useState({
    name: '',
    email: '',
    mobile: '',
    mobile_alt: '',
    reconfirm_password: '',
    company_name: '',
    featured_image: '',
    password: '',
    open_password: '',
    gender: 'male',
    description: '',
    email: '',
    role: [],
    group: [],
    perent: '',
    status: 'active',
    address: '',
    ra_branch: [],
  })

  const [defaultOptions, setDefaultOptions] = useState([])
  const [defaultOptionsRabranch, setDefaultRAbranchOptions] = useState([])
  const [defaultOptionsGroup, setDefaultOptionsGroup] = useState([])

  const [mutualAdmins, setMutualAdmins] = useState([])

  const [currentAdminRole, setCurrentAdminRole] = useState([])
  const [signedUrl, setSignedUrl] = useState(null)

  const [tempPass, setTempPass] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const togglePasswordVisibility = () => setShowPassword(!showPassword)
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword)

  useEffect(() => {
    setInitialValues({
      name: '',
      email: '',
      mobile: '',
      mobile_alt: '',
      reconfirm_password: '',
      company_name: '',
      featured_image: '',
      password: '',
      open_password: '',
      gender: 'male',
      description: '',
      email: '',
      role: [],
      group: [],
      perent: '',
      status: 'active',
      address: '',
      ra_branch: [],
    })
    if (isEditMode) fetchData()

    setShowFields({
      group: false,
      ra_branch: false,
    })
    setHandleIsMultiRA(false)
  }, [navigate, id])

  const fetchData = async () => {
    try {
      const data = await useEffectFormData(`admins/show/${id}`, initialValues, isEditMode)
      if (isEditMode) {
        const roleIds = data.role.map((role) => role._id)
        const groupIds = data.group.map((group) => group._id)
        const raIds = data.ra_branch.map((ra) => ra._id)
        setCurrentAdminRole(roleIds)
        setInitialValues({
          ...data,
          role: roleIds,
          group: groupIds,
          ra_branch: raIds,
        })

        if (data) {
          // if (data.role && data.role[0]?.name === SDM || data.role && data.role[0]?.name === SFO) {
          //   setHandleIsMultiRA(true)
          // }

          if (data.role && data.role.some((role) => role.name === SDM || role.name === SFO)) {
            setHandleIsMultiRA(true)
          }

          if (data.group.length > 0) setShowFields((prev) => ({ ...prev, group: true }))
          if (data.ra_branch.length > 0) setShowFields((prev) => ({ ...prev, ra_branch: true }))
        }

        let response2 = await new BasicProvider(`admins/get-mutual`, dispatch).postRequest({
          id: id,
        })
        setMutualAdmins(response2?.data)
      }
    } catch (error) {
      dispatch({ type: 'set', catcherror: error.data })
    }
  }

  const handleOnChange = (e) => {
    const { name, value } = e.target
    setInitialValues({ ...initialValues, [name]: value })
  }

  useEffect(() => {
    if (mutualAdmins.length > 0) {
      // Extract role IDs from mutualAdmins
      let roleIds = mutualAdmins.map((item) => item.role[0]['_id'])

      // Update initial values to include mutual admin roles
      setInitialValues((prev) => ({
        ...prev,
        role: [...new Set([...prev.role, ...roleIds])], // Use Set to avoid duplicate roles
      }))
    }

    const hasMatchingRole = mutualAdmins.some((user) =>
      user.role.some((role) => role.name === SDM || role.name === SFO),
    )

    setHandleIsMultiRA(hasMatchingRole)

    // if (mutualAdmins.role && mutualAdmins.role.some(role => role.name === SDM || role.name === SFO)) {
    // }
  }, [mutualAdmins])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (isEditMode) {
      initialValues.password = initialValues.open_password
    }

    try {
      const data = await handleSubmitHelper(initialValues, validationRules, dispatch)

      for (var pair of data.entries()) {
      }

      if (data === false) return

      if (initialValues.ra_branch == null) {
        initialValues.ra_branch = []
      }

      if (initialValues.group == null) {
        initialValues.group = []
      }

      var response
      if (isEditMode) {
        response = await new BasicProvider(`admins/update/${id}`, dispatch).patchRequest(data)
      } else {
        response = await new BasicProvider(`admins/create`, dispatch).postRequest(data)
        navigate(`/admin/${response.data._id}/edit`)
      }

      setInitialValues((prev) => ({
        ...prev,
        reconfirm_password: '',
      }))

      initialValues.reconfirm_password = ''
      setAlertTimeout(dispatch)
      fetchData()
      setTempPass('')
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
    setInitialValues({ ...initialValues, mobile_alt: sanitizedValue })
  }

  const handleNameChange = (value) => {
    const sanitizedValue = value.replace(/[^A-Za-z\s]/g, '')
    setInitialValues({ ...initialValues, name: sanitizedValue })
  }

  const loadOptionsRole = async (inputValue, callback) => {
    try {
      const response = await new BasicProvider(
        `roles/search?page=1&count=10&search=${inputValue}`,
      ).getRequest()
      const options = response.data.data.map((role) => ({
        label: role.display_name,
        slug: role.name,
        value: role._id,
      }))
      callback(options)
    } catch (error) {
      console.error(error)
    }
  }

  const loadOptionsRA = async (inputValue, callback) => {
    try {
      const response = await new BasicProvider(
        `roles/search?page=1&count=10&search=${inputValue}`,
      ).getRequest()
      const options = response.data.data.map((item) => ({
        label: item.name,
        slug: item.slug,
        value: item._id,
      }))
      callback(options)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    defaultOptionsRoles()
    defaultOptionRabranch()
  }, [])

  const defaultOptionsRoles = async () => {
    try {
      const response = await new BasicProvider('roles').getRequest()
      const options = response.data.data.map((role) => ({
        label: role.display_name,
        slug: role.name,
        value: role._id,
      }))

      setDefaultOptions(options)
    } catch (error) {
      console.error(error)
    }
  }

  const defaultOptionRabranch = async () => {
    try {
      const response = await new BasicProvider('ra_branch').getRequest()
      const options = response.data.data.map((role) => ({
        label: role.name,
        value: role._id,
      }))

      setDefaultRAbranchOptions(options)
    } catch (error) {
      console.error(error)
    }
  }

  const handleRoleChange = (selectedOptions) => {
    // Extract selected role IDs
    const roleIds = Array.isArray(selectedOptions)
      ? selectedOptions.map((option) => option.value)
      : [selectedOptions.value]

    setInitialValues((prevState) => {
      // Determine roles to be added and removed
      const currentRoleIds = new Set(prevState.role)
      const selectedRoleIds = new Set(roleIds)

      // Find roles to be removed
      const rolesToRemove = [...currentRoleIds].filter((roleId) => !selectedRoleIds.has(roleId))

      // Find roles to be added
      const rolesToAdd = [...selectedRoleIds].filter((roleId) => !currentRoleIds.has(roleId))

      // Update role array by adding and removing roles
      const updatedRoles = [...currentRoleIds].filter((roleId) => !rolesToRemove.includes(roleId))
      updatedRoles.push(...rolesToAdd)

      return {
        ...prevState,
        role: updatedRoles,
      }
    })

    // Handle showing/hiding fields based on selected roles
    const roleSlugs = Array.isArray(selectedOptions)
      ? selectedOptions.map((option) => option.slug)
      : [selectedOptions.slug]

    const showGroupSelection = roleSlugs.includes(FE) || roleSlugs.includes(SDM)
    const showRABranchSelection =
      roleSlugs.includes(RA_BRANCH) || roleSlugs.includes(SDM) || roleSlugs.includes(SFO)

    const ifRA = roleSlugs.includes(RA_BRANCH)

    setHandleIsMultiRA(!ifRA) || roleSlugs.includes(SDM)
    setShowFields({
      ra_branch: showRABranchSelection,
      group: showGroupSelection,
    })
  }

  const loadOptionsGroup = async (inputValue, callback) => {
    try {
      const response = await new BasicProvider(
        `cms/categories/search?page=1&count=10&search=${inputValue}`,
      ).getRequest()

      const options = response.data.data.map((group) => ({
        label: group.display_name,
        value: group._id,
      }))
      callback(options)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    handleDefaultOptionsGroup()
  }, [])

  const handleDefaultOptionsGroup = async () => {
    try {
      const response = await new BasicProvider('cms/categories/tree/group').getRequest()
      const options = response.data.data.map((group) => ({
        label: group.name,
        value: group._id,
        slug: group.slug,
      }))

      setDefaultOptionsGroup(options)
    } catch (error) {
      console.error(error)
    }
  }

  const handleGroupChange = (selectedOptions) => {
    const GroupIds = selectedOptions.map((option) => option.value)
    setInitialValues((prevState) => ({
      ...prevState,
      group: GroupIds,
    }))
  }

  const handleRA_Change = (selectedOptions) => {
    let raIds = []

    if (Array.isArray(selectedOptions)) {
      raIds = selectedOptions.map((option) => option.value)
    } else if (selectedOptions && selectedOptions.value) {
      raIds.push(selectedOptions.value)
    }

    setInitialValues((prevState) => ({
      ...prevState,
      ra_branch: raIds,
    }))
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      // 1. Upload file to backend
      const formData = new FormData()
      formData.append('gallery', file)
      const response = await new BasicProvider('cms/files/create', dispatch).postRequest(formData)

      if (response && response.data[0]) {
        const uploadedFile = response.data[0]

        // 2. Fetch signed URL
        const urlResponse = await new BasicProvider(
          `cms/files/signed-url?key=${uploadedFile.filepath}`,
          dispatch,
        ).getRequest()

        const url = urlResponse.data.url

        // 3. Save in state

        setInitialValues({ ...initialValues, featured_image: uploadedFile })
        setSignedUrl(url)
      }
    } catch (error) {
      console.error('Error uploading profile image:', error)
    }
  }

  return (
    <>
      <SubHeader subHeaderItems={subHeaderItems} />
      <CContainer fluid>
        <CForm className="g-3 needs-validation mb-4" onSubmit={handleSubmit}>
          <CRow>
            <CCol md={6}>
              <CCard>
                <CCardHeader>Add admins </CCardHeader>
                <CCardBody>
                  <CFormLabel>
                    Name<span className="text-danger">*</span>
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
                      name="mobile_alt"
                      value={initialValues.mobile_alt ?? ''}
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
                    <CFormLabel>
                      Password<span className="text-danger">*</span>
                    </CFormLabel>

                    <CInputGroup className="has-validation">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={isEditMode ? initialValues.open_password : initialValues.password}
                        className="form-control"
                        placeholder="Enter your password here"
                        onChange={(e) => {
                          if (isEditMode) {
                            // setTempPass(e.target.value)
                            setInitialValues((prev) => ({
                              ...prev,
                              open_password: e.target.value,
                            }))
                          } else {
                            setInitialValues((prev) => ({
                              ...prev,
                              password: e.target.value,
                            }))
                          }
                        }}
                      />
                      <div className="input-group-append">
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={togglePasswordVisibility}
                        >
                          <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                        </button>
                      </div>
                    </CInputGroup>
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
                      name="description"
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
                      onChange={handleFileUpload}
                    />
                    <ImagePreview
                      file={signedUrl}
                      isEdit={isEditMode}
                      onDelete={() => {
                        fileInputRef.current.value = ''
                        setInitialValues({ ...initialValues, featured_image: null })
                        setSignedUrl(null)
                      }}
                    />
                  </div>

                  <div className="mb-4 mt-4 d-flex flex-column flex-sm-row ">
                    <CFormLabel className="me-3 mb-3 mb-sm-0">Admins Status</CFormLabel>
                    <div className="d-flex flex-wrap align-items-center ">
                      <div className="form-check form-check-inline activeBtn custom-forms me-3">
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
                      <div className="form-check form-check-inline inactiveBtn custom-forms me-3">
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
                      <div className="form-check form-check-inline blacklistBtn custom-forms">
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
                  </div>

                  <div className="mb-3">
                    <CFormLabel>
                      Select Role<span className="text-danger">*</span>
                    </CFormLabel>
                    <AsyncSelect
                      name="role"
                      isMulti
                      loadOptions={(inputValue, callback) => loadOptionsRole(inputValue, callback)}
                      defaultOptions={defaultOptions}
                      value={
                        Array.isArray(initialValues.role)
                          ? initialValues.role.map((productId) =>
                              defaultOptions.find((option) => option.value === productId),
                            )
                          : []
                      }
                      getOptionLabel={(option) => option.label}
                      getOptionValue={(option) => option.value}
                      onChange={handleRoleChange}
                    />
                  </div>

                  {showFields.ra_branch && (
                    <div className="mb-3">
                      <CFormLabel>
                        RA Barnch Name<span className="text-danger">*</span>
                      </CFormLabel>
                      <AsyncSelect
                        name="ra_branch"
                        loadOptions={(inputValue, callback) => loadOptionsRA(inputValue, callback)}
                        defaultOptions={defaultOptionsRabranch}
                        value={
                          Array.isArray(initialValues.ra_branch)
                            ? initialValues.ra_branch.map((item) =>
                                defaultOptionsRabranch.find(
                                  // isEditMode
                                  //   ? (option) => option.value === item._id
                                  //   : (option) => option.value === item,
                                  (option) => option.value === item,
                                ),
                              )
                            : []
                        }
                        isMulti={handleIsMultiRA}
                        getOptionLabel={(option) => option.label}
                        getOptionValue={(option) => option.value}
                        onChange={handleRA_Change}
                      />
                    </div>
                  )}

                  {showFields.group && (
                    <div className="mb-3">
                      <CFormLabel>
                        Select Group<span className="text-danger">*</span>
                      </CFormLabel>
                      <AsyncSelect
                        name="group"
                        loadOptions={(inputValue, callback) =>
                          loadOptionsGroup(inputValue, callback)
                        }
                        defaultOptions={defaultOptionsGroup}
                        value={
                          Array.isArray(initialValues.group)
                            ? initialValues.group.map((item) =>
                                defaultOptionsGroup.find((option) => option.value === item),
                              )
                            : []
                        }
                        isMulti
                        getOptionLabel={(option) => option.label}
                        getOptionValue={(option) => option.value}
                        onChange={handleGroupChange}
                      />
                    </div>
                  )}
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
                        mobile_alt: '',
                        company_name: '',
                        featured_image: '',
                        password: '',
                        gender: 'male',
                        description: '',
                        role: '',
                        perent: '',
                        status: '',
                      })
                      navigate('/admins/all')
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
