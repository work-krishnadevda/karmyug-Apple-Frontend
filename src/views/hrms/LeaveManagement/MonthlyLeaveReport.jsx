import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormSelect,
  CFormInput,
  CButton,
  CSpinner,
} from '@coreui/react'
import BasicProvider from 'src/constants/BasicProvider'
import { toast } from 'react-toastify'
import { CSVLink } from 'react-csv'

const MonthlyLeaveReport = () => {
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(new Date().toISOString().substr(0, 7)) // YYYY-MM
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [searchFilter, setSearchFilter] = useState('')

  useEffect(() => {
    fetchLeaves()
  }, [month, statusFilter, typeFilter, searchFilter])

  const fetchLeaves = async () => {
    setLoading(true)
    try {
      const queryParams = [`month=${month}`]
      if (statusFilter) queryParams.push(`status=${statusFilter}`)
      if (typeFilter) queryParams.push(`leaveType=${typeFilter}`)
      if (searchFilter) queryParams.push(`search=${searchFilter}`)

      const queryString = queryParams.join('&')
      const response = await new BasicProvider(`leaves/report?${queryString}`).getRequest()

      setLeaves(response.data || [])
    } catch (err) {
      toast.error('Error fetching monthly report')
    }
    setLoading(false)
  }

  const exportData = leaves.map(l => ({
    Employee: l.user?.name,
    Email: l.user?.email,
    'Leave Type': l.leaveType,
    'Start Date': new Date(l.start_date).toLocaleDateString(),
    'End Date': new Date(l.end_date).toLocaleDateString(),
    Status: l.status,
    Reason: l.reason,
  }))

  return (
    <CCard className="m-3">
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <h5>Monthly Leave Report</h5>
        <CSVLink data={exportData} filename={`Monthly_Leave_Report_${month}.csv`}>
          <CButton color="success" size="sm">Export CSV</CButton>
        </CSVLink>
      </CCardHeader>
      <CCardBody>
        <div className="d-flex gap-2 flex-wrap mb-3">
          <CFormInput
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
          <CFormSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </CFormSelect>
          <CFormSelect value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            <option value="CL">Casual Leave</option>
            <option value="UL">Unpaid Leave</option>
          </CFormSelect>
          <CFormInput
            placeholder="Search employee..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
          <CButton color="secondary" onClick={fetchLeaves}>Filter</CButton>
        </div>

        {loading ? (
          <div className="text-center p-4"><CSpinner /></div>
        ) : (
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Employee</CTableHeaderCell>
                <CTableHeaderCell>Email</CTableHeaderCell>
                <CTableHeaderCell>Leave Type</CTableHeaderCell>
                <CTableHeaderCell>Dates</CTableHeaderCell>
                <CTableHeaderCell>Status</CTableHeaderCell>
                <CTableHeaderCell>Reason</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {leaves.length === 0 ? (
                <CTableRow>
                  <CTableDataCell colSpan={6} className="text-center">No leaves found</CTableDataCell>
                </CTableRow>
              ) : (
                leaves.map((l) => (
                  <CTableRow key={l._id}>
                    <CTableDataCell>{l.user?.name}</CTableDataCell>
                    <CTableDataCell>{l.user?.email}</CTableDataCell>
                    <CTableDataCell>{l.leaveType}</CTableDataCell>
                    <CTableDataCell>
                      {new Date(l.start_date).toLocaleDateString()} - {new Date(l.end_date).toLocaleDateString()}
                    </CTableDataCell>
                    <CTableDataCell>{l.status}</CTableDataCell>
                    <CTableDataCell>{l.reason}</CTableDataCell>
                  </CTableRow>
                ))
              )}
            </CTableBody>
          </CTable>
        )}
      </CCardBody>
    </CCard>
  )
}

export default MonthlyLeaveReport
