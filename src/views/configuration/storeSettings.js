import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CForm,
  CFormLabel,
  CRow,
  CFormSelect,
} from '@coreui/react'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import BasicProvider from 'src/constants/BasicProvider'
import { setAlertTimeout } from 'src/helpers/alertHelper'
import handleSubmitHelper from 'src/helpers/submitHelper'

export default function all() {
  const [taxInitialValues, setTaxInitialValues] = useState({
    value: '',
  })

  const [countryInitialValues, setCountryInitialValues] = useState({
    name: '',
  })

  const [searchByAiInitailValues, setsearchByAiInitailValues] = useState({
    search: false
  });


  const handleChange = (e) => {
    setsearchByAiInitailValues({ search: e.target.value === 'true' }); // Convert string to boolean
  };


  const [error, setError] = useState('')
  const validationRules = {
    value: {
      required: true,
    },
  }
  const dispatch = useDispatch()

  const taxHandleChange = (e) => {
    const newValue = e.target.value
    if (!isNaN(newValue)) {
      setTaxInitialValues({ value: newValue })
      setError('')
    } else {
      setError('Please enter a numeric value.')
    }
  }
  const CountryhandleChange = (e) => {
    const { name, value } = e.target

    setCountryInitialValues({ name: value })
  }

  const countrySumbit = async (e) => {
    e.preventDefault()
    try {
      // const newValue = countryInitialValues.name
      // console.log(newValue);
      const response = await new BasicProvider('settings/country/create', dispatch).postRequest(
        countryInitialValues,
      )

      // setCountryInitialValues(countryInitialValues)
    } catch (error) {
      console.log('data is not sent', error)
    }
  }
  const fetchData = async () => {
    try {
      // const response = await new BasicProvider('settings/tax/show').getRequest()
      const response = await new BasicProvider('settings/tax').getRequest()

      // console.log( "ress",response);
      const valueFromApi = response.data.value
      setTaxInitialValues({ value: valueFromApi })
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchData()
    dispatch({ type: 'set', validations: [] })
  }, [])

  const taxHandleSubmit = async (e) => {
    e.preventDefault()

    try {
      const trimdata = typeof taxInitialValues.value === 'string' && !taxInitialValues.value.trim()
      var data = await handleSubmitHelper(taxInitialValues, validationRules, dispatch)
      if (data === 'error') {
        return
      }
      if (trimdata) {
        return
      } else {
        const newValue = [parseFloat(taxInitialValues.value)]
        const response = await new BasicProvider(`settings/tax/create`, dispatch).postRequest({
          value: newValue,
        })
        setTaxInitialValues({ value: newValue.toString() })
        setAlertTimeout(dispatch)
      }
    } catch (error) {
      console.log(error)
    }
  }

  // const CountryfetchData = async () => {
  //   try {
  //     // const response = await new BasicProvider('settings/tax/show').getRequest()
  //     const response = await new BasicProvider('settings/country/create', dispatch).postRequest(value)

  //     console.log("ress", response);
  //     // const valueFromApi = response.data.value
  //     // console.log('response.data.value', response.data.value)
  //     // setCountryInitialValues(countryInitialValues)
  //   } catch (error) {
  //     console.log(error)
  //   }
  // }

  // useEffect(() => {
  //   CountryfetchData()
  //   dispatch({ type: 'set', validations: [] })
  // }, [])

  const CountryHandleSubmit = async (e) => {
    e.preventDefault()

    try {
      // const trimdata = typeof taxInitialValues.value === 'string' && !taxInitialValues.value.trim()
      var data = await handleSubmitHelper(CountryInitialValues, validationRules, dispatch)
      if (data === 'error') {
        return
      }
      if (trimdata) {
        return
      } else {
        const newValue = [parseFloat(CountryInitialValues.value)]
        const response = await new BasicProvider(`settings/country/create`, dispatch).postRequest({
          value: newValue,
        })
        // setCountryInitialValues({ value: newValue.toString() })
        setAlertTimeout(dispatch)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const searchByAiSumbit = async (e) => {
    e.preventDefault()

    try {
      // const trimdata = typeof taxInitialValues.value === 'string' && !taxInitialValues.value.trim()
      var data = await handleSubmitHelper(searchByAiInitailValues, validationRules, dispatch)
      if (data === 'error') {
        return
      }
      if (data) {
        return
      } else {
        // const newValue = [parseFloat(CountryInitialValues.value)]
        // console.log('Response.......', newValue)
        const response = await new BasicProvider(`settings/file-search-mode`, dispatch).postRequest(searchByAiInitailValues)
        // setCountryInitialValues({ value: newValue.toString() })
        setAlertTimeout(dispatch)
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <CContainer fluid className="px-4">
      <CRow>
        <CCol md={4}>
          <CForm className="g-3 needs-validation" onSubmit={taxHandleSubmit}>
            <CCard className="mt-4">
              <CCardHeader> Tax</CCardHeader>
              <CCardBody>
                <div className="my-2">
                  <CFormLabel>Tax (%)</CFormLabel>
                  {/* <CFormInput name="tax" placeholder="Enter tax (%)" /> */}
                  <input
                    type="text"
                    name="value"
                    className="form-control"
                    placeholder="Enter tax "
                    value={taxInitialValues.value}
                    onChange={taxHandleChange}
                  />
                </div>
                {error && <div className="text-danger">{error}</div>}

                <CButton
                  className="submit_btn mt-2"
                  type="submit"
                  onClick={() => setTaxInitialValues({ ...taxInitialValues, status: 'published' })}
                >
                  Submit
                </CButton>
              </CCardBody>
            </CCard>
          </CForm>
        </CCol>
        <CCol md={4}>
          <CForm className="g-3 needs-validation" onClick={countrySumbit}>
            <CCard className="mt-4">
              <CCardHeader> Country</CCardHeader>
              <CCardBody>
                {/* Dropdown Section */}
                <div className="my-2">
                  <CFormLabel>Select Country</CFormLabel>
                  <CFormSelect name="country" onChange={CountryhandleChange}>
                    <option value="India">India</option>
                    <option value="United_States">United States</option>
                    <option value="Japan">Japan</option>
                    <option value="Rassia">Rassia</option>
                  </CFormSelect>
                </div>

                {error && <div className="text-danger">{error}</div>}

                <CButton className="submit_btn mt-2" type="submit">
                  Submit
                </CButton>
              </CCardBody>
            </CCard>
          </CForm>
        </CCol>

        <CCol md={4}>
          <CForm className="g-3 needs-validation" onClick={searchByAiSumbit}>
            <CCard className="mt-4">
              <CCardHeader>File Search By AI.</CCardHeader>
              <CCardBody>
                {/* Dropdown Section */}
                <div className="my-2">
                  <CFormLabel>Select</CFormLabel>
                  <CFormSelect
                    name="country"
                    onChange={handleChange}
                    value={searchByAiInitailValues.search ? 'true' : 'false'} // Set value based on boolean
                  >
                    <option value="true">Enable</option>
                    <option value="false">Disable</option>
                  </CFormSelect>
                </div>

                {/* {error && <div className="text-danger">{error}</div>} */}

                <CButton className="submit_btn mt-2" type="submit">
                  Submit
                </CButton>
              </CCardBody>
            </CCard>
          </CForm>
        </CCol>
      </CRow>
    </CContainer>
  )
}
