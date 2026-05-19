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
  CButton,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CBadge ,
  CModalTitle,
} from '@coreui/react'
import AppTableSkeleton from 'src/components/custom/table/AppTableSkeleton'

import AppFormSelect from 'src/components/form/AppFormSelect'
import CIcon from '@coreui/icons-react'
import { cilSearch, cilZoom, cilPencil, cilTrash, cilCloudDownload } from '@coreui/icons'
import BasicProvider from 'src/constants/BasicProvider'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import { checkRole } from 'src/constants/common'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import moment from 'moment'
const getCurrentMonth = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}` // YYYY-MM
}

const AddOnList = () => {
  const [list, setList] = useState([])
  const [search, setSearch] = useState('')
  const [month, setMonth] = useState(getCurrentMonth())
  const [loading, setLoading] = useState(false)

  // Modals
  const [viewModal, setViewModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)

  const [selected, setSelected] = useState(null)
  const [exporting, setExporting] = useState(false)

  // Admin check
  const admin = useSelector((state) => state.userData)
  const isAdmin = checkRole(process.env.REACT_APP_ADMIN, admin)
  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await new BasicProvider('profiles/penalty-addon/all').getRequest()

      const usersWithAddon = (res.data || []).filter(
        (user) =>
          Array.isArray(user.penalty_or_addon) &&
          user.penalty_or_addon.some((p) => p.type === 'addon'),
      )

      let flatAddOnList = usersWithAddon.flatMap((user) =>
        user.penalty_or_addon
          .filter((p) => p.type === 'addon')
          .map((p) => ({
            _id: p._id,
            userId: user.userId || user._id,
            employee: { name: user.name },
            reason: p.reason,
            amount: p.amount,
            date: p.date,
            createdAt: p.createdAt || p.created_at,
            addonType: p.type,
            added_by: p.added_by || null, // Include added_by field
          })),
      )

      if (month) {
        flatAddOnList = flatAddOnList.filter((item) => item.date?.startsWith(month))
      }

      setList(flatAddOnList)
    } catch (err) {
      toast.error('Failed to fetch add-on data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [month])

  const filteredList = list.filter((item) =>
    item.employee?.name?.toLowerCase().includes(search.toLowerCase()),
  )
  const updateAddOn = async () => {
    if (!selected) return

    try {
      const payload = {
        amount: selected.amount,
        reason: selected.reason,
        date: selected.date,
        type: 'addon',
        added_by: {
          id: admin._id || admin.id,
          name: admin.name,
          role: admin.role,
        },
      }

      await new BasicProvider(
        `profiles/${selected.userId}/penalty-addon/${selected._id}`,
      ).patchRequest(payload)

      toast.success('Add-on updated successfully')
      setEditModal(false)
      fetchData()
    } catch (err) {
      toast.error('Failed to update add-on')
    }
  }

  const deleteAddOn = async () => {
    if (!selected) return

    try {
      await new BasicProvider(
        `profiles/${selected.userId}/penalty-addon/${selected._id}`,
      ).deleteRealRequest()

      toast.success('Add-on deleted successfully')
      setDeleteModal(false)
      setSelected(null)
      fetchData()
    } catch (err) {
      toast.error('Failed to delete add-on')
    }
  }

  const downloadExcel = async () => {
    if (filteredList.length === 0) {
      toast.error('No data to export')
      return
    }

    setExporting(true)
    try {
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Add-On Records')

      // Headers
      worksheet.columns = [
        { header: 'Employee Name', key: 'employee', width: 25 },
        { header: 'Reason', key: 'reason', width: 40 },
        { header: 'Amount Added', key: 'amount', width: 15 },
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Added By', key: 'addedBy', width: 25 },
        { header: 'Role', key: 'role', width: 20 },
        { header: 'Created At', key: 'createdAt', width: 20 },
      ]

      // Style header row
      worksheet.getRow(1).font = { bold: true }
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      }

      // Add data
      filteredList.forEach((item) => {
        worksheet.addRow({
          employee: item.employee?.name || '-',
          reason: item.reason || '-',
          amount: item.amount || 0,
          date: item.date ? moment(item.date).format('MMM YYYY') : '-',
          addedBy: item.added_by?.name || '-',
          role: item.added_by?.role || '-',
          createdAt: item.createdAt ? moment(item.createdAt).format('DD-MM-YYYY HH:mm:ss') : '-',
        })
      })

      // Format amount column
      worksheet.getColumn('amount').numFmt = '₹#,##0.00'

      // Generate buffer and download
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })

      const fileName = `Add-On_Records_${month || 'All'}_${moment().format('YYYY-MM-DD')}.xlsx`
      saveAs(blob, fileName)
      toast.success('Excel file downloaded successfully')
    } catch (err) {
      toast.error('Failed to export Excel file')
      console.error(err)
    } finally {
      setExporting(false)
    }
  }

  return (
    <CCard className="p-3">
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-bold">Add-On Records</h5>
        <CButton
          color="success"
          onClick={downloadExcel}
          disabled={exporting || filteredList.length === 0}
        >
          <CIcon icon={cilCloudDownload} className="me-2" />
          {exporting ? 'Exporting...' : 'Download Excel'}
        </CButton>
      </CCardHeader>

      {/* Filters */}
      <div className="d-flex gap-2 mt-3">
        {/* Search */}
        <div className="position-relative" style={{ width: '500px' }}>
          <CFormInput
            placeholder="Search employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <CIcon
            icon={cilSearch}
            className="position-absolute top-50 end-0 translate-middle-y me-2"
          />
        </div>

        {/* Month Filter */}
        <div className="position-relative" style={{ width: '220px' }}>
          <CFormInput
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            placeholder="Select Month"
          />
        </div>
      </div>

      {/* TABLE */}
      <CCardBody>
        <CTable hover responsive className="mt-3">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Employee</CTableHeaderCell>
              <CTableHeaderCell>Reason</CTableHeaderCell>
              <CTableHeaderCell>Effect Type</CTableHeaderCell>
              <CTableHeaderCell>Amount Added</CTableHeaderCell>
              <CTableHeaderCell>Added By</CTableHeaderCell>
              <CTableHeaderCell>Action</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody>
            {loading ? null : filteredList.length === 0 ? (
              <CTableRow>
                <CTableDataCell colSpan={6} className="text-center">
                  No add-on records found
                </CTableDataCell>
              </CTableRow>
            ) : (
              filteredList.map((item) => (
                <CTableRow key={item._id}>
                  <CTableDataCell>{item.employee?.name}</CTableDataCell>
                  <CTableDataCell>{item.reason}</CTableDataCell>
                  <CTableDataCell>
                    {item.addonType === 'addon' && (
                      <CBadge
                        color="success"
                        shape="rounded-pill"
                        className="px-3 py-1 fw-semibold"
                      >
                        ADDON
                      </CBadge>
                    )}
                  </CTableDataCell>

                  <CTableDataCell>₹{item.amount}</CTableDataCell>

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

                  <CTableDataCell className="d-flex gap-2">
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

                    <CButton
                      size="sm"
                      color="warning"
                      onClick={() => {
                        setSelected(item)
                        setEditModal(true)
                      }}
                    >
                      <CIcon icon={cilPencil} />
                    </CButton>

                    {isAdmin && (
                      <CButton
                        size="sm"
                        color="danger"
                        onClick={() => {
                          setSelected(item)
                          setDeleteModal(true)
                        }}
                      >
                        <CIcon icon={cilTrash} />
                      </CButton>
                    )}
                  </CTableDataCell>
                </CTableRow>
              ))
            )}
          </CTableBody>
        </CTable>
        {loading && <AppTableSkeleton ariaLabel="Loading add-on records" rows={6} />}
      </CCardBody>

      {/* VIEW MODAL */}
      <CModal visible={viewModal} onClose={() => setViewModal(false)}>
        <CModalHeader>
          <CModalTitle>View Add-On</CModalTitle>
        </CModalHeader>

        <CModalBody>
          {selected && (
            <>
              <p>
                <strong>Employee:</strong> {selected.employee?.name}
              </p>
              <p>
                <strong>Reason:</strong> {selected.reason}
              </p>
              <p>
                <strong>Amount Added:</strong> ₹{selected.amount}
              </p>
              <p>
                <strong>Date:</strong>{' '}
                {new Date(selected.date).toLocaleString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              {selected.createdAt && (
                <p>
                  <strong>Added On:</strong>{' '}
                  {moment(selected.createdAt).format('DD-MM-YYYY HH:mm:ss')}
                </p>
              )}
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

      {/* EDIT MODAL */}
      <CModal visible={editModal} onClose={() => setEditModal(false)}>
        <CModalHeader>
          <CModalTitle>Edit Add-On</CModalTitle>
        </CModalHeader>

        <CModalBody>
          {selected && (
            <>
              <label>Reason</label>
              <CFormInput
                value={selected.reason}
                onChange={(e) => setSelected({ ...selected, reason: e.target.value })}
              />

              <label className="mt-3">Amount Added</label>
              <CFormInput
                type="number"
                value={selected.amount}
                onChange={(e) => setSelected({ ...selected, amount: Number(e.target.value) })}
              />

              <label className="mt-3">Date</label>
              <CFormInput
                type="month"
                value={selected.date?.slice(0, 10)}
                onChange={(e) => setSelected({ ...selected, date: e.target.value })}
              />
            </>
          )}
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" onClick={() => setEditModal(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={updateAddOn}>
            Save
          </CButton>
        </CModalFooter>
      </CModal>

      {/* DELETE MODAL */}
      <CModal visible={deleteModal} onClose={() => setDeleteModal(false)}>
        <CModalHeader>
          <CModalTitle>Delete Add-On</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>Are you sure you want to delete this add-on record?</p>
          {selected && (
            <>
              <p>
                <strong>Employee:</strong> {selected.employee?.name}
              </p>
              <p>
                <strong>Amount:</strong> ₹{selected.amount}
              </p>
              <p>
                <strong>Reason:</strong> {selected.reason}
              </p>
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteModal(false)}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={deleteAddOn}>
            Delete
          </CButton>
        </CModalFooter>
      </CModal>
    </CCard>
  )
}

export default AddOnList
