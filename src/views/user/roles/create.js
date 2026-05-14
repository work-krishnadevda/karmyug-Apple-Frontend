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
    link: '/master/roles',
    icon: cilSpreadsheet,
  },
]
export default function CreateRolls() {
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
  const data = useSelector((state) => state.data?.roles) || []
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
  //       const savedSelectedRows = await handleSelectedRowChange('roles')
  //       if (savedSelectedRows) {
  //         setRowPerPage(savedSelectedRows)
  //       }
  //     }
  //     fetchSelectedRows()
  //   }, [])


  const [initialValues, setInitialValues] = useState({
    display_name: '',
    description: '',
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
        const response = await new BasicProvider(`cms/roles/show/${id}`).getRequest()
        setInitialValues({ ...response.data })
      }
    } catch (error) {
      console.log(error)
    }
  }


  const fetchAllData = async (page, perPage) => {
    try {
      const response = await new BasicProvider(
        `cms/roles?page=${page}&count=${perPage}`,
      ).getRequest()
      dispatch({ type: 'set', data: { roles: response.data.data } })
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
      const savedSelectedRows = await handleSelectedRowChange('roles')
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

    // console.log('ROLL',initialValues);
    try {
      const data = await handleSubmitHelper(initialValues, validationRules, dispatch)
      if (data === false) return
      var response
      if (isEditMode) {
        response = await new BasicProvider(`roles/create/update/${id}`, dispatch).patchRequest(data)
        fetchAllData(page, rowPerPage)
      } else {
        response = await new BasicProvider(`roles/create`, dispatch).postRequest(data)
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
          className={`roles-value bg-${row.color}`}
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
    //       className="roles-value"
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
              onClick={() => navigate(`/master/roles/${row._id}/edit`)}
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
      <SingleSubHeader moduleName="Roles" subHeaderItems={subHeaderItems} />
      <CContainer fluid className="px-4">
        <CForm className="g-3 needs-validation" onSubmit={handleSubmit}>
          <CRow>
            <CCol md={4}>
              <CCard>
                <CCardHeader>Create Role</CCardHeader>
                <CCardBody>
                  <div className="mb-3">
                    <CFormLabel>
                      Display Name<span className="text-danger">*</span>
                    </CFormLabel>
                    <CInputGroup className="has-validation">
                      <input
                        type="text"
                        name="display_name"
                        value={initialValues.display_name ?? ''}
                        className="form-control"
                        placeholder="Display Name"
                        onChange={handleOnChange}
                      />
                    </CInputGroup>
                  </div>
                  <div className="mb-3">
                    <CFormLabel>
                      Description<span className="text-danger">*</span>
                    </CFormLabel>
                    <CInputGroup className="has-validation">
                      <CFormTextarea
                        type="text"
                        name="display_name"
                        value={initialValues.description ?? ''}
                        className="form-control"
                        placeholder="Description"
                        onChange={handleOnChange}
                        rows={3}
                      />
                    </CInputGroup>
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
                      navigate('/master/roles')
                      setInitialValues({ initialValues })
                    }}
                  >
                    Cancel
                  </CButton>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol md={8}>
              {/* <div className="datatable">
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
                        setSelectedRowForModule('roles', value)
                      }}
                      onSelectedRowsChange={(state) => handleRowChange(state)}
                      clearSelectedRows={toggleCleared}
                    />
                  </div>
                )}
              </div> */}
              <DeleteModal
                visible={visible}
                userId={userId}
                moduleName="cms/roles"
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

