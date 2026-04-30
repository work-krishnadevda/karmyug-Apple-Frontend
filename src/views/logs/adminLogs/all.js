import { cilPencil, cilSpreadsheet, cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CButton, CContainer, CSpinner } from '@coreui/react'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import SubHeader from 'src/components/custom/SubHeader'
import { RowsPerPage } from 'src/constants/variables'

import HelperFunction from '../../../helpers/HelperFunctions'
import { handleSelectedRowChange, setSelectedRowForModule } from 'src/helpers/paginationCookie'
import { DeleteModal, handleConfirmDelete } from 'src/helpers/deleteModalHelper'
import BasicProvider from 'src/constants/BasicProvider'
import { ShimmerTable, ShimmerTitle } from 'react-shimmer-effects'

var subHeaderItems = [
  {
    name: 'All Tickets',
    link: '/support/support-tickets',
    icon: cilSpreadsheet,
  },
  //   {
  //     name: 'Create Blogs',
  //     link: '/cms/blog/create',
  //     icon: cilPencil,
  //   },
  //   {
  //     name: 'Trash Blogs',
  //     link: '/cms/blog/trash',
  //     icon: cilTrash,
  //   },
]

const dummyData = [
  {
    name: 'Log 1',
    subject: 'Subject 1',
    submitterName: 'Submitter 1',
    created_at: new Date().toISOString(),
  },
  {
    name: 'Log 2',
    subject: 'Subject 2',
    submitterName: 'Submitter 2',
    created_at: new Date().toISOString(),
  },
  {
    name: 'Log 3', 
    subject: 'Subject 3',
    submitterName: 'Submitter 3',
    created_at: new Date().toISOString(),
  },
  {
    name: 'Log 4',
    subject: 'Subject 4',
    submitterName: 'Submitter 4',
    created_at: new Date().toISOString(),
  },
  {
    name: 'Log 5',
    subject: 'Subject 5',
    submitterName: 'Submitter 5',
    created_at: new Date().toISOString(),
  },
  {
    name: 'Log 6',
    subject: 'Subject 6',
    submitterName: 'Submitter 6',
    created_at: new Date().toISOString(),
  },
  {
    name: 'Log 7',
    subject: 'Subject 7',
    submitterName: 'Submitter 7',
    created_at: new Date().toISOString(),
  },
  {
    name: 'Log 8',
    subject: 'Subject 8',
    submitterName: 'Submitter 8',
    created_at: new Date().toISOString(),
  },
  {
    name: 'Log 9',
    subject: 'Subject 9',
    submitterName: 'Submitter 9',
    created_at: new Date().toISOString(),
  },
  {
    name: 'Log 10',
    subject: 'Subject 10',
    submitterName: 'Submitter 10',
    created_at: new Date().toISOString(),
  },
  {
    name: 'Log 11',
    subject: 'Subject 11',
    submitterName: 'Submitter 11',
    created_at: new Date().toISOString(),
  },
  {
    name: 'Log 12',
    subject: 'Subject 12',
    submitterName: 'Submitter 12',
    created_at: new Date().toISOString(),
  },
  {
    name: 'Log 13',
    subject: 'Subject 13',
    submitterName: 'Submitter 13',
    created_at: new Date().toISOString(),
  },
  {
    name: 'Log 14',
    subject: 'Subject 14',
    submitterName: 'Submitter 14',
    created_at: new Date().toISOString(),
  },
  {
    name: 'Log 15',
    subject: 'Subject 15',
    submitterName: 'Submitter 15',
    created_at: new Date().toISOString(),
  },
  {
    name: 'Log 16',
    subject: 'Subject 16',
    submitterName: 'Submitter 16',
    created_at: new Date().toISOString(),
  },
  {
    name: 'Log 17',
    subject: 'Subject 17',
    submitterName: 'Submitter 17',
    created_at: new Date().toISOString(),
  },
  {
    name: 'Log 18',
    subject: 'Subject 18',
    submitterName: 'Submitter 18',
    created_at: new Date().toISOString(),
  },
  {
    name: 'Log 19',
    subject: 'Subject 19',
    submitterName: 'Submitter 19',
    created_at: new Date().toISOString(),
  },
  {
    name: 'Log 20',
    subject: 'Subject 20',
    submitterName: 'Submitter 20',
    created_at: new Date().toISOString(),
  },
]

export default function supportTickets() {
  const navigate = useNavigate()
  const [rowPerPage, setRowPerPage] = useState(null)
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
  const data = useSelector((state) => state.data?.blogs)
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
      //   fetchData()
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
          `cms/blogs/search?${HelperFunction.convertToQueryString(queryData)}`,
        ).getRequest()
      } else {
        response = await new BasicProvider(
          `cms/blogs?page=${currentPage}&count=${count}`,
        ).getRequest()
      }
      dispatch({ type: 'set', data: { blogs: response.data.data } })
      dispatch({ type: 'set', totalCount: response.data.total })
      setIsLoading(false)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    const fetchSelectedRows = async () => {
      const savedSelectedRows = await handleSelectedRowChange('blogs')
      if (savedSelectedRows && !count) {
        setRowPerPage(savedSelectedRows)
      } else {
        setRowPerPage(count)
      }
    }
    // fetchSelectedRows()
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
        //   onClick={() => navigate(`/support/support-ticket/${row._id}/show`)}
        >
          {row.name}
        </div>
      ),
    },
    {
      name: 'Subject',
      selector: (row) => <div className="data_table_colum">{row.subject}</div>,
    },
    // {
    //   name: 'Submitter Name',
    //   selector: (row) => <div className="data_table_colum">{row.submitterName} </div>,
    // },
    // {
    //   name: 'Priority',
    //   selector: (row) => (
    //     <div
    //       className="status-value"
    //       style={{
    //         backgroundColor:
    //           row.Priority === 'HIGH'
    //             ? '#3bb77e'
    //             : row.Priority === 'MEDIUM'
    //             ? '#ffb822'
    //             : '#ff4d4f',
    //         color: '#ffffff',
    //       }}
    //     >
    //       {row.Priority}
    //     </div>
    //   ),
    // },
    // {
    //   name: 'Status',
    //   selector: (row) => (
    //     <div
    //       className="status-value"
    //       style={{
    //         backgroundColor: row.status === 'OPEN' ? '#3bb77e' : '#ff4d4f',
    //         color: '#ffffff',
    //       }}
    //     >
    //       {row.status}
    //     </div>
    //   ),
    // },
    {
      name: 'Date Submitted',
      selector: (row) => <div className="data_table_colum">{moment(row.created_at).fromNow()}</div>,
    },
    {
      name: 'Actions',
      cell: (row) => (
        <>
          <div className="action-btn">
            <div className="delet-btn">
              <CIcon
                className="pointer_cursor"
                icon={cilPencil}
                onClick={() => {
                  setVisible(true)
                  setuserId([row._id])
                }}
              />
            </div>
          </div>
          <div className="action-btn">
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
        </>
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
        moduleName="cms/blogs"
        deletionType="trash"
      />

      <CContainer fluid>

        {!isLoading ? (
          <div className="datatable">
            <DataTable
              responsive="true"
              columns={columns}
              data={dummyData}
              paginationServer
              paginationTotalRows={totalCount}
              paginationDefaultPage={defaultPage}

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
          moduleName="cms/blogs"
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
