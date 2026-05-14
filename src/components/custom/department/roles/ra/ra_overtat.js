import { cilPencil, cilSpreadsheet, cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CContainer, CBadge, CButton, CCard } from '@coreui/react'
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
import { faBan, faEye } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import View_Reason from 'src/components/custom/popup/View_Reason'
import AddNote from 'src/components/custom/popup/addNote'
import { CommonMessageShowModel } from 'src/components/custom/popup/commonMessageModel'
import Hold_Reason from 'src/components/custom/popup/hold_reason'
import Hold from 'src/components/custom/popup/hold'
import UnHold from 'src/components/custom/popup/unhold'

var subHeaderItems = [
  {
    name: 'All Cases',
    link: '/case/all',
    icon: cilSpreadsheet,
  },
  {
    name: 'Create Cases',
    link: '/case/create',
    icon: cilPencil,
  },
  {
    name: 'Trash Cases',
    link: '/case/trash',
    icon: cilTrash,
  },
]

export default function RAOverTAT() {
  const navigate = useNavigate()
  const [rowPerPage, setRowPerPage] = useState(20)
  const location = useLocation()

  const [userId, setuserId] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [holdReasonVisible, setHoldReasonVisible] = useState(false)
  const [visible, setVisible] = useState(false)
  const [holdVisible, setHoldVisible] = useState(false)

  const [visibleHoldModel, setVisibleHoldModel] = useState(false)
  const [unHoldVisible, setUnHoldVisible] = useState(false)

  const [searchcurrentPage, setSearchCurrentPage] = useState(null)
  const query = new URLSearchParams(location.search)
  var count = query.get('count') || rowPerPage
  var currentPage = parseInt(query.get('page') || 1)
  var search = query.get('search') || ''
  let [defaultPage, setDefaultPage] = useState(currentPage)
  const dispatch = useDispatch()
  const data = useSelector((state) => state.data?.cases)
  const toggleCleared = useSelector((state) => state.toggleCleared)
  const totalCount = useSelector((state) => state.totalCount)

  let loggedinUserRole = useSelector((state) => state?.userRole)

  const [caseId, setCaseId] = useState('')
  const [showCaseData, setShowCaseData] = useState({})

  const [hoveredRows, setHoveredRows] = useState({})

  const [noteVisible, setNoteVisible] = useState(false)

  const [commonMessageShowModel, setCommonMessageShowModel] = useState(false)

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
  }, [currentPage, rowPerPage, searchcurrentPage, search])


  const fetchData = async () => {
    try {
      // setDefaultPage(currentPage)
      let performSearch = false
      var queryData = {}
      queryData['overtat'] = true
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
        response = await new BasicProvider(`cases?page=${currentPage}&count=${count}&overtat=true`).getRequest()
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

  const updateCase = async (id) => {
    try {
      const data = await new BasicProvider(`cases/show/${id}`, dispatch).getRequest()

      let res = data?.data?.fe_start_visit

      if (id && res === null) {
        let data = {
          fe_start_visit: Date.now(),
        }
        let response = await new BasicProvider(`cases/update/${id}`, dispatch).patchRequest(data)
      }
    } catch (error) {
      console.log(error)
    }
  }

  // useState(() => {
  //   ;(async () => {
  //       try {
  //         console.log('=======================');
  //         const data = await new BasicProvider(`cases/show/${caseId}`).getRequest()
  //         console.log('data>>',data);
  //         setShowCaseData(data.data)
  //       } catch (error) {
  //         dispatch({ type: 'set', catcherror: error.data })
  //       }
  //   })()
  // }, [caseId])


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
        <div className="data_table_colum"
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
      width: '15%',
    },
    {
      name: 'Case Type',
      selector: (row) => (
        <div className="data_table_colum">{row && row.case_type ? row.case_type : '-'}</div>
      ),
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

    // {
    //   name: 'Contact Number',
    //   selector: (row) => (
    //     <div className="data_table_colum">
    //       {row && row.contact_number_1 ? row.contact_number_1 : '-'}
    //     </div>
    //   ),
    // },

    // {
    //   name: 'Case Of Branch',
    //   selector: (row) => (
    //     <div className="data_table_colum">
    //       {row && row.case_of_branch ? row.case_of_branch : '-'}
    //     </div>
    //   ),
    // },

    // {
    //   name: 'Contact Number',
    //   selector: (row) => (
    //     <div className="data_table_colum">
    //       {row && row.contact_number_1 ? row.contact_number_1 : '-'}
    //     </div>
    //   ),
    // },

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
                {row.status === 'updated by coo' ? (
                  'Updated By COO'
                ) : row.status === 'updated by bm' ? (
                  'Updated By BM'
                ) : (
                  <>
                    {row.status
                      .toLowerCase()
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
      width: '15%',
      center: 'true',
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
    // {
    //   name: 'Actions',
    //   cell: (row) => (
    //     <div className="action-btn me-3">
    //       {/* Show the "View" icon if the status is not one of the hold statuses */}
    //       {![
    //         'hold by coo',
    //         'hold by admin',
    //         'hold by sdm',
    //         'hold by dm',
    //         'hold by rc',
    //         'hold by lcto',
    //       ].includes(row.status) && (
    //           <div
    //             onClick={() => {
    //               setCaseId(row._id);
    //               setHoldVisible(!holdVisible);
    //             }}
    //             className="edit-btn pointer_cursor"
    //           >
    //             <FontAwesomeIcon icon={faEye} />
    //           </div>
    //         )}

    //       {/* Show the "Hold Reason" icon only if the status is one of the hold statuses */}
    //       {[
    //         'hold by coo',
    //         'hold by admin',
    //         'hold by sdm',
    //         'hold by dm',
    //         'hold by rc',
    //         'hold by lcto',
    //       ].includes(row.status) && (
    //           <CustomTooltip content={'Hold reason !!'}>
    //             <div
    //               onClick={() => {
    //                 setCaseId(row._id);
    //                 setHoldReasonVisible(!holdReasonVisible);
    //               }}
    //               className="edit-btn pointer_cursor"
    //             >
    //               <FontAwesomeIcon icon={faBan} style={{ color: 'red' }} />
    //             </div>
    //           </CustomTooltip>
    //         )}
    //     </div>
    //   ),

    //   ignoreRowClick: true,
    //   allowoverflow: true,
    //   button: 'true',
    // },

    {
      name: 'Actions',
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

          {[
            'hold by coo',
            'hold by admin',
            'hold by sdm',
            'hold by dm',
            'hold by rc',
            'hold by lcto',
            'hold by bm',
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

      width: '15%',
      ignoreRowClick: true,
      allowoverflow: true,
      button: 'true',
    },
  ]

  return (
    <>
      <>
        {!isLoading ? (
          <div className="datatable">
            <DataTable
              conditionalRowStyles={[
                {
                  when: (row) => row.status === 'updated by bm',
                  style: {
                    // backgroundColor: '#AFE1AF',
                    fontWeight: '800',
                    // transition:'.5s ease'
                  },
                },
                {
                  when: (row) => row.status === 'updated by coo',
                  style: {
                    // backgroundColor: '#AFE1AF',
                    fontWeight: '800',
                    // transition:'.5s ease'
                  },
                },
              ]}
              // className={getRowClass}
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

      <AddNote visible={noteVisible} close={() => setNoteVisible(false)} caseId={caseId} />

      <CommonMessageShowModel
        visible={commonMessageShowModel}
        close={() => setCommonMessageShowModel(false)}
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

      <UnHold
        visible={unHoldVisible}
        close={() => setUnHoldVisible(!unHoldVisible)}
        handelUnholdCase={handelUnholdCase}
        caseId={caseId}
      />
    </>
  )
}


