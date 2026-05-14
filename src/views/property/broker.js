import React, { useEffect, useState, useCallback } from 'react'
import DataTable from 'src/components/custom/table/AppDataTable'
import AppTableSkeleton from 'src/components/custom/table/AppTableSkeleton'
import moment from 'moment'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

import {
  CContainer,
  CSpinner,
  CButton,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CModalFooter,
  CAlert,
  CCardHeader,
  CCardBody,
  CCard,
} from '@coreui/react'
import BasicProvider from 'src/constants/BasicProvider'
import { toast } from 'react-toastify'
import { cilPencil, cilTrash, cilCopy, cilCheck } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import PropertyFilter1 from 'src/components/custom/PropertyFilter1'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import VerifyConfirmModal from 'src/components/custom/VerifyConfirmModal'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { useSelector } from 'react-redux'
import BrokerForm from 'src/components/forms/BrokerForm'
import ForcePinAttachmentImage from 'src/components/property/ForcePinAttachmentImage'

let FE = process.env.REACT_APP_FE
let BROKER = process.env.REACT_APP_BROKER
let DM = process.env.REACT_APP_DM

const Broker = () => {
  const loggedinUserRole = useSelector((state) => state?.userRole)

  const navigate = useNavigate()
  const location = useLocation()
  const query = new URLSearchParams(location.search)
  const [searchParams] = useSearchParams()
  const [isFilter, setIsFilter] = useState(false)
  const [data, setData] = useState([])
  const [totalRows, setTotalRows] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [userId, setuserId] = useState('')
  const [visible, setVisible] = useState(false)
  const [error, setError] = useState('') // <-- Add error state
  const [filterData, setFilterData] = useState({
    fromDate: query.get('date_from') || '',
    toDate: query.get('date_to') || '',
    isVerify: query.get('isVerify') || '',
    search: query.get('search') || '',
  })
  const [verifyModalVisible, setVerifyModalVisible] = useState(false)
  const [verifyRow, setVerifyRow] = useState(null)
  const [detailsModalVisible, setDetailsModalVisible] = useState(false)
  const [selectedRow, setSelectedRow] = useState(null)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editRow, setEditRow] = useState(null)

  const fetchAll = useCallback(
    async (page, perPage, filters = filterData) => {
      setLoading(true)
      setError('')
      console.log(filterData, 'data for filters')

      try {
        let queryStr = `limit=${perPage}&page=${page}`
        if (filters.fromDate) queryStr += `&startDate=${filters.fromDate}`
        if (filters.toDate) queryStr += `&endDate=${filters.toDate}`
        if (filters.isVerify) queryStr += `&isVerify=${filters.isVerify}`
        if (filters.search) queryStr += `&search=${encodeURIComponent(filters.search)}`

        const provider = new BasicProvider(`properties/filter?type=broker&${queryStr}`)
        const res = await provider.getRequest()
        setData(res.data.docs)
        setTotalRows(res.data.totalDocs)
      } catch (err) {
        setData([])
        setError(err?.message || 'Failed to fetch properties')
      }
      setLoading(false)
    },
    [filterData],
  )

  useEffect(() => {
    fetchAll(page, perPage, filterData)
  }, [page, perPage, filterData, fetchAll])

  const handleFilter = (filters) => {
    setPage(1)
    fetchAll(1, perPage, filters)

    // Update URL search params
    const params = new URLSearchParams(window.location.search)
    // Remove old filter params
    params.delete('date_from')
    params.delete('date_to')
    params.delete('isVerify')
    params.delete('search')

    // Set new filter params if present
    if (filters.fromDate) params.set('date_from', filters.fromDate)
    if (filters.toDate) params.set('date_to', filters.toDate)
    if (filters.isVerify) params.set('isVerify', filters.isVerify)
    if (filters.search) params.set('search', filters.search)

    // Keep any other params (like 'data')
    const queryData = searchParams.get('data')
    if (queryData) {
      params.set('data', queryData)
    }

    navigate({ search: params.toString() })
  }

  const handleReset = () => {
    setFilterData({ fromDate: '', toDate: '', isVerify: '', search: '' })
    setPage(1)
    fetchAll(1, perPage, { fromDate: '', toDate: '', isVerify: '', search: '' })
    const params = new URLSearchParams(window.location.search)
    const queryData = searchParams.get('data')
    // Reapply the 'data' parameter
    if (queryData) {
      params.set('data', queryData)
    }
    // Update the URL with the modified parameters
    navigate({ search: params.toString() })
  }

  const fetchBrokers = useCallback(async (page, perPage) => {
    setLoading(true)
    setError('')

    try {
      const provider = new BasicProvider(
        `properties/filter?type=broker&limit=${perPage}&page=${page}`,
      )
      const res = await provider.getRequest()
      setData(res.data.docs)
      setTotalRows(res.data.totalDocs)
    } catch (err) {
      setData([])
      setError(err?.message || 'Failed to fetch brokers')
    }
    setLoading(false)
  }, [])

  // useEffect(() => {
  //   fetchBrokers(page, perPage)
  // }, [page, perPage, fetchBrokers])

  useEffect(() => {
    // Listen for the custom event
    const handleForcePinCreated = () => {
      fetchAll(page, perPage, filterData)
    }
    window.addEventListener('forcePinCreated', handleForcePinCreated)
    return () => {
      window.removeEventListener('forcePinCreated', handleForcePinCreated)
    }
  }, [])

  // Handler for delete action
  const handleDelete = async (row) => {
    setError('')

    try {
      const provider = new BasicProvider(`properties/delete/${userId}`)
      await provider.deleteRequest({})
      setVisible(false)
      fetchBrokers(page, perPage)
    } catch (err) {
      setError(err?.message || 'Failed to delete broker')
    }
  }

  // Handler for edit action (navigate to edit page)
  const handleEdit = (row) => {
    setEditRow(row)
    setEditModalVisible(true)
  }
  const handleConfirmVerify = async () => {
    if (!verifyRow) return
    setError('')
    try {
      const provider = new BasicProvider(`properties/${verifyRow._id}/verify`)
      await provider.putRequest({ isVerify: true })
      fetchAll(page, perPage)
      setVerifyModalVisible(false)
      setVerifyRow(null)
    } catch (err) {
      setError(err?.message || 'Failed to verify property')
      setVerifyModalVisible(false)
      setVerifyRow(null)
    }
  }

  const handleRowClick = (row) => {
    setSelectedRow(row)
    setDetailsModalVisible(true)
  }

  const columns = [
    { name: 'Name', selector: (row) => capitalizeFirst(row.name || '-'), sortable: true },
    { name: 'Contact 1', selector: (row) => row.contactNumber1 || '-', sortable: true },
    { name: 'Contact 2', selector: (row) => row.contactNumber2 || '-', sortable: true },
    { name: 'Address', selector: (row) => capitalizeFirst(row.address || '-'), sortable: true },
    { name: 'City', selector: (row) => capitalizeFirst(row.city || '-'), sortable: true },
    {
      name: 'Area Of Work',
      selector: (row) => capitalizeFirst(row.areaOfWork || '-'),
      sortable: true,
    },
    { name: 'District', selector: (row) => capitalizeFirst(row.district || '-'), sortable: true },
    { name: 'Years Of Working', selector: (row) => row.yearsOfWorking || '-', sortable: true },
    { name: 'Latitude', selector: (row) => row.latitude || '-', sortable: true },
    { name: 'Longitude', selector: (row) => row.longitude || '-', sortable: true },

    { name: 'Remark', selector: (row) => capitalizeFirst(row.remark || '-'), sortable: false },
    {
      name: 'Created',
      selector: (row) => moment(row.created_at).format('DD MMM YYYY HH:mm'),
      sortable: true,
    },
    ...(loggedinUserRole.name !== BROKER
      ? [
          {
            name: 'Created By',
            selector: (row) => capitalizeFirst(row.createdBy?.name || '-'),
            sortable: false,
          },
          {
            name: 'Updated By',
            selector: (row) => capitalizeFirst(row.updatedBy?.name || '-'),
            sortable: false,
          },
          {
            name: 'Verified By',
            selector: (row) => capitalizeFirst(row.verifyBy?.name || '-'),
            sortable: false,
            width: '150px',
          },
          {
            name: 'Verified Date',
            selector: (row) =>
              row.verifyDate ? moment(row.verifyDate).format('DD MMM YYYY HH:mm') : '-',
            sortable: true,
            width: '170px',
          },
          {
            name: 'Verified',
            cell: (row) =>
              row.isVerify ? (
                'Yes'
              ) : loggedinUserRole.name === DM ||
                loggedinUserRole.name === FE ||
                loggedinUserRole.name === BROKER ? (
                'Not Verified'
              ) : (
                <CButton
                  color="success"
                  size="sm"
                  onClick={() => {
                    setVerifyRow(row)
                    setVerifyModalVisible(true)
                  }}
                >
                  Verify
                </CButton>
              ),
            sortable: true,
            width: '110px',
          },
        ]
      : []),
    {
      name: 'Actions',
      cell: (row) => (
        <div className="action-btn">
          <div className="edit-btn me-2">
            <CIcon className="pointer_cursor" icon={cilPencil} onClick={() => handleEdit(row)} />
          </div>
          <div className="delet-btn">
            <CIcon
              className="pointer_cursor"
              icon={cilTrash}
              onClick={() => {
                setVisible(true)
                setuserId(row._id)
              }}
            />
          </div>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      // width: '150px',
    },
  ]

  const handleDownloadExcel = () => {
    if (!data || data.length === 0) return alert('No data available to download.')

    // 1. Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((row) => ({
        Name: row.name || '-',
        'Contact 1': row.contactNumber1 || '-',
        'Contact 2': row.contactNumber2 || '-',
        Address: row.address || '-',
        City: row.city || '-',
        'Area Of Work': row.areaOfWork || '-',
        District: row.district || '-',
        'Years Of Working': row.yearsOfWorking || '-',
        Remark: row.remark || '-',
        latitude: row.latitude || '-',
        Longitude: row.longitude || '-',
        Created: moment(row.created_at).format('DD MMM YYYY HH:mm'),
        ...(loggedinUserRole.name !== BROKER && {
          'Created By': row.createdBy?.name || '-',
          'Updated By': row.updatedBy?.name || '-',
          Verified: row.isVerify
            ? 'Yes'
            : loggedinUserRole.name === DM ||
              loggedinUserRole.name === FE ||
              loggedinUserRole.name === BROKER
            ? 'Not Verified'
            : 'Pending',
          'Verified By': row.verifyBy?.name || '-',
          'Verified Date': row.verifyDate
            ? moment(row.verifyDate).format('DD MMM YYYY HH:mm')
            : '-',
        }),
      })),
    )

    // 2. Create workbook and append sheet
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Broker Properties')

    // 3. Generate buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })

    // 4. Save file
    const fileData = new Blob([excelBuffer], { type: 'application/octet-stream' })
    saveAs(fileData, `Broker_Properties_${moment().format('YYYYMMDD_HHmm')}.xlsx`)
  }

  const capitalizeFirst = (value) => {
    if (!value || typeof value !== 'string') return '-'
    return value.charAt(0).toUpperCase() + value.slice(1)
  }
  console.log(data, 'data---------------')

  const customStyles = {
    rows: {
      style: {
        cursor: 'pointer',
      },
    },
  }
  return (
    <CContainer fluid className="mt-3">
      {error && (
        <CAlert color="danger" className="mt-3">
          {error}
        </CAlert>
      )}
      {isFilter && (
        <PropertyFilter1
          pinType="broker"
          filterData={filterData}
          setFilterData={setFilterData}
          onFilter={handleFilter}
          onReset={handleReset}
          searchHelperText="You can search by name, contact, city, years of working, address, area of work, district"
        />
      )}
      <CCard className="mb-2">
        <CCardHeader>
          <div className="d-flex justify-content-between align-items-center">
            <span>Broker</span>
            <span style={{ display: 'flex', gap: '10px' }}>
              <CButton color="warning" onClick={() => setIsFilter(!isFilter)} className="concorn">
                {!isFilter ? 'Open Filter' : 'Close Filter'}
              </CButton>
              <CButton className="add_new" onClick={handleDownloadExcel}>
                Download Excel
              </CButton>
            </span>
          </div>
        </CCardHeader>

        <CCardBody>
          {loading ? (
            <AppTableSkeleton />
          ) : (
            <DataTable
              // title="Brokers"
              columns={columns}
              data={data}
              pagination
              paginationServer
              paginationTotalRows={totalRows}
              paginationDefaultPage={page}
              paginationPerPage={perPage}
              onChangePage={setPage}
              onChangeRowsPerPage={setPerPage}
              highlightOnHover
              selectableRows
              onRowClicked={handleRowClick}
              customStyles={customStyles}
            />
          )}
        </CCardBody>
      </CCard>
      <CModal
        alignment="center"
        visible={visible}
        onClose={() => setVisible(false)}
        className="delete_item_box"
      >
        <CModalBody className="text-center mt-4">
          <div className="logo_x m-auto mb-3">x</div>
          <span>Are you sure you want to delete this broker ?</span>
        </CModalBody>
        <CModalFooter className="model_footer justify-content-center mb-3 pt-0">
          <CButton className="delete_btn model_btn" color="danger" onClick={handleDelete}>
            Yes
          </CButton>
          <CButton
            className="close_btn model_btn"
            color="secondary"
            onClick={() => setVisible(false)}
          >
            No, cancel
          </CButton>
        </CModalFooter>
      </CModal>

      <VerifyConfirmModal
        visible={verifyModalVisible}
        onClose={() => setVerifyModalVisible(false)}
        onConfirm={handleConfirmVerify}
        title="Are you sure you want to verify this broker?"
      />

      <CModal
        alignment="center"
        visible={detailsModalVisible}
        onClose={() => setDetailsModalVisible(false)}
        className="details_modal"
        size="lg"
      >
        <CModalBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Broker Details</h5>
            {selectedRow && (
              <CopyToClipboard
                text={columns
                  .filter((col) => col.name !== 'Actions')
                  .map((col) => {
                    let value =
                      typeof col.selector === 'function'
                        ? col.selector(selectedRow)
                        : selectedRow[col.selector] || '-'
                    if (col.name === 'Verified')
                      value = selectedRow.isVerify ? 'Verified' : 'Pending'
                    return `${col.name}: ${value}`
                  })
                  .join('\n')}
              >
                <CButton color="light" size="sm" title="Copy All Details">
                  <CIcon icon={cilCopy} />
                </CButton>
              </CopyToClipboard>
            )}
          </div>
          {selectedRow && (
            <>
              <table className="table table-bordered">
                <tbody>
                  {columns
                    .filter((col) => col.name !== 'Actions')
                    .map((col, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 'bold', width: '40%' }}>{col.name}</td>
                        <td>
                          {col.name === 'Verified' ? (
                            selectedRow.isVerify ? (
                              <>
                                Verified
                                <CIcon
                                  icon={cilCheck}
                                  className="ms-1"
                                  style={{ color: 'green', fontSize: 18 }}
                                />
                              </>
                            ) : (
                              'Pending'
                            )
                          ) : typeof col.selector === 'function' ? (
                            col.selector(selectedRow)
                          ) : (
                            selectedRow[col.selector] || '-'
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              <div className="mt-3">
                <ForcePinAttachmentImage
                  attachmentKey={selectedRow.attachmentKey}
                  attachmentKeys={selectedRow.attachmentKeys}
                />
              </div>
            </>
          )}
        </CModalBody>
        <CModalFooter className="justify-content-center">
          <CButton color="secondary" onClick={() => setDetailsModalVisible(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal
        alignment="center"
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        className="edit_item_box"
        size="lg"
      >
        <CModalHeader>
          <CModalTitle>Edit Broker</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {editRow && (
            <BrokerForm
              onSubmit={async (formData) => {
                setError('')
                try {
                  const changedData = {}
                  Object.keys(formData).forEach((key) => {
                    if (formData[key] !== editRow[key]) {
                      changedData[key] = formData[key]
                    }
                  })
                  const provider = new BasicProvider(`properties/${editRow._id}`)
                  const result = await provider.putRequest(changedData)
                  if (result && result.status === 'success') {
                    toast.success('Broker PIN is successfully Updated')
                  }
                  setEditModalVisible(false)
                  setEditRow(null)
                  fetchBrokers(page, perPage)
                } catch (err) {
                  setError(err?.message || 'Failed to update broker')
                }
              }}
              initialData={{
                name: editRow.name || '',
                contactNumber1: editRow.contactNumber1 || '',
                contactNumber2: editRow.contactNumber2 || '',
                address: editRow.address || '',
                city: editRow.city || '',
                areaOfWork: editRow.areaOfWork || '',
                district: editRow.district || '',
                yearsOfWorking: editRow.yearsOfWorking || '',
                latitude: editRow.latitude || '',
                longitude: editRow.longitude || '',
                remark: editRow.remark || '',
                type: 'broker',
              }}
            />
          )}
        </CModalBody>
      </CModal>
    </CContainer>
  )
}

export default Broker

