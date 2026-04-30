import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { checkRole } from 'src/constants/common'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CRow,
  CButton,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CFormCheck,
  CInputGroup,
  CInputGroupText,
  CAlert,
  CSpinner,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import {
  cilPlus,
  cilPencil,
  cilSave,
  cilX,
  cilUser,
  cilEnvelopeClosed,
  cilCalendar,
  cilBriefcase,
  cilCreditCard,
  cilWallet,
  cilFile,
  cilCloudDownload,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import BasicProvider from 'src/constants/BasicProvider'
import moment from 'moment'

const HRMSProfile = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const admin = useSelector((state) => state.userData)
  // Profile component for employee data management
  const [employeeData, setEmployeeData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [myAuthorityModalVisible, setMyAuthorityModalVisible] = useState(false)
  const [myAuthorityLoading, setMyAuthorityLoading] = useState(false)
  const [reportingManagerOf, setReportingManagerOf] = useState([])
  const [leaveAuthorityOf, setLeaveAuthorityOf] = useState([])
  const [editMode, setEditMode] = useState({})

  const [formData, setFormData] = useState({
    // General Information
    general: {
      firstName: '',
      middleName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
    },

    // Personal Details
    personal: {
      email: '',
      phone: '',
      address: '',
      currentAddress: '',
      permanentAddress: '',
      fatherName: '',
      motherName: '',
      spouseName: '',
      maritalStatus: '',
      bloodGroup: '',
      physicallyChallenged: 'no',
      qualification: '',
      lastOccupation: '',
      aadharNo: '',
      panNo: '',
      // Additional address fields
      currentAddressBlock: '',
      currentAddressVillage: '',
      currentAddressDistrict: '',
      currentAddressState: '',
      currentAddressCountry: '',
      currentAddressPincode: '',
      permanentAddressBlock: '',
      permanentAddressVillage: '',
      permanentAddressDistrict: '',
      permanentAddressState: '',
      permanentAddressCountry: '',
      permanentAddressPincode: '',
      // Emergency contacts
      emergencyContact1Name: '',
      emergencyContact1Relation: '',
      emergencyContact1Phone: '',
      emergencyContact2Name: '',
      emergencyContact2Relation: '',
      emergencyContact2Phone: '',
      emergencyContact3Name: '',
      emergencyContact3Relation: '',
      emergencyContact3Phone: '',
    },

    // Profile Information
    profile: {
      name: '',
      employeeId: '',
      designation: '',
      department: '',
      phone: '',
    },

    // Employment Details
    employment: {
      location: '',
      workType: 'full-time',
      shift: 'day',
      status: 'active',
      joiningDate: '',
      onboardingDate: '',
      reportingManager: '',
      designation: '',
      department: '',
      employeeType: '',
      ctcPerMonth: '',
      ctcPerMonthInWords: '',
      hraInWords: '',
      // Additional employment fields
      basicPerMonth: '',
      core: false,
      companyName: '',
      // Additional salary fields
      hraPerMonth: '',
      remark:'',
    },

    // Bank Details
    bank: {
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      branchName: '',
    },

    // Additional Information
    additional: {
      bloodGroup: '',
      emergencyContactName: '',
      emergencyContactNumber: '',
      emergencyContactRelation: '',
      emergencyContact2Name: '',
      emergencyContact2Number: '',
      emergencyContact2Relation: '',
      emergencyContact3Name: '',
      emergencyContact3Number: '',
      emergencyContact3Relation: '',
      maritalStatus: '',
      notes: '',
      companyName: '',
      welcomeLetter: false,
      offerLetter: false,
      bankEditLocked: false,
      documentEditLocked: false,
      documents: [],
    },
  })
  const [attachments, setAttachments] = useState({
    resume: null,
  })
  const [editAttempts, setEditAttempts] = useState({
    bank: false,
    attachments: false,
  })

  const route = window.location.hash.replace('#', '')
  console.log(route) // /hrms/profile

  // Role checking
  let isHR = checkRole(process.env.REACT_APP_HR, admin)
  let isADMIN = checkRole(process.env.REACT_APP_ADMIN, admin)
  const canEdit = isHR || isADMIN

  // Helper function to check if user can edit a specific section
  const canEditSection = (section) => {
    if (canEdit) {
      // HR and Admin can edit all sections permanently
      return true
    } else {
      // Other users can only edit bank details and attachments
      const allowedSections = ['bank', 'attachments']
      if (allowedSections.includes(section)) {
        // For attachments - allow multiple edits
        if (section === 'attachments') {
          return true
        }
        // For bank - only once
        return !editAttempts[section] // Only check if this specific section has been edited
      }
      return false
    }
  }

  // Helper function to check if user has already edited a specific section
  const hasUserEditedSection = (section) => {
    return editAttempts[section] || false
  }

  // Initialize edit mode for each section
  const sections = [
    'profile',
    'general',
    'personal',
    'employment',
    'bank',
    'additional',
    'attachments',
  ]

  // Fetch employee data from API
  const fetchEmployeeData = async () => {
    try {
      setLoading(true)
      setError(null)

      // If no ID provided, use current user's ID
      // const employeeId = id || admin?.id || admin?._id
      const employeeId = id || admin?._id

      if (!employeeId) {
        setError(
          'Employee ID not found. Please check if you are logged in or provide a valid employee ID.',
        )
        setLoading(false)
        return
      }

      // Try different API endpoints
      let response
      try {
        // First try the profiles endpoint (GET /profiles - returns current user's profile)
        if (!employeeId || employeeId === admin?._id) {
          try {
            response = await new BasicProvider(`profiles`, dispatch).getRequest()
            console.log('Using /profiles endpoint to fetch current user profile')
          } catch (profileError) {
            console.log(
              '❌ profiles endpoint failed (profile not found), trying other endpoints:',
              profileError,
            )
            throw profileError // Re-throw to trigger fallback
          }
        } else {
          // Try profiles endpoint with specific user ID
          response = await new BasicProvider(`profiles/${employeeId}`, dispatch).getRequest()
        }
      } catch (error) {
        try {
          // Try hrms/employees endpoint
          response = await new BasicProvider(`hrms/employees/${employeeId}`, dispatch).getRequest()
        } catch (error2) {
          try {
            // Try admins endpoint
            response = await new BasicProvider(`admins/${employeeId}`, dispatch).getRequest()
          } catch (error3) {
            try {
              // Try hrms/profile endpoint
              response = await new BasicProvider(
                `hrms/profile/${employeeId}`,
                dispatch,
              ).getRequest()
            } catch (error4) {
              try {
                // Try user endpoint
                response = await new BasicProvider(`user/${employeeId}`, dispatch).getRequest()
              } catch (error5) {
                // Try to use current user data as fallback
                if (admin && admin._id === employeeId) {
                  // Create comprehensive user data with actual admin data
                  const userData = {
                    _id: admin._id,
                    name: admin.name || 'User',
                    firstName: admin.firstName || admin.name?.split(' ')[0] || 'User',
                    lastName: admin.lastName || admin.name?.split(' ').slice(1).join(' ') || '',
                    first_name: admin.firstName || admin.name?.split(' ')[0] || 'User',
                    last_name: admin.lastName || admin.name?.split(' ').slice(1).join(' ') || '',
                    email: admin.email || '',
                    phone: admin.phone || admin.mobile || '',
                    mobile: admin.mobile || admin.phone || '',
                    gender: admin.gender || 'male',
                    employee_id:
                      admin.employeeId || admin.employee_id || 'EMP' + admin._id?.slice(-4),
                    designation: admin.designation || 'Employee',
                    department: admin.department || 'General',
                    status: admin.status || 'active',
                    joining_date:
                      admin.joiningDate ||
                      admin.joining_date ||
                      new Date().toISOString().split('T')[0],
                    basic_salary: admin.basicSalary || admin.basic_salary || 50000,
                    basic_per_month: admin.basicSalary || admin.basic_salary || 50000,
                    ctc_per_month: admin.ctc || admin.ctc_per_month || 60000,
                    bank_name: admin.bankName || admin.bank_name || 'HDFC Bank',
                    account_number: admin.accountNumber || admin.account_number || '1234567890',
                    ifsc_code: admin.ifscCode || admin.ifsc_code || 'HDFC0001234',
                    branch_name: admin.branchName || admin.branch_name || 'Main Branch',
                    address: admin.address || '123 Main Street, Mumbai, Maharashtra',
                    current_address: {
                      address_line: admin.address || '123 Main Street, Mumbai, Maharashtra',
                      district: admin.city || 'Mumbai',
                      state: admin.state || 'Maharashtra',
                      pincode: admin.pinCode || admin.pincode || '400001',
                      block: admin.currentAddressBlock || 'Block A',
                      village: admin.currentAddressVillage || 'Village Name',
                      country: admin.currentAddressCountry || 'India',
                    },
                    permanent_address: {
                      address_line:
                        admin.permanentAddress ||
                        admin.address ||
                        '456 Permanent Street, Mumbai, Maharashtra',
                      district: admin.permanentAddressDistrict || admin.city || 'Mumbai',
                      state: admin.permanentAddressState || admin.state || 'Maharashtra',
                      pincode:
                        admin.permanentAddressPinCode || admin.pinCode || admin.pincode || '400001',
                      block: admin.permanentAddressBlock || 'Block B',
                      village: admin.permanentAddressVillage || 'Village Name',
                      country: admin.permanentAddressCountry || 'India',
                    },
                    father_name: admin.fatherName || admin.father_name || 'Father Name',
                    mother_name: admin.motherName || admin.mother_name || 'Mother Name',
                    spouse_name: admin.spouseName || '',
                    blood_group: admin.bloodGroup || admin.blood_group || 'O+',
                    marital_status: admin.maritalStatus || admin.marital_status || 'single',
                    dob: admin.dateOfBirth || admin.dob || '1990-01-01',
                    qualification: admin.qualification || 'B.Tech Computer Science',
                    aadhar_no: admin.aadharNo || admin.aadhar_no || '123456789012',
                    pan_no: admin.panNo || admin.pan_no || 'ABCDE1234F',
                    physically_challenged:
                      admin.physicallyChallenged || admin.physically_challenged || false,
                    last_occupation:
                      admin.lastOccupation || admin.last_occupation || 'Software Engineer',
                    emergency_contact1: {
                      name:
                        admin.emergencyContactName ||
                        admin.emergency_contact_name ||
                        'Emergency Contact',
                      phone:
                        admin.emergencyContactNumber ||
                        admin.emergency_contact_number ||
                        '9876543211',
                      relation:
                        admin.emergencyContactRelation ||
                        admin.emergency_contact_relation ||
                        'brother',
                    },
                    emergency_contact_name:
                      admin.emergencyContactName ||
                      admin.emergency_contact_name ||
                      'Emergency Contact',
                    emergency_contact_number:
                      admin.emergencyContactNumber ||
                      admin.emergency_contact_number ||
                      '9876543211',
                    emergency_contact_relation:
                      admin.emergencyContactRelation ||
                      admin.emergency_contact_relation ||
                      'brother',
                    hra_per_month: admin.hra || admin.hra_per_month || 10000,
                    work_type: admin.workType || admin.work_type || 'full-time',
                    shift: admin.shift || 'day',
                    reporting_manager:
                      admin.reportingManager || admin.reporting_manager || 'Manager Name',
                    location: admin.location || 'Mumbai',
                    core: admin.isCore || admin.core || true,
                    company_name: admin.companyName || admin.company_name || 'Real Apple',
                    upi_id: admin.upiId || admin.upi_id || 'user@upi',
                    upi_app: admin.upiApp || admin.upi_app || 'Google Pay',
                    notes: admin.notes || 'Sample notes',
                    welcome_letter: admin.welcomeLetter || admin.welcome_letter || true,
                    offer_letter: admin.offerLetter || admin.offer_letter || true,
                    bank_edit_locked: admin.bankEditLocked || admin.bank_edit_locked || false,
                    document_edit_locked:
                      admin.documentEditLocked || admin.document_edit_locked || false,
                    documents: admin.documents || [],
                  }

                  response = { data: userData }
                } else {
                  // Use mock data if all endpoints fail and no current user data
                  console.log('🔄 Using mock data as final fallback', response)
                  response = {
                    data: {
                      _id: employeeId,
                      name: 'John Doe',
                      firstName: 'John',
                      lastName: 'Doe',
                      first_name: 'John',
                      last_name: 'Doe',
                      email: 'john.doe@example.com',
                      phone: '9876543210',
                      mobile: '9876543210',
                      gender: 'male',
                      employee_id: 'EMP001',
                      designation: 'Software Developer',
                      department: 'Technical',
                      status: 'active',
                      joining_date: '2024-01-01',
                      basic_salary: 50000,
                      basic_per_month: 50000,
                      ctc_per_month: 60000,
                      bank_name: 'HDFC Bank',
                      account_number: '1234567890',
                      ifsc_code: 'HDFC0001234',
                      branch_name: 'Main Branch',
                      address: '123 Main Street, Mumbai, Maharashtra',
                      current_address: {
                        address_line: '123 Main Street, Mumbai, Maharashtra',
                        district: 'Mumbai',
                        state: 'Maharashtra',
                        pincode: '400001',
                        block: 'Block A',
                        village: 'Village Name',
                        country: 'India',
                      },
                      permanent_address: {
                        address_line: '456 Permanent Street, Mumbai, Maharashtra',
                        district: 'Mumbai',
                        state: 'Maharashtra',
                        pincode: '400001',
                        block: 'Block B',
                        village: 'Village Name',
                        country: 'India',
                      },
                      father_name: 'Robert Doe',
                      mother_name: 'Jane Doe',
                      blood_group: 'O+',
                      marital_status: 'single',
                      dob: '1990-01-01',
                      qualification: 'B.Tech Computer Science',
                      aadhar_no: '123456789012',
                      pan_no: 'ABCDE1234F',
                      physically_challenged: false,
                      last_occupation: 'Software Engineer',
                      emergency_contact1: {
                        name: 'Emergency Contact',
                        phone: '9876543211',
                        relation: 'brother',
                      },
                      emergency_contact_name: 'Emergency Contact',
                      emergency_contact_number: '9876543211',
                      emergency_contact_relation: 'brother',
                      hra_per_month: 10000,
                      work_type: 'full-time',
                      shift: 'day',
                      reporting_manager: 'Manager Name',
                      location: 'Mumbai',
                      core: true,
                      company_name: 'Real Apple',
                      upi_id: 'john.doe@upi',
                      upi_app: 'Google Pay',
                      notes: 'Sample notes',
                      welcome_letter: true,
                      offer_letter: true,
                      bank_edit_locked: false,
                      document_edit_locked: false,
                      documents: [],
                    },
                  }
                }
              }
            }
          }
        }
      }

      if (response.data) {
        const employee = response.data

        // Check if data is nested in profiles structure
        let actualEmployeeData = employee

        // Handle profiles API response structure
        if (employee.profile) {
          actualEmployeeData = {
            ...employee,
            ...employee.profile,
            ...employee.personal,
            ...employee.employment,
            ...employee.bank,
            ...employee.upi,
            ...employee.additional,
          }
        } else if (employee.user) {
          // Handle case where profile data is nested under 'user' key
          actualEmployeeData = {
            ...employee,
            ...employee.user,
            ...employee.user?.profile,
            ...employee.user?.personal,
            ...employee.user?.employment,
            ...employee.user?.bank,
            ...employee.user?.upi,
            ...employee.user?.additional,
          }
        }

        // Transform API data to our form structure
        const transformedData = {
          profile: {
            employeeId:
              actualEmployeeData.employee_id ||
              actualEmployeeData.employeeId ||
              actualEmployeeData._id ||
              actualEmployeeData.id ||
              '',
            name:
              actualEmployeeData.name ||
              actualEmployeeData.firstName + ' ' + actualEmployeeData.lastName ||
              '',
            designation: actualEmployeeData.designation || '',
            department: actualEmployeeData.department || '',
          },
          general: {
            firstName:
              actualEmployeeData.first_name ||
              actualEmployeeData.firstName ||
              actualEmployeeData.name?.split(' ')[0] ||
              '',
            middleName: actualEmployeeData.middle_name || actualEmployeeData.middleName || '',
            lastName:
              actualEmployeeData.last_name ||
              actualEmployeeData.lastName ||
              actualEmployeeData.name?.split(' ').slice(1).join(' ') ||
              '',
            dateOfBirth: actualEmployeeData.dob
              ? moment(actualEmployeeData.dob).format('YYYY-MM-DD')
              : actualEmployeeData.dateOfBirth ||
                actualEmployeeData.date_of_birth ||
                actualEmployeeData.birth_date ||
                actualEmployeeData.birthDate ||
                '',
            gender: actualEmployeeData.gender || '',
          },
          personal: {
            email: actualEmployeeData.email || '',
            phone: actualEmployeeData.mobile || actualEmployeeData.phone || '',
            address:
              actualEmployeeData.current_address?.address_line || actualEmployeeData.address || '',
            maritalStatus:
              actualEmployeeData.marital_status || actualEmployeeData.maritalStatus || '',
            bloodGroup: actualEmployeeData.blood_group || actualEmployeeData.bloodGroup || '',
            fatherName: actualEmployeeData.father_name || actualEmployeeData.fatherName || '',
            motherName: actualEmployeeData.mother_name || actualEmployeeData.motherName || '',
            spouseName: actualEmployeeData.spouse_name || '',
            physicallyChallenged: actualEmployeeData.physically_challenged ? 'yes' : 'no',
            qualification: actualEmployeeData.qualification || '',
            lastOccupation:
              actualEmployeeData.last_occupation || actualEmployeeData.lastOccupation || '',
            aadharNo: actualEmployeeData.aadhar_no || actualEmployeeData.aadharNo || '',
            panNo: actualEmployeeData.pan_no || actualEmployeeData.panNo || '',
            currentAddress:
              actualEmployeeData.current_address?.address_line ||
              actualEmployeeData.currentAddress ||
              actualEmployeeData.address ||
              '',
            permanentAddress:
              actualEmployeeData.permanent_address?.address_line ||
              actualEmployeeData.permanentAddress ||
              actualEmployeeData.address ||
              '',
            dob: actualEmployeeData.dob ? moment(actualEmployeeData.dob).format('YYYY-MM-DD') : '',
            gender: actualEmployeeData.gender || '',
            // Additional address fields
            currentAddressBlock: actualEmployeeData.current_address?.block || '',
            currentAddressVillage: actualEmployeeData.current_address?.village || '',
            currentAddressDistrict: actualEmployeeData.current_address?.district || '',
            currentAddressState: actualEmployeeData.current_address?.state || '',
            currentAddressCountry: actualEmployeeData.current_address?.country || '',
            currentAddressPincode: actualEmployeeData.current_address?.pincode || '',
            permanentAddressBlock: actualEmployeeData.permanent_address?.block || '',
            permanentAddressVillage: actualEmployeeData.permanent_address?.village || '',
            permanentAddressDistrict: actualEmployeeData.permanent_address?.district || '',
            permanentAddressState: actualEmployeeData.permanent_address?.state || '',
            permanentAddressCountry: actualEmployeeData.permanent_address?.country || '',
            permanentAddressPincode: actualEmployeeData.permanent_address?.pincode || '',
            // Emergency contacts
            emergencyContact1Name: actualEmployeeData.emergency_contact1?.name || '',
            emergencyContact1Relation: actualEmployeeData.emergency_contact1?.relation || '',
            emergencyContact1Phone: actualEmployeeData.emergency_contact1?.phone || '',
            emergencyContact2Name: actualEmployeeData.emergency_contact2?.name || '',
            emergencyContact2Relation: actualEmployeeData.emergency_contact2?.relation || '',
            emergencyContact2Phone: actualEmployeeData.emergency_contact2?.phone || '',
            emergencyContact3Name: actualEmployeeData.emergency_contact3?.name || '',
            emergencyContact3Relation: actualEmployeeData.emergency_contact3?.relation || '',
            emergencyContact3Phone: actualEmployeeData.emergency_contact3?.phone || '',
          },
          employment: {
            department: actualEmployeeData.department || '',
            designation: actualEmployeeData.designation || '',
            joiningDate: actualEmployeeData.joining_date
              ? moment(actualEmployeeData.joining_date).format('YYYY-MM-DD')
              : '',
              remark:actualEmployeeData.remark,
            employeeType: actualEmployeeData.employee_type || '',
            status: actualEmployeeData.status || 'active',
            ctcPerMonth: actualEmployeeData.ctc_per_month || actualEmployeeData.ctcPerMonth || '',
            ctcPerMonthInWords:
              actualEmployeeData.ctc_per_month_in_words ||
              actualEmployeeData.ctcPerMonthInWords ||
              '',
            hraInWords: actualEmployeeData.hra_in_words || actualEmployeeData.hraInWords || '',
            location: actualEmployeeData.location || '',
            workType: actualEmployeeData.work_type || actualEmployeeData.workType || '',
            shift: actualEmployeeData.shift || '',
            reportingManager:
              actualEmployeeData.reporting_manager || actualEmployeeData.reportingManager || '',
            onboardingDate: actualEmployeeData.onboarding_date
              ? moment(actualEmployeeData.onboarding_date).format('YYYY-MM-DD')
              : '',
            // Additional employment fields
            basicPerMonth:
              actualEmployeeData.basic_per_month || actualEmployeeData.basicPerMonth || '',
            core: actualEmployeeData.core || actualEmployeeData.isCore || false,
            companyName: actualEmployeeData.company_name || actualEmployeeData.companyName || '',
            // Additional salary fields
            hraPerMonth: actualEmployeeData.hra_per_month || actualEmployeeData.hraPerMonth || '',
          },
          bank: {
            bankName: actualEmployeeData.bank_name || actualEmployeeData.bankName || '',
            accountNumber:
              actualEmployeeData.account_number || actualEmployeeData.accountNumber || '',
            ifscCode: actualEmployeeData.ifsc_code || actualEmployeeData.ifscCode || '',
            branchName: actualEmployeeData.branch_name || actualEmployeeData.branchName || '',
          },
          additional: {
            emergencyContactName:
              actualEmployeeData.emergency_contact1?.name ||
              actualEmployeeData.emergency_contact_name ||
              '',
            emergencyContactNumber:
              actualEmployeeData.emergency_contact1?.phone ||
              actualEmployeeData.emergency_contact_number ||
              '',
            emergencyContactRelation:
              actualEmployeeData.emergency_contact1?.relation ||
              actualEmployeeData.emergency_contact_relation ||
              '',
            emergencyContact2Name: actualEmployeeData.emergency_contact2?.name || '',
            emergencyContact2Number: actualEmployeeData.emergency_contact2?.phone || '',
            emergencyContact2Relation: actualEmployeeData.emergency_contact2?.relation || '',
            emergencyContact3Name: actualEmployeeData.emergency_contact3?.name || '',
            emergencyContact3Number: actualEmployeeData.emergency_contact3?.phone || '',
            emergencyContact3Relation: actualEmployeeData.emergency_contact3?.relation || '',
            bloodGroup: actualEmployeeData.blood_group || actualEmployeeData.bloodGroup || '',
            maritalStatus:
              actualEmployeeData.marital_status || actualEmployeeData.maritalStatus || '',
            notes: actualEmployeeData.notes || '',
            companyName: actualEmployeeData.company_name || actualEmployeeData.companyName || '',
            welcomeLetter:
              actualEmployeeData.welcome_letter || actualEmployeeData.welcomeLetter || false,
            offerLetter: actualEmployeeData.offer_letter || actualEmployeeData.offerLetter || false,
            bankEditLocked:
              actualEmployeeData.bank_edit_locked || actualEmployeeData.bankEditLocked || false,
            documentEditLocked:
              actualEmployeeData.document_edit_locked ||
              actualEmployeeData.documentEditLocked ||
              false,
            documents: actualEmployeeData.documents || [],
          },
        }

        setEmployeeData(transformedData)
        setFormData(transformedData)
      }
    } catch (error) {
      let errorMessage = 'Failed to load employee data. Please try again.'

      if (error.message?.includes('ENOENT')) {
        errorMessage =
          'Backend server is not running. Please start the backend server and try again.'
      } else if (error.response?.status === 404) {
        errorMessage = 'Employee not found. Please check the employee ID.'
      } else if (error.response?.status === 403) {
        errorMessage = "You do not have permission to view this employee's data."
      } else if (error.response?.status === 401) {
        errorMessage = 'Please login again to view employee data.'
      } else if (error.message?.includes('Network Error')) {
        errorMessage = 'Network error. Please check your internet connection.'
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Cannot connect to backend server. Please check if the server is running.'
      }

      setError(errorMessage)

      // Set fallback data for development
      const fallbackData = {
        profile: {
          employeeId: employeeId || id || admin?.id || admin?._id || 'N/A',
          name: admin?.name || 'Unknown User',
          designation: 'Employee',
          department: 'IT',
        },
        general: {
          firstName: admin?.name?.split(' ')[0] || 'Unknown',
          middleName: '',
          lastName: admin?.name?.split(' ').slice(1).join(' ') || 'User',
          dateOfBirth: '',
          gender: admin?.gender || 'male',
        },
        personal: {
          email: admin?.email || 'N/A',
          phone: admin?.mobile || 'N/A',
          address: 'N/A',
          maritalStatus: '',
          bloodGroup: '',
          fatherName: '',
          motherName: '',
          physicallyChallenged: 'no',
          qualification: '',
          lastOccupation: '',
          aadharNo: '',
          panNo: '',
          currentAddress: 'N/A',
          permanentAddress: 'N/A',
          dob: '',
          gender: 'male',
        },
        employment: {
          department: 'IT',
          designation: 'Employee',
          joiningDate: '',
          employeeType: 'full-time',
          status: 'active',
          ctcPerMonth: '',
          ctcPerMonthInWords: '',
          hraInWords: '',
          location: '',
          workType: 'full-time',
          shift: 'day',
          reportingManager: '',
          onboardingDate: '',
        },
        bank: {
          bankName: '',
          accountNumber: '',
          ifscCode: '',
          branchName: '',
        },
        additional: {
          emergencyContactName: '',
          emergencyContactNumber: '',
          emergencyContactRelation: '',
          bloodGroup: '',
          maritalStatus: '',
          notes: '',
        },
      }

      setEmployeeData(fallbackData)
      setFormData(fallbackData)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      await fetchEmployeeData()
    }
    loadData()
  }, [id, admin?._id]) // run only when id or admin changes

  // Initialize data and edit mode
  useEffect(() => {
    // If no ID provided and we have admin data, use current user data directly
    if (!id && admin && admin._id) {
      console.log('🔄 No ID provided, using current user data directly')
      const currentUserData = {
        employeeId: admin.employeeId || admin.employee_id || 'EMP' + admin._id?.slice(-4),
        name: admin.name || 'User',
        designation: admin.designation || 'Employee',
        department: admin.department || 'General',

        firstName: admin.firstName || admin.name?.split(' ')[0] || 'User',
        middleName: admin.middleName || '',
        lastName: admin.lastName || admin.name?.split(' ').slice(1).join(' ') || '',
        dateOfBirth: admin.dateOfBirth || admin.dob || '1990-01-01',
        gender: admin.gender || 'male',

        personal: {
          email: admin.email || '',
          phone: admin.phone || admin.mobile || '9876543210',
          address: admin.address || '123 Main Street, Mumbai, Maharashtra',
          currentAddress: admin.address || '123 Main Street, Mumbai, Maharashtra',
          permanentAddress: admin.permanentAddress || '456 Permanent Street, Mumbai, Maharashtra',
          fatherName: admin.fatherName || admin.father_name || 'Father Name',
          motherName: admin.motherName || admin.mother_name || 'Mother Name',
          spouseName: admin.spouseName || '',
          maritalStatus: admin.maritalStatus || admin.marital_status || 'single',
          bloodGroup: admin.bloodGroup || admin.blood_group || 'O+',
          physicallyChallenged: admin.physicallyChallenged || admin.physically_challenged || 'no',
          qualification: admin.qualification || 'B.Tech Computer Science',
          lastOccupation: admin.lastOccupation || admin.last_occupation || 'Software Engineer',
          aadharNo: admin.aadharNo || admin.aadhar_no || '123456789012',
          panNo: admin.panNo || admin.pan_no || 'ABCDE1234F',
          currentAddressBlock: admin.currentAddressBlock || 'Block A',
          currentAddressVillage: admin.currentAddressVillage || 'Village Name',
          currentAddressDistrict: admin.currentAddressDistrict || 'Mumbai',
          currentAddressCountry: admin.currentAddressCountry || 'India',
          permanentAddressBlock: admin.permanentAddressBlock || 'Block B',
          permanentAddressVillage: admin.permanentAddressVillage || 'Village Name',
          permanentAddressDistrict: admin.permanentAddressDistrict || 'Mumbai',
          permanentAddressCountry: admin.permanentAddressCountry || 'India',
        },
        employment: {
          department: admin.department || 'General',
          designation: admin.designation || 'Employee',
          joiningDate:
            admin.joiningDate || admin.joining_date || new Date().toISOString().split('T')[0],
            remark:admin.remark,
          employeeType: 'Full-time',
          status: admin.status || 'active',
          ctcPerMonth: admin.ctc || admin.ctc_per_month || 60000,
          ctcPerMonthInWords: 'Sixty Thousand',
          hraInWords: 'Ten Thousand',
          location: admin.location || 'Mumbai',
          workType: admin.workType || admin.work_type || 'full-time',
          shift: admin.shift || 'day',
          reportingManager: admin.reportingManager || admin.reporting_manager || 'Manager Name',
          onboardingDate:
            admin.onboardingDate || admin.onboarding_date || new Date().toISOString().split('T')[0],
          basicPerMonth: admin.basicSalary || admin.basic_salary || 50000,
          core: admin.isCore || admin.core || true,
          companyName: admin.companyName || admin.company_name || 'Real Apple',
        },
        bank: {
          bankName: admin.bankName || admin.bank_name || 'HDFC Bank',
          accountNumber: admin.accountNumber || admin.account_number || '1234567890',
          ifscCode: admin.ifscCode || admin.ifsc_code || 'HDFC0001234',
          branchName: admin.branchName || admin.branch_name || 'Main Branch',
        },
        additional: {
          emergencyContactName:
            admin.emergencyContactName || admin.emergency_contact_name || 'Emergency Contact',
          emergencyContactNumber:
            admin.emergencyContactNumber || admin.emergency_contact_number || '9876543211',
          emergencyContactRelation:
            admin.emergencyContactRelation || admin.emergency_contact_relation || 'brother',
          emergencyContact2Name: admin.emergencyContact2Name || admin.emergency_contact2_name || '',
          emergencyContact2Number:
            admin.emergencyContact2Number || admin.emergency_contact2_number || '',
          emergencyContact2Relation:
            admin.emergencyContact2Relation || admin.emergency_contact2_relation || '',
          emergencyContact3Name: admin.emergencyContact3Name || admin.emergency_contact3_name || '',
          emergencyContact3Number:
            admin.emergencyContact3Number || admin.emergency_contact3_number || '',
          emergencyContact3Relation:
            admin.emergencyContact3Relation || admin.emergency_contact3_relation || '',
          bloodGroup: admin.bloodGroup || admin.blood_group || 'O+',
          maritalStatus: admin.maritalStatus || admin.marital_status || 'single',
          notes: admin.notes || 'Sample notes',
          companyName: admin.companyName || admin.company_name || 'Real Apple',
          welcomeLetter: admin.welcomeLetter || admin.welcome_letter || true,
          offerLetter: admin.offerLetter || admin.offer_letter || true,
          bankEditLocked: admin.bankEditLocked || admin.bank_edit_locked || false,
          documentEditLocked: admin.documentEditLocked || admin.document_edit_locked || false,
          documents: admin.documents || [],
        },
        attachments: {
          // Add attachment fields if needed
        },
      }

      console.log('📊 Using current user data directly:', currentUserData)
      setEmployeeData(currentUserData)
      setFormData(currentUserData)
      setLoading(false)
    } else {
      fetchEmployeeData()
    }

    // Initialize edit mode
    const initialEditMode = {}
    sections.forEach((section) => {
      initialEditMode[section] = false
    })
    setEditMode(initialEditMode)
  }, [id, admin?.id, admin?._id])

  // Loading state
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <CSpinner size="lg" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="container mt-4">
        <CAlert color="danger">
          <h5>Error Loading Profile</h5>
          <p>{error}</p>
          <CButton color="primary" onClick={() => window.location.reload()}>
            Retry
          </CButton>
        </CAlert>
      </div>
    )
  }

  // Debug component to show current user data (only when debug mode is enabled)
  if (
    process.env.NODE_ENV === 'development' &&
    !employeeData &&
    !loading &&
    window.location.search.includes('debug=true')
  ) {
    return (
      <div className="container mt-4">
        <CAlert color="info">
          <h5>Debug Information - Current User Data</h5>
          <p>
            <strong>User ID:</strong> {admin?._id || admin?.id || 'Not found'}
          </p>
          <p>
            <strong>User Name:</strong> {admin?.name || 'Not found'}
          </p>
          <p>
            <strong>User Email:</strong> {admin?.email || 'Not found'}
          </p>
          <p>
            <strong>User Role:</strong> {admin?.role?.map((r) => r.name).join(', ') || 'Not found'}
          </p>
          <p>
            <strong>URL ID Parameter:</strong> {id || 'Not provided'}
          </p>
          <pre style={{ fontSize: '12px', maxHeight: '200px', overflow: 'auto' }}>
            {JSON.stringify(admin, null, 2)}
          </pre>
        </CAlert>
      </div>
    )
  }

  // Debug component to show form data (only in development and when debug mode is enabled)
  if (
    process.env.NODE_ENV === 'development' &&
    employeeData &&
    window.location.search.includes('debug=true')
  ) {
    return (
      <div className="container mt-4">
        <CAlert color="success">
          <h5>Debug Information - Form Data</h5>
          <CButton
            color="primary"
            className="mb-3"
            onClick={() => {
              console.log('🔍 Current formData:', formData)
              console.log('🔍 Current employeeData:', employeeData)
            }}
          >
            Log Form Data to Console
          </CButton>
          <div className="row">
            <div className="col-md-6">
              <h6>Profile Section:</h6>
              <pre style={{ fontSize: '10px', maxHeight: '150px', overflow: 'auto' }}>
                {JSON.stringify(formData.profile, null, 2)}
              </pre>
            </div>
            <div className="col-md-6">
              <h6>General Section:</h6>
              <pre style={{ fontSize: '10px', maxHeight: '150px', overflow: 'auto' }}>
                {JSON.stringify(formData.general, null, 2)}
              </pre>
            </div>
            <div className="col-md-6">
              <h6>Personal Section:</h6>
              <pre style={{ fontSize: '10px', maxHeight: '150px', overflow: 'auto' }}>
                {JSON.stringify(formData.personal, null, 2)}
              </pre>
            </div>
            <div className="col-md-6">
              <h6>Employment Section:</h6>
              <pre style={{ fontSize: '10px', maxHeight: '150px', overflow: 'auto' }}>
                {JSON.stringify(formData.employment, null, 2)}
              </pre>
            </div>
            <div className="col-md-6">
              <h6>Bank Section:</h6>
              <pre style={{ fontSize: '10px', maxHeight: '150px', overflow: 'auto' }}>
                {JSON.stringify(formData.bank, null, 2)}
              </pre>
            </div>
            <div className="col-md-6">
              <h6>Additional Section:</h6>
              <pre style={{ fontSize: '10px', maxHeight: '150px', overflow: 'auto' }}>
                {JSON.stringify(formData.additional, null, 2)}
              </pre>
            </div>
          </div>
        </CAlert>
      </div>
    )
  }

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
  }

  const handleEditToggle = (section) => {
    if (!canEditSection(section)) {
      if (!canEdit) {
        if (!['bank', 'attachments'].includes(section)) {
          alert('You can only edit Bank Details and Document Attachments.')
          return
        } else if (hasUserEditedSection(section) && section === 'bank') {
          // Only show warning for bank section (attachments can be edited multiple times)
          alert(
            `You have already edited Bank Details once. Only HR and Admin can edit further.`,
          )
          return
        }
      }
      return
    }

    setEditMode((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const handleSave = async (section) => {
    try {
      let requestBody = {}

      switch (section) {
        case 'profile':
          requestBody = {}
          if (formData.profile?.designation) {
            requestBody.designation = formData.profile.designation
          }
          if (formData.profile?.phone) {
            requestBody.mobile_primary = formData.profile.phone
          }
          if (formData.profile?.department) {
            requestBody.department = formData.profile.department
          }
          break

        case 'general':
          requestBody = {
            dob: formData.general?.dateOfBirth,
          }
          break

        case 'personal':
          requestBody = {
            official_email: formData.personal?.email,
            mobile_primary: formData.personal?.phone,
            father_name: formData.personal?.fatherName,
            mother_name: formData.personal?.motherName,
            spouse_name: formData.personal?.spouseName,
            marital_status: formData.personal?.maritalStatus,
            blood_group: formData.personal?.bloodGroup,
            physically_challenged: formData.personal?.physicallyChallenged === 'yes',
            qualification: formData.personal?.qualification,
            last_occupation: formData.personal?.lastOccupation,
            aadhar_no: formData.personal?.aadharNo,
            pan_no: formData.personal?.panNo,
            current_address: {
              address_line: formData.personal?.currentAddress,
              village: formData.personal?.currentAddressVillage,
              block: formData.personal?.currentAddressBlock,
              district: formData.personal?.currentAddressDistrict,
              state: formData.personal?.currentAddressState || 'MADHYA PRADESH',
              country: formData.personal?.currentAddressCountry || 'India',
              pincode: formData.personal?.currentAddressPincode || '457001',
            },
            permanent_address: {
              address_line: formData.personal?.permanentAddress,
              village: formData.personal?.permanentAddressVillage,
              block: formData.personal?.permanentAddressBlock,
              district: formData.personal?.permanentAddressDistrict,
              state: formData.personal?.permanentAddressState || 'MADHYA PRADESH',
              country: formData.personal?.permanentAddressCountry || 'India',
              pincode: formData.personal?.permanentAddressPincode || '457001',
            },
            emergency_contact1: {
              name: formData.personal?.emergencyContact1Name,
              relation: formData.personal?.emergencyContact1Relation,
              phone: formData.personal?.emergencyContact1Phone,
            },
            emergency_contact2: {
              name: formData.personal?.emergencyContact2Name,
              relation: formData.personal?.emergencyContact2Relation,
              phone: formData.personal?.emergencyContact2Phone,
            },
            emergency_contact3: {
              name: formData.personal?.emergencyContact3Name,
              relation: formData.personal?.emergencyContact3Relation,
              phone: formData.personal?.emergencyContact3Phone,
            },
          }
          break

        case 'employment':
          requestBody = {
            designation: formData.employment?.designation,
            department: formData.employment?.department,
            employee_type: formData.employment?.employeeType,
            work_type: formData.employment?.workType,
            shift: formData.employment?.shift,
            location: formData.employment?.location,
            joining_date: formData.employment?.joiningDate,
            onboarding_date: formData.employment?.onboardingDate,
            reporting_manager: formData.employment?.reportingManager,
            // employment_status: formData.employment?.status,
            ctc_per_month: formData.employment?.ctcPerMonth,
            ctc_per_month_in_words: formData.employment?.ctcPerMonthInWords,
            hra_per_month: formData.employment?.hraPerMonth,
            hra_in_words: formData.employment?.hraInWords,
            basic_per_month: formData.employment?.basicPerMonth,
            core: formData.employment?.core,
            company_name: formData.employment?.companyName,
            // status: formData.employment?.status || 'active',
          }
          break

        case 'bank':
          requestBody = {
            bank_name: formData.bank?.bankName,
            account_number: formData.bank?.accountNumber,
            ifsc_code: formData.bank?.ifscCode,
            branch_name: formData.bank?.branchName,
          }
          break

        case 'additional':
          requestBody = {
            welcome_letter: formData.additional?.welcomeLetter,
            offer_letter: formData.additional?.offerLetter,
            bank_edit_locked: formData.additional?.bankEditLocked,
            document_edit_locked: formData.additional?.documentEditLocked,
            documents: formData.additional?.documents || [],
            // notes: formData.additional?.notes || '',
          }
          break

        default:
          console.warn(`Unknown section: ${section}`)
          return
      }

      // Clean empty fields
      const cleanRequestBody = Object.fromEntries(
        Object.entries(requestBody).filter(([_, value]) => {
          if (typeof value === 'object' && !Array.isArray(value)) {
            return Object.values(value).some((v) => v !== undefined && v !== null && v !== '')
          }
          return value !== undefined && value !== null && value !== ''
        }),
      )

      console.log(`Saving ${section} section:`, cleanRequestBody)

      const employeeId = id || admin?.id || admin?._id
      const response = await new BasicProvider(`profiles/${employeeId}`, dispatch).patchRequest(
        cleanRequestBody,
      )

      if (response.data) {
        setEmployeeData(response.data)
        setFormData(response.data)
      } else {
        setEmployeeData(response)
        setFormData(response)
      }

      setEditMode((prev) => ({ ...prev, [section]: false }))
      setError(null)
      alert(`${section.charAt(0).toUpperCase() + section.slice(1)} updated successfully!`)
    } catch (error) {
      console.error('Error updating employee data:', error)
      let errorMessage =
        error.response?.data?.message || error.response?.data?.error || error.message
      setError(`Failed to update ${section} data: ${errorMessage}`)
      alert(`Failed to update ${section} data: ${errorMessage}`)
    }
  }

  const handleCancel = (section) => {
    setFormData(employeeData)
    setEditMode((prev) => ({ ...prev, [section]: false }))
  }

  const handleFileUpload = (field, file) => {
    setAttachments((prev) => ({
      ...prev,
      [field]: file,
    }))
  }

  const handleAttachmentUpload = (field, event) => {
    const file = event.target.files[0]
    if (file) {
      handleFileUpload(field, file)
    }
  }

  const handleAttendanceClick = () => {
    if (id) {
      navigate(`/hrms/staff/attendance/${id}`)
    } else {
      alert('Employee ID not found')
    }
  }

  const normalizeId = (v) => {
    if (!v) return ''
    if (typeof v === 'string') return v
    if (typeof v === 'object') return v?._id || v?.id || ''
    return ''
  }

  const pickFirst = (...vals) => {
    for (const v of vals) {
      if (v !== undefined && v !== null && String(v).trim() !== '') return v
    }
    return ''
  }

  const buildUserRef = (staff) => {
    const profile = staff?.profile || {}
    const staffId = normalizeId(staff?._id)
    const name = pickFirst(profile?.name, staff?.name)
    const email = pickFirst(profile?.email, staff?.email)
    return { _id: staffId, name, email }
  }

  const fetchAuthorityListsForEmployee = async (employeeId) => {
    if (!employeeId) return
    setMyAuthorityLoading(true)
    try {
      const res = await new BasicProvider('admins?page=1&count=5000', dispatch).getRequest()
      const staffList = res?.data?.data || []

      const empId = String(employeeId)
      const rmList = []
      const laList = []

      staffList.forEach((staff) => {
        const profile = staff?.profile || {}

        const rmId = normalizeId(
          pickFirst(
            profile?.reporting_manager_id,
            profile?.reportingManagerId,
            staff?.reporting_manager_id,
            staff?.reportingManagerId,
          ),
        )

        const la1 = normalizeId(
          pickFirst(
            profile?.leaveAuthorityOne,
            profile?.leave_authority_one,
            profile?.leave_authority_1,
            staff?.leaveAuthorityOne,
            staff?.leave_authority_one,
            staff?.leave_authority_1,
          ),
        )
        const la2 = normalizeId(
          pickFirst(
            profile?.leaveAuthorityTwo,
            profile?.leave_authority_two,
            profile?.leave_authority_2,
            staff?.leaveAuthorityTwo,
            staff?.leave_authority_two,
            staff?.leave_authority_2,
          ),
        )

        if (rmId && rmId === empId) rmList.push(buildUserRef(staff))
        if ((la1 && la1 === empId) || (la2 && la2 === empId)) laList.push(buildUserRef(staff))
      })

      const uniqById = (arr) => {
        const map = new Map()
        arr.forEach((u) => {
          if (!u?._id || u._id === empId) return
          if (!map.has(u._id)) map.set(u._id, u)
        })
        return Array.from(map.values())
      }

      setReportingManagerOf(uniqById(rmList))
      setLeaveAuthorityOf(uniqById(laList))
    } catch (err) {
      console.error('Failed to load authority lists:', err)
      setReportingManagerOf([])
      setLeaveAuthorityOf([])
      alert('Failed to load authority list')
    } finally {
      setMyAuthorityLoading(false)
    }
  }

  if (loading) {
    return (
      <CContainer
        fluid
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '400px' }}
      >
        <CSpinner />
      </CContainer>
    )
  }

  if (error) {
    return (
      <CContainer fluid>
        <CAlert color="danger">{error}</CAlert>
      </CContainer>
    )
  }

  return (
    <div className="profile-container">
      {/* Professional Header */}
      <div className="profile-header">
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col-md-8">
              <div className="profile-title">
                <h1 className="mb-2">Employee Profile</h1>
                <p className="mb-0 text-muted">Comprehensive employee information and management</p>
              </div>
            </div>
            <div className="col-md-4">
              <div
                className="profile-actions "
                style={{ display: `${route.includes('/hrms/profile') ? 'none' : 'block'}` }}
              >
                <CButton color="primary" className="me-2" onClick={handleAttendanceClick}>
                  <CIcon icon={cilPlus} className="me-1" />
                  Attendance
                </CButton>
                <CButton color="outline-primary" className="me-2">
                  Leave
                </CButton>
                <CButton
                  color="success"
                  variant="outline"
                  onClick={() => {
                    setMyAuthorityModalVisible(true)
                    fetchAuthorityListsForEmployee(id)
                  }}
                >
                  Team / Authority
                </CButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            {/* Edit Permissions Alert */}
            {!canEdit && (
              <CRow className="mb-4">
                <CCol xs={12}>
                  <CAlert color="info">
                    <div className="d-flex align-items-start">
                      <CIcon icon={cilUser} className="me-3 mt-1" />
                      <div className="flex-grow-1">
                        <div className="mb-2">
                          <strong>Edit Permissions:</strong> You can edit{' '}
                          <strong>Bank Details</strong> and <strong>Document Attachments</strong>{' '}
                          once each.
                        </div>
                        <div className="row">
                          <div className="col-md-6">
                            <div className="d-flex align-items-center">
                              <span
                                className={`badge me-2 ${
                                  editAttempts.bank ? 'bg-warning' : 'bg-success'
                                }`}
                              >
                                {editAttempts.bank ? '✓' : '○'}
                              </span>
                              <span className={editAttempts.bank ? 'text-warning' : 'text-success'}>
                                <strong>Bank Details:</strong>{' '}
                                {editAttempts.bank ? 'Already edited' : 'Available for editing'}
                              </span>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="d-flex align-items-center">
                              <span
                                className={`badge me-2 ${
                                  editAttempts.attachments ? 'bg-warning' : 'bg-success'
                                }`}
                              >
                                {editAttempts.attachments ? '✓' : '○'}
                              </span>
                              <span
                                className={
                                  editAttempts.attachments ? 'text-warning' : 'text-success'
                                }
                              >
                                <strong>Document Attachments:</strong>{' '}
                                {editAttempts.attachments
                                  ? 'Already edited'
                                  : 'Available for editing'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CAlert>
                </CCol>
              </CRow>
            )}

            {/* Profile Information */}
            <CRow className="mb-4">
              <CCol xs={12}>
                <CCard>
                  <CCardHeader className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <CIcon icon={cilUser} className="me-2" />

                      <h5 className="mb-0">Profile Information</h5>
                    </div>

                    {canEditSection('profile') && (
                      <CButton
                        color="primary"
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditToggle('profile')}
                      >
                        <CIcon icon={cilPencil} className="me-1" />
                        {editMode.profile ? 'Cancel' : 'Edit'}
                      </CButton>
                    )}
                    {!canEdit && !canEditSection('profile') && (
                      <CButton
                        color="secondary"
                        variant="outline"
                        size="sm"
                        disabled
                        title="Only HR and Admin can edit this section"
                      >
                        <CIcon icon={cilPencil} className="me-1" />
                        Edit (Restricted)
                      </CButton>
                    )}
                  </CCardHeader>
                  <CCardBody>
                    <CRow>
                      <CCol md={6}>
                        <CFormLabel>Employee ID</CFormLabel>
                        <CFormInput
                          value={formData.profile?.employeeId || ''}
                          onChange={(e) =>
                            handleInputChange('profile', 'employeeId', e.target.value)
                          }
                          disabled={true}
                          placeholder="Enter Employee ID"
                        />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>
                          Name <span className="text-muted">(Read Only)</span>
                          {/* <small className="text-muted d-block">
                            <CIcon icon={cilUser} className="me-1" />
                            Name cannot be changed for security reasons
                          </small> */}
                        </CFormLabel>
                        <CFormInput
                          value={formData.profile?.name || ''}
                          disabled={true}
                          placeholder="Name cannot be edited"
                          style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                        />
                      </CCol>
                    </CRow>
                    <CRow className="mt-3">
                      <CCol md={6}>
                        <CFormLabel>Designation</CFormLabel>
                        <CFormInput
                          value={formData.profile?.designation || ''}
                          onChange={(e) =>
                            handleInputChange('profile', 'designation', e.target.value)
                          }
                          disabled={!editMode.profile}
                          placeholder="Enter Designation"
                        />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>Staff Type</CFormLabel>
                        <CFormSelect
                          value={formData.employment?.employeeType || ''}
                          onChange={(e) =>
                            handleInputChange('profile', 'staffType', e.target.value)
                          }
                          disabled={!editMode.profile}
                        >
                          <option value="">Select Staff Type</option>
                          <option value="permanent">Permanent</option>
                          <option value="contract">Contract</option>
                          <option value="temporary">Temporary</option>
                          <option value="intern">Intern</option>
                          <option value="consultant">Consultant</option>
                        </CFormSelect>
                      </CCol>
                    </CRow>
                    <CRow className="mt-3">
                      <CCol md={6}>
                        <CFormLabel>Contact Number</CFormLabel>
                        <CFormInput
                          value={formData.personal?.phone || ''}
                          onChange={(e) => handleInputChange('profile', 'phone', e.target.value)}
                          disabled={!editMode.profile}
                          placeholder="Enter Contact Number"
                        />

                        <small className="text-muted">Enter 10 digit mobile number</small>
                      </CCol>
                      {/* <CCol md={6}>
                        <CFormLabel>Attendance Supervisor</CFormLabel>
                        <CFormInput
                          value={formData.profile?.attendanceSupervisor || ''}
                          onChange={(e) =>
                            handleInputChange('profile', 'attendanceSupervisor', e.target.value)
                          }
                          disabled={!editMode.profile}
                          placeholder="Enter Attendance Supervisor"
                        />
                      </CCol> */}
                      <CCol md={6}>
                        <CFormLabel>Department</CFormLabel>
                        <CFormSelect
                          value={formData.profile?.department || ''}
                          onChange={(e) =>
                            handleInputChange('profile', 'department', e.target.value)
                          }
                          disabled={!editMode.profile}
                        >
                          <option value="">Select Department</option>
                          <option value="technical">Technical</option>
                          <option value="management">Management</option>
                        </CFormSelect>
                      </CCol>
                    </CRow>
                    <CRow className="mt-3">
                      <CCol md={6}>
                        <CFormLabel>Profile Picture</CFormLabel>
                        <CFormInput type="file" accept="image/*" disabled={!editMode.profile} />
                      </CCol>
                    </CRow>
                    {editMode.profile && (
                      <CRow className="mt-3">
                        <CCol xs={12} className="d-flex justify-content-end">
                          <CButton
                            color="success"
                            className="me-2"
                            onClick={() => handleSave('profile')}
                          >
                            <CIcon icon={cilSave} className="me-1" />
                            Save
                          </CButton>
                          <CButton color="secondary" onClick={() => handleCancel('profile')}>
                            <CIcon icon={cilX} className="me-1" />
                            Cancel
                          </CButton>
                        </CCol>
                      </CRow>
                    )}
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
 
            {/* Personal Information */}
            <CRow className="mb-4">
              <CCol xs={12}>
                <CCard>
                  <CCardHeader className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <CIcon icon={cilEnvelopeClosed} className="me-2" />
                      <h5 className="mb-0">Personal Information</h5>
                    </div>
                    {canEditSection('personal') && (
                      <CButton
                        color="primary"
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditToggle('personal')}
                      >
                        <CIcon icon={cilPencil} className="me-1" />
                        {editMode.personal ? 'Cancel' : 'Edit'}
                      </CButton>
                    )}
                    {!canEdit && !canEditSection('personal') && (
                      <CButton
                        color="secondary"
                        variant="outline"
                        size="sm"
                        disabled
                        title="Only HR and Admin can edit this section"
                      >
                        <CIcon icon={cilPencil} className="me-1" />
                        Edit (Restricted)
                      </CButton>
                    )}
                  </CCardHeader>
                  <CCardBody>
                    <CRow>
                      <CCol md={6}>
                        <CFormLabel>Email</CFormLabel>
                        <CFormInput
                          type="email"
                          value={formData.personal?.email || ''}
                          onChange={(e) =>
                            handleInputChange('personal', 'official_email', e.target.value)
                          }
                          disabled={!editMode.personal}
                          placeholder="Enter Email"
                        />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>Gender</CFormLabel>
                        <CFormSelect
                          value={formData.personal?.gender || ''}
                          onChange={(e) => handleInputChange('personal', 'gender', e.target.value)}
                          // disabled={!editMode.general}
                          disabled={true}
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </CFormSelect>
                      </CCol>
                    </CRow>

                    <CRow className="mt-3">
                      <CCol md={6}>
                        <CFormLabel>Date of Birth</CFormLabel>
                        <CFormInput
                          type="date"
                          value={formData.personal?.dob || ''}
                          onChange={(e) => handleInputChange('personal', 'dob', e.target.value)}
                          disabled={!editMode.personal}
                        />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>Marital Status</CFormLabel>
                        <CFormSelect
                          value={formData.personal?.maritalStatus || ''}
                          onChange={(e) =>
                            handleInputChange('personal', 'maritalStatus', e.target.value)
                          }
                          disabled={!editMode.personal}
                        >
                          <option value="">Select Status</option>
                          <option value="single">Single</option>
                          <option value="married">Married</option>
                          <option value="divorced">Divorced</option>
                          <option value="widowed">Widowed</option>
                        </CFormSelect>
                      </CCol>
                    </CRow>

                    <CRow className="mt-3">
                      <CCol md={6}>
                        <CFormLabel>Blood Group</CFormLabel>
                        <CFormInput
                          value={formData.personal?.bloodGroup || ''}
                          onChange={(e) =>
                            handleInputChange('personal', 'bloodGroup', e.target.value)
                          }
                          disabled={!editMode.personal}
                          placeholder="Enter Blood Group"
                        />
                      </CCol>
                    </CRow>

                    <CRow className="mt-3">
                      <CCol md={4}>
                        <CFormLabel>Father's Name</CFormLabel>
                        <CFormInput
                          value={formData.personal?.fatherName || ''}
                          onChange={(e) =>
                            handleInputChange('personal', 'fatherName', e.target.value)
                          }
                          disabled={!editMode.personal}
                          placeholder="Enter Father's Name"
                        />
                      </CCol>
                      <CCol md={4}>
                        <CFormLabel>Mother's Name</CFormLabel>
                        <CFormInput
                          value={formData.personal?.motherName || ''}
                          onChange={(e) =>
                            handleInputChange('personal', 'motherName', e.target.value)
                          }
                          disabled={!editMode.personal}
                          placeholder="Enter Mother's Name"
                        />
                      </CCol>
                    </CRow>
                    <CRow>
                      <CCol md={6}>
                        <CFormLabel>Spouse's Name</CFormLabel>
                        <CFormInput
                          value={formData.personal?.spouseName || ''}
                          onChange={(e) =>
                            handleInputChange('personal', 'spouseName', e.target.value)
                          }
                          disabled={true}
                          placeholder="Enter Spouse's Name"
                        />
                      </CCol>
                    </CRow>
                    <CRow className="mt-3">
                      <CCol md={6}>
                        <CFormLabel>Physically Challenged</CFormLabel>
                        <CFormSelect
                          value={formData.personal?.physicallyChallenged || ''}
                          onChange={(e) =>
                            handleInputChange('personal', 'physicallyChallenged', e.target.value)
                          }
                          disabled={!editMode.personal}
                        >
                          <option value="">Select Option</option>
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </CFormSelect>
                      </CCol>
                    </CRow>

                    <CRow className="mt-3">
                      <CCol md={6}>
                        <CFormLabel>Current Address</CFormLabel>
                        <CFormTextarea
                          value={formData.personal?.currentAddress || ''}
                          onChange={(e) =>
                            handleInputChange('personal', 'currentAddress', e.target.value)
                          }
                          disabled={!editMode.personal}
                          placeholder="Enter Current Address"
                          rows={2}
                        />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>Permanent Address</CFormLabel>
                        <CFormTextarea
                          value={formData.personal?.permanentAddress || ''}
                          onChange={(e) =>
                            handleInputChange('personal', 'permanentAddress', e.target.value)
                          }
                          disabled={!editMode.personal}
                          placeholder="Enter Permanent Address"
                          rows={2}
                        />
                      </CCol>
                    </CRow>

                    {/* Additional Address Details - Current Address */}
                    <CRow className="mt-3">
                      <CCol xs={12}>
                        <h6 className="text-muted mb-3">Current Address Details</h6>
                      </CCol>
                      <CCol md={3}>
                        <CFormLabel>Block</CFormLabel>
                        <CFormInput
                          value={formData.personal?.currentAddressBlock || ''}
                          onChange={(e) =>
                            handleInputChange('personal', 'currentAddressBlock', e.target.value)
                          }
                          disabled={!editMode.personal}
                          placeholder="Enter Block"
                        />
                      </CCol>
                      <CCol md={3}>
                        <CFormLabel>Village</CFormLabel>
                        <CFormInput
                          value={formData.personal?.currentAddressVillage || ''}
                          onChange={(e) =>
                            handleInputChange('personal', 'currentAddressVillage', e.target.value)
                          }
                          disabled={!editMode.personal}
                          placeholder="Enter Village"
                        />
                      </CCol>
                      <CCol md={3}>
                        <CFormLabel>District</CFormLabel>
                        <CFormInput
                          value={formData.personal?.currentAddressDistrict || ''}
                          onChange={(e) =>
                            handleInputChange('personal', 'currentAddressDistrict', e.target.value)
                          }
                          disabled={!editMode.personal}
                          placeholder="Enter District"
                        />
                      </CCol>
                      <CCol md={3}>
                        <CFormLabel>State</CFormLabel>
                        <CFormInput
                          value={formData.personal?.currentAddressState || ''}
                          onChange={(e) =>
                            handleInputChange('personal', 'currentAddressState', e.target.value)
                          }
                          disabled={!editMode.personal}
                          placeholder="Enter State"
                        />
                      </CCol>
                    </CRow>

                    <CRow className="mt-3">
                      <CCol md={3}>
                        <CFormLabel>Country</CFormLabel>
                        <CFormInput
                          value={formData.personal?.currentAddressCountry || ''}
                          onChange={(e) =>
                            handleInputChange('personal', 'currentAddressCountry', e.target.value)
                          }
                          disabled={!editMode.personal}
                          placeholder="Enter Country"
                        />
                      </CCol>
                      <CCol md={3}>
                        <CFormLabel>Pincode</CFormLabel>
                        <CFormInput
                          value={formData.personal?.currentAddressPincode || ''}
                          onChange={(e) =>
                            handleInputChange('personal', 'currentAddressPincode', e.target.value)
                          }
                          disabled={!editMode.personal}
                          placeholder="Enter Pincode"
                        />
                      </CCol>
                    </CRow>

                    {/* Additional Address Details - Permanent Address */}
                    <CRow className="mt-3">
                      <CCol xs={12}>
                        <h6 className="text-muted mb-3">Permanent Address Details</h6>
                      </CCol>
                      <CCol md={3}>
                        <CFormLabel>Block</CFormLabel>
                        <CFormInput
                          value={formData.personal?.permanentAddressBlock || ''}
                          onChange={(e) =>
                            handleInputChange('personal', 'permanentAddressBlock', e.target.value)
                          }
                          disabled={!editMode.personal}
                          placeholder="Enter Block"
                        />
                      </CCol>
                      <CCol md={3}>
                        <CFormLabel>Village</CFormLabel>
                        <CFormInput
                          value={formData.personal?.permanentAddressVillage || ''}
                          onChange={(e) =>
                            handleInputChange('personal', 'permanentAddressVillage', e.target.value)
                          }
                          disabled={!editMode.personal}
                          placeholder="Enter Village"
                        />
                      </CCol>
                      <CCol md={3}>
                        <CFormLabel>District</CFormLabel>
                        <CFormInput
                          value={formData.personal?.permanentAddressDistrict || ''}
                          onChange={(e) =>
                            handleInputChange(
                              'personal',
                              'permanentAddressDistrict',
                              e.target.value,
                            )
                          }
                          disabled={!editMode.personal}
                          placeholder="Enter District"
                        />
                      </CCol>
                      <CCol md={3}>
                        <CFormLabel>State</CFormLabel>
                        <CFormInput
                          value={formData.personal?.permanentAddressState || ''}
                          onChange={(e) =>
                            handleInputChange('personal', 'permanentAddressState', e.target.value)
                          }
                          disabled={!editMode.personal}
                          placeholder="Enter State"
                        />
                      </CCol>
                    </CRow>

                    <CRow className="mt-3">
                      <CCol md={3}>
                        <CFormLabel>Country</CFormLabel>
                        <CFormInput
                          value={formData.personal?.permanentAddressCountry || ''}
                          onChange={(e) =>
                            handleInputChange('personal', 'permanentAddressCountry', e.target.value)
                          }
                          disabled={!editMode.personal}
                          placeholder="Enter Country"
                        />
                      </CCol>
                      <CCol md={3}>
                        <CFormLabel>Pincode</CFormLabel>
                        <CFormInput
                          value={formData.personal?.permanentAddressPincode || ''}
                          onChange={(e) =>
                            handleInputChange('personal', 'permanentAddressPincode', e.target.value)
                          }
                          disabled={!editMode.personal}
                          placeholder="Enter Pincode"
                        />
                      </CCol>
                    </CRow>

                    {/* Additional Personal Information */}
                    <CRow className="mt-3">
                      <CCol xs={12}>
                        <h6 className="text-muted mb-3">Additional Information</h6>
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>Qualification</CFormLabel>
                        <CFormInput
                          value={formData.personal?.qualification || ''}
                          onChange={(e) =>
                            handleInputChange('personal', 'qualification', e.target.value)
                          }
                          disabled={!editMode.personal}
                          placeholder="Enter Qualification"
                        />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>Last Occupation</CFormLabel>
                        <CFormInput
                          value={formData.personal?.lastOccupation || ''}
                          onChange={(e) =>
                            handleInputChange('personal', 'lastOccupation', e.target.value)
                          }
                          disabled={!editMode.personal}
                          placeholder="Enter Last Occupation"
                        />
                      </CCol>
                    </CRow>

                    <CRow className="mt-3">
                      <CCol md={6}>
                        <CFormLabel>Aadhar Number</CFormLabel>
                        <CFormInput
                          value={formData.personal?.aadharNo || ''}
                          onChange={(e) =>
                            handleInputChange('personal', 'aadharNo', e.target.value)
                          }
                          disabled={!editMode.personal}
                          placeholder="Enter Aadhar Number"
                        />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>PAN Number</CFormLabel>
                        <CFormInput
                          value={formData.personal?.panNo || ''}
                          onChange={(e) => handleInputChange('personal', 'panNo', e.target.value)}
                          disabled={!editMode.personal}
                          placeholder="Enter PAN Number"
                        />
                      </CCol>
                    </CRow>

                    {/* Emergency Contacts */}
                    <CRow className="mt-3">
                      <CCol xs={12}>
                        <h6 className="text-muted mb-3">Emergency Contacts</h6>
                      </CCol>
                      <CCol md={4}>
                        <CFormLabel>Emergency Contact 1 - Name</CFormLabel>
                        <CFormInput
                          value={formData.personal?.emergencyContact1Name || ''}
                          onChange={(e) =>
                            handleInputChange('personal', 'emergencyContact1Name', e.target.value)
                          }
                          disabled={!editMode.personal}
                          placeholder="Enter Name"
                        />
                      </CCol>
                      <CCol md={4}>
                        <CFormLabel>Emergency Contact 1 - Relation</CFormLabel>
                        <CFormInput
                          value={formData.personal?.emergencyContact1Relation || ''}
                          onChange={(e) =>
                            handleInputChange(
                              'personal',
                              'emergencyContact1Relation',
                              e.target.value,
                            )
                          }
                          disabled={!editMode.personal}
                          placeholder="Enter Relation"
                        />
                      </CCol>
                      <CCol md={4}>
                        <CFormLabel>Emergency Contact 1 - Phone</CFormLabel>
                        <CFormInput
                          value={formData.personal?.emergencyContact1Phone || ''}
                          onChange={(e) =>
                            handleInputChange('personal', 'emergencyContact1Phone', e.target.value)
                          }
                          disabled={!editMode.personal}
                          placeholder="Enter Phone Number"
                        />
                      </CCol>
                    </CRow>

                    <CRow className="mt-3">
                      <CCol md={4}>
                        <CFormLabel>Emergency Contact 2 - Name</CFormLabel>
                        <CFormInput
                          value={formData.personal?.emergencyContact2Name || ''}
                          onChange={(e) =>
                            handleInputChange('personal', 'emergencyContact2Name', e.target.value)
                          }
                          disabled={!editMode.personal}
                          placeholder="Enter Name"
                        />
                      </CCol>
                      <CCol md={4}>
                        <CFormLabel>Emergency Contact 2 - Relation</CFormLabel>
                        <CFormInput
                          value={formData.personal?.emergencyContact2Relation || ''}
                          onChange={(e) =>
                            handleInputChange(
                              'personal',
                              'emergencyContact2Relation',
                              e.target.value,
                            )
                          }
                          disabled={!editMode.personal}
                          placeholder="Enter Relation"
                        />
                      </CCol>
                      <CCol md={4}>
                        <CFormLabel>Emergency Contact 2 - Phone</CFormLabel>
                        <CFormInput
                          value={formData.personal?.emergencyContact2Phone || ''}
                          onChange={(e) =>
                            handleInputChange('personal', 'emergencyContact2Phone', e.target.value)
                          }
                          disabled={!editMode.personal}
                          placeholder="Enter Phone Number"
                        />
                      </CCol>
                    </CRow>

                    <CRow className="mt-3">
                      <CCol md={4}>
                        <CFormLabel>Emergency Contact 3 - Name</CFormLabel>
                        <CFormInput
                          value={formData.personal?.emergencyContact3Name || ''}
                          onChange={(e) =>
                            handleInputChange('personal', 'emergencyContact3Name', e.target.value)
                          }
                          disabled={!editMode.personal}
                          placeholder="Enter Name"
                        />
                      </CCol>
                      <CCol md={4}>
                        <CFormLabel>Emergency Contact 3 - Relation</CFormLabel>
                        <CFormInput
                          value={formData.personal?.emergencyContact3Relation || ''}
                          onChange={(e) =>
                            handleInputChange(
                              'personal',
                              'emergencyContact3Relation',
                              e.target.value,
                            )
                          }
                          disabled={!editMode.personal}
                          placeholder="Enter Relation"
                        />
                      </CCol>
                      <CCol md={4}>
                        <CFormLabel>Emergency Contact 3 - Phone</CFormLabel>
                        <CFormInput
                          value={formData.personal?.emergencyContact3Phone || ''}
                          onChange={(e) =>
                            handleInputChange('personal', 'emergencyContact3Phone', e.target.value)
                          }
                          disabled={!editMode.personal}
                          placeholder="Enter Phone Number"
                        />
                      </CCol>
                    </CRow>

                    {editMode.personal && (
                      <CRow className="mt-3">
                        <CCol xs={12} className="d-flex justify-content-end">
                          <CButton
                            color="success"
                            className="me-2"
                            onClick={() => handleSave('personal')}
                          >
                            <CIcon icon={cilSave} className="me-1" />
                            Save
                          </CButton>
                          <CButton color="secondary" onClick={() => handleCancel('personal')}>
                            <CIcon icon={cilX} className="me-1" />
                            Cancel
                          </CButton>
                        </CCol>
                      </CRow>
                    )}
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>

            {/* Employment Information */}
            <CRow className="mb-4">
              <CCol xs={12}>
                <CCard>
                  <CCardHeader className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <CIcon icon={cilBriefcase} className="me-2" />
                      <h5 className="mb-0">Employment Information</h5>
                    </div>
                    {canEditSection('employment') && (
                      <CButton
                        color="primary"
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditToggle('employment')}
                      >
                        <CIcon icon={cilPencil} className="me-1" />
                        {editMode.employment ? 'Cancel' : 'Edit'}
                      </CButton>
                    )}
                    {!canEdit && !canEditSection('employment') && (
                      <CButton
                        color="secondary"
                        variant="outline"
                        size="sm"
                        disabled
                        title="Only HR and Admin can edit this section"
                      >
                        <CIcon icon={cilPencil} className="me-1" />
                        Edit (Restricted)
                      </CButton>
                    )}
                  </CCardHeader>
                  <CCardBody>
                    <CRow>
                      <CCol md={6}>
                        <CFormLabel>Department</CFormLabel>
                        <CFormSelect
                          value={formData.employment?.department || ''}
                          onChange={(e) =>
                            handleInputChange('employment', 'department', e.target.value)
                          }
                          disabled={!editMode.employment}
                        >
                          <option value="">Select Department</option>
                          <option value="it">IT</option>
                          <option value="hr">HR</option>
                          <option value="finance">Finance</option>
                          <option value="marketing">Marketing</option>
                          <option value="operations">Operations</option>
                        </CFormSelect>
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>Designation</CFormLabel>
                        <CFormInput
                          value={formData.employment?.designation || ''}
                          onChange={(e) =>
                            handleInputChange('employment', 'designation', e.target.value)
                          }
                          disabled={!editMode.employment}
                          placeholder="Enter Designation"
                        />
                      </CCol>
                    </CRow>
                    <CRow className="mt-3">
                      <CCol md={6}>
                        <CFormLabel>Joining Date</CFormLabel>
                        <CFormInput
                          type="date"
                          value={formData.employment?.joiningDate || ''}
                          onChange={(e) =>
                            handleInputChange('employment', 'joiningDate', e.target.value)
                          }
                          disabled={!editMode.employment}
                        />
                      </CCol>

                      <CCol md={6}>
                        <CFormLabel>Basic Per Month</CFormLabel>
                        <CInputGroup>
                          <CInputGroupText>₹</CInputGroupText>
                          <CFormInput
                            type="number"
                            value={formData.employment?.basicPerMonth || ''}
                            onChange={(e) =>
                              handleInputChange('employment', 'basicPerMonth', e.target.value)
                            }
                            disabled={!editMode.employment}
                            placeholder="Enter Basic Per Month"
                          />
                        </CInputGroup>
                      </CCol>
                      {/* <CCol md={6}>
                        <CFormLabel>Employee Type</CFormLabel>
                        <CFormSelect
                          value={formData.employment?.employeeType || ''}
                          onChange={(e) =>
                            handleInputChange('employment', 'employeeType', e.target.value)
                          }
                          disabled={!editMode.employment}
                        >
                          <option value="">Select Employee Type</option>
                          <option value="full-time">Full Time</option>
                          <option value="part-time">Part Time</option>
                          <option value="contract">Contract</option>
                          <option value="intern">Intern</option>
                        </CFormSelect>
                      </CCol> */}
                    </CRow>

                    {/* Additional Employment Fields */}
                    <CRow className="mt-3">
                      <CCol md={6}>
                        <CFormLabel>Status</CFormLabel>
                        <CFormSelect
                          value={formData.employment?.status || ''}
                          onChange={(e) =>
                            handleInputChange('employment', 'status', e.target.value)
                          }
                          disabled={!editMode.employment}
                        >
                          <option value="">Select Status</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="terminated">Terminated</option>
                        </CFormSelect>
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>Company Name</CFormLabel>
                        <CFormSelect
                          value={formData.employment?.companyName || ''}
                          onChange={(e) =>
                            handleInputChange('employment', 'companyName', e.target.value)
                          }
                          disabled={!editMode.employment}
                        >
                          <option value="">Select Company</option>
                          <option value="RA">RA</option>
                          <option value="GA">GA</option>
                          <option value="SS">SS</option>
                          <option value="VL">VL</option>
                        </CFormSelect>
                      </CCol>
                    </CRow>

                    <CRow className="mt-3">
                      <CCol md={6}>
                        <CFormCheck
                          type="checkbox"
                          id="core"
                          label="Core Employee"
                          checked={formData.employment?.core || false}
                          onChange={(e) =>
                            handleInputChange('employment', 'core', e.target.checked)
                          }
                          disabled={!editMode.employment}
                        />
                      </CCol>
                    </CRow>

                    {/* Additional Employment Fields */}
                    <CRow className="mt-3">
                      <CCol md={6}>
                        <CFormLabel>Work Type</CFormLabel>
                        <CFormSelect
                          value={formData.employment?.workType || ''}
                          onChange={(e) =>
                            handleInputChange('employment', 'workType', e.target.value)
                          }
                          disabled={!editMode.employment}
                        >
                          <option value="">Select Work Type</option>
                          <option value="full-time">Full Time</option>
                          <option value="part-time">Part Time</option>
                          <option value="contract">Contract</option>
                          <option value="intern">Intern</option>
                        </CFormSelect>
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>Shift</CFormLabel>
                        <CFormSelect
                          value={formData.employment?.shift || ''}
                          onChange={(e) => handleInputChange('employment', 'shift', e.target.value)}
                          disabled={!editMode.employment}
                        >
                          <option value="">Select Shift</option>
                          <option value="day">Day</option>
                          <option value="night">Night</option>
                          <option value="evening">Evening</option>
                          <option value="rotating">Rotating</option>
                        </CFormSelect>
                      </CCol>
                    </CRow>

                    <CRow className="mt-3">
                      <CCol md={6}>
                        <CFormLabel>Work Location</CFormLabel>
                        <CFormInput
                          value={formData.employment?.location || ''}
                          onChange={(e) =>
                            handleInputChange('employment', 'location', e.target.value)
                          }
                          disabled={!editMode.employment}
                          placeholder="Enter Work Location"
                        />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>Onboarding Date</CFormLabel>
                        <CFormInput
                          type="date"
                          value={formData.employment?.onboardingDate || ''}
                          onChange={(e) =>
                            handleInputChange('employment', 'onboardingDate', e.target.value)
                          }
                          disabled={!editMode.employment}
                        />
                      </CCol>
                    </CRow>
                    <CRow className="mt-3">
                      <CCol md={6}>
                        <CFormLabel>RA Location</CFormLabel>
                        <CFormSelect
                          value={formData?.employment?.raLocation || ''}
                          onChange={(e) =>
                            handleInputChange('employment', 'raLocation', e.target.value)
                          }
                          disabled={!editMode?.employment}
                        >
                          <option value="">Select RA Location</option>
                          {locations.map((location) => (
                            <option key={location.id} value={location.name}>
                              {location.name}
                            </option>
                          ))}
                        </CFormSelect>
                      </CCol>
                    </CRow>

                    <CRow className="mt-3">
                      <CCol md={6}>
                        <CFormLabel>Reporting Manager</CFormLabel>
                        <CFormInput
                          value={formData.employment?.reportingManager || ''}
                          onChange={(e) =>
                            handleInputChange('employment', 'reportingManager', e.target.value)
                          }
                          disabled={!editMode.employment}
                          placeholder="Enter Reporting Manager ID"
                        />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>Employee Type</CFormLabel>
                        <CFormSelect
                          value={formData.employment?.employeeType || ''}
                          onChange={(e) =>
                            handleInputChange('employment', 'employeeType', e.target.value)
                          }
                          disabled={!editMode.employment}
                        >
                          <option value="">Select Employee Type</option>
                          <option value="permanent">Permanent</option>
                          <option value="contract">Contract</option>
                          <option value="temporary">Temporary</option>
                          <option value="intern">Intern</option>
                          <option value="consultant">Consultant</option>
                        </CFormSelect>
                      </CCol>
                    </CRow>

                    {/* Salary Information */}
                    <CRow className="mt-3">
                      <CCol xs={12}>
                        <h6 className="text-muted mb-3">Salary Information</h6>
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>CTC Per Month</CFormLabel>
                        <CInputGroup>
                          <CInputGroupText>₹</CInputGroupText>
                          <CFormInput
                            type="number"
                            value={formData.employment?.ctcPerMonth || ''}
                            onChange={(e) =>
                              handleInputChange('employment', 'ctcPerMonth', e.target.value)
                            }
                            disabled={!editMode.employment}
                            placeholder="Enter CTC Per Month"
                          />
                        </CInputGroup>
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>CTC Per Month (In Words)</CFormLabel>
                        <CFormInput
                          value={formData.employment?.ctcPerMonthInWords || ''}
                          onChange={(e) =>
                            handleInputChange('employment', 'ctcPerMonthInWords', e.target.value)
                          }
                          disabled={!editMode.employment}
                          placeholder="Enter CTC in words"
                        />
                      </CCol>
                    </CRow>

                    <CRow className="mt-3">
                      <CCol md={6}>
                        <CFormLabel>HRA Per Month</CFormLabel>
                        <CInputGroup>
                          <CInputGroupText>₹</CInputGroupText>
                          <CFormInput
                            type="number"
                            value={formData.employment?.hraPerMonth || ''}
                            onChange={(e) =>
                              handleInputChange('employment', 'hraPerMonth', e.target.value)
                            }
                            disabled={!editMode.employment}
                            placeholder="Enter HRA Per Month"
                          />
                        </CInputGroup>
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>HRA (In Words)</CFormLabel>
                        <CFormInput
                          value={formData.employment?.hraInWords || ''}
                          onChange={(e) =>
                            handleInputChange('employment', 'hraInWords', e.target.value)
                          }
                          disabled={!editMode.employment}
                          placeholder="Enter HRA in words"
                        />
                      </CCol>
                    </CRow>

                    {editMode.employment && (
                      <CRow className="mt-3">
                        <CCol xs={12} className="d-flex justify-content-end">
                          <CButton
                            color="success"
                            className="me-2"
                            onClick={() => handleSave('employment')}
                          >
                            <CIcon icon={cilSave} className="me-1" />
                            Save
                          </CButton>
                          <CButton color="secondary" onClick={() => handleCancel('employment')}>
                            <CIcon icon={cilX} className="me-1" />
                            Cancel
                          </CButton>
                        </CCol>
                      </CRow>
                    )}
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>

            {/* Bank Details */}
            <CRow className="mb-4">
              <CCol xs={12}>
                <CCard>
                  <CCardHeader className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <CIcon icon={cilCreditCard} className="me-2" />
                      <h5 className="mb-0">Bank Details</h5>
                    </div>
                    {canEditSection('bank') && (
                      <CButton
                        color="primary"
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditToggle('bank')}
                      >
                        <CIcon icon={cilPencil} className="me-1" />
                        {editMode.bank ? 'Cancel' : 'Edit'}
                      </CButton>
                    )}
                    {!canEdit && !canEditSection('bank') && (
                      <CButton
                        color="secondary"
                        variant="outline"
                        size="sm"
                        disabled
                        title={
                          hasUserEditedSection('bank')
                            ? 'You have already edited Bank Details once'
                            : 'Only HR and Admin can edit this section'
                        }
                      >
                        <CIcon icon={cilPencil} className="me-1" />
                        Edit (Restricted)
                      </CButton>
                    )}
                  </CCardHeader>
                  <CCardBody>
                    <CRow>
                      <CCol md={6}>
                        <CFormLabel>Bank Name</CFormLabel>
                        <CFormInput
                          value={formData.bank?.bankName || ''}
                          onChange={(e) => handleInputChange('bank', 'bankName', e.target.value)}
                          disabled={!editMode.bank}
                          placeholder="Enter Bank Name"
                        />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>Account Number</CFormLabel>
                        <CFormInput
                          value={formData.bank?.accountNumber || ''}
                          onChange={(e) =>
                            handleInputChange('bank', 'accountNumber', e.target.value)
                          }
                          disabled={!editMode.bank}
                          placeholder="Enter Account Number"
                        />
                      </CCol>
                    </CRow>
                    <CRow className="mt-3">
                      <CCol md={6}>
                        <CFormLabel>IFSC Code</CFormLabel>
                        <CFormInput
                          value={formData.bank?.ifscCode || ''}
                          onChange={(e) => handleInputChange('bank', 'ifscCode', e.target.value)}
                          disabled={!editMode.bank}
                          placeholder="Enter IFSC Code"
                        />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>Branch Name</CFormLabel>
                        <CFormInput
                          value={formData.bank?.branchName || ''}
                          onChange={(e) => handleInputChange('bank', 'branchName', e.target.value)}
                          disabled={!editMode.bank}
                          placeholder="Enter Branch Name"
                        />
                      </CCol>
                    </CRow>
                    {editMode.bank && (
                      <CRow className="mt-3">
                        <CCol xs={12} className="d-flex justify-content-end">
                          <CButton
                            color="success"
                            className="me-2"
                            onClick={() => handleSave('bank')}
                          >
                            <CIcon icon={cilSave} className="me-1" />
                            Save
                          </CButton>
                          <CButton color="secondary" onClick={() => handleCancel('bank')}>
                            <CIcon icon={cilX} className="me-1" />
                            Cancel
                          </CButton>
                        </CCol>
                      </CRow>
                    )}
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>

            {/* Attachments Section */}
            <CRow className="mb-4">
              <CCol xs={12}>
                <CCard>
                  <CCardHeader className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <CIcon icon={cilFile} className="me-2" />
                      <h5 className="mb-0">Documents & Attachments</h5>
                    </div>
                    {canEditSection('attachments') && (
                      <CButton
                        color="primary"
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditToggle('attachments')}
                      >
                        <CIcon icon={cilPencil} className="me-1" />
                        {editMode.attachments ? 'Cancel' : 'Edit'}
                      </CButton>
                    )}
                    {!canEdit && !canEditSection('attachments') && (
                      <CButton
                        color="secondary"
                        variant="outline"
                        size="sm"
                        disabled
                        title="Only HR and Admin can edit this section"
                      >
                        <CIcon icon={cilPencil} className="me-1" />
                        Edit (Restricted)
                      </CButton>
                    )}
                  </CCardHeader>
                  <CCardBody>
                    <CRow>
                      <CCol md={6}>
                        <div className="mb-3">
                          {editMode.attachments ? (
                            <CFormInput
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => handleAttachmentUpload('resume', e)}
                              className="mt-1"
                            />
                          ) : (
                            <div className="mt-2">
                              {attachments.resume ? (
                                <div className="d-flex align-items-center">
                                  <CIcon icon={cilFile} className="text-success me-2" />
                                  <span className="text-success">{attachments.resume.name}</span>
                                  <CButton
                                    color="link"
                                    size="sm"
                                    className="ms-auto"
                                    onClick={() =>
                                      window.open(URL.createObjectURL(attachments.resume))
                                    }
                                  >
                                    <CIcon icon={cilCloudDownload} />
                                  </CButton>
                                </div>
                              ) : (
                                <span className="text-muted">No file uploaded</span>
                              )}
                            </div>
                          )}
                        </div>
                      </CCol>
                    </CRow>

                    {editMode.attachments && (
                      <CRow className="mt-3">
                        <CCol xs={12} className="d-flex justify-content-end">
                          <CButton
                            color="success"
                            className="me-2"
                            onClick={() => handleSave('attachments')}
                          >
                            <CIcon icon={cilSave} className="me-1" />
                            Save Attachments
                          </CButton>
                          <CButton color="secondary" onClick={() => handleCancel('attachments')}>
                            <CIcon icon={cilX} className="me-1" />
                            Cancel
                          </CButton>
                        </CCol>
                      </CRow>
                    )}
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
          </div>
        </div>
      </div>

      <CModal
        alignment="center"
        visible={myAuthorityModalVisible}
        onClose={() => setMyAuthorityModalVisible(false)}
        size="lg"
        scrollable
      >
        <CModalHeader>
          <CModalTitle>Team / Authority</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {myAuthorityLoading ? (
            <div className="text-center p-4">
              <CSpinner />
            </div>
          ) : (
            <CRow className="g-3">
              <CCol md={6}>
                <div className="border rounded p-3 h-100">
                  <h6 className="mb-2">Reporting Manager of ({reportingManagerOf.length})</h6>
                  {reportingManagerOf.length === 0 ? (
                    <div className="text-muted small">No staff found.</div>
                  ) : (
                    <ul className="mb-0 ps-3">
                      {reportingManagerOf.map((u) => (
                        <li key={u._id} className="small">
                          <strong>{u.name || '—'}</strong>
                          {u.email ? <span className="text-muted"> ({u.email})</span> : null}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </CCol>
              <CCol md={6}>
                <div className="border rounded p-3 h-100">
                  <h6 className="mb-2">Leave Authority of ({leaveAuthorityOf.length})</h6>
                  {leaveAuthorityOf.length === 0 ? (
                    <div className="text-muted small">No staff found.</div>
                  ) : (
                    <ul className="mb-0 ps-3">
                      {leaveAuthorityOf.map((u) => (
                        <li key={u._id} className="small">
                          <strong>{u.name || '—'}</strong>
                          {u.email ? <span className="text-muted"> ({u.email})</span> : null}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </CCol>
            </CRow>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setMyAuthorityModalVisible(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Professional CSS Styles */}
      <style jsx>{`
        .profile-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8f9fb 0%, #e9ecef 100%);
        }

        .profile-header {
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
          color: white;
          padding: 2rem 0;
          margin-bottom: 2rem;
        }

        .profile-title h1 {
          color: white;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .profile-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .profile-form {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }

        .form-section {
          border-bottom: 1px solid #e5e7eb;
          padding: 2rem;
        }

        .form-section:last-child {
          border-bottom: none;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #f1f5f9;
        }

        .section-title {
          display: flex;
          align-items: center;
        }

        .section-title h4 {
          margin: 0;
          color: #1e293b;
          font-weight: 600;
        }

        .section-content {
          padding: 0;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
          display: block;
        }

        .form-control {
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          padding: 12px 16px;
          font-size: 14px;
          transition: all 0.2s ease;
          background: #fafbfc;
        }

        .form-control:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
          background: white;
        }

        .form-control:disabled {
          background: #f8f9fa;
          color: #6c757d;
          cursor: not-allowed;
        }

        .btn-outline-primary {
          border-color: #2563eb;
          color: #2563eb;
        }

        .btn-outline-primary:hover {
          background-color: #2563eb;
          border-color: #2563eb;
        }

        .alert {
          border-radius: 12px;
          border: none;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .badge {
          font-size: 0.75rem;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
        }

        @media (max-width: 768px) {
          .profile-header {
            padding: 1.5rem 0;
          }

          .profile-actions {
            flex-direction: column;
            gap: 0.5rem;
            margin-top: 1rem;
          }

          .form-section {
            padding: 1.5rem;
          }

          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  )
}

export default HRMSProfile
