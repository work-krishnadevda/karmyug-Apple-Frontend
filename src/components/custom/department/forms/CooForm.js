import React, { useEffect, useRef, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import Select from 'react-select'
import AsyncSelect from 'react-select/async'

import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CInputGroup,
  CRow,
  CSpinner,
} from '@coreui/react'


import AppFormSelect from 'src/components/form/AppFormSelect'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import BasicProvider from 'src/constants/BasicProvider'
import handleSubmitHelper from 'src/helpers/submitHelper'
import COO_Attechement from '../roles/coo/cooAttechement'

const productTypeOptions = [
  { label: 'Product Type', value: '' },
  { label: 'HL', value: 'hl' },
  { label: 'LAP', value: 'lap' },
  { label: 'NPA', value: 'npa' },
  { label: 'APF', value: 'apf' },
  { label: 'Estimate', value: 'estimate' },
  { label: 'OTHER', value: 'other' },
]

const themedSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    minHeight: 38,
    borderColor: state.isFocused ? '#044f45' : '#ced4da',
    boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(4, 79, 69, 0.14)' : 'none',
    '&:hover': {
      borderColor: '#044f45',
    },
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#066054' : state.isFocused ? '#eaf5f2' : '#ffffff',
    color: state.isSelected ? '#ffffff' : '#16342f',
    cursor: 'pointer',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#495057',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#16342f',
  }),
  indicatorSeparator: (provided) => ({
    ...provided,
    backgroundColor: '#d7dee4',
  }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    color: state.isFocused ? '#044f45' : '#6c757d',
    '&:hover': {
      color: '#044f45',
    },
  }),
}

const CooForm = ({
  initialValues,
  setInitialValues,
  handleSubmit,
  additionalFields,
  isLoading,
  setAdditionalFields,
  additionalJson,
  setAdditionalJson,
  showCaseData,
}) => {
  var params = useParams()
  var dispatch = useDispatch()
  const navigate = useNavigate()
  const id = params.id
  const isEditMode = !!id

  const [defaultOptionsFinanceName, setDefaultOptionsFinanceName] = useState([])
  const [defaultOptionsFinanceNameChild, setDefaultOptionsFinanceNameChild] = useState([])

  const [defaultOptionsRaBranch, setDefaultOptionsRaBranch] = useState([])
  const [defaultOptionsCaseType, setefaultOptionsCaseType] = useState([])

  const [defaultOptionsGroup, setDefaultOptionsGroup] = useState([])

  const [defaultOptionsEngList, setDefaultOptionsEngList] = useState([])

  const [perentFinanceId, setPerentFinanceId] = useState(null)

  const [isEngineerList, setIsEngineerList] = useState(false)

  const [allButtonNavigation, setAllButtonNavigation] = useState('0')

  let loggedinUserRole = useSelector((state) => state?.userRole)

  let [isCOOFiles, setIsCOOFiles] = useState(false)

  const [fileIds, setFileIds] = useState([])

  const isAssignedToEngineer = (value) => value === '1' || value === 1 || value === true

  useEffect(() => {
    if (process.env.REACT_APP_COO == loggedinUserRole.name) {
      setAllButtonNavigation('0')
    } else if (process.env.REACT_APP_SDM == loggedinUserRole.name) {
      setAllButtonNavigation('1')
    } else if (process.env.REACT_APP_DM == loggedinUserRole.name) {
      setAllButtonNavigation('2')
    } else if (process.env.REACT_APP_RC == loggedinUserRole.name) {
      setAllButtonNavigation('3')
    } else if (process.env.REACT_APP_LCTO == loggedinUserRole.name) {
      setAllButtonNavigation('4')
    } else if (process.env.REACT_APP_CTO == loggedinUserRole.name) {
      setAllButtonNavigation('5')
    } else if (
      process.env.REACT_APP_CTO == loggedinUserRole.name ||
      process.env.REACT_APP_RA == loggedinUserRole.name ||
      process.env.REACT_APP_SFO == loggedinUserRole.name
    ) {
      setAllButtonNavigation('6')
    }
  }, [loggedinUserRole, id])

  const handleOnChange = (e) => {
    const { name, value } = e.target
    setInitialValues({ ...initialValues, [name]: value })
  }

  const handleContactNumberChange = (value, contactNumberField) => {
    const sanitizedValue = value.replace(/\D/g, '')
    setInitialValues({ ...initialValues, [contactNumberField]: sanitizedValue })
  }

  const loadOptionsFinanceName = async (inputValue, callback) => {
    try {
      const response = await new BasicProvider(
        `cms/categories/search-perent/finance_type?search=${inputValue}&count=20`,
      ).getRequest()
      const options = response.data.data.map((role) => ({
        label: role.name,
        value: role._id,
      }))
      callback(options)
    } catch (error) {
      console.error(error)
    }
  }

  const loadOptionsFinanceNameChild = async (inputValue, callback) => {
    try {
      const response = await new BasicProvider(
        `banks/getby-type/${perentFinanceId}?search=${inputValue}&&count=100`,
      ).getRequest()
      const options = response.data.data.map((role) => ({
        label: role.name,
        value: role._id,
      }))
      callback(options)
    } catch (error) {
      console.error(error)
    }
  }

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

  useEffect(() => {
    fetchDefaultOptionsFinanceName()
    fetchDefaultOptionsRabranch()
    fetchDefaultOptionsCaseType()
    if (perentFinanceId || initialValues.finance_name_perent) {
      fetchDefaultOptionsFinanceNameChild()
    }
  }, [navigate, perentFinanceId, initialValues.finance_name_perent])

  const fetchDefaultOptionsFinanceName = async () => {
    try {
      const response = await new BasicProvider(
        'cms/categories/get-first-parent/finance_type',
      ).getRequest()

      const options = response?.data?.data?.map((finance) => ({
        label: finance.name,
        value: finance._id,
      }))

      setDefaultOptionsFinanceName(options)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchDefaultOptionsFinanceNameChild = async () => {
    try {
      const response = await new BasicProvider(
        `banks/getby-type/${
          initialValues.finance_name_perent._id || initialValues.finance_name_perent
        }?pagination=false`,
      ).getRequest()

      const options = response.data?.map((finance) => ({
        label: finance.name,
        value: finance._id,
      }))

      setDefaultOptionsFinanceNameChild(options)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchDefaultOptionsRabranch = async () => {
    try {
      const response = await new BasicProvider('ra_branch').getRequest()
      const options = response.data.data.map((branch) => ({
        label: branch.name,
        value: branch._id,
      }))

      setDefaultOptionsRaBranch(options)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchDefaultOptionsCaseType = async () => {
    try {
      const response = await new BasicProvider('cms/categories/tree/case types').getRequest()
      const options = response.data.data.map((type) => ({
        label: type.name,
        value: type._id,
      }))

      setefaultOptionsCaseType(options)
    } catch (error) {
      console.error(error)
    }
  }

  const loadOptionsGroup = async (inputValue, callback) => {
    try {
      const response = await new BasicProvider(
        `cms/categories/search-perent/group?page=1&count=10&search=${inputValue}`,
      ).getRequest()

      const options = response.data.data.map((group) => ({
        label: group.name,
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
      const response = await new BasicProvider(
        'cms/categories/get-first-parent/group?page=1&count=1000',
      ).getRequest()
      const options = response.data.data.map((group) => ({
        label: group.name,
        value: group._id,
      }))

      setDefaultOptionsGroup(options)
    } catch (error) {
      console.error(error)
    }
  }

  const loadOptionsEngList = async (inputValue, callback) => {
    try {
      let slugs = [process.env.REACT_APP_FE]
      const queryString = slugs.join(',')
      const response = await new BasicProvider(
        `admins/get-multiple?slugs=${encodeURIComponent(queryString)}&search=${inputValue}`,
      ).getRequest()

      const options = response.data.map((group) => ({
        label: group.name,
        value: group._id,
      }))
      callback(options)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    handleDefaultOptionsEngList()
  }, [])

  const handleDefaultOptionsEngList = async () => {
    try {
      let slugs = [process.env.REACT_APP_FE]
      const queryString = slugs.join(',')
      const url = `admins/get-multiple?slugs=${encodeURIComponent(queryString)}`

      const response = await new BasicProvider(url).getRequest()
      const options = response.data.map((eng) => ({
        label: eng.name,
        value: eng._id,
      }))
      setDefaultOptionsEngList(options)
    } catch (error) {
      console.error(error)
    }
  }

  const handleEngineerListChange = (selectedOptions) => {
    const engineerList = selectedOptions.map((option) => option.value)
    setInitialValues((prevState) => ({
      ...prevState,
      engineers: engineerList,
      group: '',
    }))
  }

  const renderField = (field) => {
    const fieldName = field.key
    const role = field?.role

    const additionalJsonArray = Array.isArray(additionalJson) ? additionalJson : []
    const objectIndex = additionalJsonArray.findIndex((obj) => obj.role === role)
    const fieldValue = objectIndex >= 0 ? additionalJsonArray[objectIndex][fieldName] : ''

    const updateFieldValue = (key, value) => {
      setAdditionalJson((prevFormData) => {
        const prevFormDataArray = Array.isArray(prevFormData) ? prevFormData : []

        const newFormData = [...prevFormDataArray]

        if (objectIndex >= 0) {
          newFormData[objectIndex] = {
            ...newFormData[objectIndex],
            [key]: value,
          }
        } else {
          newFormData.push({
            role: role,
            [key]: value,
          })
        }
        return newFormData
      })
    }

    switch (field.type) {
      case 'text':
        return (
          <CFormInput
            type="text"
            name={fieldName}
            autoComplete="off"
            value={fieldValue}
            onChange={(e) => updateFieldValue(fieldName, e.target.value)}
          />
        )
      case 'select':
        return (
          <AppFormSelect
            name={fieldName}
            value={fieldValue}
            onChange={(e) => updateFieldValue(fieldName, e.target.value)}
          >
            {field?.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </AppFormSelect>
        )
      default:
        return null
    }
  }

  return (
    <>
      <CForm className="g-3 needs-validation mb-3 coo-form" onSubmit={(e) => handleSubmit(e)}>
        <CRow className="form-input-block">
          <CCol>
            <CCard>
              <CCardHeader>
                Main Details Of Case
                <span className="card-header-details">
                  {initialValues.cin_number && <>(CIN Number: {initialValues.cin_number})</>}
                </span>
              </CCardHeader>
              <CCardBody>
                <CRow>
                  <CCol md={3}>
                    <div className="">
                      <CFormLabel>
                        Date Of Initiation By Bank<span className="text-danger">*</span>
                      </CFormLabel>

                      <DatePicker
                        showMonthDropdown
                        showYearDropdown
                        selected={
                          initialValues?.date_initiation_bank
                            ? new Date(initialValues?.date_initiation_bank)
                            : new Date()
                        }
                        name="date_initiation_bank"
                        onChange={(date) =>
                          setInitialValues({ ...initialValues, date_initiation_bank: date })
                        }
                        // dateFormat="d-MM-yyyy"
                        dateFormat="dd-MMM-yyyy"
                        className="form-control full mb-3"
                      />
                    </div>
                  </CCol>

                  <CCol md={3}>
                    <div className="">
                      <CFormLabel>
                        Date Of Initiation By ValuXpert<span className="text-danger">*</span>
                      </CFormLabel>
                      <DatePicker
                        // id="publishDate"
                        showMonthDropdown
                        showYearDropdownv
                        selected={
                          initialValues?.date_initiation_RA
                            ? new Date(initialValues?.date_initiation_RA)
                            : new Date()
                        }
                        name="date_initiation_bank"
                        onChange={(date) =>
                          setInitialValues({ ...initialValues, date_initiation_RA: date })
                        }
                        // dateFormat="d-MM-yyyy"
                        dateFormat="dd-MMM-yyyy"
                        minDate={new Date(initialValues.date_initiation_bank)}
                        className="form-control full mb-3"
                      />
                    </div>
                  </CCol>

                  <CCol md={3}>
                    <div className="mb-3">
                      <CFormLabel>
                        Finance Name (Parent)<span className="text-danger">*</span>
                      </CFormLabel>

                      <AsyncSelect
                        name="finance_name_perent"
                        loadOptions={(inputValue, callback) =>
                          loadOptionsFinanceName(inputValue, callback)
                        }
                        defaultOptions={defaultOptionsFinanceName}
                        value={
                          defaultOptionsFinanceName.find(
                            (option) =>
                              option.value ===
                              (initialValues?.finance_name_perent?._id ||
                                initialValues.finance_name_perent),
                          ) || null
                        }
                        getOptionLabel={(option) => option.label}
                        getOptionValue={(option) => option.value}
                        onChange={(selected) => {
                          setInitialValues({
                            ...initialValues,
                            finance_name_perent: selected.value,
                          })
                          setPerentFinanceId(selected.value)
                        }}
                      />
                    </div>
                  </CCol>
                  <CCol md={3}>
                    <div className="mb-3">
                      <CFormLabel>
                        Finance Name<span className="text-danger">*</span>
                      </CFormLabel>

                      <AsyncSelect
                        name="finance_name"
                        loadOptions={(inputValue, callback) =>
                          loadOptionsFinanceNameChild(inputValue, callback)
                        }
                        defaultOptions={defaultOptionsFinanceNameChild}
                        value={
                          defaultOptionsFinanceNameChild.find(
                            (option) =>
                              option.value ===
                              (initialValues?.finance_name?._id || initialValues.finance_name),
                          ) || null
                        }
                        getOptionLabel={(option) => option.label}
                        getOptionValue={(option) => option.value}
                        onChange={(selected) =>
                          setInitialValues({ ...initialValues, finance_name: selected.value })
                        }
                      />
                    </div>
                  </CCol>
                </CRow>

                <CRow>
                  <CCol md={3}>
                    <CFormLabel>
                      Applicant Name<span className="text-danger">*</span>
                    </CFormLabel>
                    <CInputGroup className="has-validation">
                      <input
                        type="text"
                        name="applicant_name"
                        value={initialValues.applicant_name ?? ''}
                        className="form-control text-uppercase"
                        placeholder="Enter applicant name"
                        onChange={(e) => {
                          const { name, value } = e.target
                          const uppercaseValue = value.toUpperCase()
                          setInitialValues((prevValues) => ({
                            ...prevValues,
                            [name]: value,
                          }))
                        }}
                        autoComplete="off"
                      />
                    </CInputGroup>
                  </CCol>

                  <CCol md={3}>
                    <div className="mb-3">
                      <CFormLabel>
                        LOS NO.<span className="text-danger">*</span>
                      </CFormLabel>
                      <input
                        type="text"
                        name="los_number"
                        value={initialValues.los_number ?? ''}
                        className="form-control"
                        placeholder="Enter LOS NO."
                        onChange={handleOnChange}
                        autoComplete="off"
                      />
                    </div>
                  </CCol>

                  <CCol md={3}>
                    <div className="mb-3">
                      <CFormLabel>
                        Contact Number 1<span className="text-danger">*</span>
                      </CFormLabel>
                      <input
                        type="number"
                        name="contact_number_1"
                        value={initialValues.contact_number_1 ?? ''}
                        className="form-control"
                        placeholder="Enter contact here"
                        onChange={(e) => {
                          const input = e.target.value
                          const regex = /^[0-9\b]+$/
                          if (input === '' || regex.test(input)) {
                            handleContactNumberChange(input.slice(0, 10), 'contact_number_1')
                          }
                        }}
                        maxLength={10}
                        autoComplete="off"
                      />
                    </div>
                  </CCol>

                  <CCol md={3}>
                    <div className="mb-3">
                      <CFormLabel>Contact Number 2</CFormLabel>
                      <input
                        type="number"
                        name="contact_number_2"
                        value={initialValues.contact_number_2 ?? ''}
                        className="form-control"
                        placeholder="Enter contact here"
                        onChange={(e) => {
                          const input = e.target.value
                          const regex = /^[0-9\b]+$/ // Regex to allow only numbers
                          if (input === '' || regex.test(input)) {
                            handleContactNumberChange(input.slice(0, 10), 'contact_number_2')
                          }
                        }}
                        maxLength={10}
                        autoComplete="off"
                      />
                    </div>
                  </CCol>
                </CRow>

                <CRow>
                  <CCol md={3}>
                    <div className="mb-3">
                      <CFormLabel>Contact Number 3</CFormLabel>
                      <input
                        type="number"
                        name="contact_number_3"
                        value={initialValues.contact_number_3 ?? ''}
                        className="form-control"
                        placeholder="Enter contact here 3"
                        onChange={(e) => {
                          const input = e.target.value
                          const regex = /^[0-9\b]+$/
                          if (input === '' || regex.test(input)) {
                            handleContactNumberChange(input.slice(0, 10), 'contact_number_3')
                          }
                        }}
                        maxLength={10}
                        autoComplete="off"
                      />
                    </div>
                  </CCol>

                  <CCol md={9}>
                    <div className="mb-3">
                      <CFormLabel>
                        Visit Address<span className="text-danger">*</span>
                      </CFormLabel>
                      <textarea
                        type="text"
                        name="address"
                        value={initialValues.address ?? ''}
                        className="form-control"
                        placeholder="Enter address here"
                        onChange={handleOnChange}
                        autoComplete="off"
                      />
                    </div>
                  </CCol>

                  <CCol md={5}>
                    <div className="mb-3">
                      <CFormLabel>
                        City Or Village Name(Nero Location)<span className="text-danger">*</span>
                      </CFormLabel>
                      <input
                        type="text"
                        name="location"
                        value={initialValues.location ?? ''}
                        className="form-control"
                        placeholder="Enter here"
                        onChange={handleOnChange}
                        rows={2}
                        autoComplete="off"
                      />
                    </div>
                  </CCol>

                  <CCol md={3}>
                    <div className="">
                      <CFormLabel>
                        Product Name<span className="text-danger">*</span>
                      </CFormLabel>
                      <CInputGroup className="has-validation">
                        <input
                          type="text"
                          name="product_name"
                          value={initialValues.product_name ?? ''}
                          className="form-control text-uppercase"
                          placeholder="Enter product Name"
                          // onChange={handleOnChange}
                          onChange={(e) => {
                            const { name, value } = e.target
                            setInitialValues((prevValues) => ({
                              ...prevValues,
                              [name]: value,
                            }))
                          }}
                          autoComplete="off"
                        />
                      </CInputGroup>
                    </div>
                  </CCol>

                  <CCol md={2}>
                    <div className="mb-3">
                      <CFormLabel>
                        Product Type <span className="text-danger">*</span>
                      </CFormLabel>
                      <Select
                        aria-label="Product Type"
                        name="product_type"
                        options={productTypeOptions}
                        value={
                          productTypeOptions.find(
                            (option) =>
                              option.value ===
                              (initialValues?.product_type
                                ? initialValues.product_type.toLowerCase()
                                : ''),
                          ) || productTypeOptions[0]
                        }
                        styles={themedSelectStyles}
                        onChange={(selectedOption) =>
                          setInitialValues({
                            ...initialValues,
                            product_type: selectedOption?.value || '',
                          })
                        }
                      />
                    </div>
                  </CCol>

                  <CCol md={2}>
                    <div className="mb-3">
                      <CFormLabel>
                        Case Type<span className="text-danger">*</span>
                      </CFormLabel>
                      <AppFormSelect
                        aria-label="Case Type"
                        name="case_type"
                        options={[
                          'Case Type',
                          { label: 'Fresh', value: 'fresh' },
                          { label: 'Subsequent', value: 'subsequent' },
                        ]}
                        value={initialValues?.case_type && initialValues?.case_type?.toLowerCase()}
                        // className="form-control"
                        onChange={handleOnChange}
                      />
                    </div>
                  </CCol>

                  <CCol md={4}>
                    <div className="mb-3">
                      <CFormLabel>
                        MA Branch <span className="text-danger">*</span>
                      </CFormLabel>

                      {/* {console.log(initialValues)} */}

                      <AsyncSelect
                        name="ra_branch"
                        loadOptions={(inputValue, callback) =>
                          loadOptionsRaBranch(inputValue, callback)
                        }
                        defaultOptions={defaultOptionsRaBranch}
                        value={
                          defaultOptionsRaBranch.find(
                            (option) =>
                              option.value ===
                              (initialValues?.ra_branch?._id || initialValues?.ra_branch),
                          ) || null
                        }
                        getOptionLabel={(option) => option.label}
                        getOptionValue={(option) => option.value}
                        onChange={(selected) =>
                          setInitialValues({ ...initialValues, ra_branch: selected.value })
                        }
                      />
                    </div>
                  </CCol>

                  <CCol md={4}>
                    <div className="mb-1">
                      <CFormLabel>
                        Case Of Branch<span className="text-danger">*</span>
                      </CFormLabel>
                      <CInputGroup className="has-validation">
                        <input
                          type="text"
                          name="case_of_branch"
                          value={initialValues.case_of_branch ?? ''}
                          className="form-control"
                          placeholder="Enter case of branch"
                          autoComplete="off"
                          onChange={handleOnChange}
                        />
                      </CInputGroup>
                    </div>
                  </CCol>

                  <CCol md={4}>
                    <CRow>
                      <CCol md={6}>
                        <div className="mb-3">
                          <CFormLabel>Latitude</CFormLabel>
                          <CInputGroup className="has-validation">
                            <input
                              type="text"
                              name="latitude"
                              value={initialValues.latitude ?? ''}
                              className="form-control"
                              placeholder="Enter latitude"
                              onChange={handleOnChange}
                              autoComplete="off"
                            />
                          </CInputGroup>
                        </div>
                      </CCol>
                      <CCol md={6}>
                        <div className="mb-3">
                          <CFormLabel>Longitude</CFormLabel>
                          <CInputGroup className="has-validation">
                            <input
                              type="text"
                              name="longitude"
                              value={initialValues.longitude ?? ''}
                              className="form-control"
                              placeholder="Enter longitude"
                              onChange={handleOnChange}
                              autoComplete="off"
                            />
                          </CInputGroup>
                        </div>
                      </CCol>
                    </CRow>
                  </CCol>
                </CRow>
                <CRow>
                  <CCol md={3}>
                    <CFormLabel>Remark</CFormLabel>
                    <CInputGroup className="has-validation">
                      <input
                        type="text"
                        name="remark"
                        value={initialValues.remark ?? ''}
                        className="form-control"
                        placeholder="Enter remark"
                        onChange={handleOnChange}
                        autoComplete="off"
                      />
                    </CInputGroup>
                  </CCol>
                </CRow>
                <div className="">
                  <CFormCheck
                    type="checkbox"
                    label={'Upload Files ?'}
                    className="credit ps-0"
                    checked={initialValues.is_coo_files === '1'}
                    onChange={() => {
                      setInitialValues({
                        ...initialValues,
                        is_coo_files: initialValues.is_coo_files === '1' ? '0' : '1',
                      })
                    }}
                  />
                </div>

                {initialValues.is_coo_files == '1' && (
                  <div className="mt-2">
                    <COO_Attechement setFileIds={setFileIds} />
                  </div>
                )}

                {(loggedinUserRole.name === process.env.REACT_APP_COO ||
                  loggedinUserRole.name === process.env.REACT_APP_ADMIN ||
                  loggedinUserRole.name === process.env.REACT_APP_RA ||
                  loggedinUserRole.name === process.env.REACT_APP_SFO) &&
                  (showCaseData?.status === 'concern by fe' ||
                    showCaseData?.status === 'updated by coo' ||
                    showCaseData?.status === 'updated by admin' ||
                    showCaseData?.status === 'updated by bm' ||
                    showCaseData?.status === 'updated by sfo') && (
                    <CRow>
                      <CCol md={6}>
                        <div className="py-2">
                          <CFormLabel>Concern Resolution </CFormLabel>
                          <CFormTextarea
                            type="text"
                            name="concern_resolution"
                            value={initialValues?.concern_resolution ?? ''}
                            onChange={handleOnChange}
                            placeholder="Concern Resolution"
                            rows={4}
                            autoComplete="off"
                          />
                        </div>
                      </CCol>
                    </CRow>
                  )}

                {additionalFields &&
                  additionalFields.filter((item) => item.role === 'COO').length > 0 && (
                    <>
                      <hr />
                      <CRow>
                        <CCol>
                          <h5 className="mt-3">Additional Fields</h5>

                          <CRow className="mt-4">
                            {additionalFields &&
                              additionalFields
                                .filter((item) => item.role === 'COO')
                                .map((field, index) => (
                                  <CCol md={3} key={index}>
                                    <div className="mb-3">
                                      <CFormLabel>{field.key}</CFormLabel>
                                      {renderField(field, index)}
                                    </div>
                                  </CCol>
                                ))}
                          </CRow>
                        </CCol>
                      </CRow>
                    </>
                  )}

                {(loggedinUserRole.name === process.env.REACT_APP_COO ||
                  loggedinUserRole.name === process.env.REACT_APP_ADMIN) && (
                  <CRow>
                    <hr />
                    <CCol md={6}>
                      <div className="mt-3">
                        <CFormCheck
                          type="checkbox"
                          label={'Assign to Engineer!'}
                          disabled={showCaseData?.status !== 'pending for accept' && isEditMode}
                          name="to_engineer"
                          className="credit ps-0"
                          checked={isAssignedToEngineer(initialValues.to_engineer)}
                          onChange={() => {
                            setInitialValues((prev) => ({
                              ...prev,
                              to_engineer: isAssignedToEngineer(prev.to_engineer) ? '0' : '1',
                              group: '',
                              engineers: [],
                            }))
                          }}
                        />
                      </div>
                    </CCol>

                    <CCol md={6}>
                      {isAssignedToEngineer(initialValues.to_engineer) ? (
                        <div className="mb-3">
                          <CFormLabel>
                            Engineers List <span className="text-danger">*</span>
                          </CFormLabel>

                          <AsyncSelect
                            name="engineers"
                            loadOptions={(inputValue, callback) =>
                              loadOptionsEngList(inputValue, callback)
                            }
                            defaultOptions={defaultOptionsEngList}
                            value={
                              Array.isArray(initialValues.engineers)
                                ? initialValues.engineers.map((productId) =>
                                    defaultOptionsEngList.find(
                                      (option) => option.value === productId,
                                    ),
                                  )
                                : []
                            }
                            isDisabled={showCaseData?.status !== 'pending for accept' && isEditMode}
                            isMulti
                            getOptionLabel={(option) => option.label}
                            getOptionValue={(option) => option.value}
                            onChange={handleEngineerListChange}
                          />
                        </div>
                      ) : (
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
                              defaultOptionsGroup.find(
                                (option) => option.value === initialValues.group,
                              ) || null
                            }
                            isDisabled={showCaseData?.status !== 'pending for accept' && isEditMode}
                            getOptionLabel={(option) => option.label}
                            getOptionValue={(option) => option.value}
                            onChange={(selected) => {
                              setInitialValues({ ...initialValues, group: selected.value })
                              setInitialValues((prev) => ({ ...prev, engineers: [] }))
                            }}
                          />
                        </div>
                      )}
                    </CCol>
                  </CRow>
                )}
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
        <CRow className="mt-4">
          <CCol md={12}>
            <CCard>
              <CCardBody className="text-center">
                {!isEditMode && (
                  <CButton
                    className="btn btn-primary me-2  submit_btn"
                    type="submit"
                    name="buttonClicked"
                    value="submit"
                    disabled={isLoading}
                    onClick={() => {
                      setInitialValues({
                        ...initialValues,
                        additional_fields: additionalJson,
                        status: 'pending for accept',
                        file_ids: fileIds,
                      })
                    }}
                  >
                    {isLoading ? (
                      <>
                        <CSpinner size="sm" className="me-2" />
                        <span>Submit...</span>
                      </>
                    ) : (
                      'Submit'
                    )}
                  </CButton>
                )}

                {isEditMode && (
                  <>
                    <CButton
                      className="btn btn-primary me-2  submit_btn"
                      type="submit"
                      name="buttonClicked"
                      value="submit"
                      disabled={isLoading}
                      onClick={() => {
                        try {
                          setInitialValues({
                            ...initialValues,
                            additional_fields: additionalJson,
                          })

                          if (allButtonNavigation == '1' && isEditMode) {
                            navigate(
                              `/case/${id}/update/ceo-details-show/by/${loggedinUserRole.name}`,
                              {
                                state: { isCOOVisible: false },
                              },
                            )
                          } else if (allButtonNavigation == '2' && isEditMode) {
                            navigate(
                              `/case/${id}/update/ceo-details-show/by/${loggedinUserRole.name}`,
                              {
                                state: { isCOOVisible: false },
                              },
                            )
                          } else if (allButtonNavigation == '3' && isEditMode) {
                            navigate(
                              `/case/${id}/update/ceo-details-show/by/${loggedinUserRole.name}`,
                              {
                                state: { isCOOVisible: false },
                              },
                            )
                          } else if (allButtonNavigation == '4' && isEditMode) {
                            navigate(
                              `/case/${id}/update/ceo-details-show/by/${loggedinUserRole.name}`,
                              {
                                state: { isCOOVisible: false },
                              },
                            )
                          } else if (allButtonNavigation == '5' && isEditMode) {
                            navigate(
                              `/case/${id}/update/ceo-details-show/by/${loggedinUserRole.name}`,
                              {
                                state: { isCOOVisible: false },
                              },
                            )
                          } else if (allButtonNavigation == '6' && isEditMode) {
                            navigate(
                              `/case/${id}/update/ceo-details-show/by/${loggedinUserRole.name}`,
                              {
                                state: { isCOOVisible: false },
                              },
                            )
                          }
                        } catch (error) {
                          console.log('eorrr', error)
                        }
                      }}
                    >
                      {' '}
                      {isLoading ? (
                        <>
                          <CSpinner size="sm" className="me-2" />
                          <span>Updating...</span>
                        </>
                      ) : (
                        'Update'
                      )}
                    </CButton>
                  </>
                )}

                <CButton
                  color="danger"
                  className="text-light"
                  onClick={() => {
                    setInitialValues({})

                    if (allButtonNavigation == '0') {
                      navigate('/case/all')
                    } else {
                      navigate(`/case/${id}/update/ceo-details-show/by/${loggedinUserRole.name}`, {
                        state: { isCOOVisible: false },
                      })
                    }
                  }}
                >
                  Cancel
                </CButton>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CForm>
    </>
  )
}

export default CooForm
