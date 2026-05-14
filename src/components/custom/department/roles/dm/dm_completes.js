import { cilCloudDownload, cilInfo, cilPencil, cilSpreadsheet, cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CContainer,
  CBadge,
  CSpinner,
  CCard,
  CCardBody,
  CRow,
  CCol,
  CFormLabel,
  CButton,
} from '@coreui/react'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'
import DataTable from 'src/components/custom/table/AppDataTable'
import AppTableSkeleton from 'src/components/custom/table/AppTableSkeleton'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import SubHeader from 'src/components/custom/SubHeader'
import { RowsPerPage, statusValue } from 'src/constants/variables'
// import HelperFunction from '../../helpers/HelperFunctions'
import { handleSelectedRowChange, setSelectedRowForModule } from 'src/helpers/paginationCookie'
import { DeleteModal, handleConfirmDelete } from 'src/helpers/deleteModalHelper'
import BasicProvider from 'src/constants/BasicProvider'
import noImage from 'src/assets/images/noImage.png'
import CustomTooltip from 'src/components/custom/CustomTooltip'
import HelperFunction from 'src/helpers/HelperFunctions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye } from '@fortawesome/free-solid-svg-icons'
import SingleSubHeader from 'src/components/custom/SingleSubHeader'
import { customSuccessMSG } from 'src/helpers/alertHelper'

import AsyncSelect from 'react-select/async'
import handleSubmitHelper from 'src/helpers/submitHelper'

const validationRules = {}

export default function DM_Completes() {
  const navigate = useNavigate()
  const [rowPerPage, setRowPerPage] = useState(20)
  const location = useLocation()

  const [userId, setuserId] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const [visible, setVisible] = useState(false)
  const [searchcurrentPage, setSearchCurrentPage] = useState(null)
  const query = new URLSearchParams(location.search)
  var count = query.get('count') || rowPerPage
  var currentPage = parseInt(query.get('page') || 1)
  var search = query.get('search') || ''
  let [defaultPage, setDefaultPage] = useState(currentPage)
  const dispatch = useDispatch()
  const data = useSelector((state) => state.data?.completedCases)
  const toggleCleared = useSelector((state) => state.toggleCleared)
  const totalCount = useSelector((state) => state.totalCount)

  const [isUpdateQueryParams, setIsUpdateQueryParams] = useState(false)

  const [signedUrls, setSignedUrls] = useState({})
  const [urlLoading, setUrlLoading] = useState({})

  const fetchSignedUrl = async (fileId, fileKey) => {
    if (!fileKey || urlLoading[fileId]) return
    setUrlLoading((prev) => ({ ...prev, [fileId]: true }))
    try {
      const response = await new BasicProvider(
        `cms/files/signed-url?key=${fileKey}`,
        dispatch,
      ).getRequest()
      setSignedUrls((prev) => ({ ...prev, [fileId]: response.data.url }))
    } catch (error) {
      console.error(`Error fetching signed URL for ${fileKey}:`, error)
      setSignedUrls((prev) => ({ ...prev, [fileId]: 'error' }))
    } finally {
      setUrlLoading((prev) => ({ ...prev, [fileId]: false }))
    }
  }

  const updatePageQueryParam = (paramName, page) => {
    if (isUpdateQueryParams) {
      const searchParams = new URLSearchParams(location.search)
      searchParams.set(paramName, page)
      navigate({ search: searchParams.toString() })
    }
    setIsUpdateQueryParams(true)
  }

  let loggedinUserRole = useSelector((state) => state?.userRole)

  useEffect(() => {
    if (rowPerPage) {
      fetchData()
    }
  }, [currentPage, rowPerPage, searchcurrentPage, search])

  const fetchData = async () => {
    try {
      // setDefaultPage(currentPage)
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
      // console.log(performSearch);
      if (performSearch) {
        queryData['page'] = currentPage
        queryData['count'] = count
        response = await new BasicProvider(
          `cases/search?${HelperFunction.convertToQueryString(queryData)}`,
        ).getRequest()
        // console.log(response)
      } else {
        response = await new BasicProvider(
          `cases/completed?page=${currentPage}&count=${count}`,
        ).getRequest()
        // console.log( 'LOLOLOLs',response)
      }

      dispatch({ type: 'set', data: { completedCases: response.data.data } })
      dispatch({ type: 'set', totalCount: response.data.total })
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)

      console.error(error)
    }
  }

  const handleRowChange = useCallback((state) => {
    const rows = state.selectedRows
    const rowsId = rows.map((item) => item._id)
    dispatch({ type: 'set', selectedrows: rowsId })
  }, [])

  const handleDownload = async (fileId, fileKey, name) => {
    try {
      if (!signedUrls[fileId]) {
        await fetchSignedUrl(fileId, fileKey)
      }
      const url = signedUrls[fileId]
      if (url && url !== 'error') {
        const link = document.createElement('a')
        link.href = url
        link.download = name || fileKey.split('/').pop()
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const columns = [
    {
      name: 'Applicant Name ',
      selector: (row) => (
        <div
          onClick={() =>
            navigate(`/case/${row._id}/update/${'sdm-form'}/by/${loggedinUserRole.name}`)
          }
          className="data_table_colum"
        >
          {row && row.applicant_name ? row.applicant_name : '-'}
        </div>
      ),
      width: '15%',
    },
    {
      name: 'LOS Number',
      selector: (row) => (
        <div className="data_table_colum">{row && row.los_number ? row.los_number : '-'}</div>
      ),
    },
    {
      name: 'Finance Name',
      selector: (row) => (
        <div className="data_table_colum">
          {row && row?.finance_name?.name ? row.finance_name.name : '-'}
        </div>
      ),
    },
    {
      name: 'Case Of Branch',
      selector: (row) => (
        <div className="data_table_colum">
          {row && row.case_of_branch ? row.case_of_branch : '-'}
        </div>
      ),
    },
    {
      name: 'Visit By',
      selector: (row) => (
        <div className="data_table_colum">
          <div className="">{row?.accepted_by?.name ? row.accepted_by?.name : '-'}</div>
        </div>
      ),
    },

    {
      name: 'Assigned TO',
      selector: (row) => (
        <div className="data_table_colum">{row && row?.rc?.name ? row.rc.name : '-'}</div>
      ),
    },
    {
      name: 'Status',
      selector: (row) => (
        <div className="data_table_colum">
          {row && row?.status ? (
            <p className="rounded-pill mb-0 text-capitalize">
              <CBadge
                style={{
                  background:
                    statusValue.find((item) => item.label === row?.status)?.bgcolor || '#3399FF',
                }}
              >
                {row.status === 'updated by bm' ? (
                  'Updated By You'
                ) : row.status === 'updated by coo' ? (
                  'Updated By COO'
                ) : (
                  <>
                    {
                      row.status
                        .toLowerCase() // Convert status to lowercase
                        .replace(/\b(fe|bm|coo)\b/g, (match) => match.toUpperCase()) // Convert short forms to uppercase
                    }
                  </>
                )}
              </CBadge>
            </p>
          ) : (
            '-'
          )}
        </div>
      ),
      width: '11%',
    },

    {
      name: 'Actions',
      cell: (row) => (
        <div className="action-btn me-3">
          {row.status === 'concern by fe' && (
            <div className="edit-btn pointer_cursor">
              <FontAwesomeIcon icon={faEye} />
            </div>
          )}
          <div className="edit-btn">
            <CIcon
              className="pointer_cursor"
              icon={cilPencil}
              onClick={() =>
                navigate(`/case/${row._id}/update/details/by/${loggedinUserRole.name}`)
              }
            />
          </div>

          {row?.dm_attechment && (
            <div className="download-btn edit-btn">
              <CIcon
                className="pointer_cursor"
                icon={cilCloudDownload}
                onClick={() =>
                  handleDownload(
                    row._id, // use id as key for signedUrls
                    row.dm_attechment.filepath,
                    row.dm_attechment.name,
                  )
                }
              />
            </div>
          )}
        </div>
      ),
      ignoreRowClick: true,
      allowoverflow: true,
      button: 'true',
    },
  ]

  //===================== RE Assign to RC ===================

  const selectedRow = useSelector((state) => state.selectedrows)

  const [defaultOptionRC, setdefaultOptionRC] = useState([])

  const [initialValues, setInitialValues] = useState({
    rc: '',
    ids: [],
  })

  useEffect(() => {
    fetchDefaultOptionForDM()
    setInitialValues((prev) => ({ ...prev, ids: selectedRow }))
  }, [selectedRow])

  const fetchDefaultOptionForDM = async () => {
    try {
      let slugs = [process.env.REACT_APP_RC]
      const queryString = slugs.join(',')
      const url = `admins/get-multiple?slugs=${encodeURIComponent(queryString)}`
      const response = await new BasicProvider(url).getRequest()

      const options = response.data.map((item) => ({
        label: item.name,
        value: item._id,
      }))
      setdefaultOptionRC(options)
    } catch (error) {
      console.error(error)
    }
  }

  const loadOptionsForRC = async (inputValue, callback) => {
    try {
      let slugs = [process.env.REACT_APP_RC]
      const queryString = slugs.join(',')
      const response = await new BasicProvider(
        `admins/get-multiple?slugs=${encodeURIComponent(queryString)}&search=${inputValue}`,
      ).getRequest()

      const options = response.data.map((item) => ({
        label: item.name,
        value: item._id,
      }))

      callback(options)
    } catch (error) {
      console.error(error)
    }
  }

  const reAssignToRC = async () => {
    try {
      const data = await handleSubmitHelper(initialValues, validationRules, dispatch)
      if (data === false) return

      let response = await new BasicProvider(`cases/re-assign/rc`, dispatch).patchRequest(data)
      if (response.status === 'success') {
        setInitialValues({
          rc: '',
          ids: [],
        })
        dispatch({ type: 'set', selectedrows: [] })
        customSuccessMSG(dispatch, 'Re-Assigned Successfuly')
      }
    } catch (error) {
      console.log(error)
      dispatch({ type: 'set', validations: [error.data] })
    }
  }

  return (
    <>
      <SingleSubHeader moduleName={'My Draft Done'} />
      <CContainer flui>
        <>
          <>
            {Array.isArray(selectedRow) && selectedRow.length > 0 && (
              <CCard className="mb-4 mt-4">
                <CCardBody>
                  <CRow>
                    <CCol md={6}>
                      {/* <CFormLabel>Select RC</CFormLabel> */}
                      <AsyncSelect
                        name="rc"
                        placeholder="Select RC"
                        loadOptions={(inputValue, callback) =>
                          loadOptionsForRC(inputValue, callback)
                        }
                        defaultOptions={defaultOptionRC}
                        value={
                          defaultOptionRC.find(
                            (option) =>
                              option.value === (initialValues?.rc?._id || initialValues?.rc),
                          ) || null
                        }
                        getOptionLabel={(option) => option.label}
                        getOptionValue={(option) => option.value}
                        onChange={(selected) => {
                          setInitialValues({ ...initialValues, rc: selected.value })
                        }}
                      />
                    </CCol>
                    <CCol md={6} className="d-flex align-iten-center justify-content-end">
                      <div>
                        <span className="selected_row">{selectedRow?.length} selected</span>
                        {initialValues.rc && (
                          <CButton className="add_new" onClick={reAssignToRC}>
                            Re-Assign RC
                          </CButton>
                        )}
                      </div>
                    </CCol>
                  </CRow>
                </CCardBody>
              </CCard>
            )}
            {!isLoading ? (
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
                  selectableRows
                  selectableRowsHighlight
                  highlightOnHover
                  paginationRowsPerPageOptions={RowsPerPage}
                  paginationPerPage={rowPerPage}
                  onChangeRowsPerPage={(value) => {
                    count = value
                    setRowPerPage(value)
                    updatePageQueryParam('count', value)
                    setSelectedRowForModule('cases', value)
                  }}
                  onSelectedRowsChange={(state) => handleRowChange(state)}
                  clearSelectedRows={toggleCleared}
                />
              </div>
            ) : (
              <AppTableSkeleton />
            )}
          </>

          <DeleteModal
            visible={visible}
            userId={userId}
            moduleName="cases"
            currentPage={currentPage}
            rowPerPage={rowPerPage}
            setVisible={setVisible}
            deletionType="trash"
            handleClose={() => setVisible(false)}
          />
        </>
      </CContainer>
    </>
  )
}

