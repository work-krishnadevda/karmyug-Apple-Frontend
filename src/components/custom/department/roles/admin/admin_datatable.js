import { cilCloudDownload, cilCopy, cilDataTransferDown, cilPencil, cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CContainer, CBadge, CTooltip, CSpinner, CDropdownItem } from '@coreui/react'
import moment from 'moment'
import { useCallback, useEffect, useRef, useState } from 'react'
import DataTable from 'src/components/custom/table/AppDataTable'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
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
import { faBan, faCircleInfo, faEye, faFlag } from '@fortawesome/free-solid-svg-icons'
import Hold from 'src/components/custom/popup/hold'
import View_Reason from 'src/components/custom/popup/View_Reason'
import UnHold from 'src/components/custom/popup/unhold'
import View_FE_Note from 'src/components/custom/popup/view_fe_note'
import { statusValue } from 'src/constants/variables'
import { CommonMessageShowModel } from 'src/components/custom/popup/commonMessageModel'
import Hold_Reason from 'src/components/custom/popup/hold_reason'
import Unhold_Reason from 'src/components/custom/popup/unhold_region'
import { brandSet } from '@coreui/icons'
import { faCreativeCommonsBy } from '@fortawesome/free-brands-svg-icons'
import { downloadExcelCsvReport, downloadFinalReportZip } from 'src/constants/common'
import { faHurricane } from '@fortawesome/free-solid-svg-icons'
import { toast } from 'react-toastify'
import { CopyConformModal } from 'src/helpers/copyConformModalHelper'
import AppActionDropdown from 'src/components/custom/table/AppActionDropdown'
import AppTableSkeleton from 'src/components/custom/table/AppTableSkeleton'
export default function AdminDataTable() {
  const navigate = useNavigate()
  const [rowPerPage, setRowPerPage] = useState(null)
  const location = useLocation()

  const [userId, setuserId] = useState([])
  const [currentstatus, setcurrentStatus] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [holdReasonVisible, setHoldReasonVisible] = useState(false)
  const [unholdReasonVisible, setUnholdReasonVisible] = useState(false)
  const [visible, setVisible] = useState(false)
  const [showCopyModal, setShowCopyModal] = useState(false)
  const [searchcurrentPage, setSearchCurrentPage] = useState(null)
  const query = new URLSearchParams(location.search)
  var count = query.get('count') || rowPerPage
  var currentPage = parseInt(query.get('page') || 1)
  var search = query.get('search') || ''

  var search_input = query.get('search_input') || ''
  var finance_name = query.get('finance_name') || ''
  var ra_branch = query.get('ra_branch') || ''
  var group_id = query.get('group_id') || ''
  var status = query.get('status') || ''
  var user_id = query.get('user_id') || ''
  var date_from = query.get('date_from') || ''
  var date_to = query.get('date_to') || ''
  var order = query.get('order') || ''
  var case_revise = query.get('case_revise') || ''
  var visit_type_by_fe = query.get('visit_type_by_fe') || ''

  const queryData = query.get('data')

  let [defaultPage, setDefaultPage] = useState(currentPage)
  const dispatch = useDispatch()
  const data = useSelector((state) => state.data?.cases)
  const toggleCleared = useSelector((state) => state.toggleCleared)
  const totalCount = useSelector((state) => state.totalCount)

  const [visibleHoldModel, setVisibleHoldModel] = useState(false)
  const [holdVisible, setHoldVisible] = useState(false)
  const [unHoldVisible, setUnHoldVisible] = useState(false)

  const [viewFeNoteVisible, setViewFeNoteVisible] = useState(false)

  const [caseId, setCaseId] = useState('')
  const [commonMessageShowModel, setCommonMessageShowModel] = useState(false)
  const [openActionRowId, setOpenActionRowId] = useState(null)

  const [zipLoading, setZipLoading] = useState(false)

  let loggedinUserRole = useSelector((state) => state?.userRole)

  let effectRef = useRef(false)

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
      if (effectRef.current === false) {
        effectRef.current = true
        fetchData()
      }
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
    order,
    case_revise,
    visit_type_by_fe,
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

        if (status != '') {
          queryData['status'] = status
        }

        if (queryData['data'] == undefined) {
          queryData['data'] = 'allcase'
        }

        response = await new BasicProvider(
          `cms/dashboard/date-wise-cases/counts?${HelperFunction.convertToQueryString(queryData)}`,
        ).getRequest()
      } else {
        response = await new BasicProvider(`cases?page=${currentPage}&count=${count}`).getRequest()
      }

      dispatch({ type: 'set', data: { cases: response.data.data } })
      dispatch({ type: 'set', totalCount: response.data.total })
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)

      console.error(error)
    } finally {
      effectRef.current = false
    }
  }

  const handleRowChange = useCallback((state) => {
    const rows = state.selectedRows
    if (rows.length > 0) {
      const rowsId = rows.map((item) => item._id)
      dispatch({ type: 'set', selectedrows: rowsId })
    }
  }, [])

  const handelUnholdCase = async () => {
    try {
      if (caseId) {
        let response = await new BasicProvider(`cases/update/${caseId}`, dispatch).patchRequest({
          status: 'unhold by admin',
          type: 'admin call',
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

  const renderActionMenu = (row) => {
    const isOnHold = holdStatuses.includes(row.status)

    return (
      <AppActionDropdown
        visible={openActionRowId === row._id}
        onVisibleChange={(nextVisible) => setOpenActionRowId(nextVisible ? row._id : null)}
        statusLabel={isOnHold ? 'Hold' : 'Live'}
        statusTone={isOnHold ? 'hold' : 'live'}
        ariaLabel={`Open actions for ${row?.applicant_name || 'case'}`}
      >
          <CDropdownItem
            onClick={() => {
              setCaseId(row._id)
              if (isOnHold) {
                setUnHoldVisible(true)
              } else {
                setVisibleHoldModel(true)
              }
            }}
            className="case-action-menu__item"
          >
            <span
              className={`case-action-menu__state ${
                isOnHold ? 'case-action-menu__state--hold' : 'case-action-menu__state--live'
              }`}
            >
              {isOnHold ? 'Unhold' : 'Hold'}
            </span>
            {isOnHold ? 'Move back to live' : 'Send to hold'}
          </CDropdownItem>

          {row.status === 'concern by fe' && (
            <CDropdownItem
              onClick={() => {
                setCaseId(row._id)
                setHoldVisible(!holdVisible)
              }}
              className="case-action-menu__item"
            >
              <FontAwesomeIcon icon={faEye} className="case-action-menu__icon" />
              View Concern
            </CDropdownItem>
          )}

          {row && row.fe_note && (
            <CDropdownItem
              onClick={() => {
                setCaseId(row._id)
                setViewFeNoteVisible(!viewFeNoteVisible)
              }}
              className="case-action-menu__item"
            >
              <FontAwesomeIcon icon={faEye} className="case-action-menu__icon" />
              View FE Note
            </CDropdownItem>
          )}

          {row && row.hold_message && isOnHold && (
            <CDropdownItem
              onClick={() => {
                setCaseId(row._id)
                setHoldReasonVisible(!holdReasonVisible)
              }}
              className="case-action-menu__item"
            >
              <FontAwesomeIcon icon={faBan} className="case-action-menu__icon case-action-menu__icon--danger" />
              Hold Reason
            </CDropdownItem>
          )}

          {row && row.unhold_message && (
            <CDropdownItem
              onClick={() => {
                setCaseId(row._id)
                setUnholdReasonVisible(!unholdReasonVisible)
              }}
              className="case-action-menu__item"
            >
              <FontAwesomeIcon icon={faCreativeCommonsBy} className="case-action-menu__icon" />
              Unhold Reason
            </CDropdownItem>
          )}

          <CDropdownItem onClick={() => navigate(`/case/${row._id}/edit`)} className="case-action-menu__item">
            <CIcon icon={cilPencil} className="case-action-menu__icon" />
            Edit
          </CDropdownItem>

          <CDropdownItem
            onClick={(e) => {
              e.stopPropagation()
              setShowCopyModal(true)
              setuserId([row._id])
            }}
            className="case-action-menu__item"
          >
            <CIcon icon={cilCopy} className="case-action-menu__icon" />
            Copy Case
          </CDropdownItem>

          <CDropdownItem
            onClick={() => {
              downloadExcelCsvReport(row)
            }}
            className="case-action-menu__item"
          >
            <CIcon icon={cilDataTransferDown} className="case-action-menu__icon" />
            Download csv File
          </CDropdownItem>

          <CDropdownItem
            onClick={() => {
              setVisible(true)
              setuserId([row._id])
            }}
            className="case-action-menu__item case-action-menu__item--danger"
          >
            <CIcon icon={cilTrash} className="case-action-menu__icon" />
            Delete Case
          </CDropdownItem>

          {row.status === 'submitted to bank' && (
            <CDropdownItem
              onClick={() => downloadFinalReportZip(row, setZipLoading, dispatch)}
              className="case-action-menu__item"
            >
              <CIcon icon={cilCloudDownload} className="case-action-menu__icon" />
              Download Final Zip
            </CDropdownItem>
          )}

          {caseInfoVisiblityStatus.includes(row?.status) && row?.all_status['visit_done'] && (
            <CDropdownItem
              onClick={() => {
                navigate(`/case/${row._id}/show-case-details/by/${loggedinUserRole?.name}`)
              }}
              className="case-action-menu__item"
            >
              <FontAwesomeIcon icon={faCircleInfo} className="case-action-menu__icon" />
              Show Case Info
            </CDropdownItem>
          )}
      </AppActionDropdown>
    )
  }

  let caseInfoVisiblityStatus = [
    'visit done',
    'pending for draft',
    'pending for lcto',
    'pending for cto',
    'submitted to bank',
    'pending for rc',
    'hold by coo',
    'hold by admin',
    'hold by bm',
    'hold by sfo',
    'hold by sdm',
    'hold by dm',
    'hold by rc',
    'hold by lcto',
    'hold by cto',
  ]

  const handleFlagToggle = async (caseId, currentFlagged) => {
    try {
      await new BasicProvider(`cases/flag/${caseId}`, dispatch).patchRequest({
        flagged: !currentFlagged,
      })
      // Optimistic update: update only this case in state (keeps row order, fixes wrong checkbox)
      const newCases = (data || []).map((c) =>
        c._id === caseId ? { ...c, flagged: !currentFlagged } : c,
      )
      dispatch({ type: 'set', data: { cases: newCases } })
    } catch (err) {
      console.error(err)
      toast.error('Failed to update flag')
      fetchData()
    }
  }

  const columns = [
    {
      name: 'Flag',
      cell: (row) => (
        <CustomTooltip content={row.flagged ? 'Unmark urgent' : 'Mark urgent'} placement="bottom">
          <div className="d-flex align-items-center justify-content-center gap-1" style={{ minHeight: 24 }}>
            <input
              type="checkbox"
              checked={!!row.flagged}
              onChange={() => handleFlagToggle(row._id, row.flagged)}
              onClick={(e) => e.stopPropagation()}
              aria-label="Urgent flag"
              style={{ cursor: 'pointer' }}
            />
            {row.flagged ? (
              <FontAwesomeIcon
                icon={faFlag}
                title="Urgent"
                className="flex-shrink-0"
                style={{ fontSize: '1.5rem', color: '#000' }}
              />
            ) : null}
          </div>
        </CustomTooltip>
      ),
      width: '76px',
      center: true,
      ignoreRowClick: true,
    },
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
      name: 'Visit Done By',
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
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="action-btn me-3 case-action-cell">
          <div
            className={`case-action-status-chip ${
              holdStatuses.includes(row.status)
                ? 'case-action-status-chip--hold'
                : 'case-action-status-chip--live'
            }`}
          >
            <span className="case-action-status-chip__dot" />
            {holdStatuses.includes(row.status) ? 'Hold' : 'Live'}
          </div>
          {renderActionMenu(row)}
        </div>
      ),

      width: '300px',
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

  useEffect(() => {
    const fetchSelectedRows = async () => {
      const savedSelectedRows = await handleSelectedRowChange('cases')

      if (savedSelectedRows && !count) {
        setRowPerPage(savedSelectedRows)
      } else {
        setRowPerPage(count)
      }
    }

    fetchSelectedRows()
  }, [count])

  return (
    <>
      {zipLoading && (
        <div className=" spinner_outerbox">
          <div className="text-center">
            <CSpinner size="lg" style={{ width: '3rem', height: '3rem' }} />
          </div>
        </div>
      )}

      <>
        {!isLoading ? (
          <>
            {rowPerPage && (
              <div className="datatable">
                <DataTable
                  responsive={true}
                  columns={columns}
                  data={data}
                  conditionalRowStyles={[
                    {
                      when: (row) => !!row.flagged,
                      style: {
                        backgroundColor: 'rgba(255, 193, 7, 0.25)',
                      },
                    },
                  ]}
                  paginationServer
                  paginationTotalRows={totalCount}
                  paginationDefaultPage={defaultPage}
                  onChangePage={(page) => {
                    currentPage = page
                    setDefaultPage(parseInt(page))
                    updatePageQueryParam('page', currentPage)
                  }}
                  pagination
                  // pagination={{ position: ['topRight', 'bottomRight'], showSizeChanger: true }}
                  selectableRows
                  selectableRowsHighlight
                  highlightOnHover
                  paginationRowsPerPageOptions={RowsPerPage}
                  paginationPerPage={rowPerPage}
                  onChangeRowsPerPage={(value) => {
                    count = value
                    setRowPerPage(value)
                    updatePageQueryParam('count', value)
                    // updatePageQueryParam('count', value)
                    setSelectedRowForModule('cases', value)
                  }}
                  onSelectedRowsChange={(state) => handleRowChange(state)}
                  clearSelectedRows={toggleCleared}
                />
              </div>
            )}
          </>
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

      <CopyConformModal
        visible={showCopyModal}
        userId={userId}
        moduleName="cases"
        currentPage={currentPage}
        rowPerPage={rowPerPage}
        setVisible={setShowCopyModal}
        // deletionType="trash"
        handleClose={() => setShowCopyModal(false)}
      />

      <Hold
        visible={visibleHoldModel}
        close={() => setVisibleHoldModel(!visibleHoldModel)}
        caseId={caseId}
        fetchCaseData={fetchData}
        type="hold"
        status="hold by admin"
        call="admin call"
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


