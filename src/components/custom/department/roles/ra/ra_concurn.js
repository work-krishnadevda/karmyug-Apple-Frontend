import { cilInfo, cilPencil, cilSpreadsheet, cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CContainer, CBadge, CButton } from '@coreui/react'
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
import CustomTooltip from 'src/components/custom/CustomTooltip'
import HelperFunction from 'src/helpers/HelperFunctions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye } from '@fortawesome/free-solid-svg-icons'
import View_Reason from 'src/components/custom/popup/View_Reason'
import Hold from 'src/components/custom/popup/hold'
import Hold_Reason from 'src/components/custom/popup/hold_reason'
import Unhold_Reason from 'src/components/custom/popup/unhold_region'
import UnHold from 'src/components/custom/popup/unhold'
import { faCreativeCommonsBy } from '@fortawesome/free-brands-svg-icons'

export default function RA_Concurn() {
    const navigate = useNavigate()
    const [rowPerPage, setRowPerPage] = useState(20)
    const location = useLocation()

    const [userId, setuserId] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    const [visible, setVisible] = useState(false)
    const [searchcurrentPage, setSearchCurrentPage] = useState(null)
    const query = new URLSearchParams(location.search)
    var count = query.get('count') || rowPerPage
    var currentPage = parseInt(query.get('page') || 1)
    var search = query.get('search') || ''
    let [defaultPage, setDefaultPage] = useState(currentPage)
    const dispatch = useDispatch()
    const data = useSelector((state) => state.data?.raConcurn)
    const toggleCleared = useSelector((state) => state.toggleCleared)
    const totalCount = useSelector((state) => state.totalCount)

    const [caseId, setCaseId] = useState('')

    const [isUpdateQueryParams, setIsUpdateQueryParams] = useState(false)
    const [hoveredRows, setHoveredRows] = useState({})

    const [visibleHoldModel, setVisibleHoldModel] = useState(false)
    const [holdVisible, setHoldVisible] = useState(false)
    const [unHoldVisible, setUnHoldVisible] = useState(false)
    const [unholdReasonVisible, setUnholdReasonVisible] = useState(false)
    const [holdReasonVisible, setHoldReasonVisible] = useState(false)


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
                response = await new BasicProvider(`cases?page=${currentPage}&count=${count}&concern=yes`).getRequest()
            }

            dispatch({ type: 'set', data: { raConcurn: response.data.data } })
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
                    status: 'unhold by bm',
                    type: 'bm call',
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


    const columns = [
        {
            name: 'Applicant Name',
            selector: (row) => (
                <div className="data_table_colum">
                    {row && row.applicant_name ? row.applicant_name : '-'}
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
            name: 'Contact Number',
            selector: (row) => (
                <div className="data_table_colum">
                    {row && row.contact_number_1 ? row.contact_number_1 : '-'}
                </div>
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
            name: 'Status',
            selector: (row) => (
                <div className="data_table_colum">
                    {row && row?.status ? (
                        <p className="rounded-pill mb-0 text-capitalize">
                            <CBadge
                                style={{
                                    background: statusValue.find(item => item.label === row?.status)?.bgcolor || '#3399FF'
                                }}
                            >
                                {row.status === 'updated by bm' ? (
                                    'Updated By You'
                                ) : row.status === 'updated by coo' ? (
                                    'Updated By COO'
                                ) : (
                                    <>
                                        {row.status
                                            .toLowerCase() // Convert status to lowercase
                                            .replace(/\b(coo|bm|fe)\b/g, (match) => match.toUpperCase())}
                                    </>
                                )}
                            </CBadge>
                        </p>
                    ) : (
                        '-'
                    )}
                </div>
            ),
        },

        {
            name: 'RA Branch',
            selector: (row) => (
                <div className="data_table_colum">
                    {row && row?.ra_branch?.name ? row?.ra_branch?.name : '-'}
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



                    <div className="edit-btn">
                        <CIcon
                            className="pointer_cursor"
                            icon={cilPencil}
                            onClick={() =>
                                navigate(`/case/${row._id}/update/details/by/${loggedinUserRole.name}`)
                            }
                        />
                    </div>

                </div>
            ),

            width: '250px',
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            center: true

        },
    ]

    return (
        <>
            <>
                {true && (
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

            <View_Reason
                visible={holdVisible}
                close={() => setHoldVisible(!holdVisible)}
                caseId={caseId}
            />

            <Hold
                visible={visibleHoldModel}
                close={() => setVisibleHoldModel(!visibleHoldModel)}
                caseId={caseId}
                fetchCaseData={fetchData}
                type="hold"
                status="hold by bm"
                call="bm call"
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

