import { cilPencil, cilSpreadsheet, cilTrash, cilCloudDownload } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CButton, CContainer, CSpinner, CCard, CCardBody, CFormInput, CFormLabel, CRow, CCol } from '@coreui/react'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import SubHeader from 'src/components/custom/SubHeader'
import { RowsPerPage } from 'src/constants/variables'
import HelperFunction from '../../helpers/HelperFunctions'
import { handleSelectedRowChange, setSelectedRowForModule } from 'src/helpers/paginationCookie'
import { DeleteModal } from 'src/helpers/deleteModalHelper'
import BasicProvider from 'src/constants/BasicProvider'
import CustomTooltip from 'src/components/custom/CustomTooltip'
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import { toast } from 'react-toastify'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'


var subHeaderItems = [
  {
    name: 'All Banks',
    link: '/bank/all',
    icon: cilSpreadsheet,
  },
  {
    name: 'Create Bank',
    link: '/bank/create',
    icon: cilPencil,
  },
  {
    name: 'Trash Banks',
    link: '/bank/trash',
    icon: cilTrash,
  },
]



const all = () => {
  const navigate = useNavigate()
  const [rowPerPage, setRowPerPage] = useState(20)
  const location = useLocation()
  const [userId, setuserId] = useState([])
  const [visible, setVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchcurrentPage, setSearchCurrentPage] = useState(null)
  const query = new URLSearchParams(location.search)
  var count = query.get('count') || rowPerPage
  var currentPage = parseInt(query.get('page') || 1)
  var search = query.get('search') || ''
  let [defaultPage, setDefaultPage] = useState(currentPage)
  const dispatch = useDispatch()
  const data = useSelector((state) => state.data?.banks)
  const toggleCleared = useSelector((state) => state.toggleCleared)
  const totalCount = useSelector((state) => state.totalCount)

  const [isUpdateQueryParams, setIsUpdateQueryParams] = useState(false)
  const [empannelledDoneByFilter, setEmpannelledDoneByFilter] = useState('')
  const [employeeNameFilter, setEmployeeNameFilter] = useState('')
  const [expiryFromDate, setExpiryFromDate] = useState('')
  const [expiryToDate, setExpiryToDate] = useState('')
  const [showExpiredOnly, setShowExpiredOnly] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [downloadingZip, setDownloadingZip] = useState({})
  const [rowsWithDocuments, setRowsWithDocuments] = useState({})

  const token = Cookies.get(`${process.env.REACT_APP_COOKIE_PREFIX}_auth`)
  const decoded = token ? jwtDecode(token) : null
  const userRole = decoded?.role?.[0]?.name || ''
  const COO = process.env.REACT_APP_COO
  const HR = process.env.REACT_APP_HR
  const AC = process.env.REACT_APP_AC || 'ac' // Adjust based on your AC role constant
  const ADMIN = process.env.REACT_APP_ADMIN
  
  const showFilters = userRole === COO || userRole === HR || userRole === AC || userRole === ADMIN
  const isClientSideFilteredMode = showExpiredOnly || !!expiryFromDate || !!expiryToDate

  const isExpiredFinance = (endDate) => {
    if (!endDate) return false
    const end = moment(endDate).startOf('day')
    const today = moment().startOf('day')
    return end.isValid() && end.isBefore(today)
  }

  const applyExpiryFilters = (rows) => {
    return (rows || []).filter((row) => {
      const endDate = row?.agreement_end_date
      if (!endDate) return false

      const end = moment(endDate).startOf('day')
      if (!end.isValid()) return false

      if (showExpiredOnly && !isExpiredFinance(endDate)) return false

      if (expiryFromDate) {
        const from = moment(expiryFromDate).startOf('day')
        if (from.isValid() && end.isBefore(from)) return false
      }

      if (expiryToDate) {
        const to = moment(expiryToDate).startOf('day')
        if (to.isValid() && end.isAfter(to)) return false
      }

      return true
    })
  }

  const parseDateValue = (value) => {
    if (!value) return null
    const m = moment(value)
    return m.isValid() ? m.toDate() : null
  }

  const toISODate = (date) => {
    if (!date) return ''
    return moment(date).format('YYYY-MM-DD')
  }

  const updatePageQueryParam = (paramName, page) => {
    if (isUpdateQueryParams) {

      const searchParams = new URLSearchParams(location.search)
      searchParams.set(paramName, page)
      navigate({ search: searchParams.toString() })
    }
    setIsUpdateQueryParams(true)
  }


  useEffect(() => {
    if (rowPerPage) {
      fetchData()
    }
  }, [
    currentPage,
    rowPerPage,
    searchcurrentPage,
    search,
    empannelledDoneByFilter,
    employeeNameFilter,
    expiryFromDate,
    expiryToDate,
    showExpiredOnly,
  ])

  const fetchData = async () => {
    try {
      let performSearch = false
      var queryData = {}
      for (const [key, value] of query.entries()) {
        if (key !== 'page' && key !== 'count') {
          queryData[key] = value
          if (value !== '' && value !== null) {
            performSearch = true
          }
        }
      }
      
      // Add filter parameters
      if (empannelledDoneByFilter) {
        queryData['empannelled_done_by'] = empannelledDoneByFilter
        performSearch = true
      }
      if (employeeNameFilter) {
        queryData['employee_name'] = employeeNameFilter
        performSearch = true
      }
      
      var response
      if (performSearch) {
        queryData['page'] = isClientSideFilteredMode ? 1 : currentPage
        queryData['count'] = isClientSideFilteredMode ? 5000 : count
        response = await new BasicProvider(
          `banks/search?${HelperFunction.convertToQueryString(queryData)}`,
        ).getRequest()
      } else {
        response = await new BasicProvider(
          `banks?page=${isClientSideFilteredMode ? 1 : currentPage}&count=${isClientSideFilteredMode ? 5000 : count}`,
        ).getRequest()
      }

      let rows = response?.data?.data || []
      if (isClientSideFilteredMode) {
        rows = applyExpiryFilters(rows)
      }

      // Check which rows have documents and store in state
      const documentMap = {}
      rows.forEach(bank => {
        const hasDocs = !!(
          (bank.featured_image?.filepath && bank.featured_image.filepath.trim() !== '') ||
          (bank.featured_pdf?.filepath && bank.featured_pdf.filepath.trim() !== '') ||
          (bank.featured_doc?.filepath && bank.featured_doc.filepath.trim() !== '') ||
          (bank.featured_word?.filepath && bank.featured_word.filepath.trim() !== '') ||
          (bank.stamp_file?.filepath && bank.stamp_file.filepath.trim() !== '') ||
          (bank.agreement_file?.filepath && bank.agreement_file.filepath.trim() !== '') ||
          (bank.fee_estimate_file?.filepath && bank.fee_estimate_file.filepath.trim() !== '')
        )
        if (bank._id) {
          documentMap[bank._id] = hasDocs
        }
      })
      setRowsWithDocuments(documentMap)
      
      dispatch({ type: 'set', data: { banks: rows } })
      dispatch({ type: 'set', totalCount: isClientSideFilteredMode ? rows.length : response.data.total })
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)

    }
  }

  useEffect(() => {
    const fetchSelectedRows = async () => {
      const savedSelectedRows = await handleSelectedRowChange('banks')
      if (savedSelectedRows && !count) {
        setRowPerPage(savedSelectedRows)
      } else {
        setRowPerPage(count)
      }
    }
    fetchSelectedRows()
  }, [count])

  const handleRowChange = useCallback((state) => {
    const rows = state.selectedRows
    const rowsId = rows.map((item) => item._id)
    dispatch({ type: 'set', selectedrows: rowsId })
  }, [])

  const handleFilter = async (search) => {
    try {
      const searchParams = new URLSearchParams(location.search)
      if (search) searchParams.set('search', search)
      navigate({ search: searchParams.toString() })
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }


  const handleFilterReset = async () => {
    setSearchCurrentPage(1)
    currentPage = 1
    setDefaultPage(1)
    setEmpannelledDoneByFilter('')
    setEmployeeNameFilter('')
    setExpiryFromDate('')
    setExpiryToDate('')
    setShowExpiredOnly(false)
    navigate({ search: '' })
  }

  const handleDownloadExcel = async () => {
    if (!data || data.length === 0) {
      toast.warning('No data to export')
      return
    }

    setIsExporting(true)
    try {
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Finance Data')

      // Define columns
      worksheet.columns = [
        { header: 'Finance Name', key: 'name', width: 30 },
        { header: 'Finance Type', key: 'finance_type', width: 20 },
        { header: 'Empanelled With', key: 'empannelled_with', width: 25 },
        { header: 'RC Name', key: 'rc_name', width: 20 },
        { header: 'Empanelled Done By', key: 'empannelled_done_by', width: 25 },
        { header: 'Agreement Start Date', key: 'agreement_start_date', width: 20 },
        { header: 'Agreement End Date', key: 'agreement_end_date', width: 20 },
        { header: 'Created At', key: 'created_at', width: 20 },
      ]

      // Style header row
      worksheet.getRow(1).font = { bold: true }
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      }

      // Add data rows
      data.forEach((row) => {
        worksheet.addRow({
          name: row.name || '-',
          finance_type: row.finance_type?.name || '-',
          empannelled_with: row.empannelled_with || '-',
          rc_name: row.rc_name || '-',
          empannelled_done_by: row.empannelled_done_by || '-',
          agreement_start_date: row.agreement_start_date
            ? moment(row.agreement_start_date).format('DD-MM-YYYY')
            : '-',
          agreement_end_date: row.agreement_end_date
            ? moment(row.agreement_end_date).format('DD-MM-YYYY')
            : '-',
          created_at: row.created_at ? moment(row.created_at).format('DD-MM-YYYY HH:mm:ss') : '-',
        })
      })

      // Generate buffer and download
      const buffer = await workbook.xlsx.writeBuffer()
      const excelBuffer = buffer instanceof ArrayBuffer ? buffer : buffer?.buffer
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })

      const fileName = `Finance_Data_${moment().format('YYYY-MM-DD')}.xlsx`
      saveAs(blob, fileName)
      // Don't use Redux `validations` for success — AlertHelper always shows toast.error for validations
      toast.success('Excel file downloaded successfully')
    } catch (error) {
      console.error('Error exporting Excel:', error)
      toast.error('Failed to export Excel file')
    } finally {
      setIsExporting(false)
    }
  }

  const handleDownloadDocumentsZip = async (row) => {
    if (!row?._id) return

    setDownloadingZip((prev) => ({ ...prev, [row._id]: true }))

    try {
      const getFileExtension = (value) => {
        if (!value || typeof value !== 'string') return ''
        const clean = value.split('?')[0].split('#')[0]
        const lastDot = clean.lastIndexOf('.')
        return lastDot >= 0 ? clean.slice(lastDot) : ''
      }

      const ensureFileName = (preferredName, fallbackBase, filepath) => {
        const preferred = typeof preferredName === 'string' ? preferredName.trim() : ''
        const extFromPreferred = getFileExtension(preferred)
        const extFromPath = getFileExtension(filepath)
        if (preferred) {
          return extFromPreferred ? preferred : `${preferred}${extFromPath}`
        }
        return `${fallbackBase}${extFromPath}`
      }

      // Fetch full bank data to get all document references
      const response = await new BasicProvider(`banks/show/${row._id}`).getRequest()
      const bankData = response.data

      // Collect all document filepaths
      const documents = []
      
      if (bankData.featured_image?.filepath) {
        documents.push({ 
          filepath: bankData.featured_image.filepath, 
          name: 'blank-pdf.pdf',
          originalName: bankData.featured_image.original_name || 'blank-pdf.pdf'
        })
      }
      if (bankData.featured_pdf?.filepath) {
        documents.push({ 
          filepath: bankData.featured_pdf.filepath, 
          name: 'featured-pdf.pdf',
          originalName: bankData.featured_pdf.original_name || 'featured-pdf.pdf'
        })
      }
      if (bankData.featured_doc?.filepath) {
        documents.push({ 
          filepath: bankData.featured_doc.filepath, 
          name: 'featured-doc',
          originalName: ensureFileName(
            bankData.featured_doc.original_name,
            'featured-doc',
            bankData.featured_doc.filepath,
          )
        })
      }
      if (bankData.featured_word?.filepath) {
        documents.push({ 
          filepath: bankData.featured_word.filepath, 
          name: 'featured-word',
          originalName: ensureFileName(
            bankData.featured_word.original_name,
            'featured-word',
            bankData.featured_word.filepath,
          )
        })
      }
      if (bankData.stamp_file?.filepath) {
        documents.push({ 
          filepath: bankData.stamp_file.filepath, 
          name: 'stamp-file',
          originalName: ensureFileName(
            bankData.stamp_file.original_name,
            'stamp-file',
            bankData.stamp_file.filepath,
          )
        })
      }
      if (bankData.agreement_file?.filepath) {
        documents.push({ 
          filepath: bankData.agreement_file.filepath, 
          name: 'agreement-file.pdf',
          originalName: bankData.agreement_file.original_name || 'agreement-file.pdf'
        })
      }
      if (bankData.fee_estimate_file?.filepath) {
        documents.push({ 
          filepath: bankData.fee_estimate_file.filepath, 
          name: 'fee-estimate-file.pdf',
          originalName: bankData.fee_estimate_file.original_name || 'fee-estimate-file.pdf'
        })
      }

      if (documents.length === 0) {
        toast.warning('No documents found for this finance')
        setDownloadingZip((prev) => ({ ...prev, [row._id]: false }))
        return
      }

      const zip = new JSZip()

      // Fetch signed URLs for all documents
      const urlPromises = documents.map(async (doc) => {
        try {
          const response = await new BasicProvider(
            `cms/files/signed-url?key=${doc.filepath}&download=true`,
            dispatch,
          ).getRequest()
          return { 
            url: response.data.url, 
            name: doc.originalName || doc.name,
            filepath: doc.filepath
          }
        } catch (error) {
          console.error(`Error fetching signed URL for ${doc.filepath}:`, error)
          return null
        }
      })

      const filesToDownload = (await Promise.all(urlPromises)).filter(Boolean)

      if (filesToDownload.length === 0) {
        toast.error('Failed to fetch document URLs')
        setDownloadingZip((prev) => ({ ...prev, [row._id]: false }))
        return
      }

      // Download and add files to zip
      for (const file of filesToDownload) {
        try {
          const response = await fetch(file.url)
          if (!response.ok) {
            console.error(`Failed to fetch ${file.name}: ${response.statusText}`)
            continue
          }
          const blob = await response.blob()
          zip.file(file.name, blob)
        } catch (error) {
          console.error(`Error downloading ${file.name}:`, error)
        }
      }

      // Generate and save zip file
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const fileName = `${row.name || 'finance'}_documents_${moment().format('YYYY-MM-DD')}.zip`
      saveAs(zipBlob, fileName)
      
      toast.success('Documents downloaded successfully!')
    } catch (error) {
      console.error('Error creating ZIP file:', error)
      toast.error('Failed to download documents. Please try again.')
    } finally {
      setDownloadingZip((prev) => ({ ...prev, [row._id]: false }))
    }
  }

  // Helper function to check if row has any documents
  const hasDocuments = (row) => {
    if (!row) return false
    
    // Check if any document field exists and has a valid filepath (not empty, not null, not undefined)
    const checkDocument = (doc) => {
      if (!doc) return false
      // Must have filepath and it should be a non-empty string
      return doc.filepath && 
             typeof doc.filepath === 'string' && 
             doc.filepath.trim() !== '' &&
             doc.filepath !== 'null' &&
             doc.filepath !== 'undefined'
    }
    
    return !!(
      checkDocument(row.featured_image) ||
      checkDocument(row.featured_pdf) ||
      checkDocument(row.featured_doc) ||
      checkDocument(row.featured_word) ||
      checkDocument(row.stamp_file) ||
      checkDocument(row.agreement_file) ||
      checkDocument(row.fee_estimate_file)
    )
  }

  const columns = [
    {
      name: 'Name',
      selector: (row) => (
        <div onClick={() => row?._id && navigate(`/bank/${row._id}/detail`)} className="data_table_colum">
          {row && row.name ? row.name : '-'}
        </div>
      ),
    },

    {
      name: 'Type',
      selector: (row) => (
        <div className="data_table_colum">
          {row && row.finance_type && row.finance_type.name ? row.finance_type.name : '-'}
        </div>
      ),
    },

    {
      name: 'RC Name',
      selector: (row) => (
        <div className="data_table_colum">
          {row && row.rc_name ? row.rc_name : '-'}
        </div>
      ),
    },

    {
      name: 'Created',
      cell: (row) => (
        <CustomTooltip content={row?.created_at ? moment(row.created_at).format('DD MMM YYYY HH:mm:ss') : '-'}>
          <div style={{ padding: '5px 10px' }}>
            <div className="data_table_colum">
              {(() => {
                const raw =
                  row?.created_at ||
                  row?.createdAt ||
                  row?.created ||
                  row?.created_date ||
                  row?.createdDate

                if (!raw) return '-'
                const m = moment(raw)
                return m.isValid() ? m.format('DD MMM YYYY') : '-'
              })()}
            </div>
          </div>
        </CustomTooltip>
      ),
    },

    {
      name: 'Actions',
      cell: (row) => (
        <div className="action-btn">
          <div>
            <CButton
              onClick={() => row?._id && navigate(`/bank/${row._id}/calculation`)}
              variant='ghost'
              color='success'
              size='sm'
            >
              Calculation
            </CButton>
          </div>
          <div className="edit-btn">
            <CIcon
              className="pointer_cursor"
              icon={cilPencil}
              onClick={() => row?._id && navigate(`/bank/${row._id}/edit`, { state: { id: row._id } })}
            />
          </div>

          {rowsWithDocuments[row._id] && (
            <div className="download-btn">
              <CIcon
                className="pointer_cursor"
                icon={cilCloudDownload}
                onClick={() => handleDownloadDocumentsZip(row)}
                style={{ 
                  opacity: downloadingZip[row._id] ? 0.5 : 1,
                  cursor: downloadingZip[row._id] ? 'wait' : 'pointer'
                }}
                title="Download all documents"
              />
              {downloadingZip[row._id] && (
                <CSpinner size="sm" style={{ marginLeft: '5px' }} />
              )}
            </div>
          )}

          <div className="delet-btn">
            <CIcon
              className="pointer_cursor"
              icon={cilTrash}
              onClick={() => {
                if (row?._id) {
                  setVisible(true);
                  setuserId([row._id]);
                }
              }}
            />
          </div>
        </div>
      ),
      width: '20%',
      ignoreRowClick: true,
      allowOverflow: true,
      button: 'true',
    },
  ];

  return (
    <>
      <SubHeader
        subHeaderItems={subHeaderItems}
        handleFilter={(search) => handleFilter(search)}
        setSearchCurrentPage={setSearchCurrentPage}
        onReset={() => handleFilterReset()}
        searchInput={search}
        rowPerPage={rowPerPage}
        defaultPage={defaultPage}
        moduleName="banks"
        deletionType="trash"
      />

      <CContainer fluid>
        <>
          {showFilters && (
            <CCard className="mb-3">
              <CCardBody>
                <CRow className="g-3">
                  <CCol md={4}>
                    <CFormLabel>Filter by Empanelled Done By</CFormLabel>
                    <CFormInput
                      type="text"
                      placeholder="Enter employee name"
                      value={empannelledDoneByFilter}
                      onChange={(e) => setEmpannelledDoneByFilter(e.target.value)}
                    />
                  </CCol>
                  <CCol md={4}>
                    <CFormLabel>Filter by Employee Name</CFormLabel>
                    <CFormInput
                      type="text"
                      placeholder="Enter employee name"
                      value={employeeNameFilter}
                      onChange={(e) => setEmployeeNameFilter(e.target.value)}
                    />
                  </CCol>
                  <CCol md={2}>
                    <CFormLabel>Agreement End From</CFormLabel>
                    <DatePicker
                      selected={parseDateValue(expiryFromDate)}
                      onChange={(date) => setExpiryFromDate(toISODate(date))}
                      dateFormat="dd-MM-yyyy"
                      placeholderText="From date"
                      className="form-control"
                      isClearable
                      maxDate={parseDateValue(expiryToDate) || undefined}
                      popperPlacement="bottom-start"
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                    />
                  </CCol>
                  <CCol md={2}>
                    <CFormLabel>Agreement End To</CFormLabel>
                    <DatePicker
                      selected={parseDateValue(expiryToDate)}
                      onChange={(date) => setExpiryToDate(toISODate(date))}
                      dateFormat="dd-MM-yyyy"
                      placeholderText="To date"
                      className="form-control"
                      isClearable
                      minDate={parseDateValue(expiryFromDate) || undefined}
                      popperPlacement="bottom-start"
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                    />
                  </CCol>
                  <CCol md={12} className="d-flex align-items-end flex-wrap gap-2">
                    <CButton
                      color={showExpiredOnly ? 'warning' : 'dark'}
                      onClick={() => setShowExpiredOnly((prev) => !prev)}
                    >
                      {showExpiredOnly ? 'Showing Expired' : 'Show All Expired Finance'}
                    </CButton>
                    <CButton
                      color="secondary"
                      onClick={handleFilterReset}
                    >
                      Reset Filters
                    </CButton>
                    <CButton
                      color="success"
                      onClick={handleDownloadExcel}
                      disabled={isExporting || !data || data.length === 0}
                    >
                      {isExporting ? <CSpinner size="sm" /> : 'Download Excel'}
                    </CButton>
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
          )}

          {!isLoading ? (
            <div className="datatable mb-4">
              <DataTable
                responsive="true"
                columns={columns}
                data={data}
                paginationServer={!isClientSideFilteredMode}
                paginationTotalRows={!isClientSideFilteredMode ? totalCount : undefined}
                paginationDefaultPage={defaultPage}
                onChangePage={(page) => {
                  if (isClientSideFilteredMode) return
                  currentPage = page
                  setDefaultPage(parseInt(page))
                  updatePageQueryParam('page', currentPage)
                }}
                pagination
                selectableRows
                selectableRowsHighlight
                highlightOnHover
                paginationRowsPerPageOptions={RowsPerPage}
                paginationPerPage={rowPerPage}
                onChangeRowsPerPage={(value) => {
                  count = value
                  setRowPerPage(value)
                  updatePageQueryParam('count', value)
                  setSelectedRowForModule('banks', value)
                }}
                onSelectedRowsChange={(state) => handleRowChange(state)}
                clearSelectedRows={toggleCleared}
              />
            </div>
          ) : (
            <div className="text-center">
              <CSpinner size="sm" style={{ width: '3rem', height: '3rem' }} />
              <p>Loading..</p>
            </div>
          )}
        </>

        <DeleteModal
          visible={visible}
          userId={userId}
          moduleName="banks"
          currentPage={currentPage}
          rowPerPage={rowPerPage}
          setVisible={setVisible}
          deletionType="trash"
          handleClose={() => setVisible(false)}
        />
      </CContainer>
    </>
  )
}

export default all
