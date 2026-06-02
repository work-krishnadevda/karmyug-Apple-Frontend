import React, { useState, useEffect } from 'react'
import {
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CRow,
  CCol,
  CSpinner,
  CFormInput,
  CFormCheck
} from '@coreui/react'

import AppFormSelect from 'src/components/form/AppFormSelect'
import { cilPlus, cilArrowLeft, cilPencil, cilCreditCard } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useWelcomeLetterGenerator } from '../../components/WelcomeLetterGenerator'
import { useSALAgreementLetterGenerator } from '../../components/SALAgreementLetter'
import { useRelievingLetterGenerator } from '../../components/RelievingLetter'
import { useSalarySlipGenerator } from '../../components/SalarySlipGenerator'
import BasicProvider from 'src/constants/BasicProvider'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import Select from 'react-select'
import Cookies from 'js-cookie'
const ProfileHeader = ({
  formData,
  handleAttendanceClick,
  handleBackClick,
  employeeDatas,
  isAC,
  defaultRoleOptions,
  isHR,
  isADMIN,
  employeeId,
}) => {
  const dispatch = useDispatch()
  const userData = useSelector((state) => state.userData)
  const userRole = useSelector((state) => state.userRole)
  const [visible, setVisible] = useState(false)
  const [relievingModalVisible, setRelievingModalVisible] = useState(false)
  const [relievingDate, setRelievingDate] = useState('')
  const [branch, setBranch] = useState('')
  const [currentCtc, setCurrentCtc] = useState('')
  const [currentDesignations, setCurrentDesignation] = useState('')
  const [roles, setRoles] = useState([])
  const [addPenaltyModal, setAddPenaltyModal] = useState(false)
  const [selectTypeModal, setSelectTypeModal] = useState(false)
  const [salarySlipModalVisible, setSalarySlipModalVisible] = useState(false)
  const [selectedMonths, setSelectedMonths] = useState([])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [monthSalaryData, setMonthSalaryData] = useState({}) // Store salary data for each month
  const [expandedMonth, setExpandedMonth] = useState(null) // Track which month's fields are expanded
  const [companyAddress, setCompanyAddress] = useState('') // Store company address for salary slip
  const [loanPurposeOnly, setLoanPurposeOnly] = useState(false) // Checkbox for loan purpose only
  const [generalPurposeOnly, setGeneralPurposeOnly] = useState(false) // Checkbox for general purpose only

  const [selectedType, setSelectedType] = useState('') // "add" or "penalty"
  const [reason, setReason] = useState('')
  const [entryDate, setEntryDate] = useState('')
  const [amount, setAmount] = useState('')
  const [idCardModalVisible, setIdCardModalVisible] = useState(false)
  const [myAuthorityModalVisible, setMyAuthorityModalVisible] = useState(false)
  const [myAuthorityLoading, setMyAuthorityLoading] = useState(false)
  const [reportingManagerOf, setReportingManagerOf] = useState([])
  const [leaveAuthorityOf, setLeaveAuthorityOf] = useState([])

  // Profile picture state
  const [profilePicture, setProfilePicture] = useState(null)
  const [uploadingPicture, setUploadingPicture] = useState(false)

  const { generateWelcomeLetter } = useWelcomeLetterGenerator()
  const { generateSALAgreementLetter } = useSALAgreementLetterGenerator()
  const { generateRelievingLetter } = useRelievingLetterGenerator()
  const { generateSalarySlip } = useSalarySlipGenerator()

  // Handle profile picture upload
  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, JPG, PNG, or GIF)')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
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
          `profiles/${employeeId}`,
          dispatch,
        ).patchRequest({
          profileImage: uploadedFile._id, // Back to storing file ID
        })

        if (profileUpdateResponse?.data) {
          // Generate signed URL for the uploaded image
          console.log(
            `ProfileHeader [${employeeId}] - Upload successful, generating signed URL for:`,
            uploadedFile.filepath,
          )
          const signedUrlResponse = await new BasicProvider(
            `cms/files/signed-url?key=${uploadedFile.filepath}`,
            dispatch,
          ).getRequest()

          console.log(
            `ProfileHeader [${employeeId}] - Upload signed URL response:`,
            signedUrlResponse,
          )
          if (signedUrlResponse.data?.url) {
            setProfilePicture(signedUrlResponse.data.url)
            dispatch({ type: 'setProfilePicture', profilePicture: signedUrlResponse.data.url })

            console.log(
              `ProfileHeader [${employeeId}] - Profile picture set to:`,
              signedUrlResponse.data.url,
            )
          } else {
            // Fallback to direct URL if signed URL fails
            const imageUrl = `${process.env.REACT_APP_NODE_URL}/files/${uploadedFile._id}`
            setProfilePicture(imageUrl)

            console.log(
              `ProfileHeader [${employeeId}] - Profile picture set to fallback URL:`,
              imageUrl,
            )
          }

          // Update formData if it has profileImage field
          if (employeeDatas) {
            employeeDatas.profileImage = uploadedFile._id // Back to storing file ID
          }
          toast.success('Profile picture updated')
          window.location.reload()
        } else {
          toast.error('Failed to update profile with image')
        }
      } else {
        toast.error('Failed to upload file')
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error)
      toast.error(
        `Failed to upload profile picture: ${error.response?.data?.message || error.message}`,
      )
    } finally {
      setUploadingPicture(false)
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

  const fetchMyAuthorityLists = async () => {
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

      // De-duplicate by _id and remove self if present
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
    } catch (error) {
      console.error('Failed to load authority lists:', error)
      toast.error('Failed to load authority list')
      setReportingManagerOf([])
      setLeaveAuthorityOf([])
    } finally {
      setMyAuthorityLoading(false)
    }
  }

  // Generate signed URL for existing profile image
  const generateSignedUrl = async (imageId) => {
    if (!imageId) return null

    console.log('generateSignedUrl called with imageId:', imageId)

    try {
      // Handle case where imageId is an object (with file details)
      if (typeof imageId === 'object' && imageId !== null) {
        console.log('imageId is an object, extracting filepath:', imageId.filepath)
        if (imageId.filepath) {
          const signedUrlResponse = await new BasicProvider(
            `cms/files/signed-url?key=${imageId.filepath}`,
            dispatch,
          ).getRequest()

          console.log('Signed URL response:', signedUrlResponse)
          return signedUrlResponse.data?.url || null
        } else if (imageId._id) {
          // Fallback to using the _id
          console.log('Using _id as fallback:', imageId._id)
          const signedUrlResponse = await new BasicProvider(
            `cms/files/show-file-with-signed-url/${imageId._id}`,
            dispatch,
          ).getRequest()

          console.log('Signed URL response:', signedUrlResponse)
          return signedUrlResponse.data || null
        }
      }

      // Handle case where imageId is a string
      if (typeof imageId === 'string') {
        // If it looks like a filepath (contains slashes or uploads), use it directly
        if (imageId.includes('/') || imageId.includes('uploads')) {
          console.log('Using imageId as filepath:', imageId)
          const signedUrlResponse = await new BasicProvider(
            `cms/files/signed-url?key=${imageId}`,
            dispatch,
          ).getRequest()

          console.log('Signed URL response:', signedUrlResponse)
          return signedUrlResponse.data?.url || null
        }

        // If it's an ID, use the show-file-with-signed-url endpoint
        console.log('Using show-file-with-signed-url endpoint for ID:', imageId)
        const signedUrlResponse = await new BasicProvider(
          `cms/files/show-file-with-signed-url/${imageId}`,
          dispatch,
        ).getRequest()

        console.log('Signed URL response:', signedUrlResponse)
        return signedUrlResponse.data || null
      }

      console.log('Unknown imageId type:', typeof imageId)
      return null
    } catch (error) {
      console.error('Error generating signed URL:', error)
      // Fallback to direct URL
      const fallbackUrl = `${process.env.REACT_APP_NODE_URL}/files/${imageId}`
      console.log('Using fallback URL:', fallbackUrl)
      return fallbackUrl
    }
  }

  // Load existing profile image on component mount
  useEffect(() => {
    const loadExistingImage = async () => {
      // Check multiple possible locations for profileImage
      const profileImageId =
        employeeDatas?.profileImage ||
        employeeDatas?.profile?.profileImage ||
        employeeDatas?.general?.profileImage ||
        formData?.profileImage ||
        formData?.profile?.profileImage

      console.log(`ProfileHeader [${employeeId}] - Found profileImageId:`, profileImageId)

      // Only try to load if we have a profileImage value
      if (profileImageId) {
        const signedUrl = await generateSignedUrl(profileImageId)
        if (signedUrl) {
          setProfilePicture(signedUrl)
          dispatch({ type: 'setProfilePicture', profilePicture: signedUrl })
        }
      } else {
        // Reset profile picture if no image found
        setProfilePicture(null)
        dispatch({ type: 'setProfilePicture', profilePicture: null })
      }
    }

    // Reset profile picture when employeeId changes
    setProfilePicture(null)
    dispatch({ type: 'setProfilePicture', profilePicture: null })

    // Run immediately and also when data changes
    loadExistingImage()

    // Also try again after a short delay in case data loads asynchronously
    const timeoutId = setTimeout(() => {
      if (!profilePicture) {
        console.log(`ProfileHeader [${employeeId}] - Retrying profile image load after timeout`)
        loadExistingImage()
      }
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [employeeId, employeeDatas, formData, employeeDatas?.profileImage, formData?.profileImage])


  
  const handleSubmitAddPenalty = async () => {
    if (!reason || !entryDate || !amount) {
      toast.error('All fields are required!')
      return
    }

    try {
      // Get current user information for added_by field
      const userId = userData?._id || userData?.id || Cookies.get('primery_user_id')
      const userName = userData?.name || ''
      const userRoleName = userRole?.name || userData?.role?.[0]?.name || ''

      const body = {
        type: selectedType, // addon / penalty
        amount: Number(amount),
        date: entryDate,
        reason,
        added_by: {
          id: userId,
          name: userName,
          role: userRoleName,
        },
      }

      const res = await new BasicProvider(
        `profiles/${employeeId}/penalty-addon`,
        dispatch,
      ).postRequest(body)

      if (res.status === 'success') {
        toast.success('Saved successfully!')

        // Reset input fields
        setAddPenaltyModal(false)
        setReason('')
        setEntryDate('')
        setAmount('')
      } else {
        toast.error('Something went wrong!')
      }
    } catch (err) {
      console.error(err)
      toast.error('Server error: ' + (err.response?.data?.message || err.message))
    }
  }

  const openRelievingModal = () => {
    setRelievingDate('') // reset
    setRelievingModalVisible(true)
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

  useEffect(() => {
    fetchRoles()
  }, [])
  const submitRelieving = () => {
    if (!relievingDate) {
      toast.error('Please select relieving date')
      return
    }
    const currentDesignation = roles
      .filter((role) => currentDesignations.includes(role.value))
      .map((role) => role.label)
      .join(', ')
    // call generator with date param
    // generator should accept (employeeDatas, defaultRoleOptions, relievingDate)
    generateRelievingLetter(
      employeeDatas,
      defaultRoleOptions,
      relievingDate,
      branch,
      currentCtc,
      currentDesignation,
    )
    setRelievingModalVisible(false)
    setVisible(false) // close main modal if open
  }

  // Get available years dynamically (current year and last 2 years)
  const getAvailableYears = () => {
    const currentYear = new Date().getFullYear()
    const years = []
    // Always show current year and 2 years back (total 3 years)
    // Automatically includes new years as they come
    for (let i = 0; i < 3; i++) {
      years.push(currentYear - i)
    }
    // Already sorted in descending order (newest first)
    return years
  }

  // Get all months for selected year
  const getMonthsForYear = (year) => {
    const months = [
      { value: 1, label: 'January', short: 'Jan' },
      { value: 2, label: 'February', short: 'Feb' },
      { value: 3, label: 'March', short: 'Mar' },
      { value: 4, label: 'April', short: 'Apr' },
      { value: 5, label: 'May', short: 'May' },
      { value: 6, label: 'June', short: 'Jun' },
      { value: 7, label: 'July', short: 'Jul' },
      { value: 8, label: 'August', short: 'Aug' },
      { value: 9, label: 'September', short: 'Sep' },
      { value: 10, label: 'October', short: 'Oct' },
      { value: 11, label: 'November', short: 'Nov' },
      { value: 12, label: 'December', short: 'Dec' },
    ]
    return months
  }

  // Check if month is selected
  const isMonthSelected = (month, year) => {
    return selectedMonths.some((m) => m.month === month && m.year === year)
  }

  // Toggle month selection
  const toggleMonthSelection = (month, year) => {
    const monthKey = `${month}-${year}`
    const monthData = {
      value: monthKey,
      label: `${getMonthsForYear(year).find((m) => m.value === month)?.label} ${year}`,
      month,
      year,
    }

    const isSelected = isMonthSelected(month, year)
    if (isSelected) {
      setSelectedMonths(selectedMonths.filter((m) => !(m.month === month && m.year === year)))
      // Clear salary data when deselected
      const newSalaryData = { ...monthSalaryData }
      delete newSalaryData[monthKey]
      setMonthSalaryData(newSalaryData)
      if (expandedMonth === monthKey) {
        setExpandedMonth(null)
      }
    } else {
      setSelectedMonths([...selectedMonths, monthData])
      // Initialize salary data for this month
      if (!monthSalaryData[monthKey]) {
        setMonthSalaryData({
          ...monthSalaryData,
          [monthKey]: {
            // Earnings
            basic: '',
            hra: '',
            mobileAllowance: '',
            lta: '',
            bonusOvertime: '',
            specialAllowance: '',
            // Deductions
            incomeTaxTDS: '',
            providentFund: '',
            professionalTax: '',
            insuranceESI: '',
            advanceTaken: '',
            otherDeduction: '',
          },
        })
      }
      // Expand this month's fields
      setExpandedMonth(monthKey)
    }
  }

  // Handle salary field change
  const handleSalaryFieldChange = (monthKey, field, value) => {
    setMonthSalaryData({
      ...monthSalaryData,
      [monthKey]: {
        ...monthSalaryData[monthKey],
        [field]: value,
      },
    })
  }

  // Select all months for current year
  const selectAllMonths = () => {
    const months = getMonthsForYear(selectedYear)
    const allMonthsForYear = months.map((m) => ({
      value: `${m.value}-${selectedYear}`,
      label: `${m.label} ${selectedYear}`,
      month: m.value,
      year: selectedYear,
    }))
    
    // Remove existing months for this year and add all
    const otherYearMonths = selectedMonths.filter((m) => m.year !== selectedYear)
    setSelectedMonths([...otherYearMonths, ...allMonthsForYear])
    
    // Initialize salary data for all months
    const newSalaryData = { ...monthSalaryData }
    months.forEach((m) => {
      const monthKey = `${m.value}-${selectedYear}`
      if (!newSalaryData[monthKey]) {
        newSalaryData[monthKey] = {
          basic: '',
          hra: '',
          mobileAllowance: '',
          lta: '',
          bonusOvertime: '',
          specialAllowance: '',
          incomeTaxTDS: '',
          providentFund: '',
          professionalTax: '',
          insuranceESI: '',
          advanceTaken: '',
          otherDeduction: '',
        }
      }
    })
    setMonthSalaryData(newSalaryData)
  }

  // Deselect all months for current year
  const deselectAllMonths = () => {
    const monthsToRemove = selectedMonths.filter((m) => m.year === selectedYear)
    setSelectedMonths(selectedMonths.filter((m) => m.year !== selectedYear))
    
    // Clear salary data for deselected months
    const newSalaryData = { ...monthSalaryData }
    monthsToRemove.forEach((m) => {
      delete newSalaryData[m.value]
    })
    setMonthSalaryData(newSalaryData)
    
    // Clear expanded month if it was from this year
    if (expandedMonth && monthsToRemove.some((m) => m.value === expandedMonth)) {
      setExpandedMonth(null)
    }
  }

  // Handle salary slip generation
  const handleGenerateSalarySlip = async () => {
    if (selectedMonths.length === 0) {
      toast.error('Please select at least one month')
      return
    }

    try {
      let successCount = 0
      let failedMonths = []

      // Show initial toast
      toast.info(`Generating ${selectedMonths.length} salary slip(s)...`, {
        autoClose: 2000,
      })

      // Generate salary slips for each selected month sequentially
      for (let i = 0; i < selectedMonths.length; i++) {
        const monthOption = selectedMonths[i]
        const { month, year } = monthOption
        const url = `attendances/admin/payroll/user/${employeeId}?month=${month}&year=${year}`
        
        try {
          const res = await new BasicProvider(url, dispatch).getRequest()
          if (res?.status === 'success' && res?.data) {
            // Extract payroll data from response
            const payrollData = res.data?.user || res.data || {}
            
            // Merge with user-entered salary data if available
            const monthKey = `${month}-${year}`
            const userSalaryData = monthSalaryData[monthKey] || {}
            
            // Helper function to safely convert to number
            const toNumber = (value) => {
              if (value === null || value === undefined || value === '') return 0
              const num = typeof value === 'string' ? parseFloat(value) : Number(value)
              return isNaN(num) ? 0 : num
            }
            
            // Merge user-entered data with API data (user data takes precedence)
            // Convert all values to numbers to ensure proper calculations
            const mergedPayrollData = {
              ...payrollData,
              basic_per_month: userSalaryData.basic ? toNumber(userSalaryData.basic) : (toNumber(payrollData?.basic_per_month) || toNumber(payrollData?.revised_basic_per_month) || toNumber(payrollData?.ctc_per_month) || 0),
              hra_per_month: userSalaryData.hra ? toNumber(userSalaryData.hra) : (toNumber(payrollData?.hra_per_month) || 0),
              mobile_allowance: userSalaryData.mobileAllowance ? toNumber(userSalaryData.mobileAllowance) : (toNumber(payrollData?.mobile_allowance) || toNumber(payrollData?.mobileAllowance) || 0),
              lta: userSalaryData.lta ? toNumber(userSalaryData.lta) : (toNumber(payrollData?.lta) || toNumber(payrollData?.leave_travel_allowance) || 0),
              overtime_allowance: userSalaryData.bonusOvertime ? toNumber(userSalaryData.bonusOvertime) : (toNumber(payrollData?.overtime_allowance) || toNumber(payrollData?.overtimeAllowance) || toNumber(payrollData?.overtime) || toNumber(payrollData?.bonus) || 0),
              special_allowance: userSalaryData.specialAllowance ? toNumber(userSalaryData.specialAllowance) : (toNumber(payrollData?.special_allowance) || toNumber(payrollData?.specialAllowance) || toNumber(payrollData?.conveyance_allowance) || toNumber(payrollData?.conveyanceAllowance) || 0),
              income_tax: userSalaryData.incomeTaxTDS ? toNumber(userSalaryData.incomeTaxTDS) : (toNumber(payrollData?.income_tax) || toNumber(payrollData?.tds) || toNumber(payrollData?.tax) || 0),
              provident_fund: userSalaryData.providentFund ? toNumber(userSalaryData.providentFund) : (toNumber(payrollData?.provident_fund) || toNumber(payrollData?.pf) || toNumber(payrollData?.pf_deduction) || 0),
              professional_tax: userSalaryData.professionalTax ? toNumber(userSalaryData.professionalTax) : (toNumber(payrollData?.professional_tax) || toNumber(payrollData?.pt) || 0),
              insurance: userSalaryData.insuranceESI ? toNumber(userSalaryData.insuranceESI) : (toNumber(payrollData?.insurance) || toNumber(payrollData?.esi) || toNumber(payrollData?.insurance_esi) || 0),
              advance: userSalaryData.advanceTaken ? toNumber(userSalaryData.advanceTaken) : (toNumber(payrollData?.advance) || toNumber(payrollData?.advance_taken) || 0),
              other_deduction: userSalaryData.otherDeduction ? toNumber(userSalaryData.otherDeduction) : (toNumber(payrollData?.other_deduction) || toNumber(payrollData?.otherDeduction) || 0),
            }
            
            // Determine note purpose based on checkboxes
            let notePurpose = ''
            if (loanPurposeOnly && !generalPurposeOnly) {
              notePurpose = 'loan'
            } else if (generalPurposeOnly && !loanPurposeOnly) {
              notePurpose = 'general'
            } else if (loanPurposeOnly && generalPurposeOnly) {
              notePurpose = 'both'
            } else {
              notePurpose = 'both' // Default to both if nothing selected
            }
            
            // Generate and download salary slip PDF with company address and note purpose
            await generateSalarySlip(employeeDatas, mergedPayrollData, month, year, defaultRoleOptions, i, companyAddress, notePurpose)
            
            successCount++
            
            // Add small delay between downloads to avoid browser blocking multiple downloads
            if (i < selectedMonths.length - 1) {
              await new Promise((resolve) => setTimeout(resolve, 500))
            }
          } else {
            failedMonths.push(monthOption.label)
            toast.error(`No payroll data found for ${monthOption.label}`)
          }
        } catch (err) {
          console.error(`Error generating salary slip for ${monthOption.label}:`, err)
          failedMonths.push(monthOption.label)
          toast.error(`Failed to generate salary slip for ${monthOption.label}`)
        }
      }

      // Show summary toast
      if (successCount > 0) {
        toast.success(
          `Successfully generated ${successCount} salary slip(s)${
            failedMonths.length > 0 ? `. Failed: ${failedMonths.join(', ')}` : ''
          }`,
          {
            autoClose: 4000,
          }
        )
      }

      // Close modals after generation
      setSalarySlipModalVisible(false)
      setVisible(false)
      setSelectedMonths([])
    } catch (error) {
      console.error('Error generating salary slips:', error)
      toast.error('Failed to generate salary slips')
    }
  }

  // Open salary slip modal
  const openSalarySlipModal = () => {
    setSelectedMonths([])
    setSelectedYear(new Date().getFullYear())
    setMonthSalaryData({})
    setExpandedMonth(null)
    // Set default company address from employee data
    const defaultAddress = employeeDatas?.employment?.address || employeeDatas?.address || 'MJR-06, Ratanpuri, 80Ft Road, Ratlam (M.P)'
    setCompanyAddress(defaultAddress)
    setSalarySlipModalVisible(true)
  }

  // Get company name from employee data
  const getCompanyName = () => {
    return employeeDatas?.employment?.companyName || employeeDatas?.companyName || 'ValueXpert Solutions Pvt Ltd'
  }

  return (
    <div className="profile-header position-relative d-flex align-items-center">
      <div className="profile-header-bg"></div>
      <div className="container-fluid position-relative z-1">
        <div className="row align-items-center">
          <div className="col-md-8 d-flex align-items-center mb-3 mb-md-0">
            <div className="profile-photo-wrapper me-3 flex-shrink-0 position-relative">
              <img
                src={(() => {
                  console.log(
                    `ProfileHeader [${employeeId}] - Current profilePicture state:`,
                    profilePicture,
                  )
                  return (
                    profilePicture ||
                    'https://static.vecteezy.com/system/resources/thumbnails/002/002/403/small/man-with-beard-avatar-character-isolated-icon-free-vector.jpg'
                  )
                })()}
                alt="Profile"
                className="profile-photo"
                width={80}
                height={80}
              />
              {(isHR || isADMIN) && (
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
              )}
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
                {formData?.profile?.name || 'Employee Name'}
              </div>
              <div className="profile-id text-light small mt-1">
                ID: {formData?.profile?.employeeId || 'N/A'}
              </div>
            </div>
          </div>

          <div className="col-md-4 d-flex justify-content-md-end justify-content-start align-items-center">
            <div className="profile-actions d-flex gap-2">
              {!isAC && (
                <CButton
                  color="primary"
                  className="d-flex align-items-center"
                  onClick={() => setVisible(true)}
                >
                  <CIcon icon={cilPlus} className="me-1" />
                  Generate Letters
                </CButton>
              )}

              {!isAC && (
                <CButton
                  color="primary"
                  className="d-flex align-items-center"
                  onClick={handleAttendanceClick}
                >
                  <CIcon icon={cilPlus} className="me-1" />
                  Attendance
                </CButton>
              )}

              <CButton
                color="success"
                variant="outline"
                className="d-flex align-items-center"
                onClick={() => {
                  setMyAuthorityModalVisible(true)
                  fetchMyAuthorityLists()
                }}
              >
                My Team / Authority
              </CButton>
              <CButton
                color="warning"
                className="d-flex align-items-center"
                onClick={() => setSelectTypeModal(true)}
              >
                <CIcon icon={cilPlus} className="me-1" />
                AddGoes
              </CButton>

              <CButton
                color="info"
                variant="outline"
                className="d-flex align-items-center"
                onClick={() => setIdCardModalVisible(true)}
              >
                <CIcon icon={cilCreditCard} className="me-1" />
                ID card info
              </CButton>

              <CButton
                color="secondary"
                variant="outline"
                className="d-flex align-items-center"
                onClick={handleBackClick}
              >
                <CIcon icon={cilArrowLeft} className="me-1" />
                Back
              </CButton>
            </div>
          </div>
        </div>
      </div>
      <CModal
        alignment="center"
        visible={selectTypeModal}
        onClose={() => setSelectTypeModal(false)}
        closeButton={false}
      >
        <CModalHeader className="p-0 border-0" closeButton={false}>
          <div className="select-modal-header w-100 d-flex align-items-center justify-content-start">
            <div className="ms-3 py-3">
              <CModalTitle className="text-white mb-0">Choose Action</CModalTitle>
              <div className="text-white-50 small">Apply an Add-on or record a Penalty</div>
            </div>
          </div>
        </CModalHeader>

        <CModalBody>
          <div className="select-options d-flex flex-column gap-3">
            <div className="option-card d-flex align-items-center justify-content-between p-3">
              <div>
                <div className="option-title fw-bold">Add On</div>
                <div className="option-desc small text-muted">
                  Reward an employee with additional amount
                </div>
              </div>
              <CButton
                color="success"
                className="btn-lg shadow-sm d-flex align-items-center"
                onClick={() => {
                  setSelectedType('addon')
                  setSelectTypeModal(false)
                  setAddPenaltyModal(true)
                }}
              >
                <CIcon icon={cilPlus} className="me-2" /> Add On
              </CButton>
            </div>

            <div className="option-card d-flex align-items-center justify-content-between p-3">
              <div>
                <div className="option-title fw-bold">Penalty</div>
                <div className="option-desc small text-muted">
                  Record penalty against attendance or conduct
                </div>
              </div>
              <CButton
                color="danger"
                className="btn-lg shadow-sm d-flex align-items-center"
                onClick={() => {
                  setSelectedType('penalty')
                  setSelectTypeModal(false)
                  setAddPenaltyModal(true)
                }}
              >
                <CIcon icon={cilPlus} className="me-2" /> Penalty
              </CButton>
            </div>
          </div>
        </CModalBody>

        <CModalFooter className="justify-content-center border-0">
          <CButton color="secondary" onClick={() => setSelectTypeModal(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>

      {/* ID card info modal */}
      <CModal
        alignment="center"
        visible={idCardModalVisible}
        onClose={() => setIdCardModalVisible(false)}
      >
        <CModalHeader>
          <CModalTitle>ID Card Information</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CRow className="g-2">
            <CCol xs={12} className="small">
              <strong>Staff name:</strong>{' '}
              {(() => {
                const name = formData?.profile?.name || ''
                const parts = name.trim().split(/\s+/)
                const displayName = parts.length > 1 ? parts.slice(1).join(' ') : name
                return displayName || '—'
              })()}
            </CCol>
            <CCol xs={12} className="small">
              <strong>Designation:</strong>{' '}
              {(() => {
                const designation =
                  formData?.profile?.designation || formData?.employment?.designation
                if (designation) return designation
                const roleIds = Array.isArray(formData?.profile?.role)
                  ? formData.profile.role
                  : formData?.profile?.role
                    ? [formData.profile.role]
                    : []
                const firstRoleId = roleIds[0]
                const firstRoleLabel =
                  defaultRoleOptions?.find((o) => o.value === firstRoleId)?.label || ''
                return firstRoleLabel || '—'
              })()}
            </CCol>
            <CCol xs={12} className="small">
              <strong>Employee Id:</strong>{' '}
              {formData?.profile?.employeeId || '—'}
            </CCol>
            <CCol xs={12} className="small">
              <strong>Blood Group:</strong>{' '}
              {formData?.personal?.bloodGroup || formData?.additional?.bloodGroup || '—'}
            </CCol>
            <CCol xs={12} className="small">
              <strong>Gender:</strong>{' '}
              {formData?.general?.gender || formData?.personal?.gender || '—'}
            </CCol>
            <CCol xs={12} className="small">
              <strong>Effective From:</strong>{' '}
              {formData?.employment?.joiningDate
                ? new Date(formData.employment.joiningDate + 'T00:00:00').toLocaleString('en-IN', {
                    month: 'long',
                  })
                : '—'}
            </CCol>
            <CCol xs={12} className="small">
              <strong>Date Of birth:</strong>{' '}
              {(() => {
                const raw = formData?.general?.dateOfBirth
                if (!raw) return '—'
                const d = new Date(raw)
                if (Number.isNaN(d.getTime())) return '—'
                return d.toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })
              })()}
            </CCol>
            <CCol xs={12} className="small">
              <strong>Mobile Number:</strong>{' '}
              {formData?.profile?.phone || formData?.personal?.phone || '—'}
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setIdCardModalVisible(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>

      {/* My Team / Authority modal */}
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
            <>
              <CRow className="g-3">
                <CCol md={6}>
                  <div className="border rounded p-3 h-100">
                    <h6 className="mb-2">
                      Reporting Manager of ({reportingManagerOf.length})
                    </h6>
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
                    <h6 className="mb-2">
                      Leave Authority of ({leaveAuthorityOf.length})
                    </h6>
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
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setMyAuthorityModalVisible(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal
        alignment="center"
        visible={addPenaltyModal}
        onClose={() => setAddPenaltyModal(false)}
      >
        <CModalHeader>
          <CModalTitle>{selectedType === 'addon' ? 'Add-On Entry' : 'Penalty Entry'}</CModalTitle>
        </CModalHeader>

        <CModalBody>
          <CRow className="g-3">
            <CCol xs={12}>
              <label style={{ fontWeight: 600 }}>Reason</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </CCol>

            <CCol xs={12}>
              <label style={{ fontWeight: 600 }}>Date</label>
              <input
                type="month"
                className="form-control"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
              />
            </CCol>

            <CCol xs={12}>
              <label style={{ fontWeight: 600 }}>
                {selectedType === 'add' ? 'Amount to Add' : 'Penalty Amount'}
              </label>
              <input
                type="number"
                className="form-control"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </CCol>
          </CRow>
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" onClick={() => setAddPenaltyModal(false)}>
            Cancel
          </CButton>

          <CButton color="primary" onClick={handleSubmitAddPenalty}>
            Submit
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Generate Letters Modal */}
      <CModal alignment="center" visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader>
          <CModalTitle>Generate Letters</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CRow className="g-3">
            <CCol xs={12} sm={6}>
              <CButton
                color="success"
                className="w-100"
                onClick={() => {
                  generateWelcomeLetter(employeeDatas, defaultRoleOptions)
                  setVisible(false)
                }}
              >
                Welcome Letter
              </CButton>
            </CCol>
            <CCol xs={12} sm={6}>
              <CButton
                color="info"
                className="w-100"
                onClick={() => {
                  generateSALAgreementLetter(employeeDatas, defaultRoleOptions)
                  setVisible(false)
                }}
              >
                SAL Agreement Letter
              </CButton>
            </CCol>

            <CCol xs={12} sm={6}>
              <CButton
                color="danger"
                className="w-100"
                onClick={() => {
                  // open small modal to pick relieving date
                  openRelievingModal()
                }}
              >
                Relieving Letter
              </CButton>
            </CCol>

            <CCol xs={12} sm={6}>
              <CButton
                color="warning"
                className="w-100"
                onClick={() => {
                  openSalarySlipModal()
                }}
              >
                Salary Slip
              </CButton>
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Relieving Date Modal */}
      <CModal
        alignment="center"
        visible={relievingModalVisible}
        onClose={() => setRelievingModalVisible(false)}
      >
        <CModalHeader>
          <CModalTitle>Relieving Details</CModalTitle>
        </CModalHeader>

        <CModalBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ fontWeight: 600 }}>Select Relieving Date</label>
            <input
              type="date"
              value={relievingDate}
              onChange={(e) => setRelievingDate(e.target.value)}
              style={{ padding: '8px', fontSize: 14 }}
            />

            <label style={{ fontWeight: 600 }}>Branch (From Relieve)</label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="Enter Branch Name"
              style={{ padding: '8px', fontSize: 14 }}
            />

            <label style={{ fontWeight: 600 }}>Current CTC</label>
            <input
              type="text"
              value={currentCtc}
              onChange={(e) => setCurrentCtc(e.target.value)}
              placeholder="Enter Current CTC"
              style={{ padding: '8px', fontSize: 14 }}
            />

            <label style={{ fontWeight: 600 }}>Current Designation</label>
            <Select
              isMulti
              options={roles.map((role) => ({
                value: role.value,
                label: role.label,
              }))}
              value={roles.filter((r) => currentDesignations.includes(r.value))}
              onChange={(selected) => setCurrentDesignation(selected.map((s) => s.value))}
              placeholder="Select one or more designations"
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
          </div>
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" onClick={() => setRelievingModalVisible(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={submitRelieving}>
            Submit
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Salary Slip Month Selection Modal */}
      <CModal
        alignment="center"
        visible={salarySlipModalVisible}
        onClose={() => setSalarySlipModalVisible(false)}
        size="lg"
      >
        <CModalHeader>
          <CModalTitle>Select Months for Salary Slip</CModalTitle>
        </CModalHeader>

        <CModalBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Company Information */}
            <div
              style={{
                padding: '15px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #dee2e6',
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: '10px', fontSize: '14px', color: '#0b1857' }}>
                Company Information
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontWeight: 500, fontSize: '13px', marginBottom: '5px', display: 'block' }}>
                  Company Name:
                </label>
                <div style={{ fontSize: '14px', color: '#495057', fontWeight: 500 }}>
                  {getCompanyName()}
                </div>
              </div>
              <div>
                <label style={{ fontWeight: 500, fontSize: '13px', marginBottom: '5px', display: 'block' }}>
                  Company Address:
                </label>
                <CFormInput
                  type="text"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  placeholder="Enter company address (e.g., MJR-06, Ratanpuri, 80Ft Road, Ratlam (M.P))"
                  style={{ fontSize: '13px' }}
                />
                <small style={{ color: '#6c757d', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                  This address will be displayed on the salary slip
                </small>
              </div>
            </div>

            {/* Year Selection */}
            <div>
              <label style={{ fontWeight: 600, marginBottom: '10px', display: 'block' }}>
                Select Year
              </label>
              <AppFormSelect
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(parseInt(e.target.value))
                }}
                style={{
                  padding: '10px',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                {getAvailableYears().map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </AppFormSelect>
            </div>

            {/* Month Grid */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                }}
              >
                <label style={{ fontWeight: 600, margin: 0 }}>
                  Select Month(s) - {selectedYear}
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <CButton
                    color="link"
                    size="sm"
                    onClick={selectAllMonths}
                    style={{ padding: '4px 8px', fontSize: '12px' }}
                  >
                    Select All
                  </CButton>
                  <CButton
                    color="link"
                    size="sm"
                    onClick={deselectAllMonths}
                    style={{ padding: '4px 8px', fontSize: '12px' }}
                  >
                    Deselect All
                  </CButton>
                </div>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '10px',
                }}
              >
                {getMonthsForYear(selectedYear).map((month) => {
                  const isSelected = isMonthSelected(month.value, selectedYear)
                  return (
                    <div
                      key={month.value}
                      onClick={() => toggleMonthSelection(month.value, selectedYear)}
                      style={{
                        padding: '14px',
                        borderRadius: '8px',
                        border: `2px solid ${isSelected ? '#0b1857' : '#dee2e6'}`,
                        backgroundColor: isSelected ? '#e7f3ff' : '#ffffff',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s ease',
                        fontWeight: isSelected ? 600 : 400,
                        color: isSelected ? '#0b1857' : '#495057',
                        boxShadow: isSelected
                          ? '0 2px 8px rgba(11, 24, 87, 0.15)'
                          : '0 1px 3px rgba(0, 0, 0, 0.05)',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = '#0b1857'
                          e.currentTarget.style.backgroundColor = '#f8f9fa'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = '#dee2e6'
                          e.currentTarget.style.backgroundColor = '#ffffff'
                        }
                      }}
                    >
                      <div style={{ fontSize: '14px', fontWeight: isSelected ? 600 : 500 }}>
                        {month.short}
                      </div>
                      {isSelected && (
                        <div
                          style={{
                            marginTop: '4px',
                            fontSize: '10px',
                            color: '#0b1857',
                          }}
                        >
                          ✓ Selected
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Selected Months Summary */}
            {selectedMonths.length > 0 && (
              <div
                style={{
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #dee2e6',
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>
                  Selected Months ({selectedMonths.length}):
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                    fontSize: '13px',
                  }}
                >
                  {selectedMonths
                    .sort((a, b) => {
                      if (a.year !== b.year) return b.year - a.year
                      return b.month - a.month
                    })
                    .map((month) => (
                      <span
                        key={month.value}
                        style={{
                          padding: '4px 10px',
                          backgroundColor: '#0b1857',
                          color: '#ffffff',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                      >
                        {month.label}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Salary Input Fields for Selected Months */}
            {selectedMonths.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <div style={{ fontWeight: 600, marginBottom: '15px', fontSize: '16px', color: '#0b1857' }}>
                  Enter Salary Details for Selected Months
                </div>
                {selectedMonths
                  .sort((a, b) => {
                    if (a.year !== b.year) return b.year - a.year
                    return b.month - a.month
                  })
                  .map((monthOption) => {
                    const monthKey = monthOption.value
                    const salaryData = monthSalaryData[monthKey] || {}
                    const isExpanded = expandedMonth === monthKey

                    return (
                      <div
                        key={monthKey}
                        style={{
                          border: '1px solid #dee2e6',
                          borderRadius: '8px',
                          marginBottom: '15px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          onClick={() => setExpandedMonth(isExpanded ? null : monthKey)}
                          style={{
                            padding: '12px 15px',
                            backgroundColor: '#f8f9fa',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderBottom: isExpanded ? '1px solid #dee2e6' : 'none',
                          }}
                        >
                          <div style={{ fontWeight: 600, fontSize: '14px' }}>
                            {monthOption.label} - Salary Details
                          </div>
                          <div style={{ fontSize: '18px', color: '#0b1857' }}>
                            {isExpanded ? '▼' : '▶'}
                          </div>
                        </div>

                        {isExpanded && (
                          <div style={{ padding: '15px' }}>
                            <CRow className="g-3">
                              <CCol xs={12}>
                                <h6 style={{ color: '#28a745', fontWeight: 600, marginBottom: '10px' }}>
                                  Earnings
                                </h6>
                              </CCol>
                              <CCol md={6}>
                                <label style={{ fontWeight: 500, fontSize: '13px', marginBottom: '5px', display: 'block' }}>
                                  Basic
                                </label>
                                <CFormInput
                                  type="number"
                                  value={salaryData.basic || ''}
                                  onChange={(e) => handleSalaryFieldChange(monthKey, 'basic', e.target.value)}
                                  placeholder="Enter Basic Salary"
                                  style={{ fontSize: '13px' }}
                                />
                              </CCol>
                              <CCol md={6}>
                                <label style={{ fontWeight: 500, fontSize: '13px', marginBottom: '5px', display: 'block' }}>
                                  HRA
                                </label>
                                <CFormInput
                                  type="number"
                                  value={salaryData.hra || ''}
                                  onChange={(e) => handleSalaryFieldChange(monthKey, 'hra', e.target.value)}
                                  placeholder="Enter HRA"
                                  style={{ fontSize: '13px' }}
                                />
                              </CCol>
                              <CCol md={6}>
                                <label style={{ fontWeight: 500, fontSize: '13px', marginBottom: '5px', display: 'block' }}>
                                  Mobile Allowance
                                </label>
                                <CFormInput
                                  type="number"
                                  value={salaryData.mobileAllowance || ''}
                                  onChange={(e) => handleSalaryFieldChange(monthKey, 'mobileAllowance', e.target.value)}
                                  placeholder="Enter Mobile Allowance"
                                  style={{ fontSize: '13px' }}
                                />
                              </CCol>
                              <CCol md={6}>
                                <label style={{ fontWeight: 500, fontSize: '13px', marginBottom: '5px', display: 'block' }}>
                                  LTA
                                </label>
                                <CFormInput
                                  type="number"
                                  value={salaryData.lta || ''}
                                  onChange={(e) => handleSalaryFieldChange(monthKey, 'lta', e.target.value)}
                                  placeholder="Enter LTA"
                                  style={{ fontSize: '13px' }}
                                />
                              </CCol>
                              <CCol md={6}>
                                <label style={{ fontWeight: 500, fontSize: '13px', marginBottom: '5px', display: 'block' }}>
                                  Bonus / Overtime
                                </label>
                                <CFormInput
                                  type="number"
                                  value={salaryData.bonusOvertime || ''}
                                  onChange={(e) => handleSalaryFieldChange(monthKey, 'bonusOvertime', e.target.value)}
                                  placeholder="Enter Bonus/Overtime"
                                  style={{ fontSize: '13px' }}
                                />
                              </CCol>
                              <CCol md={6}>
                                <label style={{ fontWeight: 500, fontSize: '13px', marginBottom: '5px', display: 'block' }}>
                                  Special Allowance
                                </label>
                                <CFormInput
                                  type="number"
                                  value={salaryData.specialAllowance || ''}
                                  onChange={(e) => handleSalaryFieldChange(monthKey, 'specialAllowance', e.target.value)}
                                  placeholder="Enter Special Allowance"
                                  style={{ fontSize: '13px' }}
                                />
                              </CCol>

                              <CCol xs={12} style={{ marginTop: '10px' }}>
                                <h6 style={{ color: '#dc3545', fontWeight: 600, marginBottom: '10px' }}>
                                  Deductions
                                </h6>
                              </CCol>
                              <CCol md={6}>
                                <label style={{ fontWeight: 500, fontSize: '13px', marginBottom: '5px', display: 'block' }}>
                                  Income Tax / TDS
                                </label>
                                <CFormInput
                                  type="number"
                                  value={salaryData.incomeTaxTDS || ''}
                                  onChange={(e) => handleSalaryFieldChange(monthKey, 'incomeTaxTDS', e.target.value)}
                                  placeholder="Enter Income Tax/TDS"
                                  style={{ fontSize: '13px' }}
                                />
                              </CCol>
                              <CCol md={6}>
                                <label style={{ fontWeight: 500, fontSize: '13px', marginBottom: '5px', display: 'block' }}>
                                  Provident Fund
                                </label>
                                <CFormInput
                                  type="number"
                                  value={salaryData.providentFund || ''}
                                  onChange={(e) => handleSalaryFieldChange(monthKey, 'providentFund', e.target.value)}
                                  placeholder="Enter Provident Fund"
                                  style={{ fontSize: '13px' }}
                                />
                              </CCol>
                              <CCol md={6}>
                                <label style={{ fontWeight: 500, fontSize: '13px', marginBottom: '5px', display: 'block' }}>
                                  Professional Tax
                                </label>
                                <CFormInput
                                  type="number"
                                  value={salaryData.professionalTax || ''}
                                  onChange={(e) => handleSalaryFieldChange(monthKey, 'professionalTax', e.target.value)}
                                  placeholder="Enter Professional Tax"
                                  style={{ fontSize: '13px' }}
                                />
                              </CCol>
                              <CCol md={6}>
                                <label style={{ fontWeight: 500, fontSize: '13px', marginBottom: '5px', display: 'block' }}>
                                  Insurance / ESI
                                </label>
                                <CFormInput
                                  type="number"
                                  value={salaryData.insuranceESI || ''}
                                  onChange={(e) => handleSalaryFieldChange(monthKey, 'insuranceESI', e.target.value)}
                                  placeholder="Enter Insurance/ESI"
                                  style={{ fontSize: '13px' }}
                                />
                              </CCol>
                              <CCol md={6}>
                                <label style={{ fontWeight: 500, fontSize: '13px', marginBottom: '5px', display: 'block' }}>
                                  Advance Taken
                                </label>
                                <CFormInput
                                  type="number"
                                  value={salaryData.advanceTaken || ''}
                                  onChange={(e) => handleSalaryFieldChange(monthKey, 'advanceTaken', e.target.value)}
                                  placeholder="Enter Advance Taken"
                                  style={{ fontSize: '13px' }}
                                />
                              </CCol>
                              <CCol md={6}>
                                <label style={{ fontWeight: 500, fontSize: '13px', marginBottom: '5px', display: 'block' }}>
                                  Other Deduction
                                </label>
                                <CFormInput
                                  type="number"
                                  value={salaryData.otherDeduction || ''}
                                  onChange={(e) => handleSalaryFieldChange(monthKey, 'otherDeduction', e.target.value)}
                                  placeholder="Enter Other Deduction"
                                  style={{ fontSize: '13px' }}
                                />
                              </CCol>
                            </CRow>
                          </div>
                        )}
                      </div>
                    )
                  })}
              </div>
            )}

            {/* Purpose Selection Checkboxes */}
            <div
              style={{
                padding: '15px',
                backgroundColor: '#fff3cd',
                borderRadius: '8px',
                border: '1px solid #ffc107',
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: '12px', fontSize: '14px', color: '#856404' }}>
                Select Purpose for Salary Slip:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <CFormCheck
                  type="checkbox"
                  id="loanPurpose"
                  label="Issued for loan purpose only."
                  checked={loanPurposeOnly}
                  onChange={(e) => {
                    setLoanPurposeOnly(e.target.checked)
                    if (e.target.checked) {
                      setGeneralPurposeOnly(false)
                    }
                  }}
                  style={{ fontSize: '13px' }}
                />
                <CFormCheck
                  type="checkbox"
                  id="generalPurpose"
                  label="Issued for general purpose only."
                  checked={generalPurposeOnly}
                  onChange={(e) => {
                    setGeneralPurposeOnly(e.target.checked)
                    if (e.target.checked) {
                      setLoanPurposeOnly(false)
                    }
                  }}
                  style={{ fontSize: '13px' }}
                />
              </div>
              <small style={{ color: '#856404', fontSize: '12px', marginTop: '8px', display: 'block' }}>
                Select one option. The selected purpose will be displayed in the salary slip notes section.
              </small>
            </div>

          </div>
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" onClick={() => setSalarySlipModalVisible(false)}>
            Cancel
          </CButton>
          <CButton
            color="primary"
            onClick={handleGenerateSalarySlip}
            disabled={selectedMonths.length === 0}
          >
            Generate Salary Slip{selectedMonths.length > 0 ? ` (${selectedMonths.length})` : ''}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Inline styles */}
      <style jsx>{`
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
        .profile-actions .btn {
          min-width: 110px;
          font-weight: 500;
        }

        /* Premium modal styles */
        .select-modal-header {
          background: linear-gradient(90deg, #0b1857, #2b6fb8);
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          color: #fff;
        }
        .modal-close-btn {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.95);
          font-size: 22px;
          line-height: 1;
          cursor: pointer;
        }
        .select-options {
          width: 100%;
        }
        .option-card {
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 6px 18px rgba(11, 24, 87, 0.08);
          transition: transform 0.18s ease, box-shadow 0.18s ease;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .option-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 30px rgba(11, 24, 87, 0.12);
        }
        .option-title {
          font-size: 1.05rem;
          color: #0b1857;
        }
        .option-desc {
          color: #6c757d;
        }
        .btn-lg {
          padding: 0.65rem 1.05rem;
          font-size: 0.95rem;
          border-radius: 8px;
        }
        .shadow-sm {
          box-shadow: 0 6px 14px rgba(11, 24, 87, 0.08) !important;
        }
      `}</style>
    </div>
  )
}

export default ProfileHeader
