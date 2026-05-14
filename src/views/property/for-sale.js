import React, { useEffect, useState, useCallback } from 'react'
import DataTable from 'src/components/custom/table/AppDataTable'
import AppTableSkeleton from 'src/components/custom/table/AppTableSkeleton'
import moment from 'moment'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {
  CContainer,
  CSpinner,
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CAlert,
  CCardHeader,
  CCardBody,
  CCard,
  CModalHeader,
  CModalTitle,
} from '@coreui/react'
import BasicProvider from 'src/constants/BasicProvider'
import { cilPencil, cilTrash, cilCopy, cilCheck } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import PropertyFilter1 from 'src/components/custom/PropertyFilter1'
import VerifyConfirmModal from 'src/components/custom/VerifyConfirmModal'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { useSelector } from 'react-redux'
import ForSaleForm from 'src/components/forms/ForSaleForm'
import ForcePinAttachmentImage from 'src/components/property/ForcePinAttachmentImage'

let FE = process.env.REACT_APP_FE
let BROKER = process.env.REACT_APP_BROKER
let DM = process.env.REACT_APP_DM

const ForSale = () => {
  const location = useLocation()
  const query = new URLSearchParams(location.search)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const loggedinUserRole = useSelector((state) => state?.userRole)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [data, setData] = useState([])
  const [totalRows, setTotalRows] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [userId, setuserId] = useState('')
  const [visible, setVisible] = useState(false)
  const [error, setError] = useState('') // <-- Add error state
  const [numberError, setNumberError] = useState('') // <-- Add error state'

  const [isFilter, setIsFilter] = useState(false)
  const [filterData, setFilterData] = useState({
    fromDate: query.get('date_from') || '',
    toDate: query.get('date_to') || '',
    propertyType: query.get('propertyType') || '',
    isVerify: query.get('isVerify') || '',
    search: query.get('search') || '',
  })

  // State for verify confirmation modal
  const [verifyModalVisible, setVerifyModalVisible] = useState(false)
  const [verifyRow, setVerifyRow] = useState(null)

  // State for details modal
  const [detailsModalVisible, setDetailsModalVisible] = useState(false)
  const [selectedRow, setSelectedRow] = useState(null)

  // State for mark as sold modal
  const [markSoldModalVisible, setMarkSoldModalVisible] = useState(false)
  const [markSoldRow, setMarkSoldRow] = useState(null)
  const [markSoldForm, setMarkSoldForm] = useState({
    buyerName: '',
    buyerContact: '',
    dealDate: '',
    soldAmount: '',
    sellerName: '',
    sellerContact: '',
    brokerName: '',
    brokerContactNumber: '',
  })
  const [markSoldLoading, setMarkSoldLoading] = useState(false)

  // State for edit modal
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editRow, setEditRow] = useState(null)

  const fetchAll = useCallback(
    async (page, perPage, filters = filterData) => {
      setLoading(true)
      setError('')
      try {
        let queryStr = `limit=${perPage}&page=${page}`
        if (filters.fromDate) queryStr += `&startDate=${filters.fromDate}`
        if (filters.toDate) queryStr += `&endDate=${filters.toDate}`
        if (filters.isVerify) queryStr += `&isVerify=${filters.isVerify}`
        if (filters.search) queryStr += `&search=${encodeURIComponent(filters.search)}`
        if (filters.propertyType) queryStr += `&propertyType=${filters.propertyType}`

        const provider = new BasicProvider(`properties/filter?type=for sale&${queryStr}`)
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
    params.delete('propertyType')
    // Set new filter params if present
    if (filters.fromDate) params.set('date_from', filters.fromDate)
    if (filters.toDate) params.set('date_to', filters.toDate)
    if (filters.isVerify) params.set('isVerify', filters.isVerify)
    if (filters.search) params.set('search', filters.search)
    if (filters.propertyType) params.set('propertyType', filters.propertyType)
    // Keep any other params (like 'data')
    const queryData = searchParams.get('data')
    if (queryData) {
      params.set('data', queryData)
    }

    navigate({ search: params.toString() })
  }

  const handleReset = () => {
    setFilterData({ fromDate: '', toDate: '', isVerify: '', search: '', propertyType: '' })
    setPage(1)
    fetchAll(1, perPage, { fromDate: '', toDate: '', isVerify: '', search: '', propertyType: '' })
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
        `properties/filter?type=for sale&limit=${perPage}&page=${page}`,
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
  const handleEdit = (row) => {
    setEditRow(row)
    setEditModalVisible(true)
  }

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
      setError(err?.message || 'Failed to verify property')
      setVerifyModalVisible(false)
      setVerifyRow(null)
    }
  }

  const handleOpenMarkSold = (row) => {
    setMarkSoldRow(row)
    setMarkSoldForm({
      buyerName: '',
      buyerContact: '',
      dealDate: moment().format('YYYY-MM-DD'),
      soldAmount: '',
      sellerName: row.sellerName || '',
      sellerContact: row.contactNumber1 || '',
      brokerName: '',
      brokerContactNumber: '',
    })
    setMarkSoldModalVisible(true)
  }

  const handleMarkSoldChange = (e) => {
    const { name, value } = e.target
    setMarkSoldForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleMarkSoldSubmit = (e) => {
    e.preventDefault()
    if (!/^\d{10}$/.test(markSoldForm.buyerContact)) {
      setNumberError('Buyer Contact numbers must be exactly 10 digits.')
      toast.error('Buyer Contact numbers must be exactly 10 digits.')
      return
    }

    setShowConfirmModal(true)
  }

  const confirmAndSubmit = async (e) => {
    // e.preventDefault()
    if (!markSoldRow) return
    setMarkSoldLoading(true)
    setError('')
    console.log({
      buyerName: markSoldForm.buyerName,
      buyerContact: markSoldForm.buyerContact,
      dealDate: markSoldForm.dealDate,
      soldAmount: markSoldForm.soldAmount,
      sellerContact: markSoldForm.sellerContact,
      sellerName: markSoldForm.sellerName,
      brokerName: markSoldForm.brokerName,
      brokerContactNumber: markSoldForm.brokerContactNumber,
    })
    try {
      const provider = new BasicProvider(`properties/${markSoldRow._id}/mark-sold`)
      await provider.putRequest({
        buyerName: markSoldForm.buyerName,
        buyerContact: markSoldForm.buyerContact,
        dealDate: markSoldForm.dealDate,
        soldAmount: markSoldForm.soldAmount,
        sellerContact: markSoldForm.sellerContact,
        sellerName: markSoldForm.sellerName,
        brokerName: markSoldForm.brokerName,
        brokerContactNumber: markSoldForm.brokerContactNumber,
      })
      setMarkSoldModalVisible(false)
      setMarkSoldRow(null)
      fetchBrokers(page, perPage)
      toast.success('Mark as Sold is successfully submitted')
    } catch (err) {
      setError(err?.message || 'Failed to mark as sold')
      toast.error('Error during submission.')
    }
    setMarkSoldLoading(false)
  }

  // const handleMarkSoldSubmit = async (e) => {
  //   e.preventDefault()
  //   if (!markSoldRow) return
  //   setMarkSoldLoading(true)
  //   setError('')
  //   console.log({
  //     buyerName: markSoldForm.buyerName,
  //     buyerContact: markSoldForm.buyerContact,
  //     dealDate: markSoldForm.dealDate,
  //     soldAmount: markSoldForm.soldAmount,
  //     sellerContact: markSoldForm.sellerContact,
  //     sellerName: markSoldForm.sellerName,
  //     brokerName: markSoldForm.brokerName,
  //     brokerContactNumber: markSoldForm.brokerContactNumber,
  //   })
  //   try {
  //     const provider = new BasicProvider(`properties/${markSoldRow._id}/mark-sold`)
  //     await provider.putRequest({
  //       buyerName: markSoldForm.buyerName,
  //       buyerContact: markSoldForm.buyerContact,
  //       dealDate: markSoldForm.dealDate,
  //       soldAmount: markSoldForm.soldAmount,
  //       sellerContact: markSoldForm.sellerContact,
  //       sellerName: markSoldForm.sellerName,
  //       brokerName: markSoldForm.brokerName,
  //       brokerContactNumber: markSoldForm.brokerContactNumber,
  //     })
  //     setMarkSoldModalVisible(false)
  //     setMarkSoldRow(null)
  //     fetchBrokers(page, perPage)
  //   } catch (err) {
  //     setError(err?.message || 'Failed to mark as sold')
  //   }
  //   setMarkSoldLoading(false)
  // }

  const columns = [
    {
      name: 'Seller Name',
      selector: (row) => capitalizeFirst(row.sellerName || '-'),
      sortable: true,
      width: '150px',
    },
    {
      name: 'Contact 1',
      selector: (row) => row.contactNumber1 || '-',
      sortable: true,
      width: '130px',
    },
    {
      name: 'Contact 2',
      selector: (row) => row.contactNumber2 || '-',
      sortable: true,
      width: '130px',
    },

    {
      name: 'Property Type',
      selector: (row) => capitalizeFirst(row.propertyType || '-'),
      sortable: true,
      width: '130px',
    },
    {
      name: 'Age Of Property',
      selector: (row) => row.ageOfProperty || '-',
      sortable: true,
      width: '130px',
    },
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
    {
      name: 'City',
      selector: (row) => capitalizeFirst(row.city || '-'),
      sortable: true,
      width: '120px',
    },
    {
      name: 'District',
      selector: (row) => capitalizeFirst(row.district || '-'),
      sortable: true,
      width: '120px',
    },
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
      name: 'Rate Per Sqft',
      selector: (row) => row.ratePerSqft || '-',
      sortable: true,
      width: '120px',
    },
    { name: 'Unit Rate', selector: (row) => row.totalRate || '-', sortable: true, width: '120px' },

    {
      name: 'Type Of Property',
      selector: (row) => capitalizeFirst(row.typeOfProperty || '-'),
      sortable: false,
      width: '130px',
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
    { name: 'Latitude', selector: (row) => row.latitude || '-', sortable: true, width: '120px' },
    { name: 'Longitude', selector: (row) => row.longitude || '-', sortable: true, width: '120px' },
    { name: 'Land Area', selector: (row) => row.landArea || '-', sortable: true, width: '120px' },
    {
      name: 'Broker Name',
      selector: (row) => capitalizeFirst(row.brokerName || '-'),
      sortable: true,
    },
    { name: 'Broker Contact', selector: (row) => row.brokerContactNumber || '-', sortable: true },
    {
      name: 'Remark',
      selector: (row) => capitalizeFirst(row.remark || '-'),
      sortable: false,
      width: '150px',
    },
    {
      name: 'Created',
      selector: (row) => moment(row.created_at).format('DD MMM YYYY HH:mm'),
      sortable: true,
      width: '170px',
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
          {loggedinUserRole.name !== BROKER && (
            <div className="mark-sold-btn" style={{ marginTop: 8 }}>
              <CButton color="warning" size="sm" onClick={() => handleOpenMarkSold(row)}>
                Mark as Sold
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

  const handleRowClick = (row) => {
    setSelectedRow(row)
    setDetailsModalVisible(true)
  }

  const handleDownloadExcel = () => {
    if (!data || data.length === 0) return alert('No data available to download.')

    // 1. Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((row) => ({
        'Seller Name': row.sellerName || '-',
        'Contact 1': row.contactNumber1 || '-',
        'Contact 2': row.contactNumber2 || '-',
        'Broker Name': row.brokerName || '-',
        'Broker Contact': row.brokerContactNumber || '-',
        'Property Type': row.propertyType || '-',
        'Age Of Property': row.ageOfProperty || '-',
        Structure: row.structure || '-',
        'Super Builtup Area': row.superBuiltupArea || '-',
        'Carpet Area': row.carpetArea || '-',
        'Rate Per Sqft': row.ratePerSqft || '-',
        'Unit Rate': row.totalRate || '-',
        'Property No': row.propertyNo || '-',
        'Type Of Property': row.typeOfProperty || '-',
        Colony: row.colony || '-',
        Landmark: row.landmark || '-',
        City: row.city || '-',
        District: row.district || '-',
        'Rental Income': row.isOnRentalIncome ? 'Yes' : 'No',
        'Rental Income Amount': row.rentalIncomeAmount || '-',
        Latitude: row.latitude || '-',
        Longitude: row.longitude || '-',
        'Land Area': row.landArea || '-',
        Remark: row.remark || '-',
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
    XLSX.utils.book_append_sheet(workbook, worksheet, 'For Sale Properties')

    // 3. Generate buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })

    // 4. Save file
    const fileData = new Blob([excelBuffer], { type: 'application/octet-stream' })
    saveAs(fileData, `ForSale_Properties_${moment().format('YYYYMMDD_HHmm')}.xlsx`)
  }

  const capitalizeFirst = (value) => {
    if (!value || typeof value !== 'string') return '-'
    return value.charAt(0).toUpperCase() + value.slice(1)
  }

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
            pinType="for sale"
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
              <span>For Sale</span>
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
                // title="Sold Property Pins"
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
        {/* Verify Confirmation Modal (Reusable) */}
        <VerifyConfirmModal
          visible={verifyModalVisible}
          onClose={() => setVerifyModalVisible(false)}
          onConfirm={handleConfirmVerify}
          title="Are you sure you want to verify this for-sale property?"
        />
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
              <h5 className="mb-0">For Sale Details</h5>
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
        {/* Mark as Sold Modal */}
        <CModal
          alignment="center"
          visible={markSoldModalVisible}
          onClose={() => setMarkSoldModalVisible(false)}
          className="mark_sold_modal"
        >
          <CModalHeader>
            <CModalTitle>Mark Property as Sold</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <form onSubmit={handleMarkSoldSubmit}>
              <div className="mb-2">
                <label>Buyer Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="buyerName"
                  value={markSoldForm.buyerName}
                  onChange={(e) => {
                    const upperValue = e.target.value.toUpperCase()
                    setMarkSoldForm((prev) => ({ ...prev, buyerName: upperValue }))
                  }}
                  required
                />
              </div>
              <div className="mb-2">
                <label>Buyer Contact</label>
                <input
                  type="number"
                  className="form-control"
                  name="buyerContact"
                  value={markSoldForm.buyerContact}
                  onChange={(e) => {
                    const value = e.target.value
                    if (/^\d{0,10}$/.test(value)) {
                      setMarkSoldForm((prev) => ({ ...prev, buyerContact: value }))
                      if (value.length === 10) {
                        setNumberError('')
                      } else {
                        setNumberError('Buyer Contact numbers must be exactly 10 digits.')
                      }
                    }
                  }}
                  required
                />
                {numberError && <span style={{ color: 'red' }}>{numberError}</span>}
              </div>
              <div className="mb-2">
                <label>Deal Date</label>
                <input
                  type="date"
                  className="form-control"
                  name="dealDate"
                  value={markSoldForm.dealDate}
                  onChange={handleMarkSoldChange}
                  required
                />
              </div>
              <div className="mb-2">
                <label>Sold Amount</label>
                <input
                  type="string"
                  className="form-control"
                  name="soldAmount"
                  value={markSoldForm.soldAmount}
                  onChange={handleMarkSoldChange}
                  required
                />
              </div>
              <div className="mb-2">
                <label>Seller Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="sellerName"
                  value={markSoldForm.sellerName}
                  onChange={(e) => {
                    const upperValue = e.target.value.toUpperCase()
                    setMarkSoldForm((prev) => ({ ...prev, sellerName: upperValue }))
                  }}
                  required
                />
              </div>
              <div className="mb-2">
                <label>Seller Contact</label>
                <input
                  type="text"
                  className="form-control"
                  name="sellerContact"
                  value={markSoldForm.sellerContact}
                  onChange={(e) => {
                    const value = e.target.value
                    if (/^\d{0,10}$/.test(value)) {
                      setMarkSoldForm((prev) => ({ ...prev, sellerContact: value }))
                    }
                  }}
                  required
                />
              </div>
              <div className="mb-2">
                <label>Broker Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="brokerName"
                  value={markSoldForm.brokerName}
                  onChange={(e) => {
                    const upperValue = e.target.value.toUpperCase()
                    setMarkSoldForm((prev) => ({ ...prev, brokerName: upperValue }))
                  }}
                  // required
                />
              </div>
              <div className="mb-2">
                <label>Broker Contact</label>
                <input
                  type="text"
                  className="form-control"
                  name="brokerContactNumber"
                  value={markSoldForm.brokerContactNumber}
                  onChange={(e) => {
                    const value = e.target.value
                    if (/^\d{0,10}$/.test(value)) {
                      setMarkSoldForm((prev) => ({ ...prev, brokerContactNumber: value }))
                    }
                  }}
                  // required
                />
              </div>
              <CModalFooter className="justify-content-center">
                <CButton
                  color="secondary"
                  onClick={() => setMarkSoldModalVisible(false)}
                  disabled={markSoldLoading}
                >
                  Cancel
                </CButton>
                <CButton color="warning" type="submit" disabled={markSoldLoading}>
                  {markSoldLoading ? 'Marking...' : 'Mark as Sold'}
                </CButton>
              </CModalFooter>
            </form>
          </CModalBody>
        </CModal>
        {/* Edit Modal */}
        <CModal
          alignment="center"
          visible={editModalVisible}
          onClose={() => setEditModalVisible(false)}
          className="edit_item_box"
          size="lg"
        >
          <CModalHeader>
            <CModalTitle>Edit For Sale Property</CModalTitle>
          </CModalHeader>
          <CModalBody>
            {editRow && (
              <ForSaleForm
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
                      toast.success('For Sale PIN is successfully updated')
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
                  contactNumber1: editRow.contactNumber1 || '',
                  contactNumber2: editRow.contactNumber2 || '',
                  propertyType: editRow.propertyType || '',
                  ageOfProperty: editRow.ageOfProperty || '',
                  structure: editRow.structure || '',
                  otherStructure: editRow.otherStructure || '',
                  propertyNo: editRow.propertyNo || '',
                  colony: editRow.colony || '',
                  landmark: editRow.landmark || '',
                  city: editRow.city || '',
                  district: editRow.district || '',
                  superBuiltupArea: editRow.superBuiltupArea || '',
                  carpetArea: editRow.carpetArea || '',
                  ratePerSqft: editRow.ratePerSqft || '',
                  totalRate: editRow.totalRate || '',
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
          <span>Are you sure you want to mark as sold?</span>
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

export default ForSale

