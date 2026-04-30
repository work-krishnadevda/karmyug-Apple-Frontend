import React, { useState, useEffect,useRef  } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CFormInput,
  CButton,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CPagination,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormSelect,
} from '@coreui/react'
import { toast } from 'react-toastify'
import BasicProvider from 'src/constants/BasicProvider'

const MonthlyLeaveSummary = () => {
  const getCurrentMonth = () => {
    const now = new Date()
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const year = now.getFullYear()
    return `${year}-${month}`
  }
const monthRef = useRef(null)


  const [month, setMonth] = useState(getCurrentMonth())
  const [leaveType, setLeaveType] = useState('')
  const [search, setSearch] = useState('')
  const [summary, setSummary] = useState([])
  const [loading, setLoading] = useState(false)

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(20)
  const [totalPages, setTotalPages] = useState(1)

  const [showDetails, setShowDetails] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  useEffect(() => {
    fetchMonthlySummary()
  }, [month, leaveType, search, page])

  const fetchMonthlySummary = async () => {
    setLoading(true)
    try {
      const queryParams = [`month=${month}`, `page=${page}`, `count=${perPage}`]
      if (leaveType) queryParams.push(`leaveType=${leaveType}`)
      if (search) queryParams.push(`search=${search}`)
      const queryString = queryParams.join('&')

      const response = await new BasicProvider(
        `leaves/monthly-summary?${queryString}`,
      ).getRequest()

      setSummary(response.data || [])
      setPerPage(response.per_page || 20)
      setPage(response.current_page || 1)
      setTotalPages(response.last_page || 1)
    } catch (err) {
      toast.error('Error fetching monthly summary')
    }
    setLoading(false)
  }

  const openDetails = (user) => {
    setSelectedUser(user)
    setShowDetails(true)
  }

  return (
    <CCard className="m-3">
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <h5>Monthly Leave Summary</h5>
        <div className="d-flex gap-2">
          {/* <CFormInput
            type="month"
            value={month}
            onChange={(e) => {
              setMonth(e.target.value)
              setPage(1)
            }}
          /> */}
          <div onClick={() => monthRef.current.showPicker()} style={{ cursor: "pointer" }}>
  <CFormInput
    type="month"
    ref={monthRef}
    value={month}
    onChange={(e) => setMonth(e.target.value)}
  />
</div>

          <CFormInput
            type="text"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
          <CFormSelect
            value={leaveType}
            onChange={(e) => {
              setLeaveType(e.target.value)
              setPage(1)
            }}
          >
            <option value="">All Types</option>
            <option value="CL">CL</option>
            <option value="UL">UL</option>
          </CFormSelect>
        </div>
      </CCardHeader>

      <CCardBody>
        <CTable hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Employee</CTableHeaderCell>
              <CTableHeaderCell>Email / Branch</CTableHeaderCell>
              <CTableHeaderCell>CL Taken</CTableHeaderCell>
              <CTableHeaderCell>UL Taken</CTableHeaderCell>
              <CTableHeaderCell>Penalty</CTableHeaderCell>
              <CTableHeaderCell>Remaining CL / Remaining UL </CTableHeaderCell>
              <CTableHeaderCell>Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {summary.length === 0 ? (
              <CTableRow>
                <CTableDataCell colSpan={7} className="text-center">
                  No records found
                </CTableDataCell>
              </CTableRow>
            ) : (
              summary.map((user) => (
                <CTableRow key={user._id}>
                  <CTableDataCell>{user.name}</CTableDataCell>
                  <CTableDataCell>
                    {user.email} {user.branch ? `(${user.branch})` : ''}
                  </CTableDataCell>
                  <CTableDataCell>{user.clTaken}</CTableDataCell>
                  <CTableDataCell>{user.ulTaken}</CTableDataCell>
                  <CTableDataCell>{user.penaltyBucket}</CTableDataCell>
                  <CTableDataCell>
                    {user.remainingCL} / {user.ulUsed}
                  </CTableDataCell>
                  <CTableDataCell>
                    <CButton
                      size="sm"
                      color="info"
                      onClick={() => openDetails(user)}
                    >
                      View Details
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))
            )}
          </CTableBody>
        </CTable>

        {totalPages > 1 && (
          <div className="d-flex justify-content-center mt-3">
            <CPagination
              activePage={page}
              pages={totalPages}
              onActivePageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </CCardBody>

      <CModal
        visible={showDetails}
        onClose={() => setShowDetails(false)}
        size="lg"
      >
        <CModalHeader>
          <CModalTitle>Leave Details</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedUser && (
            <div>
              <p>
                <strong>Employee:</strong> {selectedUser.name}
              </p>
              <p>
                <strong>Email / Branch:</strong> {selectedUser.email}{' '}
                {selectedUser.branch ? `(${selectedUser.branch})` : ''}
              </p>
              <p>
                <strong>CL Taken:</strong> {selectedUser.clTaken}
              </p>
              <p>
                <strong>UL Taken:</strong> {selectedUser.ulTaken}
              </p>
              <p>
                <strong>Penalty Bucket:</strong> {selectedUser.penaltyBucket}
              </p>
              <p>
                <strong>Remaining CL:</strong> {selectedUser.remainingCL}
              </p>
              <p>
                <strong>Remaining UL  :</strong> {selectedUser.ulUsed}
              </p>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowDetails(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </CCard>
  )
}

export default MonthlyLeaveSummary
