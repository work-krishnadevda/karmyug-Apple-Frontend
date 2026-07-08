import React, { useState, useEffect } from 'react'

import { useParams } from 'react-router-dom'
import { CContainer, CAlert, CButton } from '@coreui/react'
import AppContentSkeleton from 'src/components/custom/AppContentSkeleton'
import { cilCreditCard } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useEmployeeData } from './hooks/useEmployeeData'
import { useFormValidation } from './hooks/useFormValidation'
import { usePermissions } from './hooks/usePermissions'
import { useFormActions } from './hooks/useFormActions'
import ProfileHeader from './ProfileHeader'
import ProfileSection from './ProfileSection'
import PersonalInfo from './PersonalInfo'
import EmploymentInfo from './EmploymentInfo'
import BankInfo from './BankInfo'
import DocumentUpload from './DocumentUpload'
import AutoPunchoutSettings from './AutoPunchoutSettings'
import TodayDoneSettings from './TodayDoneSettings'
import BasicProvider from 'src/constants/BasicProvider'
import { isAdminActiveForDropdown, formatAdminRoleLabel } from 'src/constants/hrmsConstants'
import { toast } from 'react-toastify'
import AppHeader from '../AppHeader'
import { useWelcomeLetterGenerator } from '../../components/WelcomeLetterGenerator'

const EmployeeProfile = () => {
  const { id } = useParams()

  // Custom hooks
  const {
    employeeData,
    formData,
    mutualAdmins,
    setFormData,
    loading,
    error,
    dataSource,
    handleInputChange,
    resetFormData,
    fetchEmployeeData,
  } = useEmployeeData()

  const { validationErrors, validateForm, clearValidationErrors, getFieldError, hasErrors } =
    useFormValidation()

  const {
    isHR,
    isADMIN,
    isAC,
    canEdit,
    hasViewPermission,
    canEditSection,
    canEditBank,
    canEditAttachments,
  } = usePermissions()

  const {
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
  } = useFormActions()

  // Local state
  const [attachments, setAttachments] = useState({
    resume: null,
  })

  const [locations, setLocations] = useState([])
  const [managers, setManagers] = useState([])
  const [roles, setRoles] = useState([])
  const [defaultRoleOptions, setDefaultRoleOptions] = useState([])
  const [companies, setCompanies] = useState([])
  const [groups, setGroups] = useState([])
  const [templates, setTemplates] = useState([])
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

 
  // Fetch managers using the provided API logic
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
      //   const response = await new BasicProvider(`admins`).getRequest()
      const response = await new BasicProvider('admins?page=1&count=1000').getRequest()
      const staff = response.data.data || []
      const activeStaff = staff.filter((row) => isAdminActiveForDropdown(row))
      const managerOptions = activeStaff.map((manager) => ({
        value: manager._id,
        label: `${manager.name}`,
        role: formatAdminRoleLabel(manager?.role) || formatAdminRoleLabel(manager?.user?.role),
      }))
      setManagers(managerOptions)
    } catch (error) {
      console.error('Error fetching managers:', error)
      toast.error('Failed to load employees list')
    }
  }

  const fetchRoles = async () => {
    try {
      const response = await new BasicProvider('roles?page=1&count=100').getRequest()
      if (response?.data?.data && Array.isArray(response.data.data)) {
        const roleOptions = response.data.data
          .map((role) => ({
            value: role?._id || '',
            label: role?.display_name || '',
            slug: role?.name || '',
          }))
          .filter((option) => option.value && option.label)
        setRoles([{ value: '', label: 'Select Role' }, ...roleOptions])
        setDefaultRoleOptions(roleOptions)
      } else {
        throw new Error('Invalid response structure')
      }
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
        { value: 'REAL APPLE ADVISORY SERVICE', label: 'REAL APPLE ADVISORY SERVICE', id: 'RA' },
        { value: 'GAURAV AIRAN', label: 'GAURAV AIRAN', id: 'GA' },
        { value: 'SHREE SHYAM TECHNOCRATS', label: 'SHREE SHYAM TECHNOCRATS', id: 'SS' },
        { value: 'THE VOCALEARN EDUCORP', label: 'THE VOCALEARN EDUCORP', id: 'VL' },
        { value: 'Madhukar Associates', label: 'Madhukar Associates', id: 'MA' },
      ]
      setCompanies(fallbackCompanies)
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
      setGroups(groupOptions) // Removed the empty option since we're using multi-select
    } catch (error) {
      console.error('Error fetching groups:', error)
      // Fallback groups
      const fallbackGroups = [
        { value: 'group1', label: 'Group 1' },
        { value: 'group2', label: 'Group 2' },
        { value: 'group3', label: 'Group 3' },
      ]
      setGroups(fallbackGroups)
    }
  }

  // Load Group Options for AsyncSelect
  const loadGroupOptions = async (inputValue, callback) => {
    try {
      if (typeof callback !== 'function') {
        console.error('Invalid callback function for loadGroupOptions')
        return
      }

      // If no input value, return all groups (for initial load)
      if (!inputValue || inputValue.trim() === '') {
        callback(groups && groups.length > 0 ? groups : defaultGroupOptions || [])
        return
      }

      const response = await new BasicProvider('cms/categories/tree/group').getRequest()

      if (response?.data?.data && Array.isArray(response.data.data)) {
        const options = response.data.data
          .filter((group) =>
            group.name.toLowerCase().includes((inputValue || '').toLowerCase())
          )
          .map((group) => ({
            value: group._id || '',
            label: group.name || '',
            id: group._id || '',
            name: group.name || '',
          }))
        callback(options)
      } else {
        // Fallback to existing groups
        const filtered = (groups || []).filter((group) =>
          group.label?.toLowerCase().includes((inputValue || '').toLowerCase())
        )
        callback(filtered.length > 0 ? filtered : groups || [])
      }
    } catch (error) {
      console.error('Error loading group options:', error)
      // Fallback to existing groups
      const filtered = (groups || []).filter((group) =>
        group.label?.toLowerCase().includes((inputValue || '').toLowerCase())
      )
      callback(filtered.length > 0 ? filtered : groups || [])
    }
  }

  const fetchAllDynamicData = async () => {
    setIsLoadingData(true)
    try {
      await Promise.all([
        fetchLocations(),
        fetchManagers(),
        fetchRoles(),
        fetchCompanies(),
        fetchGroups(),
      ])
    } catch (error) {
      console.error('Error fetching dynamic data:', error)
    } finally {
      setIsLoadingData(false)
    }
  }

  // Load Role Options for AsyncSelect
  const loadRoleOptions = async (inputValue, callback) => {
    try {
      if (typeof callback !== 'function') {
        console.error('Invalid callback function for loadRoleOptions')
        return
      }

      const response = await new BasicProvider(
        `roles/search?page=1&count=10&search=${inputValue || ''}`,
      ).getRequest()

      if (response?.data?.data && Array.isArray(response.data.data)) {
        const options = response.data.data
          .map((role) => ({
            value: role?._id || '',
            label: role?.display_name || '',
            slug: role?.name || '',
          }))
          .filter((option) => option.value && option.label)

        callback(options)
      } else {
        callback(defaultRoleOptions || [])
      }
    } catch (error) {
      console.error('Error loading role options:', error)
      callback(defaultRoleOptions || [])
    }
  }

  // Load Manager Options for AsyncSelect
  const loadManagerOptions = async (inputValue, callback) => {
    try {
      if (typeof callback !== 'function') {
        console.error('Invalid callback function for loadManagerOptions')
        return
      }

      const slugs = [
        process.env.REACT_APP_ADMIN,
        process.env.REACT_APP_COO,
        process.env.REACT_APP_HR,
        process.env.REACT_APP_MANAGER,
      ].filter(Boolean)

      if (slugs.length === 0) {
        callback(managers || [])
        return
      }

      const queryString = slugs.join(',')
      const response = await new BasicProvider(
        `admins/get-multiple?slugs=${encodeURIComponent(queryString)}&page=1&count=10&search=${
          inputValue || ''
        }`,
      ).getRequest()

      if (response?.data && Array.isArray(response.data)) {
        const options = response.data
          .filter((manager) => isAdminActiveForDropdown(manager))
          .map((manager) => ({
            value: manager?._id || '',
            label: manager?.name || '',
            role: formatAdminRoleLabel(manager?.role) || 'Manager',
          }))
          .filter((option) => option.value && option.label)

        callback(options)
      } else {
        callback(managers || [])
      }
    } catch (error) {
      console.error('Error loading manager options:', error)
      callback(managers || [])
    }
  }

  // Load Company Options for AsyncSelect
  const loadCompanyOptions = async (inputValue, callback) => {
    try {
      if (typeof callback !== 'function') {
        console.error('Invalid callback function for loadCompanyOptions')
        return
      }

      // Use the same company list as AddStaff.js
      const companyOptions = [ 
        { value: 'MA', label: 'Madhukar Associates' },
      ]

      // Filter companies based on search input
      const filteredCompanies = companyOptions.filter((company) =>
        company.label.toLowerCase().includes((inputValue || '').toLowerCase()),
      )

      callback(filteredCompanies)
    } catch (error) {
      console.error('Error loading company options:', error)
      callback(companies || [])
    }
  }

  const fetchTemplates = async () => {
    try {
      const res = await new BasicProvider('holiday-templates').getRequest()
      setTemplates(res.data || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load templates')
    }
  }

  useEffect(() => {
    const load = async () => {
      await fetchTemplates()
    }
    load()
  }, [])

  const handleFileUpload = (field, file) => {
    if (!field || typeof field !== 'string') {
      console.error('Invalid field for file upload:', field)
      return
    }

    if (!file) {
      console.error('No file provided for upload')
      return
    }

    try {
      setAttachments((prev) => ({
        ...prev,
        [field]: file,
      }))
    } catch (error) {
      console.error('Error updating attachments:', error)
    }
  }

  const handleAttachmentUpload = (field, event) => {
    try {
      if (!field || typeof field !== 'string') {
        console.error('Invalid field for attachment upload:', field)
        return
      }

      if (!event || !event.target) {
        console.error('Invalid event for attachment upload')
        return
      }

      const file = event.target.files?.[0]
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
          toast.error('Invalid file type. Please upload PDF, DOC, DOCX, JPG, JPEG, or PNG files.')
          event.target.value = '' // Clear the input
          return
        }

        handleFileUpload(field, file)
        toast.success(`${file.name} selected for upload`)
      } else {
        console.warn('No file selected for upload')
      }
    } catch (error) {
      console.error('Error in handleAttachmentUpload:', error)
      toast.error('Error selecting file: ' + error.message)
    }
  }

  const handleDocumentUpload = async () => {
    try {
      const userId = id
      if (!userId) {
        toast.error('Employee ID not found')
        return
      }

      // Check if there are any files to upload
      const filesToUpload = Object.values(attachments).filter((file) => file !== null)
      if (filesToUpload.length === 0) {
        toast.warning('No documents selected for upload')
        return
      }

      const formData = new FormData()
      Object.entries(attachments).forEach(([key, file]) => {
        if (file) {
          formData.append('gallery', file)
          formData.append('documentType', key) // Add document type for backend
        }
      })

      console.log(
        'Uploading documents:',
        filesToUpload.map((f) => f.name),
      )
      console.log('FormData contents:')
      for (let [key, value] of formData.entries()) {
        console.log(key, value)
      }

      // Use BasicProvider for consistent authentication handling
      const response = await new BasicProvider(`profiles/${userId}/upload-document`).postRequest(
        formData,
      )

      console.log('Upload response:', response)

      if (response && response.status === 'success') {
        toast.success('Documents uploaded successfully!')
        console.log('Upload success:', response)

        // Clear the attachments after successful upload
        setAttachments({
          resume: null,
        })
      } else {
        console.log('Upload failed - response:', response)
        toast.error('Upload failed: Invalid response from server')
      }
    } catch (error) {
      console.error('Document upload error:', error)

      // BasicProvider handles 401/403 errors automatically
      if (error.statusCode === 401) {
        toast.error('Unauthorized: Please login again')
      } else if (error.statusCode === 403) {
        toast.error('Forbidden: You do not have permission to upload documents')
      } else if (error.statusCode === 413) {
        toast.error('File too large: Please ensure files are under 5MB')
      } else if (error.statusCode === 415) {
        toast.error('Invalid file type: Please upload PDF, DOC, DOCX, JPG, JPEG, or PNG files')
      } else {
        const message = error.message || error.error || 'Upload failed'
        toast.error(`Upload failed: ${message}`)
      }
    }
  }

  // Enhanced save handler with validation
  const handleSaveWithValidation = async (section) => {
    try {
      clearValidationErrors()

      if (section === 'profile') {
        const profile = { ...formData.profile }

        // ✅ GOLDEN RULE: Use ONLY what user selected in UI (no merging, no mutual roles)
        // profile.role already contains what user selected - use it directly
        const selectedRoles = Array.isArray(profile.role) 
          ? profile.role 
          : profile.role 
            ? [profile.role] 
            : []
        // Use only selected roles - nothing more, nothing less
        profile.role = selectedRoles

        // ✅ GOLDEN RULE: Use ONLY what user selected in UI (no merging, no mutual)
        // profile.raBranch already contains what user selected - use it directly
        const selectedRaBranch = Array.isArray(profile.raBranch) 
          ? profile.raBranch 
          : profile.raBranch 
            ? [profile.raBranch] 
            : []
        // Use only selected raBranch - nothing more, nothing less
        profile.raBranch = selectedRaBranch

        // ✅ GOLDEN RULE: Use ONLY what user selected in UI (no merging, no mutual groups)
        // profile.group already contains what user selected - use it directly
        const selectedGroups = Array.isArray(profile.group) 
          ? profile.group 
          : profile.group 
            ? [profile.group] 
            : []
        // Use only selected groups - nothing more, nothing less
        profile.group = selectedGroups

        // Update formData with preserved and merged values
        formData.profile = profile
      }

      // For now, skip validation to allow saving

      const result = await handleSave(section, formData, canEditSection)

      if (result) {
        // Update form data with response
        setFormData((prev) => {
          const updatedSection = {
            ...prev[section],
            ...result,
          }

          // For profile section, preserve critical fields that might be incomplete in response
          if (section === 'profile') {
            // Preserve password if it was being edited
            if (prev.profile?.password) {
              updatedSection.password = prev.profile.password
            }
            
            // Preserve ALL roles - response might only have one role
            // Use existing roles if response roles are missing or incomplete
            const existingRoles = Array.isArray(prev.profile?.role) 
              ? prev.profile.role 
              : prev.profile?.role 
                ? [prev.profile.role] 
                : []
            const responseRoles = Array.isArray(result?.role) 
              ? result.role 
              : result?.role 
                ? [result.role] 
                : []
            
            // Use response roles if they exist and are complete, otherwise preserve existing
            updatedSection.role = responseRoles.length > 0 && responseRoles.length >= existingRoles.length
              ? responseRoles
              : existingRoles.length > 0
                ? existingRoles
                : []
            
            // Preserve groups and raBranch arrays similarly
            if (Array.isArray(prev.profile?.group) && prev.profile.group.length > 0) {
              if (!Array.isArray(result?.group) || result.group.length === 0) {
                updatedSection.group = prev.profile.group
              }
            }
            
            if (Array.isArray(prev.profile?.raBranch) && prev.profile.raBranch.length > 0) {
              const responseRaBranch = result?.ra_branch ?? result?.raBranch
              if (!Array.isArray(responseRaBranch) || responseRaBranch.length === 0) {
                updatedSection.raBranch = prev.profile.raBranch
              }
            }
          }

          return {
            ...prev,
            [section]: updatedSection,
          }
        })
      }

      location.reload() // Reload to reflect changes
    } catch (error) {
      console.error('Error in save with validation:', error)
      alert(`Error saving ${section} section: ${error.message}`)
    }
  }
  // Enhanced cancel handler
  const handleCancelWithReset = (section) => {
    handleCancel(section, resetFormData)
  }

  // Initialize component
  useEffect(() => {
    fetchAllDynamicData()
    initializeEditMode()
  }, [])

  // Permission checks
  if (!hasViewPermission) {
    return (
      <CContainer fluid>
        <CAlert color="danger">
          <h5>Access Denied</h5>
          <p>
            You do not have permission to view employee profiles. Only HR and Admin users can access
            this feature.
          </p>
          <CButton color="primary" onClick={handleBackClick}>
            Go Back
          </CButton>
        </CAlert>
      </CContainer>
    )
  }

  if (loading) {
    return (
      <CContainer fluid>
        <AppContentSkeleton ariaLabel="Loading employee profile" cards={3} rows={4} />
      </CContainer>
    )
  }

  if (error) {
    return (
      <CContainer fluid>
        <CAlert color="danger">
          <h5>Error Loading Employee Profile</h5>
          <p>{error}</p>
          <div className="mt-3">
            <CButton color="primary" onClick={fetchEmployeeData} className="me-2">
              Retry
            </CButton>
            <CButton color="secondary" onClick={handleBackClick}>
              Back to Staff List
            </CButton>
          </div>
        </CAlert>
      </CContainer>
    )
  }

  // Validate required data before rendering
  if (!formData || !employeeData) {
    return (
      <CContainer fluid>
        <CAlert color="warning">
          <h5>Data Not Available</h5>
          <p>Employee data is not available. Please try refreshing the page.</p>
          <CButton color="primary" onClick={fetchEmployeeData} className="me-2">
            Refresh
          </CButton>
          <CButton color="secondary" onClick={handleBackClick}>
            Back to Staff List
          </CButton>
        </CAlert>
      </CContainer>
    )
  }

  return (
    <>
      {/* Profile Header */}
      <ProfileHeader
        formData={formData}
        employeeDatas={employeeData}
        defaultRoleOptions={defaultRoleOptions}
        handleAttendanceClick={handleAttendanceClick}
        handleBackClick={handleBackClick}
        isAC={isAC}
        isHR={isHR}
        isADMIN={isADMIN}
        employeeId={id}
      />

      <CContainer fluid>
        {/* For AC (Accountant) role - Show only Bank Information */}
        {isAC && !isHR && !isADMIN ? (
          <>
            {/* Information Alert for AC role */}
            <div className="alert alert-info mb-4">
              <h6 className="mb-2">
                <CIcon icon={cilCreditCard} className="me-2" />
                Accountant Access - Bank Information (View Only)
              </h6>
              <p className="mb-0">
                As an Accountant, you have access to view bank information for payroll processing.
                Bank details are read-only for your role. Other profile sections are restricted to
                HR and Admin roles.
              </p>
            </div>

            {/* Bank Information - Only section visible to AC */}
            <BankInfo
              formData={formData}
              editMode={editMode}
              canEditSection={canEditSection}
              canEditBank={canEditBank}
              handleEditToggle={handleEditToggle}
              handleSave={handleSaveWithValidation}
              handleCancel={handleCancelWithReset}
              handleInputChange={handleInputChange}
              editAttempts={editAttempts}
              getFieldError={getFieldError}
              companies={companies}
            />
          </>
        ) : (
          <>
            {/* For HR and Admin - Show all sections */}

            {/* Profile Section */}
            <ProfileSection
              formData={formData}
              mutualAdmins={mutualAdmins}
              editMode={editMode}
              canEditSection={canEditSection}
              handleEditToggle={handleEditToggle}
              handleSave={handleSaveWithValidation}
              handleCancel={handleCancelWithReset}
              handleInputChange={handleInputChange}
              defaultRoleOptions={defaultRoleOptions}
              loadRoleOptions={loadRoleOptions}
              isLoadingData={isLoadingData}
              getFieldError={getFieldError}
              locations={locations}
              groups={groups}
              loadGroupOptions={loadGroupOptions}
              defaultGroupOptions={groups}
            />

            {/* Personal Information */}
            <PersonalInfo
              formData={formData}
              editMode={editMode}
              canEditSection={canEditSection}
              handleEditToggle={handleEditToggle}
              handleSave={handleSaveWithValidation}
              handleCancel={handleCancelWithReset}
              handleInputChange={handleInputChange}
              getFieldError={getFieldError}
            />

            {/* Employment Information */}
            <EmploymentInfo
              formData={formData}
              editMode={editMode}
              canEditSection={canEditSection}
              handleEditToggle={handleEditToggle}
              handleSave={handleSaveWithValidation}
              handleCancel={handleCancelWithReset}
              handleInputChange={handleInputChange}
              getFieldError={getFieldError} 
              managers={managers}
              loadManagerOptions={loadManagerOptions}
              companies={companies}
              loadCompanyOptions={loadCompanyOptions}
              templates={templates}
              locations={locations}
              groups={groups}
              isLoadingData={isLoadingData}
              loadGroupOptions={loadGroupOptions}
              defaultGroupOptions={groups}
            />

            {/* Bank Information */}
            <BankInfo
              formData={formData}
              editMode={editMode}
              canEditSection={canEditSection}
              canEditBank={canEditBank}
              handleEditToggle={handleEditToggle}
              handleSave={handleSaveWithValidation}
              handleCancel={handleCancelWithReset}
              handleInputChange={handleInputChange}
              editAttempts={editAttempts}
              getFieldError={getFieldError}
              companies={companies}
            />

            {/* Document Upload */}
            <DocumentUpload
              formData={formData}
              editMode={editMode}
              canEditSection={canEditSection}
              canEditAttachments={canEditAttachments}
              handleEditToggle={handleEditToggle}
              handleSave={handleSaveWithValidation}
              handleCancel={handleCancelWithReset}
              handleAttachmentUpload={handleAttachmentUpload}
              handleDocumentUpload={handleDocumentUpload}
              editAttempts={editAttempts}
              attachments={attachments}
              isAC={isADMIN}
              isHR={isHR}
            />

            {/* Auto Punchout Settings */}
            <AutoPunchoutSettings
              formData={formData}
              editMode={editMode}
              canEditSection={canEditSection}
              handleEditToggle={handleEditToggle}
              handleSave={handleSaveWithValidation}
              handleCancel={handleCancelWithReset}
              handleInputChange={handleInputChange}
              editAttempts={editAttempts}
              getFieldError={getFieldError}
            />

            {/* Today Done Settings */}
            <TodayDoneSettings
              formData={formData}
              editMode={editMode}
              canEditSection={canEditSection}
              handleEditToggle={handleEditToggle}
              handleSave={handleSaveWithValidation}
              handleCancel={handleCancelWithReset}
              handleInputChange={handleInputChange}
              editAttempts={editAttempts}
              getFieldError={getFieldError}
            />
          </>
        )}
      </CContainer>
    </>
  )
}

export default EmployeeProfile
