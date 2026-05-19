import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CRow,
  CCol,
  CButton,
  CSpinner,
  CFormInput,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CModalTitle,
  CFormLabel,
  CAlert,
  CBadge,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'

import AppFormSelect from 'src/components/form/AppFormSelect'
import CIcon from '@coreui/icons-react'
import { cilPlus } from '@coreui/icons'
import { toast } from 'react-toastify'
import Select from 'react-select'
import BasicProvider from 'src/constants/BasicProvider'

const LeaveBalanceDashboard = () => {
  const [managers, setManagers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [loadingBalance, setLoadingBalance] = useState(false)
  const [leaveBalance, setLeaveBalance] = useState(null)
  const [ledger, setLedger] = useState([])
  const [loadingLedger, setLoadingLedger] = useState(false)
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [dayError, setDayError] = useState('')
  const [adjustForm, setAdjustForm] = useState({
    leaveType: 'CL',
    days: 1,
    transactionType: 'credit',
    remarks: '',
  })

  // Fetch managers using the provided API logic
  const fetchManagers = async () => {
    try {
      const slugs = [
        process.env.REACT_APP_ADMIN,
        process.env.REACT_APP_COO,
        process.env.REACT_APP_FE,
        process.env.REACT_APP_RA,
        process.env.REACT_APP_SFO,
        process.env.REACT_APP_SDM,
        process.env.REACT_APP_DM,
        process.env.REACT_APP_RC,
        process.env.REACT_APP_LCTO,
        process.env.REACT_APP_CTO,
      ]
      const queryString = slugs.join(',')
      //   const response = await new BasicProvider(`admins`).getRequest()
      const response = await new BasicProvider('admins?page=1&count=1000').getRequest()
      const staff = response.data.data || []
      const managerOptions = staff.map((manager) => ({
        value: manager._id,
        label: `${manager.name}`,
      }))
      setManagers(managerOptions)
    } catch (error) {
      console.error('Error fetching managers:', error)
      toast.error('Failed to load employees list')
    }
  }

  // Fetch user leave balance
  const fetchLeaveBalance = async (userId) => {
    if (!userId) return
    try {
      setLoadingBalance(true)
      const response = await new BasicProvider(`leaves/balance/${userId}`).getRequest()
      setLeaveBalance(response.data)
    } catch (err) {
      toast.error('Failed to fetch leave balance')
    } finally {
      setLoadingBalance(false)
    }
  }

  // Fetch user leave ledger
  const fetchLedger = async (userId) => {
    try {
      setLoadingLedger(true)
      const response = await new BasicProvider(
        `leaves/ledger?userId=${userId}&page=1&count=1000`,
      ).getRequest()

      // Handle both paginated ({ data: [...] }) and plain array API responses.
      const ledgerItems = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
          ? response
          : Array.isArray(response?.data?.data)
            ? response.data.data
            : []

      setLedger(ledgerItems)
    } catch (err) {
      console.error(err)
      toast.error('Failed to fetch ledger')
    } finally {
      setLoadingLedger(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchManagers()
  }, [])

  // When user changes
  useEffect(() => {
    if (selectedUser?.value) {
      fetchLeaveBalance(selectedUser.value)
      fetchLedger(selectedUser.value)
    } else {
      setLeaveBalance(null)
      setLedger([])
    }
  }, [selectedUser])

  // Handle adjustment submit
  const handleAdjustSubmit = async () => {
    if (!selectedUser) {
      toast.error('Please select a user first')
      return
    }

    const { leaveType, days, transactionType, remarks } = adjustForm
    if (!days || days <= 0) {
      toast.error('Enter valid number of days')
      return
    }

    try {
      const payload = {
        user: selectedUser.value,
        leaveType,
        days: Number(days),
        transactionType, // credit or debit
        remarks,
      }
      const response = await new BasicProvider(`leaves/adjust`, null).postRequest(payload)
      toast.success('Leave adjusted successfully')
      setShowAdjustModal(false)
      fetchLeaveBalance(selectedUser.value)
      fetchLedger(selectedUser.value)
    } catch (err) {
      toast.error('Failed to adjust leave')
    }
  }


  const getDaysOptions = () => {
  if (adjustForm.leaveType === "CL") {
    return Array.from({ length: 20 }, (_, i) => i + 1); // 1 to 20
  }
  return [1,2,3,4,8,12,16,20,24,28,32,36,40,44,48,52,56,60]; // existing values
};

  const formatDateDisplay = (value) => {
    if (!value) return '-'
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return '-'
    return d.toLocaleDateString('en-GB')
  }

  const getLeavePeriodLabel = (item) => {
    const from =
      item?.start_date ||
      item?.startDate ||
      item?.fromDate ||
      item?.from ||
      item?.leaveFrom ||
      item?.leave_from
    const to =
      item?.end_date ||
      item?.endDate ||
      item?.toDate ||
      item?.to ||
      item?.leaveTo ||
      item?.leave_to

    const fromText = formatDateDisplay(from)
    const toText = formatDateDisplay(to)
    if (fromText === '-' && toText === '-') return '-'
    if (fromText !== '-' && toText !== '-') return `${fromText} to ${toText}`
    return fromText !== '-' ? fromText : toText
  }


  return (
    <div style={{ width: '95%', margin: 'auto', padding: '20px' }}>
      <CCard>
        <CCardHeader>
          <CCardTitle>Admin Leave Balance Dashboard</CCardTitle>
        </CCardHeader>
        <CCardBody>
          <CRow className="align-items-end">
            <CCol md={6}>
              <CFormLabel>Select Employee</CFormLabel>
              <Select
                options={managers}
                value={selectedUser}
                onChange={setSelectedUser}
                isClearable
                isSearchable
                placeholder="Search employee..."
              />
            </CCol>
            <CCol md={3}>
              {selectedUser && (
                <CButton color="primary" className="mt-3" onClick={() => setShowAdjustModal(true)}>
                  <CIcon icon={cilPlus} className="me-2" />
                  Adjust Leave
                </CButton>
              )}
            </CCol>
          </CRow>

          <hr />

          {/* Leave Balance Section */}
          {loadingBalance ? (
            <div className="text-center my-4">
              <CSpinner color="primary" />
            </div>
          ) : leaveBalance ? (
            <CRow className="g-3 mt-3">
              <CCol md={4}>
                <CCard>
                  <CCardHeader>Casual Leave (CL)</CCardHeader>
                  <CCardBody>
                    <p>
                      <strong>Available:</strong> {leaveBalance.clBalance}
                    </p>
                    <p>
                      <strong>Used:</strong> {leaveBalance.clUsed}
                    </p>
                  </CCardBody>
                </CCard>
              </CCol>

              <CCol md={4}>
                <CCard>
                  <CCardHeader>Unpaid Leave (UL)</CCardHeader>
                  <CCardBody>
                    <p>
                      <strong>Available:</strong> {leaveBalance.ulBalance}
                    </p>
                    <p>
                      <strong>Used:</strong> {leaveBalance.ulUsed}
                    </p>
                  </CCardBody>
                </CCard>
              </CCol>

              <CCol md={4}>
                <CCard>
                  <CCardHeader>Penalty Bucket</CCardHeader>
                  <CCardBody>
                    <p>
                      <strong>Penalty Days:</strong> {leaveBalance.penaltyBucket}
                    </p>
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
          ) : (
            <CAlert color="info" className="mt-3">
              Select a user to view their leave balance.
            </CAlert>
          )}

          {/* Ledger */}
          {selectedUser && (
            <>
              <h5 className="mt-4">Leave Ledger</h5>
              {loadingLedger ? (
                <CSpinner color="primary" />
              ) : ledger.length === 0 ? (
                <CAlert color="info">No transactions found.</CAlert>
              ) : (
                <CTable striped hover responsive className="mt-2">
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Type</CTableHeaderCell>
                      <CTableHeaderCell>Days</CTableHeaderCell>
                      <CTableHeaderCell>Transaction</CTableHeaderCell>
                      <CTableHeaderCell>Remarks</CTableHeaderCell>
                      <CTableHeaderCell>Leave Applied Date</CTableHeaderCell>
                      <CTableHeaderCell>Leave Date (From - To)</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {ledger.map((item) => (
                      <CTableRow key={item._id}>
                        <CTableDataCell>{item.leaveType}</CTableDataCell>
                        <CTableDataCell>{item.days}</CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={item.transactionType === 'credit' ? 'success' : 'danger'}>
                            {item.transactionType}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>{item.remarks || '-'}</CTableDataCell>
                        <CTableDataCell>
                          {formatDateDisplay(item.createdAt)}
                        </CTableDataCell>
                        <CTableDataCell>{getLeavePeriodLabel(item)}</CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              )}
            </>
          )}
        </CCardBody>
      </CCard>

      {/* Adjust Leave Modal */}
      <CModal visible={showAdjustModal} onClose={() => setShowAdjustModal(false)} size="lg">
        <CModalHeader>
          <CModalTitle>Adjust Leave Balance</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CRow>
            <CCol md={4}>
              <CFormLabel>Leave Type</CFormLabel>
              <AppFormSelect
                value={adjustForm.leaveType}
                onChange={(e) => setAdjustForm({ ...adjustForm, leaveType: e.target.value })}
              >
                <option value="CL">Casual Leave</option>
                <option value="UL">Unpaid Leave</option>
              </AppFormSelect>
            </CCol>

            <CCol md={4}>
              <CFormLabel>Transaction</CFormLabel>
              <AppFormSelect
                value={adjustForm.transactionType}
                onChange={(e) => setAdjustForm({ ...adjustForm, transactionType: e.target.value })}
              >
                <option value="credit">Credit (+)</option>
                <option value="debit">Debit (-)</option>
              </AppFormSelect>
            </CCol>

            {/* <CCol md={4}>
              <CFormLabel>Days</CFormLabel>
              <AppFormSelect
                value={adjustForm.days}
                onChange={(e) => setAdjustForm({ ...adjustForm, days: e.target.value })}
              >
                <option value="4">4</option>
                <option value="8">8</option>
                <option value="12">12</option>
                <option value="16">16</option>
                <option value="20">20</option>
                <option value="24">24</option>
                <option value="28">28</option>
                <option value="32">32</option>
                <option value="36">36</option>
                <option value="40">40</option>
                <option value="44">44</option>
                <option value="48">48</option>
                <option value="52">52</option>
                <option value="56">56</option>
                <option value="60">60</option>
              </AppFormSelect>
            </CCol> */}

            <CCol md={4}>
  <CFormLabel>Days</CFormLabel>
  <AppFormSelect
    value={adjustForm.days}
    onChange={(e) => setAdjustForm({ ...adjustForm, days: e.target.value })}
  >
    {getDaysOptions().map((day) => (
      <option key={day} value={day}>
        {day}
      </option>
    ))}
  </AppFormSelect>
</CCol>

          </CRow>

          <CRow className="mt-3">
            <CCol>
              <CFormLabel>Remarks</CFormLabel>
              <CFormInput
                placeholder="Reason for adjustment"
                value={adjustForm.remarks}
                onChange={(e) => setAdjustForm({ ...adjustForm, remarks: e.target.value })}
              />
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowAdjustModal(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleAdjustSubmit}>
            Submit
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default LeaveBalanceDashboard
