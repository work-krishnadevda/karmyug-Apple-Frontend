import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import BasicProvider from 'src/constants/BasicProvider'
import { toast } from 'react-toastify'

export const useFormActions = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [editMode, setEditMode] = useState({})
  const [editAttempts, setEditAttempts] = useState({
    bank: false,
    attachments: false,
    todayDone: false,
  })
  const [isLoadingData, setIsLoadingData] = useState(false)

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

  const handleEditToggle = useCallback((section) => {
    // Validate section parameter
    if (!section || typeof section !== 'string') {
      console.error('Invalid section for edit toggle:', section)
      return
    }

    setEditMode((prev) => ({ ...prev, [section]: !prev[section] }))
  }, [])

  const handleSave = useCallback(
    async (section, formData, canEditSection) => {
      // Basic validation
      if (!section || typeof section !== 'string') {
        toast.error('Invalid section specified for save operation.')
        return
      }
      if (!canEditSection || !canEditSection(section)) {
        toast.error('You do not have permission to edit this section.')
        return
      }
      if (!id) {
        toast.error('Employee ID is required for save operation.')
        return
      }

      // Small helpers
      const extractErrorMessage = (err) =>
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Unknown error'

      const toFormData = (obj) => {
        const fd = new FormData()
        Object.keys(obj || {}).forEach((k) => {
          const v = obj[k]
          // Skip null/undefined
          if (v === undefined || v === null) return
          // stringify arrays/objects
          if (typeof v === 'object' && !(v instanceof File) && !(v instanceof Blob)) {
            fd.append(k, JSON.stringify(v))
          } else {
            fd.append(k, v)
          }
        })
        return fd
      }

      const tryEndpoints = async (endpoints, payload, preferFormDataForLast = false) => {
        let lastErr = null
        for (let i = 0; i < endpoints.length; i += 1) {
          const ep = endpoints[i]
          try {
            const body = ep.useFormData ? toFormData(payload) : payload
            // const res = await new BasicProvider(ep.url, dispatch).patchRequest(body)
            let res
            if (ep.method === 'post') {
              res = await new BasicProvider(ep.url, dispatch).postRequest(body)
            } else {
              res = await new BasicProvider(ep.url, dispatch).patchRequest(body)
            }

            if (res && res.data) return res
            lastErr = new Error('Empty response')
          } catch (err) {
            lastErr = err
          }
        }

        //  try last endpoint with FormData if previous JSON attempts failed
        if (preferFormDataForLast && endpoints.length > 0) {
          const last = endpoints[endpoints.length - 1]
          try {
            const fd = toFormData(payload)
            const res = await new BasicProvider(last.url, dispatch).patchRequest(fd)
            if (res && res.data) return res
          } catch (err) {
            lastErr = err
          }
        }

        throw lastErr
      }

      // Build request body by section (keep minimal fields - easier to reason about)
      let requestBody = {}
      try {
        switch (section) {
          case 'profile': {
            // Ensure role is always an array with ALL profile roles
            const roleValue = formData?.profile?.role
            
            // ✅ CRITICAL DEBUG: Log what we're receiving
          
            
            // Handle different formats: array, string, or undefined
            let roleArray = []
            if (Array.isArray(roleValue)) {
              // Filter out any null/undefined/empty values and ensure all are strings
              roleArray = roleValue
                .filter(Boolean)
                .map((r) => (typeof r === 'string' ? r : String(r)))
                .filter((r) => r.length > 0)
            } else if (roleValue) {
              // If it's a single value (string or number), convert to array
              roleArray = [String(roleValue)]
            }
            
            // ✅ CRITICAL DEBUG: Log processed array
            console.log('🟡 useFormActions - processed roleArray:', {
              roleArray,
              roleArrayLength: roleArray.length,
              roleArrayString: JSON.stringify(roleArray),
            })
            
            // Ensure we have at least an empty array (never null/undefined)
            // Note: Empty array is valid if user has no profile roles
            if (!Array.isArray(roleArray)) {
              roleArray = []
            }
            
            // Ensure ra_branch is always an array
            const raBranchValue = 
              formData?.profile?.raBranch ??
              formData?.profile?.ra_branch ??
              formData?.employment?.raBranch ??
              null
            const raBranchArray = Array.isArray(raBranchValue) 
              ? raBranchValue 
              : raBranchValue 
                ? [raBranchValue] 
                : []
            
            // Ensure group is always an array
            const groupValue = formData?.profile?.group ?? formData?.personal?.groups ?? null
            const groupArray = Array.isArray(groupValue) ? groupValue : groupValue ? [groupValue] : []
            
            requestBody = {
              user: id,
              name: formData?.profile?.name || '',
              mobile: formData?.personal?.phone || formData?.profile?.phone || '',
              email: formData?.personal?.email || '',
              gender: formData?.personal?.gender || '',
              staff_type: formData?.employment?.employeeType || '',
              status: formData?.employment?.status || '',
              inactive_at:
                formData?.employment?.status === 'inactive'
                  ? formData?.employment?.inactiveAt || new Date().toISOString()
                  : undefined,
              role: roleArray,
              ra_branch: raBranchArray,
              group: groupArray,
            }
            if (formData?.profile?.password && formData.profile.password.trim() !== '') {
              requestBody.open_password = formData.profile.password
              requestBody.password = formData.profile.password
            }
            // const profile_image = formData?.profile?.profileImage || null
            // if (profile_image instanceof File) {
            //   const fd = new FormData()
            //   fd.append('profile_image', profile_image)
            //   requestBody = fd
            // } else {
            //   requestBody = requestBodyObj
            // }
            break
          }

          case 'general':
            requestBody = {
              dob: formData?.general?.dateOfBirth || null,
              user: id,
            }
            break

          case 'personal':
            requestBody = {
              official_email: formData?.personal?.email || '',
              mobile_primary: formData?.personal?.phone || '',
              user: id,

              dob: formData?.general?.dateOfBirth || null,
              father_name: formData?.personal?.fatherName || '',
              mother_name: formData?.personal?.motherName || '',
              spouse_name: formData?.personal?.spouseName || '',
              anniversary: formData?.personal?.anniversary || '',
              children: formData?.personal?.children || '',
              marital_status: formData?.personal?.maritalStatus || '',
              blood_group: formData?.personal?.bloodGroup || '',
              physically_challenged: formData?.personal?.physicallyChallenged === 'yes',
              physically_challenged_reason: formData?.personal?.physicallyChallengedReason || '',
              qualification: formData?.personal?.qualification || '',
              last_occupation: formData?.personal?.lastOccupation || '',
              reference_by: formData?.personal?.referenceOfJoining || '',
              aadhar_no: formData?.personal?.aadharNo || '',
              pan_no: formData?.personal?.panNo || '',
              department: formData?.profile?.department || '',
              employee_type: formData?.employment?.employeeType || '',
              current_address: {
                address_line: formData?.personal?.currentAddress || '',
                village: formData?.personal?.currentAddressVillage || '',
                block: formData?.personal?.currentAddressBlock || '',
                district: formData?.personal?.currentAddressDistrict || '',
                state: formData?.personal?.currentAddressState || 'MADHYA PRADESH',
                country: formData?.personal?.currentAddressCountry || 'India',
                pincode: formData?.personal?.currentAddressPincode || '457001',
              },
              permanent_address: {
                address_line: formData?.personal?.permanentAddress || '',
                village: formData?.personal?.permanentAddressVillage || '',
                block: formData?.personal?.permanentAddressBlock || '',
                district: formData?.personal?.permanentAddressDistrict || '',
                state: formData?.personal?.permanentAddressState || 'MADHYA PRADESH',
                country: formData?.personal?.permanentAddressCountry || 'India',
                pincode: formData?.personal?.permanentAddressPincode || '457001',
              },
              emergency_contact1: {
                name: formData?.personal?.emergencyContact1Name || '',
                relation: formData?.personal?.emergencyContact1Relation || '',
                phone: formData?.personal?.emergencyContact1Phone || '',
              },
              emergency_contact2: {
                name: formData?.personal?.emergencyContact2Name || '',
                relation: formData?.personal?.emergencyContact2Relation || '',
                phone: formData?.personal?.emergencyContact2Phone || '',
              },
              emergency_contact3: {
                name: formData?.personal?.emergencyContact3Name || '',
                relation: formData?.personal?.emergencyContact3Relation || '',
                phone: formData?.personal?.emergencyContact3Phone || '',
              },
            }
            break

          case 'employment':
            const rawReportingManager = formData?.employment?.reportingManager
            const normalizedReportingManager =
              rawReportingManager && typeof rawReportingManager === 'object'
                ? rawReportingManager._id || rawReportingManager.id || rawReportingManager.value || ''
                : rawReportingManager || ''
            requestBody = {
              user: id,
              status: formData?.employment?.status || '',
              inactive_at:
                formData?.employment?.status === 'inactive'
                  ? formData?.employment?.inactiveAt || new Date().toISOString()
                  : undefined,
              designation: formData?.employment?.designation || '',
              department: formData?.employment?.department || '',
              employee_type: formData?.employment?.employeeType || '',
              work_type: formData?.employment?.workType || '',
              shift: formData?.employment?.shift || '',
              location: formData?.employment?.location || '',
              ra_location: formData?.employment?.raLocation || '',
              joining_date: formData?.employment?.joiningDate || null,
              remark:formData?.employment?.remark || '',
              onboarding_date: formData?.employment?.onboardingDate || null,
              reporting_manager: normalizedReportingManager,
              reporting_manager_id: normalizedReportingManager || undefined,
              leaveAuthorityOne: formData?.employment?.leaveAuthorityOne || '',
              template: formData?.employment?.template || [],
              leaveAuthorityTwo: formData?.employment?.leaveAuthorityTwo || '',
              leaveAuthorityOne_Name:
                formData?.employment?.leaveAuthorityOne_Name || '',
              leaveAuthorityTwo_Name:
                formData?.employment?.leaveAuthorityTwo_Name || '',
              ctc_per_month: formData?.employment?.ctcPerMonth || 0,
              ctc_per_month_in_words: formData?.employment?.ctcPerMonthInWords || '',
              hra_per_month: formData?.employment?.hraPerMonth || 0,
              hra_in_words: formData?.employment?.hraInWords || '',
              basic_per_month: formData?.employment?.basicPerMonth || 0,
              core: formData?.employment?.core || false,
              company_name: formData?.employment?.companyName || '',
              aadhar_no: formData?.employment?.aadharNo || '',
            }
            break

          case 'bank':
            requestBody = {
              bank_name: formData?.bank?.bankName || '',
              account_number: formData?.bank?.accountNumber || '',
              ifsc_code: formData?.bank?.ifscCode || '',
              branch_name: formData?.bank?.branchName || '',
              user: id,
            }
            break

          case 'additional':
            requestBody = {
              welcome_letter: formData?.additional?.welcomeLetter || false,
              offer_letter: formData?.additional?.offerLetter || false,
              bank_edit_locked: formData?.additional?.bankEditLocked || false,
              document_edit_locked: formData?.additional?.documentEditLocked || false,
              documents: formData?.additional?.documents || [],
              requestBody: id,
            }
            break

          case 'autoPunchout':
            requestBody = {
              user: id,

              auto_punchout_settings: {
                enabled: formData?.autoPunchout?.enabled || false,
                inactivity_timeout_ms:
                  (formData?.autoPunchout?.inactivityTimeoutMinutes || 30) * 60000,
                timezone: formData?.autoPunchout?.timezone || 'Asia/Kolkata',
                working_days: formData?.autoPunchout?.workingDays || [
                  'monday',
                  'tuesday',
                  'wednesday',
                  'thursday',
                  'friday',
                ],
                notify_before_punchout: formData?.autoPunchout?.notifyBeforePunchout || false,
              },
            }
            break

          case 'todayDone':
            requestBody = {
              user: id,
              today_done_settings: {
                enabled: formData?.todayDone?.enabled || false,
                days: formData?.todayDone?.days || {
                  sunday: { enabled: false },
                  monday: { enabled: false },
                  tuesday: { enabled: false },
                  wednesday: { enabled: false },
                  thursday: { enabled: false },
                  friday: { enabled: false },
                  saturday: { enabled: false },
                },
              },
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
            toast.error(`Unknown section: ${section}`)
            return
        }

        // Prepare ordered endpoints to try for update (stop at first success)
        const endpointsToTry = [
          { url: `profiles/${id}`, useFormData: false },
          { url: `profiles`, method: 'post', useFormData: false },
          { url: `admins/update/${id}`, useFormData: true },
          {
            url: `profiles/${id}/upload-document`,
            useFormData: true,
          },
          // { url: `profiles/${id}/upload-profile-image`, useFormData: true },
        ]

        let response = null

        try {
          response = await tryEndpoints(endpointsToTry, requestBody, true)
        } catch (err) {
          // If updating failed for non-profile sections, try alternate admin JSON endpoint
          if (section !== 'profile') {
            try {
              response = await new BasicProvider(`admins/${id}`, dispatch).patchRequest(requestBody)
            } catch (err2) {
              // keep original error
              throw err
            }
          } else {
            // For profile section, if all updates failed, attempt to create a profile for old employee
            try {
              const createBody = { user: id, ...requestBody }
              const createRes = await new BasicProvider('profiles', dispatch).postRequest(
                createBody,
              )
              response = createRes
            } catch (createErr) {
              // nothing else to try
              throw err
            }
          }
        }

        if (response && response.data && Object.keys(response.data).length > 0) {
          // Success handling
          const sectionName = section.charAt(0).toUpperCase() + section.slice(1)
          toast.success(`Employee ${sectionName} updated successfully!`)

          // Turn off edit mode for this section
          setEditMode((prev) => ({ ...prev, [section]: false }))

          // Update edit attempts flags
          // Note: attachments can be edited multiple times by staff, so we don't track it
          if (section === 'bank') setEditAttempts((prev) => ({ ...prev, bank: true }))
          // Removed attachments tracking to allow multiple edits

          // Preserve open_password when profile saved
          if (section === 'profile' && requestBody.open_password) {
            return {
              ...response.data,
              open_password: requestBody.open_password,
              password: requestBody.password,
            }
          }

          return response.data
        } else {
          toast.warn('No data received from save operation.')
          return null
        }
      } catch (error) {
        const msg = extractErrorMessage(error)
        toast.error(`Failed to update ${section}: ${msg}`)
        console.error(`Save ${section} failed:`, msg)
        throw error
      }
    },
    [id, dispatch],
  )

  const handleCancel = useCallback((section, resetFormData) => {
    // Validate section parameter
    if (!section || typeof section !== 'string') {
      console.error('Invalid section for cancel operation:', section)
      return
    }

    // Reset form data to original employee data
    if (resetFormData) {
      resetFormData()
    } else {
      console.warn('No reset function provided for cancel operation')
    }

    setEditMode((prev) => ({ ...prev, [section]: false }))
  }, [])

  const handleAttendanceClick = useCallback(() => {
    try {
      if (!id) {
        console.error('No employee ID available for attendance navigation')
        toast.error('Employee ID is required for attendance navigation')
        return
      }
      navigate(`/hrms/staff/attendance/${id}`)
    } catch (error) {
      console.error('Error navigating to attendance:', error)
      toast.error('Error navigating to attendance page')
    }
  }, [id, navigate])

  const handleBackClick = useCallback(() => {
    try {
      navigate('/hrms/staff')
    } catch (error) {
      console.error('Error navigating back to staff list:', error)
      toast.error('Error navigating back to staff list')
    }
  }, [navigate])

  const initializeEditMode = useCallback(() => {
    const initialEditMode = {}
    if (Array.isArray(sections)) {
      sections.forEach((section) => {
        if (section && typeof section === 'string') {
          initialEditMode[section] = false
        }
      })
    }
    setEditMode(initialEditMode)
  }, [])

  return {
    editMode,
    editAttempts,
    isLoadingData,
    setIsLoadingData,
    handleEditToggle,
    handleSave,
    handleCancel,
    handleAttendanceClick,
    handleBackClick,
    initializeEditMode,
  }
}
