import { cilPencil, cilSpreadsheet, cilTrash } from '@coreui/icons'
import { CContainer, CButton } from '@coreui/react'

import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import SubHeader from 'src/components/custom/SubHeader'
import HelperFunction from '../../helpers/HelperFunctions'
import { handleSelectedRowChange } from 'src/helpers/paginationCookie'
import BasicProvider from 'src/constants/BasicProvider'
import CaseFilter from 'src/components/custom/CaseFilter'
import { checkRole } from 'src/constants/common'
import SingleSubHeader from 'src/components/custom/SingleSubHeader'
import RoleCaseDataTables from 'src/components/custom/table/RoleCaseDataTables'
import CaseSectionCard from 'src/components/custom/table/CaseSectionCard'
import { useSearchParams } from 'react-router-dom'

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
  const [filteredData, setFilteredData] = useState([])
  const [rabranchData, setRAbranchData] = useState()
  const [financenameData, setFinancenameData] = useState()

  const [searchParams] = useSearchParams()

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

  let isAdmin = checkRole(process.env.REACT_APP_ADMIN, admin)
  let isCOO = checkRole(process.env.REACT_APP_COO, admin)
  let isFE = checkRole(process.env.REACT_APP_FE, admin)
  let isSDM = checkRole(process.env.REACT_APP_SDM, admin)
  let isRA = checkRole(process.env.REACT_APP_RA, admin)
  let isDM = checkRole(process.env.REACT_APP_DM, admin)
  let isRC = checkRole(process.env.REACT_APP_RC, admin)
  let isLCTO = checkRole(process.env.REACT_APP_LCTO, admin)
  let isCTO = checkRole(process.env.REACT_APP_CTO, admin)
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

  useEffect(() => {
    if (rowPerPage) {
      // fetchData()
    }
  }, [currentPage, rowPerPage, filteredData, search])

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
          `cms/dashboard/date-wise-cases/counts?${HelperFunction.convertToQueryString(queryData)}`,
        ).getRequest()
        // console.log(response)
      } else {
        // response = await new BasicProvider(`cases?page=${currentPage}&count=${count}`).getRequest()
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
      searchParams.set('filter', 'true')
      navigate({ search: searchParams.toString() })
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  // const handleFilterReset = async () => {
  //   setFilteredData({
  //     cin_number: '',
  //     applicant_name: '',
  //     case_of_branch: '',
  //     ra_branch: '',
  //     finance_name: '',
  //     search_input: '',
  //     date_from: '',
  //     date_to: '',
  //     status: '',
  //     group_id: '',
  //     user_id: '',
  //   })
  //   setRAbranchData('')
  //   setFinancenameData('')
  //   setSearchCurrentPage(1)
  //   currentPage = 1
  //   setDefaultPage(1)
  //   navigate({ search: '' })
  // }

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
      status: [],
      group_id: '',
      user_id: '',
      order: '',
      case_revise: '0',
      visit_type_by_fe: '',
    })

    setRAbranchData('')
    setFinancenameData('')
    setSearchCurrentPage(1)
    currentPage = 1
    setDefaultPage(1)

    const params = new URLSearchParams(window.location.search)
    const queryData = searchParams.get('data')

    params.delete('cin_number')
    params.delete('applicant_name')
    params.delete('case_of_branch')
    params.delete('ra_branch')
    params.delete('finance_name')
    params.delete('search_input')
    params.delete('case_create_from')
    params.delete('case_create_to')
    params.delete('status')
    params.delete('group_id')
    params.delete('user_id')
    params.delete('case_revise')
    params.delete('page')
    params.delete('visit_type_by_fe')

    // Reapply the 'data' parameter
    if (queryData) {
      params.set('data', queryData)
    }

    // Update the URL with the modified parameters
    navigate({ search: params.toString() })
  }

  // http://mern.foduu.com:3036/api/cases/filter?status=pending%20for%20accept&case_create_from=Fri%20Jul%2026%202024%2014%3A30%3A01%20GMT%200530%20(India%20Standard%20Time)&case_create_to=Fri%20Jul%2026%202024%2014%3A30%3A01%20GMT%200530%20(India%20Standard%20Time)&page=1&count=20

  // http://mern.foduu.com:3037/#/case/all?count=20&case_create_from=2024-07-26&case_create_to=2024-07-26&status=pending+for+accept&page=1

  return (
    <>
      {loggedinUserRole.name === process.env.REACT_APP_ADMIN ||
      loggedinUserRole.name === process.env.REACT_APP_COO ? (
        <SubHeader
          subHeaderItems={subHeaderItems}
          handleFilter={(search) => handleFilter(search)}
          setSearchCurrentPage={setSearchCurrentPage}
          onReset={() => handleFilterReset()}
          searchInput={search}
          rowPerPage={rowPerPage}
          defaultPage={defaultPage}
          moduleName="cases"
          deletionType="trash"
        />
      ) : (
        <SingleSubHeader moduleName={'All Cases'} />
      )}

      <CContainer fluid>
        {isFilter && (
          <CaseSectionCard variant="filter" title="Filter Cases">
            <CaseFilter
              rowPerPage={rowPerPage}
              filterData={filteredData}
              setFilterData={setFilteredData}
              rabranchData
              setRAbranchData
              financenameData
              setFinancenameData
              onReset={() => {
                handleFilterReset()
              }}
              onFilter={(filterParams) => {
                const searchParams = new URLSearchParams(location.search)
                for (const key in filterParams) {
                  if (filterParams.hasOwnProperty(key)) {
                    const value = filterParams[key]
                    if (value != '') searchParams.set(key, value)
                  }
                }
                searchParams.set('filter', 'true')
                navigate({ search: searchParams.toString() })
              }}
            />
          </CaseSectionCard>
        )}
        <CaseSectionCard
          title="All Cases"
          action={
            <CButton
              color="warning"
              onClick={() => setIsFilter(!isFilter)}
              className="concorn case-table-shell__filter-btn"
            >
              {!isFilter ? 'Open Filter' : 'Close Filter'}
            </CButton>
          }
        >
          <RoleCaseDataTables
            isAdmin={isAdmin}
            isCOO={isCOO}
            isFE={isFE}
            isSDM={isSDM}
            isRA={isRA}
            isDM={isDM}
            isRC={isRC}
            isLCTO={isLCTO}
            isCTO={isCTO}
            isSFO={isSFO}
          />
        </CaseSectionCard>
      </CContainer>
    </>
  )
}

