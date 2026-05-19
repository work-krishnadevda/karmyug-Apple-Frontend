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
  CFormTextarea,
  CRow,
} from '@coreui/react'

import AppFormSelect from 'src/components/form/AppFormSelect'
import DataTable from 'src/components/custom/table/AppDataTable'
import AppTableSkeleton from 'src/components/custom/table/AppTableSkeleton'
import SingleSubHeader from 'src/components/custom/SingleSubHeader'
import BasicProvider from 'src/constants/BasicProvider'

import { RowsPerPage } from 'src/constants/variables'
import { DeleteModal } from 'src/helpers/deleteModalHelper'
import { handleSelectedRowChange, setSelectedRowForModule } from 'src/helpers/paginationCookie'
import HelperFunction from 'src/helpers/HelperFunctions'

import { setAlertTimeout } from 'src/helpers/alertHelper'
import handleSubmitHelper from 'src/helpers/submitHelper'
import { useEffectFormData } from 'src/helpers/formHelpers'

const validationRules = {
  name: {
    required: true,
    minLength: 3,
  },
  type: {
    required: true,
  },
}
var subHeaderItems = [
  {
    name: 'Create',
    link: '/master/tags',
    icon: cilSpreadsheet,
  },
]
export default function CreateTags() {
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
  const data = useSelector((state) => state.data?.tags) || []
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

  const [initialValues, setInitialValues] = useState({
    name: '',
    type: '',
  })

  useEffect(() => {
    if (rowPerPage) fetchAllData(page, rowPerPage)
  }, [page, rowPerPage])

  useEffect(() => {
    dispatch({ type: 'set', validations: [] })
    fetchSingleData()
  }, [navigate])

  useEffect(() => {
    setInitialValues({
      name: '',
      type: '',
    })
  }, [navigate])

  const fetchSingleData = async () => {
    try {
      if (isEditMode) {
        const response = await new BasicProvider(`cms/tags/show/${id}`).getRequest()
        setInitialValues({ ...response.data })
      }
    } catch (error) {
      console.log(error)
    }
  }

  const fetchAllData = async (page, perPage) => {
    try {
      const response = await new BasicProvider(
        `cms/tags?page=${page}&count=${perPage}`,
      ).getRequest()
      dispatch({ type: 'set', data: { tags: response.data.data } })
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
      const savedSelectedRows = await handleSelectedRowChange('tag')
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
        response = await new BasicProvider(`cms/tags/update/${id}`).patchRequest(initialValues)
      } else {
        response = await new BasicProvider(`cms/tags/create`).postRequest(initialValues)
        // navigate(`/master/tags/${response.data._id}/edit`)
        setInitialValues({
          name: '',
          type: '',
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
      selector: (row) => <div className="pointer_cursor data_Table_title">{row.name}</div>,
      sortable: true,
    },
    {
      name: 'Slug',
      selector: (row) => <div className="data_table_colum">{row.slug}</div>,
      sortable: true,
    },
    {
      name: 'Type',
      selector: (row) => <div className="data_table_colum">{row.type}</div>,
      sortable: true,
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="action-btn">
          <div className="edit-btn">
            <CIcon
              className="pointer_cursor"
              icon={cilPencil}
              onClick={() => navigate(`/master/tags/${row._id}/edit`)}
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
      allowOverflow: true,
      button: true,
    },
  ]

  const handleOnChange = (e) => {
    const { name, value } = e.target
    if (name === 'name') {
      const categoriesArray = value.split('\n').map((category) => category)
      setInitialValues('name', categoriesArray)
    }
    setInitialValues({ ...initialValues, [name]: value })
  }

  return (
    <>
      <SingleSubHeader moduleName="Tags" subHeaderItems={subHeaderItems} />
      <CContainer fluid className="px-4">
        <CForm className="g-3 needs-validation" onSubmit={handleSubmit}>
          <CRow>
            <CCol md={4}>
              <CCard className="mb-4">
                <CCardHeader> Tags</CCardHeader>
                <CCardBody>
                  <div className="my-2">
                    <CFormLabel>
                      Create Tag<span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormTextarea
                      name="name"
                      value={
                        Array.isArray(initialValues.name)
                          ? initialValues.name.join('\n')
                          : initialValues.name
                      }
                      id="validationCustom05"
                      rows={5}
                      onChange={handleOnChange}
                      // onChange={(e) => {
                      //   if (e.target.name === 'name') {
                      //     const categoriesArray = e.target.value
                      //       .split('\n')
                      //       .map((category) => category.trim())
                      //     setInitialValues({ ...initialValues, name: categoriesArray })
                      //   } else {
                      //     setInitialValues({ ...initialValues, name: e.target.value })
                      //   }
                      // }}
                    />
                  </div>
                  <AppFormSelect
                    className="mb-3"
                    name="type"
                    value={initialValues.type}
                    selected={initialValues.type}
                    aria-label="Default select Type"
                    options={[
                      { label: 'Select Type', value: '' },
                      ...typeValues.map((name) => ({ label: name, value: name })),
                      { label: 'Other', value: 'other' },
                    ]}
                    onChange={(e) => {
                      const type = e.target.value
                      setSelectedType(type)
                      if (type === 'other') {
                        setOtherSelected(true)

                        {
                          'type', initialValues.type
                        }
                      } else {
                        setOtherSelected(false)
                        handleOnChange(e)
                      }
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
                        setInitialValues({
                          name: '',
                          type: '',
                        })
                        navigate('/master/tags')
                      }}
                    >
                      Cancel
                    </CButton>
                  </CCardFooter>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol md={8}>
              {/* {rowPerPage && ( */}
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
                        setSelectedRowForModule('tag', currentRowsPerPage)
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
          moduleName="cms/tags"
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

