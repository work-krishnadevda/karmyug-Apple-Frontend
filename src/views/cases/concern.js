import { cilPencil, cilSpreadsheet, cilTrash } from '@coreui/icons'
import { CContainer, CBadge, CCard, CCardHeader, CCardBody, CButton } from '@coreui/react'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import SubHeader from 'src/components/custom/SubHeader'
import { RowsPerPage } from 'src/constants/variables'
import HelperFunction from '../../helpers/HelperFunctions'
import { handleSelectedRowChange, setSelectedRowForModule } from 'src/helpers/paginationCookie'
import { DeleteModal, handleConfirmDelete } from 'src/helpers/deleteModalHelper'
import BasicProvider from 'src/constants/BasicProvider'
import noImage from 'src/assets/images/noImage.png'
import { ShimmerTable, ShimmerTitle } from 'react-shimmer-effects'
import CustomTooltip from 'src/components/custom/CustomTooltip'
import CaseFilter from 'src/components/custom/CaseFilter'
import CooDataTable from 'src/components/custom/department/roles/coo/coodatatable'
import { checkRole } from 'src/constants/common'
import FeDataTable from 'src/components/custom/department/roles/fe/fedatatable'
import SdmDataTable from 'src/components/custom/department/roles/sdm/sdmdatatable'
import RA_DataTable from 'src/components/custom/department/roles/ra/RA_DataTable'
import DM_DataTable from 'src/components/custom/department/roles/dm/DM_DataTable'
import RC_DataTable from 'src/components/custom/department/roles/rc/RC_DataTable'
import LCTO_DataTable from 'src/components/custom/department/roles/lcto/LCTO_DataTable'
import CTO_DataTable from 'src/components/custom/department/roles/cto/CTO_DataTable'
import SingleSubHeader from 'src/components/custom/SingleSubHeader'
import CooConcernDataTable from 'src/components/custom/department/roles/coo/coo_concern'
import RA_Concurn from 'src/components/custom/department/roles/ra/ra_concurn'
import FE_Concurn from 'src/components/custom/department/roles/fe/fe_concurn'
import SFO_Concurn from 'src/components/custom/department/roles/sfo/sfo_concurn'

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

export default function Blogs() {
  const navigate = useNavigate()
  const [rowPerPage, setRowPerPage] = useState(20)
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
  const data = useSelector((state) => state.data?.cases)
  const toggleCleared = useSelector((state) => state.toggleCleared)
  const totalCount = useSelector((state) => state.totalCount)
  const [filteredData, setFilteredData] = useState([])
  const [rabranchData, setRAbranchData] = useState()
  const [financenameData, setFinancenameData] = useState()

  let loggedinUserRole = useSelector((state) => state?.userRole)

  const [isFilter, setIsFilter] = useState(false)

  const [isUpdateQueryParams, setIsUpdateQueryParams] = useState(false)

  const updatePageQueryParam = (paramName, page) => {
    if (isUpdateQueryParams) {

      const searchParams = new URLSearchParams(location.search)
      searchParams.set(paramName, page)
      navigate({ search: searchParams.toString() })
    }
    setIsUpdateQueryParams(true)
  }

  const admin = useSelector((state) => state.userData)
  let isADMIN = checkRole(process.env.REACT_APP_ADMIN, admin)
  let isCOO = checkRole(process.env.REACT_APP_COO, admin)
  let isFE = checkRole(process.env.REACT_APP_FE, admin)
  let isRA = checkRole(process.env.REACT_APP_RA, admin)
  let isSFO = checkRole(process.env.REACT_APP_SFO, admin)

  useEffect(() => {
    for (const [key, value] of query.entries()) {
      if (key !== 'page' && key !== 'count') {
        setFilteredData((prev) => ({
          ...prev,
          [key]: value,
        }))
      }
    }
  }, [])

  // useEffect(() => {
  //   if (rowPerPage) {
  //     fetchData()
  //   }
  // }, [currentPage, rowPerPage, filteredData, search])

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
          `cases/filter?${HelperFunction.convertToQueryString(queryData)}`,
        ).getRequest()
        // console.log(response)
      } else {
        response = await new BasicProvider(`cases?page=${currentPage}&count=${count}`).getRequest()
        // console.log( 'LOLOLOLs',response)
      }

      dispatch({ type: 'set', data: { cases: response.data.data } })
      dispatch({ type: 'set', totalCount: response.data.total })
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)

      console.error(error)
    }
  }

  useEffect(() => {
    const fetchSelectedRows = async () => {
      const savedSelectedRows = await handleSelectedRowChange('cases')
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
    setFilteredData({
      cin_number: '',
      applicant_name: '',
      case_of_branch: '',
      ra_branch: '',
      finance_name: '',
      search_input: '',
      case_create_from: '',
      case_create_to: '',
      status: '',
      group_id: '',
      user_id: '',
    })
    setRAbranchData('')
    setFinancenameData('')
    setSearchCurrentPage(1)
    currentPage = 1
    setDefaultPage(1)
    navigate({ search: '' })
  }

  return (
    <>
      {loggedinUserRole.name === process.env.REACT_APP_COO ? (
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
      ) : (
        <SingleSubHeader moduleName={'All Cases'} />
      )}

      <CContainer fluid>
        <CCard className="mb-2">
          <CCardHeader>
            <div className="d-flex justify-content-between align-items-center">
              <span>Cases Table</span>
            </div>
          </CCardHeader>
          <CCardBody>
            {(isCOO || isADMIN) && <CooConcernDataTable />}

            {isRA && <RA_Concurn />}

            {isSFO && <SFO_Concurn />}

            {isFE && <FE_Concurn />}

          </CCardBody>
        </CCard>
      </CContainer>

    </>
  )
}
