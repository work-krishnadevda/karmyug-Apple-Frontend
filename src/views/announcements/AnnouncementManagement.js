import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CAlert,
  CSpinner,
  CBadge,
  CFormLabel,
  CContainer,
  CPopover,
  CListGroup,
  CListGroupItem,
} from '@coreui/react'

import AppFormSelect from 'src/components/form/AppFormSelect'
import AppContentSkeleton from 'src/components/custom/AppContentSkeleton'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart, faStar, faArrowUp, faCheck, faListCheck } from '@fortawesome/free-solid-svg-icons'

import CIcon from '@coreui/icons-react'
import { cilBell, cilPlus, cilPencil, cilTrash, cilSearch, cilFilter, cilPaperclip, cilPin } from '@coreui/icons'
import BasicProvider from 'src/constants/BasicProvider'
import { markAnnouncementAsRead } from 'src/helpers/announcementHelper'
import { useSelector } from 'react-redux'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import Select from 'react-select'
import Cookies from 'js-cookie'
import { selectProfileData } from 'src/store'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

let ADMIN = process.env.REACT_APP_ADMIN
let HR = process.env.REACT_APP_HR
let SFO = process.env.REACT_APP_SFO
let LCTO = process.env.REACT_APP_LCTO
let COO = process.env.REACT_APP_COO
let BM = process.env.REACT_APP_RA
let AC = process.env.REACT_APP_AC
const AnnouncementManagement = () => {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [viewModal, setViewModal] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [announcementToDelete, setAnnouncementToDelete] = useState(null)
  const [managers, setManagers] = useState([])
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterBranch, setFilterBranch] = useState('')
  const [userPriorities, setUserPriorities] = useState({})
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [locations, setLocations] = useState([]) 
  const [removedAttachments, setRemovedAttachments] = useState([])
  const [editingAnnouncement, setEditingAnnouncement] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    schedule_at: '',
    target_roles: [],
    staff: [],
    ra_location: [],
    attachments: [],
    newAttachments: [],
    existingAttachments: [],
  })
  const [alert, setAlert] = useState({ show: false, message: '', type: '' })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPriority, setFilterPriority] = useState('all')
  const [roles, setRoles] = useState([])
  const [defaultRoleOptions, setDefaultRoleOptions] = useState([])
  const loggedinUserRole = useSelector((state) => state?.userRole)
  const canCreateAnnouncements = 
    loggedinUserRole?.name === ADMIN || 
    loggedinUserRole?.name === HR || 
    loggedinUserRole?.name === SFO || 
    loggedinUserRole?.name === LCTO || 
    loggedinUserRole?.name === COO ||
    loggedinUserRole?.name === BM ||
    loggedinUserRole?.name === AC
  
  // Keep isAdminOrHR for backward compatibility in some checks
  const isAdminOrHR = canCreateAnnouncements
  
  // Check if user can see priority/todo section (HR, SFO, LCTO, COO, BM, AC but not ADMIN)
  const canSeePrioritySection = 
    loggedinUserRole?.name === HR || 
    loggedinUserRole?.name === SFO || 
    loggedinUserRole?.name === LCTO || 
    loggedinUserRole?.name === COO ||
    loggedinUserRole?.name === BM ||
    loggedinUserRole?.name === AC
  const profileData = useSelector(selectProfileData)
  const [signedUrls, setSignedUrls] = useState({})
  const [urlLoading, setUrlLoading] = useState({})
  const [creatorProfiles, setCreatorProfiles] = useState({}) // Store creator profiles by ID

  // Stats for dashboard summary
  const [stats, setStats] = useState({ total: 0, published: 0, scheduled: 0, draft: 0 })
  
  // Get current user info for filtering
  const staffId = Cookies.get('primery_user_id')
  const userRole = loggedinUserRole?.name
  
  // Priority (To-Do, My Leave, etc.) is per-user: each staff sees only their own selection
  const announcementPrioritiesKey = `announcement_priorities_${staffId || 'guest'}`
  
  // Helper function to check if user is ADMIN or HR (always see all announcements)
  const isAdminOrHROnly = loggedinUserRole?.name === ADMIN || loggedinUserRole?.name === HR
  
  // Helper function to check if user is other authorized role (SFO, LCTO, COO, BM, AC)
  const isOtherAuthorizedRole = 
    loggedinUserRole?.name === SFO || 
    loggedinUserRole?.name === LCTO || 
    loggedinUserRole?.name === COO ||
    loggedinUserRole?.name === BM ||
    loggedinUserRole?.name === AC
  
  // Helper function to check if current user is creator of announcement
  const isCreator = (announcement) => {
    if (!announcement || !staffId) return false
    const createdBy = announcement.created_by || announcement.createdBy
    if (!createdBy) return false
    
    // Handle both string ID and object with _id
    const creatorId = typeof createdBy === 'string' 
      ? createdBy 
      : (createdBy._id || createdBy.id || null)
    
    return creatorId && String(creatorId) === String(staffId)
  }
  
  // Only Admin, HR, or creator can delete an announcement
  const canDeleteAnnouncement = (announcement) =>
    isAdminOrHROnly || isCreator(announcement)
  
  // Allowed roles for creator filter dropdown (Admin/HR only): Admin, HR, SFO, LCTO, COO, BM, AC
  const creatorFilterRoleOptions = defaultRoleOptions.filter(
    (r) => r.value && [ADMIN, HR, SFO, LCTO, COO, BM, AC].includes(r.value)
  )

  // Helper: get creator's role name (for Admin/HR filter by "who created")
  const getCreatorRoleName = (announcement) => {
    if (!announcement) return null
    const createdBy = announcement.created_by || announcement.createdBy
    if (!createdBy) return null
    const creatorId = typeof createdBy === 'string'
      ? createdBy
      : (createdBy._id || createdBy.id || null)
    if (!creatorId) return null
    const creator = creatorProfiles[creatorId]
    if (!creator) return null
    // Profile can have user.role (array or single) or role (array or single)
    const roleObj = creator.user?.role || creator.role || creator.profile?.role
    if (!roleObj) return null
    const roleArr = Array.isArray(roleObj) ? roleObj : [roleObj]
    const first = roleArr[0]
    return first?.name || first?.display_name || null
  }
  
  const filteredForUser = announcements.filter((a) => {
    // Filter by priority
    if (priorityFilter !== 'all' && userPriorities[a._id] !== priorityFilter) {
      return false
    }
    
    // Filter by search term
    const matchSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.message.toLowerCase().includes(searchTerm.toLowerCase())
    if (!matchSearch) {
      return false
    }
    
    //  IMPORTANT: Hide scheduled announcements that haven't reached their time yet
    // Regular users should only see:
    // 1. Published announcements (is_published: true)
    // 2. Scheduled announcements where schedule_at time has passed
    const now = new Date()
    if (a.schedule_at) {
      const scheduleDate = new Date(a.schedule_at)
      // If scheduled time hasn't passed yet, don't show it to regular users
      if (scheduleDate > now) {
        return false
      }
    }
    
    // Only show published announcements to regular users
    if (!a.is_published) {
      return false
    }
    
    //  STAFF, ROLE & RA LOCATION TARGETING: Check if announcement is targeted to this user
    const hasStaffTargeting = a.staff && Array.isArray(a.staff) && a.staff.length > 0
    const hasRoleTargeting = a.target_roles && Array.isArray(a.target_roles) && a.target_roles.length > 0
    const hasLocationTargeting = a.ra_location && Array.isArray(a.ra_location) && a.ra_location.length > 0
    
    // If no targeting specified (all empty) → show to everyone
    if (!hasStaffTargeting && !hasRoleTargeting && !hasLocationTargeting) {
      return true
    }
    
        // Get user's RA location from profile
        const userRaLocation = profileData?.ra_location || 
                               profileData?.user?.ra_branch || 
                               profileData?.ra_branch || 
                               profileData?.location ||
                               null
        
        // Helper function to extract ID from location (handles both objects and strings)
        const extractLocationId = (loc) => {
          if (!loc) return null
          if (typeof loc === 'string') return loc
          if (typeof loc === 'object') {
            return loc.value || loc._id || loc.id || null
          }
          return null
        }
        
        // Convert user's location to array of IDs
        const userRaLocationIds = []
        if (Array.isArray(userRaLocation)) {
          userRaLocation.forEach((loc) => {
            const id = extractLocationId(loc)
            if (id) userRaLocationIds.push(String(id))
          })
        } else if (userRaLocation) {
          const id = extractLocationId(userRaLocation)
          if (id) userRaLocationIds.push(String(id))
        }
      
    
    // Check if user matches any of the targeting criteria
    let matchesLocation = false
    let matchesStaff = false
    let matchesRole = false
    
    // Check RA location targeting
    if (hasLocationTargeting) {
      matchesLocation = userRaLocationIds.some((userLocId) => {
        return a.ra_location.some((annLoc) => {
          return String(userLocId) === String(annLoc)
        })
      })
    }
    
    // Check staff targeting
    if (hasStaffTargeting) {
      matchesStaff = staffId && a.staff.includes(staffId)
    }
    
    // Check role targeting
    if (hasRoleTargeting) {
      matchesRole = userRole && a.target_roles.includes(userRole)
    }
    
    // User must match at least one targeting criteria if any targeting is specified
    return matchesLocation || matchesStaff || matchesRole
  })

  // Fetch announcements
  const fetchAnnouncements = async () => {
    setLoading(true)
    try {
      let response
      const staffId = Cookies.get(`primery_user_id`)
      if (!isAdminOrHR || isAdminOrHR) {
        response = await new BasicProvider('announcements/all').getRequest()
      } else {
        if (staffId) {
          response = await new BasicProvider(`announcements/staff/${staffId}`).getRequest()
        } else {
          response = await new BasicProvider(`announcements/published/${userRole}`).getRequest()
        }
      }

      const data = response.data || []

      const readData = JSON.parse(localStorage.getItem('announcement_read')) || {}
      const now = new Date()

      //  Filter out scheduled announcements that haven't reached their time yet
      // This is a frontend safety check - backend should also filter these
      const filteredData = data.filter((a) => {
        const currentStaffId = Cookies.get('primery_user_id')
        const currentUserRole = loggedinUserRole?.name
        
        // Helper function to check if current user is creator
        const checkIsCreator = (announcement) => {
          if (!announcement || !currentStaffId) return false
          const createdBy = announcement.created_by || announcement.createdBy
          if (!createdBy) return false
          const creatorId = typeof createdBy === 'string' 
            ? createdBy 
            : (createdBy._id || createdBy.id || null)
          return creatorId && String(creatorId) === String(currentStaffId)
        }
        
        // Helper function to extract ID from location (handles both objects and strings)
        const extractLocationId = (loc) => {
          if (!loc) return null
          if (typeof loc === 'string') return loc
          if (typeof loc === 'object') {
            return loc.value || loc._id || loc.id || null
          }
          return null
        }
        
        // Get user's RA location from profile (can be in different places)
        const userRaLocation = profileData?.ra_location || 
                               profileData?.user?.ra_branch || 
                               profileData?.ra_branch || 
                               null
        
        // Convert user's location to array of IDs
        const userRaLocationIds = []
        if (Array.isArray(userRaLocation)) {
          userRaLocation.forEach((loc) => {
            const id = extractLocationId(loc)
            if (id) userRaLocationIds.push(String(id))
          })
        } else if (userRaLocation) {
          const id = extractLocationId(userRaLocation)
          if (id) userRaLocationIds.push(String(id))
        }
        
        // Check targeting criteria
        const hasStaffTargeting = a.staff && Array.isArray(a.staff) && a.staff.length > 0
        const hasRoleTargeting = a.target_roles && Array.isArray(a.target_roles) && a.target_roles.length > 0
        const hasLocationTargeting = a.ra_location && Array.isArray(a.ra_location) && a.ra_location.length > 0
        
        // Check if user matches any of the targeting criteria
        let matchesLocation = false
        let matchesStaff = false
        let matchesRole = false
        
        // Check RA location targeting
        if (hasLocationTargeting) {
          matchesLocation = userRaLocationIds.some((userLocId) => {
            return a.ra_location.some((annLoc) => {
              return String(userLocId) === String(annLoc)
            })
          })
        }
        
        // Check staff targeting
        if (hasStaffTargeting) {
          matchesStaff = currentStaffId && a.staff.includes(currentStaffId)
        }
        
        // Check role targeting
        if (hasRoleTargeting) {
          matchesRole = currentUserRole && a.target_roles.includes(currentUserRole)
        }
        
        const isTargeted = matchesLocation || matchesStaff || matchesRole
        const isUserCreator = checkIsCreator(a)
        
        // RULE 1: ADMIN and HR can see ALL announcements (always visible)
        if (currentUserRole === ADMIN || currentUserRole === HR) {
          return true
        }
        
        // RULE 2: Other authorized roles (SFO, LCTO, COO, BM, AC) can see if:
        // - They are the creator, OR
        // - They are targeted
        if (currentUserRole === SFO || currentUserRole === LCTO || currentUserRole === COO || 
            currentUserRole === BM || currentUserRole === AC) {
          // If no targeting specified (all empty) → show to creator only
          if (!hasStaffTargeting && !hasRoleTargeting && !hasLocationTargeting) {
            return isUserCreator
          }
          // If targeting exists → show if creator OR targeted
          return isUserCreator || isTargeted
        }
        
        // RULE 3: Regular users should only see:
        // 1. Published announcements
        // 2. Scheduled announcements where time has passed
        // 3. Targeted announcements
        if (!a.is_published) return false
        
        if (a.schedule_at) {
          const scheduleDate = new Date(a.schedule_at)
          // Don't show if scheduled time hasn't passed yet
          if (scheduleDate > now) {
            return false
          }
        }
        
        // If no targeting specified (all empty) → show to everyone
        if (!hasStaffTargeting && !hasRoleTargeting && !hasLocationTargeting) {
          return true
        }
        
        // User must match at least one targeting criteria if any targeting is specified
        return isTargeted
      })

      const normalizedData = filteredData.map((a) => ({
        ...a,
        is_read: !!readData[a._id],
      }))

      setAnnouncements(normalizedData)

      // Count stats
      const total = data.length
      const published = data.filter((a) => a.is_published).length
      const scheduled = data.filter(
        (a) => new Date(a.schedule_at) > new Date() && a.is_published === false,
      ).length
      const draft = data.filter((a) => !a.is_published && !a.schedule_at).length
      setStats({ total, published, scheduled, draft })

      // Fetch creator profiles for all announcements
      await fetchCreatorProfiles(normalizedData)
    } catch (error) { 
      setAlert({
        show: true,
        message: 'Failed to fetch announcements',
        type: 'danger',
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch creator profiles for announcements
  const fetchCreatorProfiles = async (announcementsList) => {
    try {
      // Helper function to extract creator ID (handles both object and string)
      const getCreatorId = (createdBy) => {
        if (!createdBy) return null
        if (typeof createdBy === 'string') return createdBy
        if (typeof createdBy === 'object') {
          return createdBy._id || createdBy.id || null
        }
        return null
      }

      // Helper function to check if created_by is already populated
      const isPopulatedProfile = (createdBy) => {
        if (!createdBy || typeof createdBy !== 'object') return false
        return createdBy.name || createdBy.user?.name || createdBy.profile?.name
      }

      // Process announcements to get creator info
      const creatorInfoMap = {}
      announcementsList.forEach((a) => {
        const createdBy = a.created_by || a.createdBy
        if (!createdBy) return

        // If already populated, use it directly
        if (isPopulatedProfile(createdBy)) {
          const id = getCreatorId(createdBy)
          if (id) {
            creatorInfoMap[id] = createdBy
          }
        } else {
          // If it's just an ID, we need to fetch
          const id = getCreatorId(createdBy)
          if (id && !creatorInfoMap[id]) {
            creatorInfoMap[id] = null // Mark for fetching
          }
        }
      })

      // Get IDs that need to be fetched
      const idsToFetch = Object.keys(creatorInfoMap).filter(
        (id) => creatorInfoMap[id] === null
      )

      // Fetch profiles for IDs that need fetching
      const profilePromises = idsToFetch.map(async (creatorId) => {
        try {
          const response = await new BasicProvider(`profiles/${creatorId}`).getRequest()
          return { id: creatorId, profile: response.data }
        } catch (error) {
          console.error(`Failed to fetch profile for creator ${creatorId}:`, error)
          return { id: creatorId, profile: null }
        }
      })

      const fetchedProfiles = await Promise.all(profilePromises)
      
      // Merge fetched profiles with already populated ones
      const profilesMap = { ...creatorInfoMap }
      fetchedProfiles.forEach(({ id, profile }) => {
        if (profile) {
          profilesMap[id] = profile
        }
      })

      // Fallback for creators not in profiles (e.g. old admin): try admins/show API
      const missingIds = idsToFetch.filter((id) => !profilesMap[id])
      for (const creatorId of missingIds) {
        try {
          const response = await new BasicProvider(`admins/show/${creatorId}`).getRequest()
          const adminData = response?.data
          if (adminData && (adminData.name || adminData.user?.name)) {
            profilesMap[creatorId] = adminData
          }
        } catch (err) {
          console.error(`Failed to fetch admin for creator ${creatorId}:`, err)
        }
      }

      // Remove null entries
      Object.keys(profilesMap).forEach((key) => {
        if (!profilesMap[key]) {
          delete profilesMap[key]
        }
      })

      setCreatorProfiles((prev) => ({ ...prev, ...profilesMap }))
    } catch (error) {
      console.error('Error fetching creator profiles:', error)
    }
  }
  const fetchRoles = async () => {
    try {
      const response = await new BasicProvider('roles?page=1&count=100').getRequest()
      const roleOptions = response.data.data.map((role) => ({
        value: role.name,
        label: role.display_name,
        slug: role.name,
      }))
      setRoles([{ value: '', label: 'Select Role' }, ...roleOptions])
      setDefaultRoleOptions(roleOptions)
    } catch (error) { 
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

      const response = await new BasicProvider('admins?page=1&count=1000').getRequest()

      const staff = response.data.data || []
      // Only active staff/managers in dropdown (exclude inactive)
      const activeStaff = staff.filter(
        (manager) =>
          (manager.status || manager.user?.status || manager.adminStatus || 'active').toLowerCase() === 'active'
      )
      const managerOptions = activeStaff.map((manager) => ({
        value: manager._id,
        label: `${manager.name}`,
      }))
      setManagers(managerOptions)
    } catch (error) { 
      setManagers([{ value: '', label: 'Select Reporting Manager' }])
    }
  }

  const fetchSignedUrl = async (fileId, fileKey) => {
    if (!fileKey || urlLoading[fileId]) return
    setUrlLoading((prev) => ({ ...prev, [fileId]: true }))

    try {
      const response = await new BasicProvider(`cms/files/signed-url?key=${fileKey}`).getRequest()

      setSignedUrls((prev) => ({
        ...prev,
        [fileId]: response.data.url,
      }))
    } catch (error) { 
      setSignedUrls((prev) => ({ ...prev, [fileId]: 'error' }))
    } finally {
      setUrlLoading((prev) => ({ ...prev, [fileId]: false }))
    }
  }
  useEffect(() => {
    announcements.forEach((ann) => {
      if (ann.attachments?.length > 0) {
        ann.attachments.forEach((file) => {
          if (!signedUrls[file._id] && !urlLoading[file._id]) {
            fetchSignedUrl(file._id, file.filepath)
          }
        })
      }
    })
  }, [announcements])

  const isImageFile = (name = '') => /\.(jpe?g|png|gif|bmp|webp)$/i.test(name)
  const formatBytes = (bytes) => {
    if (!bytes) return ''
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`
  }
  // Fetch dynamic data functions
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

  useEffect(() => {
    fetchAnnouncements()
    fetchRoles()
    fetchManagers()
    fetchLocations()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.title || !formData.title.trim()) {
      toast.error('Please enter a title')
      return
    }
    
    // Check if message is empty or only contains whitespace/HTML tags
    const messageContent = formData.message ? formData.message.replace(/<[^>]*>/g, '').trim() : ''
    if (!messageContent) {
      toast.error('Please enter a message')
      return
    }
    
    // Show confirmation modal before submitting
    setShowConfirmModal(true)
  }

  // Actual submit function that gets called after confirmation
  const confirmAndSubmit = async () => {
    setShowConfirmModal(false)
    setLoading(true)

    try {
      const url = editingAnnouncement ? `announcements/${editingAnnouncement._id}` : `announcements`

      const method = editingAnnouncement ? 'putRequest' : 'postRequest'

      const fd = new FormData()

      // Send exactly what user entered - if empty, send empty
      fd.append('title', formData.title || '')
      fd.append('message', formData.message || '')
      
      // ============================================
      // SCHEDULING LOGIC - Two Scenarios:
      // ============================================
      // 1. SCHEDULED PUBLISHING: User selects future date/time
      //    → Send schedule_at with future date
      //    → Backend should set is_published: false
      //    → Announcement will be published when schedule_at time arrives
      //
      // 2. IMMEDIATE PUBLISHING: User leaves schedule_at empty
      //    → Don't send schedule_at field at all
      //    → Backend should set is_published: true
      //    → Announcement published immediately
      // ============================================
      
      if (formData.schedule_at && formData.schedule_at.trim() !== '') {
        // SCENARIO 1: SCHEDULED PUBLISHING
        const date = new Date(formData.schedule_at)
        
        // Validate that the date is valid
        if (isNaN(date.getTime())) {
          toast.error('Invalid schedule date selected')
          setLoading(false)
          return
        }
        
        // Check if scheduled date is in the past (only for new announcements)
        if (!editingAnnouncement) {
          const now = new Date()
          if (date <= now) {
            toast.error('Schedule date must be in the future')
            setLoading(false)
            return
          }
        }
        
        // Convert to ISO format and send to backend
        const scheduleDate = date.toISOString().split('.')[0] + 'Z'
        fd.append('schedule_at', scheduleDate)
        
      } else {
        // SCENARIO 2: IMMEDIATE PUBLISHING
        // Don't append schedule_at field at all
        // Backend will treat missing schedule_at as immediate publishing
        // IMPORTANT: Don't send empty string - backend validation rejects it
      }
      // Get user ID from profileData (not role ID)
      const userId = profileData?.user?._id || profileData?._id || Cookies.get('primery_user_id')
      if (userId) {
        fd.append('created_by', userId)
      }
      
      // Send arrays exactly as they are - if empty, explicitly send empty
      const targetRoles = formData.target_roles || []
      const staff = formData.staff || []
      const raLocation = formData.ra_location || []
      
      // If array has values, append them; if empty, explicitly append empty string to signal empty array
      if (targetRoles.length > 0) {
        targetRoles.forEach((r) => fd.append('target_roles[]', r))
      } else {
        fd.append('target_roles[]', '')
      }
      
      if (staff.length > 0) {
        staff.forEach((s) => fd.append('staff[]', s))
      } else {
        fd.append('staff[]', '')
      }
      
      if (raLocation.length > 0) {
        raLocation.forEach((b) => fd.append('ra_location[]', b))
      } else {
        fd.append('ra_location[]', '')
      }
      if (editingAnnouncement && removedAttachments?.length > 0) {
        removedAttachments.forEach((id) => fd.append('remove_attachments[]', id))
      }

      if (editingAnnouncement && formData.existingAttachments?.length > 0) {
        formData.existingAttachments
          .filter((att) => !removedAttachments.includes(att._id || att.key))
          .forEach((att) => fd.append('existing_attachments[]', att._id || att.key))
      }

      if (formData.newAttachments?.length) {
        formData.newAttachments.forEach((file) => {
          fd.append('attachments', file)
        })
      }

      await new BasicProvider(url)[method](fd)

      toast.success(editingAnnouncement ? 'Announcement Updated!' : 'Announcement Created!')

      setShowModal(false)
      setEditingAnnouncement(null)
      setFormData({
        title: '',
        message: '',
        schedule_at: '',
        target_roles: [],
        staff: [],
        ra_location: [],
        attachments: [],
        newAttachments: [],
        existingAttachments: [],
      })
      fetchAnnouncements()
    } catch (error) { 
      toast.error('Failed to save announcement')
    } finally {
      setLoading(false)
    }
  }

  // Edit

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement)
    // If BM is editing, clear target_roles and staff as they are not allowed
    const isBM = loggedinUserRole?.name === BM
    setFormData({
      title: announcement.title ? announcement.title.toUpperCase() : '',
      message: announcement.message,
      schedule_at: announcement.schedule_at || '',
      // target_roles: isBM ? [] : (announcement.target_roles || []),
      // staff: isBM ? [] : (announcement.staff || []),
      target_roles: announcement.target_roles || [],
      staff: announcement.staff || [],
      ra_location: announcement.ra_location || [],
      // attachments: announcement.attachments || [],
      attachments: [],
      existingAttachments: announcement.attachments || [],
    })
    setShowModal(true)
  }

  // Delete - Open confirmation modal
  const handleDelete = (id) => {
    setAnnouncementToDelete(id)
    setShowDeleteModal(true)
  }

  // Confirm and perform delete
  const confirmDelete = async () => {
    if (!announcementToDelete) return
    setLoading(true)
    setShowDeleteModal(false)
    try {
      await new BasicProvider(`announcements/${announcementToDelete}`).deleteRealRequest()
      toast.success('Announcement deleted successfully')
      setAnnouncementToDelete(null)
      fetchAnnouncements()
    } catch (error) {
      toast.error('Failed to delete announcement')
      setAnnouncementToDelete(null)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id) => {
    try {
      setAnnouncements((prev) => prev.map((a) => (a._id === id ? { ...a, is_read: true } : a)))

      const readData = JSON.parse(localStorage.getItem('announcement_read')) || {}
      readData[id] = true
      localStorage.setItem('announcement_read', JSON.stringify(readData))

      await markAnnouncementAsRead(id)
    } catch (error) {
      console.error(error)
    }
  }

  // Filter + Search
  const filteredAnnouncements = announcements.filter((a) => {
    const matchSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.message.toLowerCase().includes(searchTerm.toLowerCase())

    const matchStatus =
      filterPriority === 'all' ||
      (filterPriority === 'published' && a.is_published) ||
      (filterPriority === 'draft' && !a.is_published)

    // Date range filter: Check if announcement date falls between start and end date
    const matchDateRange = (() => {
      if (!filterStartDate && !filterEndDate) return true // No date filter applied
      
      const announcementDate = a.schedule_at ? new Date(a.schedule_at) : (a.createdAt ? new Date(a.createdAt) : null)
      if (!announcementDate) return false
      
      // Set time to start of day for accurate comparison
      announcementDate.setHours(0, 0, 0, 0)
      
      if (filterStartDate && filterEndDate) {
        // Both dates provided - check if announcement is within range
        const startDate = new Date(filterStartDate)
        startDate.setHours(0, 0, 0, 0)
        const endDate = new Date(filterEndDate)
        endDate.setHours(23, 59, 59, 999) // Include entire end date
        return announcementDate >= startDate && announcementDate <= endDate
      } else if (filterStartDate) {
        // Only start date provided - check if announcement is on or after start date
        const startDate = new Date(filterStartDate)
        startDate.setHours(0, 0, 0, 0)
        return announcementDate >= startDate
      } else if (filterEndDate) {
        // Only end date provided - check if announcement is on or before end date
        const endDate = new Date(filterEndDate)
        endDate.setHours(23, 59, 59, 999)
        return announcementDate <= endDate
      }
      
      return true
    })()

    // Role filter (Admin/HR only): filter by creator's role (e.g. COO ne kitne banaye, Admin ne kitne)
    const matchRole = !filterRole || getCreatorRoleName(a) === filterRole
    const matchBranch =
      !filterBranch ||
      (Array.isArray(a.ra_location) && a.ra_location.includes(filterBranch)) ||
      a.ra_location === filterBranch

    // Apply priority filter - now works for Admin/HR too
    let matchPriority = true
    if (priorityFilter !== 'all') {
      matchPriority = userPriorities[a._id] === priorityFilter
    }

    return matchSearch && matchStatus && matchDateRange && matchRole && matchBranch && matchPriority
  })
  useEffect(() => {
    const savedPriorities = JSON.parse(localStorage.getItem(announcementPrioritiesKey)) || {}
    const readData = JSON.parse(localStorage.getItem('announcement_read')) || {}

    setUserPriorities(savedPriorities)
    setAnnouncements((prev) => prev.map((a) => ({ ...a, is_read: !!readData[a._id] })))
  }, [announcementPrioritiesKey])
  // Summary counts based on applied filters (for Admin/HR cards)
  const now = new Date()
  const filteredStats = {
    total: filteredAnnouncements.length,
    published: filteredAnnouncements.filter((a) => a.is_published).length,
    scheduled: filteredAnnouncements.filter(
      (a) => a.schedule_at && new Date(a.schedule_at) > now && !a.is_published
    ).length,
  }

  // Calculate priority counts based on current view (admin view or user view)
  const announcementsForPriorityCount = isAdminOrHR ? filteredAnnouncements : filteredForUser
  const priorityCounts = {
    important: announcementsForPriorityCount.filter((a) => userPriorities[a._id] === 'important').length,
    starred: announcementsForPriorityCount.filter((a) => userPriorities[a._id] === 'starred').length,
    high: announcementsForPriorityCount.filter((a) => userPriorities[a._id] === 'high').length,
    todo: announcementsForPriorityCount.filter((a) => userPriorities[a._id] === 'todo').length,
    all: announcementsForPriorityCount.length,
  }

  const isNewAnnouncement = (date) => {
    if (!date) return false
    const created = new Date(date)
    if (isNaN(created.getTime())) return false

    const now = new Date()
    const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24))
    return diffDays <= 3
  }

  return (
    <CContainer fluid className="mt-4">
      {!isAdminOrHR && (
        <div className="mb-4 d-flex justify-content-end">
          <CPopover
            trigger="click"
            placement="bottom"
            content={
              <CListGroup style={{ minWidth: '300px' }}>
                {announcements.length === 0 ? (
                  <CListGroupItem>No announcements</CListGroupItem>
                ) : (
                  announcements.slice(0, 5).map((a) => (
                    <CListGroupItem
                      key={a._id}
                      action
                      onClick={() => {
                        setViewModal(a)
                        markAsRead(a._id)
                      }}
                      style={{
                        cursor: 'pointer',
                        fontWeight: a.is_read ? '400' : '600',
                        background: a.is_read ? '#fff' : '#f3f6ff',
                      }}
                    >
                      <strong>{a.title}</strong>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>
                        {new Date(a.schedule_at).toLocaleString()}
                      </div>
                    </CListGroupItem>
                  ))
                )}
              </CListGroup>
            }
          >
            <CButton color="light" className="position-relative">
              <CIcon icon={cilBell} size="lg" />
              {announcements.filter((a) => !a.is_read).length > 0 && (
                <CBadge color="danger" position="top-end" shape="rounded-pill">
                  {announcements.filter((a) => !a.is_read).length}
                </CBadge>
              )}
            </CButton>
          </CPopover>
        </div>
      )}

      <CRow>
        <CCol xs={12}>
          <CCard>
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">{isAdminOrHR ? 'Manage Announcements' : 'All Announcements'}</h4>
              {isAdminOrHR && (
                <CButton
                  color="primary"
                  onClick={() => {
                    setEditingAnnouncement(null)
                    setFormData({
                      title: '',
                      message: '',
                      schedule_at: '',
                      target_roles: [],
                      staff: [],
                      ra_location: [],
                      attachments: [],
                      newAttachments: [],
                      existingAttachments: [],
                    })
                    setRemovedAttachments([])
                    setShowModal(true)
                  }}
                >
                  <CIcon icon={cilPlus} className="me-1" />
                  Add New Announcement
                </CButton>
              )}
            </CCardHeader>

            <CCardBody>
              {alert.show && (
                <CAlert
                  color={alert.type}
                  dismissible
                  onClose={() => setAlert({ show: false })}
                  className="mb-3"
                >
                  {alert.message}
                </CAlert>
              )}

              {/* Admin Dashboard Summary - counts based on applied filters */}
              {isAdminOrHR && (
                <div className="mb-4 d-flex gap-3 flex-wrap">
                  <CBadge color="primary">Total: {filteredStats.total}</CBadge>
                  <CBadge color="success">Published: {filteredStats.published}</CBadge>
                  <CBadge color="warning">Scheduled: {filteredStats.scheduled}</CBadge>
                </div>
              )}

              {/* Priority filters - Show for all users including Admin/HR */}
              <div className="mb-3 d-flex gap-2 flex-wrap">
                {/* Function to render button */}
                {[
                  { key: 'all', label: 'All', icon: faListCheck, color: 'primary' },
                  {
                    key: 'important',
                    label: 'Important',
                    icon: faHeart,
                    color: 'danger',
                    className: 'priority-important',
                  },
                  {
                    key: 'starred',
                    label: 'Star Msg',

                    icon: faStar,
                    color: 'warning',
                    className: 'priority-starred',
                  },
                  {
                    key: 'high',
                    label: 'My Leave',
                    icon: faArrowUp,
                    color: 'info',
                    className: 'priority-high',
                  },
                  {
                    key: 'todo',
                    label: 'To-Do',
                    icon: faCheck,
                    color: 'success',
                    className: 'priority-todo',
                  },
                ].map((item) => {
                  const count = priorityCounts[item.key] || 0

                  return (
                    <CButton
                      key={item.key}
                      color={priorityFilter === item.key ? item.color : 'light'}
                      className={`d-flex align-items-center gap-1 filter-btn shadow-sm ${
                        priorityFilter === item.key ? item.className : ''
                      }`}
                      onClick={() => setPriorityFilter(item.key)}
                    >
                      <FontAwesomeIcon icon={item.icon} />
                      {item.label}

                      {item.key !== 'all' && count > 0 && (
                        <CBadge color={item.color} className="ms-1">
                          {count}
                        </CBadge>
                      )}
                    </CButton>
                  )
                })}
              </div>


                

              {/* Filters */}

                 <CRow className="mb-3 align-items-center">
                     <CCol md={2}>
                    <div className="input-group">
                      <span className="input-group-text">
                        <CIcon icon={cilSearch} />
                      </span>
                      <CFormInput
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </CCol>
              {isAdminOrHR && (
             <>
                  {/* Search Filter */}
             

                  {/* Status Filter */}
                  <CCol md={2}>
                    <AppFormSelect
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                    >
                      <option value="all">All</option>
                      <option value="published">Published</option>
                      <option value="draft">Scheduled</option>
                    </AppFormSelect>
                  </CCol>

                  {/* Date Range Filter - aligned in same line as other filters */}
                  <CCol md={4} className="d-flex align-items-center">
                    <div className="d-flex align-items-center gap-2 flex-nowrap w-100">
                      <CFormInput
                        type="date"
                        value={filterStartDate}
                        onChange={(e) => setFilterStartDate(e.target.value)}
                        max={filterEndDate || undefined}
                        title="From Date"
                        className="flex-grow-1"
                        style={{ minWidth: '130px' }}
                      />
                      <span className="small text-muted text-nowrap" style={{ lineHeight: '38px' }}>to</span>
                      <CFormInput
                        type="date"
                        value={filterEndDate}
                        onChange={(e) => setFilterEndDate(e.target.value)}
                        min={filterStartDate || undefined}
                        title="To Date"
                        className="flex-grow-1"
                        style={{ minWidth: '130px' }}
                      />
                    </div>
                  </CCol>
                  <CCol md={2}>
                    <AppFormSelect
                      value={filterBranch}
                      onChange={(e) => setFilterBranch(e.target.value)}
                    >
                      <option value="">All Locations</option>
                      {locations.map((branch) => (
                        <option key={branch.value} value={branch.value}>
                          {branch.label}
                        </option>
                      ))}
                    </AppFormSelect>
                  </CCol>
                  {/* Role Filter - Admin & HR only: Admin, HR, SFO, LCTO, COO, BM, AC */}
                  {isAdminOrHROnly && (
                    <CCol md={2}>
                      <AppFormSelect value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                        <option value="">All Roles (Creator)</option>
                        {creatorFilterRoleOptions.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </AppFormSelect>
                    </CCol>
                  )}
                  {/* Branch Filter */}

                  {/* Reset */}
                  <CCol md={2}>
                    <CButton
                      color="outline-secondary"
                      onClick={() => {
                        setSearchTerm('')
                        setFilterPriority('all')
                        setPriorityFilter('all')
                        setFilterStartDate('')
                        setFilterEndDate('')
                        setFilterRole('')
                        setFilterBranch('')
                      }}
                      className='mt-2'
                    >
                      <CIcon icon={cilFilter} className="me-1" />
                      Reset
                    </CButton>
                  </CCol>
                  </>
              )}
                </CRow>

              {!isAdminOrHR &&
                filteredForUser.map((a, index) => {
                  const isNew = (() => {
                    if (!a.schedule_at && !a.createdAt) return false
                    const date = new Date(a.schedule_at || a.createdAt)
                    if (isNaN(date.getTime())) return false

                    const now = new Date()
                    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
                    return diffDays <= 3
                  })()

                  return (
                    <CCard
                      key={a._id}
                      className="mb-4 shadow-sm border-0"
                      style={{
                        backgroundColor: a.is_read ? '#ffffff' : '#c1f7c6ff', // 💚 unread bg
                        borderLeft: a.is_read ? 'none' : '6px solid #393b3aff',
                        transition: '0.3s',
                        position: 'relative',
                        marginBottom: '1.5rem',
                        marginTop: index === 0 ? '1.5rem' : '0',
                      }}
                    >
                      {/* NEW Badge - Fixed Position Top-Left (Above Border) */}
                      {isNew && (
                        <CBadge
                          color="success"
                          style={{
                            position: 'absolute',
                            top: '-10px',
                            left: '-10px',
                            zIndex: 10,
                            fontSize: '0.7rem',
                            padding: '4px 8px',
                            fontWeight: 600,
                            borderRadius: '4px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          }}
                          className="d-none d-md-block"
                        >
                          NEW
                        </CBadge>
                      )}
                      {/* NEW Badge - Smaller for Mobile */}
                      {isNew && (
                        <CBadge
                          color="success"
                          style={{
                            position: 'absolute',
                            top: '-8px',
                            left: '-8px',
                            zIndex: 10,
                            fontSize: '0.55rem',
                            padding: '2px 5px',
                            fontWeight: 600,
                            borderRadius: '3px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          }}
                          className="d-md-none"
                        >
                          NEW
                        </CBadge>
                      )}
                      <CCardBody 
                        className="d-flex justify-content-between align-items-center"
                      >
                        {/* LEFT SIDE */}
                        <div style={{ flex: 1 }}>
                          <h6 className="fw-semibold mb-1">
                            {a.title}
                          </h6>
                          {(() => {
                            const createdBy = a.created_by || a.createdBy
                            // Extract creator ID (handles both object and string)
                            const getCreatorId = (createdBy) => {
                              if (!createdBy) return null
                              if (typeof createdBy === 'string') return createdBy
                              if (typeof createdBy === 'object') {
                                return createdBy._id || createdBy.id || null
                              }
                              return null
                            }
                            const creatorId = getCreatorId(createdBy)
                            const creator = creatorId ? creatorProfiles[creatorId] : null
                            const creatorName = creator?.name || 
                                              creator?.user?.name || 
                                              creator?.profile?.name ||
                                              'Unknown'
                            return (
                              <small className="text-muted d-flex align-items-center gap-1">
                                <CIcon icon={cilPencil} size="sm" />
                                <span>Created by: <strong>{creatorName}</strong></span>
                              </small>
                            )
                          })()}
                        </div>

                        {/* RIGHT SIDE */}
                        <div className="d-flex align-items-center gap-2">
                             {/* Attachment Indicator */}
                              {a.attachments && a.attachments.length > 0 && (
                              <CIcon 
                                icon={cilPaperclip} 
                                size="lg"
                                style={{ 
                                  color: '#0d6efd',
                                  cursor: 'pointer'
                                }}
                                title={`${a.attachments.length} attachment(s)`}
                              />
                            )}
                          <div className="text-end">
                            {(() => {
                              const now = new Date()
                              const scheduleDate = a.schedule_at ? new Date(a.schedule_at) : null
                              const isScheduled = scheduleDate && scheduleDate > now
                              
                              return (
                                <CBadge color={isScheduled ? 'warning' : (a.is_published ? 'success' : 'warning')}>
                                  {isScheduled ? 'Scheduled' : (a.is_published ? 'Published' : 'Scheduled')}
                                </CBadge>
                              )
                            })()}
                          </div>

                       

                          <div className="d-flex align-items-center gap-2">
                              {/* Priority select - Show for regular users and HR/SFO/LCTO/COO/BM */}
                              {(!isAdminOrHR || canSeePrioritySection) && (
                                <AppFormSelect
                                  size="sm"
                                  value={userPriorities[a._id] || 'none'}
                                  onChange={(e) => {
                                    const updated = { ...userPriorities, [a._id]: e.target.value }
                                    setUserPriorities(updated)
                                    localStorage.setItem(
                                      announcementPrioritiesKey,
                                      JSON.stringify(updated),
                                    )
                                  }}
                                >
                                  <option value="none">None</option>
                                  <option value="important">Important</option>
                                  <option value="starred">Star Msg</option>
                                  <option value="high">My Leave</option>
                                  <option value="todo">To-Do</option>
                                </AppFormSelect>
                              )}
                            <CButton
                              size="sm"
                              color="primary"
                              className=" d-flex align-items-center justify-content-center"
                              style={{ width: 50, height: 34 }}
                              onClick={() => {
                                setViewModal(a)
                                markAsRead(a._id)
                              }}
                            >
                            
                              view
                            </CButton>
                          
                          </div>
                        </div>
                      </CCardBody>
                    </CCard>
                  )
                })}

              {/* Announcements List */}
              {loading ? (
                <AppContentSkeleton
                  variant="cards"
                  cards={3}
                  ariaLabel="Loading announcement management content"
                />
              ) : (
                <>
                  {isAdminOrHR && filteredAnnouncements.length === 0 && (
                    <p className="text-center text-muted">No announcements available</p>
                  )}

                  {isAdminOrHR &&
                    filteredAnnouncements.map((a, index) => {
                      const isNew = isNewAnnouncement(a.schedule_at || a.createdAt)
                      return (
                      <CCard 
                        key={a._id} 
                        className="mb-4 shadow-sm"
                        style={{ 
                          position: 'relative',
                          marginBottom: '1.5rem',
                          marginTop: index === 0 ? '1.5rem' : '0',
                          backgroundColor: a.is_read ? '#ffffff' : '#c1f7c6ff', // 💚 unread bg
                          borderLeft: a.is_read ? 'none' : '6px solid #393b3aff',
                          transition: '0.3s',
                        }}
                      >
                        {/* NEW Badge - Fixed Position Top-Left (Above Border) */}
                        {isNew && (
                          <CBadge
                            color="info"
                            style={{
                              position: 'absolute',
                              top: '-10px',
                              left: '-10px',
                              zIndex: 10,
                              fontSize: '0.7rem',
                              padding: '4px 8px',
                              fontWeight: 600,
                              borderRadius: '4px',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            }}
                            className="d-none d-md-block"
                          >
                            NEW
                          </CBadge>
                        )}
                        {/* NEW Badge - Smaller for Mobile */}
                        {isNew && (
                          <CBadge
                            color="info"
                            style={{
                              position: 'absolute',
                              top: '-8px',
                              left: '-8px',
                              zIndex: 10,
                              fontSize: '0.55rem',
                              padding: '2px 5px',
                              fontWeight: 600,
                              borderRadius: '3px',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            }}
                            className="d-md-none"
                          >
                            NEW
                          </CBadge>
                        )}
                        <CCardBody>
                          <div className="d-flex justify-content-between align-items-start">
                            <div style={{ flex: 1 }}>
                              <h5 className="fw-bold mb-1">
                                {a.title}
                              </h5>

                              <small className="text-muted d-block mb-1">
                                {new Date(a.schedule_at).toLocaleString()}
                              </small>
                              {(() => {
                                const createdBy = a.created_by || a.createdBy
                                // Extract creator ID (handles both object and string)
                                const getCreatorId = (createdBy) => {
                                  if (!createdBy) return null
                                  if (typeof createdBy === 'string') return createdBy
                                  if (typeof createdBy === 'object') {
                                    return createdBy._id || createdBy.id || null
                                  }
                                  return null
                                }
                                const creatorId = getCreatorId(createdBy)
                                const creator = creatorId ? creatorProfiles[creatorId] : null
                                const creatorName = creator?.name || 
                                                  creator?.user?.name || 
                                                  creator?.profile?.name ||
                                                  'Unknown'
                                return (
                                  <small className="text-muted d-flex align-items-center gap-1">
                                    <CIcon icon={cilPencil} size="sm" />
                                    <span>Created by: <strong className="text-primary">{creatorName}</strong></span>
                                  </small>
                                )
                              })()}
                            </div>

                            <div className="text-end">
                              {/* Check if announcement is scheduled (has schedule_at in future) */}
                              {(() => {
                                const now = new Date()
                                const scheduleDate = a.schedule_at ? new Date(a.schedule_at) : null
                                const isScheduled = scheduleDate && scheduleDate > now
                                
                                return (
                                  <>
                                    <CBadge color={isScheduled ? 'warning' : (a.is_published ? 'success' : 'warning')}>
                                      {isScheduled ? 'Scheduled' : (a.is_published ? 'Published' : 'Scheduled')}
                                    </CBadge>

                                    {isScheduled && (
                                      <div className="text-warning small mt-1">
                                        Goes live in{' '}
                                        {Math.ceil((scheduleDate - now) / 60000)} mins
                                      </div>
                                    )}
                                  </>
                                )
                              })()}

                              <div className="mt-2 d-flex gap-2 align-items-center">
                                 {/* Attachment Indicator */}
                                 {a.attachments && a.attachments.length > 0 && (
                                  <CIcon 
                                    icon={cilPaperclip} 
                                    size="lg"
                                    style={{ 
                                      color: '#0d6efd',
                                      cursor: 'pointer',
                                      marginLeft: '4px'
                                    }}
                                    title={`${a.attachments.length} attachment(s)`}
                                  />
                                )}
                                {/* Priority select - Show for Admin/HR and other authorized roles */}
                                {isAdminOrHR && (
                                  <AppFormSelect
                                    size="sm"
                                    value={userPriorities[a._id] || 'none'}
                                    onChange={(e) => {
                                      const updated = { ...userPriorities, [a._id]: e.target.value }
                                      setUserPriorities(updated)
                                      localStorage.setItem(
                                        announcementPrioritiesKey,
                                        JSON.stringify(updated),
                                      )
                                    }}
                                    style={{ width: 'auto', minWidth: '120px' }}
                                  >
                                    <option value="none">None</option>
                                    <option value="important">Important</option>
                                    <option value="starred">Star Msg</option>
                                    <option value="high">My Leave</option>
                                    <option value="todo">To-Do</option>
                                  </AppFormSelect>
                                )}
                                <CButton
                                  size="sm"
                                  color="primary"
                                  onClick={() => {
                                    setViewModal(a)
                                    markAsRead(a._id)
                                  }}
                                >
                                 
                                  View
                                </CButton>
                               
                                {canDeleteAnnouncement(a) && (
                                  <CButton size="sm" color="info" onClick={() => handleEdit(a)}>
                                    <CIcon icon={cilPencil} />
                                  </CButton>
                                )}
                                {canDeleteAnnouncement(a) && (
                                  <CButton
                                    size="sm"
                                    color="danger"
                                    variant="outline"
                                    onClick={() => handleDelete(a._id)}
                                  >
                                    <CIcon icon={cilTrash} />
                                  </CButton>
                                )}
                              </div>
                            </div>
                          </div>
                        </CCardBody>
                      </CCard>
                      )
                    })}
                </>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* View Announcement Modal */}
      {viewModal && (
        <CModal visible={true} onClose={() => setViewModal(null)} alignment="center">
          <CModalHeader>
            <CModalTitle>{viewModal.title}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <div dangerouslySetInnerHTML={{ __html: viewModal.message }} />
          {/* Show all selected targeting: Target Roles, Staff/Managers, RA Location */}
          {(viewModal.target_roles?.length > 0 || viewModal.staff?.length > 0 || viewModal.ra_location?.length > 0) && (
            <div className="mt-3 p-3 bg-light rounded">
              <strong className="d-block mb-2">Targeting</strong>
              {viewModal.target_roles && viewModal.target_roles.length > 0 && (
                <p className="mb-2">
                  <strong>Target Roles:</strong>{' '}
                  {viewModal.target_roles
                    .map((r) =>
                      defaultRoleOptions.find((x) => x.value === r)?.label
                    )
                    .filter(Boolean)
                    .join(', ')}
                </p>
              )}
              {viewModal.staff && viewModal.staff.length > 0 && (
                <p className="mb-2">
                  <strong>Staff / Managers:</strong>{' '}
                  {viewModal.staff
                    .map((id) =>
                      managers.find((x) => x.value === id)?.label
                    )
                    .filter(Boolean)
                    .join(', ')}
                </p>
              )}
              {viewModal.ra_location && viewModal.ra_location.length > 0 && (
                <p className="mb-0">
                  <strong>MA Location:</strong>{' '}
                  {viewModal.ra_location
                    .map((locId) =>
                      locations.find((l) => l.value === locId || l.value === String(locId))?.label
                    )
                    .filter(Boolean)
                    .join(', ')}
                </p>
              )}
            </div>
          )}

            <p className="text-muted mt-3 small">
              Scheduled at: {new Date(viewModal.schedule_at).toLocaleString()}
            </p>
            {(() => {
              const createdBy = viewModal.created_by || viewModal.createdBy
              // Extract creator ID (handles both object and string)
              const getCreatorId = (createdBy) => {
                if (!createdBy) return null
                if (typeof createdBy === 'string') return createdBy
                if (typeof createdBy === 'object') {
                  return createdBy._id || createdBy.id || null
                }
                return null
              }
              const creatorId = getCreatorId(createdBy)
              const creator = creatorId ? creatorProfiles[creatorId] : null
              const creatorName = creator?.name || 
                                creator?.user?.name || 
                                creator?.profile?.name ||
                                'Unknown'
              return (
                <p className="text-muted mt-2 small d-flex align-items-center gap-2">
                  <CIcon icon={cilPencil} size="sm" />
                  <span><strong>Created by:</strong> {creatorName}</span>
                </p>
              )
            })()}
            {viewModal.attachments && viewModal.attachments.length > 0 && (
              <div className="mt-3">
                <strong>Attachments</strong>
                <CListGroup flush className="mt-2">
                  {viewModal.attachments.map((att) => {
                    const name = att.name || att.originalName || 'Attachment'
                    const url = signedUrls[att._id] || '#'
                    const img = isImageFile(name)
                    return (
                      <CListGroupItem
                        key={att._id || att.key}
                        className="d-flex align-items-center justify-content-between flex-column flex-sm-row gap-2"
                      >
                        <div className="d-flex align-items-center gap-3">
                          {img ? (
                            <img
                              src={url}
                              alt={name}
                              style={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 6 }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 56,
                                height: 40,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#f1f3fb',
                                borderRadius: 6,
                                color: '#0b1857',
                                fontWeight: 700,
                              }}
                            >
                              {name.split('.').pop()?.toUpperCase() || 'FILE'}
                            </div>
                          )}
                          <div>
                            <div className="fw-semibold">{name}</div>
                            {att.size && (
                              <small className="text-muted">{formatBytes(att.size)}</small>
                            )}
                          </div>
                        </div>

                        <div className="d-flex gap-2">
                          <CButton
                            size="sm"
                            color="info"
                            onClick={async () => {
                              // ensure latest signed url
                              if (!signedUrls[att._id] || signedUrls[att._id] === 'error') {
                                await fetchSignedUrl(att._id, att.filepath)
                              }
                              const finalUrl = signedUrls[att._id] || url
                              window.open(finalUrl, '_blank', 'noopener,noreferrer')
                            }}
                          >
                           View
                          </CButton>

                          <a href={url} download target="_blank" rel="noopener noreferrer">
                            <CButton size="sm" color="secondary">
                              Download
                            </CButton>
                          </a>
                        </div>
                      </CListGroupItem>
                    )
                  })}
                </CListGroup>
              </div>
            )}
          </CModalBody>
          <CModalFooter>
            {viewModal.announcement_type === 'leave_applied' && (
              <CButton
                color="primary"
                className="me-auto"
                onClick={() => {
                  setViewModal(null)
                  window.location.hash = '#/hrms/authority/leave/'
                }}
              >
                Teams Approvals
              </CButton>
            )}
            <CButton color="secondary" onClick={() => setViewModal(null)}>
              Close
            </CButton>
          </CModalFooter>
        </CModal>
      )}

      {/* Add/Edit Modal */}
      {isAdminOrHR && (
        <CModal visible={showModal} onClose={() => setShowModal(false)} size="lg">
          <CModalHeader>
            <CModalTitle>
              {editingAnnouncement ? 'Edit Announcement' : 'Add New Announcement'}
            </CModalTitle>
          </CModalHeader>

          <CForm onSubmit={handleSubmit} className="p-2">
            <CModalBody>
              <CRow className="g-3">
                {/* Title */}
                <CCol md={12}>
                  <CFormLabel>Title *</CFormLabel>
                  <CFormInput
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value.toUpperCase() })}
                    placeholder="Enter announcement title"
                    required
                    style={{ textTransform: 'uppercase' }}
                  />
                </CCol>

                {/* Message */}
                <CCol md={12}>
                  <CFormLabel>Message *</CFormLabel>
                  <div 
                    style={{ 
                      minHeight: '300px',
                      border: '1px solid #ced4da',
                      borderRadius: '0.375rem',
                      padding: '4px'
                    }}
                  >
                    <CKEditor
                      editor={ClassicEditor}
                      data={formData.message || ''}
                      onChange={(event, editor) => {
                        const data = editor.getData()
                        setFormData({ ...formData, message: data })
                      }}
                      config={{
                        placeholder: 'Enter announcement message...',
                      }}
                    />
                  </div>
                  <small className="text-muted">
                    {formData.message && formData.message.replace(/<[^>]*>/g, '').trim()
                      ? `${formData.message.replace(/<[^>]*>/g, '').trim().length} characters`
                      : 'Message is required'}
                  </small>
                </CCol>

                {/* Target Roles */} 
                  <CCol md={6}>
                    <label style={{ fontWeight: 600 }}>Target Roles</label>
                    <Select
                      isMulti
                      options={defaultRoleOptions.map((r) => ({
                        value: r.value,
                        label: r.label,
                      }))}
                      value={defaultRoleOptions.filter((r) =>
                        (formData.target_roles || []).includes(r.value),
                      )}
                      onChange={(selected) =>
                        setFormData({
                          ...formData,
                          target_roles: selected ? selected.map((s) => s.value) : [],
                        })
                      }
                      placeholder="Select one or more roles"
                      styles={{
                        control: (base) => ({
                          ...base,
                          padding: '4px',
                          borderRadius: '8px',
                          borderColor: '#0b1857',
                          boxShadow: 'none',
                          fontSize: 14,
                        }),
                        multiValue: (base) => ({
                          ...base,
                          backgroundColor: '#0b1857',
                          color: 'white',
                          borderRadius: '6px',
                        }),
                        multiValueLabel: (base) => ({
                          ...base,
                          color: 'white',
                          fontWeight: 500,
                        }),
                        multiValueRemove: (base) => ({
                          ...base,
                          color: 'white',
                          ':hover': { backgroundColor: '#ff4d4f', color: 'white' },
                        }),
                      }}
                    />
                  </CCol>
              
                {/* Staff (Managers) */} 
                  <CCol md={6}>
                    <label style={{ fontWeight: 600 }}>Staff / Managers</label>
                    <Select
                      isMulti
                      options={managers.map((m) => ({
                        value: m.value,
                        label: m.label,
                      }))}
                      value={managers.filter((m) => (formData.staff || []).includes(m.value))}
                      onChange={(selected) =>
                        setFormData({
                          ...formData,
                          staff: selected ? selected.map((s) => s.value) : [],
                        })
                      }
                      placeholder="Select one or more staff"
                    styles={{
                      control: (base) => ({
                        ...base,
                        padding: '4px',
                        borderRadius: '8px',
                        borderColor: '#0b1857',
                        boxShadow: 'none',
                        fontSize: 14,
                      }),
                      multiValue: (base) => ({
                        ...base,
                        backgroundColor: '#0b1857',
                        color: 'white',
                        borderRadius: '6px',
                      }),
                      multiValueLabel: (base) => ({
                        ...base,
                        color: 'white',
                        fontWeight: 500,
                      }),
                      multiValueRemove: (base) => ({
                        ...base,
                        color: 'white',
                        ':hover': { backgroundColor: '#ff4d4f', color: 'white' },
                      }),
                    }}
                  />
                  </CCol>
               

                {/* Schedule Date */}
                <CCol md={6}>
                  <CFormLabel>Schedule Date & Time</CFormLabel>
                  <CFormInput
                    type="datetime-local"
                    value={
                      formData.schedule_at
                        ? (() => {
                            // Convert UTC/ISO date to local datetime-local format
                            // datetime-local expects format: YYYY-MM-DDTHH:mm (local time)
                            const date = new Date(formData.schedule_at)

                            // Get local date/time components (not UTC)
                            const year = date.getFullYear()
                            const month = String(date.getMonth() + 1).padStart(2, '0')
                            const day = String(date.getDate()).padStart(2, '0')
                            const hours = String(date.getHours()).padStart(2, '0')
                            const minutes = String(date.getMinutes()).padStart(2, '0')

                            return `${year}-${month}-${day}T${hours}:${minutes}`
                          })()
                        : ''
                    }
                    onChange={(e) => {
                      const val = e.target.value
                      if (val) {
                        // datetime-local input gives us local time string (YYYY-MM-DDTHH:mm)
                        // We need to treat this as the user's intended local time
                        // Create date from local time string - browser treats it as local time
                        const localDate = new Date(val)
                        
                        // Check if the date is valid and in the future
                        if (isNaN(localDate.getTime())) {
                          toast.error('Invalid date selected')
                          return
                        }
                        
                        // Store as ISO string - this will convert to UTC
                        // The backend should compare this UTC time with current UTC time
                        setFormData({ ...formData, schedule_at: localDate.toISOString() })
                      } else {
                        setFormData({ ...formData, schedule_at: '' })
                      }
                    }}
                  />
                  <div className="form-text">Leave empty for immediate publishing</div>
                </CCol>

                  {/* RA Location Selection */}
                  <CCol md={6}>
                    <label style={{ fontWeight: 600 }}>RA Location</label>
                    <Select
                      isMulti
                      options={locations.map((location) => ({
                        value: location.value,
                        label: location.label,
                      }))}
                      value={locations.filter((b) => (formData.ra_location || []).includes(b.value))}
                      onChange={(selected) =>
                        setFormData({
                          ...formData,
                          ra_location: selected ? selected.map((s) => s.value) : [],
                        })
                      }
                      placeholder="Select one or more locations"
                    styles={{
                      control: (base) => ({
                        ...base,
                        padding: '4px',
                        borderRadius: '8px',
                        borderColor: '#0b1857',
                        boxShadow: 'none',
                        fontSize: 14,
                      }),
                      multiValue: (base) => ({
                        ...base,
                        backgroundColor: '#0b1857',
                        color: 'white',
                        borderRadius: '6px',
                      }),
                      multiValueLabel: (base) => ({
                        ...base,
                        color: 'white',
                        fontWeight: 500,
                      }),
                      multiValueRemove: (base) => ({
                        ...base,
                        color: 'white',
                        ':hover': { backgroundColor: '#ff4d4f', color: 'white' },
                      }),
                    }}
                  />
                </CCol>
                {/* Attachment Upload */}
                <CCol md={6}>
                  <CFormLabel>Attachments</CFormLabel>
                  <CFormInput
                    type="file"
                    multiple
                    accept="*/*"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || [])
                      setFormData((prev) => ({
                        ...prev,
                        newAttachments: [...(prev.newAttachments || []), ...files],
                      }))
                    }}
                  />
                  <div className="form-text">Upload one or more files (optional)</div>
                  {formData.newAttachments && formData.newAttachments.length > 0 && (
                    <div className="mt-2">
                      <small>
                        <strong>Files to upload: {formData.newAttachments.length}</strong>
                        {formData.newAttachments.map((file, idx) => (
                          <div
                            key={idx}
                            className="d-flex justify-content-between align-items-center"
                          >
                            <span>📎 {file.name}</span>
                            <CButton
                              size="sm"
                              color="danger"
                              variant="outline"
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  newAttachments: prev.newAttachments.filter((_, i) => i !== idx),
                                }))
                              }}
                            >
                              Remove
                            </CButton>
                          </div>
                        ))}
                      </small>
                    </div>
                  )}
                </CCol>
              </CRow>
              <CCol md={6}>
                {formData.existingAttachments && formData.existingAttachments.length > 0 && (
                  <div className="mb-2">
                    <label className="fw-semibold d-block mb-2">Existing attachments</label>
                    <CListGroup flush>
                      {formData.existingAttachments.map((att) => {
                        const name = att.name || att.originalName || 'Attachment'
                        const url = signedUrls[att._id] || '#'
                        const img = isImageFile(name)
                        const key = att._id || att.key
                        const removed = removedAttachments.includes(key)

                        return (
                          <CListGroupItem
                            key={key}
                            className="d-flex align-items-center justify-content-between flex-column flex-sm-row gap-2"
                          >
                            <div className="d-flex align-items-center gap-3">
                              {img ? (
                                <img
                                  src={url}
                                  alt={name}
                                  style={{
                                    width: 56,
                                    height: 40,
                                    objectFit: 'cover',
                                    borderRadius: 6,
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: 56,
                                    height: 40,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: '#f1f3fb',
                                    borderRadius: 6,
                                    color: '#0b1857',
                                    fontWeight: 700,
                                  }}
                                >
                                  {name.split('.').pop()?.toUpperCase() || 'FILE'}
                                </div>
                              )}
                              <div>
                                <div className="fw-semibold">{name}</div>
                                {att.size && (
                                  <small className="text-muted">{formatBytes(att.size)}</small>
                                )}
                              </div>
                            </div>

                            <div className="d-flex gap-2">
                              <CButton
                                size="sm"
                                color="info"
                                onClick={async () => {
                                  // ensure latest signed url
                                  if (!signedUrls[att._id] || signedUrls[att._id] === 'error') {
                                    await fetchSignedUrl(att._id, att.filepath)
                                  }
                                  const finalUrl = signedUrls[att._id] || url
                                  window.open(finalUrl, '_blank', 'noopener,noreferrer')
                                }}
                                disabled={removed}
                              >
                                <CIcon icon="cil-eye" /> &nbsp;View
                              </CButton>

                              <a href={url} download target="_blank" rel="noopener noreferrer">
                                <CButton size="sm" color="secondary" disabled={removed}>
                                  Download
                                </CButton>
                              </a>

                              <CButton
                                size="sm"
                                color={removed ? 'secondary' : 'danger'}
                                onClick={() => {
                                  if (removed) {
                                    setRemovedAttachments((prev) => prev.filter((x) => x !== key))
                                    // restore in UI
                                    setFormData((prev) => ({
                                      ...prev,
                                      existingAttachments: prev.existingAttachments
                                        ? [...prev.existingAttachments, att]
                                        : [att],
                                    }))
                                  } else {
                                    setRemovedAttachments((prev) => [...prev, key])
                                    setFormData((prev) => ({
                                      ...prev,
                                      existingAttachments: prev.existingAttachments
                                        ? prev.existingAttachments.filter(
                                            (x) => (x._id || x.key) !== key,
                                          )
                                        : [],
                                    }))
                                  }
                                }}
                              >
                                {removed ? 'Undo' : 'Remove'}
                              </CButton>
                            </div>
                          </CListGroupItem>
                        )
                      })}
                    </CListGroup>
                  </div>
                )}
              </CCol>
            </CModalBody>

            <CModalFooter>
              <CButton
                color="secondary"
                onClick={() => {
                  setShowModal(false)
                  setFormData({
                    title: '',
                    message: '',
                    schedule_at: '',
                    target_roles: [],
                    staff: [],
                    ra_location: [],
                    attachments: [],
                    newAttachments: [],
                    existingAttachments: [],
                  })
      setRemovedAttachments([])
      setEditingAnnouncement(null)
                }}
              >
                Cancel
              </CButton>
              <CButton color="primary" type="submit" disabled={loading}>
                {loading ? <CSpinner size="sm" /> : 'Save'}
              </CButton>
            </CModalFooter>
          </CForm>
        </CModal>
      )}

      {/* Confirmation Modal */}
      <CModal 
        visible={showConfirmModal} 
        onClose={() => setShowConfirmModal(false)} 
        alignment="center"
        backdrop="static"
        className="confirm-announcement-modal"
      >
        <CModalHeader>
          <CModalTitle>
            {editingAnnouncement ? 'Confirm Update' : 'Confirm Create'}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <p className="mb-2">
              <strong>Are you sure you want to {editingAnnouncement ? 'update' : 'create'} this announcement?</strong>
            </p>
            <div className="mt-3 p-3 bg-light rounded announcement-summary-box">
              <div className="mb-2">
                <strong>Title:</strong> {formData.title}
              </div>
              {formData.schedule_at && formData.schedule_at.trim() !== '' && (
                <div className="mb-2">
                  <strong>Scheduled At:</strong>{' '}
                  {new Date(formData.schedule_at).toLocaleString()}
                </div>
              )}
              {!formData.schedule_at || formData.schedule_at.trim() === '' ? (
                <div className="mb-2 text-info">
                  <strong>Publishing:</strong> Immediately
                </div>
              ) : (
                <div className="mb-2 text-warning">
                  <strong>Publishing:</strong> Scheduled
                </div>
              )}
              {(formData.target_roles?.length > 0 || formData.staff?.length > 0 || formData.ra_location?.length > 0) && (
                <div className="mt-2">
                  <strong>Targeting:</strong>
                  <ul className="mb-0 mt-2 ps-3">
                    {formData.target_roles?.length > 0 && (
                      <li>
                        <strong>Roles:</strong>{' '}
                        {formData.target_roles
                          .map((r) => defaultRoleOptions.find((x) => x.value === r)?.label)
                          .filter(Boolean)
                          .join(', ') || 'N/A'}
                      </li>
                    )}
                    {formData.staff?.length > 0 && (
                      <li>
                        <strong>Staff:</strong> {formData.staff.length} selected
                      </li>
                    )}
                    {formData.ra_location?.length > 0 && (
                      <li>
                        <strong>MA Locations:</strong>{' '}
                        {formData.ra_location
                          .map((locId) => {
                            const loc = locations.find((l) => l.value === locId)
                            return loc ? loc.label : locId
                          })
                          .filter(Boolean)
                          .join(', ')}
                      </li>
                    )}
                  </ul>
                </div>
              )}
              {(!formData.target_roles?.length && !formData.staff?.length && !formData.ra_location?.length) && (
                <div className="mt-2 text-muted">
                  <small>This announcement will be visible to everyone</small>
                </div>
              )}
            </div>
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton 
            color="secondary" 
            onClick={() => setShowConfirmModal(false)}
            disabled={loading}
          >
            Cancel
          </CButton>
          <CButton 
            color="primary" 
            onClick={confirmAndSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <CSpinner size="sm" className="me-2" />
                {editingAnnouncement ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              editingAnnouncement ? 'Yes, Update' : 'Yes, Create'
            )}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Delete Confirmation Modal */}
      <CModal 
        visible={showDeleteModal} 
        onClose={() => {
          setShowDeleteModal(false)
          setAnnouncementToDelete(null)
        }} 
        alignment="center"
        backdrop="static"
      >
        <CModalHeader>
          <CModalTitle>Delete Announcement</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p className="mb-0">
            <strong>Do you want to delete this announcement?</strong>
          </p>
          <p className="text-muted mt-2 small">
            This action cannot be undone.
          </p>
        </CModalBody>
        <CModalFooter>
          <CButton 
            color="secondary" 
            onClick={() => {
              setShowDeleteModal(false)
              setAnnouncementToDelete(null)
            }}
            disabled={loading}
          >
            Cancel
          </CButton>
          <CButton 
            color="danger" 
            onClick={confirmDelete}
            disabled={loading}
          >
            {loading ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              'Yes, Delete'
            )}
          </CButton>
        </CModalFooter>
      </CModal>

      <style jsx>{`
        .priority-important {
          background: #e60023 !important;
          color: #fff !important;
        }
        .priority-star {
          background: #f7c600 !important;
          color: #fff !important;
        }
        .priority-high {
          background: #008bff !important;
          color: #fff !important;
        }
        .priority-todo {
          background: #2ecc71 !important;
          color: #fff !important;
        }
        .active-filter {
          transform: scale(1.05);
          transition: 0.2s;
        }
        :global(.confirm-announcement-modal .modal-content) {
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.3),
            0 10px 30px rgba(0, 0, 0, 0.2),
            0 0 0 1px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.6) !important;
          border: none !important;
          border-radius: 12px !important;
          transform: translateY(0);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        :global(.confirm-announcement-modal .modal-dialog) {
          transform: scale(1) !important;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        :global(.confirm-announcement-modal.show .modal-dialog) {
          transform: scale(1) !important;
        }
        :global(.confirm-announcement-modal .modal-header) {
          border-bottom: 1px solid rgba(0, 0, 0, 0.08) !important;
          border-radius: 12px 12px 0 0 !important;
          background: linear-gradient(to bottom, #ffffff, #f8f9fa) !important;
        }
        :global(.confirm-announcement-modal .modal-footer) {
          border-top: 1px solid rgba(0, 0, 0, 0.08) !important;
          border-radius: 0 0 12px 12px !important;
          background: #f8f9fa !important;
        }
        .announcement-summary-box {
          box-shadow: 
            0 2px 8px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.9) !important;
          border: 1px solid rgba(0, 0, 0, 0.06) !important;
          background: linear-gradient(to bottom, #ffffff, #f8f9fa) !important;
        }
      `}</style>
    </CContainer>
  )
}

export default AnnouncementManagement
