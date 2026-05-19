import React, { useEffect, useState } from 'react'
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
  CBadge,
  CFormInput,
  CSpinner,
  CRow,
  CCol,
} from '@coreui/react'
import AppTableSkeleton from 'src/components/custom/table/AppTableSkeleton'
import { toast } from 'react-toastify'
import BasicProvider from 'src/constants/BasicProvider'
import { cilSearch } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import moment from 'moment'

const PendingPunches = () => {
  const [pendingStaff, setPendingStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  useEffect(() => {
    fetchPendingPunches()
  }, [])

  const fetchPendingPunches = async () => {
    setLoading(true)
    try {
      // Fetch all active staff
      const staffResponse = await new BasicProvider('admins?page=1&count=1000').getRequest()
      const allStaff = staffResponse?.data?.data || []
      
      // Filter only active staff
      const activeStaff = allStaff.filter((staff) => staff.status === 'active')

      // Fetch all attendance records for today
      let todayAttendanceMap = new Map()
      try {
        const attendanceResponse = await new BasicProvider(
          `attendances/admin/unapproved?date=${today}`,
        ).getRequest()

        const todayAttendance = attendanceResponse?.data || []
        
        // Create a map of userId -> hasPunchedIn
        todayAttendance.forEach((att) => {
          const userId = att.userId || att.user?._id || att.user
          if (userId) {
            // Check if user has any punch in today (has sessions with punch_in)
            const hasPunchedIn = att.sessions?.some((session) => session.punch_in) || false
            if (hasPunchedIn) {
              todayAttendanceMap.set(String(userId), true)
            }
          }
        })
      } catch (error) {
        console.error('Error fetching today attendance:', error)
      }

      // Find staff who haven't punched in
      const pendingList = activeStaff
        .filter((staff) => {
          // Check if staff has punched in today
          return !todayAttendanceMap.has(String(staff._id))
        })
        .map((staff) => {
          // Safely extract designation and RA Location from profile (same logic as Staff screen)
          const profile = staff.profile || {}

          const designation =
            profile.designation ||
            staff.designation || // fallback if coming directly on root
            '-'

          const raLoc = profile.ra_location
          let raLocationLabel = '-'
          if (raLoc) {
            if (typeof raLoc === 'string') {
              raLocationLabel = raLoc
            } else {
              raLocationLabel = raLoc.label || raLoc.name || '-'
            }
          }

          return {
            _id: staff._id,
            name: staff.name,
            email: staff.email,
            mobile: staff.mobile,
            designation,
            ra_location: raLocationLabel,
            status: staff.status,
          }
        })

      setPendingStaff(pendingList)
    } catch (error) {
      console.error('Error fetching pending punches:', error)
      toast.error('Failed to fetch pending punches')
      setPendingStaff([])
    } finally {
      setLoading(false)
    }
  }

  // Filter staff based on search term
  const filteredStaff = pendingStaff.filter((staff) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      staff.name?.toLowerCase().includes(searchLower) ||
      staff.email?.toLowerCase().includes(searchLower) ||
      staff.mobile?.includes(searchTerm) ||
      staff.designation?.toLowerCase().includes(searchLower) ||
      staff.ra_location?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <CCard className="p-3">
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-bold">Pending Punches - {moment(today).format('DD-MM-YYYY')}</h5>
        <CButton color="primary" onClick={fetchPendingPunches} disabled={loading}>
          {loading ? <CSpinner size="sm" /> : 'Refresh'}
        </CButton>
      </CCardHeader>

      <CCardBody>
        {/* Search */}
        <CRow className="mb-3">
          <CCol md={6}>
            <div className="position-relative">
              <CFormInput
                placeholder="Search by name, email, mobile, designation, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <CIcon
                icon={cilSearch}
                className="position-absolute top-50 end-0 translate-middle-y me-2"
                style={{ pointerEvents: 'none' }}
              />
            </div>
          </CCol>
          <CCol md={6} className="d-flex align-items-center">
            <CBadge color="info" className="ms-auto">
              Total: {filteredStaff.length} staff member{filteredStaff.length !== 1 ? 's' : ''} not punched in
            </CBadge>
          </CCol>
        </CRow>

        {/* Table */}
        {loading ? (
          <AppTableSkeleton ariaLabel="Loading pending punches" rows={7} />
        ) : filteredStaff.length === 0 ? (
          <div className="text-center p-4">
            <CBadge color="success" className="p-3">
              {searchTerm
                ? 'No staff found matching your search'
                : 'All staff members have punched in today! 🎉'}
            </CBadge>
          </div>
        ) : (
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>#</CTableHeaderCell>
                <CTableHeaderCell>Name</CTableHeaderCell>
                <CTableHeaderCell>Email</CTableHeaderCell>
                <CTableHeaderCell>Mobile</CTableHeaderCell>
                <CTableHeaderCell>Designation</CTableHeaderCell>
                <CTableHeaderCell>RA Location</CTableHeaderCell>
                <CTableHeaderCell>Status</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {filteredStaff.map((staff, index) => (
                <CTableRow key={staff._id}>
                  <CTableDataCell>{index + 1}</CTableDataCell>
                  <CTableDataCell>
                    <strong>{staff.name || '-'}</strong>
                  </CTableDataCell>
                  <CTableDataCell>{staff.email || '-'}</CTableDataCell>
                  <CTableDataCell>{staff.mobile || '-'}</CTableDataCell>
                  <CTableDataCell>{staff.designation || '-'}</CTableDataCell>
                  <CTableDataCell>{staff.ra_location || '-'}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color="danger">Not Punched In</CBadge>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        )}
      </CCardBody>
    </CCard>
  )
}

export default PendingPunches
