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
  CSpinner,
} from '@coreui/react'

import DataTable from 'src/components/custom/table/AppDataTable'
import SingleSubHeader from 'src/components/custom/SingleSubHeader'
import BasicProvider from 'src/constants/BasicProvider'

import { RowsPerPage } from 'src/constants/variables'
import { DeleteModal } from 'src/helpers/deleteModalHelper'
import { handleSelectedRowChange, setSelectedRowForModule } from 'src/helpers/paginationCookie'
import { useEffectFormData } from 'src/helpers/formHelpers'
import handleSubmitHelper from 'src/helpers/submitHelper'
import { setAlertTimeout } from 'src/helpers/alertHelper'
import CustomTooltip from 'src/components/custom/CustomTooltip'
import AsyncSelect from 'react-select/async'
import moment from 'moment'


const validationRules = {

  subject: {
    required: true,
    minLength: 3,
  },
  type: {
    required: true,
  },
  role: {
    required: true,
  },

  // message: {
  //   required: true,
  // },

}

var subHeaderItems = [
  {
    name: 'Create',
    link: '/master/templates',
    icon: cilSpreadsheet,
  },
]

export default function Createtemplates() {
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
  const data = useSelector((state) => state.data?.templates) || []
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

  const [defaultOptions, setDefaultOptions] = useState([])

  const [isUpdateQueryParams, setIsUpdateQueryParams] = useState(false)

  const updatePageQueryParam = (paramName, page) => {
    if (isUpdateQueryParams) {

      const searchParams = new URLSearchParams(location.search)
      searchParams.set(paramName, page)
      navigate({ search: searchParams.toString() })
    }
    setIsUpdateQueryParams(true)
  }

  const [initialValues, setInitialValues] = useState({
    subject: '',
    message: '',
    type: '',
    role: [],
  })

  useEffect(() => {
    setInitialValues({
      subject: '',
      message: '',
      type: '',
      role: [],
    })
  }, [navigate])

  const fetchAllData = async (page, perPage) => {
    try {
      const response = await new BasicProvider(
        `templates?page=${page}&count=${perPage}`,
      ).getRequest()

      dispatch({ type: 'set', data: { templates: response.data.data } })
      dispatch({ type: 'set', totalCount: response.data.total })
      setIsLoading(false)
    } catch (error) {
      console.error(error)
      setIsLoading(false)
    }
  }

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
        const response = await new BasicProvider(`templates/show/${id}`).getRequest()
        setInitialValues({ ...response.data })
        let rolesId = response.data.role.map(id => id._id)
        setInitialValues((prev) => ({
          ...prev,
          role: rolesId
        }))

      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    const fetchSelectedRows = async () => {
      const savedSelectedRows = await handleSelectedRowChange('templates')
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
    setInitialValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const data = await handleSubmitHelper(initialValues, validationRules, dispatch)
      if (data === false) return

      var response
      if (isEditMode) {
        response = await new BasicProvider(`templates/update/${id}`, dispatch).patchRequest(data)
        fetchAllData(page, rowPerPage)
      } else {
        response = await new BasicProvider(`templates/create`, dispatch).postRequest(data)
        setInitialValues({
          subject: '',
          message: '',
          type: '',
          role: [],
        })
        fetchAllData(page, rowPerPage)
      }
      setAlertTimeout(dispatch)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    defaultOptionsRoles()
  }, [])

  const defaultOptionsRoles = async () => {
    try {
      const response = await new BasicProvider('roles').getRequest()
      const options = response.data.data.map((role) => ({
        label: role.display_name,
        slug: role.name,
        value: role._id,
      }))

      setDefaultOptions(options)
    } catch (error) {
      console.error(error)
    }
  }

  const loadOptionsRole = async (inputValue, callback) => {
    try {
      const response = await new BasicProvider(
        `roles/search?page=1&count=10&search=${inputValue}`,
      ).getRequest()
      const options = response.data.data.map((role) => ({
        label: role.display_name,
        slug: role.name,
        value: role._id,
      }))
      callback(options)
    } catch (error) {
      console.error(error)
    }
  }

  const handleRoleChange = (selectedOptions) => {
    const roles = selectedOptions ? selectedOptions.map((option) => option.value) : []
    setInitialValues((prevValues) => ({
      ...prevValues,
      role: roles,
    }))
  }

  const columns = [
    {
      name: 'Subject',
      selector: (row) => (
        <div
          className="data_table_colum">
          {row && row.subject ? row.subject : '-'}
        </div>
      ),
      center: 'true',
      width: '160px',
    },
    {
      name: 'Type',
      selector: (row) => <div className="data_table_colum">{row && row.type ? row.type : '-'}</div>,
      center: 'true',
      width: '100px',
    },
    {
      name: 'For Role',
      selector: (row) => (
        <div className="data_table_colum">
          {row && row.role?.length > 0
            ? row.role?.map((role) => role.display_name).join(', ')
            : '-'}
        </div>
      ),
      center: 'true',
      width: '150px',
    },
    // {
    //   name: 'Message',
    //   selector: (row) => (
    //     <div className="data_table_colum">{row && row.message ? row.message : '-'}</div>
    //   ),
    //   center: 'true',
    //   width: '150px',
    // },
    {
      name: 'Created',
      cell: (row) => (
        <CustomTooltip content={moment(row.created_at).format('DD MMM YYYY HH:mm:ss')}>
          <div style={{ padding: '5px 10px' }}>
            <div className="data_table_colum">{moment(row.created_at).fromNow()}</div>
          </div>
        </CustomTooltip>
      ),
      center: 'true',
      width: '140px',
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="action-btn">
          <div className="MailLogdelet-btn" color="info">
            <CIcon
              className="pointer_cursor"
              icon={cilPencil}
              onClick={() => navigate(`/master/template/${row._id}/edit`)}
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
      <SingleSubHeader moduleName="templates" subHeaderItems={subHeaderItems} />
      <CContainer fluid className="px-4">
        <CForm className="g-3 needs-validation" onSubmit={handleSubmit}>
          <CRow>
            <CCol md={4}>
              <CCard>
                <CCardHeader>Create Template</CCardHeader>
                <CCardBody>
                  <div className="mb-3">
                    <CFormLabel>
                      Subject<span className="text-danger">*</span>
                    </CFormLabel>
                    <CInputGroup className="has-validation">
                      <input
                        type="text"
                        name="subject"
                        value={initialValues.subject ?? ''}
                        className="form-control"
                        placeholder="Subject"
                        onChange={handleOnChange}
                      />
                    </CInputGroup>
                  </div>
                  <div className="mb-3">
                    <CFormLabel>
                      Type<span className="text-danger">*</span>
                    </CFormLabel>
                    <CInputGroup className="has-validation">
                      <CFormSelect
                        size="sm"
                        className="mb-3"
                        aria-label="Small select example"
                        type="text"
                        name="type"
                        value={initialValues.type ?? ''}
                        onChange={handleOnChange}
                      >
                        <option>Select Type</option>
                        <option value="simple">Simple</option>
                        <option value="hold">Hold</option>
                      </CFormSelect>
                    </CInputGroup>
                  </div>

                  <div className="mb-3">
                    <CFormLabel>
                      Select Role<span className="text-danger">*</span>

                    </CFormLabel>
                    <AsyncSelect
                      name="role"
                      loadOptions={(inputValue, callback) => loadOptionsRole(inputValue, callback)}
                      defaultOptions={defaultOptions}
                      isMulti
                      isSearchable

                      value={
                        Array.isArray(initialValues.role)
                          ? initialValues.role.map((productId) =>
                            defaultOptions.find(
                              (option) => option.value === productId,
                            ),
                          )
                          : []
                      }
                      getOptionLabel={(option) => option.label}
                      getOptionValue={(option) => option.value}
                      onChange={handleRoleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <CFormLabel>
                      Message
                    </CFormLabel>
                    <CInputGroup className="has-validation">
                      <textarea
                        type="text"
                        name="message"
                        value={initialValues.message ?? ''}
                        className="form-control"
                        placeholder="Message"
                        onChange={handleOnChange}
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
                      navigate('/master/templates')
                      setInitialValues({ initialValues })
                    }}
                  >
                    Cancel
                  </CButton>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol md={8}>
              <CCard>
                <CCardHeader>
                  Detail Table
                </CCardHeader>
                <CCardBody>
                  <div className="datatable">
                    {isLoading ? (
                      <div className="text-center">
                        <CSpinner size="sm" style={{ width: '3rem', height: '3rem' }} />
                        <p>Loading..</p>
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
                            setSelectedRowForModule('templates', value)
                          }}
                          onSelectedRowsChange={(state) => handleRowChange(state)}
                          clearSelectedRows={toggleCleared}
                        />
                      </div>
                    )}
                  </div>
                </CCardBody>


              </CCard>


              <DeleteModal
                visible={visible}
                userId={userId}
                moduleName="templates"
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

