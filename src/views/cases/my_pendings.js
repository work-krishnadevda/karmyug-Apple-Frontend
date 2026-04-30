
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { checkRole } from 'src/constants/common'
import SDM_Pending from 'src/components/custom/department/roles/sdm/sdm_pending'
import DM_Pending from 'src/components/custom/department/roles/dm/dm_pending'
import FE_Pending_Tie_Up from 'src/components/custom/department/roles/fe/fe_pending_tie_up'
import RA_Pending_Tie_Up from 'src/components/custom/department/roles/ra/ra_pending_tie_up'
import RC_Pendings from 'src/components/custom/department/roles/rc/rc_pendings'
import LCTO_Pending from 'src/components/custom/department/roles/lcto/LCTO_pending'
import CTO_Pending from 'src/components/custom/department/roles/cto/CTO_Pending'
import { useState } from 'react'


export default function My_Pendings() {
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
  let isCOO = checkRole(process.env.REACT_APP_COO, admin)
  let isFE = checkRole(process.env.REACT_APP_FE, admin)
  let isSDM = checkRole(process.env.REACT_APP_SDM, admin)
  let isRA = checkRole(process.env.REACT_APP_RA, admin)
  let isDM = checkRole(process.env.REACT_APP_DM, admin)
  let isRC = checkRole(process.env.REACT_APP_RC, admin)
  let isLCTO = checkRole(process.env.REACT_APP_LCTO, admin)
  let isCTO = checkRole(process.env.REACT_APP_CTO, admin)
  let isSFO = checkRole(process.env.REACT_APP_SFO, admin)


  return (
    <>
      {isFE && <FE_Pending_Tie_Up />}
      {(isRA || isSFO) && <RA_Pending_Tie_Up />}
      {isSDM && <SDM_Pending />}
      {isDM && <DM_Pending />}
      {isRC && <RC_Pendings />}
      {isLCTO && <LCTO_Pending />}
      {isCTO && <CTO_Pending />}
    </>
  )

}
