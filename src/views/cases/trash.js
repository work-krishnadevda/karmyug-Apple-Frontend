import { cilPencil, cilReload, cilSpreadsheet, cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CContainer, CSpinner } from '@coreui/react'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import SubHeader from 'src/components/custom/SubHeader'
import { RowsPerPage } from 'src/constants/variables'

import HelperFunction from '../../helpers/HelperFunctions'
import { handleSelectedRowChange, setSelectedRowForModule } from 'src/helpers/paginationCookie'
import { DeleteModal, handleConfirmDelete } from 'src/helpers/deleteModalHelper'
import BasicProvider from 'src/constants/BasicProvider'
import { ShimmerTable, ShimmerTitle } from 'react-shimmer-effects'
import CustomTooltip from 'src/components/custom/CustomTooltip'

import noImage from 'src/assets/images/noImage.png'
const URL = process.env.REACT_APP_NODE_URL


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


export default function Pages() {
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
  const data = useSelector((state) => state.data?.trashCases)
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
      if (performSearch) {
        queryData['page'] = currentPage
        queryData['count'] = count
        response = await new BasicProvider(
          `cases/trash/search?${HelperFunction.convertToQueryString(queryData)}`,
        ).getRequest()
      } else {
        response = await new BasicProvider(
          `cases/trash/all?page=${currentPage}&count=${count}`,
        ).getRequest()
      }
      dispatch({ type: 'set', data: { trashCases: response.data.data } })
      dispatch({ type: 'set', totalCount: response.data.total })
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      console.error(error)
    }
  }

  useEffect(() => {
    const fetchSelectedRows = async () => {
      const savedSelectedRows = await handleSelectedRowChange('trashcases')
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
    setSearchCurrentPage(1)
    currentPage = 1
    setDefaultPage(1)
    navigate({ search: '' })
  }

  const restoreCase = async (userId) => {
    try {
      await new BasicProvider(`cases/multi/restore`).patchRequest({ ids: [userId] })
      fetchData(currentPage, rowPerPage)
    } catch (error) {
      console.error(error)
    }
  }


  const columns = [
    {
      name: 'Applicant Name',
      selector: (row) => <div className="data_table_colum">{row && row.applicant_name ? row.applicant_name : '-'}</div>,
    },
    {
      name: 'Case Of Branch',
      selector: (row) => <div className="data_table_colum">{row && row.case_of_branch ? row.case_of_branch : '-'}</div>,
    },
    {
      name: 'Contact Number',
      selector: (row) => <div className="data_table_colum">{row && row.contact_number_1 ? row.contact_number_1 : '-'}</div>,
    },
    {
      name: 'Finance Name',
      selector: (row) => <div className="data_table_colum">{row && row?.finance_name?.name ? row.finance_name.name : '-'}</div>,
    },
    // {
    //   name: 'Product Name',
    //   selector: (row) => <div className="data_table_colum">{row.product_name}</div>,
    // },
    {
      name: 'RA Branch',
      selector: (row) => <div className="data_table_colum">{row && row?.ra_branch?.name ? row?.ra_branch?.name : '-'}</div>,
    },

    // {
    //   name: 'Status',
    //   selector: (row) => (
    //     <div
    //       className="status-value"
    //       style={{ backgroundColor: row && row.status === 'published' ? '#3bb77e   ' : '#ffb822' }}
    //     >
    //       {row.status}
    //     </div>
    //   ),
    // },

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
      name: 'Deleted',
      cell: (row) => (
        <CustomTooltip content={moment(row.deleted_at).format('DD MMM YYYY HH:mm:ss')}>
          <div style={{ padding: '5px 10px' }}>
            <div className="data_table_colum">{moment(row.deleted_at).fromNow()}</div>
          </div>
        </CustomTooltip>
      ),
    },

    {
      name: 'Actions',
      cell: (row) => (
        <div className="action-btn">
          <div className="edit-btn">
            <CIcon
              className="pointer_cursor"
              icon={cilReload}
              onClick={() => {
                restoreCase(row._id)
              }}
            />
          </div>
          <div className="delet-btn">
            <CIcon
              className="pointer_cursor"
              icon={cilTrash}
              onClick={() => {
                setVisible(true)
                setuserId([row._id])
              }}
            />
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
      <div>
        <SubHeader
          subHeaderItems={subHeaderItems}
          handleFilter={(search) => handleFilter(search)}
          setSearchCurrentPage={setSearchCurrentPage}
          onReset={() => handleFilterReset()}
          searchInput={search}
          rowPerPage={rowPerPage}
          defaultPage={defaultPage}
          moduleName="cases"
          deletionType="delete"
        />
      </div>
      <CContainer fluid>

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
                setSelectedRowForModule('trashcases', value)
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
          moduleName="cases"
          currentPage={currentPage}
          rowPerPage={rowPerPage}
          setVisible={setVisible}
          deletionType="delete"
          handleClose={() => setVisible(false)}
        />
      </CContainer>
    </>
  )
}
