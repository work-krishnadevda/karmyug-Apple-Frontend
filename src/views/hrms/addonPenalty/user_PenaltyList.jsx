import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CFormInput,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
  CButton,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CModalTitle,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch, cilZoom } from '@coreui/icons'
import BasicProvider from 'src/constants/BasicProvider'
import { toast } from 'react-toastify'
import Cookies from 'js-cookie'

/* 🔹 Current Month Helper */
const getCurrentMonth = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

const UserPenaltyList = () => { 
  const [list, setList] = useState([])
  const [search, setSearch] = useState('')
  const [month, setMonth] = useState(getCurrentMonth())
  const [loading, setLoading] = useState(false)

  const [viewModal, setViewModal] = useState(false)
  const [selected, setSelected] = useState(null)

  const userId = Cookies.get('primery_user_id')

  /* 🔹 Fetch Data */
  const fetchData = async () => {
    if (!userId) return

    setLoading(true)
    try {
      const response = await new BasicProvider(
        `profiles/${userId}/penalty-addon`,
      ).getRequest()

      // 🔹 Sirf penalty data lo
      const penaltyList =
        (response.data || []).filter((p) => p.type === 'penalty')

      setList(penaltyList)
    } catch (err) {
      toast.error('Failed to fetch penalty data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  /* 🔹 Frontend Filter */
  const filteredList = list.filter((item) => {
    const searchText = search.toLowerCase()

    const matchesSearch =
      item.reason?.toLowerCase().includes(searchText) ||
      String(item.amount).includes(searchText) ||
      item.date?.includes(searchText)

    const matchesMonth = month ? item.date?.startsWith(month) : true

    return matchesSearch && matchesMonth
  })

  return (
    <CCard className="p-3">
      <CCardHeader>
        <h5 className="fw-bold">My Penalty Records</h5>
      </CCardHeader>

      {/* 🔍 Search + Month */}
      <div className="d-flex gap-2 mt-3">
        <div className="position-relative" style={{ width: '500px' }}>
          <CFormInput
            placeholder="Search penalty (reason / amount / date)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <CIcon
            icon={cilSearch}
            className="position-absolute top-50 end-0 translate-middle-y me-2"
          />
        </div>

        <div style={{ width: '220px' }}>
          <CFormInput
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>
      </div>

      {/* 📋 Table */}
      <CCardBody>
        <CTable hover responsive className="mt-3">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Reason</CTableHeaderCell>
              <CTableHeaderCell>Effect Type</CTableHeaderCell>
              <CTableHeaderCell>Amount</CTableHeaderCell>
              <CTableHeaderCell>Date</CTableHeaderCell>
              <CTableHeaderCell>Added By</CTableHeaderCell>
              <CTableHeaderCell>View</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody>
            {loading && (
              <CTableRow>
                <CTableDataCell colSpan={6} className="text-center py-4">
                  <div className="d-flex justify-content-center align-items-center gap-2">
                    <div className="spinner-border text-primary" />
                    <span>Loading penalty records...</span>
                  </div>
                </CTableDataCell>
              </CTableRow>
            )}

            {!loading && filteredList.length === 0 && (
              <CTableRow>
                <CTableDataCell colSpan={6} className="text-center">
                  No penalty records found
                </CTableDataCell>
              </CTableRow>
            )}

            {!loading &&
              filteredList.map((item) => (
                <CTableRow key={item._id}>
                  <CTableDataCell>{item.reason}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color="danger" shape="rounded-pill" className="px-3 py-1">
                      PENALTY
                    </CBadge>
                  </CTableDataCell>

                  <CTableDataCell>₹{item.amount}</CTableDataCell>
                  <CTableDataCell>
                    {new Date(item.date).toDateString()}
                  </CTableDataCell>

                  <CTableDataCell>
                    {item.added_by ? (
                      <div>
                        <div className="fw-semibold">{item.added_by.name || '-'}</div>
                        <small className="text-muted">{item.added_by.role || '-'}</small>
                      </div>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </CTableDataCell>

                  <CTableDataCell>
                    <CButton
                      size="sm"
                      color="info"
                      onClick={() => {
                        setSelected(item)
                        setViewModal(true)
                      }}
                    >
                      <CIcon icon={cilZoom} />
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
          </CTableBody>
        </CTable>
      </CCardBody>

      {/* 👁 View Modal */}
      <CModal visible={viewModal} onClose={() => setViewModal(false)}>
        <CModalHeader>
          <CModalTitle>Penalty Details</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selected && (
            <>
              <p><strong>Reason:</strong> {selected.reason}</p>
              <p><strong>Amount:</strong> ₹{selected.amount}</p>
              <p><strong>Date:</strong> {new Date(selected.date).toDateString()}</p>
              {selected.added_by && (
                <p>
                  <strong>Added By:</strong> {selected.added_by.name || '-'} 
                  {selected.added_by.role && (
                    <span className="text-muted"> ({selected.added_by.role})</span>
                  )}
                </p>
              )}
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setViewModal(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </CCard>
  
  )

}

export default UserPenaltyList
