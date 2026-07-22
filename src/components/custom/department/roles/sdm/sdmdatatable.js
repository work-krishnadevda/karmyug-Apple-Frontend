import { cilCloudDownload, cilInfo, cilPencil, cilSpreadsheet, cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CContainer,
  CBadge,
  CCard,
  CCardBody,
  CRow,
  CCol,
  CButton,
  CFormLabel,
  CSpinner,
  CTooltip,
} from '@coreui/react'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'
import DataTable from 'src/components/custom/table/AppDataTable'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import SubHeader from 'src/components/custom/SubHeader'
import { holdStatuses, RowsPerPage, statusValue } from 'src/constants/variables'
// import HelperFunction from '../../helpers/HelperFunctions'
import { handleSelectedRowChange, setSelectedRowForModule } from 'src/helpers/paginationCookie'
import { DeleteModal, handleConfirmDelete } from 'src/helpers/deleteModalHelper'
import BasicProvider from 'src/constants/BasicProvider'
import noImage from 'src/assets/images/noImage.png'
import CustomTooltip from 'src/components/custom/CustomTooltip'
import HelperFunction from 'src/helpers/HelperFunctions'

import AsyncSelect from 'react-select/async'
import handleSubmitHelper from 'src/helpers/submitHelper'
import { customSuccessMSG } from 'src/helpers/alertHelper'
import Hold from 'src/components/custom/popup/hold'
import UnHold from 'src/components/custom/popup/unhold'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBan, faEye, faMessage } from '@fortawesome/free-solid-svg-icons'
import View_FE_Note from 'src/components/custom/popup/view_fe_note'
import { CommonMessageShowModel } from 'src/components/custom/popup/commonMessageModel'
import Hold_Reason from 'src/components/custom/popup/hold_reason'
import Unhold_Reason from 'src/components/custom/popup/unhold_region'
import { faCreativeCommonsBy } from '@fortawesome/free-brands-svg-icons'
import { downloadFinalReportZip } from 'src/constants/common'
import AppTableSkeleton from 'src/components/custom/table/AppTableSkeleton'
import { assignedFeColumn } from 'src/helpers/caseDisplayHelpers'

const validationRules = {
  // dm: {
  //   required: true,
  // },
}


export default function SdmDataTable() {
  const navigate = useNavigate()
  const [rowPerPage, setRowPerPage] = useState(20)
  const location = useLocation()

  const [userId, setuserId] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const [currentstatus, setcurrentStatus] = useState('')

  const [visible, setVisible] = useState(false)
  const [searchcurrentPage, setSearchCurrentPage] = useState(null)
  const query = new URLSearchParams(location.search)
  var count = query.get('count') || rowPerPage
  var currentPage = parseInt(query.get('page') || 1)
  var search = query.get('search') || ''
  const [unholdReasonVisible, setUnholdReasonVisible] = useState(false)
  var search_input = query.get('search_input') || ''
  var finance_name = query.get('finance_name') || ''
  var ra_branch = query.get('ra_branch') || ''
  var group_id = query.get('group_id') || ''
  var status = query.get('status') || ''
  var user_id = query.get('user_id') || ''
  var date_from = query.get('date_from') || ''
  var date_to = query.get('date_to') || ''
  var order = query.get('order') || ''
  var case_revise = query.get('case_revise') || ''


  var isCheckbox = query.get('data') || ''






  const queryData = query.get('data')

  let [defaultPage, setDefaultPage] = useState(currentPage)
  const dispatch = useDispatch()
  const data = useSelector((state) => state.data?.cases)

  const [toggleCleared, setToggleCleared] = useState(false)

  const totalCount = useSelector((state) => state.totalCount)

  let loggedinUserRole = useSelector((state) => state?.userRole)

  const [zipLoading, setZipLoading] = useState(false)


  // console.log('SDM-data', data);

  const [isUpdateQueryParams, setIsUpdateQueryParams] = useState(false)

  const updatePageQueryParam = (paramName, page) => {
    if (isUpdateQueryParams) {

      const searchParams = new URLSearchParams(location.search)
      searchParams.set(paramName, page)
      navigate({ search: searchParams.toString() })
    }
    setIsUpdateQueryParams(true)
  }

  const [hoveredRows, setHoveredRows] = useState({})
  const [caseId, setCaseId] = useState('')
  const [viewFeNoteVisible, setViewFeNoteVisible] = useState(false)

  const [visibleHoldModel, setVisibleHoldModel] = useState(false)
  const [unHoldVisible, setUnHoldVisible] = useState(false)
  const [holdReasonVisible, setHoldReasonVisible] = useState(false)
  let [flag, setFlag] = useState(false)

  const [commonMessageShowModel, setCommonMessageShowModel] = useState(false)

  useEffect(() => {
    if (rowPerPage) {
      if (status) {
        setcurrentStatus(status)
      }
      fetchData()
    }

  }, [
    currentPage,
    rowPerPage,
    searchcurrentPage,
    search_input,
    finance_name,
    ra_branch,
    group_id,
    status,
    date_from,
    date_to,
    user_id,
    order,
    case_revise
  ])


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

        if (queryData['data'] == undefined) {
          queryData['data'] = 'allcase'
        }
        response = await new BasicProvider(
          `cms/dashboard/date-wise-cases/counts?${HelperFunction.convertToQueryString(queryData)}`,
        ).getRequest()
        // console.log(response)
      } else {
        response = await new BasicProvider(`cases?page=${currentPage}&count=${count}`).getRequest()
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

  const handelUnholdCase = async () => {
    try {
      if (caseId) {
        let response = await new BasicProvider(`cases/update/${caseId}`, dispatch).patchRequest({
          status: 'unhold by sdm',
          type: 'sdm call',
        })
        if (response) {
          close()
          fetchData()
        }
      }
    } catch (error) {
      console.log('error', error)
    }
  }

  const handleMouseEnter = (rowId, type) => {
    setHoveredRows((prevState) => ({
      ...prevState,
      [rowId]: type,
    }))
  }

  const handleMouseLeave = (rowId) => {
    setHoveredRows((prevState) => ({
      ...prevState,
      [rowId]: null,
    }))
  }


  const columns = [
    {
      name: 'Applicant Name',
      selector: (row) => (
        <div
          className="data_table_colum"
          onClick={() => {
            setCaseId(row._id)
            setCommonMessageShowModel(!commonMessageShowModel)
          }}
        >
          <div className="">{row && row.applicant_name ? row.applicant_name : '-'}</div>
          <div className="fs-12 pt-1">
            {row && row?.finance_name?.name ? row.finance_name.name : '-'}
          </div>
        </div>
      ),
      width: '170px',

    },

    {
      name: 'MA Branch',
      selector: (row) => (
        <div className="data_table_colum">
          <div className="">{row && row?.ra_branch?.name ? row?.ra_branch?.name : '-'}</div>
          <div className="fs-12 pt-1">{row && row.location ? row.location : '-'}</div>
        </div>
      ),
      width: '170px',

    },
    assignedFeColumn,
    {
      name: 'Visit Done By',
      selector: (row) => (
        <div className="data_table_colum">
          <div className="">{row?.accepted_by?.name ? row.accepted_by?.name : '-'}</div>
          <div className="fs-12 pt-1">
            {row?.all_status?.visit_done && moment(row.all_status.visit_done).isValid() ? (
              <CTooltip
                content={moment(row.all_status.visit_done).format('DD MMM YYYY hh:mm:ss A')}
              >
                <div style={{ padding: '5px 10px' }}>
                  <div className="data_table_colum">
                    {moment(row.all_status.visit_done).fromNow()}
                  </div>
                </div>
              </CTooltip>
            ) : (
              <div style={{ padding: '5px 10px' }}>-</div>
            )}
          </div>
        </div>
      ),
      width: '170px',

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
                {row.status.toLowerCase().replace(/\b(fe|rc)\b/g, (match) => match.toUpperCase())}
              </CBadge>
            </p>
          ) : (
            '-'
          )}
        </div>
      ),
      center: true

    },

    {
      name: 'Actions',
      cell: (row) => (
        <div className="action-btn me-3">
          {
            // Show Hold button when not hovered and status is one of the hold statuses
            !hoveredRows[row._id] && holdStatuses.includes(row.status) && (
              <div className="holded-btn" onMouseEnter={() => handleMouseEnter(row._id, 'holded')}>
                Hold
              </div>
            )
          }

          {!hoveredRows[row._id] && !holdStatuses.includes(row.status) && (
            <div className="live-btn" onMouseEnter={() => handleMouseEnter(row._id, 'live')}>
              <div className="live_point"></div>
              Live
            </div>
          )}

          {row && row.fe_note && (
            <CustomTooltip content={'View FE Note'}>
              <div
                onClick={() => {
                  setCaseId(row._id)
                  setViewFeNoteVisible(!viewFeNoteVisible)
                }}
                className="edit-btn pointer_cursor px-2"
              >
                <FontAwesomeIcon icon={faMessage} />
              </div>
            </CustomTooltip>
          )}

          {
            // Show Hold button when row is hovered with 'live' state
            hoveredRows[row._id] === 'live' && (
              <CButton
                onClick={() => {
                  setCaseId(row._id)
                  setVisibleHoldModel(true)
                }}
                variant="outline"
                size="sm"
                color="danger"
                onMouseLeave={() => handleMouseLeave(row._id)}
              >
                Hold
              </CButton>
            )
          }

          {
            // Show Unhold button when row is hovered with 'holded' state and status is one of the hold statuses
            hoveredRows[row._id] === 'holded' && holdStatuses.includes(row.status) && (
              <CButton
                onClick={() => {
                  setCaseId(row._id)
                  setUnHoldVisible(true)
                }}
                variant="ghost"
                size="sm"
                color="success"
                onMouseLeave={() => handleMouseLeave(row._id)}
              >
                Unhold
              </CButton>
            )
          }
          {[
            'hold by admin',
            'hold by coo',
            'hold by bm',
            'hold by sfo',
            'hold by sdm',
            'hold by dm',
            'hold by rc',
            'hold by lcto',
            'hold by cto',
          ].includes(row.status) && (
              <CustomTooltip content={'Hold reason !!'}>
                <div
                  onClick={() => {
                    setCaseId(row._id)
                    setHoldReasonVisible(!holdReasonVisible)
                  }}
                  className="edit-btn pointer_cursor"
                >
                  <FontAwesomeIcon icon={faBan} style={{ color: 'red' }} />
                </div>
              </CustomTooltip>
            )}

          {row && row.unhold_message && (
            <CustomTooltip content={'Unhold Reason'}>
              <div
                onClick={() => {
                  setCaseId(row._id)
                  setUnholdReasonVisible(!unholdReasonVisible)
                }}
                className="delet-btn pointer_cursor px-2"
              >
                <FontAwesomeIcon icon={faCreativeCommonsBy} />
              </div>
            </CustomTooltip>
          )}

          {!['hold by coo', 'hold by sdm'].includes(row.status) && (
            <div className="edit-btn">
              <CIcon
                className="pointer_cursor"
                icon={cilPencil}
                onClick={() =>
                  navigate(`/case/${row._id}/update/${'sdm-form'}/by/${loggedinUserRole.name}`)
                }
              />
            </div>
          )}

          {
            row.status === 'submitted to bank' && (
              <div className="download-btn edit-btn">
                <CIcon
                  className="pointer_cursor"
                  icon={cilCloudDownload
                  }
                  onClick={() => downloadFinalReportZip(row, setZipLoading, dispatch)}
                />
              </div>
            )
          }
        </div>
      ),
      width: '250px',
      ignoreRowClick: true,
      allowoverflow: true,
      button: true,
      center: true

    },
    {
      name: 'Created',
      selector: (row) => (
        <div className="data_table_colum">
          <div className="fs-12 pt-1">
            {row?.created_at && moment(row.created_at).isValid() ? (
              <CTooltip
                content={moment(row.created_at).format('DD MMM YYYY hh:mm:ss A')}
              >
                <div style={{ padding: '5px 10px' }}>
                  <div className="data_table_colum">
                    {moment(row.created_at).fromNow()}
                  </div>
                </div>
              </CTooltip>
            ) : (
              <div style={{ padding: '5px 10px' }}>-</div>
            )}
          </div>
        </div>
      ),
      width: '120px',
    },

    {
      name: 'Draft Action',
      selector: (row) => (
        <div className="data_table_colum">
          <div>{row?.dm?.name ? row.dm.name : '-'}</div>
          <div className="fs-12 pt-1">
            {row?.all_status?.pending_for_rc && moment(row.all_status.pending_for_rc).isValid() ? (
              <CTooltip
                content={moment(row.all_status.pending_for_rc).format('DD MMM YYYY hh:mm:ss A')}
              >
                <div style={{ padding: '5px 10px' }}>
                  <div className="data_table_colum">
                    {moment(row.all_status.pending_for_rc).fromNow()}
                  </div>
                </div>
              </CTooltip>
            ) : (
              <div style={{ padding: '5px 10px' }}>-</div>
            )}
          </div>
        </div>
      ),
      width: '170px',
    },
    {
      name: 'RC Action',
      selector: (row) => (
        <div className="data_table_colum">
          <div>{row?.rc?.name ? row.rc.name : '-'}</div>
          <div className="fs-12 pt-1">
            {row?.all_status?.pending_for_lcto && moment(row.all_status.pending_for_lcto).isValid() ? (
              <CTooltip
                content={moment(row.all_status.pending_for_lcto).format('DD MMM YYYY hh:mm:ss A')}
              >
                <div style={{ padding: '5px 10px' }}>
                  <div className="data_table_colum">
                    {moment(row.all_status.pending_for_lcto).fromNow()}
                  </div>
                </div>
              </CTooltip>
            ) : (
              <div style={{ padding: '5px 10px' }}>-</div>
            )}
          </div>
        </div>
      ),
      width: '170px',
    },
    {
      name: 'Bank Action',
      selector: (row) => (
        <div className="data_table_colum">
          <div>{row.bank_submitted_by?.by?.name ? row.bank_submitted_by.by.name : '-'}</div>
          <div className="fs-12 pt-1">
            {row?.bank_submitted_by?.at && moment(row.bank_submitted_by.at).isValid() ? (
              <CTooltip
                content={moment(row.bank_submitted_by.at).format('DD MMM YYYY hh:mm:ss A')}
              >
                <div style={{ padding: '5px 10px' }}>
                  <div className="data_table_colum">
                    {moment(row.bank_submitted_by.at).fromNow()}
                  </div>
                </div>
              </CTooltip>
            ) : (
              <div style={{ padding: '5px 10px' }}>-</div>
            )}
          </div>
        </div>
      ),
      width: '170px',
      center: true

    },

  ]

  // -------------------------------- ASSIGN DM Data Handler -------------------------------- //

  const selectedRow = useSelector((state) => state.selectedrows)

  const [defaultOptionDM, setDefaultOptionDM] = useState([])
  // State to store attendance status for each DM user (userId -> isPresent)
  // Har DM user ki attendance status store karne ke liye state
  const [dmAttendanceStatus, setDmAttendanceStatus] = useState({})

  const [defaultOptionFE, setDefaultOptionFE] = useState([])

  const [isDmbtnVisible, setIsDmbtnVisible] = useState(false)

  const [isFEbtnVisible, setIsFEbtnVisible] = useState(false)

  const [initialValues, setInitialValues] = useState({
    status: 'pending for draft',
    dm: '',
    ids: [],
  })

  const [initialValuesForReAsign, setInitialValuesForReAsign] = useState({
    engineers: [],
    ids: [],
  })

  useEffect(() => {
    fetchDefaultOptionForDM()
    fetchDefaultOptionForFE()
    setInitialValues((prev) => ({ ...prev, ids: selectedRow }))
    setInitialValuesForReAsign((prev) => ({ ...prev, ids: selectedRow }))
  }, [selectedRow])

  // Function to check if a user is present today based on attendance API
  // Ye function check karta hai ki user aaj present hai ya nahi
  const checkUserAttendanceToday = async (userId) => {
    try {
      // Get current month and year for API call
      // Current month aur year nikal rahe hain API call ke liye
      const currentDate = new Date()
      const currentMonth = currentDate.getMonth() + 1 // Month 1-12 format me
      const currentYear = currentDate.getFullYear()
      const todayDate = currentDate.toISOString().split('T')[0] // Today's date in YYYY-MM-DD format

      // Call attendance API to get user's attendance data
      // Attendance API call kar rahe hain user ki attendance data ke liye
      const response = await new BasicProvider(
        `attendances/staff/${userId}?month=${currentMonth}&year=${currentYear}`,
        dispatch
      ).getRequest()

      // Check if attendance data exists and find today's record
      // Attendance data check kar rahe hain aur aaj ki record dhoondh rahe hain
      if (response && response.data && Array.isArray(response.data)) {
        const todayAttendance = response.data.find((item) => {
          // Compare dates to find today's attendance
          // Dates compare kar rahe hain aaj ki attendance dhoondhne ke liye
          const itemDate = new Date(item.date).toISOString().split('T')[0]
          return itemDate === todayDate
        })

        // Check if user is present today (currently punched in)
        // Check kar rahe hain ki user aaj present hai ya nahi (currently punched in)
        if (todayAttendance) {
          // Check if user has sessions
          // Check kar rahe hain ki user ke paas sessions hain ya nahi
          if (todayAttendance.sessions && todayAttendance.sessions.length > 0) {
            // Get the last session to check current status
            // Current status check karne ke liye last session nikal rahe hain
            const lastSession = todayAttendance.sessions[todayAttendance.sessions.length - 1]
            
            // User is present (green dot) if:
            // 1. Has punch_in in the last session AND
            // 2. Does NOT have punch_out in the last session (still punched in)
            // User present hai (green dot) agar:
            // 1. Last session me punch_in hai AUR
            // 2. Last session me punch_out nahi hai (abhi bhi punched in hai)
            const isPresent = lastSession.punch_in && !lastSession.punch_out
            
            return isPresent
          }
          
          // If no sessions but status is 'present', consider as present
          // Agar koi sessions nahi hain lekin status 'present' hai, to present consider karo
          if (todayAttendance.status === 'present') {
            return true
          }
        }
      }

      // If no attendance record found for today, return false (not present)
      // Agar aaj ke liye koi attendance record nahi mila, to false return kar rahe hain (not present)
      return false
    } catch (error) {
      // If API call fails, assume user is not present (return false)
      // Agar API call fail ho jaye, to assume kar rahe hain ki user present nahi hai (false return)
      console.error(`Error checking attendance for user ${userId}:`, error)
      return false
    }
  }

  const fetchDefaultOptionForDM = async () => {
    try {
      let slugs = [process.env.REACT_APP_DM]
      const queryString = slugs.join(',');
      const url = `admins/get-multiple?slugs=${encodeURIComponent(queryString)}`;

      // Fetch DM users data
      // DM users ka data fetch kar rahe hain
      const response = await new BasicProvider(
        url,
      ).getRequest()

      let ans = response?.data.map((item) => item._id)

      // Fetch case counts for each DM
      // Har DM ke liye case counts fetch kar rahe hain
      const response2 = await new BasicProvider(`cases/get-counts/dm`, dispatch).patchRequest({
        ids: ans,
      })

      let counts = response2.data

      const countMap = counts.reduce((map, item) => {
        map[item._id] = item.count
        return map
      }, {})

      // Create initial options with labels
      // Initial options create kar rahe hain labels ke saath
      const options = response.data.map((item) => ({
        label: item.name,
        value: item._id,
        value1: item.parent?item.parent:item._id,
      }))

      // Check attendance for all DMs in parallel
      // Sabhi DMs ki attendance parallel me check kar rahe hain
      const attendancePromises = options.map(async (option) => {
        const isPresent = await checkUserAttendanceToday(option.value1)
        return { userId: option.value, isPresent }
      })

      // Wait for all attendance checks to complete
      // Sabhi attendance checks complete hone ka wait kar rahe hain
      const attendanceResults = await Promise.all(attendancePromises)

      // Store attendance status in state
      // Attendance status ko state me store kar rahe hain
      const attendanceStatusMap = {}
      attendanceResults.forEach((result) => {
        attendanceStatusMap[result.userId] = result.isPresent
      })
      setDmAttendanceStatus(attendanceStatusMap)

      // Modify options to include case counts
      // Options ko modify kar rahe hain case counts ke saath
      const modifiedOptions = options.map((option) => {
        const count = countMap[option.value]
        if (count !== undefined) {
          option.label = `${option.label} (${count})`
        }
        return option
      })

      // Sort options: Present (green dot) employees first, then Not Present (red dot) employees
      // Options ko sort kar rahe hain: Present employees pehle, phir Not Present employees
      const sortedOptions = modifiedOptions.sort((a, b) => {
        const aIsPresent = attendanceStatusMap[a.value] === true
        const bIsPresent = attendanceStatusMap[b.value] === true
        
        // If both are present or both are not present, maintain original order
        // Agar dono present hain ya dono not present hain, to original order maintain karo
        if (aIsPresent === bIsPresent) {
          return 0
        }
        
        // Present employees come first (return -1 means a comes before b)
        // Present employees pehle aayenge
        return aIsPresent ? -1 : 1
      })

      setDefaultOptionDM(sortedOptions)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchDefaultOptionForFE = async () => {
    try {
      let slugs = [process.env.REACT_APP_FE]
      const queryString = slugs.join(',');
      const url = `admins/get-multiple?slugs=${encodeURIComponent(queryString)}`;

      const response = await new BasicProvider(
        url,
      ).getRequest()
      const options = response.data.map((item) => ({
        label: item.name,
        value: item._id,
      }))

      setDefaultOptionFE(options)
    } catch (error) {
      console.error(error)
    }
  }

  const loadOptionsForDM = async (inputValue, callback) => {
    try {
      let slugs = [process.env.REACT_APP_DM]
      const queryString = slugs.join(',');
      
      // Fetch DM users based on search input
      // Search input ke basis par DM users fetch kar rahe hain
      const response = await new BasicProvider(
        `admins/get-multiple?slugs=${encodeURIComponent(queryString)}&search=${inputValue}`,
      ).getRequest()

      const options = response.data.map((item) => ({
        label: item.name,
        value: item._id,
        value1: item.parent?item.parent:item._id,
      }))

      let ans = response?.data.map((item) => item._id)

      // Fetch case counts for searched DMs
      // Searched DMs ke liye case counts fetch kar rahe hain
      const response2 = await new BasicProvider(`cases/get-counts/dm`, dispatch).patchRequest({
        ids: ans,
      })

      let counts = response2.data

      const countMap = counts.reduce((map, item) => {
        map[item._id] = item.count
        return map
      }, {})

      // Check attendance for searched DMs in parallel
      // Searched DMs ki attendance parallel me check kar rahe hain
      const attendancePromises = options.map(async (option) => {
        const isPresent = await checkUserAttendanceToday(option.value1)
        return { userId: option.value, isPresent }
      })

      // Wait for all attendance checks to complete
      // Sabhi attendance checks complete hone ka wait kar rahe hain
      const attendanceResults = await Promise.all(attendancePromises)

      // Update attendance status in state for searched DMs
      // Searched DMs ki attendance status ko state me update kar rahe hain
      const updatedAttendanceStatus = { ...dmAttendanceStatus }
      attendanceResults.forEach((result) => {
        updatedAttendanceStatus[result.userId] = result.isPresent
      })
      setDmAttendanceStatus(updatedAttendanceStatus)

      // Modify options to include case counts
      // Options ko modify kar rahe hain case counts ke saath
      const modifiedOptions = options.map((option) => {
        const count = countMap[option.value]
        if (count !== undefined) {
          option.label = `${option.label} (${count})`
        }
        return option
      })

      // Sort options: Present (green dot) employees first, then Not Present (red dot) employees
      // Options ko sort kar rahe hain: Present employees pehle, phir Not Present employees
      const sortedOptions = modifiedOptions.sort((a, b) => {
        const aIsPresent = updatedAttendanceStatus[a.value] === true
        const bIsPresent = updatedAttendanceStatus[b.value] === true
        
        // If both are present or both are not present, maintain original order
        // Agar dono present hain ya dono not present hain, to original order maintain karo
        if (aIsPresent === bIsPresent) {
          return 0
        }
        
        // Present employees come first (return -1 means a comes before b)
        // Present employees pehle aayenge
        return aIsPresent ? -1 : 1
      })

      callback(sortedOptions)
    } catch (error) {
      console.error(error)
    }
  }

  const loadOptionsForFE = async (inputValue, callback) => {
    try {
      let slugs = [process.env.REACT_APP_FE]
      const queryString = slugs.join(',');
      const response = await new BasicProvider(
        `admins/get-multiple?slugs=${encodeURIComponent(queryString)}&search=${inputValue}`,
      ).getRequest()

      const options = response.data.map((item) => ({
        label: item.name,
        value: item._id,
      }))
      callback(options)
    } catch (error) {
      console.error(error)
    }
  }


  const sendToDM = async () => {
    try {

      const data = await handleSubmitHelper(initialValues, validationRules, dispatch)
      if (data === false) return

      let response = await new BasicProvider(`cases/assign/dm`, dispatch).patchRequest(data)
      if (response.status === 'success') {
        setFlag(!flag)
        setInitialValues({
          status: 'pending for draft',
          dm: '',
          ids: [],
          engineers: [],
        })

        dispatch({ type: 'set', selectedrows: [] })
        setToggleCleared(!toggleCleared)
        customSuccessMSG(dispatch, 'Assigned Successfuly')
      }
    } catch (error) {
      console.log(error)
      // dispatch({ type: 'set', catcherror: error.data })
      dispatch({ type: 'set', validations: [error.data] })
    }
  }

  const reAssignToFE = async () => {
    try {
      let response = await new BasicProvider(`cases/re-assign/fe`, dispatch).patchRequest(
        initialValuesForReAsign,
      )
      if (response.status === 'success') {
        setFlag(!flag)
        setInitialValuesForReAsign({
          engineers: [],
          ids: [],
        })
        dispatch({ type: 'set', selectedrows: [] })
        setToggleCleared(!toggleCleared)
        customSuccessMSG(dispatch, 'Re-Assigned Successfuly')
        fetchData()
      }

    } catch (error) {
      console.log(error)
      // dispatch({ type: 'set', catcherror: error.data })
      dispatch({ type: 'set', validations: [error.data] })
    }

  }

  const isRowSelectable = useCallback((row) => {
    return row.status === 'visit done'
  }, [])

  return (
    <>
      {
        zipLoading && (
          <div className=" spinner_outerbox">
            <div className="text-center">
              <CSpinner size="lg" style={{ width: '3rem', height: '3rem' }} />
            </div>
          </div>
        )
      }

      {Array.isArray(selectedRow) && selectedRow.length > 0 && (
        <CCard className="mb-4 mt-4">
          <CCardBody>
            <CRow>
              <CCol md={6}>
                <CFormLabel>Select DM</CFormLabel>
                <AsyncSelect
                  name="dm"
                  placeholder="Select DM"
                  menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                  menuPosition="fixed"
                  styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                  loadOptions={(inputValue, callback) => loadOptionsForDM(inputValue, callback)}
                  defaultOptions={defaultOptionDM}
                  value={
                    defaultOptionDM.find(
                      (option) => option.value === (initialValues?.dm?._id || initialValues?.dm),
                    ) || null
                  }
                  getOptionLabel={(option) => option.label}
                  getOptionValue={(option) => option.value}
                  onChange={(selected) => {
                    setInitialValues({ ...initialValues, dm: selected.value })
                  }}
                  // Custom format function to display green/red dot based on attendance
                  // Attendance ke basis par green/red dot dikhane ke liye custom format function
                  formatOptionLabel={({ label, value }) => {
                    // Check if user is present today from attendance status state
                    // Attendance status state se check kar rahe hain ki user aaj present hai ya nahi
                    const isPresent = dmAttendanceStatus[value] === true
                    
                    return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* Green dot if present, red dot if not present */}
                        {/* Present hai to green dot, nahi hai to red dot */}
                        <span
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: isPresent ? '#28a745' : '#dc3545', // Green if present, red if not
                            display: 'inline-block',
                            flexShrink: 0,
                          }}
                          title={isPresent ? 'Present' : 'Not Present'}
                        />
                        <span>{label}</span>
                      </div>
                    )
                  }}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Select Engineer</CFormLabel>
                <AsyncSelect
                  name="engineers"
                  placeholder="Select Engineers"
                  isMulti
                  menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                  menuPosition="fixed"
                  styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                  loadOptions={(inputValue, callback) => loadOptionsForFE(inputValue, callback)}
                  defaultOptions={defaultOptionFE}
                  value={defaultOptionFE.filter((option) =>
                    initialValuesForReAsign.engineers.includes(option.value),
                  )}
                  getOptionLabel={(option) => option.label}
                  getOptionValue={(option) => option.value}
                  onChange={(selectedOptions) => {
                    setInitialValuesForReAsign({
                      ...initialValuesForReAsign,
                      engineers: selectedOptions.map((option) => option.value),
                    })
                  }}
                />
              </CCol>
            </CRow>

            <CRow className="mt-4">
              <CCol md={6} className="d-flex align-items-center">
                <div>
                  <span className="selected_row">{selectedRow?.length} selected</span>
                  {initialValues.dm && (
                    <CButton className="add_new" onClick={sendToDM} style={{ marginLeft: '10px' }}>
                      Assign For Draft
                    </CButton>
                  )}
                </div>
              </CCol>
              <CCol md={6} className="d-flex align-items-center justify-content-end">
                <div>
                  <span className="selected_row">{selectedRow?.length} selected</span>
                  {initialValuesForReAsign.engineers.length > 0 && (
                    <CButton className="add_new" onClick={reAssignToFE} style={{ marginLeft: '10px' }}>
                      Open Revisit
                    </CButton>
                  )}
                </div>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      )}


      {!isLoading ? (
        <div className="datatable mt-4">
          <DataTable
            responsive="true"
            columns={columns}
            data={data}
            conditionalRowStyles={[
              {
                when: (row) => !!row.flagged,
                style: { backgroundColor: 'rgba(255, 193, 7, 0.25)' },
              },
            ]}
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
            selectableRowDisabled={(row) => !isRowSelectable(row)}
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
        <AppTableSkeleton />
      )}

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

      <Hold
        visible={visibleHoldModel}
        close={() => setVisibleHoldModel(!visibleHoldModel)}
        caseId={caseId}
        fetchCaseData={fetchData}
        status="hold by sdm"
        type="hold"
        call="coo call"
      />

      <UnHold
        visible={unHoldVisible}
        close={() => setUnHoldVisible(!unHoldVisible)}
        handelUnholdCase={handelUnholdCase}
        caseId={caseId}
      />
      <View_FE_Note
        visible={viewFeNoteVisible}
        close={() => setViewFeNoteVisible(false)}
        caseId={caseId}
      />
      <Hold_Reason
        visible={holdReasonVisible}
        close={() => setHoldReasonVisible(false)}
        caseId={caseId}
      />
      <Unhold_Reason
        visible={unholdReasonVisible}
        close={() => setUnholdReasonVisible(false)}
        caseId={caseId}
      />

      <CommonMessageShowModel
        visible={commonMessageShowModel}
        close={() => setCommonMessageShowModel(false)}
        caseId={caseId}
      />
    </>
  )
}


