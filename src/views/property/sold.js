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
  CModalFooter,
  CModalTitle,
  CAlert,
  CCardHeader,
  CCardBody,
  CCard,
  CForm,
  CFormLabel,
  CFormInput,
  CFormTextarea,
  CRow,
  CCol,
  CInputGroup,
  CModalHeader,
} from '@coreui/react'

import AppFormSelect from 'src/components/form/AppFormSelect'
import BasicProvider from 'src/constants/BasicProvider'
import { cilPencil, cilTrash, cilCopy } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import PropertyFilter1 from 'src/components/custom/PropertyFilter1'
import VerifyConfirmModal from 'src/components/custom/VerifyConfirmModal'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { useSelector } from 'react-redux'
import SoldForm from 'src/components/forms/SoldForm'
import ForcePinAttachmentImage from 'src/components/property/ForcePinAttachmentImage'
// import { CModal, CModalHeader, CModalBody, CModalFooter } from '@coreui/react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

let FE = process.env.REACT_APP_FE
let BROKER = process.env.REACT_APP_BROKER
let DM = process.env.REACT_APP_DM

const Sold = () => {
  const location = useLocation()
  const query = new URLSearchParams(location.search)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const loggedinUserRole = useSelector((state) => state?.userRole)

  const [data, setData] = useState([])
  const [totalRows, setTotalRows] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [userId, setuserId] = useState('')
  const [visible, setVisible] = useState(false)
  const [error, setError] = useState('') // <-- Add error state
  const [isFilter, setIsFilter] = useState(false)
  const [filterData, setFilterData] = useState({
    fromDate: query.get('date_from') || '',
    toDate: query.get('date_to') || '',
    propertyType: query.get('propertyType') || '',
    isVerify: query.get('isVerify') || '',
    search: query.get('search') || '',
  })
  const [openSaleModalVisible, setOpenSaleModalVisible] = useState(false)
  const [markSaleRow, setMarkSaleRow] = useState(null)
  const [markSaleLoading, setMarkSaleLoading] = useState(false)
  const [isCustom, setIsCustom] = useState(false)
  const [openForSaleForm, setOpenForSaleForm] = useState({
    sellerName: '',
    contactNumber1: '',
    contactNumber2: '',
    propertyType: '',
    ageOfProperty: '',
    structure: '',
    otherStructure: '',
    propertyNo: '',
    colony: '',
    landmark: '',
    city: '',
    district: '',
    superBuiltupArea: '',
    carpetArea: '',
    ratePerSqft: '',
    totalRate: '',
    isOnRentalIncome: 'no',
    rentalIncomeAmount: '',
    remark: '',
    type: 'for sale',
    latitude: '',
    longitude: '',
    brokerName: '',
    brokerContactNumber: '',
  })

  const handleDropdownChange = (e) => {
    const value = e.target.value
    if (value === 'Other') {
      setIsCustom(true)
      setOpenForSaleForm((prev) => ({
        ...prev,
        structure: '',
        otherStructure: '',
      }))
    } else {
      setIsCustom(false)
      setOpenForSaleForm((prev) => ({
        ...prev,
        structure: value,
        otherStructure: '',
      }))
    }
  }

  const handleOtherInputChange = (e) => {
    const value = e.target.value
    setOpenForSaleForm((prev) => ({
      ...prev,
      structure: value, // structure set ho raha yahan
      otherStructure: value,
    }))
  }

  const fetchBrokers = useCallback(async (page, perPage) => {
    setLoading(true)
    setError('')

    try {
      const provider = new BasicProvider(
        `properties/filter?type=sold&limit=${perPage}&page=${page}`,
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

  const fetchAll = useCallback(
    async (page, perPage, filters = filterData) => {
      setLoading(true)
      setError('')
      try {
        let queryStr = `limit=${perPage}&page=${page}`
        if (filters.fromDate) queryStr += `&startDate=${filters.fromDate}`
        if (filters.toDate) queryStr += `&endDate=${filters.toDate}`
        if (filters.propertyType) queryStr += `&propertyType=${filters.propertyType}`
        if (filters.isVerify) queryStr += `&isVerify=${filters.isVerify}`
        if (filters.search) queryStr += `&search=${encodeURIComponent(filters.search)}`

        const provider = new BasicProvider(`properties/filter?type=sold&${queryStr}`)
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
    params.delete('propertyType')
    params.delete('isVerify')
    params.delete('search')

    // Set new filter params if present
    if (filters.fromDate) params.set('date_from', filters.fromDate)
    if (filters.toDate) params.set('date_to', filters.toDate)
    if (filters.propertyType) params.set('propertyType', filters.propertyType)
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

  // Handler for verify action
  const handleVerify = async (row) => {
    setError('')

    try {
      const provider = new BasicProvider(`properties/${row._id}/verify`)
      await provider.putRequest({ isVerify: true })
      fetchBrokers(page, perPage)
    } catch (err) {
      setError(err?.message || 'Failed to verify broker')

      // handle error
    }
  }

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
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editRow, setEditRow] = useState(null)

  const handleEdit = (row) => {
    setEditRow(row)
    setEditModalVisible(true)
  }

  const columns = [
    {
      name: 'Seller Name',
      selector: (row) => capitalizeFirst(row.sellerName || '-'),
      sortable: true,
      width: '130px',
    },
    { name: 'Seller Contact', selector: (row) => row.sellerContact || '-', sortable: true },
    {
      name: 'Buyer Name',
      selector: (row) => capitalizeFirst(row.buyerName || '-'),
      sortable: true,
    },
    { name: 'Buyer Contact', selector: (row) => row.buyerContact || '-', sortable: true },

    {
      name: 'Deal Date',
      selector: (row) => (row.dealDate ? moment(row.dealDate).format('DD MMM YYYY') : '-'),
      sortable: true,
    },
    { name: 'Sold Amount', selector: (row) => row.soldAmount || '-', sortable: true },
    {
      name: 'Property Type',
      selector: (row) => capitalizeFirst(row.propertyType || '-'),
      sortable: true,
    },

    {
      name: 'Type Of Property',
      selector: (row) => capitalizeFirst(row.typeOfProperty || '-'),
      sortable: false,
      width: '130px',
    },

    { name: 'Age Of Property', selector: (row) => row.ageOfProperty || '-', sortable: true },
    {
      name: 'Structure',
      selector: (row) => capitalizeFirst(row.structure || '-'),
      sortable: false,
      width: '120px',
    },
    {
      name: 'Address',
      selector: (row) => capitalizeFirst(row.propertyNo || '-'),
      sortable: false,
      width: '120px',
    },
    {
      name: 'Colony',
      selector: (row) => capitalizeFirst(row.colony || '-'),
      sortable: false,
      width: '120px',
    },
    {
      name: 'Landmark',
      selector: (row) => capitalizeFirst(row.landmark || '-'),
      sortable: false,
      width: '120px',
    },
    { name: 'City', selector: (row) => capitalizeFirst(row.city || '-'), sortable: true },
    { name: 'District', selector: (row) => capitalizeFirst(row.district || '-'), sortable: true },
    {
      name: 'Super Builtup Area',
      selector: (row) => row.superBuiltupArea || '-',
      sortable: true,
      width: '130px',
    },
    {
      name: 'Carpet Area',
      selector: (row) => row.carpetArea || '-',
      sortable: true,
      width: '120px',
    },
    {
      name: 'Rental Income',
      selector: (row) => (row.isOnRentalIncome ? 'Yes' : 'No'),
      sortable: true,
      width: '120px',
    },
    {
      name: 'Rental Income Amount',
      selector: (row) =>
        row.isOnRentalIncome === true || row.isOnRentalIncome === 'yes'
          ? row.rentalIncomeAmount || '-'
          : '-',
      sortable: false,
      width: '130px',
    },

    // { name: 'Contact 1', selector: (row) => row.contactNumber1 || '-', sortable: true, width: '130px' },
    // { name: 'Contact 2', selector: (row) => row.contactNumber2 || '-', sortable: true, width: '130px' },
    // { name: 'Rate Per Sqft', selector: (row) => row.ratePerSqft || '-', sortable: true, width: '120px' },
    // { name: 'Total Rate', selector: (row) => row.totalRate || '-', sortable: true, width: '120px' },

    { name: 'Latitude', selector: (row) => row.latitude || '-', sortable: true, width: '120px' },
    { name: 'Longitude', selector: (row) => row.longitude || '-', sortable: true, width: '120px' },
    { name: 'Land Area', selector: (row) => row.landArea || '-', sortable: true, width: '120px' },
    { name: 'Remark', selector: (row) => capitalizeFirst(row.remark || '-'), sortable: false },
    {
      name: 'Broker Name',
      selector: (row) => capitalizeFirst(row.brokerName || '-'),
      sortable: true,
    },
    { name: 'Broker Contact', selector: (row) => row.brokerContactNumber || '-', sortable: true },
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
              ) : (
                <CButton color="success" size="sm" onClick={() => handleVerify(row)}>
                  Verify
                </CButton>
              ),
            sortable: true,
          },
        ]
      : []),
    // {
    //   name: 'Logs',
    //   selector: (row) => Array.isArray(row.logs) && row.logs.length > 0 ? row.logs.map(log => `${log.title} (${moment(log.date).format('DD MMM YYYY HH:mm')})`).join('; ') : '-',
    //   sortable: false,
    //   width: '300px',
    // },
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
          {loggedinUserRole.name !== BROKER && (
            <div className="mark-sold-btn" style={{ marginTop: 8 }}>
              <CButton color="warning" size="sm" onClick={() => handleOpenForSale(row)}>
                Open For Sale
              </CButton>
            </div>
          )}
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: '150px',
    },
  ]

  // State for verify confirmation modal
  const [verifyModalVisible, setVerifyModalVisible] = useState(false)
  const [verifyRow, setVerifyRow] = useState(null)

  // Handler for confirm verify
  const handleConfirmVerify = async () => {
    if (!verifyRow) return
    setError('')
    try {
      const provider = new BasicProvider(`properties/${verifyRow._id}/verify`)
      await provider.putRequest({ isVerify: true })
      fetchBrokers(page, perPage)
      setVerifyModalVisible(false)
      setVerifyRow(null)
    } catch (err) {
      setError(err?.message || 'Failed to verify broker')
      setVerifyModalVisible(false)
      setVerifyRow(null)
    }
  }

  // Update columns to open confirm modal for verify
  const updatedColumns = columns.map((col) =>
    col.name === 'Verified'
      ? {
          ...col,
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
        }
      : col,
  )

  const [detailsModalVisible, setDetailsModalVisible] = useState(false)
  const [selectedRow, setSelectedRow] = useState(null)

  const handleRowClick = (row) => {
    setSelectedRow(row)
    setDetailsModalVisible(true)
  }

  const handleOpenForSale = (row) => {
    setMarkSaleRow(row)

    setOpenForSaleForm((prev) => ({
      ...prev, // Preserve default values

      // Seller Details from selected row
      sellerName: row.buyerName || '',
      contactNumber1: row.buyerContact || '',
      contactNumber2: '',

      // Pre-fill or reset other fields
      propertyType: row.propertyType || '',
      ageOfProperty: row.ageOfProperty || '',
      structure: row.structure || '',
      otherStructure: row.otherStructure || '',
      propertyNo: row.propertyNo || '',
      colony: row.colony || '',
      landmark: row.landmark || '',
      city: row.city || '',
      district: row.district || '',
      superBuiltupArea: row.superBuiltupArea || '',
      carpetArea: row.carpetArea || '',
      ratePerSqft: row.ratePerSqft || '',
      totalRate: row.totalRate || '',
      isOnRentalIncome: row.isOnRentalIncome || 'no',
      rentalIncomeAmount: row.rentalIncomeAmount || '',
      remark: row.remark || '',
      latitude: row.latitude || '',
      longitude: row.longitude || '',
      landArea: row.landArea || '',
      // Set default for marking as 'for sale'
      type: 'for sale',

      // Clear these (user input required)
      buyerName: '',
      buyerContact: '',
      dealDate: moment().format('YYYY-MM-DD'),
      soldAmount: '',
      brokerName: '',
      brokerContactNumber: '',
    }))

    setOpenSaleModalVisible(true)
  }

  const handleOpenForSaleSubmit = (e) => {
    e.preventDefault()
    if (
      !/^\d{10}$/.test(openForSaleForm.contactNumber1) ||
      !/^\d{10}$/.test(openForSaleForm.contactNumber2)
    ) {
      alert('Contact no.1, Contact no.2 and Broker Contact numbers must be exactly 10 digits.')
      return
    } else {
      setShowConfirmModal(true)
    }
  }

  const confirmAndSubmit = async (e) => {
    if (!markSaleRow) return

    setMarkSaleLoading(true)
    setError('')

    try {
      const provider = new BasicProvider(`properties/${markSaleRow._id}/mark-for-sale`)

      await provider.putRequest({
        ...openForSaleForm, // All fields including seller, buyer, structure, etc.
      })

      console.log('Submitted to /mark-for-sale:', openForSaleForm)

      // Reset modal and row
      setOpenSaleModalVisible(false)
      setMarkSaleRow(null)

      // Refresh the list (if needed)
      fetchBrokers(page, perPage)
      toast.success('Mark as For Sale is successfully submitted')
    } catch (err) {
      setError(err?.message || 'Failed to mark property for sale')
      toast.error('Error during submission.')
    }

    setMarkSaleLoading(false)
    setOpenSaleModalVisible(false)
  }

  // const handleOpenForSaleSubmit = async (e) => {
  //   e.preventDefault()

  //   if (!markSaleRow) return

  //   setMarkSaleLoading(true)
  //   setError('')

  //   try {
  //     const provider = new BasicProvider(`properties/${markSaleRow._id}/mark-for-sale`)

  //     await provider.putRequest({
  //       ...openForSaleForm, // All fields including seller, buyer, structure, etc.
  //     })

  //     console.log('Submitted to /mark-for-sale:', openForSaleForm)

  //     // Reset modal and row
  //     setOpenSaleModalVisible(false)
  //     setMarkSaleRow(null)

  //     // Refresh the list (if needed)
  //     fetchBrokers(page, perPage)
  //   } catch (err) {
  //     setError(err?.message || 'Failed to mark property for sale')
  //   }

  //   setMarkSaleLoading(false)
  //   setOpenSaleModalVisible(false)
  // }

  const handleOpenForSaleChange = (e) => {
    const { name, value } = e.target
    setOpenForSaleForm((prev) => ({ ...prev, [name]: value }))
  }

  // Utility to export to Excel
  const downloadExcel = () => {
    if (!data || data.length === 0) return alert('No data to download!')

    const formattedData = data.map((row) => ({
      'Seller Name': row.sellerName || '-',
      'Seller Contact': row.sellerContact || '-',
      'Buyer Name': row.buyerName || '-',
      'Buyer Contact': row.buyerContact || '-',
      'Deal Date': row.dealDate ? moment(row.dealDate).format('DD MMM YYYY') : '-',
      Address: row.propertyNo || '-',
      'Sold Amount': row.soldAmount || '-',
      'Property Type': row.propertyType || '-',
      'Age Of Property': row.ageOfProperty || '-',
      City: row.city || '-',
      District: row.district || '-',
      Remark: row.remark || '-',
      'Rental Income': row.isOnRentalIncome ? 'Yes' : 'No',
      'Rental Income Amount': row.rentalIncomeAmount || '-',
      Structure: row.structure || '-',
      Landmark: row.landmark || '-',
      'Super Builtup Area': row.superBuiltupArea || '-',
      'Carpet Area': row.carpetArea || '-',
      'Total Rate': row.totalRate || '-',
      Colony: row.colony || '-',
      'Type Of Property': row.typeOfProperty || '-',
      'Broker Name': row.brokerName || '-',
      'Broker Contact': row.brokerContactNumber || '-',
      Latitude: row.latitude || '-',
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
        'Verified Date': row.verifyDate ? moment(row.verifyDate).format('DD MMM YYYY HH:mm') : '-',
      }),
    }))

    const worksheet = XLSX.utils.json_to_sheet(formattedData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sold Properties')

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' })
    saveAs(dataBlob, 'Sold_Properties.xlsx')
  }

  const capitalizeFirst = (value) => {
    if (!value || typeof value !== 'string') return '-'
    return value.charAt(0).toUpperCase() + value.slice(1)
  }

  console.log(data, 'sold data-----------------------')

  const customStyles = {
    rows: {
      style: {
        cursor: 'pointer',
      },
    },
  }

  return (
    <>
      <CContainer fluid className="mt-3">
        {error && (
          <CAlert color="danger" className="mt-3">
            {error}
          </CAlert>
        )}
        {isFilter && (
          <PropertyFilter1
            pinType="sold"
            filterData={filterData}
            setFilterData={setFilterData}
            onFilter={handleFilter}
            onReset={handleReset}
            searchHelperText="You can search by seller name, contact, city, age of property, buyer name, property type, Address, colony, district, landmark"
          />
        )}
        <CCard className="mb-2">
          <CCardHeader>
            <div className="d-flex justify-content-between align-items-center">
              <span>Sold</span>
              <span style={{ display: 'flex', gap: '10px' }}>
                <CButton color="warning" onClick={() => setIsFilter(!isFilter)} className="concorn">
                  {!isFilter ? 'Open Filter' : 'Close Filter'}
                </CButton>
                <CButton className="add_new" onClick={downloadExcel}>
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
                // title="Sold Property Pins"
                columns={updatedColumns}
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
        {/* Delete Confirmation Modal */}
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
        {/* Verify Confirmation Modal (Reusable) */}
        <VerifyConfirmModal
          visible={verifyModalVisible}
          onClose={() => setVerifyModalVisible(false)}
          onConfirm={handleConfirmVerify}
          title="Are you sure you want to verify this sold property?"
        />
        {/* Edit Modal */}
        <CModal
          alignment="center"
          visible={editModalVisible}
          onClose={() => setEditModalVisible(false)}
          className="edit_item_box"
          size="lg"
        >
          <CModalHeader>
            {/* <h5 className="mb-3">Edit For Sale Property</h5> */}
            <CModalTitle>Edit Sold Property</CModalTitle>
            {/* <button type="button" className="btn btn-close" aria-label="Close"></button> */}
          </CModalHeader>
          <CModalBody>
            {editRow && (
              <SoldForm
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
                      toast.success('Sold PIN is successfully updated')
                    }
                    setEditModalVisible(false)
                    setEditRow(null)
                    fetchBrokers(page, perPage)
                  } catch (err) {
                    setError(err?.message || 'Failed to update property')
                  }
                }}
                initialData={{
                  sellerName: editRow.sellerName || '',
                  otherStructure: editRow.otherStructure || '',
                  sellerContact: editRow.sellerContact || '',
                  buyerName: editRow.buyerName || '',
                  buyerContact: editRow.buyerContact || '',
                  dealDate: new Date(editRow.dealDate).toISOString().split('T')[0] || '',
                  soldAmount: editRow.soldAmount || '',
                  propertyType: editRow.propertyType || '',
                  ageOfProperty: editRow.ageOfProperty || '',
                  structure: editRow.structure || '',
                  propertyNo: editRow.propertyNo || '',
                  colony: editRow.colony || '',
                  landmark: editRow.landmark || '',
                  city: editRow.city || '',
                  district: editRow.district || '',
                  superBuiltupArea: editRow.superBuiltupArea || '',
                  carpetArea: editRow.carpetArea || '',
                  isOnRentalIncome: editRow.isOnRentalIncome ? 'yes' : 'no',
                  rentalIncomeAmount: editRow.rentalIncomeAmount || '',
                  remark: editRow.remark || '',
                  latitude: editRow.latitude || '',
                  longitude: editRow.longitude || '',
                  landArea: editRow.landArea || '',
                }}
              />
            )}
          </CModalBody>
        </CModal>
        {/* Details Modal */}
        <CModal
          alignment="center"
          visible={detailsModalVisible}
          onClose={() => setDetailsModalVisible(false)}
          className="details_modal"
          size="lg"
        >
          <CModalBody>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Sold Details</h5>
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
                            {col.name === 'Verified'
                              ? selectedRow.isVerify
                                ? 'Verified'
                                : 'Pending'
                              : typeof col.selector === 'function'
                              ? col.selector(selectedRow)
                              : selectedRow[col.selector] || '-'}
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

        {/* Mark as Sold Modal */}
        <CModal
          alignment="center"
          visible={openSaleModalVisible}
          onClose={() => setOpenSaleModalVisible(false)}
          className="mark_sold_modal"
          size="lg"
        >
          <CModalHeader>
            <CModalTitle> Mark Property as Open For Sale</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm className="g-3 needs-validation mb-3" onSubmit={handleOpenForSaleSubmit}>
              <CRow className="form-input-block">
                <CCol>
                  <CCard>
                    <CCardHeader>Open For Sale</CCardHeader>
                    <CCardBody>
                      {/* Row 1 */}
                      <CRow>
                        <CCol md={3}>
                          <div className="mb-3">
                            <CFormLabel>
                              Seller Name<span className="text-danger">*</span>
                            </CFormLabel>
                            <CInputGroup>
                              <CFormInput
                                type="text"
                                name="sellerName"
                                value={openForSaleForm.sellerName}
                                placeholder="Enter seller name"
                                onChange={(e) => {
                                  const upperValue = e.target.value.toUpperCase()
                                  setOpenForSaleForm((prev) => ({
                                    ...prev,
                                    sellerName: upperValue,
                                  }))
                                }}
                                required
                                size="sm"
                                autoComplete="off"
                              />
                            </CInputGroup>
                          </div>
                        </CCol>
                        <CCol md={3}>
                          <div className="mb-3">
                            <CFormLabel>
                              Contact No. 1<span className="text-danger">*</span>
                            </CFormLabel>
                            <CInputGroup>
                              <CFormInput
                                type="text"
                                name="contactNumber1"
                                value={openForSaleForm.contactNumber1}
                                placeholder="Enter contact no. 1"
                                onChange={(e) => {
                                  const value = e.target.value
                                  if (/^\d{0,10}$/.test(value)) {
                                    setOpenForSaleForm((prev) => ({
                                      ...prev,
                                      contactNumber1: value,
                                    }))
                                  }
                                }}
                                required
                                size="sm"
                                autoComplete="off"
                              />
                            </CInputGroup>
                          </div>
                        </CCol>
                        <CCol md={3}>
                          <div className="mb-3">
                            <CFormLabel>Contact No. 2</CFormLabel>
                            <CInputGroup>
                              <CFormInput
                                type="text"
                                name="contactNumber2"
                                value={openForSaleForm.contactNumber2}
                                placeholder="Enter contact no. 2"
                                onChange={(e) => {
                                  const value = e.target.value
                                  if (/^\d{0,10}$/.test(value)) {
                                    setOpenForSaleForm((prev) => ({
                                      ...prev,
                                      contactNumber2: value,
                                    }))
                                  }
                                }}
                                // required
                                size="sm"
                                autoComplete="off"
                              />
                            </CInputGroup>
                          </div>
                        </CCol>
                        <CCol md={3}>
                          <div className="mb-3">
                            <CFormLabel>
                              Property Type<span className="text-danger">*</span>
                            </CFormLabel>
                            <CInputGroup>
                              <AppFormSelect
                                name="propertyType"
                                value={openForSaleForm.propertyType}
                                onChange={handleOpenForSaleChange}
                                required
                                size="sm"
                              >
                                <option value="">Select property type</option>
                                <option value="residential">Residential</option>
                                <option value="commercial">Commercial</option>
                                <option value="industrial">Industrial</option>
                                <option value="land">Land</option>
                                <option value="other">Other</option>
                              </AppFormSelect>
                            </CInputGroup>
                          </div>
                        </CCol>
                      </CRow>
                      {/* Row 2 */}
                      <CRow>
                        <CCol md={3}>
                          <div className="mb-3">
                            <CFormLabel>Age of Property</CFormLabel>
                            <CInputGroup>
                              <CFormInput
                                type="number"
                                name="ageOfProperty"
                                value={openForSaleForm.ageOfProperty}
                                placeholder="Enter age of property"
                                onChange={handleOpenForSaleChange}
                                min={0}
                                size="sm"
                                autoComplete="off"
                              />
                            </CInputGroup>
                          </div>
                        </CCol>

                        <CCol md={3}>
                          <div className="mb-3">
                            <CFormLabel>Structure</CFormLabel>
                            <CInputGroup className="mb-2">
                              {!isCustom ? (
                                <AppFormSelect
                                  size="sm"
                                  value={
                                    openForSaleForm.structure === '' && isCustom
                                      ? 'Other'
                                      : openForSaleForm.structure
                                  }
                                  onChange={handleDropdownChange}
                                >
                                  <option value="">Select structure</option>

                                  {Array.from({ length: 10 }, (_, i) => (
                                    <option key={`G+${i + 1}`} value={`G+${i + 1}`}>{`G+${
                                      i + 1
                                    }`}</option>
                                  ))}
                                  <option value="Plot">Plot</option>
                                  <option value="Ground">Ground</option>
                                  <option value="Under Construction">Under Construction</option>
                                  <option value="Other">Other</option>
                                </AppFormSelect>
                              ) : (
                                <CFormInput
                                  size="sm"
                                  placeholder="Type your structure..."
                                  value={openForSaleForm.otherStructure}
                                  onChange={handleOtherInputChange}
                                  onBlur={() => {
                                    if (!openForSaleForm.otherStructure) {
                                      setIsCustom(false) // revert to dropdown if empty
                                    }
                                  }}
                                />
                              )}
                            </CInputGroup>
                          </div>
                        </CCol>
                        <CCol md={3}>
                          <div className="mb-3">
                            <CFormLabel>Address</CFormLabel>
                            <CInputGroup>
                              <CFormInput
                                type="text"
                                name="propertyNo"
                                value={openForSaleForm.propertyNo}
                                placeholder="Enter Address"
                                onChange={handleOpenForSaleChange}
                                size="sm"
                                autoComplete="off"
                              />
                            </CInputGroup>
                          </div>
                        </CCol>
                        <CCol md={3}>
                          <div className="mb-3">
                            <CFormLabel>Colony</CFormLabel>
                            <CInputGroup>
                              <CFormInput
                                type="text"
                                name="colony"
                                value={openForSaleForm.colony}
                                placeholder="Enter colony"
                                onChange={handleOpenForSaleChange}
                                size="sm"
                                autoComplete="off"
                              />
                            </CInputGroup>
                          </div>
                        </CCol>
                      </CRow>
                      {/* Row 3 */}
                      <CRow>
                        <CCol md={3}>
                          <div className="mb-3">
                            <CFormLabel>Landmark</CFormLabel>
                            <CInputGroup>
                              <CFormInput
                                type="text"
                                name="landmark"
                                value={openForSaleForm.landmark}
                                placeholder="Enter landmark"
                                onChange={handleOpenForSaleChange}
                                size="sm"
                                autoComplete="off"
                              />
                            </CInputGroup>
                          </div>
                        </CCol>
                        <CCol md={3}>
                          <div className="mb-3">
                            <CFormLabel>
                              City<span className="text-danger">*</span>
                            </CFormLabel>
                            <CInputGroup>
                              <CFormInput
                                type="text"
                                name="city"
                                value={openForSaleForm.city}
                                placeholder="Enter city"
                                onChange={handleOpenForSaleChange}
                                required
                                size="sm"
                                autoComplete="off"
                              />
                            </CInputGroup>
                          </div>
                        </CCol>
                        <CCol md={3}>
                          <div className="mb-3">
                            <CFormLabel>
                              District<span className="text-danger">*</span>
                            </CFormLabel>
                            <CInputGroup>
                              <CFormInput
                                type="text"
                                name="district"
                                value={openForSaleForm.district}
                                placeholder="Enter district"
                                onChange={handleOpenForSaleChange}
                                required
                                size="sm"
                                autoComplete="off"
                              />
                            </CInputGroup>
                          </div>
                        </CCol>
                        <CCol md={3}>
                          <div className="mb-3">
                            <CFormLabel>Super Built-up Area</CFormLabel>
                            <CInputGroup>
                              <CFormInput
                                type="number"
                                name="superBuiltupArea"
                                value={openForSaleForm.superBuiltupArea}
                                placeholder="Enter super built-up area"
                                onChange={handleOpenForSaleChange}
                                min={0}
                                size="sm"
                                autoComplete="off"
                              />
                            </CInputGroup>
                          </div>
                        </CCol>
                      </CRow>
                      {/* Row 4 */}
                      <CRow>
                        <CCol md={3}>
                          <div className="mb-3">
                            <CFormLabel>Carpet Area</CFormLabel>
                            <CInputGroup>
                              <CFormInput
                                type="text"
                                name="carpetArea"
                                value={openForSaleForm.carpetArea}
                                placeholder="Enter carpet area"
                                onChange={handleOpenForSaleChange}
                                size="sm"
                                autoComplete="off"
                              />
                            </CInputGroup>
                          </div>
                        </CCol>
                        <CCol md={3}>
                          <div className="mb-3">
                            <CFormLabel>Rate per Sqft</CFormLabel>
                            <CInputGroup>
                              <CFormInput
                                type="text"
                                name="ratePerSqft"
                                value={openForSaleForm.ratePerSqft}
                                placeholder="Enter rate per sqft"
                                onChange={handleOpenForSaleChange}
                                size="sm"
                                autoComplete="off"
                              />
                            </CInputGroup>
                          </div>
                        </CCol>
                        <CCol md={3}>
                          <div className="mb-3">
                            <CFormLabel>Unit Rate</CFormLabel>
                            <CInputGroup>
                              <CFormInput
                                type="text"
                                name="totalRate"
                                value={openForSaleForm.totalRate}
                                placeholder="Enter total rate"
                                onChange={handleOpenForSaleChange}
                                size="sm"
                                autoComplete="off"
                              />
                            </CInputGroup>
                          </div>
                        </CCol>
                        <CCol md={3}>
                          <div className="mb-3">
                            <CFormLabel>Rental Income</CFormLabel>
                            <CInputGroup>
                              <AppFormSelect
                                name="isOnRentalIncome"
                                value={openForSaleForm.isOnRentalIncome}
                                onChange={handleOpenForSaleChange}
                                size="sm"
                              >
                                <option value="no">No</option>
                                <option value="yes">Yes</option>
                              </AppFormSelect>
                            </CInputGroup>
                          </div>
                        </CCol>
                        {openForSaleForm.isOnRentalIncome === 'yes' && (
                          <CCol md={3}>
                            <div className="mb-3">
                              <CFormLabel>
                                Rental Income Amount <span className="text-danger">*</span>
                              </CFormLabel>
                              <CInputGroup>
                                <CFormInput
                                  required
                                  type="text"
                                  name="rentalIncomeAmount"
                                  value={openForSaleForm.rentalIncomeAmount}
                                  placeholder="Enter rental income amount"
                                  onChange={handleOpenForSaleChange}
                                  size="sm"
                                  autoComplete="off"
                                />
                              </CInputGroup>
                            </div>
                          </CCol>
                        )}
                      </CRow>
                      {/* Row 5 */}
                      <CRow>
                        <CCol md={3}>
                          <div className="mb-3">
                            <CFormLabel>
                              Latitude<span className="text-danger">*</span>
                            </CFormLabel>
                            <CInputGroup>
                              <CFormInput
                                type="number"
                                name="latitude"
                                value={openForSaleForm.latitude}
                                placeholder="e.g. 28.7041"
                                onChange={handleOpenForSaleChange}
                                required
                                step="any"
                                inputMode="decimal"
                                size="sm"
                                autoComplete="off"
                              />
                            </CInputGroup>
                          </div>
                        </CCol>
                        <CCol md={3}>
                          <div className="mb-3">
                            <CFormLabel>
                              Longitude<span className="text-danger">*</span>
                            </CFormLabel>
                            <CInputGroup>
                              <CFormInput
                                type="number"
                                name="longitude"
                                value={openForSaleForm.longitude}
                                placeholder="e.g. 77.1025"
                                onChange={handleOpenForSaleChange}
                                required
                                step="any"
                                inputMode="decimal"
                                size="sm"
                                autoComplete="off"
                              />
                            </CInputGroup>
                          </div>
                        </CCol>
                        <CCol md={3}>
                          <div className="mb-3">
                            <CFormLabel>
                              Land Area<span className="text-danger">*</span>
                            </CFormLabel>
                            <CInputGroup>
                              <CFormInput
                                type="text"
                                name="landArea"
                                value={openForSaleForm.landArea}
                                placeholder="e.g. 20*50"
                                onChange={handleOpenForSaleChange}
                                required
                                step="any"
                                inputMode="decimal"
                                size="sm"
                                autoComplete="off"
                              />
                            </CInputGroup>
                          </div>
                        </CCol>
                        <CCol md={3}>
                          <div className="mb-3">
                            <CFormLabel>Broker Name</CFormLabel>
                            <CInputGroup>
                              <CFormInput
                                type="text"
                                name="brokerName"
                                value={openForSaleForm.brokerName}
                                placeholder="Enter Broker Name"
                                onChange={(e) => {
                                  const upperValue = e.target.value.toUpperCase()
                                  setOpenForSaleForm((prev) => ({
                                    ...prev,
                                    brokerName: upperValue,
                                  }))
                                }}
                                size="sm"
                                autoComplete="off"
                              />
                            </CInputGroup>
                          </div>
                        </CCol>
                        <CCol md={3}>
                          <div className="mb-3">
                            <CFormLabel>Broker Contact</CFormLabel>
                            <CInputGroup>
                              <CFormInput
                                type="number"
                                name="brokerContactNumber"
                                value={openForSaleForm.brokerContactNumber}
                                placeholder="Enter Broker Contact"
                                onChange={(e) => {
                                  const value = e.target.value
                                  if (/^\d{0,10}$/.test(value)) {
                                    setOpenForSaleForm((prev) => ({
                                      ...prev,
                                      brokerContactNumber: value,
                                    }))
                                  }
                                }}
                                size="sm"
                                autoComplete="off"
                              />
                            </CInputGroup>
                          </div>
                        </CCol>
                        <CCol md={6}>
                          <div className="mb-3">
                            <CFormLabel>Remark</CFormLabel>
                            <CInputGroup>
                              <CFormTextarea
                                name="remark"
                                value={openForSaleForm.remark}
                                placeholder="Enter remark"
                                onChange={handleOpenForSaleChange}
                                rows={2}
                                style={{ resize: 'none', minHeight: '30px', maxHeight: '40px' }}
                                autoComplete="off"
                              />
                            </CInputGroup>
                          </div>
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>
              <CModalFooter className="justify-content-center">
                <CButton
                  color="secondary"
                  onClick={() => setOpenSaleModalVisible(false)}
                  disabled={markSaleLoading}
                >
                  Cancel
                </CButton>
                <CButton color="warning" type="submit" disabled={markSaleLoading}>
                  {markSaleLoading ? 'Marking...' : 'Mark as For Sale'}
                </CButton>
              </CModalFooter>
            </CForm>
          </CModalBody>
        </CModal>
      </CContainer>

      {/* Confirmation Modal */}
      <CModal
        alignment="center"
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        className="delete_item_box"
      >
        <CModalBody className="text-center mt-4">
          <div className="logo_x m-auto mb-3">?</div>
          <span>Are you sure you want to mark as for sale?</span>
          <br />
          <span>
            <strong>Are you sure about Rate per sqft and Unit Rate</strong>
          </span>
        </CModalBody>
        <CModalFooter className="model_footer justify-content-center mb-3 pt-0">
          <CButton
            className="delete_btn model_btn"
            color="success"
            onClick={() => {
              confirmAndSubmit()
              setShowConfirmModal(false)
            }}
          >
            Yes
          </CButton>
          <CButton
            className="close_btn model_btn"
            color="secondary"
            onClick={() => setShowConfirmModal(false)}
          >
            No, cancel
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Toastify */}
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  )
}

export default Sold

