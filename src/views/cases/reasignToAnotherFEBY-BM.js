import { cilInfo, cilPencil, cilSpreadsheet, cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CContainer,
  CBadge,
  CCard,
  CCardBody,
  CRow,
  CCol,
  CButton,
  CFormLabel,
  CSpinner,
} from '@coreui/react'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'
import DataTable from 'src/components/custom/table/AppDataTable'
import AppTableSkeleton from 'src/components/custom/table/AppTableSkeleton'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import SubHeader from 'src/components/custom/SubHeader'
import { holdStatuses, RowsPerPage, statusValue } from 'src/constants/variables'
// import HelperFunction from '../../helpers/HelperFunctions'
import { handleSelectedRowChange, setSelectedRowForModule } from 'src/helpers/paginationCookie'
import { DeleteModal, handleConfirmDelete } from 'src/helpers/deleteModalHelper'
import BasicProvider from 'src/constants/BasicProvider'
import noImage from 'src/assets/images/noImage.png'
import CustomTooltip from 'src/components/custom/CustomTooltip'
import HelperFunction from 'src/helpers/HelperFunctions'

import AsyncSelect from 'react-select/async'
import handleSubmitHelper from 'src/helpers/submitHelper'
import { customSuccessMSG } from 'src/helpers/alertHelper'
import Hold from 'src/components/custom/popup/hold'
import UnHold from 'src/components/custom/popup/unhold'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faMessage, faRefresh } from '@fortawesome/free-solid-svg-icons'
import View_FE_Note from 'src/components/custom/popup/view_fe_note'
import { CommonMessageShowModel } from 'src/components/custom/popup/commonMessageModel'
import SingleSubHeader from 'src/components/custom/SingleSubHeader'

const validationRules = {
  // dm: {
  //   required: true,
  // },
}

export default function ReAssignToAnotherFE() {
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
  var search = query.get('search_input') || ''
  let [defaultPage, setDefaultPage] = useState(currentPage)
  const dispatch = useDispatch()
  const data = useSelector((state) => state.data?.cases)
  const toggleCleared = useSelector((state) => state.toggleCleared)
  const totalCount = useSelector((state) => state.totalCount)

  let loggedinUserRole = useSelector((state) => state?.userRole)

  const [isUpdateQueryParams, setIsUpdateQueryParams] = useState(false)

  const updatePageQueryParam = (paramName, page) => {
    if (isUpdateQueryParams) {

      const searchParams = new URLSearchParams(location.search)
      searchParams.set(paramName, page)
      navigate({ search: searchParams.toString() })
    }
    setIsUpdateQueryParams(true)
  }

  const [hoveredRows, setHoveredRows] = useState({})
  const [caseId, setCaseId] = useState('')
  const [viewFeNoteVisible, setViewFeNoteVisible] = useState(false)

  const [visibleHoldModel, setVisibleHoldModel] = useState(false)
  const [unHoldVisible, setUnHoldVisible] = useState(false)

  let [flag, setFlag] = useState(false)

  const [commonMessageShowModel, setCommonMessageShowModel] = useState(false)

  useEffect(() => {
    if (rowPerPage) {
      fetchData()
    }
  }, [currentPage, rowPerPage, searchcurrentPage, search, flag])

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
      var response
      if (performSearch) {
        queryData['page'] = currentPage
        queryData['count'] = count
        response = await new BasicProvider(
          `cases/filter?${HelperFunction.convertToQueryString(queryData)}`,
        ).getRequest()
      } else {
        response = await new BasicProvider(
          `cases?page=${currentPage}&count=${count}&forreassignbybm=true`,
        ).getRequest()
      }

      dispatch({ type: 'set', data: { cases: response.data.data } })
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

  const handelUnholdCase = async () => {
    try {
      if (caseId) {
        let response = await new BasicProvider(`cases/update/${caseId}`, dispatch).patchRequest({
          status: 'unhold by sdm',
          type: 'sdm call',
        })
        if (response) {
          close()
          fetchData()
        }
      }
    } catch (error) {
      console.log('error', error)
    }
  }

  const handleMouseEnter = (rowId, type) => {
    setHoveredRows((prevState) => ({
      ...prevState,
      [rowId]: type,
    }))
  }

  const handleMouseLeave = (rowId) => {
    setHoveredRows((prevState) => ({
      ...prevState,
      [rowId]: null, // Reset to null or remove the key to clear the hover effect
    }))
  }



  const columns = [
    {
      name: 'Applicant Name',
      selector: (row) => (
        <div
          className="data_table_colum"
          onClick={() => {
            setCaseId(row._id)
            setCommonMessageShowModel(!commonMessageShowModel)
          }}
        >
          <div className="">{row && row.applicant_name ? row.applicant_name : '-'}</div>
          <div className="fs-12 pt-1">
            {row && row.contact_number_1 ? row.contact_number_1 : '-'}
          </div>
        </div>
      ),
      // center:true,
      width: '20%',
    },

    {
      name: 'Finance Name',
      selector: (row) => (
        <div className="data_table_colum">
          <div className="">{row && row?.finance_name?.name ? row.finance_name.name : '-'}</div>
          <div className="fs-12 pt-1">{row && row?.los_number ? row?.los_number : '-'}</div>
        </div>
      ),
      //   width: '15%',
    },
    {
      name: 'RA Branch',
      selector: (row) => (
        <div className="data_table_colum">
          <div className="">{row && row?.ra_branch?.name ? row?.ra_branch?.name : '-'}</div>
          <div className="fs-12 pt-1">{row && row.case_of_branch ? row.case_of_branch : '-'}</div>
        </div>
      ),
    },
    {
      name: 'Accepted By',
      selector: (row) => (
        <div className="data_table_colum">
          <div className="">{row?.accepted_by?.name ? row.accepted_by?.name : '-'}</div>
        </div>
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
                {row.status.toLowerCase().replace(/\b(fe|rc)\b/g, (match) => match.toUpperCase())}
              </CBadge>
            </p>
          ) : (
            '-'
          )}
        </div>
      ),
      width: '15%',
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="action-btn me-3">
          {
            // Show Hold button when not hovered and status is one of the hold statuses
            !hoveredRows[row._id] && holdStatuses.includes(row.status) && (
              <div className="holded-btn" onMouseEnter={() => handleMouseEnter(row._id, 'holded')}>
                Hold
              </div>
            )
          }

          {!hoveredRows[row._id] && !holdStatuses.includes(row.status) && (
            <div className="live-btn" onMouseEnter={() => handleMouseEnter(row._id, 'live')}>
              <div className="live_point"></div>
              Live
            </div>
          )}

          {row && row.fe_note && (
            <CustomTooltip content={'View FE Note'}>
              <div
                onClick={() => {
                  setCaseId(row._id)
                  setViewFeNoteVisible(!viewFeNoteVisible)
                }}
                className="edit-btn pointer_cursor px-2"
              >
                <FontAwesomeIcon icon={faMessage} />
              </div>
            </CustomTooltip>
          )}

          {
            // Show Hold button when row is hovered with 'live' state
            hoveredRows[row._id] === 'live' && (
              <CButton
                onClick={() => {
                  setCaseId(row._id)
                  setVisibleHoldModel(true)
                }}
                variant="outline"
                size="sm"
                color="danger"
                onMouseLeave={() => handleMouseLeave(row._id)}
              >
                Hold
              </CButton>
            )
          }

          {
            // Show Unhold button when row is hovered with 'holded' state and status is one of the hold statuses
            hoveredRows[row._id] === 'holded' && holdStatuses.includes(row.status) && (
              <CButton
                onClick={() => {
                  setCaseId(row._id)
                  setUnHoldVisible(true)
                }}
                variant="ghost"
                size="sm"
                color="success"
                onMouseLeave={() => handleMouseLeave(row._id)}
              >
                Unhold
              </CButton>
            )
          }
        </div>
      ),
      ignoreRowClick: true,
      allowoverflow: true,
      button: 'true',
    },
  ]

  // -------------------------------- ASSIGN DM Data Handler -------------------------------- //

  const selectedRow = useSelector((state) => state.selectedrows)

  const [defaultOptionFE, setDefaultOptionFE] = useState([])

  const [initialValuesForReAsign, setInitialValuesForReAsign] = useState({
    engineers: [],
    ids: [],
  })

  useEffect(() => {
    fetchDefaultOptionForFE()
    setInitialValuesForReAsign((prev) => ({ ...prev, ids: selectedRow }))
  }, [selectedRow])


  const fetchDefaultOptionForFE = async () => {
    try {
      let slugs = [process.env.REACT_APP_FE]
      const queryString = slugs.join(',');
      const url = `admins/get-multiple?slugs=${encodeURIComponent(queryString)}`;

      const response = await new BasicProvider(
        url,
      ).getRequest()

      const options = response.data.map((item) => ({
        label: item.name,
        value: item._id,
      }))

      setDefaultOptionFE(options)
    } catch (error) {
      console.error(error)
    }
  }

  const loadOptionsForFE = async (inputValue, callback) => {
    try {
      let slugs = [process.env.REACT_APP_FE]
      const queryString = slugs.join(',');
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

  const reAssignToFE = async () => {
    try {
      let response = await new BasicProvider(`cases/re-assign/fe`, dispatch).patchRequest(
        initialValuesForReAsign,
      )
      if (response.status === 'success') {
        setFlag(!flag)
        setInitialValuesForReAsign({
          engineers: [],
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


  const handleFilter = async (search) => {
    try {
      const searchParams = new URLSearchParams(location.search)
      if (search) searchParams.set('search_input', search)
      navigate({ search: searchParams.toString() })
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleFilterReset = async () => {
    setSearchCurrentPage(1)
    currentPage = 1
    setDefaultPage(1)
    navigate({ search: '' })
  }


  return (
    <>
      <SingleSubHeader moduleName={'All Cases Re-Assign to Another FE'}
        handleFilter={(search) => handleFilter(search)}
        setSearchCurrentPage={setSearchCurrentPage}
        onReset={() => handleFilterReset()}
        searchInput={search}
        rowPerPage={rowPerPage}
        defaultPage={defaultPage}
      />

      <CContainer fluid>
        {Array.isArray(selectedRow) && selectedRow.length > 0 && (
          <CCard className="mb-4 mt-4">
            <CCardBody>
              <CRow>
                <CCol md={6}>
                  <CFormLabel>Select Engineer</CFormLabel>
                  <AsyncSelect
                    name="engineers"
                    placeholder="Select Engineers"
                    isMulti
                    loadOptions={(inputValue, callback) => loadOptionsForFE(inputValue, callback)}
                    defaultOptions={defaultOptionFE}
                    value={defaultOptionFE.filter((option) =>
                      initialValuesForReAsign.engineers.includes(option.value),
                    )}
                    getOptionLabel={(option) => option.label}
                    getOptionValue={(option) => option.value}
                    onChange={(selectedOptions) =>
                      setInitialValuesForReAsign({
                        ...initialValuesForReAsign,
                        engineers: selectedOptions.map((option) => option.value),
                      })
                    }
                  />
                </CCol>
                <CCol md={6} className="d-flex align-iten-center justify-content-end mt-4">
                  <div>
                    <span className="selected_row">{selectedRow?.length} selected</span>

                    <CButton className="add_new" onClick={reAssignToFE}>
                      Re-Assign to FE
                    </CButton>
                  </div>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        )}

        <CRow className="justify-content-end">
          <CButton
            className="add_new w-lg-25 mx-2"
            onClick={async () => {
              await fetchData()
              customSuccessMSG(dispatch, 'Refreshed Successfuly!')
            }}
          >
            <FontAwesomeIcon icon={faRefresh} className="me-1" />
            Refresh
          </CButton>
        </CRow>

        {!isLoading ? (
          <div className="datatable mt-4">
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
      </CContainer>

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

      <Hold
        visible={visibleHoldModel}
        close={() => setVisibleHoldModel(!visibleHoldModel)}
        caseId={caseId}
        fetchCaseData={fetchData}
        status="hold by bm"
        type="hold"
        call="bm call"
      />


      <UnHold
        visible={unHoldVisible}
        close={() => setUnHoldVisible(!unHoldVisible)}
        handelUnholdCase={handelUnholdCase}
        caseId={caseId}
      />
      <View_FE_Note
        visible={viewFeNoteVisible}
        close={() => setViewFeNoteVisible(false)}
        caseId={caseId}
      />
      <CommonMessageShowModel
        visible={commonMessageShowModel}
        close={() => setCommonMessageShowModel(false)}
        caseId={caseId}
      />
    </>
  )
}

