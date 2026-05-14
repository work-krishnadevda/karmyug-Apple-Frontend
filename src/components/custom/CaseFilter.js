import {
  CButton,
  CCol,
  CForm,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CRow,
} from '@coreui/react'
import { useEffect, useState } from 'react'
import BasicProvider from 'src/constants/BasicProvider'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

import AsyncSelect from 'react-select/async'
import Select from 'react-select'
import { useSelector } from 'react-redux'
import { checkRole } from 'src/constants/common'

const CaseFilter = ({ rowPerPage, filterData, setFilterData, onFilter, onReset }) => {
  const admin = useSelector((state) => state.userData)

  const [initialvalue, setInitialvalue] = useState({
    search_input: '',
    applicant_name: '',
    case_of_branch: '',
    ra_branch: '',
    finance_name: '',
    date_from: '',
    date_to: '',
    status: [],
    group_id: '',
    user_id: '',
    order: '',
    case_revise: '0',
    visit_type_by_fe: '',
  })

  let isAdmin = checkRole(process.env.REACT_APP_ADMIN, admin)
  let isCOO = checkRole(process.env.REACT_APP_COO, admin)
  let isFE = checkRole(process.env.REACT_APP_FE, admin)
  let isSDM = checkRole(process.env.REACT_APP_SDM, admin)
  let isRA = checkRole(process.env.REACT_APP_RA, admin)
  let isDM = checkRole(process.env.REACT_APP_DM, admin)
  let isRC = checkRole(process.env.REACT_APP_RC, admin)
  let isLCTO = checkRole(process.env.REACT_APP_LCTO, admin)
  let isCTO = checkRole(process.env.REACT_APP_CTO, admin)
  let isSFO = checkRole(process.env.REACT_APP_SFO, admin)
  let isAC = checkRole(process.env.REACT_APP_AC, admin)

  const [rabranchData, setRAbranchData] = useState()
  const [financenameData, setFinancenameData] = useState()
  const [groupData, setgroupData] = useState()
  const [userData, setUserData] = useState()

  let loggedinUserRole = useSelector((state) => state?.userRole)

  const [status, setstatus] = useState([
    { label: 'Select Status', value: '' },
    { label: 'Pending for Accept', value: 'pending for accept' },
    { label: 'Pending for Tie-Up', value: 'pending for tie-up' },
    { label: 'Pending for Visit', value: 'pending for visit' },
    { label: 'Visit Done', value: 'visit done' },
    { label: 'Concern By FE ', value: 'concern by fe' },
    { label: 'Draft pending', value: 'pending for draft' },
    { label: 'RC pending', value: 'pending for rc' },
    { label: 'LCTO pending', value: 'pending for lcto' },
    { label: 'CTO pending', value: 'pending for cto' },
    { label: 'Updated by COO', value: 'updated by coo' },
    { label: 'Updated by Admin', value: 'updated by admin' },
    { label: 'Updated by BM', value: 'updated by bm' },
    { label: 'Updated by SFO', value: 'updated by sfo' },
    { label: 'Submitted to Bank', value: 'submitted to bank' },
    { label: 'Hold', value: 'hold by' },
  ])

  useEffect(() => {
    setInitialvalue(filterData)
  }, [filterData])

  useEffect(() => {
    fetchRAbranch()
    fetchFinancename()
    fetchGroupData()
    fetchUserData()
  }, [])

  async function fetchRAbranch() {
    try {
      var response = await new BasicProvider(`ra_branch?count=100`).getRequest()
      var data = response?.data.data
      setRAbranchData(data)
    } catch (error) {
      console.log(error)
    }
  }

  async function fetchGroupData() {
    try {
      var response = await new BasicProvider(`cms/categories/tree/group`).getRequest()
      var data = response?.data.data
      setgroupData(data)
    } catch (error) {
      console.log(error)
    }
  }

  async function fetchUserData() {
    let slugs
    slugs = [
      process.env.REACT_APP_ADMIN,
      process.env.REACT_APP_COO,
      process.env.REACT_APP_FE,
      process.env.REACT_APP_RA,
      process.env.REACT_APP_SFO,
      process.env.REACT_APP_SDM,
      process.env.REACT_APP_DM,
      process.env.REACT_APP_RC,
      process.env.REACT_APP_LCTO,
      process.env.REACT_APP_CTO,
    ]

    if (loggedinUserRole.name === process.env.REACT_APP_SFO) {
      slugs = [process.env.REACT_APP_FE]
    }

    try {
      const queryString = slugs.join(',')
      const url = `admins/get-multiple?slugs=${encodeURIComponent(queryString)}&page=1&count=500`

      var response = await new BasicProvider(url).getRequest()
      var data = response?.data

      setUserData(data)
    } catch (error) {
      console.log(error)
    }
  }

  async function fetchFinancename() {
    try {
      var response = await new BasicProvider(`banks?count=100`).getRequest()

      var data = response?.data.data
      setFinancenameData(data)
    } catch (error) {
      console.log(error)
    }
  }

  function getOptionList(data, defaultOption = { value: '', label: 'All' }) {
    const options = data
      ? data.map((cast) => ({
          value: cast?._id,
          label: cast?.name,
          role: cast?.role?.display_name,
        }))
      : []
    return [defaultOption, ...options]
  }

  const rabranchOptions = getOptionList(rabranchData)
  const financeOptions = getOptionList(financenameData)
  const groupOptions = getOptionList(groupData)
  const userOptions = getOptionList(userData)
  const orderOptions = [
    { value: '', label: 'Select' },
    { value: 'ascending', label: 'Ascending' },
    { value: 'descending', label: 'Descending' },
  ]
  const visitDoneTypeOptions = [
    { value: '', label: 'All' },
    { value: 'offline', label: 'offline' },
    { value: 'online', label: 'online' },
  ]

  const handleFilter = async () => {
    initialvalue.count = rowPerPage
    initialvalue.page = 1
    setFilterData(initialvalue)
    onFilter(initialvalue)
  }

  const handleChange = (name, value) => {
    setInitialvalue((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const loadOptions = async (name, inputValue, callback) => {
    try {
      const selectData = await new BasicProvider(
        `${name}?search=${inputValue}&page=1&count=10`,
      ).getRequest()

      const options = selectData.data.data.map((item) => ({
        value: item._id,
        label: item.name,
      }))

      callback(options)
    } catch (error) {
      console.log(error)
    }
  }

  const loadOptionsUser = async (inputValue, callback) => {
    try {
      let slugs = []
      slugs = [
        process.env.REACT_APP_ADMIN,
        process.env.REACT_APP_COO,
        process.env.REACT_APP_FE,
        process.env.REACT_APP_RA,
        process.env.REACT_APP_SFO,
        process.env.REACT_APP_SDM,
        process.env.REACT_APP_DM,
        process.env.REACT_APP_RC,
        process.env.REACT_APP_LCTO,
        process.env.REACT_APP_CTO,
      ]

      if (loggedinUserRole.name === process.env.REACT_APP_SFO) {
        slugs = [process.env.REACT_APP_FE]
      }

      const queryString = slugs.join(',')
      const response = await new BasicProvider(
        `admins/get-multiple?slugs=${encodeURIComponent(queryString)}&search=${inputValue}`,
      ).getRequest()

      const options = response.data.map((item) => ({
        value: item._id,
        label: item.name,
        role: item?.role?.display_name,
      }))

      callback(options)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="case-filter-theme app-filter-theme">
      <div className="datatable bg-white mb-2 p-3 pb-0">
        <CForm>
          <CRow>
            <CCol xs={12} lg={8} className="ps-0  pe-0 ps-md-2">
              <CFormLabel>
                Search By (Applicant Name, CIN No, LOS No, Mobile No,Nero Location)
              </CFormLabel>
              <CFormInput
                name="search_input"
                className="mb-lg-2 mb-2"
                placeholder="Enter From above Fields ..."
                value={initialvalue.search_input}
                onChange={(e) => handleChange(e.target.name, e.target.value)}
              />
            </CCol>

            <CCol xs={12} lg={4} className="ps-0  pe-0 ps-md-2">
              <CFormLabel>Finance Name</CFormLabel>
              <AsyncSelect
                name="finance_name"
                className="mb-lg-2 mb-2"
                classNamePrefix="case-filter-select"
                loadOptions={(inputValue, callback) =>
                  loadOptions('banks/search', inputValue, callback)
                }
                defaultOptions={financeOptions}
                getOptionLabel={(option) => option.label}
                getOptionValue={(option) => option.value}
                value={
                  financeOptions &&
                  financeOptions.find((option) => option.value === initialvalue?.finance_name)
                }
                onChange={(selectedOption) => {
                  setInitialvalue((prevValue) => ({
                    ...prevValue,
                    finance_name: selectedOption?.value,
                  }))
                }}
              />
            </CCol>

            <CCol xs={12} lg={4} className="mb-2 ps-0  pe-0 ps-md-2">
              <CFormLabel>RA Branch</CFormLabel>
              <AsyncSelect
                name="ra_branch"
                className="mb-2 mb-lg-0"
                classNamePrefix="case-filter-select"
                loadOptions={(inputValue, callback) =>
                  loadOptions('ra_branch/search', inputValue, callback)
                }
                defaultOptions={rabranchOptions}
                getOptionLabel={(option) => option.label}
                getOptionValue={(option) => option.value}
                value={
                  rabranchOptions &&
                  rabranchOptions.find((option) => option.value === initialvalue.ra_branch)
                }
                onChange={(selectedOptions) => {
                  setInitialvalue((prevValue) => ({
                    ...prevValue,
                    ra_branch: selectedOptions?.value,
                  }))
                }}
              />
            </CCol>

            {loggedinUserRole?.name !== process.env.REACT_APP_FE &&
              loggedinUserRole?.name !== process.env.REACT_APP_DM && (
                <>
                  <CCol xs={12} lg={4} className="mb-2 ps-0  pe-0 ps-md-2">
                    <CFormLabel>Select Group</CFormLabel>
                    <AsyncSelect
                      name="group_id"
                      classNamePrefix="case-filter-select"
                      loadOptions={(inputValue, callback) =>
                        loadOptions(
                          `cms/categories/search?page=1&count=10&search=${inputValue}`,
                          inputValue,
                          callback,
                        )
                      }
                      defaultOptions={groupOptions}
                      getOptionLabel={(option) => option.label}
                      getOptionValue={(option) => option.value}
                      value={
                        groupOptions &&
                        groupOptions.find((option) => option.value === initialvalue?.group_id)
                      }
                      onChange={(selectedOptions) => {
                        setInitialvalue((prevValue) => ({
                          ...prevValue,
                          group_id: selectedOptions?.value,
                        }))
                      }}
                    />
                  </CCol>

                  <CCol xs={12} lg={4} className="mb-2 ps-0 pe-0 ps-md-2">
                    <CFormLabel>Select User</CFormLabel>
                    <AsyncSelect
                      name="user_id"
                      classNamePrefix="case-filter-select"
                      loadOptions={(inputValue, callback) => loadOptionsUser(inputValue, callback)}
                      defaultOptions={userOptions}
                      getOptionLabel={(option) => (
                        <div>
                          <div>{option.label}</div>
                          <div style={{ color: 'green', fontSize: '0.8em', marginTop: '2px' }}>
                            {option.role}
                          </div>
                        </div>
                      )}
                      getOptionValue={(option) => option.value}
                      value={
                        userOptions &&
                        userOptions.find((option) => option.value === initialvalue?.user_id)
                      }
                      onChange={(selectedOption) => {
                        setInitialvalue((prevValue) => ({
                          ...prevValue,
                          user_id: selectedOption.value,
                        }))
                      }}
                      styles={{
                        option: (provided, state) => ({
                          ...provided,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          backgroundColor: state.isFocused ? '#e6f7ff' : '#fff',
                          color: '#000',
                          cursor: 'pointer',
                          padding: '10px',
                        }),
                        singleValue: (provided) => ({
                          ...provided,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                        }),
                      }}
                      components={{
                        Option: ({ data, innerRef, innerProps }) => (
                          <div ref={innerRef} {...innerProps} style={{ padding: '10px' }}>
                            <div>{data.label}</div>
                            <div style={{ color: 'green', fontSize: '0.8em', marginTop: '2px' }}>
                              {data.role}
                            </div>
                          </div>
                        ),
                      }}
                    />
                  </CCol>
                </>
              )}

            <CCol xs={12} lg={4} className="ps-0  pe-0 ps-md-2 RegisterUserInput">
              <CFormLabel htmlFor="publishDate">
                Create Case(from Date)<span className="text-danger"></span>
              </CFormLabel>

              <DatePicker
                showMonthDropdown
                showYearDropdown
                dateFormat="dd-MMM-yyyy"
                maxDate={new Date()}
                onChange={(date) => {
                  const timezoneOffset = date.getTimezoneOffset()
                  const adjustedDate = new Date(date.getTime() - timezoneOffset * 60 * 1000)
                  const formattedDate = adjustedDate.toISOString().split('T')[0]
                  setInitialvalue((prev) => ({
                    ...prev,
                    date_from: formattedDate,
                  }))
                }}
                selected={
                  initialvalue.date_from != undefined &&
                  initialvalue.date_from != null &&
                  initialvalue.date_from != ''
                    ? new Date(initialvalue.date_from)
                    : null
                }
                className="form-control full py-2"
                size="sm"
                aria-label="Small select example"
                placeholderText="Select From Date"
              />
            </CCol>

            <CCol xs={12} lg={4} className=" ps-0  pe-0 ps-md-2">
              <CFormLabel htmlFor="publishDate">
                Create Case(to Date)<span className="text-danger"></span>
              </CFormLabel>

              <DatePicker
                showMonthDropdown
                showYearDropdown
                minDate={new Date(initialvalue.date_from)}
                maxDate={new Date()}
                onChange={(date) => {
                  const timezoneOffset = date.getTimezoneOffset()
                  const adjustedDate = new Date(date.getTime() - timezoneOffset * 60 * 1000)
                  const formattedDate = adjustedDate.toISOString().split('T')[0]

                  setInitialvalue((prev) => ({
                    ...prev,
                    date_to: formattedDate,
                  }))
                }}
                selected={
                  initialvalue.date_to != undefined &&
                  initialvalue.date_to != null &&
                  initialvalue.date_to != ''
                    ? new Date(initialvalue.date_to)
                    : null
                }
                dateFormat="dd-MMM-yyyy"
                className="form-control full py-2"
                size="sm"
                aria-label="Small select example"
                placeholderText="Select To Date"
              />

              {/* {validationMessage && <div className="text-danger mt-1">{validationMessage}</div>} */}
            </CCol>

            <CCol xs={12} lg={2} className=" ps-0  pe-0 ps-md-2">
              <CFormLabel>By Order</CFormLabel>
              <Select
                name="order"
                classNamePrefix="case-filter-select"
                options={orderOptions}
                value={orderOptions.find((option) => option.value === initialvalue.order)}
                onChange={(selectedOption) =>
                  setInitialvalue({
                    ...initialvalue,
                    order: selectedOption?.value || '',
                  })
                }
              />
            </CCol>

            <CCol xs={12} lg={2} className="mt-4 d-flex align-items-center">
              <div className="">
                <CFormCheck
                  type="checkbox"
                  label={'Case Revise ?'}
                  className="credit ps-0 d-flex align-items-center"
                  checked={initialvalue.case_revise === '1'}
                  onChange={() => {
                    setInitialvalue({
                      ...initialvalue,
                      case_revise: initialvalue.case_revise === '1' ? '0' : '1',
                    })
                  }}
                />
              </div>
            </CCol>

            <CCol xs={12} lg={4} className="px-2 pe-0 pe-lg-2 ps-0">
              <CFormLabel>By Status</CFormLabel>
              <AsyncSelect
                name="user_id"
                className="mb-sm-2 mb-2"
                classNamePrefix="case-filter-select"
                isMulti
                loadOptions={(inputValue) => {
                  return new Promise((resolve) => {
                    const filteredOptions = status.filter((option) =>
                      option.label.toLowerCase().includes(inputValue.toLowerCase()),
                    )
                    resolve(filteredOptions)
                  })
                }}
                getOptionLabel={(option) => option.label}
                getOptionValue={(option) => option.value}
                value={status.filter((option) => initialvalue.status?.includes(option.value))}
                onChange={(selectedOptions) => {
                  const selectedValues = selectedOptions.map((option) => option.value)
                  setInitialvalue((prevState) => ({
                    ...prevState,
                    status: selectedValues,
                  }))
                }}
                defaultOptions={status}
                isClearable
              />
            </CCol>
            <CCol xs={12} lg={4} className="px-2 pe-0 pe-lg-2 ps-0">
              <CFormLabel>By visit Done type</CFormLabel>
              <Select
                name="visit_type_by_fe"
                classNamePrefix="case-filter-select"
                options={visitDoneTypeOptions}
                value={visitDoneTypeOptions.find(
                  (option) => option.value === (initialvalue?.visit_type_by_fe || ''),
                )}
                onChange={(selectedOption) => {
                  setInitialvalue((prevValue) => ({
                    ...prevValue,
                    visit_type_by_fe: selectedOption?.value || '',
                  }))
                }}
              />
            </CCol>

            <CCol xs={6} lg={4}>
              <div className="d-flex mt-4  align-items-center">
                <CButton
                  color="primary "
                  className=" w-70 px-2"
                  type="submit"
                  onClick={(event) => {
                    event.preventDefault()
                    handleFilter()
                  }}
                >
                  Filter
                </CButton>
                <CButton
                  color="danger "
                  onClick={() => {
                    onReset()
                  }}
                  className=" ms-2 px-2 w-70"
                  style={{ color: 'white' }}
                >
                  Reset
                </CButton>
              </div>
            </CCol>
          </CRow>
        </CForm>
      </div>
    </div>
  )
}

export default CaseFilter
