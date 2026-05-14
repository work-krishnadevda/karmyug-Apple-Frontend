import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { DeleteModal, handleConfirmDelete } from 'src/helpers/deleteModalHelper'
import HelperFunction from 'src/helpers/HelperFunctions'

import { cilPencil, cilSpreadsheet, cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
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
  CFormSelect,
  CFormSwitch,
  CRow,
} from '@coreui/react'
import DataTable from 'src/components/custom/table/AppDataTable'
import AppTableSkeleton from 'src/components/custom/table/AppTableSkeleton'
import SingleSubHeader from 'src/components/custom/SingleSubHeader'
import BasicProvider from 'src/constants/BasicProvider'
import { RowsPerPage } from 'src/constants/variables'
import { setAlertTimeout } from 'src/helpers/alertHelper'
import { handleSelectedRowChange, setSelectedRowForModule } from 'src/helpers/paginationCookie'
import handleSubmitHelper from 'src/helpers/submitHelper'

const validationRules = {
  name: {
    required: true,
    minLength: 3,
  },
  symbol: {
    required: true,
  },
  type: {
    required: true,
  },
  conversion_value: {
    required: true,
  },
  conversion_unit: {
    required: true,
  },
}

var subHeaderItems = [
  {
    name: 'Create',
    link: '/master/units',
    icon: cilSpreadsheet,
  },
]
export default function CreateUnit() {
  var params = useParams()
  const query = new URLSearchParams(location.search)

  var count = query.get('count') || 20
  var currentPage = query.get('page') || 1

  const [otherSelected, setOtherSelected] = useState(false)
  const [ConversionOther, setConversionOther] = useState(false)
  const [userId, setuserId] = useState([])
  const [visible, setVisible] = useState(false)
  const navigate = useNavigate()
  const id = params.id
  const isEditMode = !!id
  const [conversionType, setConversionType] = useState([])
  const [searchValue, setSearchValue] = useState('')
  const [rowPerPage, setRowPerPage] = useState(null)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  // const [totalCount, setTotalCount] = useState([])

  const data = useSelector((state) => state.data?.units) || []
  const totalCount = useSelector((state) => state.totalCount)
  const dispatch = useDispatch()
  const toggleCleared = useSelector((state) => state.toggleCleared)
  const [typeValues, setTypeValues] = useState([])

  const [initialValues, setInitialValues] = useState({
    name: '',
    symbol: '',
    conversion_value: '',
    conversion_unit: '',
    conversion_symbol: '',
    type: '',
    default: 0,
  })

  useEffect(() => {
    if (rowPerPage) fetchAllData(page, rowPerPage)
  }, [page, rowPerPage])

  useEffect(() => {
    setInitialValues({
      name: '',
      symbol: '',
      conversion_value: '',
      conversion_unit: '',
      conversion_symbol: '',
      type: '',
      default: 0,
    })
    dispatch({ type: 'set', validations: [] })
    fetchSingleData()
  }, [navigate])

  const fetchSingleData = async () => {
    try {
      if (isEditMode) {
        const response = await new BasicProvider(`ecommerce/units/show/${id}`).getRequest()
        setInitialValues({ ...response.data })
      }
    } catch (error) {
      console.log(error)
    }
  }

  const fetchAllData = async (page, perPage, searchValue = '') => {
    try {
      const response = await HelperFunction.getData('ecommerce/units', page, perPage, searchValue)
      dispatch({ type: 'set', data: { units: response.data.data } })
      dispatch({ type: 'set', totalCount: response.data.total })
      // setData(response.data.data)
      // setTotalCount(response.data.total)
      const typeSet = new Set(response.data.data.map((obj) => obj.type))
      setTypeValues([...typeSet])
      const conversionType = new Set(response.data.data.map((obj) => obj.conversion_unit))
      setConversionType([...conversionType])
      setIsLoading(false)
    } catch (error) {
      console.error(error)
      setIsLoading(false)
    }
  }
  useEffect(() => {
    const fetchSelectedRows = async () => {
      const savedSelectedRows = await handleSelectedRowChange('unit')
      if (savedSelectedRows) {
        setRowPerPage(savedSelectedRows)
      }
    }
    fetchSelectedRows()
  }, [])

  const handleRowChange = useCallback((state) => {
    dispatch({ type: 'set', selectedrows: state.selectedRows })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = await handleSubmitHelper(initialValues, validationRules, dispatch)
      if (data === false) {
        return
      }

      var response
      if (isEditMode) {
        response = await new BasicProvider(`ecommerce/units/update/${id}`, dispatch).patchRequest(
          initialValues,
        )
      } else {
        response = await new BasicProvider(`ecommerce/units/create`, dispatch).postRequest(
          initialValues,
        )
        setInitialValues({
          name: '',
          symbol: '',
          conversion_value: '',
          conversion_unit: '',
          conversion_symbol: '',
          type: '',
          default: 0,
        })
        // navigate(`/ecommerce/units/${response.data._id}/edit`)
      }
      setAlertTimeout(dispatch)
      fetchAllData(page, rowPerPage)
    } catch (error) {
      console.log(error)
    }
  }

  const columns = [
    {
      name: 'Name',
      selector: (row) => (
        <div
          className="pointer_cursor data_Table_title"
          onClick={() => navigate(`/ecommerce/units/${row._id}/edit`)}
        >
          {row.name}
        </div>
      ),
    },
    {
      name: 'Symbol',
      selector: (row) => <div className="data_table_colum">{row.symbol}</div>,
    },
    {
      name: 'Conversion',
      selector: (row) => (
        <div className="data_table_colum">
          1{row.symbol}={row.conversion_value}&nbsp;
          {row.conversion_unit}
        </div>
      ),
    },
    {
      name: 'Type',
      selector: (row) => <div className="data_table_colum">{row.type}</div>,
    },
    {
      name: 'Default',
      selector: (row) => (
        <div
          className="status-value"
          style={{ backgroundColor: row && row.default === 1 ? '#3bb77e' : '#ffb822' }}
        >
          {row.default === 1 ? 'True' : 'False'}
        </div>
      ),
      width: '25%',
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="action-btn">
          <div className="MailLogdelet-btn" color="info">
            <CIcon
              className="pointer_cursor"
              icon={cilPencil}
              onClick={() => navigate(`/master/units/${row._id}/edit`)}
            />
          </div>
          <div className="delet-btn">
            <CIcon
              className="pointer_cursor"
              icon={cilTrash}
              onClick={() => {
                setVisible(true)
                setuserId([row._id])
              }}
            />
          </div>
        </div>
      ),
      ignoreRowClick: true,
      allowoverflow: true,
      button: 'true',
    },
  ]

  // const handleOnChange = (e) => {
  //     const { name, value } = e.target
  //     // if (name === 'name') {
  //     //   const categoriesArray = value.split('\n').map((category) => category)
  //     //   setInitialValues('name', categoriesArray)
  //     // }
  //     setInitialValues({ ...initialValues, [name]: value })
  // }

  const handleOnChange = (e) => {
    const { name, value } = e.target

    // If the field is 'conversion_value', validate and update only that field
    if (name === 'conversion_value') {
      // Remove non-numeric characters and ensure non-negative value
      const sanitizedValue = value.replace(/\D/g, '')
      const nonNegativeValue = Math.max(0, parseInt(sanitizedValue))

      // Update state with the sanitized value
      setInitialValues({ ...initialValues, [name]: nonNegativeValue.toString() })
    } else {
      // For other fields, update state as usual
      setInitialValues({ ...initialValues, [name]: value })
    }
  }

  return (
    <>
      <SingleSubHeader moduleName="Units" subHeaderItems={subHeaderItems} />
      <CContainer fluid className="px-4">
        <CForm className="g-3 needs-validation" onSubmit={handleSubmit}>
          <CRow>
            <CCol md={4}>
              <CCard className="mb-4">
                <CCardHeader> Unit</CCardHeader>
                <CCardBody>
                  <div className="my-3">
                    <CFormLabel className="my-1">
                      Unit Name<span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput
                      type="text"
                      name="name"
                      onChange={handleOnChange}
                      placeholder="Name"
                      value={initialValues.name ?? ''}
                    />
                  </div>
                  <div className="my-3">
                    <CFormLabel className="my-1">
                      Symbol (Ex: kg)<span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput
                      type="text"
                      name="symbol"
                      onChange={handleOnChange}
                      placeholder="Symbol"
                      value={initialValues.symbol ?? ''}
                    />
                  </div>
                  <CFormLabel className="my-1">
                    Select Type<span className="text-danger">*</span>
                  </CFormLabel>
                  <CFormSelect
                    className="mb-3"
                    name="type"
                    value={initialValues.type ?? ''}
                    selected={initialValues.type}
                    aria-label="Default select Type"
                    options={[
                      { label: 'Select Type', value: '' },
                      ...typeValues.map((name) => ({ label: name, value: name })),
                      { label: 'Other', value: 'other' },
                    ]}
                    onChange={(e) => {
                      const type = e.target.value
                      if (type === 'other') {
                        setInitialValues((prewVlaue) => ({
                          ...prewVlaue,
                          type: '',
                        }))
                        setOtherSelected(true)
                      } else {
                        setOtherSelected(false)
                        handleOnChange(e)
                      }

                      // const type = e.target.value

                      // if (type === 'other') {
                      //     setConversionOther(true)
                      //     setInitialValues((prewVlaue) => ({
                      //         ...prewVlaue,
                      //         conversion_unit: '',
                      //     }))
                      // } else {
                      //     setConversionOther(false)
                      //     handleOnChange(e)
                      // }
                    }}
                  />

                  {otherSelected && (
                    <div className="mb-3">
                      <CFormLabel>
                        Other Type<span className="text-danger">*</span>
                      </CFormLabel>
                      <CFormInput
                        type="text"
                        name="type"
                        onChange={handleOnChange}
                        id="validationCustom03"
                        placeholder="Other Type"
                      />
                    </div>
                  )}
                  <div className="my-3">
                    <CFormLabel className="my-1">
                      Conversion<span className="text-danger">*</span>
                    </CFormLabel>

                    <CRow className="align-items-center">
                      <CCol md={3}>
                        1<span>{initialValues.symbol !== '' ? initialValues.symbol : 'kg'}</span>
                      </CCol>
                      <CCol md={4}>
                        <CFormInput
                          type="number"
                          className="mb-0"
                          name="conversion_value"
                          onChange={handleOnChange}
                          placeholder="Conversion"
                          value={initialValues.conversion_value ?? ''}
                        />
                      </CCol>

                      <CCol md={4}>
                        <CFormSelect
                          name="conversion_unit"
                          value={initialValues.conversion_unit}
                          selected={initialValues.conversion_unit}
                          aria-label="Default select Type"
                          options={[
                            { label: 'Select Type', value: '' },
                            ...conversionType.map((name) => ({ label: name, value: name })),
                            { label: 'Other', value: 'other' },
                          ]}
                          onChange={(e) => {
                            const type = e.target.value

                            if (type === 'other') {
                              setConversionOther(true)
                              setInitialValues((prewVlaue) => ({
                                ...prewVlaue,
                                conversion_unit: '',
                              }))
                            } else {
                              setConversionOther(false)
                              handleOnChange(e)
                            }
                          }}
                        />
                      </CCol>
                    </CRow>
                  </div>

                  {ConversionOther && (
                    <div className="mb-3">
                      <CFormLabel>
                        Other Unit<span className="text-danger">*</span>
                      </CFormLabel>
                      <CRow className="mt-2">
                        <CCol md={6}>
                          <CFormInput
                            type="text"
                            name="conversion_unit"
                            onChange={handleOnChange}
                            placeholder="Other Unit Name"
                          />
                        </CCol>
                        <CCol md={6}>
                          <CFormInput
                            type="text"
                            name="conversion_symbol"
                            onChange={handleOnChange}
                            id="validationCustom03"
                            placeholder="Unit Symbol"
                          />
                        </CCol>
                      </CRow>
                    </div>
                  )}

                  <div className="d-flex my-4 default_toggel align-items-center">
                    <span>Default</span>
                    <CFormSwitch
                      id="toggleSwitch"
                      className="mx-2 "
                      checked={initialValues.default === 1} // Check if it's 1
                      onChange={() =>
                        setInitialValues((prevState) => ({
                          ...prevState,
                          default: prevState.default === 1 ? 0 : 1, // Toggle between 0 and 1
                        }))
                      }
                      color="info"
                      shape="pill"
                    />
                  </div>

                  <CCardFooter className="px-1">
                    {!isEditMode && (
                      <CButton className="submit_btn" type="submit" value="submit">
                        Submit
                      </CButton>
                    )}
                    {isEditMode && (
                      <CButton
                        className="btn btn-secondary  "
                        type="submit"
                        name="buttonClicked"
                        value="update"
                      >
                        Update
                      </CButton>
                    )}
                    <span className="mx-2">or </span>
                    <CButton
                      color="danger"
                      className=" text-light"
                      onClick={() => {
                        navigate('/master/units')
                        setInitialValues({
                          name: '',
                          symbol: '',
                          conversion_value: '',
                          conversion_unit: '',
                          conversion_symbol: '',
                          type: '',
                          default: 0,
                        })
                        setConversionOther(false)
                        setOtherSelected(false)
                      }}
                    >
                      Cancel
                    </CButton>
                  </CCardFooter>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol md={8}>
              <div className="datatable">
                {isLoading || data.length <= 0 ? (
                  <div className="custom-table-shimmer">
                    <AppTableSkeleton />
                  </div>
                ) : (
                  <div className="datatable">
                    <DataTable
                      responsive="true"
                      columns={columns}
                      data={data}
                      paginationServer
                      paginationTotalRows={totalCount}
                      onChangePage={(page) => {
                        if (!searchValue) {
                          setPage(page)
                        } else {
                          setSearchCurrentPage(page)
                        }
                      }}
                      highlightOnHover
                      pagination
                      paginationRowsPerPageOptions={RowsPerPage}
                      paginationPerPage={rowPerPage}
                      onChangeRowsPerPage={(currentRowsPerPage, currentPage) => {
                        setPage(currentPage)
                        setRowPerPage(currentRowsPerPage)
                        setSelectedRowForModule('unit', currentRowsPerPage)
                      }}
                      onSelectedRowsChange={(state) => handleRowChange(state)}
                      clearSelectedRows={toggleCleared}
                    />
                  </div>
                )}
              </div>
            </CCol>
          </CRow>
        </CForm>
        <DeleteModal
          visible={visible}
          userId={userId}
          moduleName="ecommerce/units"
          currentPage={currentPage}
          rowPerPage={rowPerPage}
          setVisible={setVisible}
          deletionType="delete"
          handleClose={() => setVisible(false)}
          isDirectDelete={true}
        />
      </CContainer>
    </>
  )
}

