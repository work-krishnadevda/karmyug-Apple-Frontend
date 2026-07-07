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
import OfflineVisitDone from 'src/components/custom/popup/offlineVisitDone'

export default function FE_Pending_VISIT() {
  const navigate = useNavigate()
  const [rowPerPage, setRowPerPage] = useState(20)
  const location = useLocation()

  const [userId, setuserId] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const [visible, setVisible] = useState(false)
  const [holdVisible, setHoldVisible] = useState(false)
  const [offlineVisirPopVisible, setOfflineVisirPopVisible] = useState(false)
  const [isShowOfflineVisitBtn, setIsShowOfflineVisitBtn] = useState(false)

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

  const updateCase = async (id, status = null) => {
    try {
      const data = await new BasicProvider(`cases/show/${id}`, dispatch).getRequest()
      let res = data?.data?.fe_start_visit
      let json

      if (!status) {
        if (id && res === null) {
          json = {
            fe_start_visit: Date.now(),
          }
        }
      } else {
        json = {
          status: 'visit done',
          visit_type_by_fe: 'offline',
        }
      }

      let response = await new BasicProvider(`cases/update/${id}`, dispatch).patchRequest(json)
    } catch (error) {
      console.log(error)
    }
  }

  let getSettings = async (caseId) => {
    try {
      const res = await new BasicProvider(`settings/access-setting`).getRequest()
      if (res.data.value[0]) {
        const data = res.data.value[0].fe_online_visit
        setIsShowOfflineVisitBtn(data)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getSettings()
  }, [])

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
      width: '150px',
    },
    {
      name: 'Case Of Branch',
      selector: (row) => (
        <div className="data_table_colum">
          {row && row.case_of_branch ? row.case_of_branch : '-'}
        </div>
      ),
      width: '150px',
    },

    {
      name: 'Finance Name',
      selector: (row) => (
        <div className="data_table_colum">
          {row && row?.finance_name?.name ? row.finance_name.name : '-'}
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
      width: '150px',

      center: 'true',
    },

    {
      name: 'MA Branch',
      selector: (row) => (
        <div className="data_table_colum">
          {row && row?.ra_branch?.name ? row?.ra_branch?.name : '-'}
        </div>
      ),
      width: '120px',
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
      width: '150px',
      center: true,
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="action-btn">
          {row.status === 'visit done' ||
          row.status === 'hold by coo' ||
          row.status === 'hold by sdm' ||
          row.status === 'hold by dm' ||
          row.status === 'hold by rc' ||
          row.status === 'hold by lcto' ||
          row.status === 'hold by lcto' ? (
            <>
              {row.status === 'visit done' && (
                <CustomTooltip content={'View details'}>
                  <div
                    className="edit-btn pointer_cursor"
                    onClick={() =>
                      navigate(`/case/${row._id}/show-case-details/by/${loggedinUserRole?.name}`)
                    }
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </div>
                </CustomTooltip>
              )}

              <CButton
                variant="ghost"
                size="sm"
                color="warning"
                onClick={() => {
                  setCaseId(row._id)
                  setNoteVisible(!noteVisible)
                }}
              >
                Add Note
              </CButton>

              {['hold by coo', 'hold by sdm', 'hold by dm', 'hold by rc', 'hold by lcto'].includes(
                row.status,
              ) && (
                <CustomTooltip content={'Hold reason !!'}>
                  <div
                    onClick={() => {
                      setCaseId(row._id)
                      setHoldVisible(true)
                    }}
                    className="edit-btn pointer_cursor"
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </div>
                </CustomTooltip>
              )}
            </>
          ) : (
            <>
              {row &&
              ['concern by fe', 'accepted by fe', 'updated by coo', 'updated by bm'].includes(
                row.status,
              ) ? (
                <CustomTooltip content={'Edit'}>
                  <div className="edit-btn">
                    <CIcon
                      className="pointer_cursor"
                      icon={cilPencil}
                      onClick={() => navigate(`/case/${row._id}/edit`, { state: { id: row._id } })}
                    />
                  </div>
                </CustomTooltip>
              ) : row?.status === 'pending for visit' ? (
                <>
                  <CButton
                    variant="ghost"
                    size="sm"
                    color="warning"
                    onClick={async () => {
                      await updateCase(row._id)
                      navigate(`/case/${row._id}/edit`, { state: { id: row._id } })
                    }}
                  >
                    Start Visit
                  </CButton>

                  {isShowOfflineVisitBtn && (
                    <CButton
                      variant="ghost"
                      size="sm"
                      color="info"
                      onClick={async () => {
                        setCaseId(row._id)
                        setOfflineVisirPopVisible(!offlineVisirPopVisible)
                      }}
                    >
                      <strong>Offline Visit</strong>
                    </CButton>
                  )}
                </>
              ) : null}
            </>
          )}
        </div>
      ),

      ignoreRowClick: true,
      allowoverflow: true,
      button: 'true',
      width: '250px',

      center: true,
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

      <OfflineVisitDone
        visible={offlineVisirPopVisible}
        close={() => setOfflineVisirPopVisible(false)}
        caseId={caseId}
        updateCase={updateCase}
        fetchData={fetchData}
      />
    </>
  )
}


