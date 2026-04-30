import { cilCloudDownload, cilPencil, cilSpreadsheet, cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CContainer, CBadge, CCard, CCardHeader, CCardBody, CButton, CSpinner, CTooltip } from '@coreui/react'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import HelperFunction from '../../helpers/HelperFunctions'
import { handleSelectedRowChange, setSelectedRowForModule } from 'src/helpers/paginationCookie'
import BasicProvider from 'src/constants/BasicProvider'
import SingleSubHeader from 'src/components/custom/SingleSubHeader'
import DataTable from 'react-data-table-component'
import { useSearchParams } from 'react-router-dom'
import { holdStatuses, RowsPerPage, statusValue } from 'src/constants/variables'
import InitiatedFilter from 'src/components/custom/InitiatedFilter'
import Hold from 'src/components/custom/popup/hold'
import View_Reason from 'src/components/custom/popup/View_Reason'
import Hold_Reason from 'src/components/custom/popup/hold_reason'
import Unhold_Reason from 'src/components/custom/popup/unhold_region'
import UnHold from 'src/components/custom/popup/unhold'
import View_FE_Note from 'src/components/custom/popup/view_fe_note'
import { CommonMessageShowModel } from 'src/components/custom/popup/commonMessageModel'
import CustomTooltip from 'src/components/custom/CustomTooltip'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye } from '@fortawesome/free-regular-svg-icons'
import { faBan, faFlag } from '@fortawesome/free-solid-svg-icons'
import { toast } from 'react-toastify'
import { faCreativeCommonsBy } from '@fortawesome/free-brands-svg-icons'


export default function Initiated() {

    const navigate = useNavigate()
    const [rowPerPage, setRowPerPage] = useState(null)
    const location = useLocation()

    const [isLoading, setIsLoading] = useState(true)

    const [searchcurrentPage, setSearchCurrentPage] = useState(null)
    const query = new URLSearchParams(location.search)
    var count = query.get('count') || rowPerPage
    var currentPage = parseInt(query.get('page') || 1)
    let [defaultPage, setDefaultPage] = useState(currentPage)
    const dispatch = useDispatch()
    const data = useSelector((state) => state.data?.cases)
    const toggleCleared = useSelector((state) => state.toggleCleared)
    const totalCount = useSelector((state) => state.totalCount)
    const [filteredData, setFilteredData] = useState([])

    const [visibleHoldModel, setVisibleHoldModel] = useState(false)
    const [holdVisible, setHoldVisible] = useState(false)
    const [unHoldVisible, setUnHoldVisible] = useState(false)
    const [unholdReasonVisible, setUnholdReasonVisible] = useState(false)
    const [viewFeNoteVisible, setViewFeNoteVisible] = useState(false)
    const [holdReasonVisible, setHoldReasonVisible] = useState(false)
    const [commonMessageShowModel, setCommonMessageShowModel] = useState(false)

    const [caseId, setCaseId] = useState('')

    const [searchParams] = useSearchParams();

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

    useEffect(() => {
        for (const [key, value] of query.entries()) {
            if (key !== 'page' && key !== 'count') {
                setFilteredData((prev) => ({
                    ...prev,
                    [key]: value,
                }))
            }
        }
    }, [])

    useEffect(() => {
        if (rowPerPage) {
            fetchData()

        }
    }, [currentPage, rowPerPage, filteredData])

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

    const columns = [
        {
            name: 'Flag',
            cell: (row) => (
                <CustomTooltip content={row.flagged ? 'Unmark urgent' : 'Mark urgent'} placement="bottom">
                    <div
                        className="d-flex align-items-center justify-content-center gap-1"
                        style={{ minHeight: 24 }}
                    >
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
                        setCaseId(row._id);
                        setCommonMessageShowModel(!commonMessageShowModel);
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
            name: 'Group/FE',
            selector: (row) => {
                let groupName = '-';
                let engineersDisplay = '-';
                if (row?.status === 'pending for accept') {
                    groupName = row?.group?.name || '-';
                } else if (row?.status !== 'pending for accept') {
                    // If status is not 'pending for accept', show FE name from accepted_by
                    engineersDisplay = row?.accepted_by?.name || '-';
                } else if (Array.isArray(row?.engineers)) {
                    // If status is 'pending for accept' and engineers is an array
                    engineersDisplay = row.engineers.length > 0
                        ? row.engineers.map((engineer) => engineer?.name).join(', ')
                        : '-';
                } else if (typeof row?.engineers === 'object' && row?.engineers !== null) {
                    // If engineers is an object
                    engineersDisplay = row.engineers.name || '-';
                }

                return (
                    <div className="data_table_colum">
                        {groupName}/{engineersDisplay}
                    </div>
                );
            },
            width: '190px',
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
            width: '150px',
            center: true

        },
        {
            name: 'Actions',
            cell: (row) => (
                <div className="action-btn me-3">
                    {row.status === 'concern by fe' && (
                        <div
                            onClick={() => {
                                setCaseId(row._id);
                                setHoldVisible(!holdVisible);
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
                                    setCaseId(row._id);
                                    setViewFeNoteVisible(!viewFeNoteVisible);
                                }}

                                className="edit-btn pointer_cursor px-2"
                            >
                                <FontAwesomeIcon icon={faEye} />
                            </div>
                        </CustomTooltip>
                    )}

                    {!hoveredRows[row._id] && holdStatuses.includes(row.status) && (
                        <div className="holded-btn" onMouseEnter={() => handleMouseEnter(row._id, 'holded')}>
                            Hold
                        </div>
                    )}
                    {!hoveredRows[row._id] && !holdStatuses.includes(row.status) && (
                        <div className="live-btn" onMouseEnter={() => handleMouseEnter(row._id, 'live')}>
                            <div className="live_point"></div>
                            Live
                        </div>
                    )}
                    {hoveredRows[row._id] === 'live' && (
                        <CButton
                            onClick={() => {
                                setCaseId(row._id);
                                setVisibleHoldModel(true);
                            }}
                            variant="outline"
                            size="sm"
                            color="danger"
                            onMouseLeave={() => handleMouseLeave(row._id)}
                        >
                            Hold
                        </CButton>
                    )}

                    {hoveredRows[row._id] === 'holded' && holdStatuses.includes(row.status) && (
                        <CButton
                            onClick={() => {
                                setCaseId(row._id);
                                setUnHoldVisible(true);
                            }}
                            variant="ghost"
                            size="sm"
                            color="success"
                            onMouseLeave={() => handleMouseLeave(row._id)}
                        >
                            Unhold
                        </CButton>
                    )}
                    {row && row.hold_message && holdStatuses.includes(row.status) && (
                        <CustomTooltip content={'Hold Reason'}>
                            <div
                                onClick={() => {
                                    setCaseId(row._id);
                                    setHoldReasonVisible(!holdReasonVisible);
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
                                    setCaseId(row._id);
                                    setUnholdReasonVisible(!unholdReasonVisible);
                                }}
                                className="delet-btn pointer_cursor px-2"
                            >
                                <FontAwesomeIcon icon={faCreativeCommonsBy} />
                            </div>
                        </CustomTooltip>
                    )}



                </div>
            ),
            width: '250px',
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            center: true
        },

        {
            name: 'Tie-Up Action',
            selector: (row) => (
                <div className="data_table_colum">
                    <div className="fs-12 pt-1">
                        {row?.all_status?.pending_for_tie_up && moment(row.all_status.pending_for_tie_up).isValid() ? (
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
                            <div className="data_table_colum">
                                {row?.fe_visit_time ? row.fe_visit_time : '-'}
                            </div>
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
        },

    ];

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
                    `cases/filter?${HelperFunction.convertToQueryString(queryData)}`,
                ).getRequest()
            } else {
                response = await new BasicProvider(`cases?page=${currentPage}&count=${count}&initated=true`).getRequest()
            }

            dispatch({ type: 'set', data: { cases: response.data.data } })
            dispatch({ type: 'set', totalCount: response.data.total })

            setIsLoading(false)
        } catch (error) {
            setIsLoading(false)

            console.error(error)
        } finally {
            isLoading
        }
    }


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

    const handleFilterReset = async () => {
        setFilteredData({
            finance_name: '',
            search_input: '',
            case_create_from: '',
            case_create_to: '',
            status: '',

        })

        setSearchCurrentPage(1)
        currentPage = 1
        setDefaultPage(1)

        // Get the current URL search parameters
        const params = new URLSearchParams(window.location.search)
        const queryData = searchParams.get('data');
        params.delete('finance_name')
        params.delete('search_input')
        params.delete('case_create_from')
        params.delete('case_create_to')
        params.delete('status')

        navigate({ search: params.toString() })

    }


    return (
        <>
            <SingleSubHeader moduleName={'Initiated'} />
            <CContainer fluid>
                <CCard className="mb-2">
                    <CCardBody>
                        <InitiatedFilter
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
                                searchParams.set('filter', 'true');
                                navigate({ search: searchParams.toString() })
                            }}

                        />
                    </CCardBody>
                </CCard>


                {!isLoading ? (
                    <div className="datatable">
                        <DataTable
                            responsive="true"
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
                    <div className="text-center">
                        <CSpinner size="sm" style={{ width: '3rem', height: '3rem' }} />
                        <p>Loading..</p>
                    </div>
                )}

            </CContainer>

            <Hold
                visible={visibleHoldModel}
                close={() => setVisibleHoldModel(!visibleHoldModel)}
                caseId={caseId}
                fetchCaseData={fetchData}
                type="hold"
                status="hold by rc"
                call="rc call"
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
