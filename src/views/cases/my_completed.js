import { cilPencil, cilSpreadsheet, cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CContainer, CBadge, CCard, CCardHeader, CCardBody } from '@coreui/react'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'
import DataTable from 'src/components/custom/table/AppDataTable'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import SubHeader from 'src/components/custom/SubHeader'
import { RowsPerPage } from 'src/constants/variables'
import HelperFunction from '../../helpers/HelperFunctions'
import { handleSelectedRowChange, setSelectedRowForModule } from 'src/helpers/paginationCookie'
import { DeleteModal, handleConfirmDelete } from 'src/helpers/deleteModalHelper'
import BasicProvider from 'src/constants/BasicProvider'
import noImage from 'src/assets/images/noImage.png'
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
import FE_Completes from 'src/components/custom/department/roles/fe/fe_completes'
import SDM_Completes from 'src/components/custom/department/roles/sdm/sdm_completes'
import DM_Completes from 'src/components/custom/department/roles/dm/dm_completes'
import RA_Completes from 'src/components/custom/department/roles/ra/ra_completes'
import LCTO_Completes from 'src/components/custom/department/roles/lcto/LCTO_completes'
import RC_Completes from 'src/components/custom/department/roles/rc/rc_completes'
import CTO_Completes from 'src/components/custom/department/roles/cto/CTO_Completes'

export default function My_Completed() {
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
      {/* <SingleSubHeader moduleName={'My-Pendings'} /> */}
      {isFE && <FE_Completes />}
      {isSDM && <SDM_Completes />}
      {(isRA || isSFO) && <RA_Completes />}
      {isDM && <DM_Completes />}
      {isRC && <RC_Completes />}
      {isLCTO && <LCTO_Completes />}
      {isCTO && <CTO_Completes />}
    </>
  )

}

