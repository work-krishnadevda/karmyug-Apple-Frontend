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
import BasicProvider from 'src/constants/BasicProvider'
import { DeleteModal } from 'src/helpers/deleteModalHelper'
import { handleSelectedRowChange, setSelectedRowForModule } from 'src/helpers/paginationCookie'
import HelperFunction from '../../../helpers/HelperFunctions'
import { ShimmerTable } from 'react-shimmer-effects'
import CustomTooltip from 'src/components/custom/CustomTooltip'

import noImage from 'src/assets/images/noImage.png'

const URL = process.env.REACT_APP_NODE_URL

var subHeaderItems = [
  {
    name: 'All Admins',
    link: '/admins/all',
    icon: cilSpreadsheet,
  },
  {
    name: 'Create Admin',
    link: '/admin/create',
    icon: cilPencil,
  },
  {
    name: 'Trash Admins',
    link: '/admins/trash',
    icon: cilTrash,
  },
]

export default function adminss() {
  const navigate = useNavigate()
  const [rowPerPage, setRowPerPage] = useState(null)
  const location = useLocation()
  const [signedUrls, setSignedUrls] = useState({})
  const [urlLoading, setUrlLoading] = useState({})

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
  const data = useSelector((state) => state.data?.admins)
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
          `admins/search?${HelperFunction.convertToQueryString(queryData)}`,
        ).getRequest()
      } else {
        response = await new BasicProvider(
          `admins?page=${currentPage}&count=${count}&parent=null`,
        ).getRequest()
      }
      dispatch({ type: 'set', data: { admins: response.data.data } })
      dispatch({ type: 'set', totalCount: response.data.total })
      setIsLoading(false)
    } catch (error) {
      console.error(error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const fetchSelectedRows = async () => {
      const savedSelectedRows = await handleSelectedRowChange('admins')
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

  const fetchSignedUrl = async (fileKey) => {
    if (!fileKey || urlLoading[fileKey]) return
    setUrlLoading((prev) => ({ ...prev, [fileKey]: true }))
    try {
      const response = await new BasicProvider(
        `cms/files/signed-url?key=${fileKey}`,
        dispatch,
      ).getRequest()

      setSignedUrls((prev) => ({ ...prev, [fileKey]: response.data.url }))
    } catch (error) {
      console.error(`Error fetching signed URL for ${fileKey}:`, error)
      setSignedUrls((prev) => ({ ...prev, [fileKey]: 'error' }))
    } finally {
      setUrlLoading((prev) => ({ ...prev, [fileKey]: false }))
    }
  }

  useEffect(() => {
    if (data && data.length > 0) {
      data.forEach((row) => {
        const fileKey = row?.featured_image?.filepath
        if (fileKey && !signedUrls[fileKey]) {
          fetchSignedUrl(fileKey)
        }
      })
    }
  }, [data, signedUrls]) // signedUrls dependency add करो

  const columns = [
    {
      name: 'Name',
      selector: (row) => (
        <div className="pointer_cursor data_Table_title d-flex py-1">
          {row?.featured_image?.filepath ? (
            signedUrls[row.featured_image.filepath] ? (
              <img
                src={signedUrls[row.featured_image.filepath]}
                alt="Featured_image"
                className="product_img me-2 rounded-circle"
                width={35}
                height={35}
              />
            ) : (
              <CSpinner size="sm" />
            )
          ) : (
            <img
              src={noImage}
              alt="Dummy_image"
              className="product_img me-2 rounded-circle"
              width={35}
              height={35}
            />
          )}
          <div>
            <div className="product_name">{row?.name || '-'}</div>
          </div>
        </div>
      ),
      width: '20%',
    },
    {
      name: 'Email',
      selector: (row) => <div className="data_table_colum">{row?.email || '-'}</div>,
    },
    {
      name: 'Role',
      selector: (row) => (
        <div className="data_table_colum">{row?.role?.[0]?.display_name || '-'}</div>
      ),
    },
    {
      name: 'Mobile',
      selector: (row) => <div className="data_table_colum">{row?.mobile || '-'}</div>,
    },
    {
      name: 'Created',
      cell: (row) => (
        <CustomTooltip
          content={row?.created_at ? moment(row.created_at).format('DD MMM YYYY HH:mm:ss') : '-'}
        >
          <div style={{ padding: '5px 10px' }}>
            <div className="data_table_colum">
              {row?.created_at ? moment(row.created_at).fromNow() : '-'}
            </div>
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
              icon={cilPencil}
              onClick={() => row?._id && navigate(`/admin/${row._id}/edit`)}
            />
          </div>
          <div className="delet-btn">
            <CIcon
              className="pointer_cursor"
              icon={cilTrash}
              onClick={() => {
                if (row?._id) {
                  setVisible(true)
                  setuserId([row._id])
                }
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
        moduleName="admins"
        deletionType="trash"
      />

      <CContainer fluid>
        {/* {rowPerPage && data && ( */}
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
                setSelectedRowForModule('admin', value)
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
          moduleName="admins"
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
