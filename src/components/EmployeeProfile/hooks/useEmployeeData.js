import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import BasicProvider from 'src/constants/BasicProvider'
import moment from 'moment'

export const useEmployeeData = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const admin = useSelector((state) => state.userData)
  const [signedUrls, setSignedUrls] = useState({})
  const [mutualAdmins, setMutualAdmins] = useState([])

  const [urlLoading, setUrlLoading] = useState({})
  const [employeeData, setEmployeeData] = useState(null)
  const [formData, setFormData] = useState({
    general: {
      firstName: '',
      middleName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
    },
    personal: {
      email: '',
      phone: '',
      mobileAlternate: '',
      address: '',
      currentAddress: '',
      permanentAddress: '',
      fatherName: '',
      motherName: '',
      maritalStatus: '',
      bloodGroup: '',
      spouseName: '',
      anniversary: '',
      children: '',
      physicallyChallenged: 'no',
      physicallyChallengedReason: '',
      qualification: '',
      lastOccupation: '',
      aadharNo: '',
      panNo: '',
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
    profile: {
      _id: id || '',
      name: '',
      employeeId: '',
      designation: '',
      department: '',
      phone: '',
      role: [],
      mutualAdmins: [],
      password: '',
      raBranch: [],
      group: [],
    },
    employment: {
      location: '',
      workType: 'full-time',
      shift: 'day',
      status: 'active',
      inactiveAt: '',
      joiningDate: '',
      onboardingDate: '',
      reportingManager: '',
      designation: '',
      department: '',
      employeeType: '',
      ctcPerMonth: '',
      ctcPerMonthInWords: '',
      hraInWords: '',
      basicPerMonth: '',
      core: false,
      companyName: '',
      hraPerMonth: '',
      raLocation: '',
      raBranch: [],
      template: [],
      group: [],
      leaveAuthorityOne: '',
      leaveAuthorityTwo: '',
    },
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
    autoPunchout: {
      enabled: false,
      inactivityTimeoutMinutes: 30,
      timezone: 'Asia/Kolkata',
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      notifyBeforePunchout: false,
    },
    todayDone: {
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
  })
  const lastRequestedIdRef = useRef(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dataSource, setDataSource] = useState(null)


  const resolveRaLocation = (raLocation) => {
  if (!raLocation) return null

  // Already correct object
  if (typeof raLocation === 'object' && raLocation.value && raLocation.label) {
    return raLocation
  }

  // Mongo populated object
  if (typeof raLocation === 'object' && raLocation._id && raLocation.name) {
    return {
      value: raLocation._id,
      label: raLocation.name,
    }
  }

  // Only label string
  if (typeof raLocation === 'string') {
    return {
      value: raLocation,
      label: raLocation,
    }
  }

  return null
}

  const resolveManagerValue = (managerValue) => {
    if (!managerValue) return { id: '', name: '' }

    if (typeof managerValue === 'string') {
      return { id: managerValue, name: '' }
    }

    if (typeof managerValue === 'object') {
      const id = managerValue._id || managerValue.id || managerValue.value || ''
      const name =
        managerValue.name ||
        managerValue.label ||
        managerValue.display_name ||
        managerValue.full_name ||
        ''
      return { id, name }
    }

    return { id: String(managerValue), name: '' }
  }

  const transformEmployeeDataForForm = (rawData) => {
    if (!rawData) return {}

    // Merge possible nested structures
    const employee = {
      ...rawData,
      ...(rawData.user || {}),
      ...(rawData.admin || {}),
      ...(rawData.profile || {}),
    }
    // Helper to get first non-empty value
    const getValue = (...args) => args.find((v) => v !== undefined && v !== null) || '' 
    const reportingManagerRaw = getValue(
      employee.reporting_manager,
      employee.reportingManager,
      employee.reporting_manager_id,
    )
    const resolvedReportingManager = resolveManagerValue(reportingManagerRaw)
    return {
      profileImage: getValue(employee.profileImage),
      profile: {
        _id: getValue(employee._id, employee.id),
        employeeId: getValue(employee.employee_id, employee.employeeId, employee.id),
        name: getValue(employee.name, employee.user?.name),
        role: Array.isArray(employee.role) ? employee.role.map((r) => r?._id).filter(Boolean) : [],
        mutualAdmins: mutualAdmins,
        raBranch: getValue(employee.ra_branch?.[0], employee.ra_branch, employee.raBranch),
        group: Array.isArray(employee.group) 
          ? employee.group.map((g) => (typeof g === 'string' ? g : g?._id || g)).filter(Boolean)
          : employee.group?._id ? [employee.group._id] : [],
        designation: getValue(employee.designation),
        department: getValue(employee.department),
        phone: getValue(employee.mobile_primary, employee.mobile, employee.phone),
        password: getValue(
          employee.open_password,
          employee.user?.open_password,
          employee.password,
          employee.user?.password,
        ),
        profileImage: getValue(employee.profileImage),
      },
      general: {
        firstName: getValue(employee.first_name, employee.firstName, employee.name?.split(' ')[0]),
        middleName: getValue(employee.middle_name, employee.middleName),
        lastName: getValue(
          employee.last_name,
          employee.lastName,
          employee.name?.split(' ').slice(1).join(' '),
        ),
        dateOfBirth: getValue(
          employee.dob,
          employee.dateOfBirth,
          employee.date_of_birth,
          employee.birth_date,
          employee.birthDate,
        ),
      },
      personal: {
        email: getValue(employee.email, employee.official_email, employee.personal_email),
        phone: getValue(employee.mobile, employee.mobile_primary, employee.phone),
        mobileAlternate: getValue(employee.mobile_alternate),
        gender: getValue(employee.gender),
        address: getValue(employee.current_address?.address_line, employee.address),
        maritalStatus: getValue(employee.marital_status, employee.maritalStatus),
        bloodGroup: getValue(employee.blood_group, employee.bloodGroup),
        fatherName: getValue(employee.father_name, employee.fatherName),
        motherName: getValue(employee.mother_name, employee.motherName),
        spouseName: getValue(employee.spouse_name),
        anniversary: getValue(employee.anniversary),
        children: getValue(employee.children),
        physicallyChallenged: employee.physically_challenged ? 'yes' : 'no',
        physicallyChallengedReason: getValue(employee.physically_challenged_reason),
        qualification: getValue(employee.qualification),
        lastOccupation: getValue(employee.last_occupation, employee.lastOccupation),
        aadharNo: getValue(employee.aadhar_no, employee.aadharNo),
        panNo: getValue(employee.pan_no, employee.panNo),
        referenceOfJoining: getValue(employee.reference_by, employee.reference_by),
        currentAddress:
          employee?.current_address?.address_line ||
          employee?.currentAddress ||
          employee?.address ||
          '',

        permanentAddress: getValue(
          employee.permanent_address?.address_line || employee.permanentAddress || employee.address,
        ),
        currentAddressBlock: employee?.current_address?.block || '',
        currentAddressVillage: employee?.current_address?.village || '',
        currentAddressDistrict: employee?.current_address?.district || '',
        currentAddressState: employee?.current_address?.state || '',
        currentAddressCountry: employee?.current_address?.country || '',
        currentAddressPincode: employee?.current_address?.pincode || '',
        permanentAddressBlock: employee?.permanent_address?.block || '',
        permanentAddressVillage: employee?.permanent_address?.village || '',
        permanentAddressDistrict: employee?.permanent_address?.district || '',
        permanentAddressState: employee?.permanent_address?.state || '',
        permanentAddressCountry: employee?.permanent_address?.country || '',
        permanentAddressPincode: employee?.permanent_address?.pincode || '',

        // Emergency contacts
        emergencyContact1Name: getValue(employee.emergency_contact1?.name),
        emergencyContact1Relation: getValue(employee.emergency_contact1?.relation),
        emergencyContact1Phone: getValue(employee.emergency_contact1?.phone),
        emergencyContact2Name: getValue(employee.emergency_contact2?.name),
        emergencyContact2Relation: getValue(employee.emergency_contact2?.relation),
        emergencyContact2Phone: getValue(employee.emergency_contact2?.phone),
        emergencyContact3Name: getValue(employee.emergency_contact3?.name),
        emergencyContact3Relation: getValue(employee.emergency_contact3?.relation),
        emergencyContact3Phone: getValue(employee.emergency_contact3?.phone),
        raBranch: getValue(employee.ra_branch?.[0], employee.ra_branch, employee.raBranch),
        group: Array.isArray(employee.group) 
          ? employee.group.map((g) => (typeof g === 'string' ? g : g?._id || g)).filter(Boolean)
          : employee.group?._id ? [employee.group._id] : [],
      },
      employment: {
        department: getValue(employee.department),
        joiningDate: employee.joining_date
          ? moment(employee.joining_date).format('YYYY-MM-DD')
          : '',
        remark:getValue(employee.remark),
        employeeType: getValue(employee.employee_type),
        template: getValue(employee.template),
        status: getValue(
          employee.employment_status,
          employee.status,
          employee.user?.status,
          'active',
        ),
        inactiveAt: getValue(
          employee.inactive_at,
          employee.user?.inactive_at,
          employee.inactiveAt,
        ),
        ctcPerMonth: getValue(employee.ctc_per_month, employee.ctcPerMonth),
        ctcPerMonthInWords: getValue(employee.ctc_per_month_in_words, employee.ctcPerMonthInWords),
        hraInWords: getValue(employee.hra_in_words, employee.hraInWords),
        location: getValue(employee.location),
        workType: getValue(employee.work_type, employee.workType),
        shift: getValue(employee.shift),
        reportingManager: resolvedReportingManager.id,
        reportingManagerName: getValue(
          employee.reporting_manager_name,
          employee.reportingManagerName,
          resolvedReportingManager.name,
        ),
        aadharNo: getValue(employee.aadhar_no, employee.aadharNo),
        leaveAuthorityOne: getValue(
          employee.leaveAuthorityOne,
          employee.leave_authority_one,
          employee.leave_authority_1,
        ),
        leaveAuthorityTwo: getValue(
          employee.leaveAuthorityTwo,
          employee.leave_authority_two,
          employee.leave_authority_2,
        ),
        leaveAuthorityOne_Name: getValue(
          employee.leaveAuthorityOne_Name,
          employee.leave_authority_one_name,
        ),
        leaveAuthorityTwo_Name: getValue(
          employee.leaveAuthorityTwo_Name,
          employee.leave_authority_two_name,
        ),
        onboardingDate: employee.onboarding_date
          ? moment(employee.onboarding_date).format('YYYY-MM-DD')
          : '',
        basicPerMonth: getValue(employee.basic_per_month, employee.basicPerMonth),
        core: employee.core || employee.isCore || false,
        companyName: getValue(employee.company_name, employee.companyName),
        hraPerMonth: getValue(employee.hra_per_month, employee.hraPerMonth),
        raLocation: resolveRaLocation(employee.ra_location || employee.raLocation),
        raBranch: getValue(employee.ra_branch?.[0], employee.ra_branch, employee.raBranch),
        group: Array.isArray(employee.group) 
          ? employee.group.map((g) => (typeof g === 'string' ? g : g?._id || g)).filter(Boolean)
          : employee.group?._id ? [employee.group._id] : [],
      },
      bank: {
        bankName: getValue(employee.bank_name, employee.bankName),
        accountNumber: getValue(employee.account_number, employee.accountNumber),
        ifscCode: getValue(employee.ifsc_code, employee.ifscCode),
        branchName: getValue(employee.branch_name, employee.branchName), 
      },
      additional: {
        notes: getValue(employee.notes),
        welcomeLetter: !!employee.welcome_letter || !!employee.welcomeLetter,
        offerLetter: !!employee.offer_letter || !!employee.offerLetter,
        bankEditLocked: !!employee.bank_edit_locked || !!employee.bankEditLocked,
        documentEditLocked: !!employee.document_edit_locked || !!employee.documentEditLocked,
        documents: Array.isArray(employee.documents) ? employee.documents : [],
        role: Array.isArray(employee.role) ? employee.role.map((r) => r?._id).filter(Boolean) : [],
      },
      autoPunchout: {
        enabled: employee.auto_punchout_settings?.enabled || false,
        inactivityTimeoutMinutes: employee.auto_punchout_settings?.inactivity_timeout_ms
          ? Math.round(employee.auto_punchout_settings.inactivity_timeout_ms / 60000)
          : 30,
        timezone: employee.auto_punchout_settings?.timezone || 'Asia/Kolkata',
        workingDays: employee.auto_punchout_settings?.working_days || [
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
        ],
        notifyBeforePunchout: employee.auto_punchout_settings?.notify_before_punchout || false,
      },
      todayDone: {
        enabled: employee.today_done_settings?.enabled || false,
        days: employee.today_done_settings?.days || {
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
  }

  const fetchSignedUrl = async (fileId, fileKey) => {
    if (!fileKey || urlLoading[fileId]) return
    setUrlLoading((prev) => ({ ...prev, [fileId]: true }))
    try {
      const response = await new BasicProvider(
        `cms/files/signed-url?key=${fileKey}`,
        dispatch,
      ).getRequest()
      setSignedUrls((prev) => ({ ...prev, [fileId]: response.data.url }))
    } catch (error) {
      console.error(`Error fetching signed URL for ${fileKey}:`, error)
      setSignedUrls((prev) => ({ ...prev, [fileId]: 'error' }))
    } finally {
      setUrlLoading((prev) => ({ ...prev, [fileId]: false }))
    }
  }

  useEffect(() => {
    const docs =
      formData?.additional?.documents?.length > 0
        ? formData.additional.documents
        : employeeData?.additional?.documents || []

    if (docs.length > 0) {
      docs.forEach((file) => {
        if (!signedUrls[file._id] && !urlLoading[file._id]) {
          fetchSignedUrl(file._id, file.filepath)
        }
      })
    }
  }, [formData?.additional?.documents, employeeData])

  const normalizeEmployeeData = (emp, source) => {
    if (!emp) return {}

    // profiles-based data
    if (source.includes('profiles')) {
      if (emp.user) {
        return { ...emp.user, ...emp, source }
      }
      if (emp.admin && emp.profile) {
        return { ...emp.admin, ...emp.profile, source }
      }
      return { ...emp, source }
    }

    // admins endpoint with populated profile
    if (source.includes('admins')) {
      return { ...emp, ...(emp.profile || {}), source }
    }

    // hrms endpoints
    if (source.includes('hrms')) {
      return { ...emp, ...(emp.profile || {}), source }
    }

    // default fallback
    return { ...emp, source }
  }

  const fetchEmployeeData = async () => {
    if (process.env.NODE_ENV === 'development' && id && lastRequestedIdRef.current === id) {
      console.log('Skipping duplicate fetch for id (dev):', id)
      return
    }
    lastRequestedIdRef.current = id

    try {
      setLoading(true)
      setError(null)

      if (!id) {
        setError('Employee ID is required to view profile.')
        setLoading(false)
        return
      }

      console.log('Fetching employee profile for id:', id)

      // Prioritized endpoints
      const endpoints = [
        `profiles/${id}`,
        `users/${id}`,
        `user/${id}`,
        `hrms/employees/${id}`,
        `hrms/profile/${id}`,
      ]

      let response = null
      let resolvedSource = ''

      for (const endpoint of endpoints) {
        try {
          // Try endpoints sequentially; stop at the first success to avoid unnecessary 404s
          const res = await new BasicProvider(endpoint, dispatch).getRequest()
          if (res?.data) {
            response = res
            resolvedSource = endpoint.split('?')[0]
            setDataSource(resolvedSource)
            console.log(`Employee fetched from: ${resolvedSource}`)
            break
          }
        } catch (err) {
          // On 404 we simply continue (expected for many endpoints). Log minimally.
          const status = err?.response?.status
          if (status === 404) {
            // Expected for many endpoints — do not spam logs.
            console.log(`  ${endpoint} -> 404`)
          } else {
            console.warn(`  ${endpoint} failed:`, err.message || status || 'unknown')
          }
          // continue to next endpoint
        }
      }

      // Fallback: limited list search (bounded to avoid heavy requests)
      if (!response) {
        console.log('All endpoints failed — attempting staff-list fallback (limited)...')
        // Use a reasonable page count; avoid huge requests.
        const fallbackRes = await new BasicProvider(
          'admins?page=1&count=200',
          dispatch,
        ).getRequest()
        const list = fallbackRes?.data?.data
        if (Array.isArray(list)) {
          const found = list.find(
            (emp) => emp._id === id || emp.id === id || emp.employee_id === id,
          )
          if (found) {
            response = { data: found }
            resolvedSource = 'admins-fallback'
            setDataSource(resolvedSource)
            console.log('Found employee in staff list fallback')
          } else {
            throw new Error(`Employee not found (ID: ${id})`)
          }
        } else {
          throw new Error('Invalid staff list response from server')
        }
      }

      const employee = response.data
      if (!employee) throw new Error('Empty employee response')

      // Normalize different shapes (handles profile/user/admin/profile nested combinations)
      const normalized = normalizeEmployeeData(employee, resolvedSource)

      // Transform to the UI/form shape
      const transformed = transformEmployeeDataForForm(normalized)

      // Set both internal and form state
      setEmployeeData(transformed)
      setFormData(transformed)
    } catch (err) {
      console.error('Error fetching employee data:', err.message || err)
      let errorMessage = 'Failed to load employee data. Please try again.'
      if (err.response?.status === 404) {
        errorMessage = `Employee not found (ID: ${id})`
      } else if (err.response?.status === 401) {
        errorMessage = 'Unauthorized. Please log in again.'
      } else if (err.response?.status === 403) {
        errorMessage = 'You do not have permission to view this employee.'
      } else if (err.message?.includes('Network Error')) {
        errorMessage = 'Network error. Check your internet connection.'
      }
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployeeData()
  }, [id, admin?._id])

  const handleInputChange = (section, fieldOrValue, maybeValue) => {
    if (!section) {
      console.error('Invalid section for handleInputChange:', { section, fieldOrValue, maybeValue })
      return
    }

    try {
      if (typeof fieldOrValue === 'string' && maybeValue !== undefined) {
        const field = fieldOrValue
        const value = maybeValue

        setFormData((prev) => ({
          ...prev,
          [section]: {
            ...(prev[section] || {}),
            [field]: value,
          },
        }))
      } else if (typeof fieldOrValue === 'object' && fieldOrValue !== null) {
        const valueObj = fieldOrValue
        console.log('Updating section object:', section, valueObj)
        setFormData((prev) => ({
          ...prev,
          [section]: {
            ...(prev[section] || {}),
            ...valueObj,
          },
        }))
      } else {
        console.error('Invalid handleInputChange usage:', { section, fieldOrValue, maybeValue })
      }
    } catch (error) {
      console.error('Error updating form data:', error)
    }
  }

  const resetFormData = () => {
    if (employeeData) {
      setFormData(employeeData)
    } else {
      console.warn('No employee data available for reset')
    }
  }


  const fetchMutualAdmins = async (employeeId) => {
  if (!employeeId) return

  try {
    const response = await new BasicProvider(
      'admins/get-mutual',
      dispatch
    ).postRequest({ id: employeeId })
 
    setMutualAdmins(response?.data || [])
  } catch (error) {
    console.error('Error fetching mutual admins:', error)
    setMutualAdmins([])
  }
}

useEffect(() => {
  if (formData?.profile?._id) {
    fetchMutualAdmins(formData.profile._id)
  }
}, [formData?.profile?._id])
 


  return {
    employeeData,
    formData,
    setFormData,
    loading,
    error,
    dataSource,
    handleInputChange,
    resetFormData,
    fetchEmployeeData,
     mutualAdmins,
    signedUrls,
    urlLoading,
    fetchSignedUrl,
  }
}
