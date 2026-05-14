import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
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
import { useEffectFormData } from 'src/helpers/formHelpers'
import CustomTooltip from 'src/components/custom/CustomTooltip'
import moment from 'moment'

const validationRules = {
  display_name: {
    required: true,
    minLength: 2,
  },
}

export default function CreateCompanies() {
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

  const [companiesData, setCompaniesData] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const toggleCleared = useSelector((state) => state.toggleCleared)
  const [typeValues, setTypeValues] = useState([])

  // Use local state for companies data
  const displayData = companiesData

  // Current companies data

  const [initialValues, setInitialValues] = useState({
    display_name: '',
    name: '',
  })

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
    setInitialValues({
      display_name: '',
      name: '',
    })
    if (isEditMode) fetchSingleData()
  }, [navigate])

  const fetchSingleData = async () => {
    try {
      console.log('Fetching single company data for ID:', id)
      const response = await new BasicProvider(`companies/show/${id}`).getRequest()
      console.log('Single company response:', response)

      // Check response structure - backend returns { status: 'success', data: companyData }
      if (response && response.status === 'success' && response.data) {
        const companyData = response.data
        console.log('Company data found:', companyData)
        setInitialValues({
          display_name: companyData.display_name || '',
          name: companyData.name || '',
        })
      } else if (response && response.data === 'Data not found') {
        // Company not found, redirect to create page
        dispatch({
          type: 'set',
          alert: { message: 'Company not found. Redirecting to create page.', type: 'warning' },
        })
        setAlertTimeout(dispatch)
        navigate('/admin/company/create')
      } else {
        console.log('Unexpected response structure:', response)
        dispatch({
          type: 'set',
          alert: { message: 'Failed to load company data.', type: 'danger' },
        })
        setAlertTimeout(dispatch)
      }
    } catch (error) {
      console.error('Error fetching company:', error)
      dispatch({
        type: 'set',
        alert: { message: 'Company not found. Redirecting to create page.', type: 'warning' },
      })
      setAlertTimeout(dispatch)
      navigate('/admin/company/create')
    }
  }

  useEffect(() => {
    if (rowPerPage) {
      fetchData()
    }
  }, [currentPage, rowPerPage, searchcurrentPage, search])

  // Fetch data on component mount and when not in edit mode
  useEffect(() => {
    if (!isEditMode) {
      fetchData()
    }
  }, [isEditMode])

  const fetchData = async () => {
    try {
      console.log('fetchData called - fetching companies data...')
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
          `companies/search?${HelperFunction.convertToQueryString(queryData)}`,
        ).getRequest()
      } else {
        response = await new BasicProvider(
          `companies?page=${currentPage}&count=${count}`,
        ).getRequest()
      }

      // Handle backend response structure - check response.status directly
      if (response && response.status === 'success' && response.data && response.data.data) {
        // Extract the companies array from the nested structure
        const companiesData = response.data.data || []
        const totalCount = response.data.total || 0

        // Set local state directly
        setCompaniesData(companiesData)
        setTotalCount(totalCount)
      } else {
        setCompaniesData([])
        setTotalCount(0)
      }

      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching companies:', error)
      setCompaniesData([])
      setTotalCount(0)
      setIsLoading(false)
    }
    setInitialValues({
      display_name: '',
      name: '',
    })
  }

  useEffect(() => {
    const fetchSelectedRows = async () => {
      const savedSelectedRows = await handleSelectedRowChange('companies')
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
    try {
      const data = await handleSubmitHelper(initialValues, validationRules, dispatch)
      if (data === false) return

      let response

      if (isEditMode) {
        // === Update Existing Company ===
        response = await new BasicProvider(`companies/update/${id}`, dispatch).patchRequest(
          initialValues,
        )

        if (response?.data?.status === 'success') {
          dispatch({
            type: 'set',
            alert: { message: 'Company updated successfully!', type: 'success' },
          })

          // Refresh updated list
          await fetchData()

          // Clear fields
          setInitialValues({ display_name: '', name: '' })

          // Navigate back to create page
          navigate('/admin/company/create')
        } else if (response?.data?.data === 'Data not found') {
          dispatch({
            type: 'set',
            alert: { message: 'Company not found. Please create a new company.', type: 'warning' },
          })
          navigate('/admin/company/create')
        } else {
          dispatch({
            type: 'set',
            alert: {
              message: 'Failed to update company. Please check backend logs.',
              type: 'danger',
            },
          })
        }
      } else {
        // === Create New Company ===
        response = await new BasicProvider(`companies/create`, dispatch).postRequest(initialValues)

        if (response?.data?.status === 'success') {
          dispatch({
            type: 'set',
            alert: { message: 'Company created successfully!', type: 'success' },
          })

          // Refresh data table first to show new company
          await fetchData()

          // Clear form fields
          setInitialValues({ display_name: '', name: '' })
        } else {
          dispatch({
            type: 'set',
            alert: {
              message: 'Failed to create company. Please check backend logs.',
              type: 'danger',
            },
          })
        }
      }

      // Common alert timeout
      setAlertTimeout(dispatch)
    } catch (error) {
      console.error('Error submitting company:', error)
      dispatch({
        type: 'set',
        alert: { message: 'Failed to save company. Please try again.', type: 'danger' },
      })
      setAlertTimeout(dispatch)
    }
    fetchData()
  }

  const columns = [
    {
      name: 'ID',
      selector: (row) => (
        <div className="pointer_cursor data_Table_title">{row && row.u_id ? row.u_id : '-'}</div>
      ),
      width: '10%',
    },
    {
      name: 'Display Name',
      selector: (row) => (
        <div
          className="pointer_cursor data_Table_title"
          onClick={() => navigate(`/admin/company/${row._id}/edit`)}
        >
          {row && row.display_name ? row.display_name : '-'}
        </div>
      ),
    },
    {
      name: 'Name',
      selector: (row) => (
        <div
          className="pointer_cursor data_Table_title"
          onClick={() => navigate(`/admin/company/${row._id}/edit`)}
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
              onClick={() => navigate(`/admin/company/${row._id}/edit`)}
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
    if (name === 'display_name') {
      // Auto-generate name from display_name
      const generatedName = value
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
      setInitialValues({
        ...initialValues,
        [name]: value,
        name: generatedName,
      })
    } else {
      setInitialValues({ ...initialValues, [name]: value })
    }
  }

  return (
    <>
      <SingleSubHeader moduleName="companies" />
      <CContainer fluid className="px-4">
        <CForm className="g-3 needs-validation" onSubmit={handleSubmit}>
          <CRow className="mb-4">
            <CCol md={4}>
              <CCard className="mb-4">
                <CCardHeader>Create Company</CCardHeader>
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
                    <CFormLabel className="my-1">Name</CFormLabel>
                    <CFormInput
                      type="text"
                      name="name"
                      onChange={handleOnChange}
                      placeholder="Name (auto-generated from display name)"
                      value={initialValues.name ?? ''}
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
                        navigate('/admin/company/create')
                        setInitialValues({
                          display_name: '',
                          name: '',
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
                <div className="mb-3">
                  <CButton
                    color="primary"
                    size="sm"
                    onClick={() => {
                      console.log('Manual refresh clicked')
                      fetchData()
                    }}
                  >
                    Refresh Data
                  </CButton>
                  <span className="ms-2 text-muted">
                    Data count: {companiesData.length} | Loading: {isLoading ? 'Yes' : 'No'}
                  </span>
                </div>
                {isLoading ? (
                  <div className="custom-table-shimmer">
                    <AppTableSkeleton />
                  </div>
                ) : (
                  <div className="datatable">
                    <DataTable
                      responsive="true"
                      columns={columns}
                      data={displayData}
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
                        setSelectedRowForModule('companies', value)
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
          moduleName="companies"
          currentPage={currentPage}
          rowPerPage={rowPerPage}
          setVisible={setVisible}
          deletionType="delete"
          handleClose={() => {
            setVisible(false)
            // Refresh data after delete
            fetchData()
          }}
          isDirectDelete={true}
        />
      </CContainer>
    </>
  )
}

