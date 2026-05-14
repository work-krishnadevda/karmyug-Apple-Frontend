import { cilCloudDownload, cilInfo, cilPencil, cilSpreadsheet, cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CContainer, CBadge, CButton, CSpinner, CTooltip } from '@coreui/react'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'
import DataTable from 'src/components/custom/table/AppDataTable'
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBan, faEye, faFlag } from '@fortawesome/free-solid-svg-icons'
import View_FE_Note from 'src/components/custom/popup/view_fe_note'
import UnHold from 'src/components/custom/popup/unhold'
import Hold from 'src/components/custom/popup/hold'
import Hold_Reason from 'src/components/custom/popup/hold_reason'
import Unhold_Reason from 'src/components/custom/popup/unhold_region'
import { faCreativeCommonsBy } from '@fortawesome/free-brands-svg-icons'
import { downloadFinalReportZip } from 'src/constants/common'
import AppTableSkeleton from 'src/components/custom/table/AppTableSkeleton'

export default function DM_DataTable() {
  const navigate = useNavigate()
  const [rowPerPage, setRowPerPage] = useState(20)
  const location = useLocation()

  const [userId, setuserId] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [holdReasonVisible, setHoldReasonVisible] = useState(false)
  const [unholdReasonVisible, setUnholdReasonVisible] = useState(false)
  const [visible, setVisible] = useState(false)
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

  const [currentstatus, setcurrentStatus] = useState('')

  let [defaultPage, setDefaultPage] = useState(currentPage)
  const dispatch = useDispatch()
  const data = useSelector((state) => state.data?.cases)
  const toggleCleared = useSelector((state) => state.toggleCleared)
  const totalCount = useSelector((state) => state.totalCount)

  const [viewFeNoteVisible, setViewFeNoteVisible] = useState(false)
  const [visibleHoldModel, setVisibleHoldModel] = useState(false)
  const [unHoldVisible, setUnHoldVisible] = useState(false)

  const [commonMessageShowModel, setCommonMessageShowModel] = useState(false)

  const [zipLoading, setZipLoading] = useState(false)

  const [caseId, setCaseId] = useState('')
  const [hoveredRows, setHoveredRows] = useState({})

  const [isUpdateQueryParams, setIsUpdateQueryParams] = useState(false)

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
      if (status) {
        setcurrentStatus(status)
      }
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
    case_revise
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

        response = await new BasicProvider(
          `cms/dashboard/date-wise-cases/counts?${HelperFunction.convertToQueryString(queryData)}`,
        ).getRequest()
      } else {
        response = await new BasicProvider(`cases?page=${currentPage}&count=${count}`).getRequest()
        // console.log('LOLOLOLs', response.data)
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
      name: 'Flag',
      cell: (row) =>
        row.flagged ? (
          <CustomTooltip content="Marked urgent (read-only)" placement="bottom">
            <div className="d-flex justify-content-center align-items-center">
              <FontAwesomeIcon
                icon={faFlag}
                title="Urgent"
                className="flex-shrink-0"
                style={{ fontSize: '1.5rem', color: '#000' }}
              />
            </div>
          </CustomTooltip>
        ) : (
          <span className="text-muted small" aria-hidden="true">
            —
          </span>
        ),
      width: '52px',
      center: true,
      ignoreRowClick: true,
    },
    {
      name: 'Applicant Name',
      selector: (row) => (
        <div
          onClick={() =>
            navigate(`/case/${row._id}/update/${'sdm-form'}/by/${loggedinUserRole.name}`)
          }
          className="data_table_colum"
        >
          {row && row.applicant_name ? row.applicant_name : '-'}

          <div className="fs-12 pt-1">
            <div className="data_table_colum">{row?.contact_number_1 ? row.contact_number_1 : '-'}</div>
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
      name: 'RA Branch',
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
      width: '150px',

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
      width: '150px',
      center: true

    },

    {
      name: 'Actions',
      cell: (row) => (
        <div className="action-btn me-3">
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

          {
            // Show Hold button when row is hovered with 'live' state
            hoveredRows[row._id] === 'live' && (
              <CButton
                onClick={() => {
                  setCaseId(row._id)
                  setVisibleHoldModel(!visibleHoldModel)
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

          {[
            'hold by coo',
            'hold by admin',
            'hold by sdm',
            'hold by dm',
            'hold by rc',
            'hold by lcto',
          ].includes(row.status) && (
              <CustomTooltip content={'Hold reason !!'}>
                <div
                  onClick={() => {
                    setCaseId(row._id)
                    setHoldReasonVisible(!holdReasonVisible)
                  }}
                  className="edit-btn pointer_cursor"
                >
                  <FontAwesomeIcon icon={faBan} style={{ color: 'red' }} />
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

          {!['hold by coo', 'hold by sdm'].includes(row.status) && (
            <div className="edit-btn">
              <CIcon
                className="pointer_cursor"
                icon={cilPencil}
                onClick={() =>
                  navigate(`/case/${row._id}/update/${'sdm-form'}/by/${loggedinUserRole.name}`)
                }
              />
            </div>
          )}

          {
            row.status === 'submitted to bank' && (
              <div className="download-btn edit-btn">
                <CIcon
                  className="pointer_cursor"
                  icon={cilCloudDownload}
                  onClick={() => downloadFinalReportZip(row, setZipLoading, dispatch)}
                />
              </div>
            )
          }




        </div>
      ),
      width: '250px',
      ignoreRowClick: true,
      allowoverflow: true,
      button: true,
      center: true

    },

    {
      name: 'Created',
      selector: (row) => (
        <div className="data_table_colum">
          <div className="fs-12 pt-1">
            {row?.created_at && moment(row.created_at).isValid() ? (
              <CTooltip
                content={moment(row.created_at).format('DD MMM YYYY hh:mm:ss A')}
              >
                <div style={{ padding: '5px 10px' }}>
                  <div className="data_table_colum">
                    {moment(row.created_at).fromNow()}
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
      center: true
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
            {row?.all_status?.pending_for_lcto && moment(row.all_status.pending_for_lcto).isValid() ? (
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
            {row?.all_status?.pending_for_cto && moment(row.all_status.pending_for_cto).isValid() ? (
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
              <CTooltip
                content={moment(row.bank_submitted_by.at).format('DD MMM YYYY hh:mm:ss A')}
              >
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
      center: true

    },
  ]


  const handelUnholdCase = async () => {
    try {
      if (caseId) {
        let response = await new BasicProvider(`cases/update/${caseId}`, dispatch).patchRequest({
          status: 'unhold by dm',
          type: 'dm call',
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

  return (
    <>
      {
        zipLoading && (
          <div className=" spinner_outerbox">
            <div className="text-center">
              <CSpinner size="lg" style={{ width: '3rem', height: '3rem' }} />
            </div>
          </div>
        )
      }
      <>
        {!isLoading ? (
          <div className="datatable">
            <DataTable
              conditionalRowStyles={[
                {
                  when: (row) => row.send_back_logs?.length > 0 && row?.status === 'pending for draft',
                  style: {
                    fontWeight: '800',
                  },
                },
                {
                  when: (row) => !!row.flagged,
                  style: { backgroundColor: 'rgba(255, 193, 7, 0.25)' },
                },
              ]}
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
              // selectableRows
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

      <View_FE_Note
        visible={viewFeNoteVisible}
        close={() => setViewFeNoteVisible(false)}
        caseId={caseId}
      />
      <Hold
        visible={visibleHoldModel}
        close={() => setVisibleHoldModel(!visibleHoldModel)}
        caseId={caseId}
        fetchCaseData={fetchData}
        status="hold by dm"
        type="hold"
        call="dm call"
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
    </>
  )
}


