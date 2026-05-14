import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
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
  CFormTextarea,
  CInputGroup,
  CRow,
} from '@coreui/react'
import DataTable from 'src/components/custom/table/AppDataTable'
import AppTableSkeleton from 'src/components/custom/table/AppTableSkeleton'
import SingleSubHeader from 'src/components/custom/SingleSubHeader'
import BasicProvider from 'src/constants/BasicProvider'

import { RowsPerPage } from 'src/constants/variables'
import { DeleteModal } from 'src/helpers/deleteModalHelper'
import { handleSelectedRowChange, setSelectedRowForModule } from 'src/helpers/paginationCookie'
import { useEffectFormData } from 'src/helpers/formHelpers'
import handleSubmitHelper from 'src/helpers/submitHelper'
import { setAlertTimeout } from 'src/helpers/alertHelper'

const validationRules = {
  name: {
    required: true,
    minLength: 3,
  },

  color: {
    required: true,
  },
}

var subHeaderItems = [
  {
    name: 'Create',
    link: '/master/status',
    icon: cilSpreadsheet,
  },
]
export default function CreateStatus() {
  var params = useParams()
  const [otherSelected, setOtherSelected] = useState(false)
  const [userId, setuserId] = useState([])
  const [visible, setVisible] = useState(false)
  const navigate = useNavigate()
  const id = params.id
  const isEditMode = !!id
  const [selectedType, setSelectedType] = useState('')
  const [searchValue, setSearchValue] = useState('')
  const [page, setPage] = useState(1)
  const data = useSelector((state) => state.data?.status) || []
  const [rowPerPage, setRowPerPage] = useState(null)
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(true)

  const [searchcurrentPage, setSearchCurrentPage] = useState(null)
  const query = new URLSearchParams(location.search)
  var count = query.get('count') || rowPerPage
  var currentPage = parseInt(query.get('page') || 1)
  var search = query.get('search') || ''
  let [defaultPage, setDefaultPage] = useState(currentPage)
  const totalCount = useSelector((state) => state.totalCount)
  const dispatch = useDispatch()
  const toggleCleared = useSelector((state) => state.toggleCleared)
  const [typeValues, setTypeValues] = useState([])

  const [isUpdateQueryParams, setIsUpdateQueryParams] = useState(false)

  const updatePageQueryParam = (paramName, page) => {
    if (isUpdateQueryParams) {

      const searchParams = new URLSearchParams(location.search)
      searchParams.set(paramName, page)
      navigate({ search: searchParams.toString() })
    }
    setIsUpdateQueryParams(true)
  }

  //   useEffect(() => {
  //     const fetchSelectedRows = async () => {
  //       const savedSelectedRows = await handleSelectedRowChange('Status')
  //       if (savedSelectedRows) {
  //         setRowPerPage(savedSelectedRows)
  //       }
  //     }
  //     fetchSelectedRows()
  //   }, [])

  const [initialValues, setInitialValues] = useState({
    name: '',
    slug: '',
    color: '',
  })

  useEffect(() => {
    setInitialValues({
      name: '',
      slug: '',
      color: '',
    })
  }, [navigate])

  useEffect(() => {
    if (rowPerPage) fetchAllData(page, rowPerPage)
  }, [page, rowPerPage])

  useEffect(() => {
    dispatch({ type: 'set', validations: [] })
    fetchSingleData()
  }, [navigate])

  const fetchSingleData = async () => {
    try {
      if (isEditMode) {
        const response = await new BasicProvider(`cms/status/show/${id}`).getRequest()
        setInitialValues({ ...response.data })
      }
    } catch (error) {
      console.log(error)
    }
  }

  const fetchAllData = async (page, perPage) => {
    try {
      const response = await new BasicProvider(
        `cms/status?page=${page}&count=${perPage}`,
      ).getRequest()
      // console.log('DATA', response)
      dispatch({ type: 'set', data: { status: response.data.data } })
      dispatch({ type: 'set', totalCount: response.data.total })
      const typeSet = new Set(response.data.data.map((obj) => obj.type))
      setTypeValues([...typeSet])
      dispatch({ type: 'set', totalCount: response.data.total })
      setIsLoading(false)
    } catch (error) {
      console.error(error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const fetchSelectedRows = async () => {
      const savedSelectedRows = await handleSelectedRowChange('status')
      if (savedSelectedRows) {
        setRowPerPage(savedSelectedRows)
      }
    }
    fetchSelectedRows()
  }, [])

  const handleRowChange = useCallback((state) => {
    dispatch({ type: 'set', selectedrows: state.selectedRows })
  }, [])

  const handleOnChange = (e) => {
    const { name, value } = e.target
    setInitialValues({ ...initialValues, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const data = await handleSubmitHelper(initialValues, validationRules, dispatch)
      if (data === false) return
      var response
      if (isEditMode) {
        response = await new BasicProvider(`cms/status/update/${id}`, dispatch).patchRequest(data)
        fetchAllData(page, rowPerPage)
      } else {
        response = await new BasicProvider(`cms/status/create`, dispatch).postRequest(data)
        // navigate(`/master/status/${response.data._id}/edit`)
        setInitialValues({
          name: '',
          slug: '',
          color: '',
        })
        fetchAllData(page, rowPerPage)
      }
      setAlertTimeout(dispatch)
    } catch (error) {
      console.log(error)
    }
  }

  let cc = 1
  const columns = [
    {
      name: 'Name',
      selector: (row) => (
        <div className="pointer_cursor data_Table_title">{row && row.name ? row.name : '-'}</div>
      ),
      sortable: true,
    },

    {
      name: 'Slug',
      selector: (row) => (
        <div className="pointer_cursor data_Table_title ">{row && row.slug ? row.slug : '-'}</div>
      ),
      sortable: true,
    },

    {
      name: 'Color',
      selector: (row) => (
        <div
          className={`status-value bg-${row.color}`}
        // style={{background:'red'}}
        >
          {row && row.color ? row.color : '-'}
          {/* {console.log('ROWW',row.color)} */}
        </div>
      ),
      sortable: true,
    },

    // {
    //   name: 'Color',
    //   selector: (row) => (
    //     <div
    //       className="status-value"
    //       // style={{ backgroundColor:row.color}}
    //     >
    //       {row && row.color ? row.color : '-'}
    //     </div>
    //   ),
    // },

    {
      name: 'Actions',
      cell: (row) => (
        <div className="action-btn">
          <div className="MailLogdelet-btn" color="info">
            <CIcon
              className="pointer_cursor"
              icon={cilPencil}
              onClick={() => navigate(`/master/status/${row._id}/edit`)}
            />
          </div>

          <div className="delet-btn">
            <CIcon
              className="pointer_cursor"
              icon={cilTrash}
              onClick={() => {
                setSelectedRowForModule(row)
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

  return (
    <>
      <SingleSubHeader moduleName="Status" subHeaderItems={subHeaderItems} />
      <CContainer fluid className="px-4">
        <CForm className="g-3 needs-validation" onSubmit={handleSubmit}>
          <CRow>
            <CCol md={4}>
              <CCard>
                <CCardHeader>Create Status</CCardHeader>
                <CCardBody>
                  <div className="mb-3">
                    <CFormLabel>
                      Status Name<span className="text-danger">*</span>
                    </CFormLabel>
                    <CInputGroup className="has-validation">
                      <input
                        type="text"
                        name="name"
                        value={initialValues.name ?? ''}
                        className="form-control"
                        placeholder="Name"
                        onChange={handleOnChange}
                      />
                    </CInputGroup>
                  </div>
                  <div className="mb-3">
                    <CFormLabel>
                      Status Slug<span className="text-danger">*</span>
                    </CFormLabel>
                    <CInputGroup className="has-validation">
                      <input
                        type="text"
                        name="slug"
                        value={initialValues.slug ?? ''}
                        className="form-control"
                        placeholder="Slug"
                        onChange={handleOnChange}
                      />
                    </CInputGroup>
                  </div>
                  <div className="mb-3">
                    <CFormLabel>
                      Select Color<span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormSelect
                      aria-label="Default select example"
                      value={initialValues.color ?? ''}
                      onChange={handleOnChange}
                      name="color"
                    >
                      <option value="primary">Select Color</option>
                      <option value="primary">Primary</option>
                      <option value="secondary">Secondary</option>
                      <option value="success">Success</option>
                      <option value="info">Info</option>
                      <option value="danger">Danger</option>
                      <option value="warning">Warning</option>
                    </CFormSelect>
                  </div>

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
                      navigate('/master/status')
                      setInitialValues({ initialValues })
                    }}
                  >
                    Cancel
                  </CButton>
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
                      paginationDefaultPage={defaultPage}
                      onChangePage={(page) => {
                        currentPage = page
                        setDefaultPage(parseInt(page))
                        updatePageQueryParam('page', currentPage)
                      }}
                      pagination
                      selectableRowsHighlight
                      highlightOnHover
                      paginationRowsPerPageOptions={RowsPerPage}
                      paginationPerPage={rowPerPage}
                      onChangeRowsPerPage={(value) => {
                        count = value
                        setRowPerPage(value)
                        updatePageQueryParam('count', value)
                        setSelectedRowForModule('status', value)
                      }}
                      onSelectedRowsChange={(state) => handleRowChange(state)}
                      clearSelectedRows={toggleCleared}
                    />
                  </div>
                )}
              </div>
              <DeleteModal
                visible={visible}
                userId={userId}
                moduleName="cms/status"
                currentPage={currentPage}
                rowPerPage={rowPerPage}
                setVisible={setVisible}
                deletionType="delete"
                handleClose={() => setVisible(false)}
                isDirectDelete={true}
              />
            </CCol>
          </CRow>
        </CForm>
      </CContainer>
    </>
  )
}

