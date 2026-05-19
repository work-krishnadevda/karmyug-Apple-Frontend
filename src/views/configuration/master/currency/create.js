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
  CFormSwitch,
  CRow,
} from '@coreui/react'

import AppFormSelect from 'src/components/form/AppFormSelect'
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
}
var subHeaderItems = [
  {
    name: 'Create',
    link: '/master/currency',
    icon: cilSpreadsheet,
  },
]
export default function Createcurrency() {
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
  const data = useSelector((state) => state.data.currency) || []
  const totalCount = useSelector((state) => state.totalCount)
  const dispatch = useDispatch()
  const toggleCleared = useSelector((state) => state.toggleCleared)
  const [typeValues, setTypeValues] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const [initialValues, setInitialValues] = useState({
    name: '',
    symbol: '',
    icon: '',
    shortname: '',
    default: '',
  })

  useEffect(() => {
    if (rowPerPage) fetchAllData(page, rowPerPage)
  }, [page, rowPerPage])

  useEffect(() => {
    setInitialValues({
      name: '',
      symbol: '',
      icon: '',
      shortname: '',
      default: '',
    })
    dispatch({ type: 'set', validations: [] })
    fetchSingleData()
  }, [navigate])

  const fetchSingleData = async () => {
    try {
      if (isEditMode) {
        const response = await new BasicProvider(`currency/show/${id}`).getRequest()
        setInitialValues({ ...response.data })
      }
    } catch (error) {
      console.log(error)
    }
  }

  const fetchAllData = async (page, perPage, searchValue = '') => {
    try {
      const response = await HelperFunction.getData('currency', page, perPage, searchValue)
      dispatch({ type: 'set', data: { currency: response.data.data } })
      dispatch({ type: 'set', totalCount: response.data.total })
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      console.error(error)
    }
  }
  useEffect(() => {
    const fetchSelectedRows = async () => {
      const savedSelectedRows = await handleSelectedRowChange('currency')
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
        response = await new BasicProvider(`currency/update/${id}`).patchRequest(initialValues)
      } else {
        response = await new BasicProvider(`currency/create`).postRequest(initialValues)
        // navigate(`/ecommerce/currency/${response.data._id}/edit`)
        setInitialValues({
          name: '',
          symbol: '',
          icon: '',
          shortname: '',
          default: '',
        })
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
          // onClick={() => navigate(`/ecommerce/currency/${row._id}/edit`)}
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
      name: 'Short Name',
      selector: (row) => (
        <div className="data_table_colum">{row && row.shortname ? row.shortname : '-'}</div>
      ),
    },
    {
      name: 'Default',
      selector: (row) => (
        <>
          <div
            className="status-value"
            style={{ backgroundColor: row && row.default == 1 ? '#3bb77e' : '#ffb822' }}
          >
            {row.default == 1 ? 'True' : 'False'}
          </div>
        </>
      ),
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="action-btn">
          <div className="edit-btn">
            <CIcon
              className="pointer_cursor"
              icon={cilPencil}
              onClick={() => navigate(`/master/currency/${row._id}/edit`)}
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

  const handleOnChange = (e) => {
    const { name, value } = e.target

    setInitialValues({ ...initialValues, [name]: value })
  }

  return (
    <>
      <SingleSubHeader moduleName="Currency" subHeaderItems={subHeaderItems} />
      <CContainer fluid className="px-4">
        <CForm className="g-3 needs-validation" onSubmit={handleSubmit}>
          <CRow>
            <CCol md={4}>
              <CCard className="mb-4">
                <CCardHeader>Currency</CCardHeader>
                <CCardBody>
                  <div className="my-3">
                    <CFormLabel className="my-1">
                      Currency Name<span className="text-danger">*</span>
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
                      Symbol (Ex:INR)<span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput
                      type="text"
                      name="symbol"
                      onChange={handleOnChange}
                      placeholder="Symbol"
                      value={initialValues.symbol ?? ''}
                    />
                  </div>
                  <div className="my-3">
                    <CFormLabel className="my-1">
                      Short Name<span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput
                      type="text"
                      name="shortname"
                      onChange={handleOnChange}
                      placeholder="Short Name"
                      value={initialValues.shortname ?? ''}
                    />
                  </div>
                  <div className="my-3">
                    <CFormLabel className="my-1">Icon</CFormLabel>
                    <CFormInput
                      type="text"
                      name="icon"
                      onChange={handleOnChange}
                      placeholder="icon"
                      value={initialValues.icon ?? ''}
                    />
                  </div>

                  <div className="d-flex my-4 default_toggel align-items-center">
                    <span>Default</span>
                    <CFormSwitch
                      id="toggleSwitch"
                      className="mx-2"
                      checked={initialValues.default === 1}
                      onChange={() =>
                        setInitialValues((prevState) => ({
                          ...prevState,
                          default: prevState.default === 1 ? 0 : 1,
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
                        navigate('/master/currency')
                        setInitialValues({
                          name: '',
                          symbol: '',
                          conversion_value: '',
                          conversion_currency: '',
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
                        setSelectedRowForModule('currency', currentRowsPerPage)
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
          moduleName="currency"
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

