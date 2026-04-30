import { CButton, CCol, CForm, CFormInput, CFormLabel, CFormSelect, CRow } from '@coreui/react'
import { useEffect, useState } from 'react'
import BasicProvider from 'src/constants/BasicProvider'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

import AsyncSelect from 'react-select/async'
import { useSelector } from 'react-redux'


const InitiatedFilter = ({ rowPerPage, filterData, setFilterData, onFilter, onReset }) => {
  const [initialvalue, setInitialvalue] = useState({
    search_input: '',
    finance_name: '',
    date_from: '',
    date_to: '',
    status: '',
  })

  const [rabranchData, setRAbranchData] = useState()
  const [financenameData, setFinancenameData] = useState()
  const [groupData, setgroupData] = useState()
  const [userData, setUserData] = useState()

  let loggedinUserRole = useSelector((state) => state?.userRole)

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

    let slugs;
    slugs = [
      process.env.REACT_APP_ADMIN,
      process.env.REACT_APP_COO,
      process.env.REACT_APP_FE,
      process.env.REACT_APP_RA,
      process.env.REACT_APP_SFO,
      process.env.REACT_APP_DM,
      process.env.REACT_APP_RC,
      process.env.REACT_APP_LCTO,
      process.env.REACT_APP_CTO
    ]

    if (loggedinUserRole.name === process.env.REACT_APP_SFO) {
      slugs = [process.env.REACT_APP_FE]
    }

    try {
      const queryString = slugs.join(',');
      const url = `admins/get-multiple?slugs=${encodeURIComponent(queryString)}&page=1&count=500`;

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
      }))
      : []
    return [defaultOption, ...options]
  }

  const rabranchOptions = getOptionList(rabranchData)
  const financeOptions = getOptionList(financenameData)
  const groupOptions = getOptionList(groupData)
  const userOptions = getOptionList(userData)

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

      // console.log('selectData',selectData);

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
        process.env.REACT_APP_DM,
        process.env.REACT_APP_RC,
        process.env.REACT_APP_LCTO,
        process.env.REACT_APP_CTO
      ]

      if (loggedinUserRole.name === process.env.REACT_APP_SFO) {
        slugs = [process.env.REACT_APP_FE]
      }

      const queryString = slugs.join(',');
      const response = await new BasicProvider(
        `admins/get-multiple?slugs=${encodeURIComponent(queryString)}&search=${inputValue}`,
      ).getRequest()

      const options = response.data.map((item) => ({
        value: item._id,
        label: item.name,
      }))

      callback(options)
    } catch (error) {
      console.log(error)
    }
  }




  return (
    <div>
      <div className="datatable bg-white mb-2 p-3 pb-0">
        <CForm>
          <CRow>
            <CCol xs={12} lg={4} className="ps-0  pe-0 ps-md-2">
              <CFormLabel>Search By (Applicant Name,Mobile No)</CFormLabel>
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

            <CCol xs={12} lg={4} className=" ps-0  pe-0 ps-md-2">
              <CFormLabel>By Status</CFormLabel>
              <CFormSelect
                aria-label="Default select example"
                name="status"
                value={initialvalue.status}
                onChange={(event) =>
                  setInitialvalue({
                    ...initialvalue,
                    status: event.target.value,
                  })
                }
              >
                <option value="">Select Status</option>
                <option value="pending for visit">Total Cases Pending for Visit</option>
                <option value="pending for accept">Pending for Accept</option>
                <option value="pending for tie-up">Pending for Tie-Up</option>
                <option value="pending for draft">Total Case draft pending</option>
                <option value="pending for rc">Total Case RC pending</option>
                <option value="pending for lcto">Total Case LCTO pending</option>
                <option value="pending for cto">Total Case CTO pending</option>
                <option value="submitted to bank">Total case submitted to Bank</option>
                <option value="hold by">Total cases On Hold</option>
                <option value="concern by fe">Concern By FE</option>
              </CFormSelect>
            </CCol>



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



            <CCol xs={6} lg={3}>
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

export default InitiatedFilter
