import { cilInfo, cilPencil, cilSend, cilSpreadsheet, cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CContainer, CBadge } from '@coreui/react'
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBan, faEye } from '@fortawesome/free-solid-svg-icons'
import Hold_Reason from 'src/components/custom/popup/hold_reason'
import SingleSubHeader from 'src/components/custom/SingleSubHeader'
import handleSubmitHelper from 'src/helpers/submitHelper'
import { customSuccessMSG } from 'src/helpers/alertHelper'
import { SendBackConformModal } from 'src/helpers/sendBackConform'
import { assignedFeColumn } from 'src/helpers/caseDisplayHelpers'

const validationRules = {}

export default function Dm_SendBack() {
  const navigate = useNavigate()
  const [rowPerPage, setRowPerPage] = useState(20)
  const location = useLocation()
  const [initialValues, setInitialValues] = useState({
    ids: [],
  })

  const [userId, setuserId] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [caseId, setCaseId] = useState('')
  const [visible, setVisible] = useState(false)
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
  const [holdReasonVisible, setHoldReasonVisible] = useState(false)
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
      fetchData()
    }
  }, [currentPage, rowPerPage, searchcurrentPage, search])

  const pathname = location.pathname

  const pathSegments = pathname.split('/')
  const urlQuery = pathSegments[2]

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
          `cases/filter?${HelperFunction.convertToQueryString(queryData)}`,
        ).getRequest()
      } else {
        response = await new BasicProvider(
          `cases/pending?page=${currentPage}&count=${count}`,
        ).getRequest()
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

  // const sendBackToDM = async (id) => {
  //   try {
  //     if (!id) return

  //     let response = await new BasicProvider(`cases/send-back/dm`, dispatch).patchRequest({
  //       id,
  //     })
  //     if (response.status === 'success') {
  //       dispatch({ type: 'set', selectedrows: [] })
  //       customSuccessMSG(dispatch, 'Send Back Successfuly')
  //     }
  //     fetchData()
  //   } catch (error) {
  //     console.log(error)
  //     dispatch({ type: 'set', validations: [error.data] })
  //   }
  // }

  const columns = [
    {
      name: 'Applicant Name',
      selector: (row) => (
        <div
          onClick={() => navigate(`/case/${row._id}/update/details/by/${loggedinUserRole.name}`)}
          className="data_table_colum"
        >
          {row && row.applicant_name ? row.applicant_name : '-'}
        </div>
      ),
      width: '14%',
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
                    {row.status
                      .toLowerCase()
                      .replace(/\b(fe|bm|coo)\b/g, (match) => match.toUpperCase())}
                  </>
                )}
              </CBadge>
            </p>
          ) : (
            '-'
          )}
        </div>
      ),
      width: '12%',
    },

    {
      name: 'MA Branch',
      selector: (row) => (
        <div className="data_table_colum">
          {row && row?.ra_branch?.name ? row?.ra_branch?.name : '-'}
        </div>
      ),
    },
    assignedFeColumn,
    {
      name: 'CEO',
      selector: (row) => (
        <div className="data_table_colum">{row && row?.admin?.name ? row?.admin?.name : '-'}</div>
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
            <div className="edit-btn pointer_cursor">
              <FontAwesomeIcon icon={faEye} />
            </div>
          )}
          <div
            className="edit-btn"
            onClick={() => {
              setVisible(true)
              setuserId(row?._id)

              // sendBackToDM(row?._id)
            }}
          >
            <CIcon className="pointer_cursor" icon={cilSend} />
          </div>
        </div>
      ),

      ignoreRowClick: true,
      allowoverflow: true,
      button: 'true',
    },
  ]

  return (
    <>
      <SingleSubHeader moduleName={'Send Back DM'} />
      <CContainer fluid>
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
          <Hold_Reason
            visible={holdReasonVisible}
            close={() => setHoldReasonVisible(false)}
            caseId={caseId}
          />

          {/* <DeleteModal
            visible={visible}
            userId={userId}
            moduleName="cases"
            currentPage={currentPage}
            rowPerPage={rowPerPage}
            setVisible={setVisible}
            deletionType="trash"
            handleClose={() => setVisible(false)}
          /> */}
          <SendBackConformModal
            visible={visible}
            userId={userId}
            moduleName="cases"
            currentPage={currentPage}
            rowPerPage={rowPerPage}
            setVisible={setVisible}
            // deletionType="trash"
            handleClose={() => setVisible(false)}
          />
        </>
      </CContainer>
    </>
  )
}

