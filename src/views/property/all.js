import React, { useEffect, useState, useCallback } from 'react'
import DataTable from 'src/components/custom/table/AppDataTable'
import AppTableSkeleton from 'src/components/custom/table/AppTableSkeleton'
import moment from 'moment'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import CustomTooltip from 'src/components/custom/CustomTooltip'
import { faBan, faEye } from '@fortawesome/free-solid-svg-icons'
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
} from '@coreui/react'
import BasicProvider from 'src/constants/BasicProvider'
import { cilTrash, cilCopy } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import PropertyFilter from 'src/components/custom/PropertyFilter'
import VerifyConfirmModal from 'src/components/custom/VerifyConfirmModal'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { useSelector } from 'react-redux'
import ForcePinAttachmentImage from 'src/components/property/ForcePinAttachmentImage'

const All = () => {
  const location = useLocation()
  const query = new URLSearchParams(location.search)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [isFilter, setIsFilter] = useState(false)
  const [data, setData] = useState([])
  const [totalRows, setTotalRows] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [userId, setuserId] = useState('')
  const [visible, setVisible] = useState(false)
  const [error, setError] = useState('')
  const [filterData, setFilterData] = useState({
    fromDate: query.get('date_from') || '',
    toDate: query.get('date_to') || '',
    pinType: query.get('pinType') || '',
    propertyType: query.get('propertyType') || '',
    isVerify: query.get('isVerify') || '',
    search: query.get('search') || '',
  })

  let FE = process.env.REACT_APP_FE
  let BROKER = process.env.REACT_APP_BROKER
  let DM = process.env.REACT_APP_DM

  const [verifyModalVisible, setVerifyModalVisible] = useState(false)
  const [verifyRow, setVerifyRow] = useState(null)
  const [detailsModalVisible, setDetailsModalVisible] = useState(false)
  const [selectedRow, setSelectedRow] = useState(null)
  const loggedinUserRole = useSelector((state) => state?.userRole)
  const loggedinUser = useSelector((state) => state?.userData)
  const fetchAll = useCallback(
    async (page, perPage, filters = filterData) => {
      setLoading(true)
      setError('')
      try {
        let queryStr = `limit=${perPage}&page=${page}`
        if (filters.fromDate) queryStr += `&startDate=${filters.fromDate}`
        if (filters.toDate) queryStr += `&endDate=${filters.toDate}`
        if (filters.propertyType) queryStr += `&propertyType=${filters.propertyType}`
        if (filters.pinType) queryStr += `&type=${filters.pinType}`
        if (filters.isVerify) queryStr += `&isVerify=${filters.isVerify}`
        if (filters.search) queryStr += `&search=${encodeURIComponent(filters.search)}`
        if (query.get('createdByYou')) {
          queryStr += `&createdBy=${loggedinUser._id}`
        }

        const provider = new BasicProvider(`properties/filter?${queryStr}`)
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

  const handleFilter = (filters) => {
    console.log('Filters applied:', filters)

    setPage(1)
    fetchAll(1, perPage, filters)

    // Update URL search params
    const params = new URLSearchParams(window.location.search)
    // Remove old filter params
    params.delete('date_from')
    params.delete('date_to')
    params.delete('pinType')
    params.delete('propertyType')
    params.delete('isVerify')
    params.delete('search')

    // Set new filter params if present
    if (filters.fromDate) params.set('date_from', filters.fromDate)
    if (filters.toDate) params.set('date_to', filters.toDate)
    if (filters.pinType) params.set('pinType', filters.pinType)
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
    setFilterData({
      fromDate: '',
      toDate: '',
      pinType: '',
      propertyType: '',
      isVerify: '',
      search: '',
    })
    setPage(1)
    fetchAll(1, perPage, {
      fromDate: '',
      toDate: '',
      pinType: '',
      propertyType: '',
      isVerify: '',
      search: '',
    })
    const params = new URLSearchParams(window.location.search)
    const queryData = searchParams.get('data')
    // Reapply the 'data' parameter
    if (queryData) {
      params.set('data', queryData)
    }
    // Update the URL with the modified parameters
    navigate({ search: params.toString() })
  }
  const handleDelete = async () => {
    setError('')
    try {
      const provider = new BasicProvider(`properties/delete/${userId}`)
      await provider.deleteRequest({})
      setVisible(false)
      fetchAll(page, perPage)
    } catch (err) {
      console.log(err, 'juu')

      setError(err?.message || 'Failed to delete property')
    }
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

  const capitalizeFirst = (value) => {
    if (!value || typeof value !== 'string') return '-'
    return value.charAt(0).toUpperCase() + value.slice(1)
  }

  const columns = [
    {
      name: 'Type',
      selector: (row) => (
        <span style={{ fontWeight: 'bold' }}>
          {row.type ? row.type.charAt(0).toUpperCase() + row.type.slice(1) : '-'}
        </span>
      ),
      sortable: true,
      width: '100px',
    },
    {
      name: 'Seller Name',
      selector: (row) => (
        <div className="data_table_colum">
          <div>{capitalizeFirst(row.sellerName || row.name || '-')}</div>
          <div className="fs-12 pt-1">
            {row.contactNumber1 || row.sellerContact || row.mobile || '-'}
          </div>
        </div>
      ),
      sortable: true,
      width: '150px',
    },
    // {
    //   name: 'Contact 1',
    //   selector: (row) => row.contactNumber1 || row.sellerContact || row.mobile || '-',
    //   sortable: true,
    //   width: '130px',
    // },
    // {
    //   name: 'Contact 2',
    //   selector: (row) => row.contactNumber2 || row.buyerContact || '-',
    //   sortable: true,
    //   width: '130px',
    // },
    {
      name: 'Buyer Name',
      selector: (row) => (
        <div className="data_table_colum">
          <div>{capitalizeFirst(row.buyerName || '-')}</div>
          <div className="fs-12 pt-1">{row.contactNumber2 || row.buyerContact || '-'}</div>
        </div>
      ),
      sortable: true,
      width: '150px',
    },
    {
      name: 'Property Type',
      selector: (row) => capitalizeFirst(row.propertyType || '-'),
      sortable: true,
      width: '130px',
    },
    // {
    //   name: 'Age Of Property',
    //   selector: (row) => row.ageOfProperty || '-',
    //   sortable: true,
    //   width: '130px',
    // },
    // {
    //   name: 'Structure',
    //   selector: (row) => capitalizeFirst(row.structure || '-'),
    //   sortable: false,
    //   width: '120px',
    // },
    // {
    //   name: 'Address',
    //   selector: (row) => capitalizeFirst(row.propertyNo || '-'),
    //   sortable: false,
    //   width: '120px',
    // },
    // {
    //   name: 'Colony',
    //   selector: (row) => capitalizeFirst(row.colony || '-'),
    //   sortable: false,
    //   width: '120px',
    // },
    // {
    //   name: 'Landmark',
    //   selector: (row) => capitalizeFirst(row.landmark || '-'),
    //   sortable: false,
    //   width: '120px',
    // },
    // {
    //   name: 'City',
    //   selector: (row) => capitalizeFirst(row.city || '-'),
    //   sortable: true,
    //   width: '120px',
    // },
    // {
    //   name: 'District',
    //   selector: (row) => capitalizeFirst(row.district || '-'),
    //   sortable: true,
    //   width: '120px',
    // },
    // {
    //   name: 'Area Of Work',
    //   selector: (row) => capitalizeFirst(row.areaOfWork || '-'),
    //   sortable: true,
    //   width: '120px',
    // },
    // {
    //   name: 'Years Of Working',
    //   selector: (row) => row.yearsOfWorking || '-',
    //   sortable: true,
    //   width: '120px',
    // },
    // {
    //   name: 'Deal Date',
    //   selector: (row) => (row.dealDate ? moment(row.dealDate).format('DD MMM YYYY') : '-'),
    //   sortable: true,
    //   width: '130px',
    // },
    // {
    //   name: 'Sold Amount',
    //   selector: (row) => row.soldAmount || '-',
    //   sortable: true,
    //   width: '130px',
    // },
    // {
    //   name: 'Rental Income',
    //   selector: (row) => (row.isOnRentalIncome ? 'Yes' : 'No'),
    //   sortable: true,
    //   width: '120px',
    // },
    // {
    //   name: 'Latitude',
    //   selector: (row) => row.latitude,
    //   sortable: true,
    //   width: '120px',
    // },
    // {
    //   name: 'Longitude',
    //   selector: (row) => row.longitude,
    //   sortable: true,
    //   width: '120px',
    // },
    // {
    //   name: 'Land Area',
    //   selector: (row) => row.landArea,
    //   sortable: true,
    //   width: '120px',
    // },
    // {
    //   name: 'Remark',
    //   selector: (row) => capitalizeFirst(row.remark || '-'),
    //   sortable: false,
    //   width: '150px',
    // },
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
          <CustomTooltip content={'View Table'}>
            <CButton
              color="info"
              variant="outline"
              onClick={() => {
                // normalize type (remove spaces, lowercase)
                const typePath = row.type?.toLowerCase().replace(/\s+/g, '-')
                navigate(`/property/${typePath}`)
              }}
            >
              <FontAwesomeIcon icon={faEye} />
            </CButton>
          </CustomTooltip>
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
      width: '110px',
    },
  ]

  console.log(data, '---------')

  const exportToExcel = () => {
    if (!data || data.length === 0) {
      alert('No data available to export!')
      return
    }

    const formattedData = data.map((item) => ({
      Type: item.type || '-',
      'Seller Name': item.sellerName || item.name || '-',
      'Contact 1': item.contactNumber1 || item.sellerContact || item.mobile || '-',
      'Contact 2': item.contactNumber2 || item.buyerContact || '-',
      'Buyer Name': item.buyerName || '-',
      'Property Type': item.propertyType || '-',
      'Age Of Property': item.ageOfProperty || '-',
      Structure: item.structure || '-',
      Address: item.propertyNo || '-',
      Colony: item.colony || '-',
      Landmark: item.landmark || '-',
      City: item.city || '-',
      District: item.district || '-',
      'Area Of Work': item.areaOfWork || '-',
      'Years Of Working': item.yearsOfWorking || '-',
      'Deal Date': item.dealDate ? moment(item.dealDate).format('DD MMM YYYY') : '-',
      'Sold Amount': item.soldAmount || '-',
      'Rental Income': item.isOnRentalIncome ? 'Yes' : 'No',
      Remark: item.remark || '-',
      Latitude: item.latitude || '-',
      Longitude: item.longitude || '-',
      'Land Area': item.landArea || '',
      Created: moment(item.created_at).format('DD MMM YYYY HH:mm'),
      'Created By': item.createdBy?.name || '-',
      'Updated By': item.updatedBy?.name || '-',
      Verified: item.isVerify ? 'Yes' : 'No',
    }))

    const worksheet = XLSX.utils.json_to_sheet(formattedData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Property Data')

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    })

    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
    saveAs(blob, `Properties_${moment().format('YYYY-MM-DD_HH-mm')}.xlsx`)
  }

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
        <PropertyFilter
          filterData={filterData}
          setFilterData={setFilterData}
          onFilter={handleFilter}
          onReset={handleReset}
        />
      )}
      <CCard className="mb-2">
        <CCardHeader>
          <div className="d-flex justify-content-between align-items-center">
            <span>All Property Pins</span>
            <span style={{ display: 'flex', gap: '10px' }}>
              <CButton onClick={() => setIsFilter(!isFilter)} className="concorn">
                {!isFilter ? 'Open Filter' : 'Close Filter'}
              </CButton>
              <CButton className="add_new" onClick={exportToExcel}>
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
          <span>Are you sure you want to delete this property?</span>
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
        title="Are you sure you want to verify this PIN?"
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
            <h5 className="mb-0">Property Details</h5>
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
    </CContainer>
  )
}

export default All

