import { cilBan, cilPencil, cilSpreadsheet, cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CContainer } from '@coreui/react'
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
import SingleSubHeader from 'src/components/custom/SingleSubHeader'
import CustomTooltip from 'src/components/custom/CustomTooltip'

var subHeaderItems = [
  {
    name: 'All Customers',
    link: '/customers',
    icon: cilSpreadsheet,
  },
  {
    name: 'Create Customers',
    link: '/customers/create',
    icon: cilPencil,
  },
  {
    name: 'Trash Customers',
    link: '/customers/trash',
    icon: cilTrash,
  },
]

export default function BlockCustomer() {
  const navigate = useNavigate()
  const [rowPerPage, setRowPerPage] = useState(null)
  const location = useLocation()

  const [userId, setuserId] = useState([])

  const [visible, setVisible] = useState(false)
  const [searchcurrentPage, setSearchCurrentPage] = useState(null)
  const query = new URLSearchParams(location.search)
  var count = query.get('count') || rowPerPage
  var currentPage = parseInt(query.get('page') || 1)
  var search = query.get('search') || ''
  let [defaultPage, setDefaultPage] = useState(currentPage)
  const dispatch = useDispatch()
  const data = useSelector((state) => state.data?.customers)
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
      // console.log(performSearch);
      if (performSearch) {
        queryData['page'] = currentPage
        queryData['count'] = count
        response = await new BasicProvider(
          `customers/search?${HelperFunction.convertToQueryString(queryData)}`,
        ).getRequest()
      } else {
        response = await new BasicProvider(
          `customers/token/all?page=${currentPage}&count=${count}`,
        ).getRequest()
      }
      dispatch({ type: 'set', data: { customers: response.data.data } })
      dispatch({ type: 'set', totalCount: response.data.total })
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    const fetchSelectedRows = async () => {
      const savedSelectedRows = await handleSelectedRowChange('customers')
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
      name: 'Name',
      selector: (row) => (
        <div
          className="pointer_cursor data_Table_title"
          onClick={() => navigate(`/customers/${row.customer_id._id}/info`)}
        >
          <div>{row.customer_id?.name}</div>
        </div>
      ),
    },

    {
      name: '_token',
      cell: (row) => (
        <div style={{ padding: '5px 10px' }}>
          <div className="data_table_colum" style={{ width: '350px' }}>
            {row.access_token}
          </div>
        </div>
      ),
      center: true,
    },
    {
      name: 'Last Login',
      cell: (row) => (
        <CustomTooltip content={moment(row.created_time).format('DD MMM YYYY HH:mm:ss')}>
          <div style={{ padding: '5px 10px' }}>
            <div className="data_table_colum">{moment(row.created_time).fromNow()}</div>
          </div>
        </CustomTooltip>
      ),
      center: true,
    },
    {
      name: 'Status',
      selector: (row) => (
        <div
          className="status-value"
          style={{
            backgroundColor:
              row && row.status === 'active'
                ? '#3bb77e' // Processing status
                : row.status === 'blocked'
                  ? '#ff0000' // Failed status
                  : row.status === 'completed'
                    ? '#3bb77e' // Completed status
                    : row.status === 'completed_summarized' // Summarized status
                      ? '#2f7dd6'
                      : '#000000', // Default (other) status
          }}
        >
          {row.status}
        </div>
      ),
      center: 'true',
    },

    // {
    //   name: 'Created Time',
    //   cell: (row) => (
    //     <CustomTooltip content={moment(row.created_time).format('DD MMM YYYY')}>
    //       <div style={{ padding: '5px 10px' }}>
    //         <div className="data_table_colum">{moment(row.created_time).fromNow()}</div>
    //       </div>
    //     </CustomTooltip>
    //   ),
    // },
    {
      name: 'Action',
      cell: (row) => (
        <div className="action-btn">
          <CustomTooltip content="Block">
            <div className="delet-btn">
              <CIcon
                className="pointer_cursor"
                icon={cilBan}
                onClick={() => {
                  //   setSelectedRow(row)
                  //   setVisible(true)
                  //   setuserId(row)
                }}
              />
            </div>
          </CustomTooltip>
        </div>
      ),
      ignoreRowClick: true,
      button: 'true',
    },
  ]

  const columnsaa = [
    {
      name: 'Name',
      selector: (row) => (
        <div
          className="pointer_cursor data_Table_title"
          onClick={() => navigate(`/customers/${row._id}/info`)}
        >
          {row.name}
        </div>
      ),
    },
    {
      name: '_token',
      selector: (row) => <div className="data_table_colum">{row.email}</div>,
    },
    {
      name: 'Last Login',
      selector: (row) => (
        <CustomTooltip content={row.created_at}>
          <div style={{ padding: '5px 10px' }}>
            <div className="data_table_colum">{row.created_at}</div>
          </div>
        </CustomTooltip>
      ),
    },
    // {
    //     name: 'Expire Time',
    //     selector: (row) => <div className="data_table_colum">{row.mobile}</div>,
    // },
    {
      name: 'Status',
      selector: (row) => <div className="data_table_colum">{row.mobile}</div>,
    },
    {
      name: 'Created',
      selector: (row) => (
        <CustomTooltip content={moment(row.created_time).format('DD MMM YYYY')}>
          <div className="data_table_colum">{moment(row.created_at).fromNow()}</div>
        </CustomTooltip>
      ),
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="action-btn">
          {/* <div className="edit-btn">
            <CIcon
              className="pointer_cursor"
              icon={cilPencil}
              onClick={() => navigate(`/customers/${row._id}/edit`)}
            />
          </div> */}
          <CustomTooltip content="Block">
            <div className="delet-btn">
              <CIcon
                className="pointer_cursor"
                icon={cilBan}
                onClick={() => {
                  setVisible(true)
                  setuserId([row._id])
                }}
              />
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
      <SingleSubHeader moduleName="Customer Block" />

      <CContainer fluid>
        {rowPerPage && data && (
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
                setSelectedRowForModule('customers', value)
              }}
              onSelectedRowsChange={(state) => handleRowChange(state)}
              clearSelectedRows={toggleCleared}
            />
          </div>
        )}
        <DeleteModal
          visible={visible}
          userId={userId}
          moduleName="customers"
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
