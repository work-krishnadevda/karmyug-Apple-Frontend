import { cilInfo, cilPencil, cilSpreadsheet, cilTrash } from '@coreui/icons'
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
import AppTableSkeleton from 'src/components/custom/table/AppTableSkeleton'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import SubHeader from 'src/components/custom/SubHeader'
import { RowsPerPage, statusValue } from 'src/constants/variables'
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
import { CommonMessageShowModel } from 'src/components/custom/popup/commonMessageModel'
import SingleSubHeader from 'src/components/custom/SingleSubHeader'
import { assignedFeColumn } from 'src/helpers/caseDisplayHelpers'

const validationRules = {
  dm: {
    required: true,
  },
}

export default function SDM_Completes() {
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
  const data = useSelector((state) => state.data?.completedCases)
  const toggleCleared = useSelector((state) => state.toggleCleared)
  const totalCount = useSelector((state) => state.totalCount)

  const [commonMessageShowModel, setCommonMessageShowModel] = useState(false)

  const [caseId, setCaseId] = useState('')

  let loggedinUserRole = useSelector((state) => state?.userRole)

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
          `cases/search?${HelperFunction.convertToQueryString(queryData)}`,
        ).getRequest()
        // console.log(response)
      } else {
        response = await new BasicProvider(
          `cases/completed?page=${currentPage}&count=${count}`,
        ).getRequest()
        // console.log( 'LOLOLOLs',response)
      }

      dispatch({ type: 'set', data: { completedCases: response.data.data } })
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
          {row && row.applicant_name ? row.applicant_name : '-'}
        </div>
      ),
    },
    // {
    //   name: 'Case Of Branch',
    //   selector: (row) => (
    //     <div className="data_table_colum">
    //       {row && row.case_of_branch ? row.case_of_branch : '-'}
    //     </div>
    //   ),
    // },

    {
      name: 'Finance Name',
      selector: (row) => (
        <div className="data_table_colum">
          {row && row?.finance_name?.name ? row.finance_name.name : '-'}
        </div>
      ),
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
                {
                  row.status
                    .toLowerCase() // Convert status to lowercase
                    .replace(/\b(fe|rc)\b/g, (match) => match.toUpperCase()) // Convert short forms to uppercase
                }
              </CBadge>
            </p>
          ) : (
            '-'
          )}
        </div>
      ),
    },
    {
      name: 'MA Branch',
      selector: (row) => (
        <div className="data_table_colum">
          {row && row?.ra_branch?.name ? row?.ra_branch?.name : '-'}
        </div>
      ),
    },
    assignedFeColumn,
    {
      name: 'Assigned To',
      selector: (row) => (
        <div className="data_table_colum">{row && row?.dm?.name ? row?.dm?.name : '-'}</div>
      ),
    },
    {
      name: 'Visit Time',
      selector: (row) => (
        <div className="data_table_colum">{row && row.fe_visit_time ? row.fe_visit_time : '-'}</div>
      ),
    },
    {
      name: 'Assigned Ago',
      selector: (row) => (
        <div className="data_table_colum">
          <div className="fs-12 pt-1">
            {row?.all_status?.pending_for_draft && moment(row.all_status.pending_for_draft).isValid() ? (
              <CTooltip
                content={moment(row.all_status.pending_for_draft).format('DD MMM YYYY hh:mm:ss A')}
              >
                <div style={{ padding: '5px 10px' }}>
                  <div className="data_table_colum">
                    {moment(row.all_status.pending_for_draft).fromNow()}
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
      name: 'Actions',
      cell: (row) => (
        <div className="action-btn me-3">
          <div className="edit-btn">
            <CIcon
              className="pointer_cursor"
              icon={cilPencil}
              onClick={() =>
                navigate(`/case/${row._id}/update/${'sdm-form'}/by/${loggedinUserRole.name}`)
              }
            />
          </div>
        </div>
      ),

      ignoreRowClick: true,
      allowoverflow: true,
      button: 'true',
    },
  ]

  // -------------------------------- ASSIGN DM Data Handler -------------------------------- //

  const selectedRow = useSelector((state) => state.selectedrows)

  const [defaultOptionDM, setDefaultOptionDM] = useState([])
  // State to store attendance status for each DM user (userId -> isPresent)
  // Har DM user ki attendance status store karne ke liye state
  const [dmAttendanceStatus, setDmAttendanceStatus] = useState({})

  const [initialValues, setInitialValues] = useState({
    status: 'pending for draft',
    dm: '',
    ids: [],
  })

  useEffect(() => {
    fetchDefaultOptionForDM()
    setInitialValues((prev) => ({ ...prev, ids: selectedRow }))
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

      // Sort options: Present (green dot) employees first, then Not Present (red dot) employees
      // Options ko sort kar rahe hain: Present employees pehle, phir Not Present employees
      const sortedOptions = options.sort((a, b) => {
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

      // Sort options: Present (green dot) employees first, then Not Present (red dot) employees
      // Options ko sort kar rahe hain: Present employees pehle, phir Not Present employees
      const sortedOptions = options.sort((a, b) => {
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


  const sendToDM = async () => {

    // console.log('INIT=====DM',initialValues);
    // return

    try {
      const data = await handleSubmitHelper(initialValues, validationRules, dispatch)
      if (data === false) return

      let response = await new BasicProvider(`cases/assign/dm`, dispatch).patchRequest(data)
      if (response.status === 'success') {
        customSuccessMSG(dispatch, 'Assigned Successfuly')
      }
    } catch (error) {
      console.log(error)
      // dispatch({ type: 'set', catcherror: error.data })
      dispatch({ type: 'set', validations: [error.data] })
    }
  }

  return (
    <>
      <SingleSubHeader moduleName={'Assign Done'} />
      <CContainer fluid>
        <>
          {Array.isArray(selectedRow) && selectedRow.length > 0 && (
            <CCard className="mb-4 mt-4">
              <CCardBody>
                <CRow>
                  <CCol md={6}>

                    {/* <CFormLabel>Select DM</CFormLabel> */}

                    <AsyncSelect
                      name="dm"
                      placeholder="Select DM"
                      loadOptions={(inputValue, callback) => loadOptionsForDM(inputValue, callback)}
                      defaultOptions={defaultOptionDM}
                      value={
                        defaultOptionDM.find(
                          (option) => option.value === (initialValues?.dm?._id || initialValues?.dm),
                        ) || null
                      }
                      getOptionLabel={(option) => option.label}
                      getOptionValue={(option) => option.value}
                      onChange={(selected) =>
                        setInitialValues({ ...initialValues, dm: selected.value })
                      }
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
                  <CCol md={6} className="d-flex align-iten-center justify-content-end">
                    <div>
                      <span className="selected_row">{selectedRow?.length} selected</span>

                      <CButton className="add_new" onClick={sendToDM}>
                        Assign
                      </CButton>
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
                paginationServer
                paginationTotalRows={totalCount}
                paginationDefaultPage={defaultPage}
                onChangePage={(page) => {
                  currentPage = page
                  setDefaultPage(parseInt(page))
                  updatePageQueryParam('page', currentPage)
                }}
                pagination
                // selectableRows
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

          <CommonMessageShowModel
            visible={commonMessageShowModel}
            close={() => setCommonMessageShowModel(false)}
            caseId={caseId}
          />
        </>
      </CContainer>

    </>



  )
}
