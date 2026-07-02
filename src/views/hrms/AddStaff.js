import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import AsyncSelect from 'react-select/async'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CContainer,
  CAlert,
  CSpinner,
  CButton,
  CRow,
  CCol,
  CForm,
  CFormLabel,
  CFormInput,
  CFormTextarea,
  CFormCheck,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'

import AppFormSelect from 'src/components/form/AppFormSelect'
import {
  cilUser,
  cilBuilding,
  cilCalendar,
  cilInfo,
  cilClock,
  cilEnvelopeClosed,
  cilCheckCircle,
  cilXCircle,
  cilPlus,
  cilCreditCard,
  cilBriefcase,
  cilHome,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import BasicProvider from 'src/constants/BasicProvider'
import { isAdminActiveForDropdown } from 'src/constants/hrmsConstants'
import { fetchCompanies } from 'src/helpers/companyHelper'
const officeContact = [
  { name: 'Office Contact 1', number: '9109138040' },
  { name: 'Office Contact 2', number: '9109138044' },
  { name: 'Office Contact 3', number: '9109138048' },
]

const AddStaff = () => {
  const navigate = useNavigate()
  const [sameAsCurrentAddress, setSameAsCurrentAddress] = useState(false)
  // Form validation state
  const [validationErrors, setValidationErrors] = useState({})
  const [showValidationErrors, setShowValidationErrors] = useState(false)

  // Company options state
  const [companyOptions, setCompanyOptions] = useState([{ value: '', label: 'Select Company' }])

  // Form state
  const [formData, setFormData] = useState({
    // General Information (from profile sections)
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    reportingManagerName: '',

    // Personal Details
    name: '',
    email: '',
    phone: '',
    alternateMobile: '',
    password: '',
    gender: '',
    profilePicture: null,
    loginEmail: '',
    emergencyContact: '',
    emergencyPhone: '',

    // Additional Personal Information
    maritalStatus: '',
    bloodGroup: '',
    fatherName: '',
    motherName: '',
    spouseName: '',
    anniversary: '',
    children: '',
    physicallyChallenged: '',
    physicallyChallengedReason: '',
    currentAddress: '',
    currentAddress: '',
    currentVillage: '',
    currentBlock: '',
    currentDistrict: '',
    currentState: '',
    currentCountry: 'India',
    currentPincode: '',
    permanentAddress: '',
    permanentAddress: '',
    permanentVillage: '',
    permanentBlock: '',
    permanentDistrict: '',
    permanentState: '',
    permanentCountry: 'India',
    permanentPincode: '',
    pincode: '',
    sameAsCurrentAddress: false,
    state: '',
    qualification: '',
    lastOccupation: '',
    referenceOfJoining: '',
    aadharNo: '',
    panNo: '',
    ctcPerMonth: '',
    ctcPerMonthInWords: '',
    hra: '',
    hraInWords: '',
    isCore: false,
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactNumber: '',
    emergencyContactName2: '',
    emergencyContactRelation2: '',
    emergencyContactNumber2: '',
    emergencyContactName3: '',
    emergencyContactRelation3: '',
    emergencyContactNumber3: '',

    // Profile Information
    // employeeId: '',
    designation: '',
    // staffType: '',
    contactNumber: '',
    attendanceSupervisor: '',
    department: '',

    // Job Details
    location: '',
    workLocation: '',
    company: '',
    reportingManager: '',
    adminStatus: '',
    template: [],
    role: [],

    // Employment Information
    joiningDate: '',
    employeeType: '',
    basicSalary: '',
    status: 'active',
    remark: '',
    // Bank Details
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branchName: '',

    // Dates
    onboardingDate: '',

    // Additional Details
    salary: '',
    workType: 'full-time',
    shift: 'day',

    // Letter Generation
    generateWelcomeLetter: false,
    generateOfferLetter: false,

    // Automatic Punchout Settings
    auto_punchout_enabled: false,
    inactivity_timeout_minutes: 30,
    auto_punchout_days: [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ],
    auto_punchout_timezone: 'Asia/Kolkata',

    // Today Done Settings
    today_done_enabled: false,
    today_done_days: {
      sunday: { enabled: false },
      monday: { enabled: false },
      tuesday: { enabled: false },
      wednesday: { enabled: false },
      thursday: { enabled: false },
      friday: { enabled: false },
      saturday: { enabled: false },
    },

    // Conditional fields based on role
    ra_branch: '',
    group: [], // Changed to array for multiple groups
    raLocation: '',

    leaveAuthorityOne_id: '',
    leaveAuthorityOneName: '',
    leaveAuthorityTwo_id: '',
    leaveAuthorityTwoName: '',
  })

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [apiError, setApiError] = useState('')
  const [apiSuccess, setApiSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Dynamic data states
  const [locations, setLocations] = useState([])
  const [managers, setManagers] = useState([])
  const [roles, setRoles] = useState([])
  const [defaultRoleOptions, setDefaultRoleOptions] = useState([])
  const [newDesignations, setNewDesignations] = useState([])
  const [groups, setGroups] = useState([])
  const [defaultGroupOptions, setDefaultGroupOptions] = useState([])
  const [templates, setTemplates] = useState([])
  // Conditional field visibility states
  const [showFields, setShowFields] = useState({
    ra_branch: false,
    group: false,
  })

  const fetchTemplates = async () => {
    try {
      const res = await new BasicProvider('holiday-templates').getRequest()
      setTemplates(res.data || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load templates')
    }
  }
  // Fetch dynamic data functions
  const fetchLocations = async () => {
    try {
      const response = await new BasicProvider('ra_branch?count=100').getRequest()
      const locationOptions = response.data.data.map((location) => ({
        value: location._id,
        label: location.name,
        id: location._id,
        name: location.name,
      }))
      setLocations([{ value: '', label: 'Select Location', id: '', name: '' }, ...locationOptions])
    } catch (error) {
      console.error('Error fetching locations:', error)
      setLocations([
        { value: '', label: 'Select Location', id: '', name: '' },
        { value: 'indore', label: 'Indore', id: 'indore', name: 'Indore' },
        { value: 'ratlam', label: 'Ratlam', id: 'ratlam', name: 'Ratlam' },
        { value: 'dhar', label: 'Dhar', id: 'dhar', name: 'Dhar' },
        { value: 'mandsour', label: 'Mandsour', id: 'mandsour', name: 'Mandsour' },
        { value: 'bhopal', label: 'Bhopal', id: 'bhopal', name: 'Bhopal' },
        { value: 'neemach', label: 'Neemach', id: 'neemach', name: 'Neemach' },
      ])
    }
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
      // const response = await new BasicProvider(
      //   `admins/get-multiple?slugs=${encodeURIComponent(queryString)}&page=1&count=500`,
      // ).getRequest()
      const response = await new BasicProvider('admins?page=1&count=1000').getRequest()

      const staff = response.data.data || []
      const activeStaff = staff.filter((row) => isAdminActiveForDropdown(row))

      const managerOptions = activeStaff.map((manager) => ({
        value: manager._id,
        label: `${manager.name}`,
      }))
      setManagers(managerOptions)
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
      setDefaultRoleOptions(roleOptions)
    } catch (error) {
      console.error('Error fetching roles:', error)
      const fallbackRoles = [
        { value: 'admin', label: 'Admin', slug: 'admin' },
        { value: 'manager', label: 'Manager', slug: 'manager' },
        { value: 'employee', label: 'Employee', slug: 'employee' },
        { value: 'hr', label: 'HR', slug: 'hr' },
        { value: 'supervisor', label: 'Supervisor', slug: 'supervisor' },
        { value: 'intern', label: 'Intern', slug: 'intern' },
      ]
      setRoles([{ value: '', label: 'Select Role' }, ...fallbackRoles])
      setDefaultRoleOptions(fallbackRoles)
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

  const fetchGroupsData = async () => {
    try {
      const response = await new BasicProvider('cms/categories/tree/group').getRequest()
      const groupOptions = response.data.data.map((group) => ({
        value: group._id,
        label: group.name,
        id: group._id,
        name: group.name,
      }))
      setGroups([{ value: '', label: 'Select Group', id: '', name: '' }, ...groupOptions])
      setDefaultGroupOptions(groupOptions)
    } catch (error) {
      console.error('Error fetching groups:', error)
      // Fallback groups
      const fallbackGroups = [
        { value: '', label: 'Select Group', id: '', name: '' },
        { value: 'group1', label: 'Group 1', id: 'group1', name: 'Group 1' },
        { value: 'group2', label: 'Group 2', id: 'group2', name: 'Group 2' },
        { value: 'group3', label: 'Group 3', id: 'group3', name: 'Group 3' },
      ]
      setGroups(fallbackGroups)
      setDefaultGroupOptions(fallbackGroups.slice(1))
    }
  }

  const fetchAllDynamicData = async () => {
    setIsLoadingData(true)
    try {
      await Promise.all([
        fetchLocations(),
        fetchManagers(),
        fetchRoles(),
        fetchCompaniesData(),
        fetchGroupsData(),
        fetchTemplates(),
      ])
    } catch (error) {
      console.error('Error fetching dynamic data:', error)
    } finally {
      setIsLoadingData(false)
    }
  }

  // Fetch dynamic data on component mount
  useEffect(() => {
    fetchAllDynamicData()
  }, [])
 

  // Auto-generate full name from first, middle, last names
  useEffect(() => {
    const fullName = [formData.firstName, formData.middleName, formData.lastName]
      .filter((name) => name.trim())
      .join(' ')
    setFormData((prev) => ({ ...prev, name: fullName }))
  }, [formData.firstName, formData.middleName, formData.lastName])

  // Helper function to get input field CSS class
  const getInputClass = (field) => {
    const baseClass = 'form-control'
    if (showValidationErrors && validationErrors[field]) {
      return `${baseClass} is-invalid`
    }
    return baseClass
  }

  // Helper function to get select field CSS class
  const getSelectClass = (field) => {
    const baseClass = 'form-select'
    if (showValidationErrors && validationErrors[field]) {
      return `${baseClass} is-invalid`
    }
    return baseClass
  }

  // Helper function to capitalize text (title case)
  const capitalizeText = (text) => {
    if (!text) return text
    return text
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Number to words conversion function
  const numberToWords = (num) => {
    if (!num || num === '' || isNaN(num)) return ''

    let number = parseInt(num)
    if (number === 0) return 'Zero'

    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
    const teens = [
      'Ten',
      'Eleven',
      'Twelve',
      'Thirteen',
      'Fourteen',
      'Fifteen',
      'Sixteen',
      'Seventeen',
      'Eighteen',
      'Nineteen',
    ]
    const tens = [
      '',
      '',
      'Twenty',
      'Thirty',
      'Forty',
      'Fifty',
      'Sixty',
      'Seventy',
      'Eighty',
      'Ninety',
    ]
    const thousands = ['', 'Thousand', 'Lakh', 'Crore']

    const convertHundreds = (n) => {
      let result = ''

      if (n > 99) {
        result += ones[Math.floor(n / 100)] + ' Hundred '
        n %= 100
      }

      if (n > 19) {
        result += tens[Math.floor(n / 10)] + ' '
        n %= 10
      } else if (n > 9) {
        result += teens[n - 10] + ' '
        return result
      }

      if (n > 0) {
        result += ones[n] + ' '
      }

      return result
    }

    if (number < 1000) {
      return convertHundreds(number).trim()
    }

    let result = ''
    let divisor = 1000
    let index = 0

    while (number > 0) {
      const remainder = number % divisor
      if (remainder !== 0) {
        result = convertHundreds(remainder) + thousands[index] + ' ' + result
      }
      number = Math.floor(number / divisor)
      index++
    }

    return result.trim() + ' Rupees Only'
  }

  // Form handlers
  const handleInputChange = (field, value) => {
    const fieldsToUppercase = ['firstName', 'middleName', 'lastName']
    // Fields that should be capitalized (text fields)
    const textFieldsToCapitalize = [
      'firstName',
      'middleName',
      'lastName',
      'email',
      'currentAddress',
      'permanentAddress',
      'emergencyContactName',
      'emergencyContactName2',
      'emergencyContactName3',
      'fatherName',
      'motherName',
      'spouseName',
      'anniversary',
      'qualification',
      'lastOccupation',
      'referenceOfJoining',
      'workLocation',
      'currentVillage',
      'currentBlock',
      'currentDistrict',
      'currentState',
      'currentCountry',
      'permanentVillage',
      'permanentBlock',
      'permanentDistrict',
      'permanentState',
      'permanentCountry',
      'bankName',
      'branchName',
      'physicallyChallengedReason',
    ]

    // Apply capitalization to text fields
    let processedValue = value
    if (fieldsToUppercase.includes(field)) {
      processedValue = value ? value.toUpperCase() : value
    } else if (textFieldsToCapitalize.includes(field)) {
      processedValue = capitalizeText(value)
    }

    setFormData((prev) => ({
      ...prev,
      [field]: processedValue,
    }))

    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // Role change handler for multiple selection
  const handleRoleChange = (selectedOptions) => {
    // Extract selected role IDs
    const roleIds = Array.isArray(selectedOptions)
      ? selectedOptions.map((option) => option.value)
      : selectedOptions
      ? [selectedOptions.value]
      : []

    setFormData((prev) => ({
      ...prev,
      role: roleIds,
    }))
    setNewDesignations(selectedOptions[0]?.label || 'RA')

    // Handle showing/hiding fields based on selected roles
    const roleSlugs = Array.isArray(selectedOptions)
      ? selectedOptions.map((option) => option.slug).filter(Boolean)
      : selectedOptions && selectedOptions.slug
      ? [selectedOptions.slug]
      : []

    // Check for BM (Branch Manager) - using RA role as BM
    const BM = process.env.REACT_APP_RA
    const FE = process.env.REACT_APP_FE
    const SDM = process.env.REACT_APP_SDM

    // For SDM: show both ra_branch and group
    // For FE: show only group
    // For BM: show only ra_branch
    const isSDM = roleSlugs.includes(SDM)
    const showGroupSelection = roleSlugs.includes(FE) || isSDM
    const showRABranchSelection = roleSlugs.includes(BM) || isSDM

    setShowFields({
      ra_branch: showRABranchSelection,
      group: showGroupSelection,
    })

    // Clear conditional fields when roles change
    if (!showGroupSelection) {
      setFormData((prev) => ({ ...prev, group: [] }))
    }
    if (!showRABranchSelection) {
      setFormData((prev) => ({ ...prev, ra_branch: '' }))
    }

    // Clear validation error for role when user selects
    if (validationErrors.role) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.role
        return newErrors
      })
    }
  }
  // Load role options for AsyncSelect
  const loadRoleOptions = async (inputValue, callback) => {
    try {
      const response = await new BasicProvider(
        `roles/search?page=1&count=10&search=${inputValue}`,
      ).getRequest()
      const options = response.data.data.map((role) => ({
        value: role._id,
        label: role.display_name,
        slug: role.name,
      }))
      callback(options)
    } catch (error) {
      console.error('Error loading role options:', error)
      callback(defaultRoleOptions)
    }
  }

  // Load group options for AsyncSelect
  const loadGroupOptions = async (inputValue, callback) => {
    try {
      const response = await new BasicProvider('cms/categories/tree/group').getRequest()
      const options = response.data.data
        .filter((group) => group.name.toLowerCase().includes((inputValue || '').toLowerCase()))
        .map((group) => ({
          value: group._id,
          label: group.name,
          id: group._id,
          name: group.name,
        }))
      callback(options)
    } catch (error) {
      console.error('Error loading group options:', error)
      callback(defaultGroupOptions || [])
    }
  }

  // Group change handler for multiple selection
  const handleGroupChange = (selectedOptions) => {
    // Extract selected group IDs
    const groupIds = Array.isArray(selectedOptions)
      ? selectedOptions.map((option) => option.value)
      : selectedOptions
      ? [selectedOptions.value]
      : []

    setFormData((prev) => ({
      ...prev,
      group: groupIds,
    }))

    // Clear validation error for group when user selects
    if (validationErrors.group) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.group
        return newErrors
      })
    }
  }

  //  Enhanced Form Validation
  const validateForm = () => {
    const errors = {}

    // Required fields with custom error messages
    const requiredFields = {
      firstName: 'First Name is required',
      lastName: 'Last Name is required',
      dateOfBirth: 'Date of Birth is required',
      gender: 'Gender is required',
      email: 'Email is required',
      phone: 'Phone Number is required',
      password: 'Password is required',
      department: 'Department is required',
      location: 'Location is required',
      workLocation: 'Work Location is required',
      company: 'Company is required',
      adminStatus: 'Admin Status is required',
      onboardingDate: 'Onboarding Date is required',
      joiningDate: 'Joining Date is required',
      // bankName: 'Bank Name is required',
      // accountNumber: 'Account Number is required',
      // ifscCode: 'IFSC Code is required',
      // branchName: 'Branch Name is required',
    }

    // Check each required field
    Object.keys(requiredFields).forEach((field) => {
      const value = formData[field]
      if (value === undefined || value === null || value.toString().trim() === '') {
        errors[field] = requiredFields[field]
      }
    })

    // Role array check
    if (!formData.role || formData.role.length === 0) {
      errors.role = 'At least one role is required'
    }

    // Conditional field validation
    if (showFields.ra_branch && (!formData.ra_branch || formData.ra_branch.trim() === '')) {
      errors.ra_branch = 'RA-Branch is required for Branch Manager role'
    }

    if (showFields.group && (!formData.group || formData.group.length === 0)) {
      errors.group = 'At least one group is required for Field Engineer role'
    }

    // Email validation
    if (formData.loginEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.loginEmail)) {
      errors.loginEmail = 'Please enter a valid Login email address'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid Personal email address'
    }

    // Phone validation
    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      errors.phone = 'Please enter a valid 10-digit phone number'
    }

    // Emergency contact phone validation
    if (
      formData.emergencyContactNumber &&
      !/^[0-9]{10}$/.test(formData.emergencyContactNumber.replace(/\D/g, ''))
    ) {
      errors.emergencyContactNumber = 'Please enter a valid 10-digit emergency contact number'
    }

    if (
      formData.emergencyContactNumber2 &&
      !/^[0-9]{10}$/.test(formData.emergencyContactNumber2.replace(/\D/g, ''))
    ) {
      errors.emergencyContactNumber2 = 'Please enter a valid 10-digit emergency contact number'
    }

    if (
      formData.emergencyContactNumber3 &&
      !/^[0-9]{10}$/.test(formData.emergencyContactNumber3.replace(/\D/g, ''))
    ) {
      errors.emergencyContactNumber3 = 'Please enter a valid 10-digit emergency contact number'
    }

    // Physically challenged reason validation
    if (
      formData.physicallyChallenged === 'yes' &&
      (!formData.physicallyChallengedReason || formData.physicallyChallengedReason.trim() === '')
    ) {
      errors.physicallyChallengedReason = 'Please specify the nature of disability'
    }

    return errors
  }

  const handleSubmit = () => {
    const errors = validateForm()

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      setShowValidationErrors(true)

      // Show toast with specific missing fields
      const missingFields = Object.keys(errors)
      const errorMsg = `Please fill in all required fields: ${missingFields.join(', ')}`
      toast.error(errorMsg, { position: 'top-right', autoClose: 5000 })
      setApiError(errorMsg)

      // Scroll to first error field
      const firstErrorField = document.querySelector(`[name="${missingFields[0]}"]`)
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' })
        firstErrorField.focus()
      }

      return // stop here, modal will NOT open
    }

    // Clear validation errors if form is valid
    setValidationErrors({})
    setShowValidationErrors(false)
    setApiError('')
    setApiSuccess('')
    setShowSubmitModal(true) // only open modal if all valid
  }

  // ---------- Handle Confirm Submit (API Call) ----------
  const handleConfirmSubmit = async () => {
    try {
      // Extra safety check before API call
      const essentialFields = ['panNo', 'workLocation', 'firstName', 'lastName']
      const invalidFields = essentialFields.filter(
        (f) => !formData[f] || formData[f].toString().trim() === '',
      )
      if (invalidFields.length > 0) {
        toast.error(`Invalid data in fields: ${invalidFields.join(', ')}`, {
          position: 'top-right',
        })
        return
      }

      setIsSubmitting(true)
      setShowSubmitModal(false)
      setApiError('')
      setApiSuccess('')

      // Prepare API payload
      const apiData = {
        name: formData.name,
        email: formData.loginEmail,
        personal_email: formData.email,
        password: formData.password,
        mobile: formData.phone,
        gender: formData.gender,
        address: formData.address || formData.currentAddress,
        status: formData.status || 'active',
        role: Array.isArray(formData.role) ? [...formData.role] : [],
        group:
          Array.isArray(formData.group) && formData.group.length > 0
            ? formData.group.map((groupId) => {
                const group =
                  groups.find((g) => g.value === groupId) ||
                  groups.find((g) => g.id === groupId) ||
                  defaultGroupOptions.find((g) => g.value === groupId)
                return {
                  _id: groupId,
                  name: group?.name || group?.label || 'Unknown Group',
                }
              })
            : [],
        ra_branch: formData.ra_branch ? [formData.ra_branch] : [],

        profile: {
          dob: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
          father_name: formData.fatherName,
          mother_name: formData.motherName,
          spouse_name: formData.spouseName,
          anniversary: formData.anniversary,
          children: formData.children || undefined,
          physically_challenged: formData.physicallyChallenged === 'yes',
          physically_challenged_reason: formData.physicallyChallengedReason || '',
          marital_status: formData.maritalStatus,
          blood_group: formData.bloodGroup,

          // current_address: {
          //   address_line: formData.currentAddress || formData.address,
          //   village: formData.district || 'N/A',
          //   block: formData.district || 'N/A',
          //   district: formData.district,
          //   state: formData.state,
          //   country: 'India',
          //   pincode: formData.pincode,
          // },
          current_address: {
            address_line: formData.currentAddress || formData.address,
            village: formData.currentVillage || '',
            block: formData.currentBlock || '',
            district: formData.currentDistrict || '',
            state: formData.currentState || '',
            country: formData.currentCountry || 'India',
            pincode: formData.currentPincode || '',
          },

          // permanent_address: {
          //   address_line: formData.permanentAddress || formData.address,
          //   village: formData.district || 'N/A',
          //   block: formData.district || 'N/A',
          //   district: formData.district,
          //   state: formData.state,
          //   country: 'India',
          //   pincode: formData.pincode,
          // },

          permanent_address: {
            address_line: formData.permanentAddress || formData.address,
            village: formData.permanentVillage || '',
            block: formData.permanentBlock || '',
            district: formData.permanentDistrict || '',
            state: formData.permanentState || '',
            country: formData.permanentCountry || 'India',
            pincode: formData.permanentPincode || '',
          },
          designation: newDesignations || 'RA',
          department: formData.department,
          template: Array.isArray(formData.template) ? formData.template : [],
          reporting_manager: formData.reportingManagerName,
          reporting_manager_id: formData.reportingManager || null,
          leaveAuthorityOne: formData.leaveAuthorityOne_id || null,
          leaveAuthorityOne_Name: formData.leaveAuthorityOneName || '',
          leaveAuthorityTwo_Name: formData.leaveAuthorityTwoName || '',
          leaveAuthorityTwo: formData.leaveAuthorityTwo_id || null,
          // employee_id: formData.employeeId,
          employee_type: formData.employeeType,
          core: formData.isCore === true,
          company_name: formData.company,
          work_type: formData.workType,
          shift: formData.shift,
          location: formData.workLocation,
          ra_location: formData.location
            ? {
                value: formData.location,
                label: formData.raLocation || locations.find((loc) => loc.value === formData.location)?.label || '',
              }
            : undefined,
          mobile_alternate: formData.alternateMobile,
          onboarding_date: formData.onboardingDate ? new Date(formData.onboardingDate) : undefined,
          joining_date: formData.joiningDate ? new Date(formData.joiningDate) : undefined,
          reference_by: formData.referenceOfJoining || undefined,
          remark: formData.remark || undefined,
          ctc_per_month: parseInt(formData.ctcPerMonth) || 0,
          ctc_per_month_in_words: formData.ctcPerMonthInWords,
          hra_per_month: parseInt(formData.hra) || 0,
          hra_in_words: formData.hraInWords,
          basic_per_month: parseInt(formData.basicSalary) || 0,

          bank_name: formData.bankName,
          account_number: formData.accountNumber,
          ifsc_code: formData.ifscCode,
          branch_name: formData.branchName,
          upi_id: formData.upiId,
          upi_app: formData.upiApp,

          qualification: formData.qualification,
          last_occupation: formData.lastOccupation,
          aadhar_no: formData.aadharNo,
          pan_no: formData.panNo,
          documents: [],

          emergency_contact1: formData.emergencyContactName
            ? {
                name: formData.emergencyContactName,
                relation: formData.emergencyContactRelation,
                phone: formData.emergencyContactNumber,
              }
            : null,
          emergency_contact2: formData.emergencyContactName2
            ? {
                name: formData.emergencyContactName2,
                relation: formData.emergencyContactRelation2,
                phone: formData.emergencyContactNumber2,
              }
            : null,
          emergency_contact3: formData.emergencyContactName3
            ? {
                name: formData.emergencyContactName3,
                relation: formData.emergencyContactRelation3,
                phone: formData.emergencyContactNumber3,
              }
            : null,

          auto_punchout_settings: {
            enabled: formData.auto_punchout_enabled,
            inactivity_timeout_ms: formData.inactivity_timeout_minutes * 60000,
            timezone: formData.auto_punchout_timezone,
            working_days: formData.auto_punchout_days || [],
            notify_before_punchout: formData.notify_before_punchout || false,
          },

          today_done_settings: {
            enabled: formData.today_done_enabled,
            days: formData.today_done_days || {
              sunday: { enabled: false },
              monday: { enabled: false },
              tuesday: { enabled: false },
              wednesday: { enabled: false },
              thursday: { enabled: false },
              friday: { enabled: false },
              saturday: { enabled: false },
            },
          },

          welcome_letter: formData.generateWelcomeLetter,
          offer_letter: formData.generateOfferLetter,
          bank_edit_locked: false,
          document_edit_locked: false,
        },
      }

      // ---------- Make API call ----------
      const response = await new BasicProvider('profiles/create-user-and-profile').postRequest(
        apiData,
      )
      const adminData = response.data?.data?.admin
      const profileDataResult = response.data?.data?.profile

      if (adminData && profileDataResult) {
        toast.success(`Employee created successfully!`, { position: 'top-right', autoClose: 5000 })
      }

      // ---------- Navigate to staff list ----------
      setTimeout(() => {
        navigate('/hrms/staff/all', {
          state: {
            successMessage: `Employee created successfully!`,
            newEmployeeId: profileDataResult?.employee_id || formData.employeeId || 'N/A',
            refreshData: true,
          },
        })
      }, 2000)
    } catch (error) {
      console.error('❌ API Error:', error.response?.data || error.message)
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to create employee. Please try again.'
      toast.error(errorMessage, { position: 'top-right', autoClose: 5000 })
      setApiError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle modal cancel
  const handleModalCancel = () => {
    setShowSubmitModal(false)
    setApiError('')
    setApiSuccess('')
  }

  const handleCancel = () => {
    navigate('/hrms/staff/all')
  }

  return (
    <>
      <CContainer fluid style={{ paddingTop: '20px' }}>
        {/* Header */}

        <CRow className="mb-4">
          <CCard className="p-3">
            <CCol>
              <div className="d-flex align-items-center">
                <div>
                  <h2 className="mb-1 fw-bold text-dark">Add New Employee</h2>
                  <p className="text-muted mb-0">
                    Create a new employee profile with complete information
                  </p>
                </div>
              </div>
            </CCol>
          </CCard>
        </CRow>

        {/* Success Alert */}
        {showSuccessAlert && (
          <CRow className="mb-4">
            <CCol>
              <CAlert color="success" className="d-flex align-items-center">
                <CIcon icon={cilCheckCircle} className="me-2" />
                {apiSuccess || 'Employee created successfully! Redirecting to staff list...'}
              </CAlert>
            </CCol>
          </CRow>
        )}

        {/* Error Alert */}
        {apiError && (
          <CRow className="mb-4">
            <CCol>
              <CAlert color="danger" className="d-flex align-items-center">
                <CIcon icon={cilXCircle} className="me-2" />
                {apiError}
              </CAlert>
            </CCol>
          </CRow>
        )}

        {/* Form Sections */}
        <CForm>
          {/* General Information Section */}
          <CCard className="mb-4">
            <CCardHeader className="bg-primary text-white">
              <h5 className="mb-0 d-flex align-items-center">
                <CIcon icon={cilUser} className="me-2" />
                General Information
              </h5>
            </CCardHeader>
            <CCardBody>
              <CRow>
                <CCol md={4}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">First Name *</CFormLabel>
                    <CFormInput
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Enter first name"
                      className={getInputClass('firstName')}
                      required
                    />
                    {showValidationErrors && validationErrors.firstName && (
                      <div className="invalid-feedback d-block">{validationErrors.firstName}</div>
                    )}
                  </div>
                </CCol>
                <CCol md={4}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Middle Name</CFormLabel>
                    <CFormInput
                      type="text"
                      value={formData.middleName}
                      onChange={(e) => handleInputChange('middleName', e.target.value)}
                      placeholder="Enter middle name"
                    />
                  </div>
                </CCol>
                <CCol md={4}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Last Name *</CFormLabel>
                    <CFormInput
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Enter last name"
                      className={getInputClass('lastName')}
                      required
                    />
                    {showValidationErrors && validationErrors.lastName && (
                      <div className="invalid-feedback d-block">{validationErrors.lastName}</div>
                    )}
                  </div>
                </CCol>
              </CRow>
              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Date of Birth *</CFormLabel>
                    <CFormInput
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className={getInputClass('dateOfBirth')}
                      required
                    />
                    {showValidationErrors && validationErrors.dateOfBirth && (
                      <div className="invalid-feedback d-block">{validationErrors.dateOfBirth}</div>
                    )}
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Full Name (Auto-generated)</CFormLabel>
                    <CFormInput type="text" value={formData.name} disabled className="bg-light" />
                    <small className="text-muted">
                      This field is automatically generated from first, middle, and last names
                    </small>
                  </div>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>

          {/* Personal Details Section */}
          <CCard className="mb-4">
            <CCardHeader className="bg-primary text-white">
              <h5 className="mb-0 d-flex align-items-center">
                <CIcon icon={cilEnvelopeClosed} className="me-2" />
                Personal Details
              </h5>
            </CCardHeader>
            <CCardBody>
              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Gender *</CFormLabel>
                    <AppFormSelect
                      name="gender"
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className={getSelectClass('gender')}
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </AppFormSelect>
                    {showValidationErrors && validationErrors.gender && (
                      <div className="invalid-feedback d-block">{validationErrors.gender}</div>
                    )}
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Marital Status</CFormLabel>
                    <AppFormSelect
                      value={formData.maritalStatus}
                      onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                    >
                      <option value="">Select Marital Status</option>
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="divorced">Divorced</option>
                      <option value="widowed">Widowed</option>
                    </AppFormSelect>

                    {formData.maritalStatus === 'married' && (
                      <CRow>
                        <CCol md={6}>
                          <div className="mb-3">
                            <CFormLabel className="fw-semibold">Anniversary Date</CFormLabel>
                            <CFormInput
                              type="date"
                              value={formData.anniversary}
                              onChange={(e) => handleInputChange('anniversary', e.target.value)}
                            />
                          </div>
                        </CCol>
                        <CCol md={6}>
                          <div className="mb-3">
                            <CFormLabel className="fw-semibold">Children&apos;s</CFormLabel>
                            <CFormInput
                              type="text"
                              value={formData.children || ''}
                              onChange={(e) => handleInputChange('children', e.target.value)}
                              placeholder="e.g. 2"
                            />
                          </div>
                        </CCol>
                      </CRow>
                    )}
                  </div>
                </CCol>
              </CRow>
              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Login Email *</CFormLabel>
                    <CFormInput
                      type="email"
                      name="loginEmail"
                      value={formData.loginEmail}
                      onChange={(e) => handleInputChange('loginEmail', e.target.value)}
                      placeholder="Enter login email address"
                      className={getInputClass('loginEmail')}
                      required
                    />
                    {showValidationErrors && validationErrors.loginEmail && (
                      <div className="invalid-feedback d-block">{validationErrors.loginEmail}</div>
                    )}
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Contact no. *</CFormLabel>
                    <CFormInput
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '')
                        if (value.length > 10) {
                          value = value.slice(0, 10)
                        }
                        handleInputChange('phone', value) // update state
                      }}
                      placeholder="Enter phone number"
                      className={getInputClass('phone')}
                      required
                      maxLength={10} // also caps at input level
                    />
                    {showValidationErrors && validationErrors.phone && (
                      <div className="invalid-feedback d-block">{validationErrors.phone}</div>
                    )}
                  </div>
                </CCol>
              </CRow>
              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Alternate Mobile</CFormLabel>
                    <CFormInput
                      type="tel"
                      value={formData.alternateMobile}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '')
                        if (value.length > 10) {
                          value = value.slice(0, 10)
                        }
                        handleInputChange('alternateMobile', value)
                      }}
                      placeholder="Enter alternate mobile number"
                      maxLength={10}
                    />
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Password *</CFormLabel>
                    <div className="position-relative">
                      <CFormInput
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="Enter password"
                        className={getInputClass('password')}
                        required
                        style={{ paddingRight: '45px' }}
                      />
                      <button
                        type="button"
                        className="btn btn-link position-absolute top-50 end-0 translate-middle-y pe-3"
                        style={{
                          border: 'none',
                          background: 'none',
                          color: '#6c757d',
                          zIndex: 10,
                          padding: '0',
                          marginRight: '8px',
                          fontSize: '14px',
                          fontWeight: 'bold',
                        }}
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? '🔒' : '👁️'}
                      </button>
                    </div>
                    {showValidationErrors && validationErrors.password && (
                      <div className="invalid-feedback d-block">{validationErrors.password}</div>
                    )}
                  </div>
                </CCol>
              </CRow>
              {/* <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Profile Picture</CFormLabel>
                    <CFormInput
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleInputChange('profilePicture', e.target.files[0])}
                    />
                    <small className="text-muted">Upload a profile picture (JPG, PNG, GIF)</small>
                  </div>
                </CCol>
              </CRow> */}
              <CRow>
                <CCol md={4}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Email *</CFormLabel>
                    <CFormInput
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter email"
                    />
                  </div>
                </CCol>
              </CRow>
              <CRow>
                <CCol md={4}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Emergency Contact Name 1</CFormLabel>
                    <CFormInput
                      type="text"
                      value={formData.emergencyContactName}
                      onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                      placeholder="Enter emergency contact name"
                    />
                  </div>
                </CCol>
                <CCol md={4}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Emergency Contact Relation 1</CFormLabel>
                    <AppFormSelect
                      value={formData.emergencyContactRelation}
                      onChange={(e) =>
                        handleInputChange('emergencyContactRelation', e.target.value)
                      }
                    >
                      <option value="">Select Relation</option>
                      <option value="father">Father</option>
                      <option value="mother">Mother</option>
                      <option value="spouse">Spouse</option>
                      <option value="brother">Brother</option>
                      <option value="sister">Sister</option>
                      <option value="son">Son</option>
                      <option value="daughter">Daughter</option>
                      <option value="friend">Friend</option>
                      <option value="other">Other</option>
                    </AppFormSelect>
                  </div>
                </CCol>
                <CCol md={4}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Emergency Contact Number 1</CFormLabel>
                    <CFormInput
                      type="tel"
                      name="emergencyContactNumber"
                      value={formData.emergencyContactNumber}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '')
                        value = value.slice(0, 10)
                        handleInputChange('emergencyContactNumber', value)
                      }}
                      placeholder="Enter emergency contact number"
                      className={getInputClass('emergencyContactNumber')}
                    />
                    {formData.emergencyContactNumber &&
                      formData.emergencyContactNumber.length !== 10 && (
                        <small className="text-danger">
                          Emergency contact number must be exactly 10 digits
                        </small>
                      )}
                    {showValidationErrors && validationErrors.emergencyContactNumber && (
                      <div className="invalid-feedback d-block">
                        {validationErrors.emergencyContactNumber}
                      </div>
                    )}
                  </div>
                </CCol>
              </CRow>
              <CRow>
                <CCol md={4}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Emergency Contact Name 2</CFormLabel>
                    <CFormInput
                      type="text"
                      value={formData.emergencyContactName2}
                      onChange={(e) => handleInputChange('emergencyContactName2', e.target.value)}
                      placeholder="Enter emergency contact name"
                    />
                  </div>
                </CCol>
                <CCol md={4}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Emergency Contact Relation 2</CFormLabel>
                    <AppFormSelect
                      value={formData.emergencyContactRelation2}
                      onChange={(e) =>
                        handleInputChange('emergencyContactRelation2', e.target.value)
                      }
                    >
                      <option value="">Select Relation</option>
                      <option value="father">Father</option>
                      <option value="mother">Mother</option>
                      <option value="spouse">Spouse</option>
                      <option value="brother">Brother</option>
                      <option value="sister">Sister</option>
                      <option value="son">Son</option>
                      <option value="daughter">Daughter</option>
                      <option value="friend">Friend</option>
                      <option value="other">Other</option>
                    </AppFormSelect>
                  </div>
                </CCol>
                <CCol md={4}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Emergency Contact Number 2</CFormLabel>
                    <CFormInput
                      type="tel"
                      name="emergencyContactNumber2"
                      value={formData.emergencyContactNumber2}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '')
                        value = value.slice(0, 10)
                        handleInputChange('emergencyContactNumber2', value)
                      }}
                      placeholder="Enter emergency contact number"
                      className={getInputClass('emergencyContactNumber2')}
                    />
                    {formData.emergencyContactNumber2 &&
                      formData.emergencyContactNumber2.length !== 10 && (
                        <small className="text-danger">
                          Emergency contact number must be exactly 10 digits
                        </small>
                      )}
                    {showValidationErrors && validationErrors.emergencyContactNumber2 && (
                      <div className="invalid-feedback d-block">
                        {validationErrors.emergencyContactNumber2}
                      </div>
                    )}
                  </div>
                </CCol>
              </CRow>
              <CRow>
                <CCol md={4}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Emergency Contact Name 3</CFormLabel>
                    <CFormInput
                      type="text"
                      value={formData.emergencyContactName3}
                      onChange={(e) => handleInputChange('emergencyContactName3', e.target.value)}
                      placeholder="Enter emergency contact name"
                    />
                  </div>
                </CCol>
                <CCol md={4}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Emergency Contact Relation 3</CFormLabel>
                    <AppFormSelect
                      value={formData.emergencyContactRelation3}
                      onChange={(e) =>
                        handleInputChange('emergencyContactRelation3', e.target.value)
                      }
                    >
                      <option value="">Select Relation</option>
                      <option value="father">Father</option>
                      <option value="mother">Mother</option>
                      <option value="spouse">Spouse</option>
                      <option value="brother">Brother</option>
                      <option value="sister">Sister</option>
                      <option value="son">Son</option>
                      <option value="daughter">Daughter</option>
                      <option value="friend">Friend</option>
                      <option value="other">Other</option>
                    </AppFormSelect>
                  </div>
                </CCol>
                <CCol md={4}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Emergency Contact Number 3</CFormLabel>
                    <CFormInput
                      type="tel"
                      name="emergencyContactNumber3"
                      value={formData.emergencyContactNumber3}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '')
                        value = value.slice(0, 10)
                        handleInputChange('emergencyContactNumber3', value)
                      }}
                      placeholder="Enter emergency contact number"
                      className={getInputClass('emergencyContactNumber3')}
                    />
                    {formData.emergencyContactNumber3 &&
                      formData.emergencyContactNumber3.length !== 10 && (
                        <small className="text-danger">
                          Emergency contact number must be exactly 10 digits
                        </small>
                      )}
                    {showValidationErrors && validationErrors.emergencyContactNumber3 && (
                      <div className="invalid-feedback d-block">
                        {validationErrors.emergencyContactNumber3}
                      </div>
                    )}
                  </div>
                </CCol>
              </CRow>
              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Blood Group</CFormLabel>
                    <CFormInput
                      type="text"
                      value={formData.bloodGroup}
                      onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                      placeholder="Enter blood group"
                    />
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Physically Challenged</CFormLabel>
                    <AppFormSelect
                      value={formData.physicallyChallenged}
                      onChange={(e) => handleInputChange('physicallyChallenged', e.target.value)}
                    >
                      <option value="">Select Option</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </AppFormSelect>

                    {/* Conditional input for physically challenged reason */}
                    {formData.physicallyChallenged === 'yes' && (
                      <div className="mt-3">
                        <CFormLabel className="fw-semibold text-primary">
                          <CIcon icon={cilInfo} className="me-1" />
                          Please specify the nature of disability *
                        </CFormLabel>
                        <CFormTextarea
                          name="physicallyChallengedReason"
                          value={formData.physicallyChallengedReason || ''}
                          onChange={(e) =>
                            handleInputChange('physicallyChallengedReason', e.target.value)
                          }
                          placeholder="Please describe the nature of disability or specific challenges..."
                          rows={3}
                          className={getInputClass('physicallyChallengedReason')}
                          required
                        />
                        <small className="text-muted">
                          This information will help us provide appropriate accommodations and
                          support.
                        </small>
                        {showValidationErrors && validationErrors.physicallyChallengedReason && (
                          <div className="invalid-feedback d-block">
                            {validationErrors.physicallyChallengedReason}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CCol>
              </CRow>
              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Father's Name</CFormLabel>
                    <CFormInput
                      type="text"
                      value={formData.fatherName}
                      onChange={(e) => handleInputChange('fatherName', e.target.value)}
                      placeholder="Enter father's name"
                    />
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Mother's Name</CFormLabel>
                    <CFormInput
                      type="text"
                      value={formData.motherName}
                      onChange={(e) => handleInputChange('motherName', e.target.value)}
                      placeholder="Enter mother's name"
                    />
                  </div>
                </CCol>
                <CCol md={4}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Spouse's Name</CFormLabel>
                    <CFormInput
                      type="text"
                      value={formData.spouseName}
                      onChange={(e) => handleInputChange('spouseName', e.target.value)}
                      placeholder="Enter spouse's name"
                    />
                  </div>
                </CCol>
              </CRow>
              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Current Address</CFormLabel>
                    <CFormTextarea
                      value={formData.currentAddress}
                      onChange={(e) => handleInputChange('currentAddress', e.target.value)}
                      placeholder="Enter current address"
                      rows={3}
                    />
                  </div>
                </CCol>
              </CRow>

              {/* Current Address */}
              <CRow className="mt-3">
                <CCol xs={12}>
                  <h6 className="text-muted mb-3">Current Address Details</h6>
                </CCol>

                <CCol md={3}>
                  <CFormLabel>Block</CFormLabel>
                  <CFormInput
                    value={formData.currentBlock || ''}
                    onChange={(e) => handleInputChange('currentBlock', e.target.value)}
                    placeholder="Enter Block"
                  />
                </CCol>
                <CCol md={3}>
                  <CFormLabel>Village</CFormLabel>
                  <CFormInput
                    value={formData.currentVillage || ''}
                    onChange={(e) => handleInputChange('currentVillage', e.target.value)}
                    placeholder="Enter Village"
                  />
                </CCol>
                <CCol md={3}>
                  <CFormLabel>District</CFormLabel>
                  <CFormInput
                    value={formData.currentDistrict || ''}
                    onChange={(e) => handleInputChange('currentDistrict', e.target.value)}
                    placeholder="Enter District"
                  />
                </CCol>
                <CCol md={3}>
                  <CFormLabel>State</CFormLabel>
                  <CFormInput
                    value={formData.currentState || ''}
                    onChange={(e) => handleInputChange('currentState', e.target.value)}
                    placeholder="Enter State"
                  />
                </CCol>
              </CRow>

              <CRow className="mt-3">
                <CCol md={3}>
                  <CFormLabel>Country</CFormLabel>
                  <CFormInput
                    value={formData.currentCountry || 'India'}
                    onChange={(e) => handleInputChange('currentCountry', e.target.value)}
                    placeholder="Enter Country"
                  />
                </CCol>
                <CCol md={3}>
                  <CFormLabel>Pincode</CFormLabel>
                  <CFormInput
                    value={formData.currentPincode || ''}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, '').slice(0, 7)
                      handleInputChange('currentPincode', value)
                    }}
                    placeholder="Enter Pincode"
                    maxLength={7}
                  />
                </CCol>
              </CRow>
              <CRow className="mt-3">
                <CCol xs={12}>
                  <CFormCheck
                    label="Permanent address same as current address"
                    checked={formData.sameAsCurrentAddress || false}
                    onChange={(e) => {
                      const checked = e.target.checked
                      setFormData((prev) => {
                        if (checked) {
                          return {
                            ...prev,
                            sameAsCurrentAddress: true,
                            permanentAddress: prev.currentAddress,
                            permanentBlock: prev.currentBlock,
                            permanentVillage: prev.currentVillage,
                            permanentDistrict: prev.currentDistrict,
                            permanentState: prev.currentState,
                            permanentCountry: prev.currentCountry || 'India',
                            permanentPincode: prev.currentPincode,
                          }
                        } else {
                          return {
                            ...prev,
                            sameAsCurrentAddress: false,
                            permanentAddress: '',
                            permanentBlock: '',
                            permanentVillage: '',
                            permanentDistrict: '',
                            permanentState: '',
                            permanentCountry: 'India',
                            permanentPincode: '',
                          }
                        }
                      })
                    }}
                  />
                </CCol>
              </CRow>
              {/* Permanent Address */}
              <CRow className="mt-3">
                <CCol xs={12}>
                  <h6 className="text-muted mb-3">Permanent Address Details</h6>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Permanent Address</CFormLabel>
                    <CFormTextarea
                      value={formData.permanentAddress}
                      onChange={(e) => handleInputChange('permanentAddress', e.target.value)}
                      placeholder="Enter permanent address"
                      rows={3}
                    />
                  </div>
                </CCol>
              </CRow>
              <CRow className="mt-3">
                <CCol md={3}>
                  <CFormLabel>Block</CFormLabel>
                  <CFormInput
                    value={formData.permanentBlock || ''}
                    onChange={(e) => handleInputChange('permanentBlock', e.target.value)}
                    placeholder="Enter Block"
                  />
                </CCol>
                <CCol md={3}>
                  <CFormLabel>Village</CFormLabel>
                  <CFormInput
                    value={formData.permanentVillage || ''}
                    onChange={(e) => handleInputChange('permanentVillage', e.target.value)}
                    placeholder="Enter Village"
                  />
                </CCol>
                <CCol md={3}>
                  <CFormLabel>District</CFormLabel>
                  <CFormInput
                    value={formData.permanentDistrict || ''}
                    onChange={(e) => handleInputChange('permanentDistrict', e.target.value)}
                    placeholder="Enter District"
                  />
                </CCol>
                <CCol md={3}>
                  <CFormLabel>State</CFormLabel>
                  <CFormInput
                    value={formData.permanentState || ''}
                    onChange={(e) => handleInputChange('permanentState', e.target.value)}
                    placeholder="Enter State"
                  />
                </CCol>
              </CRow>

              <CRow className="mt-3">
                <CCol md={3}>
                  <CFormLabel>Country</CFormLabel>
                  <CFormInput
                    value={formData.permanentCountry || 'India'}
                    onChange={(e) => handleInputChange('permanentCountry', e.target.value)}
                    placeholder="Enter Country"
                  />
                </CCol>
                <CCol md={3}>
                  <CFormLabel>Pincode</CFormLabel>
                  <CFormInput
                    value={formData.permanentPincode || ''}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, '').slice(0, 7)
                      handleInputChange('permanentPincode', value)
                    }}
                    placeholder="Enter Pincode"
                    maxLength={7}
                  />
                </CCol>
              </CRow>

              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Qualification</CFormLabel>
                    <CFormInput
                      type="text"
                      value={formData.qualification}
                      onChange={(e) => handleInputChange('qualification', e.target.value)}
                      placeholder="Enter educational qualification"
                    />
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Last Occupation</CFormLabel>
                    <CFormInput
                      type="text"
                      value={formData.lastOccupation}
                      onChange={(e) => handleInputChange('lastOccupation', e.target.value)}
                      placeholder="Enter last occupation"
                    />
                  </div>
                </CCol>
              </CRow>
              <CRow>
                <CCol md={4}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Reference of Joining</CFormLabel>
                    <CFormInput
                      type="text"
                      value={formData.referenceOfJoining}
                      onChange={(e) => handleInputChange('referenceOfJoining', e.target.value)}
                      placeholder="Enter reference of joining"
                    />
                  </div>
                </CCol>
                <CCol md={4}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Aadhar Number</CFormLabel>
                    <CFormInput
                      type="text"
                      value={formData.aadharNo}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '')
                        value = value.slice(0, 12)
                        value = value.replace(/(\d{4})(?=\d)/g, '$1 ')

                        handleInputChange('aadharNo', value)
                      }}
                      placeholder="1234 5678 9012"
                      maxLength={14}
                    />
                  </div>
                </CCol>

                <CCol md={4}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">PAN Number</CFormLabel>
                    <CFormInput
                      type="text"
                      value={formData.panNo || ''}
                      onChange={(e) => {
                        let value = e.target.value || ''
                        value = value.toUpperCase() // Convert to uppercase
                        value = value.slice(0, 10)
                        handleInputChange('panNo', value)
                      }}
                      placeholder="Enter PAN number"
                      maxLength={10}
                      style={{ textTransform: 'uppercase' }}
                    />
                  </div>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>

          {/* Profile Information Section */}
          <CCard className="mb-4">
            <CCardHeader className="bg-primary text-white">
              <h5 className="mb-0 d-flex align-items-center">
                <CIcon icon={cilUser} className="me-2" />
                Profile Information
              </h5>
            </CCardHeader>
            <CCardBody>
              <CRow>
                {/* <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Employee ID *</CFormLabel>
                    <CFormInput
                      type="text"
                      value={formData.employeeId}
                      onChange={(e) => handleInputChange('employeeId', e.target.value)}
                      placeholder="Enter employee ID"
                      required
                    />
                  </div>
                </CCol> */}

                {/* <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Attendance Supervisor</CFormLabel>
                    <CFormInput
                      type="text"
                      value={formData.attendanceSupervisor}
                      onChange={(e) => handleInputChange('attendanceSupervisor', e.target.value)}
                      placeholder="Enter attendance supervisor"
                    />
                  </div>
                </CCol> */}
                {/* <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Contact Number *</CFormLabel>
                    <CFormInput
                      type="tel"
                      value={formData.contactNumber}
                      onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                      placeholder="Enter contact number"
                      required
                    />
                  </div>
                </CCol> */}
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Department *</CFormLabel>
                    <AppFormSelect
                      name="department"
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className={getSelectClass('department')}
                      required
                    >
                      <option value="">Select Department</option>
                      <option value="technical">Technical</option>
                      <option value="management">Management</option>
                    </AppFormSelect>
                    {showValidationErrors && validationErrors.department && (
                      <div className="invalid-feedback d-block">{validationErrors.department}</div>
                    )}
                  </div>
                </CCol>
                <CCol md={6}>
                  <CFormLabel className="fw-semibold">Staff Assets Records</CFormLabel>
                  <CFormTextarea
                    value={formData.remark}
                    placeholder="Please Enter Staff Assets Records for this Employee"
                    className="bg-light"
                    onChange={(e) => handleInputChange('remark', e.target.value)}
                    rows={3}
                  />
                </CCol>
              </CRow>
              <CRow>
                {/* <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Staff Type *</CFormLabel>
                    <AppFormSelect
                      value={formData.staffType}
                      onChange={(e) => handleInputChange('staffType', e.target.value)}
                      required
                    >
                      <option value="">Select Staff Type</option>
                      <option value="permanent">Permanent</option>
                      <option value="contract">Contract</option>
                      <option value="temporary">Temporary</option>
                      <option value="intern">Intern</option>
                    </AppFormSelect>
                  </div>
                </CCol> */}
              </CRow>
              <CRow>
                {/* <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Contact Number *</CFormLabel>
                    <CFormInput
                      type="tel"
                      value={formData.contactNumber}
                      onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                      placeholder="Enter contact number"
                      required
                    />
                  </div>
                </CCol> */}
                {/* <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Designation *</CFormLabel>
                    <CFormInput
                      type="text"
                      value={formData.designation}
                      onChange={(e) => handleInputChange('designation', e.target.value)}
                      placeholder="Enter designation"
                      required
                    />
                  </div>
                </CCol> */}
              </CRow>
            </CCardBody>
          </CCard>

          {/* Employment Information Section */}
          <CCard className="mb-4">
            <CCardHeader className="bg-primary text-white">
              <h5 className="mb-0 d-flex align-items-center">
                <CIcon icon={cilBriefcase} className="me-2" />
                Employment Information
              </h5>
            </CCardHeader>
            <CCardBody>
              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Joining Date *</CFormLabel>
                    <CFormInput
                      type="date"
                      value={formData.joiningDate}
                      onChange={(e) => handleInputChange('joiningDate', e.target.value)}
                      required
                    />
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Employee Type *</CFormLabel>
                    <AppFormSelect
                      value={formData.employeeType}
                      onChange={(e) => handleInputChange('employeeType', e.target.value)}
                      required
                    >
                      <option value="">Select Employee Type</option>
                      <option value="permanent">Permanent</option>
                      <option value="contract">Contract</option>
                      <option value="temporary">Temporary</option>
                      <option value="intern">Intern</option>
                    </AppFormSelect>
                  </div>
                </CCol>
              </CRow>
              <CRow>
                {/* <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Basic Salary *</CFormLabel>
                    <CFormInput
                      type="number"
                      value={formData.basicSalary}
                      onChange={(e) => handleInputChange('basicSalary', e.target.value)}
                      placeholder="Enter basic salary"
                      required
                    />
                  </div>
                </CCol> */}
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Status *</CFormLabel>
                    <AppFormSelect
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      required
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="terminated">Terminated</option>
                      <option value="on-leave">On Leave</option>
                    </AppFormSelect>
                  </div>
                </CCol>
              </CRow>
              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">CTC Per Month</CFormLabel>
                    <CFormInput
                      type="number"
                      value={formData.ctcPerMonth}
                      onChange={(e) => {
                        const value = e.target.value
                        handleInputChange('ctcPerMonth', value)
                        // Auto-convert to words
                        const words = numberToWords(value)
                        handleInputChange('ctcPerMonthInWords', words)
                      }}
                      placeholder="Enter CTC per month"
                    />
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">CTC Per Month in Words</CFormLabel>
                    <CFormInput
                      type="text"
                      value={formData.ctcPerMonthInWords}
                      placeholder="Auto-generated from CTC amount"
                      readOnly
                      className="bg-light"
                      style={{
                        cursor: 'not-allowed',
                        backgroundColor: '#f8f9fa !important',
                        borderColor: '#dee2e6',
                      }}
                    />
                    {formData.ctcPerMonthInWords && (
                      <small className="text-success d-flex align-items-center mt-1">
                        <CIcon icon={cilCheckCircle} className="me-1" size="sm" />
                        Auto-generated from {formData.ctcPerMonth} rupees
                      </small>
                    )}
                  </div>
                </CCol>
              </CRow>
              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">HRA</CFormLabel>
                    <CFormInput
                      type="number"
                      value={formData.hra}
                      onChange={(e) => {
                        const value = e.target.value
                        handleInputChange('hra', value)
                        // Auto-convert to words
                        const words = numberToWords(value)
                        handleInputChange('hraInWords', words)
                      }}
                      placeholder="Enter HRA amount"
                    />
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">HRA in Words</CFormLabel>
                    <CFormInput
                      type="text"
                      value={formData.hraInWords}
                      placeholder="Auto-generated from HRA amount"
                      readOnly
                      className="bg-light"
                      style={{
                        cursor: 'not-allowed',
                        backgroundColor: '#f8f9fa !important',
                        borderColor: '#dee2e6',
                      }}
                    />
                    {formData.hraInWords && (
                      <small className="text-success d-flex align-items-center mt-1">
                        <CIcon icon={cilCheckCircle} className="me-1" size="sm" />
                        Auto-generated from {formData.hra} rupees
                      </small>
                    )}
                  </div>
                </CCol>
              </CRow>
              <CRow>
                <CCol md={12}>
                  <div className="mb-3">
                    <CFormCheck
                      type="checkbox"
                      id="isCore"
                      label="Core"
                      checked={formData.isCore}
                      onChange={(e) => handleInputChange('isCore', e.target.checked)}
                    />
                  </div>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>

          {/* Bank Details Section */}
          <CCard className="mb-4">
            <CCardHeader className="bg-primary text-white">
              <h5 className="mb-0 d-flex align-items-center">
                <CIcon icon={cilCreditCard} className="me-2" />
                Bank Details
              </h5>
            </CCardHeader>
            <CCardBody>
              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Bank Name *</CFormLabel>
                    <CFormInput
                      type="text"
                      name="bankName"
                      value={formData.bankName}
                      onChange={(e) => handleInputChange('bankName', e.target.value)}
                      placeholder="Enter bank name"
                      className={getInputClass('bankName')}
                      required
                    />
                    {showValidationErrors && validationErrors.bankName && (
                      <div className="invalid-feedback d-block">{validationErrors.bankName}</div>
                    )}
                  </div>
                </CCol>

                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Account Number *</CFormLabel>
                    <CFormInput
                      type="text"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '')
                        value = value.slice(0, 18)
                        handleInputChange('accountNumber', value)
                      }}
                      placeholder="Enter account number"
                      className={getInputClass('accountNumber')}
                      required
                    />
                    {formData.accountNumber &&
                      (formData.accountNumber.length < 9 || formData.accountNumber.length > 18) && (
                        <small className="text-danger">
                          Account number must be between 9 and 18 digits
                        </small>
                      )}
                    {showValidationErrors && validationErrors.accountNumber && (
                      <div className="invalid-feedback d-block">
                        {validationErrors.accountNumber}
                      </div>
                    )}
                  </div>
                </CCol>
              </CRow>
              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">IFSC Code *</CFormLabel>
                    <CFormInput
                      type="text"
                      name="ifscCode"
                      value={formData.ifscCode}
                      onChange={(e) => handleInputChange('ifscCode', e.target.value)}
                      placeholder="Enter IFSC code"
                      className={getInputClass('ifscCode')}
                      required
                    />
                    {showValidationErrors && validationErrors.ifscCode && (
                      <div className="invalid-feedback d-block">{validationErrors.ifscCode}</div>
                    )}
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Branch Name *</CFormLabel>
                    <CFormInput
                      type="text"
                      name="branchName"
                      value={formData.branchName}
                      onChange={(e) => handleInputChange('branchName', e.target.value)}
                      placeholder="Enter branch name"
                      className={getInputClass('branchName')}
                      required
                    />
                    {showValidationErrors && validationErrors.branchName && (
                      <div className="invalid-feedback d-block">{validationErrors.branchName}</div>
                    )}
                  </div>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>

          {/* Job Details Section */}
          <CCard className="mb-4">
            <CCardHeader className="bg-primary text-white">
              <h5 className="mb-0 d-flex align-items-center">
                <CIcon icon={cilBuilding} className="me-2" />
                Job Details
              </h5>
            </CCardHeader>
            <CCardBody>
              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">MA Location *</CFormLabel>

                    <AppFormSelect
                      name="location"
                      value={formData.location}
                      onChange={(e) => {
                        const selectedValue = e.target.value
                        const selectedLoc = locations.find((loc) => loc.value === selectedValue)
                        handleInputChange('location', selectedValue)
                        handleInputChange(
                          'raLocation',
                          selectedLoc?.name || selectedLoc?.label || '',
                        )
                      }}
                      className={getSelectClass('location')}
                      required
                      disabled={isLoadingData}
                    >
                      {locations.map((location) => (
                        <option key={location.value} value={location.value}>
                          {location.label}
                        </option>
                      ))}
                    </AppFormSelect>
                    {showValidationErrors && validationErrors.location && (
                      <div className="invalid-feedback d-block">{validationErrors.location}</div>
                    )}
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Work Location *</CFormLabel>
                    <CFormInput
                      type="text"
                      name="workLocation"
                      value={formData.workLocation || ''}
                      onChange={(e) => handleInputChange('workLocation', e.target.value || '')}
                      placeholder="Enter work location"
                      className={getInputClass('workLocation')}
                      required
                    />
                    {showValidationErrors && validationErrors.workLocation && (
                      <div className="invalid-feedback d-block">
                        {validationErrors.workLocation}
                      </div>
                    )}
                  </div>
                </CCol>
              </CRow>

              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Company *</CFormLabel>
                    <AppFormSelect
                      name="company"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      className={getSelectClass('company')}
                      required
                      disabled={isLoadingData}
                    >
                      {companyOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </AppFormSelect>
                    {showValidationErrors && validationErrors.company && (
                      <div className="invalid-feedback d-block">{validationErrors.company}</div>
                    )}
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Reporting Manager</CFormLabel>

                    <AppFormSelect
                      value={formData.reportingManager}
                      onChange={(e) => {
                        const selectedId = e.target.value
                        const selectedManager = managers.find((m) => m.value === selectedId)

                        // Store both ID and Name
                        setFormData((prev) => ({
                          ...prev,
                          reportingManager: selectedId,
                          reportingManagerName: selectedManager?.label || '',
                        }))
                      }}
                      disabled={isLoadingData}
                    >
                      <option value="">Select Reporting Manager</option>
                      {managers.map((manager) => (
                        <option key={manager.value} value={manager.value}>
                          {manager.label} {manager.role ? `(${manager.role})` : ''}
                        </option>
                      ))}
                    </AppFormSelect>
                  </div>
                </CCol>
              </CRow>
              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Leave Authority One</CFormLabel>

                    <AppFormSelect
                      value={formData.leaveAuthorityOne}
                      onChange={(e) => {
                        const selectedId = e.target.value
                        const selectedManager = managers.find((m) => m.value === selectedId)

                        // Store both ID and Name
                        setFormData((prev) => ({
                          ...prev,
                          leaveAuthorityOne_id: selectedId,
                          leaveAuthorityOneName: selectedManager?.label || '',
                        }))
                      }}
                      disabled={isLoadingData}
                    >
                      <option value="">Select Leave Authority One</option>
                      {managers.map((manager) => (
                        <option key={manager.value} value={manager.value}>
                          {manager.label} {manager.role ? `(${manager.role})` : ''}
                        </option>
                      ))}
                    </AppFormSelect>
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Leave Authority Two</CFormLabel>

                    <AppFormSelect
                      value={formData.leaveAuthorityTwo}
                      onChange={(e) => {
                        const selectedId = e.target.value
                        const selectedManager = managers.find((m) => m.value === selectedId)

                        // Store both ID and Name
                        setFormData((prev) => ({
                          ...prev,
                          leaveAuthorityTwo_id: selectedId,
                          leaveAuthorityTwoName: selectedManager?.label || '',
                        }))
                      }}
                      disabled={isLoadingData}
                    >
                      <option value="">Select Leave Authority Two</option>
                      {managers.map((manager) => (
                        <option key={manager.value} value={manager.value}>
                          {manager.label} {manager.role ? `(${manager.role})` : ''}
                        </option>
                      ))}
                    </AppFormSelect>
                  </div>
                </CCol>
              </CRow>
              <CRow>
                {/* <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Salary</CFormLabel>
                    <CFormInput
                      type="number"
                      value={formData.salary}
                      onChange={(e) => handleInputChange('salary', e.target.value)}
                      placeholder="Enter salary amount"
                    />
                  </div>
                </CCol> */}
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Shift</CFormLabel>
                    <AppFormSelect
                      value={formData.shift}
                      onChange={(e) => handleInputChange('shift', e.target.value)}
                    >
                      <option value="day">Day Shift</option>
                      <option value="night">Night Shift</option>
                      <option value="rotational">Rotational</option>
                    </AppFormSelect>
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Work Type</CFormLabel>
                    <AppFormSelect
                      value={formData.workType}
                      onChange={(e) => handleInputChange('workType', e.target.value)}
                    >
                      <option value="full-time">Full Time</option>
                      <option value="part-time">Part Time</option>
                      <option value="contract">Contract</option>
                    </AppFormSelect>
                  </div>
                </CCol>
              </CRow>
              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Role *</CFormLabel>
                    <AsyncSelect
                      name="role"
                      loadOptions={loadRoleOptions}
                      defaultOptions={defaultRoleOptions}
                      isMulti
                      isSearchable
                      placeholder="Select roles..."
                      value={
                        Array.isArray(formData.role)
                          ? formData.role
                              .map((roleId) =>
                                defaultRoleOptions.find((option) => option.value === roleId),
                              )
                              .filter(Boolean)
                          : []
                      }
                      getOptionLabel={(option) => option.label}
                      getOptionValue={(option) => option.value}
                      onChange={handleRoleChange}
                      isDisabled={isLoadingData}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          minHeight: '38px',
                          border: '1px solid #ced4da',
                          borderRadius: '0.375rem',
                          '&:hover': {
                            borderColor: '#86b7fe',
                          },
                        }),
                        multiValue: (provided) => ({
                          ...provided,
                          backgroundColor: '#e3f2fd',
                          borderRadius: '4px',
                        }),
                        multiValueLabel: (provided) => ({
                          ...provided,
                          color: '#1976d2',
                          fontSize: '0.875rem',
                        }),
                        multiValueRemove: (provided) => ({
                          ...provided,
                          color: '#1976d2',
                          '&:hover': {
                            backgroundColor: '#bbdefb',
                            color: '#0d47a1',
                          },
                        }),
                      }}
                    />
                    <small className="text-muted">
                      You can select multiple roles for this employee
                    </small>
                    {showValidationErrors && validationErrors.role && (
                      <div className="invalid-feedback d-block">{validationErrors.role}</div>
                    )}
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Holiday Template *</CFormLabel>
                    <AsyncSelect
                      name="template"
                      isMulti
                      isSearchable
                      placeholder="Select holiday templates..."
                      loadOptions={async (inputValue, callback) => {
                        try {
                          // Filter templates based on inputValue
                          const filtered = templates.filter((t) =>
                            t.name.toLowerCase().includes(inputValue.toLowerCase()),
                          )
                          callback(filtered.map((t) => ({ value: t._id, label: t.name })))
                        } catch (err) {
                          console.error(err)
                          callback([])
                        }
                      }}
                      defaultOptions={templates.map((t) => ({ value: t._id, label: t.name }))}
                      value={
                        Array.isArray(formData.template)
                          ? formData.template
                              .map((id) => templates.find((t) => t._id === id))
                              .filter(Boolean)
                              .map((t) => ({ value: t._id, label: t.name }))
                          : []
                      }
                      getOptionLabel={(option) => option.label}
                      getOptionValue={(option) => option.value}
                      onChange={(selectedOptions) => {
                        const selectedIds = Array.isArray(selectedOptions)
                          ? selectedOptions.map((o) => o.value)
                          : []
                        setFormData({ ...formData, template: selectedIds })
                      }}
                      isDisabled={isLoadingData}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          minHeight: '38px',
                          border: '1px solid #ced4da',
                          borderRadius: '0.375rem',
                          '&:hover': { borderColor: '#86b7fe' },
                        }),
                        multiValue: (provided) => ({
                          ...provided,
                          backgroundColor: '#e3f2fd',
                          borderRadius: '4px',
                        }),
                        multiValueLabel: (provided) => ({
                          ...provided,
                          color: '#1976d2',
                          fontSize: '0.875rem',
                        }),
                        multiValueRemove: (provided) => ({
                          ...provided,
                          color: '#1976d2',
                          '&:hover': {
                            backgroundColor: '#bbdefb',
                            color: '#0d47a1',
                          },
                        }),
                      }}
                    />
                    <small className="text-muted">
                      You can select multiple holiday templates for this employee
                    </small>
                    {showValidationErrors && validationErrors.template && (
                      <div className="invalid-feedback d-block">{validationErrors.template}</div>
                    )}
                  </div>
                </CCol>
              </CRow>

              {/* Conditional Fields based on Role Selection */}
              {showFields.ra_branch && (
                <CRow>
                  <CCol md={6}>
                    <div className="mb-3">
                      <CFormLabel className="fw-semibold">RA-Branch *</CFormLabel>
                      <AppFormSelect
                        name="ra_branch"
                        value={formData.ra_branch}
                        onChange={(e) => handleInputChange('ra_branch', e.target.value)}
                        className={getSelectClass('ra_branch')}
                        required
                        disabled={isLoadingData}
                      >
                        {locations.map((location) => (
                          <option key={location.value} value={location.value}>
                            {location.label}
                          </option>
                        ))}
                      </AppFormSelect>
                      <small className="text-muted">Select MA Branch for Branch Manager role</small>
                      {showValidationErrors && validationErrors.ra_branch && (
                        <div className="invalid-feedback d-block">{validationErrors.ra_branch}</div>
                      )}
                    </div>
                  </CCol>
                </CRow>
              )}

              {showFields.group && (
                <CRow>
                  <CCol md={6}>
                    <div className="mb-3">
                      <CFormLabel className="fw-semibold">Group *</CFormLabel>
                      <AsyncSelect
                        name="group"
                        loadOptions={loadGroupOptions}
                        defaultOptions={defaultGroupOptions}
                        isMulti // IMPORTANT -> multiple select on
                        isSearchable
                        placeholder="Select groups..."
                        value={
                          Array.isArray(formData.group)
                            ? formData.group
                                .map((groupId) =>
                                  (defaultGroupOptions || []).find(
                                    (option) => option.value === groupId,
                                  ),
                                )
                                .filter(Boolean)
                            : []
                        }
                        getOptionLabel={(option) => option.label}
                        getOptionValue={(option) => option.value}
                        onChange={handleGroupChange}
                        isDisabled={isLoadingData}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        styles={{
                          control: (provided) => ({
                            ...provided,
                            minHeight: '38px',
                            border: '1px solid #ced4da',
                            borderRadius: '0.375rem',
                            '&:hover': {
                              borderColor: '#86b7fe',
                            },
                          }),
                          multiValue: (provided) => ({
                            ...provided,
                            backgroundColor: '#e3f2fd',
                            borderRadius: '4px',
                          }),
                          multiValueLabel: (provided) => ({
                            ...provided,
                            color: '#1976d2',
                            fontSize: '0.875rem',
                          }),
                          multiValueRemove: (provided) => ({
                            ...provided,
                            color: '#1976d2',
                            '&:hover': {
                              backgroundColor: '#bbdefb',
                              color: '#0d47a1',
                            },
                          }),
                        }}
                      />
                      <small className="text-muted">
                        You can select multiple groups for this employee
                      </small>
                      {showValidationErrors && validationErrors.group && (
                        <div className="invalid-feedback d-block">{validationErrors.group}</div>
                      )}
                    </div>
                  </CCol>
                </CRow>
              )}

              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Admin Status *</CFormLabel>
                    <div className="mt-2">
                      <div className="d-flex gap-4">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="adminStatus"
                            id="adminActive"
                            value="active"
                            checked={formData.adminStatus === 'active'}
                            onChange={(e) => handleInputChange('adminStatus', e.target.value)}
                          />
                          <label className="form-check-label" htmlFor="adminActive">
                            Active
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="adminStatus"
                            id="adminInactive"
                            value="inactive"
                            checked={formData.adminStatus === 'inactive'}
                            onChange={(e) => handleInputChange('adminStatus', e.target.value)}
                          />
                          <label className="form-check-label" htmlFor="adminInactive">
                            Inactive
                          </label>
                        </div>
                      </div>
                      <small className="text-muted d-block mt-1">
                        Select admin status for this employee
                      </small>
                      {showValidationErrors && validationErrors.adminStatus && (
                        <div className="invalid-feedback d-block">
                          {validationErrors.adminStatus}
                        </div>
                      )}
                    </div>
                  </div>
                </CCol>
              </CRow>
              {/* <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Shift</CFormLabel>
                    <AppFormSelect
                      value={formData.shift}
                      onChange={(e) => handleInputChange('shift', e.target.value)}
                    >
                      <option value="day">Day Shift</option>
                      <option value="night">Night Shift</option>
                      <option value="rotational">Rotational</option>
                    </AppFormSelect>
                  </div>
                </CCol>
              </CRow> */}
            </CCardBody>
          </CCard>

          {/* Important Dates Section */}
          <CCard className="mb-4">
            <CCardHeader className="bg-primary text-white">
              <h5 className="mb-0 d-flex align-items-center">
                <CIcon icon={cilCalendar} className="me-2" />
                Important Dates
              </h5>
            </CCardHeader>
            <CCardBody>
              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Onboarding Date *</CFormLabel>
                    <CFormInput
                      type="date"
                      name="onboardingDate"
                      value={formData.onboardingDate}
                      onChange={(e) => handleInputChange('onboardingDate', e.target.value)}
                      className={getInputClass('onboardingDate')}
                      required
                    />
                    {showValidationErrors && validationErrors.onboardingDate && (
                      <div className="invalid-feedback d-block">
                        {validationErrors.onboardingDate}
                      </div>
                    )}
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Joining Date *</CFormLabel>
                    <CFormInput
                      type="date"
                      name="joiningDate"
                      value={formData.joiningDate}
                      onChange={(e) => handleInputChange('joiningDate', e.target.value)}
                      className={getInputClass('joiningDate')}
                      required
                    />
                    <small className="text-muted">
                      Employee will be automatically activated on this date
                    </small>
                    {showValidationErrors && validationErrors.joiningDate && (
                      <div className="invalid-feedback d-block">{validationErrors.joiningDate}</div>
                    )}
                  </div>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>

          {/* Automatic Punchout Settings Section */}
          <CCard className="mb-4">
            <CCardHeader className="bg-primary text-white">
              <h5 className="mb-0 d-flex align-items-center">
                <CIcon icon={cilClock} className="me-2" />
                Automatic Punchout Settings
              </h5>
            </CCardHeader>
            <CCardBody>
              <div className="border rounded p-3 bg-light">
                <div className="mb-3">
                  <CFormCheck
                    type="checkbox"
                    id="auto_punchout_enabled"
                    label="Enable Automatic Punchout (Inactivity-based)"
                    checked={formData.auto_punchout_enabled}
                    onChange={(e) => handleInputChange('auto_punchout_enabled', e.target.checked)}
                  />
                  <small className="text-muted d-block mt-1">
                    Automatically punch out this employee after specified inactivity period
                  </small>
                </div>

                {formData.auto_punchout_enabled && (
                  <>
                    <CRow>
                      <CCol md={6}>
                        <div className="mb-3">
                          <CFormLabel className="fw-semibold">Inactivity Timeout</CFormLabel>
                          <AppFormSelect
                            value={formData.inactivity_timeout_minutes}
                            onChange={(e) =>
                              handleInputChange(
                                'inactivity_timeout_minutes',
                                parseInt(e.target.value),
                              )
                            }
                            className="form-control"
                          >
                            <option value={5}>5 minutes</option>
                            <option value={15}>15 minutes</option>
                            <option value={30}>30 minutes</option>
                            <option value={45}>45 minutes</option>
                            <option value={60}>1 hour</option>
                            <option value={90}>1.5 hours</option>
                            <option value={120}>2 hours</option>
                            <option value={180}>3 hours</option>
                            <option value={240}>4 hours</option>
                            <option value={480}>8 hours</option>
                            <option value={540}>9 hours</option>
                            <option value={600}>10 hours</option>
                            <option value={660}>11 hours</option>
                            <option value={720}>12 hours</option>
                          </AppFormSelect>
                          <small className="text-muted d-block mt-1">
                            Time of inactivity before automatic punchout
                          </small>
                        </div>
                      </CCol>
                      <CCol md={6}>
                        <div className="mb-3">
                          <CFormLabel className="fw-semibold">Timezone</CFormLabel>
                          <AppFormSelect
                            value={formData.auto_punchout_timezone}
                            onChange={(e) =>
                              handleInputChange('auto_punchout_timezone', e.target.value)
                            }
                          >
                            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                            <option value="UTC">UTC</option>
                            <option value="America/New_York">America/New_York (EST)</option>
                            <option value="Europe/London">Europe/London (GMT)</option>
                          </AppFormSelect>
                          <small className="text-muted d-block mt-1">
                            Timezone for inactivity tracking
                          </small>
                        </div>
                      </CCol>
                    </CRow>

                    <div className="mb-3">
                      <CFormLabel className="fw-semibold">Working Days</CFormLabel>
                      <div className="row">
                        {[
                          { key: 'monday', label: 'Mon' },
                          { key: 'tuesday', label: 'Tue' },
                          { key: 'wednesday', label: 'Wed' },
                          { key: 'thursday', label: 'Thu' },
                          { key: 'friday', label: 'Fri' },
                          { key: 'saturday', label: 'Sat' },
                          { key: 'sunday', label: 'Sun' },
                        ].map((day) => (
                          <div key={day.key} className="col-3 mb-2">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`day_${day.key}`}
                                checked={formData.auto_punchout_days.includes(day.key)}
                                onChange={(e) => {
                                  const newDays = e.target.checked
                                    ? [...formData.auto_punchout_days, day.key]
                                    : formData.auto_punchout_days.filter((d) => d !== day.key)
                                  handleInputChange('auto_punchout_days', newDays)
                                }}
                              />
                              <label className="form-check-label" htmlFor={`day_${day.key}`}>
                                {day.label}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                      <small className="text-muted d-block mt-1">
                        Select days when automatic punchout should be active
                      </small>
                    </div>

                    <div className="alert alert-info">
                      <h6 className="mb-2">
                        <CIcon icon={cilClock} className="me-2" />
                        How it works:
                      </h6>
                      <ul className="mb-0 small">
                        <li>
                          System tracks user activity (mouse movement, clicks, keyboard input)
                        </li>
                        <li>
                          If no activity for{' '}
                          <strong>{formData.inactivity_timeout_minutes} minutes</strong>, automatic
                          punchout occurs
                        </li>
                        <li>Only active on selected working days</li>
                        <li>User will be notified before punchout (optional)</li>
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </CCardBody>
          </CCard>

          {/* Today Done Settings Section */}
          <CCard className="mb-4">
            <CCardHeader className="bg-success text-white">
              <h5 className="mb-0 d-flex align-items-center">
                <CIcon icon={cilCheckCircle} className="me-2" />
                Today Done Settings
              </h5>
            </CCardHeader>
            <CCardBody>
              <div className="border rounded p-3 bg-light">
                <div className="mb-3">
                  <CFormCheck
                    type="checkbox"
                    id="today_done_enabled"
                    label="Enable Today Done (Auto mark day as done at specified time)"
                    checked={formData.today_done_enabled}
                    onChange={(e) => handleInputChange('today_done_enabled', e.target.checked)}
                  />
                  <small className="text-muted d-block mt-1">
                    Automatically mark the day as &quot;done&quot; at the specified time for each day
                  </small>
                </div>

                {formData.today_done_enabled && (
                  <>
                    <div className="mb-3">
                      <CFormLabel className="fw-semibold mb-3">Select Days</CFormLabel>
                      <div className="row g-2">
                        {[
                          { key: 'sunday', label: 'Sun' },
                          { key: 'monday', label: 'Mon' },
                          { key: 'tuesday', label: 'Tue' },
                          { key: 'wednesday', label: 'Wed' },
                          { key: 'thursday', label: 'Thu' },
                          { key: 'friday', label: 'Fri' },
                          { key: 'saturday', label: 'Sat' },
                        ].map((day) => (
                          <div key={day.key} className="col-auto">
                            <div
                              className={`btn ${formData.today_done_days[day.key]?.enabled ? 'btn-success' : 'btn-outline-secondary'}`}
                              style={{ minWidth: '60px', cursor: 'pointer' }}
                              onClick={() => {
                                handleInputChange('today_done_days', {
                                  ...formData.today_done_days,
                                  [day.key]: {
                                    ...formData.today_done_days[day.key],
                                    enabled: !formData.today_done_days[day.key]?.enabled,
                                  },
                                })
                              }}
                            >
                              {day.label}
                            </div>
                          </div>
                        ))}
                      </div>
                      <small className="text-muted d-block mt-2">
                        Click on days to enable/disable Today Done
                      </small>
                    </div>

                    <div className="alert alert-success">
                      <h6 className="mb-2">
                        <CIcon icon={cilCheckCircle} className="me-2" />
                        How it works:
                      </h6>
                      <ul className="mb-0 small">
                        <li>Enable the days you want to auto-mark as &quot;Today Done&quot;</li>
                        <li>Set the time for each enabled day</li>
                        <li>
                          At the specified time, the system will automatically mark the day as done
                        </li>
                        <li>This helps track daily work completion automatically</li>
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </CCardBody>
          </CCard>

          {/* Action Buttons */}
          <CRow className="mb-4">
            <CCol className="d-flex justify-content-end gap-3">
              <CButton color="secondary" onClick={handleCancel} disabled={isSubmitting}>
                <CIcon icon={cilXCircle} className="me-1" />
                Cancel
              </CButton>
              <CButton color="primary" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <CSpinner size="sm" className="me-2" />
                    Creating Employee...
                  </>
                ) : (
                  <>
                    <CIcon icon={cilCheckCircle} className="me-1" />
                    Create Employee
                  </>
                )}
              </CButton>
            </CCol>
          </CRow>
        </CForm>
      </CContainer>

      {/* Confirmation Modal */}
      <CModal
        visible={showSubmitModal}
        onClose={handleModalCancel}
        backdrop="static"
        keyboard={false}
        size="lg"
      >
        <CModalHeader>
          <CModalTitle className="d-flex align-items-center">
            <CIcon icon={cilCheckCircle} className="me-2 text-warning" />
            Confirm Employee Creation
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="text-center py-4">
            <div className="mb-4">
              <CIcon icon={cilUser} size="3xl" className="text-primary mb-3" />
              <h5 className="mb-3">Are you sure you want to create this employee?</h5>
              {/* <p className="text-muted mb-4">
                This will create a new employee profile with all the provided information. The
                employee will be added to the system and can be managed from the staff list.
              </p> */}
            </div>

            <div className="bg-light rounded p-3 mb-4">
              <h6 className="mb-3 d-flex align-items-center">
                <CIcon icon={cilUser} className="me-2 text-primary" />
                Employee Summary
              </h6>

              {/* Personal Information */}
              <div className="row text-start mb-3">
                <div className="col-12">
                  <h6 className="text-primary mb-2">
                    <CIcon icon={cilUser} className="me-1" size="sm" />
                    Personal Information
                  </h6>
                </div>
                <div className="col-md-6">
                  <small className="d-block mb-1">
                    <strong>Full Name:</strong> {formData.firstName} {formData.lastName}
                  </small>
                  <small className="d-block mb-1">
                    <strong>Email:</strong> {formData.email}
                  </small>
                  <small className="d-block mb-1">
                    <strong>Phone:</strong> {formData.phone}
                  </small>
                  <small className="d-block mb-1">
                    <strong>Gender:</strong>{' '}
                    {formData.gender
                      ? formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1)
                      : 'Not specified'}
                  </small>
                </div>
                <div className="col-md-6">
                  <small className="d-block mb-1">
                    <strong>Date of Birth:</strong> {formData.dateOfBirth || 'Not specified'}
                  </small>
                  <small className="d-block mb-1">
                    <strong> Anniversary:</strong> {formData.anniversary || 'Not specified'}
                  </small>
                  {formData.maritalStatus === 'married' && formData.children != null && formData.children !== '' && (
                    <small className="d-block mb-1">
                      <strong>Children&apos;s:</strong> {formData.children}
                    </small>
                  )}
                  <small className="d-block mb-1">
                    <strong>Marital Status:</strong>{' '}
                    {formData.maritalStatus
                      ? formData.maritalStatus.charAt(0).toUpperCase() +
                        formData.maritalStatus.slice(1)
                      : 'Not specified'}
                  </small>
                  <small className="d-block mb-1">
                    <strong>Blood Group:</strong> {formData.bloodGroup || 'Not specified'}
                  </small>
                  {/* Special Needs display - Commented: Backend field doesn't exist */}
                  {/* {formData.physicallyChallenged === 'yes' && (
                    <small className="d-block mb-1 text-warning">
                      <strong>Special Needs:</strong> {formData.physicallyChallengedReason || 'Details not provided'}
                    </small>
                  )} */}
                </div>
              </div>

              {/* Employment Information */}
              <div className="row text-start mb-3">
                <div className="col-12">
                  <h6 className="text-primary mb-2">
                    <CIcon icon={cilBuilding} className="me-1" size="sm" />
                    Employment Details
                  </h6>
                </div>
                <div className="col-md-6">
                  <small className="d-block mb-1">
                    <strong>Department:</strong>{' '}
                    {formData.department
                      ? formData.department.charAt(0).toUpperCase() + formData.department.slice(1)
                      : 'Not specified'}
                  </small>
                  <small className="d-block mb-1">
                    <strong>Company:</strong> {formData.company || 'Not specified'}
                  </small>
                  <small className="d-block mb-1">
                    <strong>Location:</strong> {formData.workLocation || 'Not specified'}
                  </small>
                  <small className="d-block mb-1">
                    <strong>RA-Location:</strong>{' '}
                    {locations.find((loc) => loc.value === formData.location)?.label ||
                      'Not specified'}
                  </small>
                </div>
                <div className="col-md-6">
                  <small className="d-block mb-1">
                    <strong>Onboarding Date:</strong> {formData.onboardingDate || 'Not specified'}
                  </small>
                  <small className="d-block mb-1">
                    <strong>Joining Date:</strong> {formData.joiningDate || 'Not specified'}
                  </small>
                  <small className="d-block mb-1">
                    <strong>Admin Status:</strong>
                    <span
                      className={`badge ms-1 ${
                        formData.adminStatus === 'active' ? 'bg-success' : 'bg-secondary'
                      }`}
                    >
                      {formData.adminStatus
                        ? formData.adminStatus.charAt(0).toUpperCase() +
                          formData.adminStatus.slice(1)
                        : 'Not specified'}
                    </span>
                  </small>
                  <small className="d-block mb-1">
                    <strong>Roles:</strong>{' '}
                    {formData.role && formData.role.length > 0
                      ? formData.role
                          .map((roleId) => {
                            const role = defaultRoleOptions.find((r) => r.value === roleId)
                            return role ? role.label : roleId
                          })
                          .join(', ')
                      : 'No roles selected'}
                  </small>
                  {formData.ra_branch && (
                    <small className="d-block mb-1">
                      <strong>RA-Branch:</strong>{' '}
                      {locations.find((loc) => loc.value === formData.ra_branch)?.label ||
                        locations.find((loc) => loc.id === formData.ra_branch)?.label ||
                        'Not specified'}
                    </small>
                  )}
                  {formData.group && Array.isArray(formData.group) && formData.group.length > 0 && (
                    <small className="d-block mb-1">
                      <strong>Group(s):</strong>{' '}
                      {formData.group
                        .map((groupId) => {
                          const group =
                            groups.find((g) => g.value === groupId) ||
                            groups.find((g) => g.id === groupId) ||
                            defaultGroupOptions.find((g) => g.value === groupId)
                          return group?.label || group?.name || 'Unknown'
                        })
                        .join(', ')}
                    </small>
                  )}
                </div>
              </div>

              {/* Reporting Authority Information */}
              {(formData.reportingManager ||
                formData.leaveAuthorityOne_id ||
                formData.leaveAuthorityTwo_id) && (
                <div className="row text-start mb-3">
                  <div className="col-12">
                    <h6 className="text-primary mb-2">
                      <CIcon icon={cilUser} className="me-1" size="sm" />
                      Reporting Authority
                    </h6>
                  </div>
                  <div className="col-12">
                    {formData.reportingManager && (
                      <small className="d-block mb-1">
                        <strong>Reporting Manager:</strong>{' '}
                        {formData.reportingManagerName || 'Not specified'}
                      </small>
                    )}
                    {formData.leaveAuthorityOne_id && (
                      <small className="d-block mb-1">
                        <strong>Leave Authority 1:</strong>{' '}
                        {formData.leaveAuthorityOneName || 'Not specified'}
                      </small>
                    )}
                    {formData.leaveAuthorityTwo_id && (
                      <small className="d-block mb-1">
                        <strong>Leave Authority 2:</strong>{' '}
                        {formData.leaveAuthorityTwoName || 'Not specified'}
                      </small>
                    )}
                  </div>
                </div>
              )}
              {/* Emergency Contacts */}
              <div className="row text-start mb-3">
                <div className="col-12">
                  <h6 className="text-primary mb-2">
                    <CIcon icon={cilEnvelopeClosed} className="me-1" size="sm" />
                    Emergency / Office Contacts
                  </h6>
                </div>

                <div className="col-12">
                  {/* User filled contacts */}
                  {formData.emergencyContactName && (
                    <small className="d-block mb-1">
                      <strong>Contact 1:</strong> {formData.emergencyContactName} (
                      {formData.emergencyContactRelation}) - {formData.emergencyContactNumber}
                    </small>
                  )}

                  {formData.emergencyContactName2 && (
                    <small className="d-block mb-1">
                      <strong>Contact 2:</strong> {formData.emergencyContactName2} (
                      {formData.emergencyContactRelation2}) - {formData.emergencyContactNumber2}
                    </small>
                  )}

                  {formData.emergencyContactName3 && (
                    <small className="d-block mb-1">
                      <strong>Contact 3:</strong> {formData.emergencyContactName3} (
                      {formData.emergencyContactRelation3}) - {formData.emergencyContactNumber3}
                    </small>
                  )}
 
                  
                </div>

                  {/* here i want to show the contact Number of office */}
                  <div className="col-12">
                    <small className="d-block mb-1">
                      <strong>Office Contact:</strong>  
                      {officeContact.map((contact, index) => (
                        <div key={index}>
                          {contact.name}: {contact.number}
                        </div>
                      ))}
                    </small>
              </div>

              </div>

              {/* Salary Information - Moved to bottom */}
              {(formData.ctcPerMonth || formData.hra) && (
                <div className="row text-start mb-3">
                  <div className="col-12">
                    <h6 className="text-primary mb-2">
                      <CIcon icon={cilCalendar} className="me-1" size="sm" />
                      Salary Information
                    </h6>
                  </div>
                  <div className="col-md-6">
                    {formData.ctcPerMonth && (
                      <small className="d-block mb-1">
                        <strong>CTC Per Month:</strong> ₹{formData.ctcPerMonth}
                      </small>
                    )}
                    {formData.hra && (
                      <small className="d-block mb-1">
                        <strong>HRA:</strong> ₹{formData.hra}
                      </small>
                    )}
                  </div>
                  <div className="col-md-6">
                    {formData.ctcPerMonthInWords && (
                      <small className="d-block mb-1 text-muted">
                        <strong>CTC in Words:</strong> {formData.ctcPerMonthInWords}
                      </small>
                    )}
                    {formData.hraInWords && (
                      <small className="d-block mb-1 text-muted">
                        <strong>HRA in Words:</strong> {formData.hraInWords}
                      </small>
                    )}
                  </div>
                </div>
              )}

              
            </div>
          </div>
          {/* Action Buttons */}
          <div className="d-flex justify-content-center">
            <CButton
              color="secondary"
              onClick={handleModalCancel}
              disabled={isSubmitting}
              className="me-3"
            >
              <CIcon icon={cilXCircle} className="me-1" />
              Cancel
            </CButton>
            <CButton color="primary" onClick={handleConfirmSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <CSpinner size="sm" className="me-2" />
                  Creating Employee...
                </>
              ) : (
                <>
                  <CIcon icon={cilCheckCircle} className="me-1" />
                  Yes, Create Employee
                </>
              )}
            </CButton>
          </div>
        </CModalBody>
      </CModal>
    </>
  )
}

export default AddStaff
