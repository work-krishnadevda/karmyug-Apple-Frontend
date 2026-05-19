import { CButton, CCol, CForm, CFormInput, CFormLabel, CRow } from '@coreui/react'

import AppFormSelect from 'src/components/form/AppFormSelect'
import { useEffect, useState } from 'react'
import BasicProvider from 'src/constants/BasicProvider'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

import AsyncSelect from 'react-select/async'

const LoginActivityFilter = ({ rowPerPage, filterData, setFilterData, onFilter, onReset }) => {
  const [initialvalue, setInitialvalue] = useState({
    user_id: '',
  })


  const [userData, setUserData] = useState()

  useEffect(() => {
    setInitialvalue(filterData)
  }, [filterData])

  useEffect(() => {

    fetchUserData()
  }, [])




  async function fetchUserData() {
    try {
      var response = await new BasicProvider(`admins`).getRequest()
      var data = response?.data.data
      setUserData(data)
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

  return (
    <div className="case-filter-theme app-filter-theme">
      <div className="datatable bg-white mb-2 p-3 pb-0">
        <CForm>
          <CRow>

            <CCol xs={12} lg={4} md={6} className="mb-2 ps-0  pe-0 ps-md-2">
              <CFormLabel>Select User</CFormLabel>
              <AsyncSelect
                name="user_id"
                classNamePrefix="case-filter-select"
                loadOptions={(inputValue, callback) =>
                  loadOptions('admins/search', inputValue, callback)
                }
                defaultOptions={userOptions}
                getOptionLabel={(option) => option.label}
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
              />
            </CCol>

            <CCol xs={6} lg={3}>
              <div className="d-flex mt-4 align-items-center">
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

export default LoginActivityFilter
