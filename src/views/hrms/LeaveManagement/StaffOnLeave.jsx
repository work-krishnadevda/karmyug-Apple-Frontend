import React, { useEffect, useState,useRef  } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CFormInput,
  CBadge,
  CPagination,
  CPaginationItem,
  CSpinner,
} from '@coreui/react'

import AppFormSelect from 'src/components/form/AppFormSelect'
import { useDispatch } from 'react-redux'
import BasicProvider from 'src/constants/BasicProvider'
import './HRLeaveDashboard.css'
import moment from 'moment'

const getCurrentMonthRange = () => {
  const now = new Date()

  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const formatLocalDate = (date) => {
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  return {
    from: formatLocalDate(firstDay),
    to: formatLocalDate(lastDay),
  }
}

const HRLeaveDashboard = () => {
  const dispatch = useDispatch()
  const [leaveRequests, setLeaveRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [raBranchMap, setRaBranchMap] = useState({})
  // const today = new Date().toDateString() // Filters
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [searchFilter, setSearchFilter] = useState('')
  const [raBranchFilter, setRaBranchFilter] = useState('')
  const { from, to } = getCurrentMonthRange()

  const [fromDate, setFromDate] = useState(from)
  const [toDate, setToDate] = useState(to)

  const [showFilters, setShowFilters] = useState(true)
  const fromRef = useRef(null)
  const toRef = useRef(null)
  const [expandedReasons, setExpandedReasons] = useState({})

  useEffect(() => {
    fetchLeaveRequests()
  }, [statusFilter, typeFilter, searchFilter, fromDate, toDate])

  useEffect(() => {
    const fetchRaBranches = async () => {
      try {
        const response = await new BasicProvider('ra_branch?count=1000', dispatch).getRequest()
        const branches = Array.isArray(response?.data?.data)
          ? response.data.data
          : Array.isArray(response?.data)
            ? response.data
            : []
        const map = {}
        branches.forEach((b) => {
          if (b?._id) map[b._id] = b?.name || b?.label || b?._id
        })
        setRaBranchMap(map)
      } catch (err) {
        console.error('Error fetching RA Branch list', err)
      }
    }
    fetchRaBranches()
  }, [dispatch])

  const fetchLeaveRequests = async () => {
    setLoading(true)
    try {
      const queryParams = []

      if (statusFilter) queryParams.push(`status=${statusFilter}`)
      if (typeFilter) queryParams.push(`leaveType=${typeFilter}`)
      if (searchFilter) queryParams.push(`search=${searchFilter}`)
      if (fromDate) queryParams.push(`from=${fromDate}`)
      if (toDate) queryParams.push(`to=${toDate}`)

      queryParams.push(`count=10000`)

      const queryString = queryParams.join('&')
      const response = await new BasicProvider(`leaves?${queryString}`, dispatch).getRequest()

      setLeaveRequests(response.data || [])
      setTotalRecords(response.total || response.data?.length || 0)
    } catch (err) {
      console.error('Error fetching leave requests', err)
    }
    setLoading(false)
  }

  const resetFilters = () => {
    const { from, to } = getCurrentMonthRange()
    setStatusFilter('')
    setTypeFilter('')
    setSearchFilter('')
    setRaBranchFilter('')
    setFromDate(from)
    setToDate(to)
  }

  const getRaBranchLabel = (req) => {
    const branch = req?.user?.ra_branch ?? req?.user?.profile?.ra_branch ?? req?.ra_branch
    if (Array.isArray(branch)) {
      return branch
        .map((b) => {
          if (typeof b === 'object') return b?.name || b?.label || b?.value || b?._id
          return raBranchMap[b] || b
        })
        .filter(Boolean)
        .join(', ')
    }
    if (branch && typeof branch === 'object') {
      return branch?.name || branch?.label || branch?.value || raBranchMap[branch?._id] || '-'
    }
    return raBranchMap[branch] || branch || '-'
  }

  const raBranchOptions = Array.from(
    new Set(
      leaveRequests
        .map((req) => getRaBranchLabel(req))
        .filter((b) => b && b !== '-'),
    ),
  ).sort((a, b) => a.localeCompare(b))

  const filteredRequests = leaveRequests
    .filter((req) => req.status === 'Approved' || req.status === 'Pending')
    .filter((req) => {
      if (!raBranchFilter) return true
      return getRaBranchLabel(req) === raBranchFilter
    })

  const formatDateDMY = (value) => {
    if (!value) return '-'
    const m = moment(value)
    return m.isValid() ? m.format('DD-MM-YYYY') : '-'
  }

  const toggleReason = (id) => {
    if (!id) return
    setExpandedReasons((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const renderReasonCell = (req) => {
    const id = req?._id
    const reason = (req?.reason || '').trim()
    if (!reason) return <span className="text-muted">-</span>
    const expanded = Boolean(expandedReasons[id])
    const limit = 48
    const shouldTruncate = reason.length > limit
    const shown = expanded || !shouldTruncate ? reason : `${reason.slice(0, limit)}…`

    return (
      <div style={{ maxWidth: 240 }}>
        <div style={{ fontSize: '0.85rem', lineHeight: 1.25, whiteSpace: 'normal' }}>{shown}</div>
        {shouldTruncate && (
          <button
            type="button"
            onClick={() => toggleReason(id)}
            className="btn btn-link p-0 mt-1"
            style={{ fontSize: '0.78rem', textDecoration: 'none' }}
          >
            {expanded ? 'Read less' : 'Read more'}
          </button>
        )}
      </div>
    )
  }

  return (
    <CCard className="m-3 ">
      <CCardHeader className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-2">
        <h5 className="mb-2 mb-md-0">Leave Management </h5>
        <div className="d-flex gap-2 flex-wrap">
          <CButton size="sm" color="primary" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </CButton>
          <CButton size="sm" color="secondary" onClick={resetFilters}>
            Reset Filters
          </CButton>
        </div>
      </CCardHeader>
      <CCardBody className={`filter-container ${showFilters ? 'expanded' : 'collapsed'}`}>
        <div className="filter-grid sticky-filters">
          <AppFormSelect value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            <option value="CL">Casual Leave</option>
            <option value="UL">Unpaid Leave</option>
            <option value="Emergency">Emergency Leave</option>
            <option value="Penalty">Penalty Leave</option>
          </AppFormSelect>

          <CFormInput
            placeholder="Search employee..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />

          <AppFormSelect value={raBranchFilter} onChange={(e) => setRaBranchFilter(e.target.value)}>
            <option value="">All RA Branch</option>
            {raBranchOptions.map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </AppFormSelect>

          <CFormInput
            type="date"
            value={fromDate}
            ref={fromRef}
            onClick={() => fromRef.current?.showPicker()}
            onChange={(e) => setFromDate(e.target.value)}
            style={{ cursor: 'pointer' }}
          />

          <CFormInput
            type="date"
            value={toDate}
            ref={toRef}
            onClick={() => toRef.current?.showPicker()}
            onChange={(e) => setToDate(e.target.value)}
            style={{ cursor: 'pointer' }}
          />
        </div>
      </CCardBody>
      <CCardBody>
        {loading ? (
          <div className="text-center p-4">
            <CSpinner />
          </div>
        ) : (
          <>
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Employee</CTableHeaderCell>
                  <CTableHeaderCell>RA Branch</CTableHeaderCell>
                  <CTableHeaderCell>Days</CTableHeaderCell>
                  <CTableHeaderCell>Date of leaves</CTableHeaderCell>
                  <CTableHeaderCell>Dates</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 260 }}>Reason</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                </CTableRow>
              </CTableHead>

              {/* <CTableBody>
                {leaveRequests.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan={6} className="text-center">
                      No leave requests found
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  leaveRequests.map((req) => (
                    <CTableRow key={req._id}>
                      <CTableDataCell>{req.user?.name}</CTableDataCell>

                      <CTableDataCell>{req.totalDays}</CTableDataCell>

                      <CTableDataCell>
                        {new Date(req.createdAt).toLocaleDateString('en-IN')}
                      </CTableDataCell>

                      <CTableDataCell>
                        {new Date(req.start_date).toLocaleDateString()} –{' '}
                        {new Date(req.end_date).toLocaleDateString()}
                      </CTableDataCell>

                      <CTableDataCell>
                        <CBadge
                          color={
                            req.status === 'Approved'
                              ? 'success'
                              : req.status === 'Rejected'
                              ? 'danger'
                              : 'warning'
                          }
                        >
                          {req.status}
                        </CBadge>
                      </CTableDataCell>
                    </CTableRow>
                  ))
                )}
              </CTableBody> */}

              <CTableBody>
                {filteredRequests.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan={7} className="text-center">
                      No leave requests found
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  filteredRequests.map((req) => (
                      <CTableRow key={req._id} className="align-middle">
                        <CTableDataCell style={{ paddingRight: 16 }}>{req.user?.name}</CTableDataCell>

                        <CTableDataCell style={{ paddingRight: 16 }}>
                          {getRaBranchLabel(req)}
                        </CTableDataCell>

                        <CTableDataCell style={{ paddingRight: 16 }}>{req.totalDays}</CTableDataCell>

                        <CTableDataCell style={{ whiteSpace: 'nowrap', paddingRight: 16 }}>
                          {formatDateDMY(req.createdAt)}
                        </CTableDataCell>

                        <CTableDataCell style={{ whiteSpace: 'nowrap', paddingRight: 16 }}>
                          {formatDateDMY(req.start_date)} – {formatDateDMY(req.end_date)}
                        </CTableDataCell>

                        <CTableDataCell style={{ paddingRight: 16 }}>{renderReasonCell(req)}</CTableDataCell>

                        <CTableDataCell style={{ whiteSpace: 'nowrap' }}>
                          <CBadge color={req.status === 'Approved' ? 'success' : 'warning'}>
                            {req.status}
                          </CBadge>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                )}
              </CTableBody>
            </CTable>

            {/* Pagination */}
            {/* <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
              <small>
                Showing page {page} of {lastPage} ({totalRecords} records)
              </small>
              <CPagination align="end">
                {[...Array(lastPage)].map((_, i) => (
                  <CPaginationItem
                    key={i + 1}
                    active={i + 1 === page}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </CPaginationItem>
                ))}
              </CPagination>
            </div> */}
          </>
        )}
      </CCardBody>
    </CCard>
  )
}

export default HRLeaveDashboard
