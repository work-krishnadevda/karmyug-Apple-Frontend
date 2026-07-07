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
import { RowsPerPage, statusValue } from 'src/constants/variables'
// import HelperFunction from '../../helpers/HelperFunctions'
import { handleSelectedRowChange, setSelectedRowForModule } from 'src/helpers/paginationCookie'
import { DeleteModal, handleConfirmDelete } from 'src/helpers/deleteModalHelper'
import BasicProvider from 'src/constants/BasicProvider'
import noImage from 'src/assets/images/noImage.png'
import CustomTooltip from 'src/components/custom/CustomTooltip'
import HelperFunction from 'src/helpers/HelperFunctions'
import { faEye } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import View_Reason from 'src/components/custom/popup/View_Reason'
import AddNote from 'src/components/custom/popup/addNote'
import { CommonMessageShowModel } from 'src/components/custom/popup/commonMessageModel'

export default function RA_Pending_VISIT() {
  const navigate = useNavigate()
  const [rowPerPage, setRowPerPage] = useState(20)
  const location = useLocation()

  const [userId, setuserId] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const [visible, setVisible] = useState(false)
  const [holdVisible, setHoldVisible] = useState(false)

  const [searchcurrentPage, setSearchCurrentPage] = useState(null)
  const query = new URLSearchParams(location.search)
  var count = query.get('count') || rowPerPage
  var currentPage = parseInt(query.get('page') || 1)
  var search = query.get('search') || ''
  let [defaultPage, setDefaultPage] = useState(currentPage)
  const dispatch = useDispatch()
  const data = useSelector((state) => state.data?.completedCases)
  const toggleCleared = useSelector((state) => state.toggleCleared)
  const totalCount = useSelector((state) => state.totalCount)

  let loggedinUserRole = useSelector((state) => state?.userRole)

  const [caseId, setCaseId] = useState('')
  const [showCaseData, setShowCaseData] = useState({})

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
      const status = 'pending for visit'
      if (performSearch) {
        queryData['page'] = currentPage
        queryData['count'] = count

        queryData['status'] = status
        response = await new BasicProvider(
          `cases/search?${HelperFunction.convertToQueryString(queryData)}`,
        ).getRequest()
        // console.log(response)
      } else {
        response = await new BasicProvider(
          `cases/pending?page=${currentPage}&count=${count}&status=${status}`,
        ).getRequest()
        // console.log( 'LOLOLOLs',response)
      }

      dispatch({ type: 'set', data: { completedCases: response.data.data } })
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
          <div className="fw-bold">{row && row.applicant_name ? row.applicant_name : '-'}</div>
          <div className="fs-12 pt-1">
            {row && row.contact_number_1 ? row.contact_number_1 : '-'}
          </div>
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
                // style={{
                //   background:
                //     row?.status === 'pending for visit'
                //       ? '#3399FF'
                //       : row?.status === 'pending from draft'
                //       ? '#3399FF'
                //       : row?.status === 'updated by coo'
                //       ? '#1C77C3'
                //       : row?.status === 'updated by bm'
                //       ? '#1C77C3'
                //       : row?.status === 'tied-up by fe'
                //       ? '#081632'
                //       : row?.status === 'accepted by fe'
                //       ? '#73b43c'
                //       : row?.status === 'concern by fe'
                //       ? '#73b43c'
                //       : row?.status === 'visit done'
                //       ? '#73b43c'
                //       : row?.status === 'hold by coo'
                //       ? 'red'
                //       : ' ',
                // }}
                style={{
                  background:
                    statusValue.find((item) => item.label === row?.status)?.bgcolor || '#3399FF',
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
      name: 'MA Branch',
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

          <CustomTooltip content={'View details'}>
            <div
              className="edit-btn pointer_cursor"
              onClick={() =>
                navigate(`/case/${row._id}/update/details/by/${loggedinUserRole.name}`)
              }
            >
              <FontAwesomeIcon icon={faEye} />
            </div>
          </CustomTooltip>
        </div>
      ),

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

      <AddNote visible={noteVisible} close={() => setNoteVisible(false)} caseId={caseId} />

      <CommonMessageShowModel
        visible={commonMessageShowModel}
        close={() => setCommonMessageShowModel(false)}
        caseId={caseId}
      />
    </>
  )
}


