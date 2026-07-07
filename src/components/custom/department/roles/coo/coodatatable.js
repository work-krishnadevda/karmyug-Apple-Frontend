import {
  cilBadge,
  cilCloudDownload,
  cilCopy,
  cilDataTransferDown,
  cilEyedropper,
  cilInfo,
  cilPencil,
  cilSpreadsheet,
  cilTrash,
  cilYen,
} from '@coreui/icons'

import CIcon from '@coreui/icons-react'
import {
  CContainer,
  CBadge,
  CButton,
  CTooltip,
  CSpinner,
  CDropdownItem,
} from '@coreui/react'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'
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
import { faBan, faEye, faFlag } from '@fortawesome/free-solid-svg-icons'
import Hold from 'src/components/custom/popup/hold'
import View_Reason from 'src/components/custom/popup/View_Reason'
import UnHold from 'src/components/custom/popup/unhold'
import View_FE_Note from 'src/components/custom/popup/view_fe_note'
import { statusValue } from 'src/constants/variables'
import { CommonMessageShowModel } from 'src/components/custom/popup/commonMessageModel'
import Hold_Reason from 'src/components/custom/popup/hold_reason'
import Unhold_Reason from 'src/components/custom/popup/unhold_region'
import { faCreativeCommonsBy } from '@fortawesome/free-brands-svg-icons'
import { downloadExcelCsvReport, downloadFinalReportZip } from 'src/constants/common'
import { CopyConformModal } from 'src/helpers/copyConformModalHelper'
import { toast } from 'react-toastify'
import AppActionDropdown from 'src/components/custom/table/AppActionDropdown'
import AppTableSkeleton from 'src/components/custom/table/AppTableSkeleton'

export default function CooDataTable() {
  const navigate = useNavigate()
  const [rowPerPage, setRowPerPage] = useState(null)
  const location = useLocation()
  const [userId, setuserId] = useState([])
  const [isLoading, setIsLoading] = useState(true)
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
  const [holdReasonVisible, setHoldReasonVisible] = useState(false)
  const [commonMessageShowModel, setCommonMessageShowModel] = useState(false)

  const [caseId, setCaseId] = useState('')
  const [currentstatus, setcurrentStatus] = useState('')
  const [openActionRowId, setOpenActionRowId] = useState(null)

  const [hoveredRows, setHoveredRows] = useState({})
  const [zipLoading, setZipLoading] = useState(false)
  const [firstLoad, setFirstLoad] = useState(true)

  const [isUpdateQueryParams, setIsUpdateQueryParams] = useState(false)

  const updatePageQueryParam = (paramName, page) => {
    if (isUpdateQueryParams) {
      const searchParams = new URLSearchParams(location.search)
      searchParams.set(paramName, page)
      navigate({ search: searchParams.toString() })
    }
    setIsUpdateQueryParams(true)
  }
  const updatePageQueryParams = (params) => {
    const searchParams = new URLSearchParams(location.search)

    Object.keys(params).forEach((key) => {
      searchParams.set(key, params[key])
    })

    if (!firstLoad) {
      navigate(
        { search: searchParams.toString() },
        {
          replace: true,
        },
      )
    }
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
    order,
    case_revise,
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
      // console.log(performSearch);
      if (performSearch) {
        queryData['page'] = currentPage
        queryData['count'] = count

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
        response = await new BasicProvider(`cases?page=${currentPage}&count=${count}`).getRequest()
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

  const handleFlagToggle = async (caseId, currentFlagged) => {
    try {
      await new BasicProvider(`cases/flag/${caseId}`, dispatch).patchRequest({
        flagged: !currentFlagged,
      })
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

  const handleMouseEnter = (rowId, type) => {
    setHoveredRows((prevState) => ({
      ...prevState,
      [rowId]: type,
    }))
  }

  const handleMouseLeave = (rowId) => {
    setHoveredRows((prevState) => ({
      ...prevState,
      [rowId]: null,
    }))
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
                setHoldReasonVisible(true)
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
                setUnholdReasonVisible(true)
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
            onClick={() => {
              setShowCopyModal(true)
              setuserId([row._id])
            }}
            className="case-action-menu__item"
          >
            <CIcon icon={cilCopy} className="case-action-menu__icon" />
            Duplicate
          </CDropdownItem>

          <CDropdownItem
            onClick={() => {
              downloadExcelCsvReport(row)
            }}
            className="case-action-menu__item"
          >
            <CIcon icon={cilDataTransferDown} className="case-action-menu__icon" />
            Export
          </CDropdownItem>

          <CDropdownItem
            onClick={() => {
              setVisible(true)
              setuserId([row._id])
            }}
            className="case-action-menu__item case-action-menu__item--danger"
          >
            <CIcon icon={cilTrash} className="case-action-menu__icon" />
            Delete
          </CDropdownItem>

          {row.status === 'submitted to bank' && (
            <CDropdownItem
              onClick={() => downloadFinalReportZip(row, setZipLoading, dispatch)}
              className="case-action-menu__item"
            >
              <CIcon icon={cilCloudDownload} className="case-action-menu__icon" />
              Final Report
            </CDropdownItem>
          )}
      </AppActionDropdown>
    )
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
      name: 'Group/FE',
      selector: (row) => {
        let groupName = '-'
        let engineersDisplay = '-'
        if (row?.status === 'pending for accept') {
          groupName = row?.group?.name || '-'
        } else if (row?.status !== 'pending for accept') {
          engineersDisplay = row?.accepted_by?.name || '-'
        } else if (Array.isArray(row?.engineers)) {
          engineersDisplay =
            row.engineers.length > 0
              ? row.engineers.map((engineer) => engineer?.name).join(', ')
              : '-'
        } else if (typeof row?.engineers === 'object' && row?.engineers !== null) {
          engineersDisplay = row.engineers.name || '-'
        }

        return (
          <>
            <div className="data_table_colum">
              {groupName}/{engineersDisplay}

            </div>
            <div className="">{row?.address ? row.address : '-'}</div>
          </>

        )
      },
      width: '190px',
    },
    // {
    //   name: 'Visit Address',
    //   selector: (row) => {
    //     return (
    //       <div className="data_table_colum">
    //         <div className="">{row?.address ? row.address : '-'}</div>
    //       </div>
    //     )
    //   },
    //   width: '170px',
    // },
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
      width: '150px',
      center: true,
    },
    {
      name: 'Actions',
      cell: (row) => {
        const isOnHold = holdStatuses.includes(row.status)
        return (
          <div className="action-btn me-3 case-action-cell">
            {!hoveredRows[row._id] && isOnHold && (
              <div className="holded-btn case-action-status-chip" onMouseEnter={() => handleMouseEnter(row._id, 'holded')}>
                Hold
              </div>
            )}
            {!hoveredRows[row._id] && !isOnHold && (
              <div className="live-btn case-action-status-chip" onMouseEnter={() => handleMouseEnter(row._id, 'live')}>
                <div className="live_point"></div>
                Live
              </div>
            )}
            {hoveredRows[row._id] === 'live' && (
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
            )}
            {hoveredRows[row._id] === 'holded' && isOnHold && (
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
            )}
            {renderActionMenu(row)}
          </div>
        )
      },

      width: '300px',
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      center: true,
    },
    {
      name: 'Tie-Up Action',
      selector: (row) => (
        <div className="data_table_colum">
          <div className="fs-12 pt-1">
            {row?.all_status?.pending_for_tie_up &&
              moment(row.all_status.pending_for_tie_up).isValid() ? (
              <CTooltip
                content={moment(row.all_status.pending_for_tie_up).format('DD MMM YYYY hh:mm:ss A')}
              >
                <div style={{ padding: '5px 10px' }}>
                  <div className="data_table_colum">
                    {moment(row.all_status.pending_for_tie_up).fromNow()}
                  </div>
                </div>
              </CTooltip>
            ) : (
              <div style={{ padding: '5px 10px' }}>-</div>
            )}
          </div>
        </div>
      ),
      width: '120px',
    },
    {
      name: 'Visit Action',
      selector: (row) => (
        <div className="data_table_colum">
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
            <div style={{ padding: '5px 10px' }}>
              <div className="data_table_colum">{row?.fe_visit_time ? row.fe_visit_time : '-'}</div>
            </div>
          </div>
        </div>
      ),
      width: '200px',
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
          <div className="datatable">
            <DataTable
              responsive="true"
              columns={columns}
              data={data}
              conditionalRowStyles={[
                {
                  when: (row) => !!row.flagged,
                  style: { backgroundColor: 'rgba(255, 193, 7, 0.25)' },
                },
              ]}
              paginationServer
              paginationTotalRows={totalCount}
              paginationDefaultPage={defaultPage}
              onChangePage={(page) => {
                currentPage = page
                setDefaultPage(parseInt(page))
                updatePageQueryParam('page', currentPage)
                // updatePageQueryParams({ page: currentPage, count: rowPerPage });
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
                // updatePageQueryParams({ page: currentPage, count: value });
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


