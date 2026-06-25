import React, { useState, useEffect } from 'react'
import {
  CCol,
  CRow,
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormLabel,
  CFormInput,
  CFormTextarea,
  CFormCheck,
  CButton,
  CAlert,
  CSpinner,
} from '@coreui/react'

import AppFormSelect from 'src/components/form/AppFormSelect'
import {
  cilUser,
  cilEnvelopeClosed,
  cilBriefcase,
  cilCreditCard,
  cilBuilding,
  cilCalendar,
  cilClock,
  cilCheckCircle,
  cilXCircle,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import FormSection from '../FormSection'
import FormField from '../FormField'
import { STAFF_TYPES, DEPARTMENT_OPTIONS } from '../../../constants/hrmsConstants'
import BasicProvider from '../../../constants/BasicProvider'
import { fetchCompanies } from '../../../helpers/companyHelper'

const ProfileSection = ({
  data,
  isEditing,
  onFieldChange,
  onEditToggle,
  onSave,
  onCancel,
  canEdit,
  editAttempts,
  errors = {},
}) => {
  // Form state
  const [formData, setFormData] = useState({
    // General Information
    firstName: data?.firstName || '',
    middleName: data?.middleName || '',
    lastName: data?.lastName || '',
    dateOfBirth: data?.dateOfBirth || '',
    name: data?.name || '',

    // Personal Details
    email: data?.email || '',
    phone: data?.phone || '',
    alternateMobile: data?.alternateMobile || '',
    password: data?.password || '',
    gender: data?.gender || '',
    profilePicture: data?.profilePicture || null,
    address: data?.address || '',
    emergencyContact: data?.emergencyContact || '',
    emergencyPhone: data?.emergencyPhone || '',

    // Additional Personal Information
    maritalStatus: data?.maritalStatus || '',
    bloodGroup: data?.bloodGroup || '',
    fatherName: data?.fatherName || '',
    motherName: data?.motherName || '',
    spouseName: data?.spouseName || '',
    physicallyChallenged: data?.physicallyChallenged || '',
    currentAddress: data?.currentAddress || '',
    permanentAddress: data?.permanentAddress || '',
    district: data?.district || '',
    pincode: data?.pincode || '',
    state: data?.state || '',
    qualification: data?.qualification || '',
    lastOccupation: data?.lastOccupation || '',
    referenceOfJoining: data?.referenceOfJoining || '',
    aadharNo: data?.aadharNo || '',
    panNo: data?.panNo || '',
    ctcPerMonth: data?.ctcPerMonth || '',
    ctcPerMonthInWords: data?.ctcPerMonthInWords || '',
    hra: data?.hra || '',
    hraInWords: data?.hraInWords || '',
    isCore: data?.isCore || false,
    emergencyContactName: data?.emergencyContactName || '',
    emergencyContactRelation: data?.emergencyContactRelation || '',
    emergencyContactNumber: data?.emergencyContactNumber || '',
    emergencyContactName2: data?.emergencyContactName2 || '',
    emergencyContactRelation2: data?.emergencyContactRelation2 || '',
    emergencyContactNumber2: data?.emergencyContactNumber2 || '',
    emergencyContactName3: data?.emergencyContactName3 || '',
    emergencyContactRelation3: data?.emergencyContactRelation3 || '',
    emergencyContactNumber3: data?.emergencyContactNumber3 || '',

    // Profile Information
    employeeId: data?.employeeId || '',
    designation: data?.designation || '',
    staffType: data?.staffType || '',
    contactNumber: data?.contactNumber || '',
    attendanceSupervisor: data?.attendanceSupervisor || '',
    department: data?.department || '',

    // Job Details
    location: data?.location || '',
    workLocation: data?.workLocation || '',
    company: data?.company || '',
    reportingManager: data?.reportingManager || '',
    adminStatus: data?.adminStatus || '',
    role: data?.role || '',

    // Employment Information
    joiningDate: data?.joiningDate || '',
    employeeType: data?.employeeType || '',
    basicSalary: data?.basicSalary || '',
    status: data?.status || 'active',

    // Bank Details
    bankName: data?.bankName || '',
    accountNumber: data?.accountNumber || '',
    ifscCode: data?.ifscCode || '',
    branchName: data?.branchName || '',

    // Dates
    onboardingDate: data?.onboardingDate || '',

    // Additional Details
    salary: data?.salary || '',
    workType: data?.workType || 'full-time',
    shift: data?.shift || 'day',

    // Letter Generation
    generateWelcomeLetter: data?.generateWelcomeLetter || false,
    generateOfferLetter: data?.generateOfferLetter || false,

    // Automatic Punchout Settings
    auto_punchout_enabled: data?.auto_punchout_enabled || false,
    inactivity_timeout_minutes: data?.inactivity_timeout_minutes || 30,
    auto_punchout_days: data?.auto_punchout_days || [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
    ],
    auto_punchout_timezone: data?.auto_punchout_timezone || 'Asia/Kolkata',
  })

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)

  // Dynamic data states
  const [locations, setLocations] = useState([])
  const [managers, setManagers] = useState([])
  const [roles, setRoles] = useState([])
  const [companyOptions, setCompanyOptions] = useState([{ value: '', label: 'Select Company' }])

  // Fetch dynamic data functions
  const fetchLocations = async () => {
    try {
      const response = await new BasicProvider('ra_branch?count=100').getRequest()
      const locationOptions = response.data.data.map((location) => ({
        value: location._id,
        label: location.name,
      }))
      setLocations([{ value: '', label: 'Select Location' }, ...locationOptions])
    } catch (error) {
      console.error('Error fetching locations:', error)
      setLocations([
        { value: '', label: 'Select Location' },
        { value: 'indore', label: 'Indore' },
        { value: 'ratlam', label: 'Ratlam' },
        { value: 'dhar', label: 'Dhar' },
        { value: 'mandsour', label: 'Mandsour' },
        { value: 'bhopal', label: 'Bhopal' },
        { value: 'neemach', label: 'Neemach' },
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
      const response = await new BasicProvider(
        `admins/get-multiple?slugs=${encodeURIComponent(queryString)}&page=1&count=500`,
      ).getRequest()

      const managerOptions = response.data.map((manager) => ({
        value: manager._id,
        label: manager.name,
        role: manager.role?.display_name || 'Manager',
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
      await Promise.all([fetchLocations(), fetchManagers(), fetchRoles(), fetchCompaniesData()])
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

  // Form handlers
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    // Also call the parent's onFieldChange if it exists
    if (onFieldChange) {
      onFieldChange(field, value)
    }
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)

      // Validate required fields
      const requiredFields = [
        'firstName',
        'lastName',
        'dateOfBirth',
        'gender',
        'email',
        'phone',
        'password',
        'employeeId',
        'designation',
        'staffType',
        'department',
        'location',
        'workLocation',
        'company',
        'role',
        'adminStatus',
        'onboardingDate',
        'joiningDate',
        'bankName',
        'accountNumber',
        'ifscCode',
        'branchName',
      ]
      const missingFields = requiredFields.filter((field) => !formData[field])

      if (missingFields.length > 0) {
        alert(`Please fill in all required fields: ${missingFields.join(', ')}`)
        return
      }

      // Call parent's save function if it exists
      if (onSave) {
        await onSave(formData)
      }

      setShowSuccessAlert(true)

      // Hide success alert after 3 seconds
      setTimeout(() => {
        setShowSuccessAlert(false)
      }, 3000)
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Error saving profile. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <CForm>
      {/* Success Alert */}
      {showSuccessAlert && (
        <CRow className="mb-4">
          <CCol>
            <CAlert color="success" className="d-flex align-items-center">
              <CIcon icon={cilCheckCircle} className="me-2" />
              Profile updated successfully!
            </CAlert>
          </CCol>
        </CRow>
      )}

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
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter first name"
                  required
                  disabled={!isEditing}
                />
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
                  disabled={!isEditing}
                />
              </div>
            </CCol>
            <CCol md={4}>
              <div className="mb-3">
                <CFormLabel className="fw-semibold">Last Name *</CFormLabel>
                <CFormInput
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter last name"
                  required
                  disabled={!isEditing}
                />
              </div>
            </CCol>
          </CRow>
          <CRow>
            <CCol md={6}>
              <div className="mb-3">
                <CFormLabel className="fw-semibold">Date of Birth *</CFormLabel>
                <CFormInput
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  required
                  disabled={!isEditing}
                />
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
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  required
                  disabled={!isEditing}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </AppFormSelect>
              </div>
            </CCol>
            <CCol md={6}>
              <div className="mb-3">
                <CFormLabel className="fw-semibold">Marital Status</CFormLabel>
                <AppFormSelect
                  value={formData.maritalStatus}
                  onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                  disabled={!isEditing}
                >
                  <option value="">Select Marital Status</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </AppFormSelect>
              </div>
            </CCol>
          </CRow>
          <CRow>
            <CCol md={6}>
              <div className="mb-3">
                <CFormLabel className="fw-semibold">Email *</CFormLabel>
                <CFormInput
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                  required
                  disabled={!isEditing}
                />
              </div>
            </CCol>
            <CCol md={6}>
              <div className="mb-3">
                <CFormLabel className="fw-semibold">Contact no. *</CFormLabel>
                <CFormInput
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                  required
                  disabled={!isEditing}
                />
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
                  onChange={(e) => handleInputChange('alternateMobile', e.target.value)}
                  placeholder="Enter alternate mobile number"
                  disabled={!isEditing}
                />
              </div>
            </CCol>
            <CCol md={6}>
              <div className="mb-3">
                <CFormLabel className="fw-semibold">Password *</CFormLabel>
                <CFormInput
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter password"
                  required
                  disabled={!isEditing}
                />
              </div>
            </CCol>
          </CRow>
          <CRow>
            <CCol md={6}>
              <div className="mb-3">
                <CFormLabel className="fw-semibold">Profile Picture</CFormLabel>
                <CFormInput
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleInputChange('profilePicture', e.target.files[0])}
                  disabled={!isEditing}
                />
                <small className="text-muted">Upload a profile picture (JPG, PNG, GIF)</small>
              </div>
            </CCol>
          </CRow>
          <CRow>
            <CCol md={12}>
              <div className="mb-3">
                <CFormLabel className="fw-semibold">Address</CFormLabel>
                <CFormTextarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter complete address"
                  rows={3}
                  disabled={!isEditing}
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
            <CCol md={6}>
              <div className="mb-3">
                <CFormLabel className="fw-semibold">Employee ID *</CFormLabel>
                <CFormInput
                  type="text"
                  value={formData.employeeId}
                  onChange={(e) => handleInputChange('employeeId', e.target.value)}
                  placeholder="Enter employee ID"
                  required
                  disabled={!isEditing}
                />
              </div>
            </CCol>
            <CCol md={6}>
              <div className="mb-3">
                <CFormLabel className="fw-semibold">Designation *</CFormLabel>
                <CFormInput
                  type="text"
                  value={formData.designation}
                  onChange={(e) => handleInputChange('designation', e.target.value)}
                  placeholder="Enter designation"
                  required
                  disabled={!isEditing}
                />
              </div>
            </CCol>
          </CRow>
          <CRow>
            <CCol md={6}>
              <div className="mb-3">
                <CFormLabel className="fw-semibold">Staff Type *</CFormLabel>
                <AppFormSelect
                  value={formData.staffType}
                  onChange={(e) => handleInputChange('staffType', e.target.value)}
                  required
                  disabled={!isEditing}
                >
                  <option value="">Select Staff Type</option>
                  <option value="permanent">Permanent</option>
                  <option value="contract">Contract</option>
                  <option value="temporary">Temporary</option>
                  <option value="intern">Intern</option>
                </AppFormSelect>
              </div>
            </CCol>
            <CCol md={6}>
              <div className="mb-3">
                <CFormLabel className="fw-semibold">Department *</CFormLabel>
                <AppFormSelect
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  required
                  disabled={!isEditing}
                >
                  <option value="">Select Department</option>
                  <option value="technical">Technical</option>
                  <option value="management">Management</option>
                </AppFormSelect>
              </div>
            </CCol>
          </CRow>
          <CRow>
            <CCol md={6}>
              <div className="mb-3">
                <CFormLabel className="fw-semibold">Contact Number *</CFormLabel>
                <CFormInput
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                  placeholder="Enter contact number"
                  required
                  disabled={!isEditing}
                />
              </div>
            </CCol>
            <CCol md={6}>
              <div className="mb-3">
                <CFormLabel className="fw-semibold">Attendance Supervisor</CFormLabel>
                <CFormInput
                  type="text"
                  value={formData.attendanceSupervisor}
                  onChange={(e) => handleInputChange('attendanceSupervisor', e.target.value)}
                  placeholder="Enter attendance supervisor"
                  disabled={!isEditing}
                />
              </div>
            </CCol>
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
                  disabled={!isEditing}
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
                  disabled={!isEditing}
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
                  disabled={!isEditing}
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
                  disabled={!isEditing}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="terminated">Terminated</option>
                  <option value="on-leave">On Leave</option>
                </AppFormSelect>
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
                  value={formData.bankName}
                  onChange={(e) => handleInputChange('bankName', e.target.value)}
                  placeholder="Enter bank name"
                  required
                  disabled={!isEditing}
                />
              </div>
            </CCol>
            <CCol md={6}>
              <div className="mb-3">
                <CFormLabel className="fw-semibold">Account Number *</CFormLabel>
                <CFormInput
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                  placeholder="Enter account number"
                  required
                  disabled={!isEditing}
                />
              </div>
            </CCol>
          </CRow>
          <CRow>
            <CCol md={6}>
              <div className="mb-3">
                <CFormLabel className="fw-semibold">IFSC Code *</CFormLabel>
                <CFormInput
                  type="text"
                  value={formData.ifscCode}
                  onChange={(e) => handleInputChange('ifscCode', e.target.value)}
                  placeholder="Enter IFSC code"
                  required
                  disabled={!isEditing}
                />
              </div>
            </CCol>
            <CCol md={6}>
              <div className="mb-3">
                <CFormLabel className="fw-semibold">Branch Name *</CFormLabel>
                <CFormInput
                  type="text"
                  value={formData.branchName}
                  onChange={(e) => handleInputChange('branchName', e.target.value)}
                  placeholder="Enter branch name"
                  required
                  disabled={!isEditing}
                />
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
                <CFormLabel className="fw-semibold">MA Branch *</CFormLabel>
                <AppFormSelect
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  required
                  disabled={!isEditing || isLoadingData}
                >
                  {locations.map((location) => (
                    <option key={location.value} value={location.value}>
                      {location.label}
                    </option>
                  ))}
                </AppFormSelect>
              </div>
            </CCol>
            <CCol md={6}>
              <div className="mb-3">
                <CFormLabel className="fw-semibold">Work Location *</CFormLabel>
                <CFormInput
                  type="text"
                  value={formData.workLocation}
                  onChange={(e) => handleInputChange('workLocation', e.target.value)}
                  placeholder="Enter work location"
                  required
                  disabled={!isEditing}
                />
              </div>
            </CCol>
          </CRow>
          <CRow>
            <CCol md={6}>
              <div className="mb-3">
                <CFormLabel className="fw-semibold">Company *</CFormLabel>
                <AppFormSelect
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  required
                  disabled={!isEditing || isLoadingData}
                >
                  {companyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </AppFormSelect>
              </div>
            </CCol>
            <CCol md={6}>
              <div className="mb-3">
                <CFormLabel className="fw-semibold">Reporting Manager</CFormLabel>
                <AppFormSelect
                  value={formData.reportingManager}
                  onChange={(e) => handleInputChange('reportingManager', e.target.value)}
                  disabled={!isEditing || isLoadingData}
                >
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
                <CFormLabel className="fw-semibold">Role *</CFormLabel>
                <AppFormSelect
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  required
                  disabled={!isEditing || isLoadingData}
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </AppFormSelect>
              </div>
            </CCol>
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
                        disabled={!isEditing}
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
                        disabled={!isEditing}
                      />
                      <label className="form-check-label" htmlFor="adminInactive">
                        Inactive
                      </label>
                    </div>
                  </div>
                  <small className="text-muted d-block mt-1">
                    Select admin status for this employee
                  </small>
                </div>
              </div>
            </CCol>
          </CRow>
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
                  value={formData.onboardingDate}
                  onChange={(e) => handleInputChange('onboardingDate', e.target.value)}
                  required
                  disabled={!isEditing}
                />
              </div>
            </CCol>
            <CCol md={6}>
              <div className="mb-3">
                <CFormLabel className="fw-semibold">Joining Date *</CFormLabel>
                <CFormInput
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => handleInputChange('joiningDate', e.target.value)}
                  required
                  disabled={!isEditing}
                />
                <small className="text-muted">
                  Employee will be automatically activated on this date
                </small>
              </div>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {/* Action Buttons */}
      {isEditing && (
        <CRow className="mb-4">
          <CCol className="d-flex justify-content-end gap-3">
            <CButton color="secondary" onClick={onCancel} disabled={isSubmitting}>
              <CIcon icon={cilXCircle} className="me-1" />
              Cancel
            </CButton>
            <CButton color="primary" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <CSpinner size="sm" className="me-2" />
                  Saving...
                </>
              ) : (
                <>
                  <CIcon icon={cilCheckCircle} className="me-1" />
                  Save Changes
                </>
              )}
            </CButton>
          </CCol>
        </CRow>
      )}
    </CForm>
  )
}

export default ProfileSection
