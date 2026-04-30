import { cilPencil, cilSpreadsheet, cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CCard, CCardBody, CCardHeader, CContainer, CSpinner } from '@coreui/react'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import SubHeader from 'src/components/custom/SubHeader'
import { RowsPerPage } from 'src/constants/variables'
import BasicProvider from 'src/constants/BasicProvider'
import { DeleteModal } from 'src/helpers/deleteModalHelper'
import { handleSelectedRowChange, setSelectedRowForModule } from 'src/helpers/paginationCookie'
import HelperFunction from '../../../helpers/HelperFunctions'
import { ShimmerTable } from 'react-shimmer-effects'
import CustomTooltip from 'src/components/custom/CustomTooltip'

import noImage from 'src/assets/images/noImage.png'
import SingleSubHeader from 'src/components/custom/SingleSubHeader'
import LoginActivityFilter from 'src/components/custom/LoginActivityFilter'

const URL = process.env.REACT_APP_NODE_URL

export default function LoginActivity() {
    const navigate = useNavigate()
    const [rowPerPage, setRowPerPage] = useState(null)
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
    const data = useSelector((state) => state.data?.loginActivity)
    const toggleCleared = useSelector((state) => state.toggleCleared)
    const totalCount = useSelector((state) => state.totalCount)

    const [filteredData, setFilteredData] = useState([])

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
            fetchData()
        }
    }, [currentPage, rowPerPage, searchcurrentPage, search, filteredData])


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
                response = await new BasicProvider(
                    `login-activity/filter?${HelperFunction.convertToQueryString(queryData)}`,
                ).getRequest()
            } else {
                response = await new BasicProvider(`login-activity?page=${currentPage}&count=${count}`).getRequest()
            }
            dispatch({ type: 'set', data: { loginActivity: response.data.data } })
            dispatch({ type: 'set', totalCount: response.data.total })
            setIsLoading(false)
        } catch (error) {
            console.error(error)
            setIsLoading(false)
        }
    }

    useEffect(() => {
        const fetchSelectedRows = async () => {
            const savedSelectedRows = await handleSelectedRowChange('admins')
            if (savedSelectedRows && !count) {
                setRowPerPage(savedSelectedRows)
            } else {
                setRowPerPage(count)
            }
        }
        fetchSelectedRows()
    }, [count])

    const handleRowChange = useCallback((state) => {
        const rows = state.selectedRows
        const rowsId = rows.map((item) => item._id)
        dispatch({ type: 'set', selectedrows: rowsId })
    }, [])


    const handleFilter = async (search) => {
        try {
            const searchParams = new URLSearchParams(location.search)
            if (search) searchParams.set('search', search)
            navigate({ search: searchParams.toString() })
        } catch (error) {
            console.error('Error fetching data:', error)
        }
    }


    const handleFilterReset = async () => {
        setFilteredData({
            user_id: '',
        })
        setSearchCurrentPage(1)
        currentPage = 1
        setDefaultPage(1)
        navigate({ search: '' })
    }

    const columns = [
        {
            name: 'User Name',
            selector: (row) => (
                <div className="">
                    <div className="data_table_colum pointer_cursor data_Table_title">
                        {row && row.admin && row.admin.name ? `${row.admin.name}` : '-'}
                    </div>
                    <small>{row && row.admin && row.admin.role[0].display_name}</small>
                </div>
            ),
            // center: true
        },
        {
            name: 'Type',
            selector: (row) => (
                <div className="data_table_colum bold">
                    {row?.type || '-'}
                </div>
            ),
            center: true

        },
        {
            name: 'Browser',
            selector: (row) => (
                <div className="data_table_colum">
                    {row?.browser || '-'}
                </div>
            ),
            center: true

        },
        {
            name: 'Operating System',
            selector: (row) => (
                <div className="data_table_colum">
                    {row?.operating_system || '-'}
                </div>
            ),
            center: true

        },
        {
            name: 'Time',
            cell: (row) => (
                <CustomTooltip content={row?.activity_time ? moment(row.activity_time).format('DD MMM YYYY HH:mm:ss') : '-'}>
                    <div style={{ padding: '5px 10px' }}>
                        <div className="data_table_colum">
                            {row?.activity_time ? moment(row.activity_time).fromNow() : '-'}
                        </div>
                    </div>
                </CustomTooltip>
            ),
            center: true

        },

        // {
        //     name: 'Actions',
        //     cell: (row) => (
        //         <div className="action-btn">
        //             <div className="edit-btn">
        //                 <CIcon
        //                     className="pointer_cursor"
        //                     icon={cilPencil}
        //                     onClick={() => row?._id && navigate(`/admin/${row._id}/edit`)}
        //                 />
        //             </div>
        //             <div className="delet-btn">
        //                 <CIcon
        //                     className="pointer_cursor"
        //                     icon={cilTrash}
        //                     onClick={() => {
        //                         if (row?._id) {
        //                             setVisible(true);
        //                             setuserId([row._id]);
        //                         }
        //                     }}
        //                 />
        //             </div>
        //         </div>
        //     ),
        //     ignoreRowClick: true,
        //     allowoverflow: true,
        //     button: 'true',
        // },
    ];

    return (
        <>

            <SingleSubHeader moduleName={'Login Activities'} />

            <CContainer fluid>

                <LoginActivityFilter
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
                        navigate({ search: searchParams.toString() })
                    }}
                />
                {/* {rowPerPage && data && ( */}
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
                            // selectableRows
                            selectableRowsHighlight
                            highlightOnHover
                            paginationRowsPerPageOptions={RowsPerPage}
                            paginationPerPage={rowPerPage}
                            onChangeRowsPerPage={(value) => {
                                count = value
                                setRowPerPage(value)
                                updatePageQueryParam('count', value)
                                setSelectedRowForModule('admin', value)
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

                <DeleteModal
                    visible={visible}
                    userId={userId}
                    moduleName="admins"
                    currentPage={currentPage}
                    rowPerPage={rowPerPage}
                    setVisible={setVisible}
                    deletionType="trash"
                    handleClose={() => setVisible(false)}
                />
            </CContainer>
        </>
    )
}
