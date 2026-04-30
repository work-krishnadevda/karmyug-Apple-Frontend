import { cilPencil, cilSpreadsheet, cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CContainer, CSpinner } from '@coreui/react'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import SubHeader from 'src/components/custom/SubHeader'
import { RowsPerPage } from 'src/constants/variables'

import { ShimmerTable, ShimmerTitle } from 'react-shimmer-effects'
import BasicProvider from 'src/constants/BasicProvider'
import { DeleteModal } from 'src/helpers/deleteModalHelper'
import { handleSelectedRowChange, setSelectedRowForModule } from 'src/helpers/paginationCookie'
import HelperFunction from '../../../helpers/HelperFunctions'

var subHeaderItems = [
  {
    name: 'All Case',
    link: '/builder/case/all',
    icon: cilSpreadsheet,
  },
  {
    name: 'Create Case',
    link: '/builder/case/create ',
    icon: cilPencil,
  },

  {
    name: 'Trash Case',
    link: '/builder/case/trash',
    icon: cilTrash,
  },
]

export default function AllCase() {
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
  const data = useSelector((state) => state.data?.pages)
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
      // setIsLoading(true)
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
          `mobile/pages/search?${HelperFunction.convertToQueryString(queryData)}`,
        ).getRequest()
      } else {
        response = await new BasicProvider(
          `mobile/pages?page=${currentPage}&count=${count}`,
        ).getRequest()
      }
      dispatch({ type: 'set', data: { pages: response.data.data } })
      dispatch({ type: 'set', totalCount: response.data.total })

    } catch (error) {
      console.error(error)

    }
  }

  useEffect(() => {
    const fetchSelectedRows = async () => {
      const savedSelectedRows = await handleSelectedRowChange('pages')
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

  const columns = [
    {
      name: 'Title',
      selector: (row) => (
        <div
          className="pointer_cursor data_Table_title"
        // onClick={() => navigate(`/cms/page/${row._id}/edit`)}
        >
          {row.name ? (
            // <ShimmerEffect width="100%" height="20px" />
            // <ShimmerTitle />
            row.name
          ) : (
            <ShimmerTitle line={5} />

            // Display Shimmer effect when data is not available
          )}
        </div>
      ),
    },
    {
      name: 'Slug',
      selector: (row) => <div className="data_table_colum">{row.slug}</div>,
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
      selector: (row) => <div className="data_table_colum">{moment(row.created_at).fromNow()}</div>,
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="action-btn">
          <div className="edit-btn">
            <CIcon
              className="pointer_cursor"
              icon={cilPencil}
              onClick={() => navigate(`/mobile/pages/${row._id}/edit`)}
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
      <SubHeader
        subHeaderItems={subHeaderItems}
        handleFilter={(search) => handleFilter(search)}
        setSearchCurrentPage={setSearchCurrentPage}
        onReset={() => handleFilterReset()}
        searchInput={search}
        rowPerPage={rowPerPage}
        defaultPage={defaultPage}
        moduleName="mobile/pages"
        deletionType="trash"
      />

      <CContainer fluid>

        {!isLoading ? (
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
              setSelectedRowForModule('pages', value)
            }}
            onSelectedRowsChange={(state) => handleRowChange(state)}
            clearSelectedRows={toggleCleared}
          />
        ) : (
          <div className="text-center">
            <CSpinner size="sm" style={{ width: '3rem', height: '3rem' }} />
            <p>Loading..</p>
          </div>
        )}

        <DeleteModal
          visible={visible}
          userId={userId}
          moduleName="mobile/pages"
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
