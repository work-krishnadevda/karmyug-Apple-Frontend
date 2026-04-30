import { configureStore } from '@reduxjs/toolkit'
import Cookies from 'js-cookie'

const initialState = {
  sidebarShow: true,
  userData: '',
  userRole: '',
  filter: false,
  data: [],
  profilePicture: null,
  // ==================== OFFER / PUBLISH-OFFER STATE ====================
  // Centralised offer configuration so UI works without API for now,
  // and can be hydrated from backend later.
  offers: [
    // Example shape (kept empty by default):
    // {
    //   id: 'offer-1',
    //   title: 'WELCOME BONUS',
    //   description: 'Get extra incentives this month...',
    //   imageUrl: 'https://...',
    //   startDate: '2026-02-27T09:00:00.000Z',
    //   endDate: '2026-03-05T18:30:00.000Z',
    //   priority: 'high', // 'high' | 'normal'
    //   createdByRole: 'ADMIN', // optional
    //   createdAt: '2026-02-27T08:55:00.000Z',
    // },
  ],
  offerPopup: {
    lastPunchInAt: null, // timestamp (ms) of last successful punch-in
    isVisible: false, // whether popup modal is currently open
    activeOfferIndex: 0, // which offer is currently shown in carousel
    dismissedOfferIds: [], // offers user has closed for current session
    // Before first punch: show active offers first, then allow punch-in modal
    blockPunchModalForOffer: false, // when true, AppHeader/HRMS must not open PunchInModal
    prePunchSequenceCompleted: false, // true after login gating is resolved (or skipped for admin/HR)
  },
  punchInStatus: {
    isOnline: false,
    showToggle: false,
    showModal: false,
    canPunchIn: true,
    punchInDisabledReason: null,
  },
  // Profile Data Structure (Based on actual API response)
  profileData: {
    // Basic Profile Info
    _id: null,
    user: {
      _id: null,
      name: '',
      email: '',
      mobile: '',
      address: '',
      gender: '',
      role: [],
      permission: [],
      group: [],
      ra_branch: [],
      status: 'active',
      deleted_at: null,
      created_at: '',
      updated_at: '',
    },

    // Personal Information
    dob: '',
    father_name: '',
    mother_name: '',
    physically_challenged: false,
    physically_challenged_reason: '',
    marital_status: '',
    blood_group: '',

    // Address Information
    current_address: {
      address_line: '',
      village: '',
      block: '',
      district: '',
      state: '',
      country: '',
      pincode: '',
      _id: null,
    },
    permanent_address: {
      address_line: '',
      village: '',
      block: '',
      district: '',
      state: '',
      country: '',
      pincode: '',
      _id: null,
    },

    // Professional Information
    designation: '',
    department: '',
    reporting_manager: '',
    reporting_manager_id: '',
    leaveAuthorityOne: '',
    leaveAuthorityTwo: '',
    leaveAuthorityOne_Name: '',
    leaveAuthorityTwo_Name: '',
    employee_id: '',
    employee_type: '',
    core: '',
    company_name: '',
    work_type: '',
    shift: '',
    location: '',
    ra_location: '',
    onboarding_date: '',
    joining_date: '',
    reference_by: '',

    // Salary Information
    ctc_per_month: 0,
    ctc_per_month_in_words: '',
    hra_per_month: 0,
    hra_in_words: '',
    basic_per_month: 0,

    // Bank Information
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    branch_name: '',
    bank_edit_locked: false,

    // Education & Skills
    qualification: '',
    last_occupation: '',
    skills: [],
    certifications: [],

    // Identity Documents
    aadhar_no: '',
    pan_no: '',

    // Emergency Contacts
    emergency_contact1: {
      name: '',
      relation: '',
      phone: '',
      _id: null,
    },
    emergency_contact2: {
      name: '',
      relation: '',
      phone: '',
      _id: null,
    },
    emergency_contact3: {
      name: '',
      relation: '',
      phone: '',
      _id: null,
    },

    // Document Management
    document_edit_locked: false,
    welcome_letter: false,
    offer_letter: false,

    // Auto Punchout Settings
    auto_punchout_settings: {
      enabled: true,
      inactivity_timeout_ms: 1800000,
      timezone: 'Asia/Kolkata',
      working_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      notify_before_punchout: false,
      _id: null,
    },

    // Today Done Settings
    today_done_settings: {
      enabled: false,
      days: {
        sunday: { enabled: false },
        monday: { enabled: false },
        tuesday: { enabled: false },
        wednesday: { enabled: false },
        thursday: { enabled: false },
        friday: { enabled: false },
        saturday: { enabled: false },
      },
    },

    // Additional Data
    documents: [],
    work_experience: [],

    // System Fields
    createdAt: '',
    updatedAt: '',
    __v: 0,
  },
  // Profile Loading States
  profileLoading: {
    isLoading: false,
    isUpdating: false,
    isUploading: false,
    isChangingPassword: false,
    isDeleting: false,
  },
  // Profile Error States
  profileErrors: {
    error: null,
    updateError: null,
    uploadError: null,
    passwordError: null,
    deleteError: null,
  },
  // Profile Success States
  profileSuccess: {
    updateSuccess: false,
    uploadSuccess: false,
    passwordSuccess: false,
    deleteSuccess: false,
  },
}

const changeState = (state = initialState, { type, ...rest }) => {
  switch (type) {
    case 'set':
      //  Merge instead of overwriting punchInStatus accidentally
      return {
        ...state,
        ...rest,
        punchInStatus:
          rest.punchInStatus && Object.keys(rest.punchInStatus).length
            ? { ...state.punchInStatus, ...rest.punchInStatus }
            : state.punchInStatus,
      }

    case 'setUserData':
      return { ...state, ...rest }
    case 'setUserRole':
      return { ...state, ...rest }

    // Replace entire offers array (used when loading from backend).
    case 'setOffers':
      return {
        ...state,
        offers: Array.isArray(rest.offers) ? rest.offers : [],
      }

    // ==================== OFFER / PUBLISH-OFFER REDUCERS ====================
    case 'addOffer': {
      const o = rest.offer || {}
      const newOffer = {
        id: o.id || `offer-${Date.now()}`,
        title: o.title || '',
        description: o.description || '',
        imageUrl: o.imageUrl || '',
        startDate: o.startDate || '',
        endDate: o.endDate || '',
        priority: o.priority === 'high' ? 'high' : 'normal',
        status: o.status || 'active',
        bannerFileKey: o.bannerFileKey || o.banner_file_key || '',
        bannerFileName: o.bannerFileName || o.banner_file_name || '',
        createdByRole: o.createdByRole || null,
        createdAt: o.createdAt || new Date().toISOString(),
      }

      return {
        ...state,
        offers: [...state.offers, newOffer],
      }
    }

    case 'updateOffer': {
      const { id, updates } = rest
      if (!id) return state

      return {
        ...state,
        offers: state.offers.map((offer) =>
          offer.id === id ? { ...offer, ...updates } : offer,
        ),
      }
    }

    case 'deleteOffer': {
      const { id } = rest
      if (!id) return state

      return {
        ...state,
        offers: state.offers.filter((offer) => offer.id !== id),
        offerPopup: {
          ...state.offerPopup,
          dismissedOfferIds: state.offerPopup.dismissedOfferIds.filter(
            (offerId) => offerId !== id,
          ),
        },
      }
    }

    // Fired from attendance hook when punch-in succeeds. Offer UI shows when offers load (no delay).
    case 'triggerOfferPopupAfterPunchIn':
      return {
        ...state,
        offerPopup: {
          ...state.offerPopup,
          lastPunchInAt: rest.timestamp || Date.now(),
          isVisible: false,
          activeOfferIndex: 0,
        },
      }

    case 'setOfferPunchBlock': {
      const on = rest.value === true
      return {
        ...state,
        offerPopup: {
          ...state.offerPopup,
          blockPunchModalForOffer: on,
        },
      }
    }

    case 'markPrePunchOfferLoginSkipped':
      if (state.offerPopup.prePunchSequenceCompleted) {
        return state
      }
      return {
        ...state,
        offerPopup: {
          ...state.offerPopup,
          prePunchSequenceCompleted: true,
          blockPunchModalForOffer: false,
        },
      }

    case 'clearOfferPunchBlockAndMarkPrePunchDone':
      return {
        ...state,
        offerPopup: {
          ...state.offerPopup,
          blockPunchModalForOffer: false,
          prePunchSequenceCompleted: true,
          isVisible: false,
        },
      }

    case 'showOfferPopup':
      return {
        ...state,
        offerPopup: {
          ...state.offerPopup,
          isVisible: true,
        },
      }

    case 'hideOfferPopup': {
      const wasBlockingPunch = state.offerPopup.blockPunchModalForOffer
      return {
        ...state,
        offerPopup: {
          ...state.offerPopup,
          isVisible: false,
          ...(wasBlockingPunch
            ? {
                blockPunchModalForOffer: false,
                prePunchSequenceCompleted: true,
              }
            : {}),
        },
      }
    }

    case 'setActiveOfferIndex':
      return {
        ...state,
        offerPopup: {
          ...state.offerPopup,
          activeOfferIndex: typeof rest.index === 'number' ? rest.index : 0,
        },
      }

    case 'dismissOfferForSession': {
      const { id } = rest
      if (!id) return state

      const dismissedSet = new Set(state.offerPopup.dismissedOfferIds)
      dismissedSet.add(id)

      return {
        ...state,
        offerPopup: {
          ...state.offerPopup,
          dismissedOfferIds: Array.from(dismissedSet),
        },
      }
    }

    // Punch-in Working Days Validation
    case 'checkPunchInAvailability': {
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()

      // normalize working_days
      const workingDays = state.profileData.auto_punchout_settings?.working_days || []
      const normalizedWorkingDays = workingDays.map((d) => {
        const map = {
          mon: 'monday',
          monday: 'monday',
          tue: 'tuesday',
          tuesday: 'tuesday',
          wed: 'wednesday',
          wednesday: 'wednesday',
          thu: 'thursday',
          thursday: 'thursday',
          fri: 'friday',
          friday: 'friday',
          sat: 'saturday',
          saturday: 'saturday',
          sun: 'sunday',
          sunday: 'sunday',
        }
        return map[d.toLowerCase()] || d.toLowerCase()
      })

      // normalize enabled flag (handle boolean OR string)
      const rawEnabled = state.profileData.auto_punchout_settings?.enabled
      const autoPunchoutEnabled =
        rawEnabled === false || rawEnabled === 'false'
          ? false
          : rawEnabled === true || rawEnabled === 'true'
          ? true
          : false

      let canPunchIn = true
      let disabledReason = null

      if (!autoPunchoutEnabled) {
        // auto punchout disabled -> allow all days
        canPunchIn = true
        disabledReason = null
      } else if (normalizedWorkingDays.length === 0) {
        // no working days defined -> allow all days
        canPunchIn = true
        disabledReason = null
      } else {
        // check if today is in working days
        canPunchIn = normalizedWorkingDays.includes(today)
        disabledReason = canPunchIn
          ? null
          : `Today is ${today}, and it's not in your working days. You cannot punch-in today.`
      }

      return {
        ...state,
        punchInStatus: {
          ...state.punchInStatus,
          canPunchIn,
          punchInDisabledReason: disabledReason,
        },
      }
    }

    case 'setPunchInDisabled':
      return {
        ...state,
        punchInStatus: {
          ...state.punchInStatus,
          canPunchIn: false,
          punchInDisabledReason: rest.reason || 'पंच-इन अक्षम है',
        },
      }

    case 'setPunchInEnabled':
      return {
        ...state,
        punchInStatus: {
          ...state.punchInStatus,
          canPunchIn: true,
          punchInDisabledReason: null,
        },
      }

    case 'resetPunchInStatus':
      return {
        ...state,
        punchInStatus: {
          isOnline: false,
          showToggle: false,
          showModal: false,
          canPunchIn: true,
          punchInDisabledReason: null,
        },
      }

    // Profile Data Actions
    case 'setProfileData':
      return {
        ...state,
        profileData: { ...state.profileData, ...rest.profileData },
      }
    case 'updateProfileField':
      return {
        ...state,
        profileData: {
          ...state.profileData,
          [rest.field]: rest.value,
        },
      }
    case 'updateProfileNestedField':
      return {
        ...state,
        profileData: {
          ...state.profileData,
          [rest.parentField]: {
            ...state.profileData[rest.parentField],
            [rest.childField]: rest.value,
          },
        },
      }
    case 'updateUserField':
      return {
        ...state,
        profileData: {
          ...state.profileData,
          user: {
            ...state.profileData.user,
            [rest.field]: rest.value,
          },
        },
      }
    case 'updateCurrentAddress':
      return {
        ...state,
        profileData: {
          ...state.profileData,
          current_address: {
            ...state.profileData.current_address,
            [rest.field]: rest.value,
          },
        },
      }
    case 'updatePermanentAddress':
      return {
        ...state,
        profileData: {
          ...state.profileData,
          permanent_address: {
            ...state.profileData.permanent_address,
            [rest.field]: rest.value,
          },
        },
      }
    case 'updateEmergencyContact':
      return {
        ...state,
        profileData: {
          ...state.profileData,
          [rest.contactType]: {
            ...state.profileData[rest.contactType],
            [rest.field]: rest.value,
          },
        },
      }
    case 'updateAutoPunchoutSettings':
      return {
        ...state,
        profileData: {
          ...state.profileData,
          auto_punchout_settings: {
            ...state.profileData.auto_punchout_settings,
            [rest.field]: rest.value,
          },
        },
      }
    case 'updateTodayDoneSettings':
      return {
        ...state,
        profileData: {
          ...state.profileData,
          today_done_settings: {
            ...state.profileData.today_done_settings,
            ...rest.settings,
          },
        },
      }
    case 'clearProfileData':
      return {
        ...state,
        profileData: initialState.profileData,
      }

    // Profile Loading Actions
    case 'setProfileLoading':
      return {
        ...state,
        profileLoading: { ...state.profileLoading, ...rest.loadingState },
      }
    case 'clearProfileLoading':
      return {
        ...state,
        profileLoading: initialState.profileLoading,
      }

    // Profile Error Actions
    case 'setProfileError':
      return {
        ...state,
        profileErrors: { ...state.profileErrors, ...rest.errorState },
      }
    case 'clearProfileErrors':
      return {
        ...state,
        profileErrors: initialState.profileErrors,
      }

    // Profile Success Actions
    case 'setProfileSuccess':
      return {
        ...state,
        profileSuccess: { ...state.profileSuccess, ...rest.successState },
      }
    case 'clearProfileSuccess':
      return {
        ...state,
        profileSuccess: initialState.profileSuccess,
      }

    default:
      return state
  }
}

const store = configureStore({
  reducer: changeState,
  devTools: process.env.NODE_ENV !== 'production', // Enable Redux DevTools
})

// ==================== PUNCH-IN WORKING DAYS VALIDATION ====================

// Punch-in Availability Functions
export const checkPunchInAvailability = () => ({
  type: 'checkPunchInAvailability',
})

export const setPunchInDisabled = (reason) => ({
  type: 'setPunchInDisabled',
  reason,
})

export const setPunchInEnabled = () => ({
  type: 'setPunchInEnabled',
})

export const resetPunchInStatus = () => ({
  type: 'resetPunchInStatus',
})

// ==================== PROFILE HELPER FUNCTIONS ====================

// Profile Data Management Functions
export const setProfileData = (profileData) => ({
  type: 'setProfileData',
  profileData,
})

export const updateProfileField = (field, value) => ({
  type: 'updateProfileField',
  field,
  value,
})

export const updateProfileNestedField = (parentField, childField, value) => ({
  type: 'updateProfileNestedField',
  parentField,
  childField,
  value,
})

export const updateUserField = (field, value) => ({
  type: 'updateUserField',
  field,
  value,
})

export const updateCurrentAddress = (field, value) => ({
  type: 'updateCurrentAddress',
  field,
  value,
})

export const updatePermanentAddress = (field, value) => ({
  type: 'updatePermanentAddress',
  field,
  value,
})

export const updateEmergencyContact = (contactType, field, value) => ({
  type: 'updateEmergencyContact',
  contactType,
  field,
  value,
})

export const updateAutoPunchoutSettings = (field, value) => ({
  type: 'updateAutoPunchoutSettings',
  field,
  value,
})

export const updateTodayDoneSettings = (settings) => ({
  type: 'updateTodayDoneSettings',
  settings,
})

export const clearProfileData = () => ({
  type: 'clearProfileData',
})

// Profile Loading Management Functions
export const setProfileLoading = (loadingState) => ({
  type: 'setProfileLoading',
  loadingState,
})

export const clearProfileLoading = () => ({
  type: 'clearProfileLoading',
})

// Profile Error Management Functions
export const setProfileError = (errorState) => ({
  type: 'setProfileError',
  errorState,
})

export const clearProfileErrors = () => ({
  type: 'clearProfileErrors',
})

// Profile Success Management Functions
export const setProfileSuccess = (successState) => ({
  type: 'setProfileSuccess',
  successState,
})

export const clearProfileSuccess = () => ({
  type: 'clearProfileSuccess',
})

// ==================== PROFILE SELECTORS ====================

// Profile Data Selectors
export const selectProfileData = (state) => state.profileData
export const selectProfileField = (field) => (state) => state.profileData[field]
export const selectProfileNestedField = (parentField, childField) => (state) =>
  state.profileData[parentField][childField]

// User Data Selectors
export const selectUserData = (state) => state.profileData.user
export const selectUserName = (state) => state.profileData.user.name
export const selectUserEmail = (state) => state.profileData.user.email
export const selectUserMobile = (state) => state.profileData.user.mobile
export const selectUserRole = (state) => state.profileData.user.role
export const selectUserStatus = (state) => state.profileData.user.status

// Address Selectors
export const selectCurrentAddress = (state) => state.profileData.current_address
export const selectPermanentAddress = (state) => state.profileData.permanent_address

// Professional Info Selectors
export const selectEmployeeId = (state) => state.profileData.employee_id
export const selectDesignation = (state) => state.profileData.designation
export const selectDepartment = (state) => state.profileData.department
export const selectReportingManager = (state) => state.profileData.reporting_manager
export const selectCompanyName = (state) => state.profileData.company_name

// Salary Selectors
export const selectCtcPerMonth = (state) => state.profileData.ctc_per_month
export const selectHraPerMonth = (state) => state.profileData.hra_per_month
export const selectBasicPerMonth = (state) => state.profileData.basic_per_month

// Bank Info Selectors
export const selectBankName = (state) => state.profileData.bank_name
export const selectAccountNumber = (state) => state.profileData.account_number
export const selectIfscCode = (state) => state.profileData.ifsc_code
export const selectBranchName = (state) => state.profileData.branch_name
export const selectBankEditLocked = (state) => state.profileData.bank_edit_locked

// Emergency Contact Selectors
export const selectEmergencyContact1 = (state) => state.profileData.emergency_contact1
export const selectEmergencyContact2 = (state) => state.profileData.emergency_contact2
export const selectEmergencyContact3 = (state) => state.profileData.emergency_contact3

// Document Selectors
export const selectDocuments = (state) => state.profileData.documents
export const selectWorkExperience = (state) => state.profileData.work_experience
export const selectSkills = (state) => state.profileData.skills
export const selectCertifications = (state) => state.profileData.certifications

// Auto Punchout Settings Selectors
export const selectAutoPunchoutSettings = (state) => state.profileData.auto_punchout_settings
export const selectAutoPunchoutEnabled = (state) => state.profileData.auto_punchout_settings.enabled
export const selectWorkingDays = (state) => state.profileData.auto_punchout_settings.working_days

// Today Done Settings Selectors
export const selectTodayDoneSettings = (state) => state.profileData.today_done_settings
export const selectTodayDoneEnabled = (state) => state.profileData.today_done_settings?.enabled

// Profile Loading Selectors
export const selectProfileLoading = (state) => state.profileLoading
export const selectIsProfileLoading = (state) => state.profileLoading.isLoading
export const selectIsProfileUpdating = (state) => state.profileLoading.isUpdating
export const selectIsProfileUploading = (state) => state.profileLoading.isUploading

// Profile Error Selectors
export const selectProfileErrors = (state) => state.profileErrors
export const selectProfileError = (state) => state.profileErrors.error
export const selectProfileUpdateError = (state) => state.profileErrors.updateError

// Profile Success Selectors
export const selectProfileSuccess = (state) => state.profileSuccess
export const selectProfileUpdateSuccess = (state) => state.profileSuccess.updateSuccess
export const selectProfileUploadSuccess = (state) => state.profileSuccess.uploadSuccess

// ==================== PUNCH-IN VALIDATION SELECTORS ====================

// Punch-in Status Selectors
export const selectPunchInStatus = (state) => state.punchInStatus
export const selectCanPunchIn = (state) => state.punchInStatus.canPunchIn
export const selectPunchInDisabledReason = (state) => state.punchInStatus.punchInDisabledReason
export const selectIsPunchInDisabled = (state) => !state.punchInStatus.canPunchIn

// Working Days Validation Selectors
export const selectTodayIsWorkingDay = (state) => {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
  const workingDays = state.profileData.auto_punchout_settings?.working_days || []
  console.log(workingDays,"working days")
  const autoPunchoutEnabled = state.profileData.auto_punchout_settings?.enabled

  // If auto punchout is disabled, consider it a working day
  if (autoPunchoutEnabled === false) {
    return true
  }

  // Convert working days to lowercase for comparison
  const normalizedWorkingDays = workingDays.map((day) => {
    const dayMap = {
      mon: 'monday',
      monday: 'monday',
      tue: 'tuesday',
      tuesday: 'tuesday',
      wed: 'wednesday',
      wednesday: 'wednesday',
      thu: 'thursday',
      thursday: 'thursday',
      fri: 'friday',
      friday: 'friday',
      sat: 'saturday',
      saturday: 'saturday',
      sun: 'sunday',
      sunday: 'sunday',
    }
    return dayMap[day.toLowerCase()] || day.toLowerCase()
  })

  // If working days array is empty, consider it a working day (fallback)
  return workingDays.length === 0 ? true : normalizedWorkingDays.includes(today)
}

export const selectTodayDayName = () => {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const dayMap = {
    Monday: 'सोमवार',
    Tuesday: 'मंगलवार',
    Wednesday: 'बुधवार',
    Thursday: 'गुरुवार',
    Friday: 'शुक्रवार',
    Saturday: 'शनिवार',
    Sunday: 'रविवार',
  }
  return dayMap[today] || today
}

// ==================== OFFER / PUBLISH-OFFER SELECTORS ====================

export const selectOffers = (state) => state.offers

// Returns only offers whose start/end window includes "now"
// and that are not already dismissed in this session.
export const selectActiveOffers = (state) => {
  const now = new Date()

  return state.offers.filter((offer) => {
    // respect manual status if present (normalize casing: Active/active)
    const status = offer.status ? String(offer.status).toLowerCase() : ''
    if (status && status !== 'active') {
      return false
    }

    const startOk =
      !offer.startDate || (new Date(offer.startDate).getTime() <= now.getTime())
    const endOk =
      !offer.endDate || (new Date(offer.endDate).getTime() >= now.getTime())
    const dismissed =
      state.offerPopup?.dismissedOfferIds?.includes(offer.id) || false

    return startOk && endOk && !dismissed
  })
}

export const selectOfferPopupState = (state) => state.offerPopup

/** When true, punch-in modal must stay closed until the offer popup flow finishes. */
export const selectOfferBlocksPunchModal = (state) => !!state.offerPopup?.blockPunchModalForOffer

// ==================== DEBUG FUNCTIONS ====================

// Debug function to check authentication status
export const debugAuthStatus = () => {
  const token = Cookies.get(`${process.env.REACT_APP_COOKIE_PREFIX}_auth`)
  const state = store.getState()

  return {
    hasToken: !!token,
    userId: state.userData._id,
    isLoading: state.profileLoading.isLoading,
    error: state.profileErrors.error,
  }
}

// ==================== PROFILE API FUNCTIONS ====================

// Profile API Management Functions (to be used with async operations)
export const fetchProfileData = (userId) => async (dispatch, getState) => {
  try {
    dispatch(setProfileLoading({ isLoading: true }))
    dispatch(clearProfileErrors())

    // Import BasicProvider dynamically to avoid circular dependency
    const BasicProvider = (await import('src/constants/BasicProvider')).default

    let response
    try {
      // First try to get current user's profile (without userId)
      response = await new BasicProvider(`profiles`, dispatch).getRequest()
    } catch (error) {
      // Fallback to profiles with specific userId
      response = await new BasicProvider(`profiles/${userId}`, dispatch).getRequest()
    }

    // Check if response has data
    if (response && response.data) {
      dispatch(setProfileData(response.data))
      dispatch(setProfileLoading({ isLoading: false }))

      // Automatically check punch-in availability after profile data is loaded
      dispatch(checkPunchInAvailability())
    } else {
      throw new Error('No data received from API')
    }
  } catch (error) {
    dispatch(setProfileLoading({ isLoading: false }))
    dispatch(setProfileError({ error: error.message }))
    console.error(' Profile fetch error:', error)
  }
}

export const updateProfileData = (userId, profileData) => async (dispatch, getState) => {
  try {
    dispatch(setProfileLoading({ isUpdating: true }))
    dispatch(clearProfileErrors())

    // Get the token from cookie (same as BasicProvider)
    const token = Cookies.get(`${process.env.REACT_APP_COOKIE_PREFIX}_auth`)

    // Prepare headers with authorization
    const headers = {
      'Content-Type': 'application/json',
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    // Actual API call to your backend
    const response = await fetch(`http://localhost:3007/api/profiles/${userId}`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(profileData),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const apiResponse = await response.json()

    // Check if API response has success status
    if (apiResponse.status === 'success' && apiResponse.data) {
      dispatch(setProfileData(apiResponse.data))
      dispatch(setProfileLoading({ isUpdating: false }))
      dispatch(setProfileSuccess({ updateSuccess: true }))

      // Clear success after 3 seconds
      setTimeout(() => {
        dispatch(clearProfileSuccess())
      }, 3000)
    } else {
      throw new Error(apiResponse.message || 'Failed to update profile data')
    }
  } catch (error) {
    dispatch(setProfileLoading({ isUpdating: false }))
    dispatch(setProfileError({ updateError: error.message }))
    console.error('Profile update error:', error)
  }
}

export const uploadProfileImage = (userId, imageFile) => async (dispatch) => {
  try {
    dispatch(setProfileLoading({ isUploading: true }))
    dispatch(clearProfileErrors())

    // Actual API call to your backend
    const formData = new FormData()
    formData.append('profileImage', imageFile)

    const response = await fetch(`http://localhost:3007/api/profiles/${userId}/upload-image`, {
      method: 'POST',
      // Add authorization header if needed
      // headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const apiResponse = await response.json()

    // Check if API response has success status
    if (apiResponse.status === 'success' && apiResponse.data) {
      // Update profile with new image URL
      dispatch(updateProfileField('avatar', apiResponse.data.avatarUrl))
      dispatch(setProfileLoading({ isUploading: false }))
      dispatch(setProfileSuccess({ uploadSuccess: true }))

      // Clear success after 3 seconds
      setTimeout(() => {
        dispatch(clearProfileSuccess())
      }, 3000)
    } else {
      throw new Error(apiResponse.message || 'Failed to upload image')
    }
  } catch (error) {
    dispatch(setProfileLoading({ isUploading: false }))
    dispatch(setProfileError({ uploadError: error.message }))
    console.error('Image upload error:', error)
  }
}

export const changePassword = (userId, passwordData) => async (dispatch) => {
  try {
    dispatch(setProfileLoading({ isChangingPassword: true }))
    dispatch(clearProfileErrors())

    // Actual API call to your backend
    const response = await fetch(`http://localhost:3007/api/profiles/${userId}/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // Add authorization header if needed
        // 'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(passwordData),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const apiResponse = await response.json()

    // Check if API response has success status
    if (apiResponse.status === 'success') {
      dispatch(setProfileLoading({ isChangingPassword: false }))
      dispatch(setProfileSuccess({ passwordSuccess: true }))

      // Clear success after 3 seconds
      setTimeout(() => {
        dispatch(clearProfileSuccess())
      }, 3000)
    } else {
      throw new Error(apiResponse.message || 'Failed to change password')
    }
  } catch (error) {
    dispatch(setProfileLoading({ isChangingPassword: false }))
    dispatch(setProfileError({ passwordError: error.message }))
    console.error('Password change error:', error)
  }
}

export const deleteProfile = (userId) => async (dispatch) => {
  try {
    dispatch(setProfileLoading({ isDeleting: true }))
    dispatch(clearProfileErrors())

    // Actual API call to your backend
    const response = await fetch(`http://localhost:3007/api/profiles/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        // Add authorization header if needed
        // 'Authorization': `Bearer ${token}`
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const apiResponse = await response.json()

    // Check if API response has success status
    if (apiResponse.status === 'success') {
      dispatch(clearProfileData())
      dispatch(setProfileLoading({ isDeleting: false }))
      dispatch(setProfileSuccess({ deleteSuccess: true }))

      // Clear success after 3 seconds
      setTimeout(() => {
        dispatch(clearProfileSuccess())
      }, 3000)
    } else {
      throw new Error(apiResponse.message || 'Failed to delete profile')
    }
  } catch (error) {
    dispatch(setProfileLoading({ isDeleting: false }))
    dispatch(setProfileError({ deleteError: error.message }))
    console.error('Profile delete error:', error)
  }
}

if (process.env.NODE_ENV !== 'production') {
  window.store = store
}

export default store
