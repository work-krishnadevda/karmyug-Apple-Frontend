import {
  cilBadge,
  cilEyedropper,
  cilInfo,
  cilPencil,
  cilSpreadsheet,
  cilTrash,
  cilYen,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CContainer, CBadge, CButton } from '@coreui/react'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'
import DataTable from 'src/components/custom/table/AppDataTable'
import AppTableSkeleton from 'src/components/custom/table/AppTableSkeleton'
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
import { faEye } from '@fortawesome/free-solid-svg-icons'
import Hold from 'src/components/custom/popup/hold'
import View_Reason from 'src/components/custom/popup/View_Reason'
import UnHold from 'src/components/custom/popup/unhold'
import View_FE_Note from 'src/components/custom/popup/view_fe_note'
import { statusValue } from 'src/constants/variables'
import { CommonMessageShowModel } from 'src/components/custom/popup/commonMessageModel'
import { faBan } from '@fortawesome/free-solid-svg-icons'
import Hold_Reason from 'src/components/custom/popup/hold_reason'
import { assignedFeColumn } from 'src/helpers/caseDisplayHelpers'


export default function CooOverTAT() {
  const navigate = useNavigate()
  const [rowPerPage, setRowPerPage] = useState(20)
  const location = useLocation()

  const [userId, setuserId] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const [visible, setVisible] = useState(false)
  const [holdReasonVisible, setHoldReasonVisible] = useState(false)

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

  const [visibleHoldModel, setVisibleHoldModel] = useState(false)
  const [holdVisible, setHoldVisible] = useState(false)
  const [unHoldVisible, setUnHoldVisible] = useState(false)

  const [viewFeNoteVisible, setViewFeNoteVisible] = useState(false)

  const [commonMessageShowModel, setCommonMessageShowModel] = useState(false)

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

  useEffect(() => {
    if (rowPerPage) {
      fetchData()
    }
  }, [currentPage, rowPerPage, searchcurrentPage, search])

  const fetchData = async () => {
    try {
      let performSearch = false;
      let queryData = {};

      // Extract query parameters from the URL
      for (const [key, value] of query.entries()) {
        if (key !== 'page' && key !== 'count') {
          queryData[key] = value;
          if (value !== '' && value !== null) {
            performSearch = true;
          }
        }
      }

      let response;

      if (performSearch) {
        // Call the API with query parameters
        response = await new BasicProvider(
          `cases/overtat-filter?${HelperFunction.convertToQueryString(queryData)}`,
        ).getRequest();
      } else {
        // Call the default API endpoint
        response = await new BasicProvider(
          `cases?page=${currentPage}&count=${count}&overtat=24`,
        ).getRequest();
      }

      // Dispatch data to the store
      dispatch({ type: 'set', data: { cases: response.data.data } });
      dispatch({ type: 'set', totalCount: response.data.total });

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error(error);
    }
  };


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
      //   width: '20%',
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
      name: 'MA Branch',
      selector: (row) => (
        <div className="data_table_colum">
          <div className="">{row && row?.ra_branch?.name ? row?.ra_branch?.name : '-'}</div>
          <div className="fs-12 pt-1">{row && row.case_of_branch ? row.case_of_branch : '-'}</div>
        </div>
      ),
    },
    assignedFeColumn,
    {
      name: 'Group/FE',
      cell: (row) => (
        <div className="data_table_colum">
          <div className="">
            {row?.group?.name
              ? row?.group?.name
              : row?.accepted_by?.name
                ? row?.accepted_by?.name
                : 'Not Accepted'}
          </div>
          <div className="fs-12 pt-1">
            <CustomTooltip content={moment(row.created_at).format('DD MMM YYYY HH:mm:ss')}>
              <div style={{ padding: '5px 10px' }}>
                <div className="data_table_colum">{moment(row.created_at).fromNow()}</div>
              </div>
            </CustomTooltip>
          </div>
        </div>
      ),
      //   width: '15%',
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
      width: '15%',
    },


    // {
    //   name: 'Actions',
    //   cell: (row) => (
    //     <div className="action-btn me-3">
    //       {row.status === 'concern by fe' && (
    //         <div
    //           onClick={() => {
    //             setCaseId(row._id)
    //             setHoldVisible(true)
    //           }}
    //           className="edit-btn pointer_cursor"
    //         >
    //           <FontAwesomeIcon icon={faEye} />
    //         </div>
    //       )}

    //       {row && row.fe_note && (
    //         <CustomTooltip content={'View FE Note'}>
    //           <div
    //             onClick={() => {
    //               setCaseId(row._id)
    //               setViewFeNoteVisible(!viewFeNoteVisible)
    //             }}
    //             className="edit-btn pointer_cursor px-2"
    //           >
    //             <FontAwesomeIcon icon={faEye} />
    //           </div>
    //         </CustomTooltip>
    //       )}

    //       {
    //         // Show Hold button when not hovered and status is one of the hold statuses
    //         !hoveredRows[row._id] && holdStatuses.includes(row.status) && (
    //           <div className="holded-btn" onMouseEnter={() => handleMouseEnter(row._id, 'holded')}>
    //             Hold
    //           </div>
    //         )
    //       }

    //       {!hoveredRows[row._id] && !holdStatuses.includes(row.status) && (
    //         <div className="live-btn" onMouseEnter={() => handleMouseEnter(row._id, 'live')}>
    //           <div className="live_point"></div>
    //           Live
    //         </div>
    //       )}

    //       {
    //         // Show Hold button when row is hovered with 'live' state
    //         hoveredRows[row._id] === 'live' && (
    //           <CButton
    //             onClick={() => {
    //               setCaseId(row._id)
    //               setVisibleHoldModel(true)
    //             }}
    //             variant="outline"
    //             size="sm"
    //             color="danger"
    //             onMouseLeave={() => handleMouseLeave(row._id)}
    //           >
    //             Hold
    //           </CButton>
    //         )
    //       }

    //       {
    //         // Show Unhold button when row is hovered with 'holded' state and status is one of the hold statuses
    //         hoveredRows[row._id] === 'holded' && holdStatuses.includes(row.status) && (
    //           <CButton
    //             onClick={() => {
    //               setCaseId(row._id)
    //               setUnHoldVisible(true)
    //             }}
    //             variant="ghost"
    //             size="sm"
    //             color="success"
    //             onMouseLeave={() => handleMouseLeave(row._id)}
    //           >
    //             Unhold
    //           </CButton>
    //         )
    //       }

    //       <div
    //         className="edit-btn pointer_cursor"
    //         onClick={() => navigate(`/case/${row._id}/edit`)}
    //       >
    //         <CIcon icon={cilPencil} />
    //       </div>

    //       {/* Delete Button */}
    //       {/* <div className="delet-btn pointer_cursor" onClick={() => handleDelete(row._id)}>
    //                     <CIcon icon={cilTrash} />
    //                 </div> */}
    //     </div>
    //   ),

    //   width: '20%',
    //   ignoreRowClick: true,
    //   allowOverflow: true,
    //   button: true,
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

          <div
            className="edit-btn pointer_cursor"
            onClick={() => navigate(`/case/${row._id}/edit`)}
          >
            <CIcon icon={cilPencil} />
          </div>


          {/* Delete Button */}
          <div className="delet-btn pointer_cursor"
            onClick={() => {
              setVisible(true)
              setuserId([row._id])
            }}
          >
            <CIcon icon={cilTrash}
            />
          </div>
        </div>
      ),

      width: '20%',
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ]


  return (
    <>
      <>
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

      <Hold_Reason
        visible={holdReasonVisible}
        close={() => setHoldReasonVisible(false)}
        caseId={caseId}
      />
    </>
  )
}

