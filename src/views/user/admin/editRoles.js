import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import {
  CButton,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CContainer,
  CForm,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CRow,
} from '@coreui/react'
import DataTable from 'src/components/custom/table/AppDataTable'
import AppTableSkeleton from 'src/components/custom/table/AppTableSkeleton'
import { RowsPerPage } from 'src/constants/variables'
import SingleSubHeader from 'src/components/custom/SingleSubHeader'
import BasicProvider from 'src/constants/BasicProvider'
import { setAlertTimeout } from 'src/helpers/alertHelper'
import handleSubmitHelper from 'src/helpers/submitHelper'
import { useEffectFormData } from 'src/helpers/formHelpers'
import { handleSelectedRowChange, setSelectedRowForModule } from 'src/helpers/paginationCookie'
import CustomTooltip from 'src/components/custom/CustomTooltip'

import moment from 'moment'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash } from '@coreui/icons'


const validationRules = {
  display_name: {
    required: true,
    minLength: 2,
  },
}

export default function CreateUnit() {
  const dispatch = useDispatch()
  var params = useParams()

  const location = useLocation()
  const query = new URLSearchParams(location.search)

  var count = query.get('count') || 20
  var currentPage = query.get('page') || 1
  var search = query.get('search') || ''
  let [defaultPage, setDefaultPage] = useState(currentPage)

  const [otherSelected, setOtherSelected] = useState(false)
  const [userId, setuserId] = useState([])
  const [visible, setVisible] = useState(false)
  const navigate = useNavigate()
  const id = params.id
  const isEditMode = !!id
  const [searchValue, setSearchValue] = useState('')
  const [rowPerPage, setRowPerPage] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchcurrentPage, setSearchCurrentPage] = useState(null)


  const data = useSelector((state) => state.data?.roles) || []
  const totalCount = useSelector((state) => state.totalCount)
  const toggleCleared = useSelector((state) => state.toggleCleared)
  const [typeValues, setTypeValues] = useState([])


  const [initialValues, setInitialValues] = useState({
    display_name: '',
    description: '',
    color: '#008FFF',
    permission: [],
  })

  const [permissions, setPermissions] = useState([])
  const [types, setTypes] = useState([])

  const [selectedPermissions, setSelectedPermissions] = useState([])

  useEffect(() => {
    setInitialValues({
      display_name: '',
      type: '',
      color: '',
      description: '',
    })
    // dispatch({ type: 'set', validations: [] })
    if (isEditMode) fetchSingleData()
  }, [navigate])
  const fetchSingleData = async () => {
    try {
      let response = await new BasicProvider(`roles/show/${id}`, dispatch).getRequest()
      const permissionIds = response.data.permission.map((permission) => permission._id)
      setSelectedPermissions(permissionIds)
      setInitialValues({
        display_name: response.data.display_name,
        description: response.data.description,
        name: response.data.name,
        color: response.data.color,
        permission: permissionIds,
      })
    } catch (error) {
      dispatch({ type: 'set', catcherror: error.data })
    }
  }

  const [isUpdateQueryParams, setIsUpdateQueryParams] = useState(false)

  const updatePageQueryParam = (paramName, page) => {
    if (isUpdateQueryParams) {

      const searchParams = new URLSearchParams(location.search)
      searchParams.set(paramName, page)
      navigate({ search: searchParams.toString() })
    }
    setIsUpdateQueryParams(true)
  }

  useEffect(() => {
    if (rowPerPage) {
      fetchData()
    }
  }, [currentPage, rowPerPage, searchcurrentPage, search])


  const fetchData = async () => {
    try {
      let performSearch = false
      var queryData = {}
      for (const [key, value] of query.entries()) {
        if (key !== 'page' && key !== 'count') {
          queryData[key] = value
          if (value !== '' && value !== null) {
            performSearch = true
          }
        }
      }
      var response
      if (performSearch) {
        queryData['page'] = currentPage
        queryData['count'] = count
        response = await new BasicProvider(
          `roles/search?${HelperFunction.convertToQueryString(queryData)}`,
        ).getRequest()
      } else {
        response = await new BasicProvider(`roles?page=${currentPage}&count=${count}`).getRequest()
      }
      dispatch({ type: 'set', data: { roles: response.data.data } })
      dispatch({ type: 'set', totalCount: response.data.total })

      const typeSet = new Set(response.data.data.map((obj) => obj.type))
      setTypeValues([...typeSet])

      setIsLoading(false)
    } catch (error) {
      console.error(error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const fetchSelectedRows = async () => {
      const savedSelectedRows = await handleSelectedRowChange('roles')
      if (savedSelectedRows && !count) {
        setRowPerPage(savedSelectedRows)
      } else {
        setRowPerPage(count)
      }
    }
    fetchSelectedRows()
  }, [count])


  const handleRowChange = useCallback((state) => {
    dispatch({ type: 'set', selectedrows: state.selectedRows })
  }, [])



  const handleSubmit = async (e) => {
    e.preventDefault()
    initialValues.permission = selectedPermissions

    try {
      const data = await handleSubmitHelper(initialValues, validationRules, dispatch)
      if (data === false) {
        return
      }

      var response
      if (isEditMode) {
        response = await new BasicProvider(`roles/update/${id}`, dispatch).patchRequest(
          initialValues,
        )
      } else {
        response = await new BasicProvider(`roles/create`, dispatch).postRequest(initialValues)
        setInitialValues({
          display_name: '',
          type: '',
          color: '',
          description: '',
        })
        // navigate(`/ecommerce/units/${response.data._id}/edit`)
      }
      setAlertTimeout(dispatch)
      fetchData()
    } catch (error) {
      console.log(error)
    }
  }

  const handleOnChange = (e) => {
    const { name, value } = e.target
    setInitialValues({ ...initialValues, [name]: value })
  }


  const columns = [
    // {
    //   name: 'ID',
    //   selector: (row) => (
    //     <div
    //       className="pointer_cursor data_Table_title"

    //     >
    //       {row && row.u_id ? row.u_id : '-'}
    //     </div>
    //   ),
    //   width: '10%'
    // },
    {
      name: 'Display Name',
      selector: (row) => (
        <div
          className="pointer_cursor data_Table_title"
          onClick={() => navigate(`/admin/role/${row._id}/edit`)}
        >
          {row && row.display_name ? row.display_name : '-'}
        </div>
      ),
    },
    {
      name: 'Color',
      selector: (row) => (
        <div
          className="pointer_cursor data_Table_title p-2 role-border-radius"
          style={{ background: row.color, color: '#fff' }}
        >
          {row.color}
        </div>
      ),
    },
    {
      name: 'Name',
      selector: (row) => (
        <div
          className="pointer_cursor data_Table_title"
          onClick={() => navigate(`/role/${row._id}/edit`)}
        >
          {row && row.name ? row.name : '-'}
        </div>
      ),
    },

    {
      name: 'Created',
      cell: (row) => (
        <CustomTooltip content={moment(row.created_at).format('DD MMM YYYY HH:mm:ss')}>
          <div style={{ padding: '5px 10px' }}>
            <div className="data_table_colum">{moment(row.created_at).fromNow()}</div>
          </div>
        </CustomTooltip>
      ),
    },


    {
      name: 'Actions',
      cell: (row) => (
        <div className="action-btn">
          <div className="MailLogdelet-btn" color="info">
            <CIcon
              className="pointer_cursor"
              icon={cilPencil}
              onClick={() => navigate(`/admin/role/${row._id}/edit`)}
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

  return (
    <>
      <SingleSubHeader moduleName="Roles" />
      <CContainer fluid className="px-4">
        <CForm className="g-3 needs-validation" onSubmit={handleSubmit}>
          <CRow>
            <CCol md={4}>
              <CCard className="mb-4">
                <CCardHeader>Edit Role</CCardHeader>
                <CCardBody>
                  <div className="my-3">
                    <CFormLabel className="my-1">
                      Display Name<span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput
                      type="text"
                      name="display_name"
                      onChange={handleOnChange}
                      placeholder="Display Name"
                      value={initialValues.display_name ?? ''}
                    />
                  </div>

                  <div className="my-3">
                    <CFormLabel className="my-1">
                      Description<span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormTextarea
                      type="text"
                      name="description"
                      onChange={handleOnChange}
                      placeholder="Description"
                      rows={3}
                      value={initialValues.description ?? ''}
                    />
                  </div>
                  <div className="mb-3">
                    <CFormLabel>
                      color<span className="text-danger">*</span>
                    </CFormLabel>
                    <input
                      type="color"
                      name="color"
                      value={initialValues.color}
                      className="form-control mt-3"
                      onChange={handleOnChange}
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
                        navigate('/admin/role/create')
                        setInitialValues({
                          display_name: '',
                          type: '',
                          description: '',
                        })
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
                {isLoading ? (
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
                        currentPage = page
                        setDefaultPage(parseInt(page))
                        updatePageQueryParam('page', currentPage)
                      }}
                      highlightOnHover
                      pagination
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
              </div>
            </CCol>
          </CRow>
        </CForm>
      </CContainer>
    </>
  )
}

