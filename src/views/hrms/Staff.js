import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter } from '@coreui/react'

import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useWelcomeLetterGenerator } from '../../components/WelcomeLetterGenerator'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CButton,
  CRow,
  CBadge,
  CFormSelect,
  CSpinner,
  CAlert,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CFormCheck,
} from '@coreui/react'
import {
  cilUser,
  cilEnvelopeClosed,
  cilPhone,
  cilLocationPin,
  cilFilter,
  cilPlus,
  cilReload,
  cilCheckCircle,
  cilXCircle,
  cilArrowTop,
  cilArrowBottom,
  cilInfo,
  cilFile,
  cilTrash,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import DataTable from 'src/components/custom/table/AppDataTable'
import AppTableSkeleton from 'src/components/custom/table/AppTableSkeleton'
import moment from 'moment'
import BasicProvider from 'src/constants/BasicProvider'
import { fetchCompanies } from 'src/helpers/companyHelper'
import { handleSelectedRowChange } from 'src/helpers/paginationCookie'
import usePermissions from '../../hooks/usePermissions'
import * as XLSX from 'xlsx-js-style'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

const Staff = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(true)
  const [sortColumn, setSortColumn] = useState(null)
  const [sortDirection, setSortDirection] = useState('asc')

  // Initialize Welcome Letter Generator using custom hook
  const { generateWelcomeLetter } = useWelcomeLetterGenerator()
  // Get user permissions
  const { isHR, isADMIN } = usePermissions()

  const [staffData, setStaffData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [selectedLocation, setSelectedLocation] = useState('')
  const [rowPerPage, setRowPerPage] = useState(20)
  const [totalCount, setTotalCount] = useState(0)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  // Dynamic data states
  const [managers, setManagers] = useState([])
  const [roles, setRoles] = useState([])
  const [companyOptions, setCompanyOptions] = useState([{ value: '', label: 'Select Company' }])
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [filterRole, setFilterRole] = useState('')
  const [filterStatus, setFilterStatus] = useState('active')
  const [excelModal, setExcelModal] = useState(false)
  const [dataForExcel, setdataForExcel] = useState([])

  const [selectedFields, setSelectedFields] = useState([])
  const [filterActive, setFilterActive] = useState(false)
  const [filterInactive, setFilterInactive] = useState(false)
  
  // Delete Employee States
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState(null)
  const [deleteStep, setDeleteStep] = useState(1)
  const [deleteReason, setDeleteReason] = useState('')
  const [deleteReasonOther, setDeleteReasonOther] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  // Create managers map for ID to name mapping
  const managersMap = useMemo(() => {
    const map = {}
    managers.forEach((m) => {
      if (m._id && m.name) {
        map[m._id] = m.name
      }
    })
    return map
  }, [managers])

 const ALL_FIELDS = useMemo(() => [
  // ================= BASIC =================
  {
    key: 'name',
    label: 'Name',
    getValue: (i) => i?.name || 'N/A',
  },
  {
    key: 'email',
    label: 'User Login ID',
    getValue: (i) => i?.email || 'N/A',
  },
  {
    key: 'open_password',
    label: 'Password',
    getValue: (i) => i?.open_password || 'N/A',
  },
  {
    key: 'mobile',
    label: 'Contact Number',
    getValue: (i) => i?.mobile || i?.profile?.mobile_primary || 'N/A',
  },
  {
    key: 'gender',
    label: 'Gender',
    getValue: (i) => i?.gender || 'N/A',
  },

  // ================= ROLE & STATUS =================
  {
    key: 'role',
    label: 'Employee Role',
    getValue: (i) =>
      i?.role?.length ? i.role.map(r => r.display_name).join(', ') : 'N/A',
  },
  {
    key: 'status',
    label: 'Status',
    getValue: (i) => i?.status || 'N/A',
  },

  // ================= RA =================
  {
    key: 'ra_branch',
    label: 'RA Branch',
    getValue: (i) =>
      i?.ra_branch?.length ? i.ra_branch.map(b => b.name).join(', ') : 'N/A',
  },
  {
    key: 'ra_location',
    label: 'RA Location',
    getValue: (i) => {
      const raLoc = i?.profile?.ra_location
      if (!raLoc) return 'N/A'
      if (typeof raLoc === 'string') return raLoc
      return raLoc.label || 'N/A'
    },
  },

  // ================= WORK =================
  {
    key: 'location',
    label: 'Work Location',
    getValue: (i) => i?.profile?.location || 'N/A',
  },
  {
    key: 'department',
    label: 'Department',
    getValue: (i) => i?.profile?.department || 'N/A',
  },
  {
    key: 'reporting_manager',
    label: 'Reporting Manager',
    getValue: (i) => {
      const profile = i?.profile || i?.user?.profile
      if (!profile) return 'N/A'
      
      // Check if reporting_manager is already a name (string)
      if (typeof profile.reporting_manager === 'string' && profile.reporting_manager.length > 0) {
        // Check if it's an ObjectId (24 char hex) or a name
        if (profile.reporting_manager.length === 24 && /^[a-f0-9]{24}$/i.test(profile.reporting_manager)) {
          // It's an ID, map it
          return managersMap[profile.reporting_manager] || profile.reporting_manager_name || 'N/A'
        }
        // It's already a name
        return profile.reporting_manager
      }
      
      // Try to get from reporting_manager_id
      if (profile.reporting_manager_id) {
        return managersMap[profile.reporting_manager_id] || 'N/A'
      }
      
      // Fallback to reporting_manager_name if available
      return profile.reporting_manager_name || 'N/A'
    },
  },
  {
    key: 'leave_authority_one',
    label: 'Leave Authority 1',
    getValue: (item) => {
      const profile = item?.profile || item?.user?.profile
      if (!profile) return 'N/A'
      
      // First try leaveAuthorityOne_Name (if already populated)
      if (profile.leaveAuthorityOne_Name) {
        return profile.leaveAuthorityOne_Name
      }
      
      // If not, try to map from leaveAuthorityOne ID
      if (profile.leaveAuthorityOne) {
        const leaveAuthId = String(profile.leaveAuthorityOne).trim()
        // Check if it's an ObjectId (24 char hex)
        if (leaveAuthId.length === 24 && /^[a-f0-9]{24}$/i.test(leaveAuthId)) {
          // It's an ID, map it
          return managersMap[leaveAuthId] || 'N/A'
        }
        // If it's not an ObjectId, it might already be a name
        return leaveAuthId || 'N/A'
      }
      
      return 'N/A'
    },
  },
  {
    key: 'leave_authority_two',
    label: 'Leave Authority 2',
    getValue: (item) => {
      const profile = item?.profile || item?.user?.profile
      if (!profile) return 'N/A'
      
      // First try leaveAuthorityTwo_Name (if already populated)
      if (profile.leaveAuthorityTwo_Name) {
        return profile.leaveAuthorityTwo_Name
      }
      
      // If not, try to map from leaveAuthorityTwo ID
      if (profile.leaveAuthorityTwo) {
        const leaveAuthId = String(profile.leaveAuthorityTwo).trim()
        // Check if it's an ObjectId (24 char hex)
        if (leaveAuthId.length === 24 && /^[a-f0-9]{24}$/i.test(leaveAuthId)) {
          // It's an ID, map it
          return managersMap[leaveAuthId] || 'N/A'
        }
        // If it's not an ObjectId, it might already be a name
        return leaveAuthId || 'N/A'
      }
      
      return 'N/A'
    },
  },

  {
    key: 'employee_type',
    label: 'Employee Type',
    getValue: (i) => i?.profile?.employee_type || 'N/A',
  },
  {
    key: 'work_type',
    label: 'Work Type',
    getValue: (i) => i?.profile?.work_type || 'N/A',
  },
  {
    key: 'shift',
    label: 'Shift',
    getValue: (i) => i?.profile?.shift || 'N/A',
  },

  // ================= DATES =================
  {
    key: 'joining_date',
    label: 'Date of Joining',
    getValue: (i) =>
      i?.profile?.joining_date ? i.profile.joining_date.split('T')[0] : 'N/A',
  },
  {
    key: 'joining_year',
    label: 'Joining Year',
    getValue: (i) =>
      i?.profile?.joining_date
        ? new Date(i.profile.joining_date).getFullYear()
        : 'N/A',
  },
  {
    key: 'dob',
    label: 'DOB',
    getValue: (i) =>
      i?.profile?.dob ? i.profile.dob.split('T')[0] : 'N/A',
  },

  // ================= PERSONAL =================
  {
    key: 'father_name',
    label: 'Father Name',
    getValue: (i) => i?.profile?.father_name || 'N/A',
  },
  {
    key: 'marital_status',
    label: 'Marital Status',
    getValue: (i) => i?.profile?.marital_status || 'N/A',
  },
  {
    key: 'blood_group',
    label: 'Blood Group',
    getValue: (i) => {
      const profile = i?.profile || i?.user?.profile
      return profile?.blood_group || 'N/A'
    },
  },
  {
    key: 'anniversary',
    label: 'Anniversary',
    getValue: (i) => i?.profile?.anniversary || 'N/A',
  },

  // ================= COMPANY =================
  {
    key: 'company_name',
    label: 'Company Name',
    getValue: (i) => i?.profile?.company_name || 'N/A',
  },
  {
    key: 'core',
    label: 'Core (Yes/No)',
    getValue: (i) => (i?.profile?.core ? 'Yes' : 'No'),
  },

  // ================= SALARY =================
  {
    key: 'ctc_per_month',
    label: 'Salary',
    getValue: (i) => i?.profile?.ctc_per_month ?? 'N/A',
  },
  {
    key: 'hra_per_month',
    label: 'HRA',
    getValue: (i) => i?.profile?.hra_per_month ?? 'N/A',
  },

  // ================= BANK =================
  {
    key: 'bank_name',
    label: 'Bank Name',
    getValue: (i) => i?.profile?.bank_name || 'N/A',
  },
  {
    key: 'account_number',
    label: 'Bank AC Number',
    getValue: (i) => i?.profile?.account_number || 'N/A',
  },
  {
    key: 'ifsc_code',
    label: 'Bank IFSC',
    getValue: (i) => i?.profile?.ifsc_code || 'N/A',
  },

  // ================= ADDRESS =================
  {
    key: 'permanent_address',
    label: 'Permanent Address',
    getValue: (i) => i?.profile?.permanent_address?.address_line || 'N/A',
  },
  {
    key: 'current_address',
    label: 'Current Address',
    getValue: (i) => i?.profile?.current_address?.address_line || 'N/A',
  },

  // ================= DOCS =================
  {
    key: 'aadhar_no',
    label: 'Aadhar Card',
    getValue: (i) => i?.profile?.aadhar_no || 'N/A',
  },
  {
    key: 'pan_no',
    label: 'PAN Card',
    getValue: (i) => i?.profile?.pan_no || 'N/A',
  },
], [managersMap])


  function getValue(obj, path, transform, customGetter) {
    try {
      if (!obj) return 'N/A'

      // If custom getter function is provided, use it first and ALWAYS use its result
      if (customGetter && typeof customGetter === 'function') {
        const customValue = customGetter(obj)
        // If custom getter returns a value (including 'N/A'), use it
        if (customValue !== undefined && customValue !== null) {
          // Handle objects returned by custom getter
          if (typeof customValue === 'object' && !Array.isArray(customValue)) {
            if (customValue.label) return String(customValue.label).trim()
            if (customValue.value) return String(customValue.value).trim()
            if (customValue.name) return String(customValue.name).trim()
            return 'N/A'
          }
          // Return the value (including 'N/A' string or empty string)
          // Convert to string to ensure Excel compatibility
          const stringValue = String(customValue).trim()
          return stringValue || 'N/A'
        }
        // If custom getter returns null/undefined, fall through to path-based extraction
      }

      // Nested key handling
      const value = path
        .replace(/\[(\d+)\]/g, '.$1')
        .split('.')
        .reduce((o, key) => (o && o[key] !== undefined ? o[key] : ''), obj)

      // Apply custom transform (Joining Year etc.)
      if (transform) {
        const transformed = transform(value)
        // Ensure transformed value is not an object
        if (typeof transformed === 'object' && transformed !== null && !Array.isArray(transformed)) {
          if (transformed.label) return String(transformed.label).trim()
          if (transformed.value) return String(transformed.value).trim()
          if (transformed.name) return String(transformed.name).trim()
          return 'N/A'
        }
        return transformed
      }

      // Date clean: convert "2025-09-09T14:35:51.616Z" → "2025-09-09"
      if (typeof value === 'string' && value.includes('T')) {
        return value.split('T')[0]
      }

      // Handle objects - if value is an object, try to extract meaningful data
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // If it has a label property, use that
        if (value.label) return String(value.label).trim()
        // If it has a value property, use that
        if (value.value) return String(value.value).trim()
        // If it has a name property, use that
        if (value.name) return String(value.name).trim()
        // Otherwise return N/A to avoid showing [object Object]
        return 'N/A'
      }

      // Handle arrays - if value is an array, join it or get first element
      if (Array.isArray(value)) {
        if (value.length === 0) return 'N/A'
        const firstItem = value[0]
        if (typeof firstItem === 'object' && firstItem !== null) {
          if (firstItem.label) return String(firstItem.label).trim()
          if (firstItem.value) return String(firstItem.value).trim()
          if (firstItem.name) return String(firstItem.name).trim()
          return 'N/A'
        }
        // If firstItem is a string, check if it's an ObjectId
        if (typeof firstItem === 'string') {
          const trimmed = firstItem.trim()
          // If it looks like an ObjectId (24 char hex), don't return it
          if (trimmed.length === 24 && /^[a-f0-9]{24}$/i.test(trimmed)) {
            return 'N/A'
          }
          return trimmed
        }
        return String(firstItem).trim()
      }

      // Final check: if value is a string that looks like an ObjectId, return N/A
      if (typeof value === 'string') {
        const trimmed = value.trim()
        if (trimmed.length === 24 && /^[a-f0-9]{24}$/i.test(trimmed)) {
          return 'N/A'
        }
      }

      return value || 'N/A'
    } catch {
      return 'N/A'
    }
  }

  const handleSort = (columnName) => {
    let newDirection = 'asc'
    if (sortColumn === columnName && sortDirection === 'asc') {
      newDirection = 'desc'
    }

    setSortColumn(columnName)
    setSortDirection(newDirection)

    const sorted = [...filteredData].sort((a, b) => {
      const valueA = (a[columnName] || '').toString().toLowerCase()
      const valueB = (b[columnName] || '').toString().toLowerCase()

      if (newDirection === 'asc') return valueA.localeCompare(valueB)
      return valueB.localeCompare(valueA)
    })

    setFilteredData(sorted)
  }

  const downloadExcel = async () => {
    if (selectedFields.length === 0) {
      toast.error('Please select at least one field')
      return
    }

    if (!dataForExcel || dataForExcel.length === 0) {
      toast.info('No staff data to download')
      return
    }

    // ------------ FILTER LOGIC (Active / Inactive) ----------------
    let finalData = [...dataForExcel]

    // If "Active Only" checkbox selected
    if (filterActive) {
      finalData = finalData.filter((item) => {
        const status = item?.status?.toLowerCase() || item?.user?.status?.toLowerCase()
        return status === 'active'
      })
    }

    // If "Inactive Only" checkbox selected
    if (filterInactive) {
      finalData = finalData.filter((item) => {
        const status = item?.status?.toLowerCase() || item?.user?.status?.toLowerCase()
        return status === 'inactive'
      })
    }

    // Sort selected fields based on ALL_FIELDS order to ensure name comes first
    const actualFields = selectedFields.sort((a, b) => {
      const indexA = ALL_FIELDS.findIndex((f) => f.key === a)
      const indexB = ALL_FIELDS.findIndex((f) => f.key === b)
      // If field not found, put it at the end
      if (indexA === -1) return 1
      if (indexB === -1) return -1
      return indexA - indexB
    })

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Staff List')

    // HEADER ROW
    const headers = actualFields.map((key) => {
      const field = ALL_FIELDS.find((f) => f.key === key)
      return field?.label || key
    })

    worksheet.addRow(headers)

    // HEADER STYLING
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E90FF' },
      }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      }
      cell.alignment = { horizontal: 'center' }
    })

    // BODY ROWS
  
    finalData.forEach((item, index) => {
      const rowData = actualFields.map((key) => {
        const field = ALL_FIELDS.find((f) => f.key === key)
        let value = getValue(item, key, field?.transform, field?.getValue)


        // Ensure value is always a string or primitive for Excel
        if (value === null || value === undefined) {
          value = 'N/A'
        } else if (typeof value === 'object') {
          // If somehow still an object, convert to string safely
          if (value.label) value = String(value.label)
          else if (value.value) value = String(value.value)
          else if (value.name) value = String(value.name)
          else value = 'N/A'
        } else {
          value = String(value)
          // Final check: if value looks like an ObjectId (24 char hex), it's an ID, not a name
          if (key === 'ra_branch' && /^[a-f0-9]{24}$/i.test(value.trim())) {
            value = 'N/A'
          }
          // Check for reporting manager, leave authority IDs and map them
          if ((key === 'reporting_manager' || key === 'leave_authority_one' || key === 'leave_authority_two') 
              && /^[a-f0-9]{24}$/i.test(value.trim())) {
            // It's an ID, try to map it using managersMap
            const mappedName = managersMap[value.trim()]
            value = mappedName || 'N/A'
          }
        }

        return value
      })
      worksheet.addRow(rowData)
    })

    // BODY STYLING
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return

      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        }
        cell.alignment = { vertical: 'middle' }
      })
    })

    // AUTO WIDTH
    worksheet.columns.forEach((column) => {
      let max = 10
      column.eachCell({ includeEmpty: true }, (cell) => {
        const len = cell.value ? cell.value.toString().length : 10
        if (len > max) max = len
      })
      column.width = max + 5
    })

    const buffer = await workbook.xlsx.writeBuffer()
    saveAs(new Blob([buffer]), 'Staff_List.xlsx')
    setExcelModal(false)
  }

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
      const response = await new BasicProvider(
        `admins/get-multiple?slugs=${encodeURIComponent(queryString)}&page=1&count=500`,
      ).getRequest()

      const managerOptions = response.data.map((manager) => ({
        value: manager._id,
        label: manager.name,
        role: manager.role?.display_name || 'Manager',
        _id: manager._id,
        name: manager.name,
      }))
      setManagers([{ value: '', label: 'Select Reporting Manager' }, ...managerOptions])
    } catch (error) {
      console.error('Error fetching managers:', error)
      setManagers([{ value: '', label: 'Select Reporting Manager' }])
    }
  }

  const fetchRoles = async () => {
    try {
      const response = await new BasicProvider('roles?page=1&count=100').getRequest()
      const roleOptions = response.data.data.map((role) => ({
        value: role._id,
        label: role.display_name,
        slug: role.name,
      }))
      setRoles([{ value: '', label: 'Select Role' }, ...roleOptions])
    } catch (error) {
      console.error('Error fetching roles:', error)
      // Fallback to static roles if API fails
      setRoles([
        { value: '', label: 'Select Role' },
        { value: 'admin', label: 'Admin' },
        { value: 'manager', label: 'Manager' },
        { value: 'employee', label: 'Employee' },
        { value: 'hr', label: 'HR' },
        { value: 'supervisor', label: 'Supervisor' },
        { value: 'intern', label: 'Intern' },
      ])
    }
  }

  const fetchCompaniesData = async () => {
    try {
      const companies = await fetchCompanies()
      setCompanyOptions(companies)
    } catch (error) {
      console.error('Error fetching companies:', error)
      // Fallback is already handled in fetchCompanies helper
      setCompanyOptions([{ value: '', label: 'Select Company' }])
    }
  }

  const fetchAllDynamicData = async () => {
    setIsLoadingData(true)
    try {
      await Promise.all([fetchManagers(), fetchCompaniesData()])
    } catch (error) {
      console.error('Error fetching dynamic data:', error)
    } finally {
      setIsLoadingData(false)
    }
  }
  const handleRoleDropdownClick = () => {
    if (roles.length <= 1) {
      fetchRoles()
    }
  }

  const fetchStaffData = async () => {
    if (fetchStaffData.inFlight) return
    fetchStaffData.inFlight = true

    try {
      setIsLoading(true)
      const response = await new BasicProvider(`admins?page=1&count=1000`).getRequest()
      const data = response?.data?.data || []
      setStaffData(data)

      // Only apply filters / totals when not searching
      if (!searchTerm) {
        if (!selectedLocation) {
          setFilteredData(data)
        } else {
          const filtered = data.filter(
            (staff) =>
              staff.location && staff.location.toLowerCase() === selectedLocation.toLowerCase(),
          )
          setFilteredData(filtered)
        }

        setTotalCount(response?.data?.total ?? data.length)
      }
    } catch (error) {
      console.error('Error fetching staff data:', error)
    } finally {
      setIsLoading(false)
      fetchStaffData.inFlight = false
    }
  }
  const FetchdataForExcel = async () => {
    if (FetchdataForExcel.inFlight) return
    FetchdataForExcel.inFlight = true

    try {
      setIsLoading(true)

      // Correct API call
      // const response = await new BasicProvider(`profiles/full?page=1&count=1000`).getRequest()
      const response = await new BasicProvider(`admins?page=1&count=1000`).getRequest()

      // const allData = response?.data || []

        const allData = response?.data?.data || []

      let finalData = allData

      // Filter by location (correct structure)
      if (selectedLocation) {
        finalData = allData.filter((item) => {
          const branchName = item?.user?.profile?.ra_location.toLowerCase() || ''
          return branchName === selectedLocation.toLowerCase()
        })
      }

      // Filter by search term (optional)
      if (searchTerm) {
        finalData = finalData.filter((item) =>
          item?.user?.name?.toLowerCase()?.includes(searchTerm.toLowerCase()),
        )
      }

      setdataForExcel(finalData)
    } catch (error) {
      console.error('Error fetching staff data:', error)
    } finally {
      setIsLoading(false)
      FetchdataForExcel.inFlight = false
    }
  }

  useEffect(() => {
    FetchdataForExcel()
  }, [])

  const initRef = useRef(false)
  useEffect(() => {
    if (initRef.current) return
    initRef.current = true
    if (!searchTerm) {
      fetchStaffData()
    }
  }, [])

  // Handle success message from navigation state
  useEffect(() => {
    if (location.state?.successMessage) {
      // Show success toast
      toast.success(location.state.successMessage, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: 'toast-success-custom',
      })

      setSuccessMessage(location.state.successMessage)
      setShowSuccessAlert(true)

      // Refresh data if needed
      // if (location.state?.refreshData) {
      //   fetchStaffData()
      // }

      // Auto-hide success message after 5 seconds
      const timer = setTimeout(() => {
        setShowSuccessAlert(false)
        setSuccessMessage('')
      }, 5000)

      // Clear location state to prevent showing message on refresh
      // navigate(location.pathname, { replace: true })

      return () => clearTimeout(timer)
    }
  }, [location.state, navigate, location.pathname])

  useEffect(() => {
    const fetchSelectedRows = async () => {
      const savedSelectedRows = await handleSelectedRowChange('staff')
      if (savedSelectedRows) {
        setRowPerPage(savedSelectedRows)
      }
    }
    fetchSelectedRows()
  }, [])

  // Fetch dynamic data on component mount
  useEffect(() => {
    fetchAllDynamicData()
  }, [])

  // Handle filter changes
  useEffect(() => {
    if (!searchTerm) {
      // Only apply role and status filters when not searching
      const filtered = staffData.filter((staff) => {
        const matchesRole =
          !filterRole ||
          staff.role?.some((role) => role.name === filterRole || role.display_name === filterRole)

        const matchesStatus = !filterStatus || staff.status === filterStatus

        return matchesRole && matchesStatus
      })
      setFilteredData(filtered)
      setTotalCount(filtered.length)
    }
  }, [filterRole, filterStatus, staffData, searchTerm])

  // Global search function that searches all data
  const performGlobalSearch = async (term) => {
    if (!term || term.trim() === '') {
      setSearchResults([])
      setFilteredData([])
      setTotalCount(0)
      return
    }

    setIsSearching(true)
    try {
      // Search in all data with a large count to get all results
      const response = await new BasicProvider(
        `admins?page=1&count=1000&search=${encodeURIComponent(term)}`,
      ).getRequest()

      const allData = response.data.data || []
      console.log('All Staff Data', allData)
      // Client-side filtering since backend search is not working properly
      let searchData = allData.filter((staff) => {
        const searchLower = term.toLowerCase()
        return (
          staff.name?.toLowerCase().includes(searchLower) ||
          staff.email?.toLowerCase().includes(searchLower) ||
          staff.mobile?.includes(term) ||
          staff.address?.toLowerCase().includes(searchLower) ||
          staff.gender?.toLowerCase().includes(searchLower) ||
          staff.status?.toLowerCase().includes(searchLower) ||
          (staff.role &&
            staff.role.some(
              (role) =>
                role.name?.toLowerCase().includes(searchLower) ||
                role.display_name?.toLowerCase().includes(searchLower),
            ))
        )
      })

      // Apply role filter to search results
      if (filterRole) {
        searchData = searchData.filter((staff) =>
          staff.role?.some((role) => role.name === filterRole || role.display_name === filterRole),
        )
      }

      // Apply status filter to search results
      if (filterStatus) {
        searchData = searchData.filter((staff) => staff.status === filterStatus)
      }

      setSearchResults(searchData)
      setFilteredData(searchData)
      setTotalCount(searchData.length)
    } catch (error) {
      console.error('Error performing global search:', error)
      toast.error('Search failed. Please try again.')
      setSearchResults([])
      setFilteredData([])
      setTotalCount(0)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchInput = (term) => {
    setSearchTerm(term)
  }

  const mountedRef = useRef(false)
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim() === '') {
        setSearchResults([])
        setFilteredData([])
        setTotalCount(0)
        fetchStaffData()
      } else {
        performGlobalSearch(searchTerm)
      }
    }, 500) // 500ms delay
    return () => clearTimeout(timeoutId)
  }, [searchTerm, filterRole, filterStatus])

  const clearSearch = () => {
    setSearchTerm('')
    setSearchResults([])
    setFilteredData([])
    setTotalCount(0)
    fetchStaffData()
  }

  const handleRowChange = useCallback((state) => {
    const rows = state.selectedRows
  }, [])

  const handleViewProfile = (row) => {
    navigate(`/hrms/staff/profile/${row._id}`)
  }

const handleDeleteEmployee = async () => {
  if (!employeeToDelete || deleteStep !== 3) return

  setIsDeleting(true)
  try {
    // Prepare payload with reason and message as per backend structure
    const payload = {
      reason: deleteReason || 'N/A',
      message: deleteReason === 'Other' 
        ? (deleteReasonOther || '')
        : ''
    }

    const response = await new BasicProvider(
      `profiles/${employeeToDelete._id}/delete-employee`,
    ).deleteRealRequest(payload)
 
    const resData = response?.data || response

    if (resData?.status === 'success') {
      toast.success(resData.message || 'Employee deleted successfully')

      setShowDeleteModal(false)
      setEmployeeToDelete(null)
      setDeleteStep(1)
      setDeleteReason('')
      setDeleteReasonOther('')

      // Refresh list
      fetchStaffData()
      FetchdataForExcel()
    } else {
      throw new Error(resData?.message || 'Failed to delete employee')
    }

  } catch (error) {
    console.error('Error deleting employee:', error)

    toast.error(
      error?.response?.data?.message ||
      error?.message ||
      'Failed to delete employee '
    )
  } finally {
    setIsDeleting(false)
  }
}


  const handleDeleteStepNext = () => {
    if (deleteStep < 3) {
      setDeleteStep(deleteStep + 1)
    }
  }

  const handleDeleteStepBack = () => {
    if (deleteStep > 1) {
      setDeleteStep(deleteStep - 1)
    }
  }

  const handleDeleteModalClose = () => {
    setShowDeleteModal(false)
    setEmployeeToDelete(null)
    setDeleteStep(1)
    setDeleteReason('')
    setDeleteReasonOther('')
  }

  const getStatusColor = (status) => {
    return status === 'active' ? 'success' : 'danger'
  }

  const getRoleColor = (role) => {
    const roleColors = {
      admin: 'danger',
      hr: 'warning',
      manager: 'info',
      employee: 'primary',
      supervisor: 'secondary',
    }
    return roleColors[role?.toLowerCase()] || 'primary'
  }

  const columns = [
    {
      name: (
        <div
          className="d-flex align-items-center"
          onClick={() => handleSort('name')}
          style={{ cursor: 'pointer' }}
        >
          Employee
          {sortColumn === 'name' && sortDirection === 'asc' && (
            <CIcon icon={cilArrowTop} className="ms-1" />
          )}
          {sortColumn === 'name' && sortDirection === 'desc' && (
            <CIcon icon={cilArrowBottom} className="ms-1" />
          )}
        </div>
      ),
      selector: (row) => {
        const createdAt = row.created_at || row.createdAt

        const isNew =
          createdAt && moment(createdAt).isValid() && moment().diff(moment(createdAt), 'months') < 1

        return (
          <div className="d-flex align-items-center">
            <div className="staff-avatar me-3">
              <CIcon icon={cilUser} className="text-primary" size="lg" />
            </div>
            <div>
              <div className="fw-semibold text-dark d-flex align-items-center">
                <span>{row.name || 'N/A'}</span>
                {isNew && (
                  <CBadge color="success" className="ms-2" style={{ fontSize: '10px' }}>
                    NEW
                  </CBadge>
                )}
              </div>
              <small className="text-muted">{row.email || 'N/A'}</small>
            </div>
          </div>
        )
      },
      sortable: false,
      width: '250px',
    },

    {
      name: (
        <div
          className="d-flex align-items-center"
          onClick={() => handleSort('mobile')}
          style={{ cursor: 'pointer' }}
        >
          Contact
        </div>
      ),
      selector: (row) => (
        <div>
          <div className="d-flex align-items-center mb-1">
            <CIcon icon={cilPhone} className="text-success me-2" size="sm" />
            <span>{row.mobile || 'N/A'}</span>
          </div>
          <div className="d-flex align-items-center">
            <CIcon icon={cilEnvelopeClosed} className="text-info me-2" size="sm" />
            <span className="text-muted small">{row.email || 'N/A'}</span>
          </div>
        </div>
      ),
      sortable: false,
      width: '200px',
    },

    {
      name: (
        <div
          className="d-flex align-items-center"
          onClick={() => handleSort('ra_branch')}
          style={{ cursor: 'pointer' }}
        >
          Location
          {sortColumn === 'ra_branch' && sortDirection === 'asc' && (
            <CIcon icon={cilArrowTop} className="ms-1" />
          )}
          {sortColumn === 'ra_branch' && sortDirection === 'desc' && (
            <CIcon icon={cilArrowBottom} className="ms-1" />
          )}
        </div>
      ),
      selector: (row) => {
        const branchName =
          row?.profile?.ra_location?.label ||
          row?.ra_location?.label ||
          row?.profile?.ra_location ||
          row?.ra_location ||
          'Not Assigned'

        return (
          <div className="d-flex align-items-center">
            <CIcon icon={cilLocationPin} className="text-warning me-2" size="sm" />
            <CBadge color="primary" className="rounded-pill">
              {branchName}
            </CBadge>
          </div>
        )
      },
      sortable: false,
      center: true,
      width: '150px',
    },

    {
      name: (
        <div
          className="d-flex align-items-center"
          onClick={() => handleSort('roleName')}
          style={{ cursor: 'pointer' }}
        >
          Role
          {sortColumn === 'roleName' && sortDirection === 'asc' && (
            <CIcon icon={cilArrowTop} className="ms-1" />
          )}
          {sortColumn === 'roleName' && sortDirection === 'desc' && (
            <CIcon icon={cilArrowBottom} className="ms-1" />
          )}
        </div>
      ),
      selector: (row) => {
        const roleName =
          row.role && row.role[0] ? row.role[0].display_name || row.role[0].name : 'N/A'

        row.roleName = roleName // for sorting use

        return (
          <CBadge color={getRoleColor(roleName)} className="rounded-pill">
            {roleName}
          </CBadge>
        )
      },
      sortable: false,
      center: true,
      width: '120px',
    },

    {
      name: (
        <div
          className="d-flex align-items-center"
          onClick={() => handleSort('status')}
          style={{ cursor: 'pointer' }}
        >
          Status
          {sortColumn === 'status' && sortDirection === 'asc' && (
            <CIcon icon={cilArrowTop} className="ms-1" />
          )}
          {sortColumn === 'status' && sortDirection === 'desc' && (
            <CIcon icon={cilArrowBottom} className="ms-1" />
          )}
        </div>
      ),
      selector: (row) => (
        <CBadge color={getStatusColor(row.status)} className="rounded-pill">
          {row.status === 'active' ? 'Active' : 'Inactive'}
        </CBadge>
      ),
      sortable: false,
      center: true,
      width: '100px',
    },

    {
      name: (
        <div
          className="d-flex align-items-center"
          onClick={() => handleSort('created_at', 'date')}
          style={{ cursor: 'pointer' }}
        >
          Joined Date
          {sortColumn === 'created_at' && sortDirection === 'asc' && (
            <CIcon icon={cilArrowTop} className="ms-1" />
          )}
          {sortColumn === 'created_at' && sortDirection === 'desc' && (
            <CIcon icon={cilArrowBottom} className="ms-1" />
          )}
        </div>
      ),
      selector: (row) => (
        <div className="text-center">
          <div className="fw-semibold">
            {row.created_at ? moment(row.created_at).format('DD MMM YYYY') : 'N/A'}
          </div>
          <small className="text-muted">
            {row.created_at ? moment(row.created_at).fromNow() : ''}
          </small>
        </div>
      ),
      sortable: false,
      center: true,
      width: '150px',
    },

    {
      name: 'Actions',
      selector: (row) => (
        <div className="d-flex justify-content-center gap-1 flex-wrap action-buttons">
          <CButton
            color="primary"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleViewProfile(row)
            }}
            className="d-flex align-items-center"
            title="View Profile"
            style={{ minWidth: '70px', fontSize: '12px' }}
          >
            <CIcon icon={cilInfo} className="me-1" />
            View
          </CButton>
          {isADMIN && (
            <CButton
              color="danger"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setEmployeeToDelete(row)
                setDeleteStep(1)
                setDeleteReason('')
                setShowDeleteModal(true)
              }}
              className="d-flex align-items-center"
              title="Delete Employee"
              style={{ minWidth: '70px', fontSize: '12px' }}
            >
              <CIcon icon={cilTrash} className="me-1" />
              Delete
            </CButton>
          )}
        </div>
      ),
      sortable: false,
      center: true,
      width: '250px',
      minWidth: '250px',
    },
  ]

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: '#f8f9fa',
        borderBottom: '2px solid #e9ecef',
        fontWeight: '600',
        fontSize: '14px',
        color: '#495057',
        position: 'sticky',
        top: 0,
        zIndex: 1,
      },
    },
    rows: {
      style: {
        borderBottom: '1px solid #e9ecef',
        '&:hover': {
          backgroundColor: '#f8f9fa',
        },
      },
    },
    cells: {
      style: {
        padding: '12px 8px',
        fontSize: '13px',
      },
    },
    table: {
      style: {
        width: '100%',
        tableLayout: 'fixed',
      },
    },
    tableWrapper: {
      style: {
        overflow: 'visible',
        maxWidth: '100%',
      },
    },
  }

  // All fields are selectable (no filter fields in ALL_FIELDS)
  const selectableFields = ALL_FIELDS
  const isAllSelected =
    selectedFields.length === selectableFields.length &&
    selectableFields.every((f) => selectedFields.includes(f.key))

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedFields([])
    } else {
      setSelectedFields(selectableFields.map((f) => f.key))
    }
    // Ensure inactive filter remains false when selecting all
    setFilterInactive(false)
  }

  return (
    <div className="staff-dashboard">
      {/* Header */}

      <CCard
        className="hr-header mb-4 mt-2"
        style={{ borderRadius: '0px', width: '100%', border: 'none' }}
      >
        <div className="d-flex justify-content-between align-items-center px-4 py-2">
          <div style={{ borderLeft: '4px solid text-dark', paddingLeft: '10px' }}>
            <h2 className="mb-1 fw-bold text-dark">Staff Management</h2>
            <p className="mb-0 text-muted">View and manage all employees across locations</p>
          </div>
          <div className="d-flex align-items-center gap-3">
            {(isHR || isADMIN) && (
              <CButton
                color="primary"
                className="px-3 py-2 rounded-pill d-flex align-items-center"
                onClick={() => navigate('/hrms/addstaff')}
              >
                <CIcon icon={cilPlus} className="me-1" />
                Add Staff
              </CButton>
            )}

            <CButton color="primary" className="px-3 py-2 rounded-pill">
              Total Staff: {totalCount}
            </CButton>
          </div>
        </div>
      </CCard>
      <CContainer className="h-auto" style={{ width: '95%', margin: 'auto' }}>
        {/* Success Alert */}
        {showSuccessAlert && successMessage && (
          <CRow className="mb-4">
            <CCol>
              <CAlert color="success" className="d-flex align-items-center">
                <CIcon icon={cilCheckCircle} className="me-2" />
                {successMessage}
              </CAlert>
            </CCol>
          </CRow>
        )}

        {/* Filter Section */}
        <CCard className="filter-card shadow-sm mb-4">
            <CCardHeader className="filter-header">
              <div className="d-flex align-items-center">
                <CIcon icon={cilFilter} className="me-2 text-primary" />
                <h5 className="mb-0 fw-semibold">Filter Options</h5>
              </div>
            </CCardHeader>

            <CCardBody className="filter-body">
              <CRow className="g-3">
                {/* Search Filter */}
                <CCol md={4}>
                  <CFormLabel className="fw-semibold text-dark mb-2">Search Staff</CFormLabel>
                  <CFormInput
                    placeholder="Search by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    className="form-control-modern"
                  />
                  {searchTerm && (
                    <CButton
                      color="link"
                      size="sm"
                      onClick={clearSearch}
                      className="p-0 mt-1 text-decoration-none"
                    >
                      <CIcon icon={cilXCircle} className="me-1" />
                      Clear Search
                    </CButton>
                  )}
                </CCol>

                {/* Role Filter */}
                <CCol md={4}>
                  <CFormLabel className="fw-semibold text-dark mb-2">Filter by Role</CFormLabel>
                  <CFormSelect
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    onClick={handleRoleDropdownClick}
                    className="form-control-modern select-dropdown"
                    disabled={isLoadingData}
                  >
                    <option value="">All Roles</option>
                    {roles.length > 0 ? (
                      roles.map((role) => (
                        <option key={role.value} value={role.label}>
                          {role.label}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        Loading roles...
                      </option>
                    )}
                  </CFormSelect>
                </CCol>

                {/* Status Filter */}
                <CCol md={4}>
                  <CFormLabel className="fw-semibold text-dark mb-2">Filter by Status</CFormLabel>
                  <CFormSelect
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="form-control-modern select-dropdown"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </CFormSelect>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>

        {/* Staff Table */}
        <CCard className="hr-card shadow-sm">
          <CCardHeader className="hr-card-header">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <CIcon icon={cilUser} className="me-2 text-primary" />
                <h5 className="mb-0 fw-semibold">Staff Directory</h5>
              </div>
              <div className="d-flex align-items-center gap-3">
                <CBadge color="info" className="px-3 py-2 rounded-pill">
                  Showing: {filteredData.length} of {totalCount}
                </CBadge>
              </div>
            </div>
          </CCardHeader>

          <CCardBody className="p-0">
            {isLoading ? (
              <div className="p-4">
                <AppTableSkeleton />
              </div>
            ) : (
              <>
                <div
                  className="table-responsive"
                  style={{
                    height: '600px',
                    overflowY: 'auto',
                    overflowX: 'auto',
                    maxWidth: '100%',
                    border: '1px solid #e9ecef',
                    borderRadius: '8px',
                  }}
                >
                  <DataTable
                    columns={columns}
                    data={filteredData}
                    pagination={false}
                    selectableRows
                    onSelectedRowsChange={handleRowChange}
                    customStyles={customStyles}
                    responsive
                    progressPending={isLoading}
                    progressComponent={<CSpinner color="primary" />}
                    noDataComponent={
                      <div className="text-center py-5">
                        <CIcon icon={cilUser} size="3xl" className="text-muted mb-3" />
                        <h5 className="text-muted">No Staff Found</h5>
                        <p className="text-muted">No employees match the current filters</p>
                        <CButton
                          color="primary"
                          onClick={() => {
                            setSearchTerm('')
                            setFilterRole('')
                            setFilterStatus('')
                            fetchStaffData()
                          }}
                          className="mt-2"
                        >
                          <CIcon icon={cilReload} className="me-1" />
                          Reset Filters
                        </CButton>
                      </div>
                    }
                  />
                </div>
              </>
            )}
          </CCardBody>
        </CCard>
      </CContainer>
      <CModal
        visible={excelModal}
        onClose={() => setExcelModal(false)}
        size="lg"
        alignment="center"
      >
        <CModalHeader className="border-bottom">
          <CModalTitle className="fw-bold">Download Staff</CModalTitle>
        </CModalHeader>

        <CModalBody>
          <p className="text-muted mb-3">
            Select the fields you want to include in the Excel file.
          </p>

          {/* Status Filters - Separate Checkboxes */}
          <div className="mb-3 p-3 bg-light rounded">
            <label className="fw-semibold mb-2 d-block">Filter by Status:</label>
            <div className="d-flex gap-4">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="filterActive"
                  checked={filterActive}
                  onChange={(e) => {
                    setFilterActive(e.target.checked)
                    // If Active is checked, uncheck Inactive
                    if (e.target.checked) {
                      setFilterInactive(false)
                    }
                  }}
                />
                <label htmlFor="filterActive" className="form-check-label" style={{ cursor: 'pointer' }}>
                  Active Only
                </label>
              </div>
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="filterInactive"
                  checked={filterInactive}
                  onChange={(e) => {
                    setFilterInactive(e.target.checked)
                    // If Inactive is checked, uncheck Active
                    if (e.target.checked) {
                      setFilterActive(false)
                    }
                  }}
                />
                <label htmlFor="filterInactive" className="form-check-label" style={{ cursor: 'pointer' }}>
                  Inactive Only
                </label>
              </div>
            </div>
          </div>

          <hr />

          {/* Select All */}
          <div className="mb-3 d-flex align-items-center">
            <input
              type="checkbox"
              className="form-check-input me-2"
              checked={isAllSelected}
              onChange={toggleSelectAll}
              id="selectAll"
            />
            <label htmlFor="selectAll" className="fw-semibold">
              Select All Fields
            </label>
          </div>

          <hr />

          {/* Field List */}
          <div
            className="row"
            style={{
              maxHeight: '300px',
              overflowY: 'auto',
            }}
          >
            {ALL_FIELDS.map((field) => (
              <div className="col-6 col-md-4 mb-2" key={field.key}>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={field.key}
                    checked={selectedFields.includes(field.key)}
                    onChange={() => {
                      if (selectedFields.includes(field.key)) {
                        setSelectedFields(selectedFields.filter((f) => f !== field.key))
                      } else {
                        setSelectedFields([...selectedFields, field.key])
                      }
                    }}
                  />
                  <label
                    htmlFor={field.key}
                    className="form-check-label"
                    style={{ cursor: 'pointer' }}
                  >
                    {field.label}
                  </label>
                </div>
              </div>
            ))}
          </div>
        </CModalBody>

        <CModalFooter className="border-top d-flex justify-content-between">
          <span className="text-muted">
            Selected: <strong>{selectedFields.length}</strong>
          </span>

          <div className="d-flex gap-2">
            <CButton color="secondary" variant="outline" onClick={() => setExcelModal(false)}>
              Cancel
            </CButton>
            <CButton color="primary" onClick={downloadExcel}>
              Download Excel
            </CButton>
          </div>
        </CModalFooter>
      </CModal>

      {/* Delete Employee Confirmation Modal */}
      <CModal
        visible={showDeleteModal}
        onClose={handleDeleteModalClose}
        size="lg"
        alignment="center"
      >
        <CModalHeader className="border-bottom bg-danger text-white">
          <CModalTitle className="fw-bold">
            <CIcon icon={cilTrash} className="me-2" />
            Delete Employee - Step {deleteStep} of 3
          </CModalTitle>
        </CModalHeader>

        <CModalBody>
          {deleteStep === 1 && (
            <div>
              <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
                <CIcon icon={cilXCircle} className="me-2" size="lg" />
                <div>
                  <strong>Warning!</strong> This action will permanently delete the employee.
                </div>
              </div>
              <h5 className="mb-3">Employee Information:</h5>
              {employeeToDelete && (
                <div className="p-3 bg-light rounded mb-3">
                  <p className="mb-2">
                    <strong>Name:</strong> {employeeToDelete.name || 'N/A'}
                  </p>
                  <p className="mb-2">
                    <strong>Email:</strong> {employeeToDelete.email || 'N/A'}
                  </p>
                  <p className="mb-2">
                    <strong>Status:</strong>{' '}
                    <CBadge color={employeeToDelete.status === 'active' ? 'success' : 'danger'}>
                      {employeeToDelete.status || 'N/A'}
                    </CBadge>
                  </p>
                </div>
              )}
              <div className="alert alert-warning mb-0">
                <strong>Please confirm:</strong> Are you sure you want to proceed with deleting this employee?
                This action cannot be undone easily.
              </div>
            </div>
          )}

          {deleteStep === 2 && (
            <div>
              <h5 className="mb-3">Select Reason for Deletion:</h5>
              <div className="mb-3">
                <CFormCheck
                  type="radio"
                  name="deleteReason"
                  id="reason1"
                  value="Resignation"
                  checked={deleteReason === 'Resignation'}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  label="Employee Resignation"
                  className="mb-2"
                />
                <CFormCheck
                  type="radio"
                  name="deleteReason"
                  id="reason2"
                  value="Termination"
                  checked={deleteReason === 'Termination'}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  label="Employee Termination"
                  className="mb-2"
                />
                <CFormCheck
                  type="radio"
                  name="deleteReason"
                  id="reason3"
                  value="Contract End"
                  checked={deleteReason === 'Contract End'}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  label="Contract Period Ended"
                  className="mb-2"
                />
                <CFormCheck
                  type="radio"
                  name="deleteReason"
                  id="reason4"
                  value="Other"
                  checked={deleteReason === 'Other'}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  label="Other Reason"
                  className="mb-2"
                />
              </div>
              {deleteReason === 'Other' && (
                <CFormTextarea
                  rows={3}
                  placeholder="Please specify the reason..."
                  value={deleteReasonOther}
                  onChange={(e) => setDeleteReasonOther(e.target.value)}
                  className="mt-2"
                />
              )}
              {!deleteReason && (
                <div className="alert alert-info mt-3">
                  Please select a reason before proceeding.
                </div>
              )}
            </div>
          )}

          {deleteStep === 3 && (
            <div>
              <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
                <CIcon icon={cilXCircle} className="me-2" size="lg" />
                <div>
                  <strong>Final Confirmation Required!</strong>
                </div>
              </div>
              <h5 className="mb-3">Review Details:</h5>
              {employeeToDelete && (
                <div className="p-3 bg-light rounded mb-3">
                  <p className="mb-2">
                    <strong>Employee Name:</strong> {employeeToDelete.name || 'N/A'}
                  </p>
                  <p className="mb-2">
                    <strong>Email:</strong> {employeeToDelete.email || 'N/A'}
                  </p>
                  <p className="mb-2">
                    <strong>Reason:</strong>{' '}
                    {deleteReason === 'Other' && deleteReasonOther
                      ? deleteReasonOther
                      : deleteReason || 'Not specified'}
                  </p>
                </div>
              )}
              <div className="alert alert-warning mb-0">
                <p className="mb-2">
                  <strong>⚠️ Important:</strong>
                </p>
                <ul className="mb-0">
                  <li>Employee data will be permanently deleted</li>
                  <li>This action cannot be undone</li>
                  <li>All associated records will be removed</li>
                </ul>
              </div>
            </div>
          )}
        </CModalBody>

        <CModalFooter className="border-top d-flex justify-content-between">
          <div>
            {deleteStep > 1 && (
              <CButton color="secondary" variant="outline" onClick={handleDeleteStepBack}>
                ← Back
              </CButton>
            )}
          </div>
          <div className="d-flex gap-2">
            <CButton color="secondary" variant="outline" onClick={handleDeleteModalClose}>
              Cancel
            </CButton>
            {deleteStep < 3 ? (
              <CButton
                color="warning"
                onClick={handleDeleteStepNext}
                disabled={
                  deleteStep === 2 && (!deleteReason || (deleteReason === 'Other' && !deleteReasonOther.trim()))
                }
              >
                Next Step →
              </CButton>
            ) : (
              <CButton color="danger" onClick={handleDeleteEmployee} disabled={isDeleting}>
                {isDeleting ? (
                  <>
                    <CSpinner size="sm" className="me-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <CIcon icon={cilTrash} className="me-1" />
                    Confirm Delete
                  </>
                )}
              </CButton>
            )}
          </div>
        </CModalFooter>
      </CModal>

      <style jsx>{`
        .staff-dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8f9fb 0%, #e9ecef 100%);
          padding: 20px 0;
        }

        .hr-header {
          padding: 20px 0;
          border-bottom: 2px solid #e5e7eb;
        }

        .hr-card {
          border: none;
          border-radius: 16px;
          background: white;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }

        .hr-card-header {
          background-color: #0d47a1;
          color: #fff;
          padding: 20px 24px;
        }

        .form-control-modern {
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 10px 12px;
          font-size: 14px;
          transition: all 0.2s ease;
          background: white;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .form-control-modern:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          background: white;
          outline: none;
        }

        .select-dropdown {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 12px center;
          background-repeat: no-repeat;
          background-size: 16px;
          padding-right: 40px;
          appearance: none !important;
          -webkit-appearance: none !important;
          -moz-appearance: none !important;
          background-color: white !important;
        }

        .select-dropdown:focus {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%233b82f6' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
          background-color: white !important;
        }

        .select-dropdown::-ms-expand {
          display: none !important;
        }

        .select-dropdown option {
          background-color: white;
          color: #374151;
          padding: 8px 12px;
        }

        .select-dropdown:focus option {
          background-color: #f3f4f6;
        }

        /* Additional overrides for professional look */
        .select-dropdown {
          position: relative;
          z-index: 1;
        }

        .select-dropdown:before {
          display: none !important;
        }

        .select-dropdown:after {
          display: none !important;
        }

        /* Ensure no duplicate icons */
        .form-select.select-dropdown {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e") !important;
          background-position: right 12px center !important;
          background-repeat: no-repeat !important;
          background-size: 16px !important;
          padding-right: 40px !important;
          appearance: none !important;
          -webkit-appearance: none !important;
          -moz-appearance: none !important;
        }

        .form-select.select-dropdown:focus {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%233b82f6' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e") !important;
        }

        /* Override CoreUI select styling completely */
        .form-select.select-dropdown {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e") !important;
          background-position: right 12px center !important;
          background-repeat: no-repeat !important;
          background-size: 16px !important;
          padding-right: 40px !important;
          appearance: none !important;
          -webkit-appearance: none !important;
          -moz-appearance: none !important;
          border: 1px solid #d1d5db !important;
          border-radius: 6px !important;
          background-color: white !important;
        }

        .form-select.select-dropdown:focus {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%233b82f6' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e") !important;
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
          background-color: white !important;
        }

        .filter-card {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
        }

        .filter-header {
          background: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
          padding: 16px 20px;
        }

        .filter-body {
          background: #f8f9fa;
          padding: 20px;
        }

        .staff-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @media (max-width: 768px) {
          .hr-card-header {
            padding: 15px 20px;
          }

          .action-buttons {
            flex-direction: column !important;
            gap: 4px !important;
          }

          .action-buttons .btn {
            width: 100% !important;
            min-width: unset !important;
            font-size: 11px !important;
            padding: 4px 8px !important;
          }
        }

        @media (max-width: 576px) {
          .action-buttons .btn {
            font-size: 10px !important;
            padding: 3px 6px !important;
          }
        }

        .action-buttons .btn {
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
          transition: all 0.2s ease;
        }

        .action-buttons .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  )
}

export default Staff

