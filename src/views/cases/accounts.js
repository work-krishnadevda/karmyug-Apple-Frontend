import {
  CContainer,
  CBadge,
  CButton,
  CTooltip,
  CSpinner,
  CFormCheck,
} from '@coreui/react'
import moment from 'moment'
import { useCallback, useEffect, useState, useRef } from 'react'
import DataTable from 'src/components/custom/table/AppDataTable'
import AppTableSkeleton from 'src/components/custom/table/AppTableSkeleton'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import SubHeader from 'src/components/custom/SubHeader'
import { holdStatuses, RowsPerPage } from 'src/constants/variables'
// import HelperFunction from '../../helpers/HelperFunctions'
import { handleSelectedRowChange, setSelectedRowForModule } from 'src/helpers/paginationCookie'
import { DeleteModal, handleConfirmDelete } from 'src/helpers/deleteModalHelper'
import BasicProvider from 'src/constants/BasicProvider'
import noImage from 'src/assets/images/noImage.png'
import CustomTooltip from 'src/components/custom/CustomTooltip'
import HelperFunction from 'src/helpers/HelperFunctions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBan, faEye } from '@fortawesome/free-solid-svg-icons'
import Hold from 'src/components/custom/popup/hold'
import View_Reason from 'src/components/custom/popup/View_Reason'
import UnHold from 'src/components/custom/popup/unhold'
import View_FE_Note from 'src/components/custom/popup/view_fe_note'
import { statusValue } from 'src/constants/variables'
import { CommonMessageShowModel } from 'src/components/custom/popup/commonMessageModel'
import Hold_Reason from 'src/components/custom/popup/hold_reason'
import Unhold_Reason from 'src/components/custom/popup/unhold_region'
import { faCreativeCommonsBy } from '@fortawesome/free-brands-svg-icons'
import SingleSubHeader from 'src/components/custom/SingleSubHeader'
import { downloadFinalReportZip } from 'src/constants/common'
import CIcon from '@coreui/icons-react'
import { cilCloudDownload } from '@coreui/icons'
import CaseFilter from 'src/components/custom/CaseFilter'
import CaseSectionCard from 'src/components/custom/table/CaseSectionCard'

export default function Account() {
  const navigate = useNavigate()
  const [rowPerPage, setRowPerPage] = useState(20)
  const location = useLocation()
  const { slug } = useParams()
  const [userId, setuserId] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [unholdReasonVisible, setUnholdReasonVisible] = useState(false)
  const [visible, setVisible] = useState(false)
  const [searchcurrentPage, setSearchCurrentPage] = useState(null)
  const query = new URLSearchParams(location.search)
  var count = query.get('count') || rowPerPage
  var currentPage = parseInt(query.get('page') || 1)
  var search = query.get('search_input') || ''
  var search_input = query.get('search_input') || ''
  var finance_name = query.get('finance_name') || ''
  var ra_branch = query.get('ra_branch') || ''
  var group_id = query.get('group_id') || ''
  var status = query.get('status') || ''
  var user_id = query.get('user_id') || ''
  var date_from = query.get('date_from') || ''
  var date_to = query.get('date_to') || ''
  const queryData = query.get('data')

  const [filteredData, setFilteredData] = useState([])

  let [defaultPage, setDefaultPage] = useState(currentPage)
  const dispatch = useDispatch()
  const data = useSelector((state) => state.data?.cases)
  const toggleCleared = useSelector((state) => state.toggleCleared)
  const totalCount = useSelector((state) => state.totalCount)

  const [visibleHoldModel, setVisibleHoldModel] = useState(false)
  const [holdVisible, setHoldVisible] = useState(false)
  const [unHoldVisible, setUnHoldVisible] = useState(false)

  const [viewFeNoteVisible, setViewFeNoteVisible] = useState(false)
  const [holdReasonVisible, setHoldReasonVisible] = useState(false)
  const [commonMessageShowModel, setCommonMessageShowModel] = useState(false)

  const [caseId, setCaseId] = useState('')

  const [hoveredRows, setHoveredRows] = useState({})

  const [isUpdateQueryParams, setIsUpdateQueryParams] = useState(false)

  const [zipLoading, setZipLoading] = useState(false)

  const [isFilter, setIsFilter] = useState(false)

  const [selectAll, setSelectAll] = useState(false)

  const isAcknowledged = (value) => value === '1' || value === 1 || value === true

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
  }, [
    currentPage,
    rowPerPage,
    searchcurrentPage,
    search_input,
    finance_name,
    ra_branch,
    group_id,
    status,
    date_from,
    date_to,
    user_id,
    slug,
  ])

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
      if (performSearch) {
        queryData['page'] = currentPage
        queryData['count'] = count

        const allowedTypes = ['hl', 'lap', 'npa', 'apf', 'estimate', 'other']

        if (allowedTypes.includes(slug)) {
          queryData['ptyep'] = slug
        }

        // queryData['ac'] = true

        if (queryData['data'] == undefined) {
          queryData['data'] = 'allcase'
        }

        if (status != '') {
          queryData['status'] = status
        }

        response = await new BasicProvider(
          `cms/dashboard/date-wise-cases/counts?${HelperFunction.convertToQueryString(queryData)}`,
        ).getRequest()
      } else {
        if (queryData == 'allcase') {
          response = await new BasicProvider(
            `cms/dashboard/date-wise-cases/counts?${HelperFunction.convertToQueryString(
              queryData,
            )}`,
          ).getRequest()
        } else {
          response = await new BasicProvider(
            `cases?page=${currentPage}&count=${count}&ptyep=${slug}&ac=true`,
          ).getRequest()
        }
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
          status: 'unhold by coo',
          type: 'coo call',
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

  let handleAcknowled = async (id, value, event) => {
    if (event) {
      event.stopPropagation()
    }

    const newValue = isAcknowledged(value) ? '0' : '1'

    // Save current data for rollback in case of error
    const currentData = data || []

    // Optimistically update the Redux state immediately (no scroll reset)
    const updatedData = currentData.map((item) => {
      if (item._id === id) {
        return { ...item, acknowledged: newValue }
      }
      return item
    })
    dispatch({ type: 'set', data: { cases: updatedData } })

    // Update selectAll state if finance_name filter is active
    if (finance_name) {
      const submittedCases = updatedData.filter(
        (item) => item.status === 'submitted to bank',
      )
      if (submittedCases.length > 0) {
        const allChecked = submittedCases.every((item) => isAcknowledged(item.acknowledged))
        setSelectAll(allChecked)
      }
    }

    try {
      let response = await new BasicProvider(`cases/acknowledge/${id}`, dispatch).patchRequest({
        acknowledged: newValue,
      })
      // If API call fails, revert the optimistic update
      if (!response) {
        dispatch({ type: 'set', data: { cases: currentData } })
        if (finance_name) setSelectAll(false)
      }
    } catch (error) {
      console.log('error', error)
      // Revert the optimistic update on error
      dispatch({ type: 'set', data: { cases: currentData } })
      if (finance_name) setSelectAll(false)
    }
  }

  const handleSelectAll = async (checked) => {
    if (!finance_name) return

    const newValue = checked ? '1' : '0'
    const currentData = data || []

    // Get all cases with status 'submitted to bank'
    const submittedToBankCases = currentData.filter(
      (item) => item.status === 'submitted to bank',
    )

    if (submittedToBankCases.length === 0) return

    // Optimistically update all checkboxes
    const updatedData = currentData.map((item) => {
      if (item.status === 'submitted to bank') {
        return { ...item, acknowledged: newValue }
      }
      return item
    })
    dispatch({ type: 'set', data: { cases: updatedData } })
    setSelectAll(checked)

    // Make API calls for all cases
    try {
      const promises = submittedToBankCases.map((item) =>
        new BasicProvider(`cases/acknowledge/${item._id}`, dispatch).patchRequest({
          acknowledged: newValue,
        }),
      )

      await Promise.all(promises)
    } catch (error) {
      console.log('error in select all:', error)
      // Revert on error
      dispatch({ type: 'set', data: { cases: currentData } })
      setSelectAll(!checked)
    }
  }

  // Update selectAll state when data or finance_name filter changes
  useEffect(() => {
    if (finance_name && data && data.length > 0) {
      const submittedToBankCases = data.filter(
        (item) => item.status === 'submitted to bank',
      )
      if (submittedToBankCases.length > 0) {
        const allChecked = submittedToBankCases.every((item) => isAcknowledged(item.acknowledged))
        setSelectAll(allChecked)
      } else {
        setSelectAll(false)
      }
    } else {
      setSelectAll(false)
    }
  }, [data, finance_name])

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
          <div>{row && row.applicant_name ? row.applicant_name : '-'}</div>
          <div className="fs-12 pt-1">
            <CTooltip
              content={
                row?.created_at && moment(row.created_at).isValid()
                  ? moment(row.created_at).format('DD MMM YYYY hh:mm:ss A')
                  : ''
              }
              placement="top"
            >
              <div style={{ padding: '5px 10px' }}>
                {row?.created_at && moment(row.created_at).isValid() && (
                  <div className="data_table_colum">{moment(row.created_at).fromNow()}</div>
                )}
              </div>
            </CTooltip>
          </div>
        </div>
      ),
      // center:true,
      width: '170px',
    },
    {
      name: 'Finance Name',
      selector: (row) => (
        <div className="data_table_colum">
          <div>{row && row?.finance_name?.name ? row.finance_name.name : '-'}</div>
          <div className="fs-12 pt-1">{row && row?.los_number ? row?.los_number : '-'}</div>
        </div>
      ),
      width: '170px',
    },
    {
      name: 'MA Branch',
      selector: (row) => (
        <div className="data_table_colum">
          <div>{row && row?.ra_branch?.name ? row?.ra_branch?.name : '-'}</div>
          <div className="fs-12 pt-1">{row && row.case_of_branch ? row.case_of_branch : '-'}</div>
        </div>
      ),
      width: '120px',
    },
    {
      name: 'Product Type',
      selector: (row) => (
        <div className="data_table_colum">
          <div>{row && row.product_type ? row.product_type.toUpperCase() : '-'}</div>
        </div>
      ),
      center: true,
    },
    {
      name: 'Group/FE',
      selector: (row) => (
        <div className="data_table_colum">
          <div className="">{row?.accepted_by?.name ? row.accepted_by?.name : '-'}</div>
          <div className="fs-12 pt-1">
            {row?.all_status?.visit_done && moment(row.all_status.visit_done).isValid() ? (
              <CTooltip
                content={moment(row.all_status.visit_done).format('DD MMM YYYY hh:mm:ss A')}
              >
                <div style={{ padding: '5px 10px' }}>
                  <div className="data_table_colum">
                    {moment(row.all_status.visit_done).fromNow()}
                  </div>
                </div>
              </CTooltip>
            ) : (
              <div style={{ padding: '5px 10px' }}>-</div>
            )}
          </div>
        </div>
      ),
      width: '170px',
    },
    {
      name: 'Status',
      selector: (row) => (
        <div className="data_table_colum">
          {row && row.status ? (
            <p className="rounded-pill mb-0 text-capitalize">
              <CBadge
                style={{
                  background:
                    statusValue.find((item) => item.label === row?.status)?.bgcolor || '#3399FF',
                }}
              >
                {row.status === 'updated by bm' ? (
                  'Updated By BM'
                ) : (
                  <>
                    {row.status
                      .toLowerCase()
                      .replace(/\b(coo|fe|rc|dm|bm|sdm|lcto|cto)\b/g, (match) =>
                        match.toUpperCase(),
                      )}
                  </>
                )}
              </CBadge>
            </p>
          ) : (
            '-'
          )}
        </div>
      ),
      center: true,
      width: '150px',
    },
    {
      name: finance_name ? (
        <div className="d-flex align-items-center gap-2">
          <span>Actions</span>
          <CFormCheck
            type="checkbox"
            checked={selectAll}
            onChange={(e) => {
              e.stopPropagation()
              handleSelectAll(e.target.checked)
            }}
            onClick={(e) => {
              e.stopPropagation()
            }}
            style={{
              width: '18px',
              height: '18px',
              borderStyle: 'dashed',
              borderWidth: '1px',
              borderColor: 'blue',
              cursor: 'pointer',
            }}
            title="Select All"
          />
        </div>
      ) : (
        'Actions'
      ),
      cell: (row) => (
        <div className="action-btn me-3">
          {row.status === 'concern by fe' && (
            <div
              onClick={() => {
                setCaseId(row._id)
                setHoldVisible(!holdVisible)
              }}
              className="edit-btn pointer_cursor"
            >
              <FontAwesomeIcon icon={faEye} />
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
                <FontAwesomeIcon icon={faEye} />
              </div>
            </CustomTooltip>
          )}

          {!hoveredRows[row._id] &&
            !holdStatuses.includes(row.status) &&
            row.status !== 'submitted to bank' && (
              <div className="live-btn">
                <div className="live_point"></div>
                Live
              </div>
            )}

          {row && row.hold_message && holdStatuses.includes(row.status) && (
            <CustomTooltip content={'Hold Reason'}>
              <div
                onClick={() => {
                  setCaseId(row._id)
                  setHoldReasonVisible(!holdReasonVisible)
                }}
                className="delet-btn pointer_cursor px-2"
              >
                <FontAwesomeIcon icon={faBan} />
              </div>
            </CustomTooltip>
          )}

          {row && row.unhold_message && (
            <CustomTooltip content={'Unhold Reason'}>
              <div
                onClick={() => {
                  setCaseId(row._id)
                  setUnholdReasonVisible(!unholdReasonVisible)
                }}
                className="delet-btn pointer_cursor px-2"
              >
                <FontAwesomeIcon icon={faCreativeCommonsBy} />
              </div>
            </CustomTooltip>
          )}

          {row.status === 'submitted to bank' && (
            <div className="mx-2" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                className="account-ack-checkbox"
                name={`ack-${row._id}`}
                id={`ack-${row._id}`}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                  accentColor: '#0abb87',
                }}
                checked={isAcknowledged(row?.acknowledged)}
                onChange={(e) => {
                  e.stopPropagation()
                  handleAcknowled(row._id, row.acknowledged, e)
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          {row.status === 'submitted to bank' && (
            <div className="download-btn edit-btn">
              <CIcon
                className="pointer_cursor"
                icon={cilCloudDownload}
                onClick={() => downloadFinalReportZip(row, setZipLoading, dispatch)}
              />
            </div>
          )}
        </div>
      ),

      width: '250px',
      ignoreRowClick: true,
      allowoverflow: true,
      button: true,
      center: true,
    },
    {
      name: 'Draft Action',
      selector: (row) => (
        <div className="data_table_colum">
          <div>{row?.dm?.name ? row.dm.name : '-'}</div>
          <div className="fs-12 pt-1">
            {row?.all_status?.pending_for_rc && moment(row.all_status.pending_for_rc).isValid() ? (
              <CTooltip
                content={moment(row.all_status.pending_for_rc).format('DD MMM YYYY hh:mm:ss A')}
              >
                <div style={{ padding: '5px 10px' }}>
                  <div className="data_table_colum">
                    {moment(row.all_status.pending_for_rc).fromNow()}
                  </div>
                </div>
              </CTooltip>
            ) : (
              <div style={{ padding: '5px 10px' }}>-</div>
            )}
          </div>
        </div>
      ),
      width: '170px',
    },
    {
      name: 'RC Action',
      selector: (row) => (
        <div className="data_table_colum">
          <div>{row?.rc?.name ? row.rc.name : '-'}</div>
          <div className="fs-12 pt-1">
            {row?.all_status?.pending_for_lcto &&
            moment(row.all_status.pending_for_lcto).isValid() ? (
              <CTooltip
                content={moment(row.all_status.pending_for_lcto).format('DD MMM YYYY hh:mm:ss A')}
              >
                <div style={{ padding: '5px 10px' }}>
                  <div className="data_table_colum">
                    {moment(row.all_status.pending_for_lcto).fromNow()}
                  </div>
                </div>
              </CTooltip>
            ) : (
              <div style={{ padding: '5px 10px' }}>-</div>
            )}
          </div>
        </div>
      ),
      width: '170px',
    },
    {
      name: 'LCTO Action',
      selector: (row) => (
        <div className="data_table_colum">
          <div>{row?.lcto?.name ? row?.lcto.name : '-'}</div>
          <div className="fs-12 pt-1">
            {row?.all_status?.pending_for_cto &&
            moment(row.all_status.pending_for_cto).isValid() ? (
              <CTooltip
                content={moment(row.all_status.pending_for_cto).format('DD MMM YYYY hh:mm:ss A')}
              >
                <div style={{ padding: '5px 10px' }}>
                  <div className="data_table_colum">
                    {moment(row.all_status.pending_for_cto).fromNow()}
                  </div>
                </div>
              </CTooltip>
            ) : (
              <div style={{ padding: '5px 10px' }}>-</div>
            )}
          </div>
        </div>
      ),
      width: '170px',
    },
    {
      name: 'Bank Action',
      selector: (row) => (
        <div className="data_table_colum">
          <div>{row.bank_submitted_by?.by?.name ? row.bank_submitted_by.by.name : '-'}</div>
          <div className="fs-12 pt-1">
            {row?.bank_submitted_by?.at && moment(row.bank_submitted_by.at).isValid() ? (
              <CTooltip content={moment(row.bank_submitted_by.at).format('DD MMM YYYY hh:mm:ss A')}>
                <div style={{ padding: '5px 10px' }}>
                  <div className="data_table_colum">
                    {moment(row.bank_submitted_by.at).fromNow()}
                  </div>
                </div>
              </CTooltip>
            ) : (
              <div style={{ padding: '5px 10px' }}>-</div>
            )}
          </div>
        </div>
      ),
      width: '170px',
      center: true,
    },
  ]

  function formatSlug(slug) {
    return slug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
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

  // const handleFilterReset = () => {
  //   setSearchCurrentPage(1)
  //   currentPage = 1
  //   setDefaultPage(1)

  //   log

  //   const searchParams = new URLSearchParams(location.search)
  //   searchParams.delete('search_input')
  //   navigate({ search: searchParams.toString() })
  // }

  const handleFilterReset = async () => {
    setFilteredData({
      cin_number: '',
      applicant_name: '',
      case_of_branch: '',
      ra_branch: '',
      finance_name: '',
      search_input: '',
      date_from: '',
      date_to: '',
      status: [],
      group_id: '',
      user_id: '',
      case_revise: '0',
      visit_type_by_fe: '',
    })

    // setRAbranchData('')
    // setFinancenameData('')
    setSearchCurrentPage(1)
    currentPage = 1
    setDefaultPage(1)
    // setData([])
    // setWholeData([])
    // setTotalCount(0)
    navigate({ search: '' })
  }

  return (
    <>
      {zipLoading && (
        <div className=" spinner_outerbox">
          <div className="text-center">
            <CSpinner size="lg" style={{ width: '3rem', height: '3rem' }} />
          </div>
        </div>
      )}
      {queryData === 'allcase' ? (
        <SingleSubHeader
          moduleName={`Cases: ${formatSlug(slug)}`}
          handleFilter={(search) => handleFilter(search)}
          setSearchCurrentPage={setSearchCurrentPage}
          onReset={() => handleFilterReset()}
          searchInput={search}
          rowPerPage={rowPerPage}
          defaultPage={defaultPage}
        />
      ) : (
        <SingleSubHeader moduleName={`Cases : ${formatSlug(slug)}`} />
      )}

      <CContainer fluid>
        <>
          {isFilter && (
            <CaseSectionCard variant="filter" title="Filter Cases">
              <CaseFilter
                rowPerPage={rowPerPage}
                filterData={filteredData}
                setFilterData={setFilteredData}
                rabranchData
                setRAbranchData
                financenameData
                setFinancenameData
                onReset={() => {
                  handleFilterReset()
                }}
                onFilter={(filterParams) => {
                  const searchParams = new URLSearchParams(location.search)
                  for (const key in filterParams) {
                    if (filterParams.hasOwnProperty(key)) {
                      const value = filterParams[key]
                      if (value != '') searchParams.set(key, value)
                    }
                  }
                  searchParams.set('filter', 'true')
                  navigate({ search: searchParams.toString() })
                }}
              />
            </CaseSectionCard>
          )}
          <CaseSectionCard
            title={`Case Details: ${formatSlug(slug)}`}
            action={
              <CButton onClick={() => setIsFilter(!isFilter)} className="case-table-shell__filter-btn">
                {!isFilter ? 'Open Filter' : 'Close Filter'}
              </CButton>
            }
          >
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
          </CaseSectionCard>
        </>
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
        type="hold"
        status="hold by coo"
        call="coo call"
      />
      <View_Reason
        visible={holdVisible}
        close={() => setHoldVisible(!holdVisible)}
        caseId={caseId}
      />
      <Hold_Reason
        visible={holdReasonVisible}
        close={() => setHoldReasonVisible(false)}
        caseId={caseId}
      />
      <Unhold_Reason
        visible={unholdReasonVisible}
        close={() => setUnholdReasonVisible(false)}
        caseId={caseId}
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

