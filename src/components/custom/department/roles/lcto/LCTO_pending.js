import { cilInfo, cilPencil, cilSpreadsheet, cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CContainer, CBadge, CSpinner } from '@coreui/react'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import SubHeader from 'src/components/custom/SubHeader'
import { RowsPerPage, statusValue } from 'src/constants/variables'
// import HelperFunction from '../../helpers/HelperFunctions'
import { handleSelectedRowChange, setSelectedRowForModule } from 'src/helpers/paginationCookie'
import { DeleteModal, handleConfirmDelete } from 'src/helpers/deleteModalHelper'
import BasicProvider from 'src/constants/BasicProvider'
import noImage from 'src/assets/images/noImage.png'
import { ShimmerTable, ShimmerTitle } from 'react-shimmer-effects'
import CustomTooltip from 'src/components/custom/CustomTooltip'
import HelperFunction from 'src/helpers/HelperFunctions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye } from '@fortawesome/free-solid-svg-icons'
import SingleSubHeader from 'src/components/custom/SingleSubHeader'

export default function LCTO_Pending() {
  const navigate = useNavigate()
  const [rowPerPage, setRowPerPage] = useState(20)
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
  const data = useSelector((state) => state.data?.cases)
  const toggleCleared = useSelector((state) => state.toggleCleared)
  const totalCount = useSelector((state) => state.totalCount)

  const [isUpdateQueryParams, setIsUpdateQueryParams] = useState(false)

  const updatePageQueryParam = (paramName, page) => {
    if (isUpdateQueryParams) {
      const searchParams = new URLSearchParams(location.search)
      searchParams.set(paramName, page)
      navigate({ search: searchParams.toString() })
    }
    setIsUpdateQueryParams(true)
  }
  const pathname = location.pathname

  const pathSegments = pathname.split('/')
  const urlQuery = pathSegments[2]

  let loggedinUserRole = useSelector((state) => state?.userRole)

  useEffect(() => {
    if (rowPerPage) {
      fetchData()
    }
  }, [currentPage, rowPerPage, searchcurrentPage, search])

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
      // console.log(performSearch);
      if (performSearch) {
        queryData['page'] = currentPage
        queryData['count'] = count
        response = await new BasicProvider(
          `cases/filter?${HelperFunction.convertToQueryString(queryData)}`,
        ).getRequest()
        // console.log(response)
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
      width: '15%',
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
          <div className="edit-btn">
            <CIcon
              className="pointer_cursor"
              icon={cilPencil}
              onClick={() =>
                navigate(`/case/${row._id}/update/details/by/${loggedinUserRole.name}`)
              }
            />
          </div>

          {/* <div className="delet-btn">
            <CIcon
              className="pointer_cursor"
              icon={cilTrash}
              onClick={() => {
                setVisible(true)
                setuserId([row._id])
              }}
            />
          </div> */}
        </div>
      ),

      ignoreRowClick: true,
      allowoverflow: true,
      button: 'true',
    },
  ]

  return (
    <>
      <SingleSubHeader moduleName={'SV Pending'} />
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
                  selectableRows
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
        </>
      </CContainer>
    </>
  )
}
