import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import Cookies from 'js-cookie'
import DocumentUpload from 'src/components/EmployeeProfile/DocumentUpload'
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

import AppFormSelect from 'src/components/form/AppFormSelect'
import AppContentSkeleton from 'src/components/custom/AppContentSkeleton'
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
  cilInfo,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import BasicProvider from 'src/constants/BasicProvider'
import { fetchCompanies } from 'src/helpers/companyHelper'
import moment from 'moment'
import { useEmployeeData } from 'src/components/EmployeeProfile/hooks/useEmployeeData'
import { isAdminActiveForDropdown, formatAdminRoleLabel } from 'src/constants/hrmsConstants'
import { toast } from 'react-toastify'

// Function to convert number to words
const convertNumberToWords = (num) => {
  if (!num || isNaN(num) || num === '') return ''

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

  if (number < 10) return ones[number]
  if (number < 20) return teens[number - 10]
  if (number < 100)
    return tens[Math.floor(number / 10)] + (number % 10 ? ' ' + ones[number % 10] : '')
  if (number < 1000)
    return (
      ones[Math.floor(number / 100)] +
      ' Hundred' +
      (number % 100 ? ' ' + convertNumberToWords(number % 100) : '')
    )
  if (number < 100000)
    return (
      convertNumberToWords(Math.floor(number / 1000)) +
      ' Thousand' +
      (number % 1000 ? ' ' + convertNumberToWords(number % 1000) : '')
    )
  if (number < 10000000)
    return (
      convertNumberToWords(Math.floor(number / 100000)) +
      ' Lakh' +
      (number % 100000 ? ' ' + convertNumberToWords(number % 100000) : '')
    )
  return (
    convertNumberToWords(Math.floor(number / 10000000)) +
    ' Crore' +
    (number % 10000000 ? ' ' + convertNumberToWords(number % 10000000) : '')
  )
}

const looksLikeMongoObjectId = (s) =>
  typeof s === 'string' && /^[a-f0-9]{24}$/i.test(String(s).trim())

/** First non-empty scalar (shared with employment + authority helpers). */
const pickFirstNonEmpty = (...vals) => {
  for (const v of vals) {
    if (v !== undefined && v !== null && String(v).trim() !== '') return v
  }
  return ''
}

/** Match useEmployeeData.resolveManagerValue — prefer ID for ObjectId strings. */
const resolveReportingManagerFromProfile = (profile) => {
  const idFirst = pickFirstNonEmpty(profile.reporting_manager_id, profile.reportingManagerId)
  const raw = pickFirstNonEmpty(
    profile.reporting_manager,
    profile.reportingManager,
    idFirst,
  )

  if (!raw) return { id: '', name: '' }

  if (typeof raw === 'string') {
    return looksLikeMongoObjectId(raw)
      ? { id: raw.trim(), name: '' }
      : { id: '', name: raw }
  }

  if (typeof raw === 'object') {
    const id = raw._id || raw.id || raw.value || ''
    const name =
      raw.name || raw.label || raw.display_name || raw.full_name || ''
    return { id: String(id || ''), name }
  }

  return { id: String(raw), name: '' }
}

const MyProfile = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const admin = useSelector((state) => state.userData)
  const { signedUrls, urlLoading, fetchSignedUrl } = useEmployeeData()
  const [templates, setTemplates] = useState([])
  // Profile component for current user's profile management
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [myAuthorityModalVisible, setMyAuthorityModalVisible] = useState(false)
  const [myAuthorityLoading, setMyAuthorityLoading] = useState(false)
  const [reportingManagerOf, setReportingManagerOf] = useState([])
  const [leaveAuthorityOf, setLeaveAuthorityOf] = useState([])
  const [editMode, setEditMode] = useState({
    bank: false,
    attachments: false,
  })
  const [formData, setFormData] = useState({
    bank: {
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      branchName: '',
    },
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

  // Add state for managers list
  const [managers, setManagers] = useState([])
  /** O(1) lookup for id → option (avoids repeated .find on effects). */
  const managersById = useMemo(() => new Map(managers.map((m) => [m.value, m])), [managers])

  const mergeEmploymentPatch = useCallback((patch) => {
    if (!patch || !Object.keys(patch).length) return
    setFormData((prev) => ({
      ...prev,
      employment: { ...prev.employment, ...patch },
    }))
    setProfileData((prev) => ({
      ...prev,
      employment: { ...(prev?.employment || {}), ...patch },
    }))
  }, [])

  const [locations, setLocations] = useState([])
  const [groups, setGroups] = useState([])

  // Add state for companies list
  const [companies, setCompanies] = useState([])

  // Add state for mutual admins and all roles
  const [mutualAdmins, setMutualAdmins] = useState([])
  const [allRoles, setAllRoles] = useState([])
  const [roleOptions, setRoleOptions] = useState([])

  const [attachments, setAttachments] = useState({
    resume: null,
    idProof: null,
    certificates: null,
    experienceLetter: null,
    salarySlip: null,
    otherDocuments: null,
  })
  const [editAttempts, setEditAttempts] = useState(() => {
    // Load from localStorage or initialize as false
    const userId = admin?._id || 'default'
    const savedAttempts = localStorage.getItem(`editAttempts_${userId}`)
    if (savedAttempts) {
      try {
        return JSON.parse(savedAttempts)
      } catch (e) {
        console.error('Error parsing editAttempts from localStorage:', e)
      }
    }
    return {
      bank: false,
      attachments: false,
    }
  })

  // Profile picture state
  const [profilePicture, setProfilePicture] = useState(null)
  const [uploadingPicture, setUploadingPicture] = useState(false)

  const hasFE = allRoles.some((r) => {
    const role = r
    console.log('Checking FE Role:', r, 'Normalized:', role)
    return role === 'Field Engineer (FE)' || role === 'field engineer'
  })

  const hasBM = allRoles.some((r) => {
    const role = r
    return role === 'RA Branch BM' || role === 'ra branch bm'
  })

  const hasSDM = allRoles.some((r) => {
    const role = typeof r === 'string' ? r.toLowerCase() : ''
    return role.includes('sdm') || role === process.env.REACT_APP_SDM?.toLowerCase()
  })
  // Update editAttempts when admin data changes
  useEffect(() => {
    if (admin?._id) {
      const userId = admin._id
      const savedAttempts = localStorage.getItem(`editAttempts_${userId}`)
      if (savedAttempts) {
        try {
          const parsedAttempts = JSON.parse(savedAttempts)
          setEditAttempts(parsedAttempts)
        } catch (e) {
          console.error('Error parsing editAttempts from localStorage:', e)
        }
      }
    }
  }, [admin?._id])

  const fetchTemplates = async () => {
    try {
      const res = await new BasicProvider('holiday-templates').getRequest()
      setTemplates(res.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  // Fetch dynamic data
  const fetchLocations = async () => {
    try {
      const response = await new BasicProvider('ra_branch?count=100').getRequest()
      if (response?.data?.data && Array.isArray(response.data.data)) {
        const locationOptions = response.data.data
          .map((location) => ({
            value: location?._id || '',
            label: location?.name || '',
          }))
          .filter((option) => option.value && option.label)
        setLocations([{ value: '', label: 'Select Location' }, ...locationOptions])
      } else {
        throw new Error('Invalid response structure')
      }
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
  const fetchGroups = async () => {
    try {
      const response = await new BasicProvider('cms/categories/tree/group').getRequest()
      const groupOptions = response.data.data.map((group) => ({
        value: group._id,
        label: group.name,
        id: group._id,
        name: group.name,
      }))
      setGroups([{ value: '', label: 'Select Group' }, ...groupOptions])
    } catch (error) {
      console.error('Error fetching groups:', error)
      // Fallback groups
      const fallbackGroups = [
        { value: '', label: 'Select Group' },
        { value: 'group1', label: 'Group 1' },
        { value: 'group2', label: 'Group 2' },
        { value: 'group3', label: 'Group 3' },
      ]
      setGroups(fallbackGroups)
    }
  }

  const canEditSection = (section, profileData, currentUser) => {
    if (!profileData || !currentUser) return false
    console.log('Checking edit permission for section:', currentUser._id)
    // "69401ae8db144b910097d8e4"
    console.log('EDIT ATTEMPTS', editAttempts)

    const isOwnProfile =
      // profileData.userId === currentUser._id ||
      profileData._id === currentUser._id ||
      profileData.user?._id === currentUser._id ||
      profileData.user?.id === currentUser._id

    // Regular users can only edit their own profile
    if (isOwnProfile) {
      // For attachments - staff can edit multiple times
      if (section === 'attachments') {
        return true // Allow multiple edits for attachments
      }
      // For bank - staff can only edit once
      if (section === 'bank') {
        return !editAttempts[section] // Only allowed once
      }
      // For profile section - allow regular users to edit their own profile
      if (section === 'profile') {
        return true
      }
      // For other sections - not allowed for regular users
      return false
    }

    // Regular users cannot edit other profiles
    return false
  }

  // Check if user can edit bank details (for staff - only once)
  const canEditBank = (editAttempts) => {
    const isOwnProfile =
      profileData?._id === admin?._id ||
      profileData?.user?._id === admin?._id ||
      profileData?.user?.id === admin?._id

    if (isOwnProfile) {
      // Staff can edit their own bank details only once
      return !editAttempts?.bank
    }
    return false
  }

  // Check if user can edit attachments (for staff - multiple times allowed)
  const canEditAttachments = (editAttempts) => {
    const isOwnProfile =
      profileData?._id === admin?._id ||
      profileData?.user?._id === admin?._id ||
      profileData?.user?.id === admin?._id

    if (isOwnProfile) {
      // Staff can edit their own attachments multiple times
      return true
    }
    return false
  }

  // Helper function to check if user has already edited a section
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
  const userId = Cookies.get('primery_user_id')
  let FE = 'Field Engineer (FE)'
  let role = formData?.profile?.role
  let RA = 'RA Branch BM'

  const normalizeId = (v) => {
    if (!v) return ''
    if (typeof v === 'string') return v
    if (typeof v === 'object') return v?._id || v?.id || ''
    return ''
  }

  const buildUserRef = (staff) => {
    const profile = staff?.profile || {}
    const staffId = normalizeId(staff?._id)
    const name = pickFirstNonEmpty(profile?.name, staff?.name)
    const email = pickFirstNonEmpty(profile?.email, staff?.email)
    return { _id: staffId, name, email }
  }

  const fetchMyAuthorityLists = async () => {
    if (!userId) return
    setMyAuthorityLoading(true)
    try {
      const res = await new BasicProvider('admins?page=1&count=5000', dispatch).getRequest()
      const staffList = res?.data?.data || []

      const empId = String(userId)
      const rmList = []
      const laList = []

      staffList.forEach((staff) => {
        const profile = staff?.profile || {}

        const rmId = normalizeId(
          pickFirstNonEmpty(
            profile?.reporting_manager_id,
            profile?.reportingManagerId,
            staff?.reporting_manager_id,
            staff?.reportingManagerId,
          ),
        )

        const la1 = normalizeId(
          pickFirstNonEmpty(
            profile?.leaveAuthorityOne,
            profile?.leave_authority_one,
            profile?.leave_authority_1,
            staff?.leaveAuthorityOne,
            staff?.leave_authority_one,
            staff?.leave_authority_1,
          ),
        )
        const la2 = normalizeId(
          pickFirstNonEmpty(
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
      toast.error('Failed to load authority list')
      setReportingManagerOf([])
      setLeaveAuthorityOf([])
    } finally {
      setMyAuthorityLoading(false)
    }
  }

  // Fetch mutual admins to get all roles
  const fetchMutualAdmins = async (employeeId) => {
    if (!employeeId) return

    try {
      const response = await new BasicProvider('admins/get-mutual', dispatch).postRequest({
        id: employeeId,
      })

      setMutualAdmins(response?.data || [])
    } catch (error) {
      console.error('Error fetching mutual admins:', error)
      setMutualAdmins([])
    }
  }

  // Fetch all roles options
  const fetchRoleOptions = async () => {
    try {
      const response = await new BasicProvider('roles?page=1&count=100').getRequest()
      if (response?.data?.data && Array.isArray(response.data.data)) {
        const options = response.data.data.map((role) => ({
          value: role?._id || '',
          label: role?.display_name || '',
          slug: role?.name || '',
        }))
        setRoleOptions(options)
      }
    } catch (error) {
      console.error('Error fetching roles:', error)
    }
  }

  // Combine profile roles + mutual roles
  useEffect(() => {
    if (!formData?.profile?._id && !formData?._id) return

    // Get profile roles - handle all possible formats
    let profileRoleIds = []
    let profileRoleObjects = [] // Store role objects for label mapping

    const profileRole = formData?.profile?.role

    if (Array.isArray(profileRole)) {
      // If it's an array
      profileRole.forEach((r) => {
        if (typeof r === 'object' && r !== null) {
          if (r._id) {
            profileRoleIds.push(r._id)
            profileRoleObjects.push(r)
          } else if (r.id) {
            profileRoleIds.push(r.id)
            profileRoleObjects.push(r)
          }
        } else if (typeof r === 'string' && r.trim()) {
          profileRoleIds.push(r.trim())
        }
      })
    } else if (profileRole) {
      // If it's a single value
      if (typeof profileRole === 'object' && profileRole !== null) {
        if (profileRole._id) {
          profileRoleIds.push(profileRole._id)
          profileRoleObjects.push(profileRole)
        } else if (profileRole.id) {
          profileRoleIds.push(profileRole.id)
          profileRoleObjects.push(profileRole)
        }
      } else if (typeof profileRole === 'string' && profileRole.trim()) {
        profileRoleIds.push(profileRole.trim())
      }
    }

    // Get mutual roles
    const mutualRoleIds = []
    const mutualRoleObjects = []

    if (Array.isArray(mutualAdmins) && mutualAdmins.length > 0) {
      mutualAdmins.forEach((admin) => {
        if (admin && Array.isArray(admin.role)) {
          admin.role.forEach((r) => {
            if (typeof r === 'object' && r !== null) {
              if (r._id) {
                mutualRoleIds.push(r._id)
                mutualRoleObjects.push(r)
              } else if (r.id) {
                mutualRoleIds.push(r.id)
                mutualRoleObjects.push(r)
              }
            } else if (typeof r === 'string' && r.trim()) {
              mutualRoleIds.push(r.trim())
            }
          })
        }
      })
    }

    // Combine all role IDs (remove duplicates)
    const allRoleIds = Array.from(new Set([...profileRoleIds, ...mutualRoleIds]))

    // Map role IDs to role labels - check all sources
    const rolesWithLabels = allRoleIds
      .map((id) => {
        // First check in roleOptions (from API)
        const roleOption = roleOptions.find((o) => {
          return o.value === id || String(o.value) === String(id)
        })
        if (roleOption && roleOption.label) {
          return roleOption.label
        }

        // Check in profile role objects
        const profileRole = profileRoleObjects.find((r) => {
          const roleId = r._id || r.id
          return roleId === id || String(roleId) === String(id)
        })
        if (profileRole) {
          const label = profileRole.display_name || profileRole.name || profileRole.label
          if (label) return label
        }

        // Check in mutual role objects
        const mutualRole = mutualRoleObjects.find((r) => {
          const roleId = r._id || r.id
          return roleId === id || String(roleId) === String(id)
        })
        if (mutualRole) {
          const label = mutualRole.display_name || mutualRole.name || mutualRole.label
          if (label) return label
        }

        // If still not found, return null (will be filtered out)
        return null
      })
      .filter(Boolean)

    // Remove duplicates from labels and set
    const uniqueRoles = Array.from(new Set(rolesWithLabels))
    console.log('📋 Role Combination:', {
      profileRoleIds,
      mutualRoleIds,
      allRoleIds,
      rolesWithLabels,
      uniqueRoles,
      profileRoleObjects: profileRoleObjects.length,
      mutualRoleObjects: mutualRoleObjects.length,
    })
    setAllRoles(uniqueRoles)
  }, [formData, mutualAdmins, roleOptions])

  // Fetch mutual admins when profile data is loaded
  useEffect(() => {
    const employeeId = formData?.profile?._id || formData?._id || admin?._id
    if (employeeId) {
      fetchMutualAdmins(employeeId)
    }
  }, [formData?.profile?._id, formData?._id, admin?._id])

  // Fetch role options on mount
  useEffect(() => {
    fetchRoleOptions()
  }, [])

  // Same source as Employee Profile: full staff list so reporting manager / leave
  // authorities can be resolved by id (get-multiple was role-filtered and missed many users).
  const fetchManagers = async () => {
    try {
      const response = await new BasicProvider('admins?page=1&count=1000', dispatch).getRequest()
      const staff = response.data?.data || []
      const activeStaff = staff.filter((row) => isAdminActiveForDropdown(row))
      const managerOptions = activeStaff.map((manager) => ({
        value: manager?._id || '',
        label: (manager?.name || '').trim(),
        role: formatAdminRoleLabel(manager?.role) || formatAdminRoleLabel(manager?.user?.role),
      }))
      setManagers(managerOptions.filter((option) => option.value && option.label))
    } catch (error) {
      console.error('Error fetching managers:', error)
      setManagers([])
    }
  }

  // Fetch companies list
  const fetchCompanies = async () => {
    try {
      const response = await new BasicProvider('companies?page=1&count=100').getRequest()

      if (
        response?.status === 'success' &&
        response.data?.data &&
        Array.isArray(response.data.data)
      ) {
        const companyOptions = response.data.data
          .map((company) => ({
            value: company?.display_name || '',
            label: company?.display_name || '',
            id: company?._id || '',
            name: company?.name || '',
          }))
          .filter((option) => option.value && option.label)
        setCompanies([{ value: '', label: 'Select Company' }, ...companyOptions])
      } else {
        throw new Error('Invalid response structure')
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
      // Fallback to static data if API fails
      const fallbackCompanies = [
        { value: '', label: 'Select Company' }, 
        { value: 'MA', label: 'Madhukar Associates', id: 'MA' },
      ]
      setCompanies(fallbackCompanies)
    }
  }

  const resolveReportingManagerName = useCallback(
    (managerId) => {
      if (!managerId || managersById.size === 0) return
      const manager = managersById.get(managerId)
      if (!manager) return
      const managerName = `${manager.label}${manager.role ? ` (${manager.role})` : ''}`
      mergeEmploymentPatch({ reportingManagerName: managerName })
    },
    [managersById, mergeEmploymentPatch],
  )

  const resolveCompanyName = (companyCode) => {
    if (!companyCode || companies.length === 0) return
    const company = companies.find((c) => c.value === companyCode)
    if (!company) return
    mergeEmploymentPatch({ companyName: company.label })
  }

  // Fetch current user's profile data
  const fetchMyProfileData = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!admin || !admin._id) {
        setError('Please login to view your profile.')
        setLoading(false)
        return
      }

      // Try to fetch current user's profile
      let response
      try {
        // First try the profiles endpoint without ID (gets current user's profile)
        response = await new BasicProvider(`profiles`, dispatch).getRequest({
          withCredentials: true,
        })
      } catch (error) {
        // Fallback to profiles with current user ID
        try {
          response = await new BasicProvider(`profiles/${userId}`, dispatch).getRequest({
            withCredentials: true,
          })
        } catch (error2) {
          // Use current admin data as fallback
          response = {
            data: {
              _id: admin._id,
              name: admin.name || 'User',
              firstName: admin.firstName || admin.name?.split(' ')[0] || 'User',
              lastName: admin.lastName || admin.name?.split(' ').slice(1).join(' ') || '',
              email: admin.email || '',
              phone: admin.phone || admin.mobile || '',
              mobile: admin.mobile || admin.phone || '',
              gender: admin.gender || 'male',
              employee_id: admin.employeeId || admin.employee_id || 'EMP' + admin._id?.slice(-4),
              designation: admin.designation || 'Employee',
              department: admin.department || 'General',
              status: admin.status || 'active',
              joining_date:
                admin.joiningDate || admin.joining_date || new Date().toISOString().split('T')[0],
              basic_salary: admin.basicSalary || admin.basic_salary || 50000,
              ctc_per_month: admin.ctc || admin.ctc_per_month || 60000,
              bank_name: admin.bankName || admin.bank_name || '',
              account_number: admin.accountNumber || admin.account_number || '',
              ifsc_code: admin.ifscCode || admin.ifsc_code || '',
              branch_name: admin.branchName || admin.branch_name || '',
            },
          }
        }
      }

      if (response.data) {
        const userData = response.data

        // Profile document fields must win over populated `user` (same as useEmployeeData.normalizeEmployeeData)
        const actualUserData = {
          ...(userData.user || {}),
          ...userData,
        }

        const rmResolved = resolveReportingManagerFromProfile(actualUserData)
        const reportingManagerId = pickFirstNonEmpty(
          rmResolved.id,
          actualUserData.reporting_manager_id,
          actualUserData.reportingManagerId,
        )
        const reportingManagerNameSeed = pickFirstNonEmpty(
          actualUserData.reporting_manager_name,
          actualUserData.reportingManagerName,
          rmResolved.name,
        )

        const leaveAuthorityOne = pickFirstNonEmpty(
          actualUserData.leaveAuthorityOne,
          actualUserData.leave_authority_one,
          actualUserData.leave_authority_1,
        )
        const leaveAuthorityTwo = pickFirstNonEmpty(
          actualUserData.leaveAuthorityTwo,
          actualUserData.leave_authority_two,
          actualUserData.leave_authority_2,
        )
        const leaveAuthorityOne_Name = pickFirstNonEmpty(
          actualUserData.leaveAuthorityOne_Name,
          actualUserData.leave_authority_one_name,
        )
        const leaveAuthorityTwo_Name = pickFirstNonEmpty(
          actualUserData.leaveAuthorityTwo_Name,
          actualUserData.leave_authority_two_name,
        )

        const transformedData = {
          _id: actualUserData._id,
          userId: actualUserData._id, // Add userId field for current user
          profile: {
            employeeId: actualUserData.employee_id || '',
            name: actualUserData.name || '',
            role: Array.isArray(actualUserData.role)
              ? actualUserData.role // Keep as array for proper handling
              : actualUserData.role || actualUserData.user_role || '',
            status: actualUserData.status || actualUserData.user_status || '',
            mobile: actualUserData.mobile_primary || actualUserData.mobile || '',
            email: actualUserData.email || '',
            gender: actualUserData.gender || '',
            department: actualUserData.department || actualUserData.user_department || '',
            password:
              actualUserData.open_password ||
              actualUserData.password ||
              actualUserData.user_password ||
              '',
            _id: actualUserData._id || '',
          },
          general: {
            firstName: actualUserData.name?.split(' ')[0] || '',
            middleName: actualUserData.name?.split(' ').slice(1, -1).join(' ') || '',
            lastName: actualUserData.name?.split(' ').slice(-1)[0] || '',
            gender: actualUserData.gender || '',
            dateOfBirth: actualUserData.dob ? moment(actualUserData.dob).format('YYYY-MM-DD') : '',
          },
          personal: {
            email: actualUserData.email || '',
            phone: actualUserData.mobile_primary || actualUserData.mobile || '',
            address: actualUserData.address || '',
            currentAddress: actualUserData.current_address?.address_line || '',
            permanentAddress: actualUserData.permanent_address?.address_line || '',
            fatherName: actualUserData.father_name || '',
            motherName: actualUserData.mother_name || '',
            spouseName: actualUserData.spouse_name || '',
            anniversary: actualUserData.anniversary || '',
            maritalStatus: actualUserData.marital_status || '',
            bloodGroup: actualUserData.blood_group || '',
            physicallyChallenged: actualUserData.physically_challenged ? 'yes' : 'no',
            physicallyChallengedReason: actualUserData.physically_challenged_reason || '',
            qualification: actualUserData.qualification || '',
            lastOccupation: actualUserData.last_occupation || '',
            referenceOfJoining: actualUserData.reference_by || '',
            aadharNo: actualUserData.aadhar_no || '',
            panNo: actualUserData.pan_no || '',
            // Additional address fields
            currentAddressBlock: actualUserData.current_address?.block || '',
            currentAddressVillage: actualUserData.current_address?.village || '',
            currentAddressDistrict: actualUserData.current_address?.district || '',
            currentAddressState: actualUserData.current_address?.state || '',
            currentAddressCountry: actualUserData.current_address?.country || '',
            currentAddressPincode: actualUserData.current_address?.pincode || '',
            permanentAddressBlock: actualUserData.permanent_address?.block || '',
            permanentAddressVillage: actualUserData.permanent_address?.village || '',
            permanentAddressDistrict: actualUserData.permanent_address?.district || '',
            permanentAddressState: actualUserData.permanent_address?.state || '',
            permanentAddressCountry: actualUserData.permanent_address?.country || '',
            permanentAddressPincode: actualUserData.permanent_address?.pincode || '',
            // Emergency contacts
            emergencyContact1Name: actualUserData.emergency_contact1?.name || '',
            emergencyContact1Relation: actualUserData.emergency_contact1?.relation || '',
            emergencyContact1Phone: actualUserData.emergency_contact1?.phone || '',
            emergencyContact2Name: actualUserData.emergency_contact2?.name || '',
            emergencyContact2Relation: actualUserData.emergency_contact2?.relation || '',
            emergencyContact2Phone: actualUserData.emergency_contact2?.phone || '',
            emergencyContact3Name: actualUserData.emergency_contact3?.name || '',
            emergencyContact3Relation: actualUserData.emergency_contact3?.relation || '',
            emergencyContact3Phone: actualUserData.emergency_contact3?.phone || '',
            raBranch: actualUserData.ra_branch || '',
            group: actualUserData.group || '',
          },
          employment: {
            location: actualUserData.location || '',
            workType: actualUserData.work_type || 'full-time',
            shift: actualUserData.shift || 'day',
            status: actualUserData.status || 'active',
            joiningDate: actualUserData.joining_date
              ? moment(actualUserData.joining_date).format('YYYY-MM-DD')
              : '',
            onboardingDate: actualUserData.onboarding_date
              ? moment(actualUserData.onboarding_date).format('YYYY-MM-DD')
              : '',
            reportingManager: reportingManagerId,
            reportingManagerName: reportingManagerNameSeed,
            leaveAuthorityOne,
            leaveAuthorityTwo,
            remark: actualUserData.remark || '',
            leaveAuthorityOne_Name,
            leaveAuthorityTwo_Name,
            designation: actualUserData.designation || '',
            department: actualUserData.department || '',
            employeeType: actualUserData.employee_type || '',
            ctcPerMonth: actualUserData.ctc_per_month || '',
            ctcPerMonthInWords: actualUserData.ctc_per_month_in_words || '',
            hraInWords: actualUserData.hra_in_words || '',
            templates: actualUserData.template || [],
            basicPerMonth: actualUserData.basic_per_month || '',
            core: actualUserData.core || false,
            companyName: actualUserData.company_name || '',
            companyCode: actualUserData.company_name || '', // Store the original code
            hraPerMonth: actualUserData.hra_per_month || '',
            raLocation: actualUserData.ra_location?.value || actualUserData.ra_location || '',
          },
          bank: {
            bankName: actualUserData.bank_name || '',
            accountNumber: actualUserData.account_number || '',
            ifscCode: actualUserData.ifsc_code || '',
            branchName: actualUserData.branch_name || '',
          },
          additional: {
            bloodGroup: actualUserData.blood_group || '',
            emergencyContactName: actualUserData.emergency_contact1?.name || '',
            emergencyContactNumber: actualUserData.emergency_contact1?.phone || '',
            emergencyContactRelation: actualUserData.emergency_contact1?.relation || '',
            emergencyContact2Name: actualUserData.emergency_contact2?.name || '',
            emergencyContact2Number: actualUserData.emergency_contact2?.phone || '',
            emergencyContact2Relation: actualUserData.emergency_contact2?.relation || '',
            emergencyContact3Name: actualUserData.emergency_contact3?.name || '',
            emergencyContact3Number: actualUserData.emergency_contact3?.phone || '',
            emergencyContact3Relation: actualUserData.emergency_contact3?.relation || '',
            maritalStatus: actualUserData.marital_status || '',
            notes: '',
            companyName: actualUserData.company_name || '',
            welcomeLetter: actualUserData.welcome_letter || false,
            offerLetter: actualUserData.offer_letter || false,
            bankEditLocked: actualUserData.bank_edit_locked || false,
            documentEditLocked: actualUserData.document_edit_locked || false,
            documents: actualUserData.documents || [],
          },
        }
        console.log('Transformed Profile Data:', transformedData._id)

        setProfileData(transformedData)
        setFormData(transformedData)

        // Load existing profile image if available
        if (userData.profileImage) {
          const signedUrl = await generateSignedUrl(userData.profileImage)
          if (signedUrl) {
            setProfilePicture(signedUrl)
            dispatch({ type: 'setProfilePicture', profilePicture: signedUrl })
          }
        }

        // Resolve reporting manager name after setting the data
        resolveReportingManagerName(transformedData.employment.reportingManager)

        // Resolve company name after setting the data
        if (transformedData.employment.companyCode) {
          const companyCode = transformedData.employment.companyCode
          const isCode = companies.some((c) => c.value === companyCode)
          if (isCode) {
            resolveCompanyName(companyCode)
          }
        }
      }
    } catch (error) {
      setError('Failed to load your profile data. Please try again.')

      // Set fallback data using admin state
      if (admin) {
        const fallbackData = {
          _id: admin._id,
          userId: admin._id, // Add userId field for current user
          profile: {
            employeeId: admin.employeeId || admin.employee_id || 'N/A',
            name: admin.name || 'User',
            role: Array.isArray(admin.role) ? admin.role : admin.role || admin.user_role || '',
            status: admin.status || admin.user_status || 'active',
            mobile: admin.mobile || admin.phone || '',
            email: admin.email || '',
            gender: admin.gender || '',
            department: admin.department || admin.user_department || '',
            password: admin.open_password || admin.password || admin.user_password || '',
            _id: admin._id || '',
          },
          general: {
            firstName: admin.name?.split(' ')[0] || 'User',
            middleName: '',
            lastName: admin.name?.split(' ').slice(1).join(' ') || '',
            dateOfBirth: admin.dateOfBirth || admin.dob || '',
            gender: admin.gender || 'male',
          },
          personal: {
            email: admin.email || '',
            phone: admin.mobile || admin.phone || '',
            address: admin.address || '',
            maritalStatus: admin.maritalStatus || '',
            bloodGroup: admin.bloodGroup || '',
            fatherName: admin.fatherName || '',
            motherName: admin.motherName || '',
            spouseName: admin.spouseName || '',
            anniversary: admin.anniversary || '',
            physicallyChallenged: 'no',
            qualification: admin.qualification || '',
            lastOccupation: admin.lastOccupation || '',
            referenceOfJoining: admin.referenceOfJoining || '',
            aadharNo: admin.aadharNo || '',
            panNo: admin.panNo || '',
          },
          employment: {
            department: admin.department || 'General',
            designation: admin.designation || 'Employee',
            joiningDate: admin.joiningDate || admin.joining_date || '',
            employeeType: 'Full-time',
            status: admin.status || 'active',
            ctcPerMonth: admin.ctc || admin.ctc_per_month || '',
            ctcPerMonthInWords: '',
            hraInWords: '',
            location: admin.location || '',
            workType: admin.workType || 'full-time',
            shift: admin.shift || 'day',
            reportingManager: admin.reportingManager || '',
            onboardingDate: '',
            basicPerMonth: admin.basicSalary || '',
            core: admin.isCore || false,
            companyName: admin.companyName || '',
            companyCode: admin.companyName || '', // Store the original code
            hraPerMonth: admin.hra || '',
          },
          bank: {
            bankName: admin.bankName || '',
            accountNumber: admin.accountNumber || '',
            ifscCode: admin.ifscCode || '',
            branchName: admin.branchName || '',
          },
          additional: {
            emergencyContactName: admin.emergencyContactName || '',
            emergencyContactNumber: admin.emergencyContactNumber || '',
            emergencyContactRelation: admin.emergencyContactRelation || '',
            bloodGroup: admin.bloodGroup || '',
            maritalStatus: admin.maritalStatus || '',
            notes: '',
            companyName: admin.companyName || '',
            welcomeLetter: false,
            offerLetter: false,
            bankEditLocked: false,
            documentEditLocked: false,
            documents: [],
          },
        }
        setProfileData(fallbackData)
        setFormData(fallbackData)

        // Load existing profile image if available in fallback
        if (admin?.profileImage) {
          const signedUrl = await generateSignedUrl(admin.profileImage)
          if (signedUrl) {
            setProfilePicture(signedUrl)
            dispatch({ type: 'setProfilePicture', profilePicture: signedUrl })
          }
        }
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMyProfileData()
    fetchManagers() // Fetch managers list
    fetchCompanies() // Fetch companies list
    fetchLocations()
    fetchTemplates()
    fetchGroups()
    // Initialize edit mode
    const initialEditMode = {}
    sections.forEach((section) => {
      initialEditMode[section] = false
    })
    setEditMode((prev) => ({
      ...initialEditMode,
      ...prev,
    }))
  }, [admin?._id])

  useEffect(() => {
    const loadExistingImage = async () => {
      // Check multiple possible locations for profileImage
      const profileImageId =
        profileData?.profileImage ||
        profileData?.profile?.profileImage ||
        formData?.profileImage ||
        formData?.profile?.profileImage

      if (profileImageId && !profilePicture) {
        const signedUrl = await generateSignedUrl(profileImageId)
        if (signedUrl) {
          setProfilePicture(signedUrl)
        }
      }
    }

    loadExistingImage()
  }, [profileData, formData, profilePicture])

  useEffect(() => {
    const rm = formData.employment?.reportingManager
    if (managersById.size && rm) resolveReportingManagerName(rm)
  }, [managersById, formData.employment?.reportingManager, resolveReportingManagerName])

  /** When API omits *_Name or stores the raw id in the name field, resolve labels from staff list. */
  useEffect(() => {
    if (!managersById.size || !formData?.employment) return

    const emp = formData.employment
    const shouldResolveName = (id, storedName) => {
      if (!id || !looksLikeMongoObjectId(id)) return false
      const sn = storedName != null ? String(storedName).trim() : ''
      if (!sn) return true
      if (sn === id) return true
      return looksLikeMongoObjectId(sn)
    }

    const patch = {}
    if (
      shouldResolveName(emp.leaveAuthorityOne, emp.leaveAuthorityOne_Name) &&
      emp.leaveAuthorityOne
    ) {
      const label = managersById.get(emp.leaveAuthorityOne)?.label
      if (label) patch.leaveAuthorityOne_Name = label
    }
    if (
      shouldResolveName(emp.leaveAuthorityTwo, emp.leaveAuthorityTwo_Name) &&
      emp.leaveAuthorityTwo
    ) {
      const label = managersById.get(emp.leaveAuthorityTwo)?.label
      if (label) patch.leaveAuthorityTwo_Name = label
    }

    if (Object.keys(patch).length) mergeEmploymentPatch(patch)
  }, [
    managersById,
    mergeEmploymentPatch,
    formData?.employment?.leaveAuthorityOne,
    formData?.employment?.leaveAuthorityTwo,
    formData?.employment?.leaveAuthorityOne_Name,
    formData?.employment?.leaveAuthorityTwo_Name,
  ])

  // Resolve company name when companies list is loaded
  useEffect(() => {
    if (companies.length > 0 && formData.employment?.companyCode) {
      // Check if companyCode is a code (like 'RA', 'GA') and needs resolution
      const companyCode = formData.employment.companyCode
      const isCode = companies.some((c) => c.value === companyCode)
      if (isCode) {
        resolveCompanyName(companyCode)
      }
    }
  }, [companies, formData.employment?.companyCode])

  const handleEditToggle = (section) => {
    setEditMode((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const handleSave = async (section) => {
    try {
      let requestBody = {}

      // Same switch logic as before but for current user
      switch (section) {
        case 'bank':
          requestBody = {
            bank_name: formData.bank?.bankName,
            account_number: formData.bank?.accountNumber,
            ifsc_code: formData.bank?.ifscCode,
            branch_name: formData.bank?.branchName,
          }
          break
        case 'attachments': {
          const galleryFiles = formData?.attachments?.gallery || []
          const profileImage = formData?.attachments?.profile_image || null

          const fd = new FormData()
          galleryFiles.forEach((file) => {
            if (file instanceof File) fd.append('gallery', file)
          })
          if (profileImage instanceof File) fd.append('profile_image', profileImage)

          requestBody = fd
          break
        }

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

      const response = await new BasicProvider(`profiles/${userId}`, dispatch).patchRequest(
        cleanRequestBody,
      )

      if (response.data) {
        setProfileData(response.data)
        setFormData(response.data)
      } else {
        setProfileData(response)
        setFormData(response)
      }

      setEditMode((prev) => ({ ...prev, [section]: false }))

      // Track edit attempts for regular users (not HR/Admin)
      // Note: attachments can be edited multiple times, so we only track bank
      const isAdmin = admin?.role === 'Admin' || admin?.role === 'admin'
      const isHR = admin?.role === 'HR' || admin?.role === 'hr'

      if (!isAdmin && !isHR && section === 'bank') {
        const newAttempts = { ...editAttempts, [section]: true }
        setEditAttempts(newAttempts)
        // Save to localStorage with user-specific key
        const userId = admin?._id || 'default'
        localStorage.setItem(`editAttempts_${userId}`, JSON.stringify(newAttempts))
      }

      setError(null)
      toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} updated successfully!`, {
        position: 'top-right',
        autoClose: 2000,
      })
      
      // Reload page after successful save for bank details and attachments
      if (section === 'bank' || section === 'attachments') {
        setTimeout(() => {
          window.location.reload()
        }, 2500) // 2.5 seconds delay (2s for toast + 0.5s buffer)
      }
    } catch (error) {
      console.error('Error updating profile data:', error)
      let errorMessage =
        error.response?.data?.message || error.response?.data?.error || error.message
      setError(`Failed to update ${section} data: ${errorMessage}`)
      toast.error(`Failed to update ${section} data: ${errorMessage}`, {
        position: 'top-right',
        autoClose: 4000,
      })
    }
  }

  const handleCancel = (section) => {
    setFormData(profileData)
    setEditMode((prev) => ({ ...prev, [section]: false }))
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

  const handleFileUpload = (field, file) => {
    setAttachments((prev) => ({
      ...prev,
      [field]: file,
    }))
  }

  const handleAttachmentUpload = (field, event) => {
    const file = event.target.files[0]
    if (file) {
      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024 // 5MB in bytes
      if (file.size > maxSize) {
        toast.error(
          `File size too large. Maximum allowed size is 5MB. Current file: ${(
            file.size /
            1024 /
            1024
          ).toFixed(2)}MB`,
          {
            position: 'top-right',
            autoClose: 4000,
          },
        )
        event.target.value = '' // Clear the input
        return
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/jpg',
        'image/png',
      ]

      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid file type. Please upload PDF, DOC, DOCX, JPG, JPEG, or PNG files.', {
          position: 'top-right',
          autoClose: 4000,
        })
        event.target.value = '' // Clear the input
        return
      }

      handleFileUpload(field, file)
    }
  }

  const handleDocumentUpload = async () => {
    try {
      if (!userId) {
        toast.error('User ID not found', {
          position: 'top-right',
          autoClose: 3000,
        })
        return
      }

      // Check if there are any files to upload
      const filesToUpload = Object.values(attachments).filter((file) => file !== null)
      if (filesToUpload.length === 0) {
        toast.warning('No documents selected for upload', {
          position: 'top-right',
          autoClose: 3000,
        })
        return
      }

      const uploadFormData = new FormData()
      Object.entries(attachments).forEach(([key, file]) => {
        if (file) {
          uploadFormData.append('gallery', file)
          uploadFormData.append('documentType', key) // Add document type for backend
        }
      })

      console.log(
        'Uploading documents:',
        filesToUpload.map((f) => f.name),
      )

      // Use BasicProvider for consistent authentication handling
      const response = await new BasicProvider(`profiles/${userId}/upload-document`, dispatch).postRequest(
        uploadFormData,
      )

      console.log('Upload response:', response)

      if (response && response.status === 'success') {
        toast.success('Documents uploaded successfully!', {
          position: 'top-right',
          autoClose: 3000,
        })
        console.log('Upload success:', response)

        // Clear the attachments after successful upload
        setAttachments({
          resume: null,
          idProof: null,
          certificates: null,
          experienceLetter: null,
          salarySlip: null,
          otherDocuments: null,
        })

        // Refresh profile data
        await fetchMyProfileData()
      } else {
        console.log('Upload failed - response:', response)
        toast.error('Upload failed: Invalid response from server', {
          position: 'top-right',
          autoClose: 4000,
        })
      }
    } catch (error) {
      console.error('Document upload error:', error)

      // Handle different error types
      if (error.statusCode === 401) {
        toast.error('Unauthorized: Please login again', {
          position: 'top-right',
          autoClose: 4000,
        })
      } else if (error.statusCode === 403) {
        toast.error('Forbidden: You do not have permission to upload documents', {
          position: 'top-right',
          autoClose: 4000,
        })
      } else if (error.statusCode === 413) {
        toast.error('File too large: Please ensure files are under 5MB', {
          position: 'top-right',
          autoClose: 4000,
        })
      } else if (error.statusCode === 415) {
        toast.error('Invalid file type: Please upload PDF, DOC, DOCX, JPG, JPEG, or PNG files', {
          position: 'top-right',
          autoClose: 4000,
        })
      } else {
        const message = error.message || error.response?.data?.message || error.response?.data?.error || 'Upload failed'
        toast.error(`Upload failed: ${message}`, {
          position: 'top-right',
          autoClose: 4000,
        })
      }
    }
  }

  const handleAttendanceClick = () => {
    navigate(`/hrms/staff/attendance/${admin._id}`)
  }

  // Handle profile picture upload
  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, JPG, PNG, or GIF)', {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB', {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }

    setUploadingPicture(true)

    try {
      // First upload the file to get file ID
      const uploadFormData = new FormData()
      uploadFormData.append('gallery', file)

      const uploadResponse = await new BasicProvider('cms/files/create', dispatch).postRequest(
        uploadFormData,
      )

      if (uploadResponse?.data?.[0]) {
        const uploadedFile = uploadResponse.data[0]

        // Now update the profile with the file ID
        const profileUpdateResponse = await new BasicProvider(
          `profiles/${admin._id}`,
          dispatch,
        ).patchRequest({
          profileImage: uploadedFile._id, // Back to storing file ID
        })

        if (profileUpdateResponse?.data) {
          // Generate signed URL for the uploaded image
          const signedUrlResponse = await new BasicProvider(
            `cms/files/signed-url?key=${uploadedFile.filepath}`,
            dispatch,
          ).getRequest()

          if (signedUrlResponse.data?.url) {
            setProfilePicture(signedUrlResponse.data.url)
            dispatch({ type: 'setProfilePicture', profilePicture: signedUrlResponse.data.url })
          } else {
            // Fallback to direct URL if signed URL fails
            const imageUrl = `${process.env.REACT_APP_NODE_URL}/files/${uploadedFile._id}`
            setProfilePicture(imageUrl)
            dispatch({ type: 'setProfilePicture', profilePicture: imageUrl })
          }

          // Update the profile data
          setProfileData(profileUpdateResponse.data)
          setFormData(profileUpdateResponse.data)
          
          // Show success notification and delay reload to allow user to see it
          toast.success('Profile picture updated successfully!', {
            position: 'top-right',
            autoClose: 2000,
          })
          
          // Delay reload to ensure toast is visible
          setTimeout(() => {
            window.location.reload()
          }, 2500) // 2.5 seconds delay (2s for toast + 0.5s buffer)
        } else {
          toast.error('Failed to update profile with image', {
            position: 'top-right',
            autoClose: 4000,
          })
        }
      } else {
        toast.error('Failed to upload file', {
          position: 'top-right',
          autoClose: 4000,
        })
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error)
      toast.error(`Failed to upload profile picture: ${error.response?.data?.message || error.message}`, {
        position: 'top-right',
        autoClose: 4000,
      })
    } finally {
      setUploadingPicture(false)
    }
  }

  // Generate signed URL for existing profile image
  const generateSignedUrl = async (imageId) => {
    if (!imageId) return null

    try {
      // Handle case where imageId is an object (with file details)
      if (typeof imageId === 'object' && imageId !== null) {
        if (imageId.filepath) {
          const signedUrlResponse = await new BasicProvider(
            `cms/files/signed-url?key=${imageId.filepath}`,
            dispatch,
          ).getRequest()

          return signedUrlResponse.data?.url || null
        } else if (imageId._id) {
          // Fallback to using the _id
          const signedUrlResponse = await new BasicProvider(
            `cms/files/show-file-with-signed-url/${imageId._id}`,
            dispatch,
          ).getRequest()

          return signedUrlResponse.data || null
        }
      }

      // Handle case where imageId is a string
      if (typeof imageId === 'string') {
        // If it looks like a filepath (contains slashes or uploads), use it directly
        if (imageId.includes('/') || imageId.includes('uploads')) {
          const signedUrlResponse = await new BasicProvider(
            `cms/files/signed-url?key=${imageId}`,
            dispatch,
          ).getRequest()

          return signedUrlResponse.data?.url || null
        }

        // If it's an ID, use the show-file-with-signed-url endpoint
        const signedUrlResponse = await new BasicProvider(
          `cms/files/show-file-with-signed-url/${imageId}`,
          dispatch,
        ).getRequest()

        return signedUrlResponse.data || null
      }

      return null
    } catch (error) {
      console.error('Error generating signed URL:', error)
      // Fallback to direct URL
      return `${process.env.REACT_APP_NODE_URL}/files/${imageId}`
    }
  }

  const resolvedRaLocationValue = (() => {
    const r = formData?.employment?.raLocation
    if (!r) return ''
    if (locations.find((l) => l.value === r)) return r
    const found = locations.find((l) => l.label === r || l.name === r)
    return found ? found.value : ''
  })()
  useEffect(() => {
    const docs = formData?.additional?.documents?.length > 0 ? formData.additional.documents : []

    if (docs.length > 0) {
      docs.forEach((file) => {
        if (!signedUrls[file._id] && !urlLoading[file._id] && (file.filepath || file.key)) {
          fetchSignedUrl(file._id, file.filepath || file.key)
        }
      })
    }
  }, [formData?.additional?.documents])

  if (loading) {
    return (
      <CContainer fluid className="py-4">
        <AppContentSkeleton ariaLabel="Loading my profile" variant="detail" rows={8} />
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
      <div className="profile-header position-relative">
        <div className="profile-header-bg"></div>
        <div className="container-fluid position-relative z-1">
          <div className="row align-items-center ">
            <div className="col-md-8 d-flex align-items-center mb-3 mb-md-0">
              <div className="profile-photo-wrapper me-3 flex-shrink-0 position-relative">
                <img
                  src={
                    profilePicture ||
                    'https://static.vecteezy.com/system/resources/thumbnails/002/002/403/small/man-with-beard-avatar-character-isolated-icon-free-vector.jpg'
                  }
                  alt="Profile"
                  className="profile-photo"
                  width={80}
                  height={80}
                />
                <label
                  htmlFor="profile-picture-upload"
                  className="profile-picture-edit-btn"
                  title="Upload Profile Picture"
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    background: '#007bff',
                    border: '2px solid white',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}
                >
                  <CIcon icon={cilPencil} size="sm" color="white" />
                </label>
                <input
                  type="file"
                  id="profile-picture-upload"
                  accept="image/jpeg,image/jpg,image/png,image/gif"
                  onChange={handleProfilePictureUpload}
                  style={{ display: 'none' }}
                  disabled={uploadingPicture}
                />
                {uploadingPicture && (
                  <div
                    className="position-absolute"
                    style={{
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      background: 'rgba(0,0,0,0.7)',
                      borderRadius: '50%',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CSpinner size="sm" color="light" />
                  </div>
                )}
              </div>
              <div className="profile-info">
                <div className="profile-name fw-bold" style={{ fontSize: '1.5rem' }}>
                  {formData.profile?.name || 'Employee Name'}
                </div>
                <div className="profile-id text-light small mt-1">
                  ID:{' '}
                  {formData.profile?.employeeId
                    ? String(formData.profile.employeeId).toUpperCase()
                    : 'N/A'}
                </div>
              </div>
            </div>
            <div className="col-md-4 d-flex justify-content-md-end justify-content-start align-items-center">
              <div className="profile-actions d-flex gap-2">
                <CButton
                  color="primary"
                  className="d-flex align-items-center"
                  onClick={handleAttendanceClick}
                >
                  <CIcon icon={cilPlus} className="me-1" />
                  My Attendance
                </CButton>
              </div>
            </div>
          </div>
        </div>
        <style jsx>{`
          .employee-profile-heading {
            margin-top: 0;
            margin-bottom: 0.5rem;
            text-align: left;
            padding-left: 40px;
          }
          .profile-header {
            position: relative;
            min-height: 140px;
            margin-bottom: 2rem;
            overflow: hidden;
          }
          .profile-header-bg {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: url('/public/real-apple.avif') center center/cover no-repeat, #0b1857;
            opacity: 0.85;
            z-index: 0;
          }
          .profile-photo-wrapper {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            overflow: hidden;
            border: 3px solid #fff;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            background: #f8f9fa;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
          }
          .profile-photo-wrapper:hover {
            transform: scale(1.05);
          }
          .profile-photo {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 50%;
          }
          .profile-picture-edit-btn:hover {
            background: #0056b3 !important;
            transform: scale(1.1);
            transition: all 0.2s ease;
          }
          .profile-info {
            color: #fff;
          }
          .profile-name {
            font-weight: 700;
            letter-spacing: 0.5px;
          }
          .profile-id {
            font-size: 0.95rem;
            opacity: 0.9;
          }
          .profile-actions .btn {
            min-width: 110px;
            font-weight: 500;
            font-size: 1rem;
          }
          @media (max-width: 768px) {
            .profile-header {
              min-height: 100px;
              padding: 1rem 0;
            }
            .profile-photo-wrapper {
              width: 60px;
              height: 60px;
            }
            .profile-name {
              font-size: 1.1rem;
            }
            .profile-actions {
              flex-direction: column;
              gap: 0.5rem;
              margin-top: 1rem;
            }
          }
        `}</style>
      </div>

      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            {(!canEditSection('bank', profileData, admin) ||
              !canEditSection('attachments', profileData, admin)) && (
              <CRow className="mb-4">
                <CCol xs={12}>
                  <CAlert color="info">
                    <div className="d-flex align-items-start">
                      <CIcon icon={cilUser} className="me-3 mt-1" />
                      <div className="flex-grow-1">
                        <div className="mb-2">
                          <strong>Edit Permissions:</strong> You can only edit{' '}
                          <strong>Bank Details</strong> and <strong>Document Attachments</strong>{' '}
                          once each. Contact HR/Admin for other changes.
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

                    <CButton
                      color="success"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setMyAuthorityModalVisible(true)
                        fetchMyAuthorityLists()
                      }}
                    >
                      My Team / Authority
                    </CButton>
                  </CCardHeader>
                  <CCardBody>
                    <CRow>
                      <CCol md={6}>
                        <CFormLabel>Employee ID</CFormLabel>
                        <CFormInput
                          value={
                            formData.profile?.employeeId
                              ? String(formData.profile.employeeId).toUpperCase()
                              : ''
                          }
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
                        <CFormLabel>Role{allRoles.length > 1 ? 's' : ''}</CFormLabel>
                        <CFormInput
                          value={
                            allRoles.length > 0 ? allRoles.join(', ') : formData.profile?.role || ''
                          }
                          onChange={(e) => handleInputChange('profile', 'role', e.target.value)}
                          disabled={true}
                          placeholder="Enter Role"
                        />
                        <small className="text-muted">
                          {allRoles.length > 0
                            ? `Total ${allRoles.length} role${
                                allRoles.length > 1 ? 's' : ''
                              }: ${allRoles.join(', ')}`
                            : 'No roles assigned'}
                        </small>
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>Status</CFormLabel>
                        <AppFormSelect
                          value={formData.profile?.status || ''}
                          onChange={(e) => handleInputChange('profile', 'status', e.target.value)}
                          disabled={true}
                        >
                          <option value="">Select Status</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="suspended">Suspended</option>
                        </AppFormSelect>
                      </CCol>
                    </CRow>
                    <CRow className="mt-3">
                      <CCol md={6}>
                        <CFormLabel>Company Name</CFormLabel>
                        <CFormInput
                          value={formData.employment?.companyName || ''}
                          disabled={true}
                          placeholder="Company Name"
                          style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                        />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>Department</CFormLabel>
                        <CFormInput
                          value={formData.profile?.department || ''}
                          onChange={(e) =>
                            handleInputChange('profile', 'department', e.target.value)
                          }
                          disabled={true}
                          placeholder="Enter Department"
                        />
                      </CCol>
                    </CRow>
                    <CRow className="mt-3">
                      <CCol md={6}>
                        <CFormLabel>Mobile</CFormLabel>
                        <CFormInput
                          value={formData.profile?.mobile || ''}
                          onChange={(e) => handleInputChange('profile', 'mobile', e.target.value)}
                          disabled={true}
                          placeholder="Enter Mobile Number"
                          maxLength={10}
                        />
                        <small className="text-muted">Enter 10 digit mobile number</small>
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>Email</CFormLabel>
                        <CFormInput
                          type="email"
                          value={formData.profile?.email || ''}
                          onChange={(e) => handleInputChange('profile', 'email', e.target.value)}
                          disabled={true}
                          placeholder="Enter Email"
                        />
                      </CCol>
                    </CRow>
                    <CRow className="mt-3">
                      <CCol md={6}>
                        <CFormLabel>Gender</CFormLabel>
                        <AppFormSelect
                          value={formData.profile?.gender || ''}
                          onChange={(e) => handleInputChange('profile', 'gender', e.target.value)}
                          disabled={true}
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </AppFormSelect>
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>Password</CFormLabel>
                        <CFormInput
                          type="text"
                          value={formData.profile?.password || 'No password set'}
                          disabled={true}
                          placeholder="Password"
                          style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                        />
                        <small className="text-muted">
                          Password is visible for profile viewing
                        </small>
                      </CCol>
                    </CRow>
                    <CRow>
                      <CCol md={6}>
                        <CFormLabel>Alternate Number</CFormLabel>
                        <CFormInput
                          value={formData?.personal?.mobileAlternate || ''}
                          onChange={(e) =>
                            handleInputChange('personal', 'mobileAlternate', e.target.value)
                          }
                          disabled={true}
                          maxLength={10}
                          placeholder="Enter Alternate Contact Number"
                        />

                        <small className="text-muted">Enter 10 digit mobile number</small>
                      </CCol>
                    </CRow>
                    {/* Save buttons removed - profile section is not editable */}
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>

            {/* Personal Information */}
            {/* Personal Information */}
            <CRow className="mb-4">
              <CCol xs={12}>
                <CCard>
                  <CCardHeader className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <CIcon icon={cilEnvelopeClosed} className="me-2" />
                      <h5 className="mb-0">Personal Information</h5>
                    </div>
                    {/* Edit button removed for personal section - only bank and attachments can be edited */}
                  </CCardHeader>
                  <CCardBody>
                    <CRow>
                      <CCol md={6}>
                        <CFormLabel>Staff Type</CFormLabel>
                        <AppFormSelect
                          value={formData.employment?.employeeType || ''}
                          onChange={(e) =>
                            handleInputChange('employment', 'employeeType', e.target.value)
                          }
                          disabled={true}
                        >
                          <option value="">Select Staff Type</option>
                          <option value="permanent">Permanent</option>
                          <option value="contract">Contract</option>
                          <option value="temporary">Temporary</option>
                          <option value="intern">Intern</option>
                          <option value="consultant">Consultant</option>
                        </AppFormSelect>
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>Department</CFormLabel>
                        <AppFormSelect
                          value={formData.profile?.department || ''}
                          onChange={(e) =>
                            handleInputChange('profile', 'department', e.target.value)
                          }
                          disabled={true}
                        >
                          <option value="">Select Department</option>
                          <option value="technical">Technical</option>
                          <option value="management">Management</option>
                          <option value="hr">HR</option>
                          <option value="finance">Finance</option>
                          <option value="operations">Operations</option>
                        </AppFormSelect>
                      </CCol>
                    </CRow>

                    <CRow className="mt-3">
                      <CCol md={6}>
                        <CFormLabel>Date of Birth</CFormLabel>
                        <CFormInput
                          type="date"
                          value={formData.general?.dateOfBirth || ''}
                          onChange={(e) =>
                            handleInputChange('general', 'dateOfBirth', e.target.value)
                          }
                          disabled={true}
                        />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>Marital Status</CFormLabel>
                        <AppFormSelect
                          value={formData.personal?.maritalStatus || ''}
                          onChange={(e) =>
                            handleInputChange('personal', 'maritalStatus', e.target.value)
                          }
                          disabled={true}
                        >
                          <option value="">Select Status</option>
                          <option value="single">Single</option>
                          <option value="married">Married</option>
                          <option value="divorced">Divorced</option>
                          <option value="widowed">Widowed</option>
                        </AppFormSelect>
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
                          disabled={true}
                          placeholder="Enter Blood Group"
                        />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>Physically Challenged</CFormLabel>
                        <AppFormSelect
                          value={formData.personal?.physicallyChallenged || ''}
                          onChange={(e) =>
                            handleInputChange('personal', 'physicallyChallenged', e.target.value)
                          }
                          disabled={true}
                        >
                          <option value="">Select Option</option>
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </AppFormSelect>

                        {/* Conditional input for physically challenged reason */}
                        {formData.personal?.physicallyChallenged === 'yes' && (
                          <div className="mt-3">
                            <CFormLabel className="fw-semibold text-primary">
                              <CIcon icon={cilInfo} className="me-1" />
                              Please specify the nature of disability *
                            </CFormLabel>
                            <CFormTextarea
                              value={formData.personal?.physicallyChallengedReason || ''}
                              onChange={(e) =>
                                handleInputChange(
                                  'personal',
                                  'physicallyChallengedReason',
                                  e.target.value,
                                )
                              }
                              placeholder="Please describe the nature of disability or specific challenges..."
                              rows={3}
                              disabled={true}
                              required
                            />
                            <small className="text-muted">
                              This information will help us provide appropriate accommodations and
                              support.
                            </small>
                          </div>
                        )}
                      </CCol>
                    </CRow>

                    <CRow className="mt-3">
                      <CCol md={6}>
                        <CFormLabel>Father's Name</CFormLabel>
                        <CFormInput
                          value={formData.personal?.fatherName || ''}
                          onChange={(e) =>
                            handleInputChange('personal', 'fatherName', e.target.value)
                          }
                          disabled={true}
                          placeholder="Enter Father's Name"
                        />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>Mother's Name</CFormLabel>
                        <CFormInput
                          value={formData.personal?.motherName || ''}
                          onChange={(e) =>
                            handleInputChange('personal', 'motherName', e.target.value)
                          }
                          disabled={true}
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
                        />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>Anniversary</CFormLabel>
                        <CFormInput
                          value={formData.personal?.anniversary || ''}
                          onChange={(e) =>
                            handleInputChange('personal', 'anniversary', e.target.value)
                          }
                          disabled={true}
                          placeholder="Enter anniversary"
                        />
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
                          disabled={true}
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
                          disabled={true}
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
                          disabled={true}
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
                          disabled={true}
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
                          disabled={true}
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
                          disabled={true}
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
                          disabled={true}
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
                          disabled={true}
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
                          disabled={true}
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
                          disabled={true}
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
                          disabled={true}
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
                          disabled={true}
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
                          disabled={true}
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
                          disabled={true}
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
                          disabled={true}
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
                          disabled={true}
                          placeholder="Enter Last Occupation"
                        />
                      </CCol>
                    </CRow>
                    <CRow>
                      <CCol md={6}>
                        <CFormLabel>Reference Of Joining</CFormLabel>
                        <CFormInput
                          value={formData.personal?.referenceOfJoining || ''}
                          onChange={(e) =>
                            handleInputChange('personal', 'referenceOfJoining', e.target.value)
                          }
                          disabled={true}
                          placeholder="Enter Reference of Joining"
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
                          disabled={true}
                          placeholder="Enter Aadhar Number"
                        />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>PAN Number</CFormLabel>
                        <CFormInput
                          value={formData.personal?.panNo || ''}
                          onChange={(e) => handleInputChange('personal', 'panNo', e.target.value)}
                          disabled={true}
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
                          disabled={true}
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
                          disabled={true}
                          placeholder="Enter Relation"
                        />
                      </CCol>
                      <CCol md={4}>
                        <CFormLabel>Emergency Contact 1 - Phone</CFormLabel>
                        <CFormInput
                          value={formData.personal?.emergencyContact1Phone || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                            handleInputChange('personal', 'emergencyContact1Phone', value)
                          }}
                          disabled={true}
                          placeholder="Enter Phone Number"
                          maxLength={10}
                        />
                        <small className="text-muted">Enter 10 digit phone number</small>
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
                          disabled={true}
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
                          disabled={true}
                          placeholder="Enter Relation"
                        />
                      </CCol>
                      <CCol md={4}>
                        <CFormLabel>Emergency Contact 2 - Phone</CFormLabel>
                        <CFormInput
                          value={formData.personal?.emergencyContact2Phone || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                            handleInputChange('personal', 'emergencyContact2Phone', value)
                          }}
                          disabled={true}
                          placeholder="Enter Phone Number"
                          maxLength={10}
                        />
                        <small className="text-muted">Enter 10 digit phone number</small>
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
                          disabled={true}
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
                          disabled={true}
                          placeholder="Enter Relation"
                        />
                      </CCol>
                      <CCol md={4}>
                        <CFormLabel>Emergency Contact 3 - Phone</CFormLabel>
                        <CFormInput
                          value={formData.personal?.emergencyContact3Phone || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                            handleInputChange('personal', 'emergencyContact3Phone', value)
                          }}
                          disabled={true}
                          placeholder="Enter Phone Number"
                          maxLength={10}
                        />
                        <small className="text-muted">Enter 10 digit phone number</small>
                      </CCol>
                    </CRow>

                    {/* Save buttons removed - personal section is not editable */}
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
                    {/* Edit button removed for employment section - only bank and attachments can be edited */}
                  </CCardHeader>
                  <CCardBody>
                    <CRow>
                      <CCol md={6}>
                        <CFormLabel>Company Name</CFormLabel>
                        <AppFormSelect
                          value={formData.employment?.companyName || ''}
                          onChange={(e) =>
                            handleInputChange('employment', 'companyName', e.target.value)
                          }
                          disabled={true}
                        >
                          {companies.map((company) => (
                            <option key={company.value} value={company.value}>
                              {company.label}
                            </option>
                          ))}
                        </AppFormSelect>
                      </CCol>

                      <CCol md={6}>
                        <CFormLabel> Work Location</CFormLabel>
                        <CFormInput
                          value={formData.employment?.location || ''}
                          onChange={(e) =>
                            handleInputChange('employment', 'location', e.target.value)
                          }
                          disabled={true}
                          placeholder="Enter Work Location"
                        />
                      </CCol>
                    </CRow>
                    <CRow className="mt-3">
                      <CCol md={6}>
                        <CFormLabel>Onboarding Date</CFormLabel>
                        <CFormInput
                          type="date"
                          value={formData.employment?.onboardingDate || ''}
                          onChange={(e) =>
                            handleInputChange('employment', 'onboardingDate', e.target.value)
                          }
                          disabled={true}
                        />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>Joining Date</CFormLabel>
                        <CFormInput
                          type="date"
                          value={formData.employment?.joiningDate || ''}
                          onChange={(e) =>
                            handleInputChange('employment', 'joiningDate', e.target.value)
                          }
                          disabled={true}
                        />
                      </CCol>
                    </CRow>
                    {/* RA Location, RA Branch, and Group Information */}
                    <CRow className="mt-3">
                      {/* Show MA Branch if user has "MA Branch BM", "BM", or "SDM" role */}
                      {(hasBM || hasSDM) && (
                        <CCol md={6}>
                          <CFormLabel>MA Branch</CFormLabel>
                          <AppFormSelect
                            value={
                              Array.isArray(formData?.profile?.raBranch)
                                ? formData.profile.raBranch[0] || ''
                                : formData?.profile?.raBranch || formData?.personal?.raBranch || ''
                            }
                            onChange={(e) =>
                              handleInputChange('personal', 'raBranch', e.target.value)
                            }
                            disabled={true}
                          >
                            <option value="">Select MA Branch</option>
                            {locations.map((location) => (
                              <option key={location.value} value={location.value}>
                                {location.label}
                              </option>
                            ))}
                          </AppFormSelect>
                        </CCol>
                      )}

                      {/* Show Group if user has "Field Engineer (FE)", "FE", or "SDM" role */}
                      {(hasFE || hasSDM) && (
                        <CCol md={6}>
                          <CFormLabel>Group</CFormLabel>

                          <div className="d-flex flex-wrap gap-2 mt-1">
                            {(() => {
                              const groupIds = Array.isArray(formData?.profile?.group)
                                ? formData.profile.group
                                : formData?.personal?.group || []
                              
                              if (Array.isArray(groupIds) && groupIds.length > 0) {
                                return groupIds.map((grp, index) => {
                                  const groupId = typeof grp === 'string' ? grp : grp?._id || grp?.id || grp
                                  const label = groups.find((g) => g.value === groupId || g._id === groupId)?.label || groupId

                                  return (
                                    <span
                                      key={index}
                                      className="badge bg-primary text-white"
                                      style={{ fontSize: '0.85rem' }}
                                    >
                                      {label}
                                    </span>
                                  )
                                })
                              } else {
                                return <span className="text-muted">No group assigned</span>
                              }
                            })()}
                          </div>
                        </CCol>
                      )}
                    </CRow>
                    <CRow className="mt-3">
                      <CCol md={6}>
                        <CFormLabel>MA Location</CFormLabel>
                        <AppFormSelect
                          value={resolvedRaLocationValue}
                          onChange={(e) =>
                            handleInputChange('employment', 'raLocation', e.target.value)
                          }
                          disabled={!editMode.employment}
                        >
                          <option value="">Select MA Location</option>
                          {locations.map((location) => (
                            <option key={location.value} value={location.value}>
                              {location.label}
                            </option>
                          ))}
                        </AppFormSelect>
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>Holiday Calendar</CFormLabel>
                        <div
                          style={{
                            padding: '8px 12px',
                            border: '1px solid #ced4da',
                            borderRadius: '6px',
                            backgroundColor: '#f8f9fa',
                            minHeight: '38px',
                          }}
                        >
                          {(() => {
                            // Get assigned template IDs from formData
                            let assignedTemplateIds = []
                            
                            // Check both 'templates' and 'template' fields
                            const templatesField = formData?.employment?.templates || formData?.employment?.template
                            
                            if (Array.isArray(templatesField)) {
                              // Extract IDs - handle both string IDs and object IDs
                              assignedTemplateIds = templatesField.map((item) => {
                                if (typeof item === 'string') {
                                  return item
                                } else if (typeof item === 'object' && item !== null) {
                                  return item._id || item.id || String(item)
                                }
                                return String(item)
                              }).filter(Boolean)
                            } else if (templatesField) {
                              // Handle single value (not array)
                              assignedTemplateIds = [typeof templatesField === 'object' && templatesField !== null
                                ? (templatesField._id || templatesField.id || String(templatesField))
                                : String(templatesField)]
                            }
                            
                            // Filter templates to show only assigned ones
                            const assignedTemplates = templates.filter((template) => {
                              const templateId = String(template._id || template.id || '')
                              return assignedTemplateIds.some((id) => String(id) === templateId)
                            })
                            
                            if (assignedTemplates.length === 0) {
                              return <span className="text-muted">No holiday templates assigned</span>
                            }
                            
                            return (
                              <div className="d-flex flex-wrap gap-2">
                                {assignedTemplates.map((template) => (
                                  <span
                                    key={template._id || template.id}
                                    className="badge bg-primary text-white"
                                    style={{ fontSize: '0.85rem' }}
                                  >
                                    {template.name}
                                  </span>
                                ))}
                              </div>
                            )
                          })()}
                        </div>
                      </CCol>
                    </CRow>
                    <CRow className="mt-3">
                      <CCol md={6}>
                        <CFormLabel>CTC (Monthly)</CFormLabel>
                        <CInputGroup>
                          <CInputGroupText>₹</CInputGroupText>
                          <CFormInput
                            type="text"
                            value="******"
                            disabled={true}
                            placeholder="Enter CTC Per Month"
                            style={{ backgroundColor: '#f8f9fa', color: '#6c757d' }}
                          />
                        </CInputGroup>
                        <small className="text-muted">Salary information is confidential</small>
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>CTC in Words</CFormLabel>
                        <CFormInput
                          value="******"
                          disabled={true}
                          placeholder="Auto-filled from CTC amount"
                          style={{ backgroundColor: '#f8f9fa', color: '#6c757d' }}
                        />
                      </CCol>
                    </CRow>
                    <CRow className="mt-3">
                      <CCol md={6}>
                        <CFormLabel>HRA (Monthly)</CFormLabel>
                        <CInputGroup>
                          <CInputGroupText>₹</CInputGroupText>
                          <CFormInput
                            type="text"
                            value="******"
                            disabled={true}
                            placeholder="Enter HRA Per Month"
                            style={{ backgroundColor: '#f8f9fa', color: '#6c757d' }}
                          />
                        </CInputGroup>
                        <small className="text-muted">Salary information is confidential</small>
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>HRA in Words</CFormLabel>
                        <CFormInput
                          value="******"
                          disabled={true}
                          placeholder="Auto-filled from HRA amount"
                          style={{ backgroundColor: '#f8f9fa', color: '#6c757d' }}
                        />
                      </CCol>
                      {/* <CCol md={6}>
                        <CFormLabel>Employee Type</CFormLabel>
                        <AppFormSelect
                          value={formData.employment?.employeeType || ''}
                          onChange={(e) =>
                            handleInputChange('employment', 'employeeType', e.target.value)
                          }
                          disabled={true}
                        >
                          <option value="">Select Employee Type</option>
                          <option value="full-time">Full Time</option>
                          <option value="part-time">Part Time</option>
                          <option value="contract">Contract</option>
                          <option value="intern">Intern</option>
                        </AppFormSelect>
                      </CCol> */}
                    </CRow>

                    {/* Additional Employment Fields */}

                    {/* Additional Employment Fields */}
                    <CRow className="mt-3">
                      <CCol md={6}>
                        <CFormLabel>Work Type</CFormLabel>
                        <AppFormSelect
                          value={formData.employment?.workType || ''}
                          onChange={(e) =>
                            handleInputChange('employment', 'workType', e.target.value)
                          }
                          disabled={true}
                        >
                          <option value="">Select Work Type</option>
                          <option value="full-time">Full Time</option>
                          <option value="part-time">Part Time</option>
                          <option value="contract">Contract</option>
                          <option value="intern">Intern</option>
                        </AppFormSelect>
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>Shift</CFormLabel>
                        <AppFormSelect
                          value={formData.employment?.shift || ''}
                          onChange={(e) => handleInputChange('employment', 'shift', e.target.value)}
                          disabled={true}
                        >
                          <option value="">Select Shift</option>
                          <option value="day">Day</option>
                          <option value="night">Night</option>
                          <option value="evening">Evening</option>
                          <option value="rotating">Rotating</option>
                        </AppFormSelect>
                      </CCol>
                    </CRow>

                    <CRow className="mt-3">
                      <CCol md={6}>
                        <CFormLabel>Reporting Manager</CFormLabel>
                        <CFormInput
                          value={
                            formData.employment?.reportingManagerName ||
                            formData.employment?.reportingManager ||
                            ''
                          }
                          onChange={(e) =>
                            handleInputChange('employment', 'reportingManager', e.target.value)
                          }
                          disabled={true}
                          placeholder="Reporting Manager"
                        />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>Assets</CFormLabel>
                        <CFormInput
                          value={formData.employment?.remark || ''}
                          onChange={(e) =>
                            handleInputChange('employment', 'remark', e.target.value)
                          }
                          disabled={true}
                          placeholder="Assets"
                        />
                      </CCol>

                      <CCol md={6}>
                        <CFormCheck
                          type="checkbox"
                          id="core"
                          label="Core Employee"
                          checked={formData.employment?.core || false}
                          onChange={(e) =>
                            handleInputChange('employment', 'core', e.target.checked)
                          }
                          disabled={true}
                        />
                      </CCol>
                    </CRow>
                    <CRow className="mt-3">
                      <CCol md={6}>
                        <CFormLabel>leave Authority One</CFormLabel>
                        <CFormInput
                          value={
                            formData.employment?.leaveAuthorityOne_Name ||
                            formData.employment?.leaveAuthorityOne ||
                            ''
                          }
                          onChange={(e) =>
                            handleInputChange('employment', 'leaveAuthorityOne', e.target.value)
                          }
                          disabled={true}
                          placeholder="Leave Authority One"
                        />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>Leave Authority Two</CFormLabel>
                        <CFormInput
                          value={
                            formData.employment?.leaveAuthorityTwo_Name ||
                            formData.employment?.leaveAuthorityTwo ||
                            ''
                          }
                          onChange={(e) =>
                            handleInputChange('employment', 'leaveAuthorityTwo', e.target.value)
                          }
                          disabled={true}
                          placeholder="Leave Authority Two"
                        />
                      </CCol>
                    </CRow>

                    {/* Salary Information - Hidden for all users viewing own profile */}
                    <CRow className="mt-3">
                      <CCol xs={12}>
                        <h6 className="text-muted mb-3">Salary Information</h6>
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>CTC Per Month</CFormLabel>
                        <CInputGroup>
                          <CInputGroupText>₹</CInputGroupText>
                          <CFormInput
                            type="text"
                            value="******"
                            disabled={true}
                            placeholder="Enter CTC Per Month"
                            style={{ backgroundColor: '#f8f9fa', color: '#6c757d' }}
                          />
                        </CInputGroup>
                        <small className="text-muted">Salary information is confidential</small>
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>CTC Per Month (In Words)</CFormLabel>
                        <CFormInput
                          value="******"
                          disabled={true}
                          placeholder="Enter CTC in words"
                          style={{ backgroundColor: '#f8f9fa', color: '#6c757d' }}
                        />
                      </CCol>
                    </CRow>

                    <CRow className="mt-3">
                      <CCol md={6}>
                        <CFormLabel>HRA Per Month</CFormLabel>
                        <CInputGroup>
                          <CInputGroupText>₹</CInputGroupText>
                          <CFormInput
                            type="text"
                            value="******"
                            disabled={true}
                            placeholder="Enter HRA Per Month"
                            style={{ backgroundColor: '#f8f9fa', color: '#6c757d' }}
                          />
                        </CInputGroup>
                        <small className="text-muted">Salary information is confidential</small>
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>HRA (In Words)</CFormLabel>
                        <CFormInput
                          value="******"
                          disabled={true}
                          placeholder="Enter HRA in words"
                          style={{ backgroundColor: '#f8f9fa', color: '#6c757d' }}
                        />
                      </CCol>
                    </CRow>

                    {/* Save buttons removed - employment section is not editable */}
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
                    {canEditBank(editAttempts) && (
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
                    {!canEditBank(editAttempts) && (
                      <CButton
                        color="secondary"
                        variant="outline"
                        size="sm"
                        disabled
                        title="You can only edit your own bank details"
                      >
                        <CIcon icon={cilPencil} className="me-1" />
                        Edit (Not Available)
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
                          onChange={(e) => {
                            let value = e.target.value
                            value = value.replace(/\D/g, '')
                            handleInputChange('bank', 'accountNumber', value)
                          }}
                          maxLength={20}
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

            {/* Document Upload Section */}
            <DocumentUpload
              formData={profileData}
              editMode={editMode}
              canEditSection={canEditSection}
              canEditAttachments={canEditAttachments}
              handleEditToggle={handleEditToggle}
              handleSave={handleSave}
              handleCancel={handleCancel}
              handleAttachmentUpload={handleAttachmentUpload}
              handleDocumentUpload={handleDocumentUpload}
              editAttempts={editAttempts}
              attachments={attachments}
              isAC={false}
              isHR={false}
            />
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
          <CModalTitle>My Team / Authority</CModalTitle>
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
          border-color: #044f45;
          box-shadow: 0 0 0 4px rgba(4, 79, 69, 0.14);
          background: white;
        }

        .form-control:disabled {
          background: #f8f9fa;
          color: #6c757d;
          cursor: not-allowed;
        }

        .btn-outline-primary {
          border-color: #044f45;
          color: #044f45;
        }

        .btn-outline-primary:hover {
          background-color: #044f45;
          border-color: #044f45;
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

export default MyProfile
      
